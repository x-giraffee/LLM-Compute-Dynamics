
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TRAINING_FALLBACKS = {
  en: [
    "Optimizer state updated: Weight gradients normalized across 8 nodes.",
    "Backpropagation successful: Applied AdamW update to hidden layers.",
    "Loss convergence detected: Stochastic noise within expected bounds.",
    "Checkpoint saved: Model weights synchronized to sharded storage.",
    "Learning rate adjusted: Scheduler reducing alpha for fine-tuning.",
    "Gradient clipping applied to prevent exploding tensors.",
    "Loss: 1.842 - Batch processing latency at 42ms.",
    "Attention heads updated: Cross-layer normalization stable."
  ],
  zh: [
    "优化器状态已更新：权重梯度在8个节点间完成归一化。",
    "反向传播成功：已将 AdamW 更新应用于隐藏层。",
    "检测到损失收敛：随机噪声在预期范围内。",
    "检查点已保存：模型权重已同步至分片存储。",
    "学习率调整：调度器正在降低 alpha 值以进行微调。",
    "应用梯度裁剪以防止张量爆炸。",
    "损失值: 1.842 - 批处理延迟 42ms。",
    "注意力头已更新：跨层归一化保持稳定。"
  ]
};

const INFERENCE_FALLBACKS = {
  en: [
    "KV Cache miss: Repopulating context for new sequence length.",
    "Token generated: Sampling temperature adjusted via top-p nucleus.",
    "Attention mask applied: Masking future tokens for causal decoding.",
    "Logit bias updated: Enhancing factual consistency in output.",
    "Softmax normalization complete: Probability distribution stable.",
    "Context window shifted: Sliding window attention active.",
    "Beam search step: Evaluated top-5 candidate hypotheses.",
    "Flash Attention v2 executed: 4x speedup on attention block."
  ],
  zh: [
    "KV 缓存未命中：正在为新序列长度重新填充上下文。",
    "Token 已生成：通过 top-p nucleus 调整采样温度。",
    "注意力掩码已应用：为因果解码屏蔽未来 Token。",
    "Logit 偏差已更新：增强输出的事实一致性。",
    "Softmax 归一化完成：概率分布稳定。",
    "上下文窗口移动：滑动窗口注意力激活。",
    "束搜索步骤：评估了前5个候选假设。",
    "Flash Attention v2 执行：注意力块加速 4 倍。"
  ]
};

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

export const getSimulationAnalysis = async (mode: 'TRAINING' | 'INFERENCE', step: number, lang: Language) => {
  const modelName = mode === 'TRAINING' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const systemPrompt = lang === 'zh' 
    ? "你是一个 AI 训练/推理监控系统。请生成一条简短的技术日志（一句话）。" 
    : "You are an AI System Monitor. Generate a one-sentence technical log.";
    
  const taskPrompt = mode === 'TRAINING' 
    ? `Training step ${step} of 70B LLM. Keywords: gradients, backpropagation, AdamW, loss. Return ONLY the log message in ${lang === 'zh' ? 'Chinese' : 'English'}.`
    : `Inference generating token #${step}. Keywords: KV cache, attention, sampling. Return ONLY the log message in ${lang === 'zh' ? 'Chinese' : 'English'}.`;

  try {
    const response: GenerateContentResponse = await retry(() => ai.models.generateContent({
      model: modelName,
      contents: systemPrompt + " " + taskPrompt,
    }));
    return response.text || (lang === 'zh' ? "正在同步神经权重..." : "Synchronizing neural weights...");
  } catch (error: any) {
    console.warn("Gemini API Rate Limited or Error:", error);
    const fallbacks = mode === 'TRAINING' ? TRAINING_FALLBACKS[lang] : INFERENCE_FALLBACKS[lang];
    return fallbacks[step % fallbacks.length];
  }
};

export const getComparisonExpertView = async (isTraining: boolean, lang: Language) => {
  const prompt = lang === 'zh'
    ? `解释大语言模型${isTraining ? '训练' : '推理'}时的 GPU 显存使用主要差异。重点关注${isTraining ? '优化器状态和梯度' : 'KV 缓存和权重'}。请列出 3 个简短的要点（中文）。`
    : `Explain the primary difference in GPU memory usage between LLM ${isTraining ? 'Training' : 'Inference'}. Focus on ${isTraining ? 'Optimizer states and Gradients' : 'KV Cache and weights'}. Keep it to 3 short bullet points.`;
  
  try {
    const response: GenerateContentResponse = await retry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    }));
    return response.text || (lang === 'zh' ? "暂无分析数据。" : "No insights available.");
  } catch (error) {
    if (isTraining) {
      return lang === 'zh'
        ? "• 训练需要大量显存用于存储梯度和优化器状态。\n• 权重+梯度+动量所需的显存通常是纯权重的三倍。\n• 反向传播期间计算利用率通常很高 (90%+)。"
        : "• Training requires massive VRAM for Gradients and Optimizer States.\n• Weights + Gradients + Moments can triple the memory footprint compared to pure weights.\n• High compute utilization (90%+) is typical during backward passes.";
    } else {
      return lang === 'zh'
        ? "• 推理显存主要被模型权重和 KV 缓存占用。\n• 显存使用量随上下文长度增加而扩展（由于存储了键值对）。\n• 计算通常是突发性的，强度低于训练周期。"
        : "• Inference memory is dominated by Model Weights and the KV Cache.\n• Memory usage scales with context length due to stored key-value pairs.\n• Compute is typically bursty and lower intensity than training cycles.";
    }
  }
};
