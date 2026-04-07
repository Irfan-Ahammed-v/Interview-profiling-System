import React from 'react';
import { Brain, ArrowLeft, Download, ShieldCheck, UserCheck, Activity, Award, User, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center gap-10">
         <h1 className="text-4xl font-black italic tracking-tighter text-indigo-500 uppercase text-ellipsis">Access Terminated</h1>
         <p className="text-slate-500 max-w-sm font-medium leading-relaxed">No valid biometric session found. Proceed to candidate registration.</p>
         <button onClick={() => navigate('/')} className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-black text-sm">BACK TO REGISTRATION</button>
      </div>
    );
  }

  const { name, role, avgConfidence, avgHonesty, avgCommunication, avgPosture, avgWpm, overallStress } = results;
  const h_score = (parseInt(avgConfidence) + parseInt(avgHonesty) + parseInt(avgCommunication) + parseInt(avgPosture)) / 4;

  const getRecommendation = () => {
    if (h_score > 85 && overallStress === "Low") return { status: "STRONG HIRE", color: "text-emerald-500", desc: "Exceptional candidate. High linguistic consistency and stable emotional state." };
    if (h_score > 70) return { status: "CONSIDER HIRE", color: "text-indigo-400", desc: "Solid candidate. Good speaking pace and overall professional presence." };
    if (h_score > 50) return { status: "FOLLOW UP", color: "text-orange-500", desc: "Potential fit, but speaking pace (WPM) and posture variance suggest high anxiety." };
    return { status: "NOT RECOMMENDED", color: "text-red-500", desc: "Low biometric resonance. Verbal engagement and posture are below enterprise threshold." };
  };

  const rec = getRecommendation();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-14 overflow-x-hidden relative">
      <div className="absolute top-0 w-full h-[60vh] bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none opacity-40"></div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-6xl space-y-12">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 text-slate-600 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16} /> New Assessment
          </button>
          <div className="flex items-center gap-3 bg-slate-900 px-5 py-2.5 rounded-2xl border border-white/5 shadow-xl">
             <MessageSquare className="text-indigo-400" size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verbal Intelligence Linked</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="relative group p-10 bg-slate-900 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
            <div className="space-y-4">
               <h1 className="text-5xl font-black italic tracking-tighter leading-none">{name} <span className="text-slate-700">/ {role}</span></h1>
            </div>
            <div className="text-right">
               <span className={`text-5xl font-black italic tracking-tighter uppercase ${rec.color}`}>{rec.status}</span>
               <p className="text-slate-500 max-w-[280px] mt-4 text-xs font-medium ml-auto italic">{rec.desc}</p>
            </div>
          </div>
        </div>

        {/* 6 Metrics Grid! */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
           <ReportStatItem label="Confidence" value={`${avgConfidence}%`} icon={<UserCheck />} color="text-emerald-400" bg="bg-emerald-400/10" />
           <ReportStatItem label="Authenticity" value={`${avgHonesty}%`} icon={<ShieldCheck />} color="text-indigo-400" bg="bg-indigo-400/10" />
           <ReportStatItem label="Sincerity" value={`${avgCommunication}%`} icon={<Brain />} color="text-indigo-400" bg="bg-indigo-400/10" />
           <ReportStatItem label="Posture" value={`${avgPosture}%`} icon={<User />} color="text-pink-400" bg="bg-pink-400/10" />
           <ReportStatItem label="Speaking Pace" value={`${avgWpm} WPM`} icon={<Activity />} color="text-indigo-400" bg="bg-indigo-400/10" />
           <ReportStatItem label="Composure" value={overallStress} icon={<Activity />} color={(overallStress === 'High') ? "text-red-500" : (overallStress === 'Medium') ? "text-orange-500" : "text-emerald-500"} bg="bg-slate-950/60" />
        </div>

        {/* Deep Analysis */}
        <div className="bg-slate-900 rounded-[3rem] border border-white/5 p-10 shadow-inner relative overflow-hidden">
           <div className="flex items-center justify-between mb-10 relative z-10">
              <h2 className="text-lg font-black uppercase tracking-[0.3em] text-slate-500 italic">Quantitative Linguistic Analysis</h2>
              <button onClick={() => window.print()} className="flex items-center gap-3 bg-white text-slate-950 px-7 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                <Download size={18} /> Export Analysis
              </button>
           </div>
           <div className="space-y-6 relative z-10">
              <SummaryRow label="Biometric Consistency" score={h_score.toFixed(1)} desc="Overall physiological stability and behavioral resonance." />
              <SummaryRow label="Verbal Fluency" score={Math.min(100, (avgWpm / 140) * 100).toFixed(0)} desc="Efficiency of speaking rhythm and word density per minute." />
              <SummaryRow label="Linguistic Sentiment" score={avgCommunication} desc="Emotional tone and professional vocabulary consistency." />
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function ReportStatItem({ label, value, icon, color, bg }) {
  return (
    <div className="bg-slate-950 p-7 rounded-[2rem] border border-white/5 text-center flex flex-col items-center gap-4 hover:translate-y-[-4px] transition-all">
       <div className={`p-3 rounded-2xl ${bg} ${color}`}>
         {icon}
       </div>
       <div className="space-y-1">
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">{label}</span>
         <h3 className={`text-2xl font-black italic tracking-tighter text-white`}>{value}</h3>
       </div>
    </div>
  );
}

function SummaryRow({ label, score, desc }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-10 py-6 bg-slate-950/40 rounded-[2rem] border border-white/5">
       <div className="space-y-1">
          <h4 className="text-lg font-bold text-white tracking-tight">{label}</h4>
          <p className="text-[11px] text-slate-600 font-medium max-w-sm leading-relaxed">{desc}</p>
       </div>
       <div className="flex items-center gap-8">
          <div className="w-48 bg-slate-900 h-1 rounded-full overflow-hidden border border-white/5 shadow-inner">
             <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
          </div>
          <span className="text-2xl font-black italic text-indigo-400 min-w-[70px] text-right font-mono tracking-tighter">{score}%</span>
       </div>
    </div>
  );
}