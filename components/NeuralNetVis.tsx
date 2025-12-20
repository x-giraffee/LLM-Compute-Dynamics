
import React, { useEffect, useState } from 'react';
import { SimulationMode, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface NeuralNetVisProps {
  mode: SimulationMode;
  progress: number;
  isPaused: boolean;
  inputTokens: string[];
  outputTokens: string[];
  lang: Language;
}

const NeuralNetVis: React.FC<NeuralNetVisProps> = ({ mode, progress, isPaused, inputTokens, outputTokens, lang }) => {
  const [pulse, setPulse] = useState(0);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Colors based on mode
  const accentColor = mode === SimulationMode.TRAINING ? '#f43f5e' : mode === SimulationMode.INFERENCE ? '#10b981' : '#334155';
  const flowColor = mode === SimulationMode.TRAINING ? '#fb7185' : '#34d399';

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700 relative overflow-hidden h-[450px] flex flex-col">
      {/* Status Overlay */}
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: accentColor }}></span>
            {t.visTitle}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">
            {t.visSubtitle}
          </p>
        </div>
        {isPaused && (
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/50 rounded text-amber-500 text-[10px] font-bold animate-pulse">
            {t.pipelineStalled}
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-between gap-4 mt-4 relative">
        {/* Input Tokens Area */}
        <div className="w-1/4 h-full flex flex-col justify-center gap-2">
          <h4 className="text-[10px] text-slate-500 font-bold uppercase text-center mb-2">{t.inputContext}</h4>
          <div className="flex flex-wrap gap-1 justify-center content-center max-h-[300px] overflow-hidden">
            {inputTokens.map((token, idx) => (
              <div 
                key={idx} 
                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-blue-300 animate-in fade-in zoom-in"
              >
                {token}
              </div>
            ))}
            {inputTokens.length === 0 && <div className="text-slate-700 text-[10px] italic">{t.noInput}</div>}
          </div>
        </div>

        {/* The Model "Black Box" / Transformer Block */}
        <div className="flex-1 h-full relative flex flex-col items-center justify-center">
          {/* Main Transformer Frame */}
          <div className="w-48 h-64 border-2 border-slate-700 rounded-3xl relative bg-slate-950/50 shadow-2xl flex flex-col p-4 gap-3 overflow-hidden">
            {/* Layer visualization inside */}
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="h-6 border border-slate-800 rounded flex items-center justify-center relative group"
                style={{ 
                  backgroundColor: mode !== SimulationMode.IDLE && !isPaused && (pulse + i*10) % 30 < 10 ? `${accentColor}15` : 'transparent',
                  borderColor: mode !== SimulationMode.IDLE ? `${accentColor}40` : '#1e293b'
                }}
              >
                <span className="text-[8px] text-slate-600 font-mono uppercase tracking-tighter">
                  {t.block} {i + 1}
                </span>
                {/* Internal data flow lines */}
                {mode !== SimulationMode.IDLE && !isPaused && (
                   <div className="absolute inset-0 flex items-center justify-around px-2 opacity-50">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="w-0.5 h-full bg-slate-800" />
                      ))}
                   </div>
                )}
              </div>
            ))}

            {/* Glowing inner core */}
            <div className={`absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent opacity-20 transition-all pointer-events-none`}
                 style={{ 
                   background: mode === SimulationMode.TRAINING ? `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)` : 
                               mode === SimulationMode.INFERENCE ? `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)` : 'none' 
                 }}
            />
          </div>

          {/* Model Labels */}
          <div className="mt-4 text-center">
            <span className="text-[10px] text-slate-400 font-bold tracking-widest block">{t.coreEngine}</span>
            <span className="text-[8px] text-slate-600 uppercase">{t.subEngine}</span>
          </div>

          {/* Visualizing Data Flow Arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
            {mode === SimulationMode.INFERENCE && !isPaused && (
              <>
                {/* Forward Path Inference */}
                <path d="M 50 150 Q 150 150 180 150" fill="none" stroke={flowColor} strokeWidth="1" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1s" repeatCount="indefinite" />
                </path>
                <path d="M 220 150 Q 350 150 380 150" fill="none" stroke={flowColor} strokeWidth="1" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1s" repeatCount="indefinite" />
                </path>
              </>
            )}
            {mode === SimulationMode.TRAINING && !isPaused && (
              <>
                {/* Bi-directional Training */}
                <path d="M 50 140 Q 150 140 180 140" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 4">
                   <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.5s" repeatCount="indefinite" />
                </path>
                <path d="M 180 160 Q 150 160 50 160" fill="none" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 4">
                   <animate attributeName="stroke-dashoffset" from="0" to="40" dur="1s" repeatCount="indefinite" />
                </path>
                <text x="80" y="175" className="fill-rose-500/80 text-[8px] font-mono">{t.backprop}</text>
              </>
            )}
          </svg>
        </div>

        {/* Output Area */}
        <div className="w-1/4 h-full flex flex-col justify-center gap-2">
          <h4 className="text-[10px] text-slate-500 font-bold uppercase text-center mb-2">
            {mode === SimulationMode.TRAINING ? t.lossTargets : t.outputSeq}
          </h4>
          <div className="flex flex-col gap-1 items-center max-h-[300px] overflow-hidden">
            {mode === SimulationMode.TRAINING ? (
              <div className="flex flex-col items-center gap-3">
                 <div className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 rounded text-[10px] text-rose-300 font-bold uppercase tracking-widest text-center">
                    {t.lossSignal}
                 </div>
                 <div className="text-[8px] text-slate-600 font-mono text-center">
                    {t.lossDesc}
                 </div>
              </div>
            ) : (
              outputTokens.map((token, idx) => (
                <div 
                  key={idx} 
                  className={`px-3 py-1.5 rounded text-[10px] font-mono shadow-lg animate-in slide-in-from-left-2 ${idx === outputTokens.length - 1 ? 'bg-emerald-500 text-slate-950 font-bold scale-110' : 'bg-slate-800 text-emerald-400 border border-emerald-900/50 opacity-60'}`}
                >
                  {token}
                </div>
              ))
            )}
            {mode === SimulationMode.IDLE && <div className="text-slate-700 text-[10px] italic">{t.waitingOutput}</div>}
            {mode === SimulationMode.INFERENCE && outputTokens.length === 0 && <div className="text-slate-700 text-[10px] italic">{t.generating}</div>}
          </div>
        </div>
      </div>
      
      {/* Legend & Summary */}
      <div className="absolute bottom-4 left-6 flex gap-6 items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm border border-blue-400/50"></div>
          <span className="text-[10px] text-slate-500 font-bold uppercase">{t.legendWeights}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm border border-emerald-400/50"></div>
          <span className="text-[10px] text-slate-500 font-bold uppercase">{t.legendActivations}</span>
        </div>
        {mode === SimulationMode.TRAINING && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-500 rounded-sm border border-rose-400/50"></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">{t.legendGradients}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuralNetVis;
