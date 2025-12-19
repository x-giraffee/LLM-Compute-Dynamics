
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GpuDashboard from './components/GpuDashboard';
import NeuralNetVis from './components/NeuralNetVis';
import { SimulationMode, GpuMetrics, LogEntry } from './types';
import { GPU_SPECS, TRAINING_DEFAULTS, INFERENCE_DEFAULTS } from './constants';
import { getSimulationAnalysis, getComparisonExpertView } from './services/geminiService';

const LLM_VOCAB = ["The", "model", "is", "thinking", "about", "how", "to", "process", "large", "amounts", "of", "data", "efficiently", "on", "a", "GPU", "cluster", "running", "H100", "units"];

const App: React.FC = () => {
  const [mode, setMode] = useState<SimulationMode>(SimulationMode.IDLE);
  const [isPaused, setIsPaused] = useState(false);
  const [metricsHistory, setMetricsHistory] = useState<GpuMetrics[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [step, setStep] = useState(0);
  const [expertTip, setExpertTip] = useState<string>('Select a task to begin monitoring the neural fabric.');
  
  // Token Display State
  const [inputTokens, setInputTokens] = useState<string[]>([]);
  const [outputTokens, setOutputTokens] = useState<string[]>([]);
  
  const metricsTimerRef = useRef<number | null>(null);
  const taskTimerRef = useRef<number | null>(null);

  const addLog = (message: string, level: LogEntry['level'] = 'INFO') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const generateMetrics = useCallback((currentMode: SimulationMode, paused: boolean, currentStep: number): GpuMetrics => {
    const baseVram = 4;
    let targetVram = baseVram;
    let targetCompute = 0;
    let simulatedLoss: number | undefined;
    let simulatedTps: number | undefined;

    if (currentMode === SimulationMode.TRAINING) {
      targetVram = TRAINING_DEFAULTS.VRAM_PEAK + (Math.random() * 2 - 1);
      targetCompute = paused ? 5 + Math.random() : TRAINING_DEFAULTS.COMPUTE_PEAK + (Math.random() * 5 - 2.5);
      simulatedLoss = Math.max(0.1, (2.5 / (1 + currentStep * 0.1)) + (Math.random() * 0.05));
    } else if (currentMode === SimulationMode.INFERENCE) {
      targetVram = INFERENCE_DEFAULTS.VRAM_PEAK + (Math.random() * 1 - 0.5);
      targetCompute = paused ? 2 + Math.random() : INFERENCE_DEFAULTS.COMPUTE_PEAK + (Math.random() * 10 - 5);
      simulatedTps = paused ? 0 : 18 + Math.random() * 6;
    }

    return {
      timestamp: Date.now(),
      vramUsed: Math.min(GPU_SPECS.VRAM_TOTAL, Math.max(0, targetVram)),
      vramTotal: GPU_SPECS.VRAM_TOTAL,
      computeUtil: Math.min(100, Math.max(0, targetCompute)),
      tflops: (targetCompute / 100) * GPU_SPECS.PEAK_TFLOPS,
      temperature: 45 + (targetCompute / 100) * 35,
      loss: simulatedLoss,
      tps: simulatedTps
    };
  }, []);

  // Metrics Update Loop
  useEffect(() => {
    metricsTimerRef.current = window.setInterval(() => {
      const newMetric = generateMetrics(mode, isPaused, step);
      setMetricsHistory(prev => [...prev, newMetric].slice(-30));
    }, 1000);

    return () => {
      if (metricsTimerRef.current) clearInterval(metricsTimerRef.current);
    };
  }, [mode, isPaused, step, generateMetrics]);

  // Task Progression Logic
  useEffect(() => {
    if (mode !== SimulationMode.IDLE && !isPaused) {
      taskTimerRef.current = window.setTimeout(async () => {
        if (step >= 20) {
          setMode(SimulationMode.IDLE);
          setIsPaused(false);
          addLog(`${mode} sequence completed successfully.`, 'SUCCESS');
          return;
        }

        const nextStep = step + 1;
        setStep(nextStep);
        
        // Update Token Visuals
        if (mode === SimulationMode.INFERENCE) {
          setOutputTokens(prev => [...prev, LLM_VOCAB[nextStep % LLM_VOCAB.length]].slice(-5));
        } else if (mode === SimulationMode.TRAINING) {
          // Training consumes "batches" of tokens
          setInputTokens(Array.from({length: 8}, () => LLM_VOCAB[Math.floor(Math.random() * LLM_VOCAB.length)]));
        }

        const logMsg = await getSimulationAnalysis(mode as any, nextStep);
        addLog(logMsg);
      }, 1500);
    }

    return () => {
      if (taskTimerRef.current) clearTimeout(taskTimerRef.current);
    };
  }, [mode, isPaused, step]);

  const handleStartTask = async (task: SimulationMode) => {
    if (mode !== SimulationMode.IDLE) return;
    
    setStep(0);
    setMode(task);
    setIsPaused(false);
    setOutputTokens([]);
    
    if (task === SimulationMode.INFERENCE) {
      setInputTokens(["What", "is", "a", "GPU", "H100", "for?"]);
    } else {
      setInputTokens(Array.from({length: 8}, () => LLM_VOCAB[Math.floor(Math.random() * LLM_VOCAB.length)]));
    }

    addLog(`Initiating ${task} sequence...`, 'INFO');
    
    const tip = await getComparisonExpertView(task === SimulationMode.TRAINING);
    setExpertTip(tip);
  };

  const togglePause = () => {
    if (mode === SimulationMode.IDLE) return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    addLog(nextPaused ? "Simulation paused by user." : "Simulation resumed.", nextPaused ? 'WARN' : 'INFO');
  };

  const handleStopTask = () => {
    addLog(`Task '${mode}' terminated by user. Returning to IDLE state.`, 'WARN');
    setMode(SimulationMode.IDLE);
    setIsPaused(false);
    setStep(0);
    setInputTokens([]);
    setOutputTokens([]);
  };

  const currentMetrics = metricsHistory[metricsHistory.length - 1] || generateMetrics(SimulationMode.IDLE, false, 0);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            LLM Compute Dynamics
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl text-sm md:text-base">
            Observe how Training (Forward + Backward pass) and Inference (Autoregressive Token Generation) 
            differ in hardware utilization and data flow.
          </p>
        </div>
        
        <div className="flex gap-3">
          {mode === SimulationMode.IDLE ? (
            <>
              <button 
                onClick={() => handleStartTask(SimulationMode.TRAINING)}
                className="px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/20 bg-blue-600 hover:bg-blue-500 text-white"
              >
                Start Training Run
              </button>
              <button 
                onClick={() => handleStartTask(SimulationMode.INFERENCE)}
                className="px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-900/20 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Run Inference Task
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={togglePause}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 ${
                  isPaused 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-100 shadow-slate-900/20'
                }`}
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              
              {isPaused && (
                <button 
                  onClick={handleStopTask}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-500/30"
                >
                  Stop Task
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <NeuralNetVis 
            mode={mode} 
            progress={step * 5} 
            isPaused={isPaused} 
            inputTokens={inputTokens} 
            outputTokens={outputTokens} 
          />
          
          <GpuDashboard history={metricsHistory} current={currentMetrics} mode={mode} />

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { label: 'GPU Temp', value: `${currentMetrics.temperature.toFixed(1)}°C`, color: 'text-orange-400' },
              { label: 'TFLOPS', value: `${currentMetrics.tflops.toFixed(1)}`, color: 'text-purple-400' },
              { label: mode === SimulationMode.INFERENCE ? 'Current Generation' : 'Training Progress', value: `#${step}`, color: 'text-yellow-400' },
              { 
                label: mode === SimulationMode.INFERENCE ? 'Tokens/Sec' : (mode === SimulationMode.TRAINING ? 'Loss Value' : 'Idle Status'), 
                value: mode === SimulationMode.INFERENCE 
                  ? `${currentMetrics.tps?.toFixed(1) || '0.0'}` 
                  : (mode === SimulationMode.TRAINING ? `${currentMetrics.loss?.toFixed(4) || '0.0000'}` : 'READY'), 
                color: mode === SimulationMode.INFERENCE ? 'text-amber-400' : (mode === SimulationMode.TRAINING ? 'text-rose-400' : 'text-slate-500') 
              },
              { label: 'Status', value: mode === SimulationMode.IDLE ? 'IDLE' : (isPaused ? 'PAUSED' : 'ACTIVE'), color: isPaused ? 'text-amber-400' : (mode === SimulationMode.IDLE ? 'text-slate-500' : 'text-emerald-400') },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/30 border border-slate-700 p-4 rounded-xl">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1 truncate">{stat.label}</p>
                <p className={`text-lg md:text-xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 shadow-inner relative overflow-hidden">
            <h3 className="text-indigo-300 font-bold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Architect's Analysis
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
              {expertTip}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="px-4 py-2 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-mono text-slate-400 uppercase font-bold tracking-widest">System Console</h3>
              <div className="flex gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500 animate-pulse' : 'bg-red-500/50'}`}></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px]">
              {logs.length === 0 && <p className="text-slate-600 italic">Ready for simulation...</p>}
              {logs.map(log => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-slate-600 shrink-0">{log.timestamp}</span>
                  <span className={`font-bold ${log.level === 'SUCCESS' ? 'text-emerald-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-blue-400'}`}>[{log.level}]</span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
