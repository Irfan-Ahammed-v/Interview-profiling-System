import React, { useState, useEffect, useRef } from 'react';
import { Camera, Activity, Brain, ShieldCheck, AlertTriangle, UserCheck, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [metrics, setMetrics] = useState({
    Confidence: "0%",
    Stress_Level: "Low",
    Honesty_Score: "0%",
    Communication: "0%",
  });
  
  const [anxietyAlert, setAnxietyAlert] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));

   // Initialize Camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          };
        }
        streamRef.current = stream;
      } catch (error) {
        console.error("Camera access denied:", error);
      }
    }
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

   // Initialize WebSocket Connection and Frame Streaming
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/interview");
    
    ws.onopen = () => {
      console.log("Connected to AI Processing Server");
      setIsConnected(true);
      
      // Extract video frames and send to the Python ML server
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current.width > 0) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            
            // Compress frame heavily (JPEG 60%) to keep latency ultra-low
            const frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.6); 
            
            ws.send(JSON.stringify({ 
                type: 'frame', 
                image: frameBase64.split(',')[1] // remove data:image prefix
            }));
        }
      }, 1000); // Send 1 Frame per Second for real-time inference
      
      ws.onclose = () => clearInterval(interval);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        
        if (data.anxiety_flag) {
          setAnxietyAlert(data.anxiety_message);
          setTimeout(() => setAnxietyAlert(""), 6000);
        }
      } catch(e) {
        console.error("Malformed websocket msg", e);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    };

    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col p-6">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center glow-border">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              NeuroHire AI
            </h1>
            <p className="text-xs text-slate-400">Psychological Profiling Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-slate-300">
            {isConnected ? "Engine Active" : "Disconnected"}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Camera Feed & Alert */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Camera View */}
          <div className="relative flex-1 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-700/50">
              <Camera size={16} className="text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-50">Live Feed</span>
            </div>
            
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover rounded-3xl"
              style={{ transform: "scaleX(-1)" }} // Mirror camera
            />
            
            {/* Visual overlay for "scanning" */}
            <div className="absolute inset-0 border-[4px] border-transparent hover:border-cyan-500/20 rounded-3xl transition-all duration-700 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-[scan_3s_ease-in-out_infinite] opacity-50 shadow-[0_0_20px_rgba(34,211,238,0.5)] z-20"></div>
          </div>

          {/* Anxiety Normalized Alert Banner */}
          <AnimatePresence>
            {anxietyAlert && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(249,115,22,0.15)]"
              >
                <div className="bg-orange-500/20 p-3 rounded-full flex-shrink-0">
                  <AlertTriangle className="text-orange-400" size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-orange-200">Anxiety Spike Detected</h3>
                  <p className="text-orange-100/70 text-sm mt-0.5">{anxietyAlert}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Col: Metrics */}
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800/80 p-6 flex flex-col gap-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-800 pb-4">
            <Activity size={20} className="text-cyan-500" />
            Live Behavioral Metrics
          </h2>

          <div className="space-y-5">
            <MetricCard 
              title="Attention Score" 
              value={metrics.Confidence} 
              icon={<UserCheck size={18} />} 
              color="text-emerald-400" 
              bg="bg-emerald-400/10" 
              border="border-emerald-400/20"
            />
            
            <MetricCard 
              title="Honesty / Authenticity" 
              value={metrics.Honesty_Score} 
              icon={<ShieldCheck size={18} />} 
              color="text-cyan-400" 
              bg="bg-cyan-400/10" 
              border="border-cyan-400/20"
            />

            <MetricCard 
              title="Communication Skill" 
              value={metrics.Communication} 
              icon={<MessageSquare size={18} />} 
              color="text-purple-400" 
              bg="bg-purple-400/10" 
              border="border-purple-400/20"
            />

            <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg 
                    ${metrics.Stress_Level === 'High' ? 'bg-red-500/10 text-red-500' : 
                      metrics.Stress_Level === 'Medium' ? 'bg-orange-500/10 text-orange-500' : 
                      'bg-emerald-500/10 text-emerald-500'}
                  `}>
                    <Activity size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">Stress Level</span>
                </div>
                <span className={`text-xl font-bold tracking-tight
                  ${metrics.Stress_Level === 'High' ? 'text-red-400' : 
                    metrics.Stress_Level === 'Medium' ? 'text-orange-400' : 
                    'text-emerald-400'}
                `}>
                  {metrics.Stress_Level || "Measuring..."}
                </span>
              </div>
            </div>

          </div>

          <div className="mt-auto pt-6 border-t border-slate-800">
             <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-200/70">
                <p><strong>Note:</strong> Powered by your custom ResNet-18 Brain (ONNX runtime) & MediaPipe.</p>
             </div>
          </div>
        </div>
      </main>
      
      {/* Required scan animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
      `}} />
    </div>
  );
}

// Reusable Metric Card
function MetricCard({ title, value, icon, color, bg, border }) {
  const numValue = parseInt(value) || 0;
  
  return (
    <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors group">
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bg} ${color}`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-slate-300">{title}</span>
        </div>
        <span className={`text-xl font-bold tracking-tight text-white`}>
          {value || "Measuring..."}
        </span>
      </div>
      
      {/* Progress Bar background */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-4">
        <motion.div 
          className={`h-full ${bg.replace('/10', '/60')} ${border}`}
          initial={{ width: 0 }}
          animate={{ width: `${numValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
             backgroundColor: color.replace('text-', '') === 'emerald-400' ? '#34d399' :
                              color.replace('text-', '') === 'cyan-400' ? '#22d3ee' :
                              color.replace('text-', '') === 'purple-400' ? '#c084fc' : '#38bdf8'
          }}
        ></motion.div>
      </div>
    </div>
  );
}
