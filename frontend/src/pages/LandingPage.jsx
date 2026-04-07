import React, { useState } from 'react';
import { Brain, ArrowRight, User, Briefcase, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LandingPage({ onStart }) {
  const [formData, setFormData] = useState({ name: '', role: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.role) {
      onStart(formData);
      navigate('/interview');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Refined Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[140px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-xl flex flex-col items-center text-center gap-14"
      >
        {/* Professional Branding */}
        <div className="flex flex-col items-center gap-8">
          <div className="w-22 h-22 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-indigo-500/20 border border-white/10 rotate-6 group hover:rotate-0 transition-transform duration-700">
            <Brain className="text-white" size={48} />
          </div>
          <div className="space-y-5">
            <h1 className="text-6xl font-black tracking-tighter leading-tight text-white italic">
              NEURO<span className="text-indigo-500">HIRE</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-sm tracking-tight leading-relaxed">
              Enterprise-grade biometric assessment for objective candidate profiling.
            </p>
          </div>
        </div>

        {/* Action Card */}
        <div className="w-full bg-slate-900/30 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.4)] relative">
          <div className="absolute -top-4 -right-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
            Secure Session V2
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-5 text-left">
              <div className="flex flex-col gap-2 ml-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Candidate Identity</label>
              </div>
              
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  required
                  type="text" 
                  placeholder="Full Legal Name"
                  className="w-full bg-slate-950/60 border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-8 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium text-lg placeholder:text-slate-800"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="relative group">
                <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input 
                  required
                  type="text" 
                  placeholder="Target Role / Level"
                  className="w-full bg-slate-950/60 border border-white/5 rounded-[1.5rem] py-6 pl-16 pr-8 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium text-lg placeholder:text-slate-800"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-white text-slate-950 py-6 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-4 hover:translate-y-[-4px] hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)] active:scale-95 transition-all shadow-2xl group"
            >
              INITIALIZE ASSESSMENT
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer Trusts */}
        <div className="flex items-center gap-12 justify-center text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] opacity-80">
          <div className="flex items-center gap-2.5">
             <ShieldCheck size={16} className="text-emerald-600/50" />
             Biometric Secured
          </div>
          <div className="flex items-center gap-2.5">
             <ShieldCheck size={16} className="text-indigo-600/50" />
             NIST Compliant
          </div>
        </div>
      </motion.div>

    </div>
  );
}
