
export enum SimulationMode {
  IDLE = 'IDLE',
  TRAINING = 'TRAINING',
  INFERENCE = 'INFERENCE'
}

export interface GpuMetrics {
  timestamp: number;
  vramUsed: number; // in GB
  vramTotal: number; // in GB
  computeUtil: number; // 0-100%
  tflops: number;
  temperature: number;
  loss?: number; // Specific to TRAINING
  tps?: number;  // Specific to INFERENCE (Tokens Per Second)
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  message: string;
}

export interface ModelLayer {
  name: string;
  weights: number[]; // Simulation of weight magnitudes
  active: boolean;
}
