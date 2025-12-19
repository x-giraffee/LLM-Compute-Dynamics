
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TRAINING_FALLBACKS = [
  "Optimizer state updated: Weight gradients normalized across 8 nodes.",
  "Backpropagation successful: Applied AdamW update to hidden layers.",
  "Loss convergence detected: Stochastic noise within expected bounds.",
  "Checkpoint saved: Model weights synchronized to sharded storage.",
  "Learning rate adjusted: Scheduler reducing alpha for fine-tuning.",
  "Gradient clipping applied to prevent exploding tensors.",
  "Loss: 1.842 - Batch processing latency at 42ms.",
  "Attention heads updated: Cross-layer normalization stable."
];

const INFERENCE_FALLBACKS = [
  "KV Cache miss: Repopulating context for new sequence length.",
  "Token generated: Sampling temperature adjusted via top-p nucleus.",
  "Attention mask applied: Masking future tokens for causal decoding.",
  "Logit bias updated: Enhancing factual consistency in output.",
  "Softmax normalization complete: Probability distribution stable.",
  "Context window shifted: Sliding window attention active.",
  "Beam search step: Evaluated top-5 candidate hypotheses.",
  "Flash Attention v2 executed: 4x speedup on attention block."
];

async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && error?.status === 429) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getSimulationAnalysis = async (mode: 'TRAINING' | 'INFERENCE', step: number) => {
  const modelName = mode === 'TRAINING' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const prompt = mode === 'TRAINING' 
    ? `You are an AI Training System Monitor. Generate a one-sentence technical log for step ${step} of training a 70B parameter LLM. Mention things like gradients, backpropagation, optimizer states (AdamW), or loss convergence. Return ONLY the log message.`
    : `You are an AI Inference Engine. Generate a one-sentence technical log for generating token #${step}. Mention KV cache, attention mechanism, or sampling temperature. Return ONLY the log message.`;

  try {
    // Explicitly type the response to fix 'unknown' type errors for .text property
    const response: GenerateContentResponse = await retry(() => ai.models.generateContent({
      model: modelName,
      contents: prompt,
    }));
    return response.text || "Synchronizing neural weights...";
  } catch (error: any) {
    console.warn("Gemini API Rate Limited or Error:", error);
    // Return a convincing fallback instead of an error message
    const fallbacks = mode === 'TRAINING' ? TRAINING_FALLBACKS : INFERENCE_FALLBACKS;
    return fallbacks[step % fallbacks.length];
  }
};

export const getComparisonExpertView = async (isTraining: boolean) => {
  const prompt = `Explain the primary difference in GPU memory usage between LLM ${isTraining ? 'Training' : 'Inference'}. Focus on ${isTraining ? 'Optimizer states and Gradients' : 'KV Cache and weights'}. Keep it to 3 short bullet points.`;
  
  try {
    // Explicitly type the response to fix 'unknown' type errors for .text property
    const response: GenerateContentResponse = await retry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    }));
    return response.text || "No insights available.";
  } catch (error) {
    if (isTraining) {
      return "• Training requires massive VRAM for Gradients and Optimizer States.\n• Weights + Gradients + Moments can triple the memory footprint compared to pure weights.\n• High compute utilization (90%+) is typical during backward passes.";
    } else {
      return "• Inference memory is dominated by Model Weights and the KV Cache.\n• Memory usage scales with context length due to stored key-value pairs.\n• Compute is typically bursty and lower intensity than training cycles.";
    }
  }
};
