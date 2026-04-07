import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ─── Constants ─────────────────────────────────────────────────────────── */

const QUESTIONS = [
  "Welcome! To start, could you please tell me a bit about your background and what brings you here today?",
  "Great. Now, what would you say is your greatest professional accomplishment so far?",
  "Interesting. Communication is key here. How do you handle disagreements within a team setting?",
  "That's insightful. Where do you see your career path heading in the next three to five years?",
  "Finally, why do you believe you are the best fit for this specific role at NeuroHire?",
];

const STRESS_CONFIG = {
  Low:    { textClass: 'text-emerald-400',  badgeClass: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', label: 'Composed' },
  Medium: { textClass: 'text-amber-400',    badgeClass: 'bg-amber-400/10  text-amber-400  border-amber-400/20',  label: 'Moderate' },
  High:   { textClass: 'text-red-400',      badgeClass: 'bg-red-400/10    text-red-400    border-red-400/20',    label: 'Elevated' },
};

const METRICS_CONFIG = [
  {
    id: 'Honesty_Score',
    label: 'Authenticity',
    sub: 'Consistency & alignment',
    color: '#4f6ef7',
    iconBg: 'rgba(79,110,247,0.12)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" className="w-3.5 h-3.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'Confidence',
    label: 'Confidence',
    sub: 'Self-assurance signals',
    color: '#34d399',
    iconBg: 'rgba(52,211,153,0.12)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="w-3.5 h-3.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    id: 'Communication',
    label: 'Speaking clarity',
    sub: 'Verbal rhythm analysis',
    color: '#fbbf24',
    iconBg: 'rgba(251,191,36,0.1)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" className="w-3.5 h-3.5">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    id: 'Posture_Score',
    label: 'Posture & stability',
    sub: 'Spinal alignment score',
    color: '#e879f9',
    iconBg: 'rgba(232,121,249,0.1)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#e879f9" strokeWidth="2" className="w-3.5 h-3.5">
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v8M9 15l-2 4M15 15l2 4M9 11H6M15 11h3" />
      </svg>
    ),
  },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function MetricItem({ config, value }) {
  const numValue = parseInt(value) || 0;
  return (
    <div className="py-3.5 border-b border-white/5 last:border-0">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: config.iconBg }}
          >
            {config.icon}
          </div>
          <div>
            <div className="text-[12px] font-medium text-[#e8eaf0]">{config.label}</div>
            <div className="text-[10px] text-[#6b7280] mt-0.5">{config.sub}</div>
          </div>
        </div>
        <span
          className="font-mono text-base font-medium tracking-tight"
          style={{ color: config.color }}
        >
          {value}
        </span>
      </div>
      <div className="h-[3px] bg-[#161920] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${numValue}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full"
          style={{ background: config.color }}
        />
      </div>
    </div>
  );
}

function QuestionSteps({ total, current }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] rounded-full border border-white/5 transition-all duration-400"
          style={{
            width: i === current ? 32 : 22,
            background:
              i < current
                ? 'rgba(79,110,247,0.3)'
                : i === current
                ? '#4f6ef7'
                : '#161920',
            borderColor: i === current ? '#4f6ef7' : undefined,
          }}
        />
      ))}
    </div>
  );
}

