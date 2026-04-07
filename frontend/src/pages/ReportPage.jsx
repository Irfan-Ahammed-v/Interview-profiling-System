import React from 'react';
import { Brain, ArrowLeft, Download, ShieldCheck, UserCheck, Activity, Award, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center gap-10 selection:bg-indigo-500/30">
         <h1 className="text-4xl font-black italic tracking-tighter text-indigo-500 uppercase">Authentication Required</h1>
         <p className="text-slate-500 max-w-sm font-medium leading-relaxed">No valid session data found. Proceed to candidate registration to initialize a new assessment.</p>
         <button 
           onClick={() => navigate('/')}
           className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-black text-sm hover:translate-y-[-4px] hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)] active:scale-95 transition-all shadow-2xl"
         >
           BACK TO REGISTRATION
         </button>
      </div>
    );
  }

  const { name, role, avgConfidence, avgHonesty, avgCommunication, avgPosture, overallStress } = results;
  const h_score = (parseInt(avgConfidence) + parseInt(avgHonesty) + parseInt(avgCommunication) + parseInt(avgPosture)) / 4;

  const getRecommendation = () => {
    if (h_score > 85 && overallStress === "Low") return { status: "STRONG HIRE", color: "text-emerald-500", desc: "Exceptional candidate. High authenticity, strong focus, and stable emotional state." };
    if (h_score > 70) return { status: "CONSIDER HIRE", color: "text-indigo-400", desc: "Solid candidate. Some minor performance variances noticed, but overall fit for the role." };
    if (h_score > 50) return { status: "FOLLOW UP REQUIRED", color: "text-orange-500", desc: "Potential fit, but physiological data suggests low composure and inconsistent focus." };
    return { status: "NOT RECOMMENDED", color: "text-red-500", desc: "Low biometric resonance. Authenticity and clarity scores are below enterprise threshold." };
  };

  const rec = getRecommendation();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-14 overflow-x-hidden relative selection:bg-indigo-500/30">
      
      {/* Background Decor */}
      <div className="absolute top-0 w-full h-[60vh] bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none opacity-40"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-5xl space-y-12"
      >
        {/* Top Navigation */}
        <div className="flex justify-between items-center group">
          <button 
             onClick={() => navigate('/')}
             className="flex items-center gap-3 text-slate-600 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft size={16} /> New Assessment
          </button>
          
          <div className="flex items-center gap-3 bg-slate-900/40 px-5 py-2.5 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-xl">
             <Brain className="text-indigo-400" size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Analysis Report Issued</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="relative group p-10 bg-slate-900/30 rounded-[3.5rem] border border-white/5 backdrop-blur-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)] transition-all duration-700">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/5 blur-[180px]"></div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 relative z-10">
            <div className="space-y-4">
               <div className="flex items-center gap-4 text-indigo-400 mb-2">
                 <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                   <Award size={26} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.3em]">Session Completion</span>
               </div>
               <h1 className="text-5xl font-black italic tracking-tighter leading-none">
                 {name} <span className="text-slate-700">/ {role}</span>
               </h1>
            </div>

            <div className="text-right">
               <span className={`text-5xl font-black italic tracking-tighter uppercase ${rec.color}`}>
                 {rec.status}
               </span>
               <p className="text-slate-500 max-w-[280px] mt-3 text-xs font-medium ml-auto leading-relaxed italic">
                 {rec.desc}
               </p>
            </div>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
           <ReportStatItem label="Confidence" subtext="Postural stability" value={`${avgConfidence}%`} icon={<UserCheck />} color="text-emerald-400" bg="bg-emerald-400/10" />
           <ReportStatItem label="Authenticity" subtext="Ocular focus" value={`${avgHonesty}%`} icon={<ShieldCheck />} color="text-indigo-400" bg="bg-indigo-400/10" />
           <ReportStatItem label="Posture" subtext="Alignment index" value={`${avgPosture}%`} icon={<User />} color="text-pink-400" bg="bg-pink-400/10" />
           <ReportStatItem label="Clarity" subtext="Verbal rhythm" value={`${avgCommunication}%`} icon={<Brain />} color="text-indigo-400" bg="bg-indigo-400/10" />
           <ReportStatItem label="Composure" subtext="Biometric state" value={overallStress} icon={<Activity />} color={(overallStress === 'High') ? "text-red-500" : (overallStress === 'Medium') ? "text-orange-500" : "text-emerald-500"} bg="bg-slate-900/60" />
        </div>

        {/* Summary Breakdown */}
        <div className="bg-slate-900/10 rounded-[3rem] border border-white/5 p-10 backdrop-blur-2xl shadow-inner relative overflow-hidden">
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px]"></div>
           
           <div className="flex items-center justify-between mb-10 relative z-10">
              <h2 className="text-lg font-black uppercase tracking-[0.3em] text-slate-500 italic">Quantitative Breakdown</h2>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-3 bg-white text-slate-950 hover:bg-indigo-400 px-7 py-3.5 rounded-2xl transition-all shadow-xl text-[10px] font-black uppercase tracking-widest"
              >
                <Download size={18} /> Export Analysis
              </button>
           </div>

           <div className="space-y-7 relative z-10">
              <SummaryRow label="Biometric Consistency" score={h_score.toFixed(1)} desc="The candidate's overall physiological stability and behavioral resonance." />
              <SummaryRow label="Postural Alignment" score={avgPosture} desc="Level of identified spinal and shoulder stability during the assessment." />
              <SummaryRow label="Verbal Engagement" score={avgCommunication} desc="Objectively monitored articulation and verbal confidence rhythm." />
           </div>
        </div>

      </motion.div>
    </div>
  );
}

function ReportStatItem({ label, subtext, value, icon, color, bg }) {
  return (
    <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 text-center flex flex-col items-center gap-5 hover:translate-y-[-4px] transition-all duration-500 hover:bg-slate-800/40 group shadow-2xl relative overflow-hidden">
       <div className={`p-3 rounded-2xl ${bg} ${color} border border-indigo-500/10 group-hover:scale-[1.1] transition-transform duration-700`}>
         {icon}
       </div>
       <div className="space-y-1.5 text-ellipsis">
         <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">{label}</span>
         <h3 className={`text-3xl font-black italic tracking-tighter text-white`}>
           {value}
         </h3>
         <span className="text-[8px] font-medium text-slate-700 italic block leading-none">{subtext}</span>
       </div>
    </div>
  );
}

function SummaryRow({ label, score, desc }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-10 py-8 bg-slate-950/40 rounded-[2rem] border border-white/5 hover:border-indigo-500/20 transition-all duration-500">
       <div className="space-y-1.5">
          <h4 className="text-lg font-bold text-white tracking-tight">{label}</h4>
          <p className="text-[11px] text-slate-600 font-medium max-w-sm leading-relaxed">{desc}</p>
       </div>
       <div className="flex items-center gap-8">
          <div className="w-48 bg-slate-900 h-1 rounded-full overflow-hidden border border-white/5 shadow-inner">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${score}%` }}
               className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
             />
          </div>
          <span className="text-2xl font-black italic text-indigo-400 min-w-[70px] text-right font-mono tracking-tighter">{score}%</span>
       </div>
    </div>
  );
}
