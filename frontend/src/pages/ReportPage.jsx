import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const STRESS_COLOR = {
  Low:    '#34d399',
  Medium: '#fbbf24',
  High:   '#f87171',
};

function getRecommendation(h_score, overallStress) {
  if (h_score > 85 && overallStress === 'Low')
    return { status: 'Strong hire',          color: '#34d399', border: 'rgba(52,211,153,0.2)',  bg: 'rgba(52,211,153,0.08)',  desc: 'Exceptional candidate. High authenticity, strong focus, and stable emotional state.' };
  if (h_score > 70)
    return { status: 'Consider hire',        color: '#4f6ef7', border: 'rgba(79,110,247,0.2)',  bg: 'rgba(79,110,247,0.08)',  desc: 'Solid candidate. Some minor performance variances noticed, but overall fit for the role.' };
  if (h_score > 50)
    return { status: 'Follow-up required',   color: '#fbbf24', border: 'rgba(251,191,36,0.2)',  bg: 'rgba(251,191,36,0.08)',  desc: 'Potential fit, but physiological data suggests low composure and inconsistent focus.' };
  return   { status: 'Not recommended',      color: '#f87171', border: 'rgba(248,113,113,0.2)', bg: 'rgba(248,113,113,0.08)', desc: 'Low biometric resonance. Authenticity and clarity scores are below enterprise threshold.' };
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function StatCard({ label, sub, value, color, icon }) {
  return (
    <div style={{
      background: '#10131a',
      border: '0.5px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: '20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon(color)}
        </div>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 18, fontWeight: 500,
          color, letterSpacing: '-0.5px',
        }}>
          {value}
        </span>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#e8eaf0', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 10, color: '#6b7280' }}>{sub}</div>
      </div>
    </div>
  );
}