function ComposureBadge({ level }) {
  const cfg = STRESS_CONFIG[level] || STRESS_CONFIG.Low;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium border ${cfg.badgeClass}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
      {cfg.label}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function InterviewRoom({ userData }) {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    Confidence: '0%',
    Stress_Level: 'Low',
    Honesty_Score: '0%',
    Communication: '0%',
    Posture_Score: '0%',
  });
  
  const [anxietyAlert, setAnxietyAlert]       = useState('');
  const [isConnected, setIsConnected]         = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionSeconds, setSessionSeconds]   = useState(0);
  const [frameCount, setFrameCount]           = useState(0);
  const [camReady, setCamReady]               = useState(false);

  const [sessionTotals, setSessionTotals] = useState({
    confidence: [], honesty: [], communication: [], stress: [], posture: [],
  });

  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));

  /* ── Camera ── */
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            canvasRef.current.width  = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            setCamReady(true);
          };
        }
        streamRef.current = stream;
      } catch (err) {
        console.warn('Camera access denied:', err);
      }
    }
    setupCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  /* ── WebSocket ── */
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/interview');

    ws.onopen = () => {
      setIsConnected(true);
      const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current.width > 0) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          const frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.6);
          ws.send(JSON.stringify({ type: 'frame', image: frameBase64.split(',')[1] }));
          setFrameCount(f => f + 1);
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
            confidence:    [...prev.confidence,    parseInt(data.metrics.Confidence)],
            honesty:       [...prev.honesty,       parseInt(data.metrics.Honesty_Score)],
            communication: [...prev.communication, parseInt(data.metrics.Communication)],
            stress:        [...prev.stress,        data.metrics.Stress_Level],
            posture:       [...prev.posture,       parseInt(data.metrics.Posture_Score)],
          }));
        }
        if (data.anxiety_flag) {
          setAnxietyAlert(data.anxiety_message);
          setTimeout(() => setAnxietyAlert(''), 6000);
        }
      } catch (e) {
        console.error('Malformed WebSocket message', e);
      }
    };

    ws.onclose = () => setIsConnected(false);
    return () => ws.close();
  }, []);

  /* ── Session timer ── */
  useEffect(() => {
    const id = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Helpers ── */
  const formattedTime = (() => {
    const m = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
    const s = String(sessionSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  })();

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(0) : 0;
      const stressCounts = sessionTotals.stress.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {});
      const dominantStress = Object.keys(stressCounts).reduce(
        (a, b) => (stressCounts[a] > stressCounts[b] ? a : b), 'Low'
      );
      navigate('/report', {
        state: {
          results: {
            name:             userData?.name || 'Candidate',
            role:             userData?.role || 'Applicant',
            avgConfidence:    avg(sessionTotals.confidence),
            avgHonesty:       avg(sessionTotals.honesty),
            avgCommunication: avg(sessionTotals.communication),
            avgPosture:       avg(sessionTotals.posture),
            overallStress:    dominantStress,
          },
        },
      });
    }
  }, [currentQuestionIndex, sessionTotals, navigate, userData]);

  const stressCfg = STRESS_CONFIG[metrics.Stress_Level] || STRESS_CONFIG.Low;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e8eaf0] font-sans flex flex-col p-3.5 gap-3.5 select-none">

      {/* Header */}
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] bg-[#4f6ef7] rounded-[9px] flex items-center justify-center flex-shrink-0">
             <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <path d="M12 2a6 6 0 0 1 0 12A6 6 0 0 1 12 2z" />
              <path d="M12 14c-5 0-9 2.2-9 5v1h18v-1c0-2.8-4-5-9-5z" />
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">
              NeuroHire <span className="text-[#6b7280] font-light">Assessment</span>
            </div>
            <div className="font-mono text-[10px] text-[#6b7280] tracking-widest mt-0.5">
              {userData?.name?.toUpperCase() || 'GUEST CANDIDATE'} · {userData?.role?.toUpperCase() || 'APPLICANT'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161920] border border-white/5 rounded-full text-[11px] font-medium text-[#6b7280]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: isConnected ? '#34d399' : '#f87171' }} />
            {isConnected ? 'Engine synced' : 'Disconnected'}
          </div>
          <button onClick={() => navigate('/')} className="px-3.5 py-1.5 text-[12px] font-medium bg-[#161920] border border-white/10 rounded-full text-[#6b7280] hover:text-[#e8eaf0] transition-all">
            End session
          </button>
        </div>
      </header>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3.5 overflow-hidden">
        
        <div className="grid grid-rows-[auto_1fr] gap-3.5 overflow-hidden">
          
          <div className="relative bg-[#10131a] border border-white/5 rounded-2xl px-6 py-5 flex flex-col gap-3.5 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #4f6ef7, transparent)', opacity: 0.4 }} />
            <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-widest uppercase text-[#6b7280]">
               Biometric Session Active
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={currentQuestionIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[17px] font-normal leading-relaxed italic">
                "{QUESTIONS[currentQuestionIndex]}"
              </motion.p>
            </AnimatePresence>
            <div className="flex items-center justify-between">
              <QuestionSteps total={QUESTIONS.length} current={currentQuestionIndex} />
              <button onClick={handleNextQuestion} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#4f6ef7] text-white text-[12px] font-medium rounded-lg">
                {currentQuestionIndex === QUESTIONS.length - 1 ? 'End session' : 'Next inquiry'}
              </button>
            </div>
          </div>

          <div className="relative bg-[#10131a] border border-white/5 rounded-2xl overflow-hidden min-h-0">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
            <AnimatePresence>
              {anxietyAlert && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                   className="absolute bottom-6 left-3.5 right-3.5 z-30 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
                  <p className="text-[12px] text-[#6b7280] italic">{anxietyAlert}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-[#10131a] border border-white/5 rounded-2xl p-5 flex flex-col overflow-y-auto">
          <div className="flex-1">
            {METRICS_CONFIG.map(cfg => (
              <MetricItem key={cfg.id} config={cfg} value={metrics[cfg.id]} />
            ))}
          </div>
          <div className="mt-4 p-3.5 bg-[#161920] border border-white/5 rounded-xl flex items-center justify-between">
            <div className="text-[10px] font-medium text-[#6b7280] uppercase tracking-widest mb-1">Composure</div>
            <div className={`text-lg font-semibold ${stressCfg.textClass}`}>{metrics.Stress_Level}</div>
          </div>
        </div>
      </div>
    </div>
  );
}