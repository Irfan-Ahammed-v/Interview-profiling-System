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
            # 1. Face Landmarker (Real-Time)
            self.face_task_path = os.path.join(os.path.dirname(__file__), 'face_landmarker.task')
            if not os.path.exists(self.face_task_path):
                print("[*] Downloading Face Landmarker...")
                url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
                urllib.request.urlretrieve(url, self.face_task_path)

            # 2. Pose Landmarker (Sampling Mode)
            self.pose_task_path = os.path.join(os.path.dirname(__file__), 'pose_landmarker.task')
            if not os.path.exists(self.pose_task_path):
                print("[*] Downloading Pose Landmarker...")
                url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
                urllib.request.urlretrieve(url, self.pose_task_path)

            # Initializing Detectors
            base_face_options = python.BaseOptions(model_asset_path=self.face_task_path)
            face_options = vision.FaceLandmarkerOptions(base_options=base_face_options, num_faces=1)
            self.face_detector = vision.FaceLandmarker.create_from_options(face_options)

            base_pose_options = python.BaseOptions(model_asset_path=self.pose_task_path)
            pose_options = vision.PoseLandmarkerOptions(base_options=base_pose_options)
            self.pose_detector = vision.PoseLandmarker.create_from_options(pose_options)

        self.history = {
            'ear': deque(maxlen=8), 
            'mar': deque(maxlen=8), 
            'yaw': deque(maxlen=8),
            'nose': deque(maxlen=8)
        }
        
        # Posture specific state
        self.frame_counter = 0
        self.last_posture_penalty = 0
        self.is_slouching = False

    def _euclidean_dist(self, p1, p2):
         return math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)

    def process_frame(self, b64_frame: str):
        if not ML_AVAILABLE:
            return self._build_payload(50, 70, 80, 60, 100)

        # Baseline performance
        stress_score = 15     
        honesty_score = 90
        confidence_score = 85
        communication_score = 50
        posture_message = ""

        try:
            frame_bytes = base64.b64decode(b64_frame)
            np_arr = np.frombuffer(frame_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
            
            # --- 1. FACE MESH (Every Frame) ---
            face_result = self.face_detector.detect(mp_image)
            face_landmarks = face_result.face_landmarks[0] if face_result.face_landmarks else None

            # --- 2. POSE ANALYSIS (Every 2 Seconds / 2 Frames based on UI logic) ---
            self.frame_counter += 1
            if self.frame_counter % 2 == 0: 
                pose_result = self.pose_detector.detect(mp_image)
                if pose_result.pose_landmarks:
                    pose = pose_result.pose_landmarks[0]
                    # Shoulders: Left 11, Right 12
                    left_shoulder = pose[11]
                    right_shoulder = pose[12]
                    
                    # A. Shoulder Alignment (Leaning)
                    shoulder_tilt = abs(left_shoulder.y - right_shoulder.y)
                    
                    # B. Slouching (Nose to Shoulder-Line depth)
                    if face_landmarks:
                        nose = face_landmarks[1]
                        shoulder_y_avg = (left_shoulder.y + right_shoulder.y) / 2
                        slouch_depth = shoulder_y_avg - nose.y # Higher value means upright
                        
                        self.last_posture_penalty = 0
                        if shoulder_tilt > 0.04: # Significant lean
                            self.last_posture_penalty += 20
                        if slouch_depth < 0.15: # Head too close to shoulders
                            self.last_posture_penalty += 25
                            self.is_slouching = True
                        else:
                            self.is_slouching = False

            # Apply persistent posture penalty
            confidence_score -= self.last_posture_penalty

            if face_landmarks:
                landmarks = face_landmarks
                nose = landmarks[1]
                self.history['nose'].append(nose)
                
                # Fidgeting detection
                if len(self.history['nose']) >= 5:
                    nose_pts = list(self.history['nose'])
                    fidget_travel = sum(self._euclidean_dist(nose_pts[i], nose_pts[i-1]) for i in range(1, len(nose_pts)))
                    if fidget_travel > 0.12: 
                        stress_score += 45
                        confidence_score -= 10
                    elif fidget_travel > 0.05:
                        stress_score += 20

                # Yaw / Honesty
                dist_left = self._euclidean_dist(nose, landmarks[33])
                dist_right = self._euclidean_dist(nose, landmarks[263])
                yaw_ratio = dist_left / dist_right if dist_right > 0 else 1.0
                if yaw_ratio < 0.6 or yaw_ratio > 1.7:
                    honesty_score = 30 
                    confidence_score -= 20
                elif yaw_ratio < 0.8 or yaw_ratio > 1.3:
                    honesty_score = 70 

                # Micro-stress (EAR)
                left_v1 = self._euclidean_dist(landmarks[160], landmarks[144])
                left_v2 = self._euclidean_dist(landmarks[158], landmarks[153])
                left_h = self._euclidean_dist(landmarks[33], landmarks[133])
                ear_left = (left_v1 + left_v2) / (2.0 * left_h) if left_h > 0 else 0
                self.history['ear'].append(ear_left)
                if len(self.history['ear']) == 8:
                    blink_variance = np.std(self.history['ear'])
                    if blink_variance > 0.025:
                        stress_score += 40 

                # Articulation (MAR)
                mar = self._euclidean_dist(landmarks[13], landmarks[14])
                self.history['mar'].append(mar)
                if len(self.history['mar']) == 8:
                    mv = np.std(self.history['mar'])
                    communication_score = 95 if mv > 0.015 else 75 if mv > 0.005 else 35

            else:
                honesty_score, confidence_score, communication_score = 10, 20, 20
                stress_score = 60

            # Generate specific posture messages
            flag_anxiety = stress_score > 75 or self.is_slouching
            if self.is_slouching:
                posture_message = "Professional Posture Alert: Please sit upright and level your shoulders."
            elif stress_score > 75:
                posture_message = "Heightened stress indicators detected. Maintain consistent composure."

            posture_score = max(0, 100 - self.last_posture_penalty)
            return self._build_payload(stress_score, confidence_score, honesty_score, communication_score, posture_score, flag_anxiety, posture_message)

        except Exception as e:
            print("[x] Engine Error:", str(e))
            return self._build_payload(50, 50, 50, 50, 100, False, "")

    def _build_payload(self, stress, confidence, honesty, comms, posture, flag=False, msg=""):
        return {
            "metrics": {
                "Confidence": f"{max(0, confidence)}%",
                "Stress_Level": "Low" if stress < 40 else "Medium" if stress < 70 else "High",
                "Honesty_Score": f"{honesty}%",
                "Communication": f"{comms}%",
                "Posture_Score": f"{posture}%",
            },
            "anxiety_flag": flag,
            "anxiety_message": msg
        }

fusion_engine = FusionEngine()

@app.get("/")
def read_root():
    return {"status": "NeuroHire AI Engine Running"}

@app.websocket("/ws/interview")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("[*] Dashboard connection established. Enterprise Engine Active.")
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
