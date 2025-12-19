
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { GpuMetrics, SimulationMode } from '../types';
import { GPU_SPECS } from '../constants';

interface GpuDashboardProps {
  history: GpuMetrics[];
  current: GpuMetrics;
  mode: SimulationMode;
}

const GpuDashboard: React.FC<GpuDashboardProps> = ({ history, current, mode }) => {
  const showTaskMetric = mode !== SimulationMode.IDLE;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* VRAM Usage */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-400 font-medium uppercase text-xs tracking-wider">VRAM Usage</h3>
            <span className="text-blue-400 font-bold text-lg">{current.vramUsed.toFixed(1)} / {GPU_SPECS.VRAM_TOTAL} GB</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorVram" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={[0, GPU_SPECS.VRAM_TOTAL]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="vramUsed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVram)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compute Utilization */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-400 font-medium uppercase text-xs tracking-wider">Compute Utilization</h3>
            <span className="text-emerald-400 font-bold text-lg">{current.computeUtil.toFixed(1)}%</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line type="monotone" dataKey="computeUtil" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Task Specific Metric Chart */}
      {showTaskMetric && (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-slate-400 font-medium uppercase text-xs tracking-wider">
              {mode === SimulationMode.TRAINING ? 'Training Loss Convergence' : 'Inference Throughput (TPS)'}
            </h3>
            <span className={mode === SimulationMode.TRAINING ? 'text-rose-400 font-bold text-lg' : 'text-amber-400 font-bold text-lg'}>
              {mode === SimulationMode.TRAINING 
                ? (current.loss?.toFixed(4) || '0.0000')
                : (current.tps?.toFixed(1) || '0.0') + ' tok/s'}
            </span>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: mode === SimulationMode.TRAINING ? '#fb7185' : '#fbbf24' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={mode === SimulationMode.TRAINING ? 'loss' : 'tps'} 
                  stroke={mode === SimulationMode.TRAINING ? '#fb7185' : '#fbbf24'} 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default GpuDashboard;
