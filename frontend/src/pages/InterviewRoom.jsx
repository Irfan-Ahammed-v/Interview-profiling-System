import React, { useState, useEffect, useRef } from 'react';
import { Camera, Activity, Brain, ShieldCheck, AlertTriangle, UserCheck, MessageSquare, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  "Welcome! To start, could you please tell me a bit about your background and what brings you here today?",
  "Great. Now, what would you say is your greatest professional accomplishment so far?",
  "Interesting. Communication is key here. How do you handle disagreements within a team setting?",
  "That's insightful. Where do you see your career path heading in the next three to five years?",
  "Finally, why do you believe you are the best fit for this specific role at NeuroHire?"
];

export default function InterviewRoom({ userData }) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    Confidence: "0%",
    Stress_Level: "Low",
    Honesty_Score: "0%",
    Communication: "0%",
  });
  
  const [anxietyAlert, setAnxietyAlert] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [sessionTotals, setSessionTotals] = useState({ confidence: [], honesty: [], communication: [], stress: [] });
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));

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

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/interview");
    
    ws.onopen = () => {
      console.log("Connected to AI Processing Server");
      setIsConnected(true);
      
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current.width > 0) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.6); 
            
            ws.send(JSON.stringify({ 
                type: 'frame', 
                image: frameBase64.split(',')[1]
            }));
        }
      }, 1000);
      
      ws.onclose = () => clearInterval(interval);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.metrics) {
          setMetrics(data.metrics);
          setSessionTotals(prev => ({
            confidence: [...prev.confidence, parseInt(data.metrics.Confidence)],
            honesty: [...prev.honesty, parseInt(data.metrics.Honesty_Score)],
            communication: [...prev.communication, parseInt(data.metrics.Communication)],
            stress: [...prev.stress, data.metrics.Stress_Level]
          }));
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(0) : 0;
      const stressCounts = sessionTotals.stress.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {});
      const dominantStress = Object.keys(stressCounts).reduce((a, b) => stressCounts[a] > stressCounts[b] ? a : b, "Low");

      const finalResults = {
        name: userData?.name || "Candidate",
        role: userData?.role || "Applicant",
        avgConfidence: avg(sessionTotals.confidence),
        avgHonesty: avg(sessionTotals.honesty),
        avgCommunication: avg(sessionTotals.communication),
        overallStress: dominantStress
      };

      navigate('/report', { state: { results: finalResults } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col p-6 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain className="text-white" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              NeuroHire <span className="text-indigo-400 font-light italic">Assessment</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{userData?.name || "Guest Candidate"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-900/40 px-5 py-2.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {isConnected ? "Engine Synced" : "Connection Lost"}
            </span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] font-black text-slate-600 hover:text-white transition-colors tracking-widest uppercase"
          >
            Terminal Session
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
        
        <div className="lg:col-span-3 flex flex-col gap-8 overflow-hidden">
          
          {/* Question Prompter */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentQuestionIndex}
            className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-6 relative overflow-hidden backdrop-blur-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3 text-indigo-400">
              <MessageSquare size={18} />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-70">Guided Questions</span>
            </div>
            <h2 className="text-3xl font-medium leading-[1.4] pr-12 text-slate-100 tracking-tight">
              "{QUESTIONS[currentQuestionIndex]}"
            </h2>
            
            <button 
              onClick={handleNextQuestion}
              className="absolute bottom-8 right-10 flex items-center gap-3 bg-white text-slate-950 px-7 py-3.5 rounded-2xl font-black text-sm hover:translate-y-[-2px] hover:shadow-2xl transition-all active:scale-95 group shadow-indigo-500/10"
            >
              {currentQuestionIndex === QUESTIONS.length - 1 ? "End Session" : "Next Inquiry"}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Camera View */}
          <div className="relative flex-1 bg-slate-900/50 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col group">
            <div className="absolute top-8 left-8 z-10 bg-black/40 backdrop-blur-2xl px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-white/5 shadow-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></div>
              <span className="text-[10px] font-black tracking-widest uppercase text-white/80">Analysis Active</span>
            </div>
            
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover rounded-[3rem] opacity-90 transition-opacity duration-700"
              style={{ transform: "scaleX(-1)" }}
            />
            
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[scan_4s_ease-in-out_infinite] opacity-30 z-20"></div>

            <AnimatePresence>
              {anxietyAlert && (
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="absolute bottom-10 left-10 right-10 z-30 bg-slate-950/60 backdrop-blur-3xl border border-indigo-500/20 rounded-3xl p-8 flex items-center gap-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                >
                  <div className="bg-indigo-500 p-4 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white/90 tracking-tight uppercase">Performance Note</h3>
                    <p className="text-slate-400 font-medium text-sm mt-1 leading-relaxed italic">"Reduced composure detected. Maintain consistent focus and slow articulation."</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right 1/4: Analysis HUD */}
        <div className="flex flex-col gap-8 h-full">
          <div className="bg-slate-900/30 rounded-[3rem] border border-white/5 p-10 flex flex-col gap-10 backdrop-blur-3xl relative overflow-hidden flex-1 shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[120px]"></div>
            
            <div className="flex items-center gap-3 border-b border-white/5 pb-8">
              <Activity size={18} className="text-indigo-400" />
              <h2 className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">Live Insights</h2>
            </div>

            <div className="space-y-10 flex-1 flex flex-col justify-center">
              <MetricHUDItem 
                label="Authenticity" 
                subtext="Consistency & head positioning"
                value={metrics.Honesty_Score} 
                icon={<ShieldCheck size={18} />} 
                color="#6366f1"
              />
              
              <MetricHUDItem 
                label="Confidence Level" 
                subtext="Postural stability & assurance"
                value={metrics.Confidence} 
                icon={<UserCheck size={18} />} 
                color="#10b981"
              />

              <MetricHUDItem 
                label="Speaking Clarity" 
                subtext="Verbal articulation rhythm"
                value={metrics.Communication} 
                icon={<Brain size={18} />} 
                color="#818cf8"
              />

              <div className="pt-6 mt-auto">
                <div className={`rounded-[2rem] p-7 transition-all duration-700 border bg-slate-950/40
                  ${metrics.Stress_Level === 'High' ? 'border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' : 
                    metrics.Stress_Level === 'Medium' ? 'border-orange-500/20' : 
                    'border-emerald-500/20'}
                `}>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black tracking-widest uppercase text-slate-600 mb-1">Composure</span>
                      <span className={`text-xl font-black tracking-tight uppercase
                        ${metrics.Stress_Level === 'High' ? 'text-red-500' : 
                          metrics.Stress_Level === 'Medium' ? 'text-orange-400' : 
                          'text-emerald-500'}
                      `}>{metrics.Stress_Level}</span>
                    </div>
                    <div className={`p-2.5 rounded-full bg-slate-900 border border-white/5 shadow-lg
                      ${metrics.Stress_Level === 'High' ? 'text-red-500 animate-pulse' : 
                        metrics.Stress_Level === 'Medium' ? 'text-orange-400' : 
                        'text-emerald-500'}
                    `}>
                      <Activity size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 0.3; }
          80% { opacity: 0.3; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}

function MetricHUDItem({ label, subtext, value, icon, color }) {
  const numValue = parseInt(value) || 0;
  return (
    <div className="flex flex-col gap-4 group">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-slate-950/60 text-slate-500 border border-white/5 group-hover:text-white transition-colors duration-500">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-300 tracking-tight">{label}</span>
            <span className="text-[10px] font-medium text-slate-600 mt-0.5 leading-tight">{subtext}</span>
          </div>
        </div>
        <span className="text-3xl font-black italic tracking-tighter" style={{ color }}>{value}</span>
      </div>
      <div className="h-[2px] bg-slate-950 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${numValue}%` }}
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}22` }}
        />
      </div>
    </div>
  );
}
