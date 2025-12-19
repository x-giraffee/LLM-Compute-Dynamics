
export const GPU_SPECS = {
  MODEL: 'NVIDIA H100 Tensor Core GPU',
  VRAM_TOTAL: 80, // GB
  PEAK_TFLOPS: 1000,
};

export const TRAINING_DEFAULTS = {
  VRAM_IDLE: 4,
  VRAM_PEAK: 72, // Includes Gradients + Optimizer States
  COMPUTE_PEAK: 95,
};

export const INFERENCE_DEFAULTS = {
  VRAM_IDLE: 4,
  VRAM_PEAK: 18, // Mainly Model Weights + KV Cache
  COMPUTE_PEAK: 45,
};
