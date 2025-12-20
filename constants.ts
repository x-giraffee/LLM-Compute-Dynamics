
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

export const TRANSLATIONS = {
  en: {
    appTitle: "LLM Compute Dynamics",
    appDesc: "Observe how Training (Forward + Backward pass) and Inference (Autoregressive Token Generation) differ in hardware utilization and data flow.",
    btnTraining: "Start Training Run",
    btnInference: "Run Inference Task",
    btnPause: "Pause",
    btnResume: "Resume",
    btnStop: "Stop Task",
    
    // Stats
    statTemp: "GPU Temp",
    statTflops: "TFLOPS",
    statStep: "Step",
    statToken: "Token Index",
    statLoss: "Loss Value",
    statTps: "Tokens/Sec",
    statStatus: "Status",
    statusIdle: "IDLE",
    statusPaused: "PAUSED",
    statusActive: "ACTIVE",
    statusReady: "READY",

    // Sections
    secAnalysis: "Architect's Analysis",
    secConsole: "System Console",
    consoleReady: "Ready for simulation...",
    consoleSuccess: "sequence completed successfully.",
    consoleInit: "Initiating sequence...",
    consolePause: "Simulation paused by user.",
    consoleResume: "Simulation resumed.",
    consoleStop: "Task terminated by user.",
    consoleBackToIdle: "Returning to IDLE state.",

    // Footer
    footerTraining: "Training: Optimization Phase",
    footerInference: "Inference: Autoregressive Sampling",
    
    // Vis
    visTitle: "Transformer Engine Visualization",
    visSubtitle: "Architecture: 70B Decoder-Only Transformer | Flash-Attention v2 Enabled",
    pipelineStalled: "PIPELINE STALLED (PAUSED)",
    inputContext: "Input Context Window",
    noInput: "No input data...",
    block: "Block",
    coreEngine: "LLM CORE ENGINE",
    subEngine: "Multi-Head Attention + FFN",
    backprop: "BACKPROPAGATION",
    lossTargets: "Loss / Targets",
    outputSeq: "Output Sequence",
    lossSignal: "Loss Signal",
    lossDesc: "Updates applied to weights via AdamW Optimizer",
    waitingOutput: "Waiting for output...",
    generating: "Generating...",
    legendWeights: "Weights (7B Params)",
    legendActivations: "Activations / Tokens",
    legendGradients: "Gradients",
    
    // Dashboard
    vramUsage: "VRAM Usage",
    computeUtil: "Compute Utilization",
    trainingLossChart: "Training Loss Convergence",
    inferenceTpsChart: "Inference Throughput (TPS)",
    
    // Tips
    tipDefault: "Select a task to begin monitoring the neural fabric.",
  },
  zh: {
    appTitle: "LLM 计算动态模拟",
    appDesc: "观察大模型训练（前向+反向传播）与推理（自回归 Token 生成）在硬件资源占用和数据流向上的差异。",
    btnTraining: "开始训练任务",
    btnInference: "开始推理任务",
    btnPause: "暂停",
    btnResume: "继续",
    btnStop: "结束任务",

    // Stats
    statTemp: "GPU 温度",
    statTflops: "TFLOPS",
    statStep: "训练步数",
    statToken: "Token 索引",
    statLoss: "损失值 (Loss)",
    statTps: "生成速度 (TPS)",
    statStatus: "当前状态",
    statusIdle: "空闲",
    statusPaused: "已暂停",
    statusActive: "运行中",
    statusReady: "就绪",

    // Sections
    secAnalysis: "架构师分析",
    secConsole: "系统控制台",
    consoleReady: "系统就绪，等待指令...",
    consoleSuccess: "序列执行完成。",
    consoleInit: "正在初始化序列...",
    consolePause: "用户已暂停模拟。",
    consoleResume: "模拟已继续。",
    consoleStop: "用户终止了任务。",
    consoleBackToIdle: "正在返回空闲状态。",

    // Footer
    footerTraining: "训练模式: 梯度优化阶段",
    footerInference: "推理模式: 自回归采样阶段",
    
    // Vis
    visTitle: "Transformer 引擎可视化",
    visSubtitle: "架构: 70B Decoder-Only Transformer | 已启用 Flash-Attention v2",
    pipelineStalled: "流水线停滞 (暂停中)",
    inputContext: "输入上下文窗口",
    noInput: "无输入数据...",
    block: "模块",
    coreEngine: "LLM 核心引擎",
    subEngine: "多头注意力机制 + 前馈神经网络",
    backprop: "反向传播",
    lossTargets: "损失 / 目标",
    outputSeq: "输出序列",
    lossSignal: "损失信号",
    lossDesc: "通过 AdamW 优化器更新权重",
    waitingOutput: "等待输出...",
    generating: "生成中...",
    legendWeights: "权重 (7B 参数)",
    legendActivations: "激活值 / Tokens",
    legendGradients: "梯度",
    
    // Dashboard
    vramUsage: "显存使用率 (VRAM)",
    computeUtil: "算力利用率 (Compute)",
    trainingLossChart: "训练损失收敛曲线",
    inferenceTpsChart: "推理吞吐量 (TPS)",
    
    // Tips
    tipDefault: "请选择一个任务以开始监控神经网络架构。",
  }
};
