import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LandingPage({ onStart }) {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onStart({ name: name.trim() });
      navigate('/interview');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#0a0c10', fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        .nh-input {
          width: 100%;
          background: #161920;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 13px 16px 13px 44px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          color: #e8eaf0;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .nh-input::placeholder { color: #374151; }
        .nh-input:focus {
          border-color: rgba(79,110,247,0.5);
          box-shadow: 0 0 0 3px rgba(79,110,247,0.08);
        }

        .nh-btn {
          width: 100%;
          padding: 13px;
          background: #4f6ef7;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.02em;
          transition: background 0.2s, transform 0.15s;
        }
        .nh-btn:hover:not(:disabled) { background: #3d5ce0; transform: translateY(-1px); }
        .nh-btn:active:not(:disabled) { transform: scale(0.98); }
        .nh-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        @keyframes nh-scan {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes nh-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20 }}
      >

        {/* ── Logo / Brand ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: '#4f6ef7', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M12 2a6 6 0 0 1 0 12A6 6 0 0 1 12 2z" />
              <path d="M12 14c-5 0-9 2.2-9 5v1h18v-1c0-2.8-4-5-9-5z" />
              <circle cx="8" cy="8" r="1" fill="#fff" stroke="none" />
              <circle cx="16" cy="8" r="1" fill="#fff" stroke="none" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e8eaf0', letterSpacing: '-0.3px' }}>
              NeuroHire <span style={{ color: '#6b7280', fontWeight: 300 }}>Assessment</span>
            </div>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: 10,
              color: '#6b7280', letterSpacing: '0.08em', marginTop: 1,
            }}>
              BIOMETRIC INTERVIEW SUITE
            </div>
          </div>
        </div>

        {/* ── Card ── */}
        <div style={{
          background: '#10131a',
          border: '0.5px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, #4f6ef7, transparent)',
            opacity: 0.4,
          }} />

          {/* Scan line animation */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, #4f6ef7, transparent)',
            opacity: 0.18,
            animation: 'nh-scan 6s linear infinite',
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          <div style={{ padding: '28px 24px', position: 'relative', zIndex: 2 }}>

            {/* Card label */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 10, fontWeight: 500, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#6b7280', marginBottom: 8,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2"
                  style={{ width: 13, height: 13, flexShrink: 0 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Candidate verification
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: '#4f6ef7',
                  marginLeft: 2, display: 'inline-block',
                  animation: 'nh-pulse 1.8s ease-in-out infinite',
                }} />
              </div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65 }}>
                Enter your name to initialize the session. Biometric data is processed locally and never stored.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              <div style={{ position: 'relative' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
                  style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', width: 16, height: 16, pointerEvents: 'none',
                  }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  required
                  type="text"
                  placeholder="Full name"
                  className="nh-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" className="nh-btn" disabled={!name.trim()}>
                Initialize assessment
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ width: 14, height: 14 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

            </form>
          </div>
        </div>

        {/* ── Trust badges ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
        }}>
          {[
            { label: 'Biometric secured', color: '#34d399' },
            { label: 'NIST compliant',    color: '#4f6ef7' },
          ].map(({ label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: "'DM Mono', monospace",
              fontSize: 9, color: '#374151',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
                style={{ width: 12, height: 12, opacity: 0.5 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {label}
            </div>
          ))}
        </div>

      </motion.div>
    </div>
  );
}