function MetricRow({ label, desc, score, animate }) {
  const pct = Math.min(parseFloat(score) || 0, 100);
  return (
    <div style={{
      padding: '16px 0',
      borderBottom: '0.5px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#e8eaf0', marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, maxWidth: 380 }}>{desc}</div>
        </div>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 16, fontWeight: 500,
          color: '#4f6ef7', flexShrink: 0,
        }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div style={{ height: 3, background: '#161920', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: animate * 0.15 }}
          style={{ height: '100%', background: '#4f6ef7', borderRadius: 2 }}
        />
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */

export default function ReportPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const results   = location.state?.results;

  /* No session data fallback */
  if (!results) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0c10',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 20, padding: 24,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>
        <div style={{
          width: 36, height: 36, background: '#4f6ef7', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" style={{ width: 18, height: 18 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e8eaf0', marginBottom: 8 }}>No session data found</div>
          <div style={{ fontSize: 13, color: '#6b7280', maxWidth: 280, lineHeight: 1.6 }}>
            Complete an assessment session to generate a report.
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px', background: '#4f6ef7', border: 'none',
            borderRadius: 10, fontSize: 13, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", color: '#fff', cursor: 'pointer',
          }}
        >
          Back to registration
        </button>
      </div>
    );
  }

  const { name, avgConfidence, avgHonesty, avgCommunication, avgPosture, overallStress } = results;
  const h_score = (parseInt(avgConfidence) + parseInt(avgHonesty) + parseInt(avgCommunication) + parseInt(avgPosture)) / 4;
  const rec = getRecommendation(h_score, overallStress);

  const STATS = [
    {
      label: 'Confidence',   sub: 'Self-assurance signals', value: `${avgConfidence}%`,   color: '#34d399',
      icon: c => (
        <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" style={{ width: 14, height: 14 }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
    {
      label: 'Authenticity', sub: 'Consistency & alignment', value: `${avgHonesty}%`,     color: '#4f6ef7',
      icon: c => (
        <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" style={{ width: 14, height: 14 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
    {
      label: 'Posture',      sub: 'Spinal alignment score',  value: `${avgPosture}%`,     color: '#e879f9',
      icon: c => (
        <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" style={{ width: 14, height: 14 }}>
          <circle cx="12" cy="5" r="2"/><path d="M12 7v8M9 15l-2 4M15 15l2 4M9 11H6M15 11h3"/>
        </svg>
      ),
    },
    {
      label: 'Clarity',      sub: 'Verbal rhythm analysis',  value: `${avgCommunication}%`, color: '#fbbf24',
      icon: c => (
        <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" style={{ width: 14, height: 14 }}>
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      ),
    },
    {
      label: 'Composure',    sub: 'Biometric state',         value: overallStress,        color: STRESS_COLOR[overallStress] || '#34d399',
      icon: c => (
        <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" style={{ width: 14, height: 14 }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh', background: '#0a0c10',
        fontFamily: "'DM Sans', sans-serif", color: '#e8eaf0',
        padding: '14px', boxSizing: 'border-box',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}
      >

        {/* ── Header bar ── */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, background: '#4f6ef7', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                <path d="M12 2a6 6 0 0 1 0 12A6 6 0 0 1 12 2z"/>
                <path d="M12 14c-5 0-9 2.2-9 5v1h18v-1c0-2.8-4-5-9-5z"/>
                <circle cx="8" cy="8" r="1" fill="#fff" stroke="none"/>
                <circle cx="16" cy="8" r="1" fill="#fff" stroke="none"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#e8eaf0', letterSpacing: '-0.3px' }}>
                NeuroHire <span style={{ color: '#6b7280', fontWeight: 300 }}>Assessment</span>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#6b7280', letterSpacing: '0.08em', marginTop: 1 }}>
                SESSION REPORT
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px',
                background: '#161920', border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 100, fontSize: 11, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", color: '#6b7280', cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px',
                background: '#161920', border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 100, fontSize: 11, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", color: '#6b7280', cursor: 'pointer',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              New assessment
            </button>
          </div>
        </header>

        {/* ── Candidate + Verdict card ── */}
        <div style={{
          background: '#10131a',
          border: '0.5px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, #4f6ef7, transparent)', opacity: 0.4,
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            {/* Left: candidate info */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 10, fontWeight: 500, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#6b7280', marginBottom: 10,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" style={{ width: 13, height: 13 }}>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Session complete
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#e8eaf0', letterSpacing: '-0.5px', marginBottom: 4 }}>
                {name}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#374151' }}>
                Overall score · <span style={{ color: '#4f6ef7' }}>{h_score.toFixed(1)}%</span>
              </div>
            </div>

            {/* Right: verdict */}
            <div style={{
              padding: '12px 18px',
              background: rec.bg,
              border: `0.5px solid ${rec.border}`,
              borderRadius: 12, textAlign: 'right',
            }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                Verdict
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: rec.color, letterSpacing: '-0.3px', marginBottom: 6 }}>
                {rec.status}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', maxWidth: 260, lineHeight: 1.6 }}>
                {rec.desc}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
        }}>
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── Breakdown panel ── */}
        <div style={{
          background: '#10131a',
          border: '0.5px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            paddingBottom: 16, borderBottom: '0.5px solid rgba(255,255,255,0.05)', marginBottom: 4,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b7280' }}>
              Quantitative breakdown
            </span>
          </div>

          <MetricRow
            label="Biometric consistency"
            desc="The candidate's overall physiological stability and behavioral resonance across the session."
            score={h_score.toFixed(1)}
            animate={0}
          />
          <MetricRow
            label="Postural alignment"
            desc="Level of identified spinal and shoulder stability during the assessment."
            score={avgPosture}
            animate={1}
          />
          <MetricRow
            label="Verbal engagement"
            desc="Objectively monitored articulation and verbal confidence rhythm throughout questions."
            score={avgCommunication}
            animate={2}
          />
          <MetricRow
            label="Authenticity index"
            desc="Consistency between verbal responses and biometric signals over the full session."
            score={avgHonesty}
            animate={3}
          />
        </div>

      </motion.div>
    </div>
  );
}