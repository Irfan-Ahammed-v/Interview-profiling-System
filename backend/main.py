from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import base64
import numpy as np
import math
import os
import urllib.request
from collections import deque

try:
    import cv2
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    ML_AVAILABLE = True
except ImportError as e:
    ML_AVAILABLE = False
    print(f"Warning: ML packages missing ({e}). Run: pip install mediapipe opencv-python")

app = FastAPI(title="NeuroHire AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FusionEngine:
    def __init__(self):
        if ML_AVAILABLE:
            self.task_path = os.path.join(os.path.dirname(__file__), 'face_landmarker.task')
            if not os.path.exists(self.task_path):
                print("[*] Downloading Google MediaPipe vision engine (this takes ~5 seconds)...")
                url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
                urllib.request.urlretrieve(url, self.task_path)
                print("[+] Download complete!")

            base_options = python.BaseOptions(model_asset_path=self.task_path)
            options = vision.FaceLandmarkerOptions(
                base_options=base_options,
                output_face_blendshapes=False,
                output_facial_transformation_matrixes=False,
                num_faces=1
            )
            self.detector = vision.FaceLandmarker.create_from_options(options)

        # Reduced window to 8 seconds so the stats react faster and recover quicker
        self.history = {
            'ear': deque(maxlen=8), 
            'mar': deque(maxlen=8), 
            'yaw': deque(maxlen=8),
            'nose': deque(maxlen=8) # Track the literal physical position of the head for fidgeting
        }

    def _euclidean_dist(self, p1, p2):
         return math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)

    def process_frame(self, b64_frame: str):
        if not ML_AVAILABLE:
            return self._build_payload(50, 70, 80, 60)

        # Baselines
        stress_score = 15     # Default resting is completely un-stressed
        honesty_score = 90
        confidence_score = 80
        communication_score = 50

        try:
            frame_bytes = base64.b64decode(b64_frame)
            np_arr = np.frombuffer(frame_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
            
            detection_result = self.detector.detect(mp_image)

            if len(detection_result.face_landmarks) > 0:
                landmarks = detection_result.face_landmarks[0]

                # --- 1. PHYSICAL FIDGETING (Macro Stress Indicator) ---
                nose = landmarks[1]
                self.history['nose'].append(nose)
                
                if len(self.history['nose']) >= 5:
                    nose_pts = list(self.history['nose'])
                    # Sum the physical distance the head traveled over the past rolling window
                    fidget_travel = sum(self._euclidean_dist(nose_pts[i], nose_pts[i-1]) for i in range(1, len(nose_pts)))
                    
                    if fidget_travel > 0.12:  # High erratic movement / shaking
                        stress_score += 55
                        confidence_score -= 10
                    elif fidget_travel > 0.05: # Minor swaying
                        stress_score += 25

                # --- A. ATTENTION (Yaw) ---
                dist_left = self._euclidean_dist(nose, landmarks[33])
                dist_right = self._euclidean_dist(nose, landmarks[263])
                
                yaw_ratio = dist_left / dist_right if dist_right > 0 else 1.0
                self.history['yaw'].append(yaw_ratio)

                if yaw_ratio < 0.6 or yaw_ratio > 1.7:
                    honesty_score = 30 
                    confidence_score -= 20
                elif yaw_ratio < 0.8 or yaw_ratio > 1.3:
                    honesty_score = 65 

                # --- B. MICRO-STRESS (Eye Aspect Ratio Variance) ---
                left_v1 = self._euclidean_dist(landmarks[160], landmarks[144])
                left_v2 = self._euclidean_dist(landmarks[158], landmarks[153])
                left_h = self._euclidean_dist(landmarks[33], landmarks[133])
                ear_left = (left_v1 + left_v2) / (2.0 * left_h) if left_h > 0 else 0
                self.history['ear'].append(ear_left)

                if len(self.history['ear']) == 8:
                    blink_variance = np.std(self.history['ear'])
                    # Much more sensitive threshold to catch true anxious rapid blinking
                    if blink_variance > 0.025:
                        stress_score += 45 
                        confidence_score -= 15
                    elif blink_variance > 0.015:
                        stress_score += 20
                        
                # Hard cap stress
                stress_score = min(100, stress_score)

                # --- C. COMMUNICATION (Mouth Aspect Ratio Variance) ---
                mar = self._euclidean_dist(landmarks[13], landmarks[14])
                self.history['mar'].append(mar)
                
                if len(self.history['mar']) == 8:
                    mouth_variance = np.std(self.history['mar'])
                    if mouth_variance > 0.015:
                        communication_score = 95
                    elif mouth_variance > 0.005:
                        communication_score = 75
                    else:
                        communication_score = 35

            else:
                honesty_score = 10
                stress_score = 60
                confidence_score = 20
                communication_score = 20

            return self._build_payload(stress_score, confidence_score, honesty_score, communication_score)

        except Exception as e:
            print("[x] Engine Error:", str(e))
            return self._build_payload(50, 50, 50, 50)

    def _build_payload(self, stress, confidence, honesty, comms):
        return {
            "metrics": {
                "Confidence": f"{confidence}%",
                "Stress_Level": "Low" if stress < 40 else "Medium" if stress < 70 else "High",
                "Honesty_Score": f"{honesty}%",
                "Communication": f"{comms}%",
            },
            "anxiety_flag": stress > 75,
            "anxiety_message": "Erratic movement and rapid blinking detected. Sit still and take a breath." if stress > 75 else ""
        }

fusion_engine = FusionEngine()

@app.get("/")
def read_root():
    return {"status": "NeuroHire AI Engine Running"}

@app.websocket("/ws/interview")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("[*] Dashboard connection established. Geometric Matrix Active.")
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            
            if data.get('type') == 'frame':
                results = fusion_engine.process_frame(data.get('image'))
                await websocket.send_text(json.dumps(results))
            
    except WebSocketDisconnect:
        print("[!] Client disconnected.")
    except Exception as e:
        print("[!] Socket error:", str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
