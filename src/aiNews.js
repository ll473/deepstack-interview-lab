export const aiNewsUpdatedAt = '2026-08-18';

// audience 字段是对公开技术社区讨论的定性归纳，不代表科学民调。
export const aiNews = [
  {
    id: 'a2a-aaif-20260817', rank: 1, category: 'Agent / 标准', date: '2026-08-17', heat: '高热',
    title: 'A2A 协议进入 Agentic AI Foundation，Agent 互操作走向中立治理',
    source: 'Axios', sourceUrl: 'https://www.axios.com/2026/08/17/a2a-agentic-ai-foundation-open-ai-standards',
    summary: 'Google 发起的 Agent2Agent（A2A）协议转入 Agentic AI Foundation，目标是推动不同平台与厂商之间的 Agent 互操作。A2A 关注 Agent 间协作，MCP 更偏向工具与数据连接，两者形成互补。',
    analysis: '对企业架构最实际的价值是减少点对点适配，但协议标准化不等于业务语义标准化。身份传递、授权、版本兼容、任务状态与可观测性仍需工程团队在协议之上补齐。',
    audience: { tone: '期待中带谨慎', summary: '公开讨论普遍认可开放标准能降低锁定，但也担心协议重叠、实现碎片化和“标准先于可靠产品”。', evidenceUrl: 'https://news.ycombinator.com/item?id=45607117' }
  },
  {
    id: 'claude-watermark-20260814', rank: 2, category: '模型 / 合规', date: '2026-08-14', heat: '争议',
    title: 'Anthropic 公开 Claude 文本水印方案，透明度与写作隐私争议升温',
    source: 'Anthropic', sourceUrl: 'https://www.anthropic.com/news/claude-text-watermark',
    summary: 'Claude 将使用基于 SynthID-Text 的机器可读标记，通过生成时的词语选择模式嵌入统计信号，以满足欧盟 AI 法案相关透明度要求。',
    analysis: '文本水印更适合来源提示而不是“作者判定”。短文本、改写、翻译和再次生成都会影响检测；检测链路如何保护未公开文稿与代码，也会成为落地成败的关键。',
    audience: { tone: '质疑偏多', summary: '技术社区主要担心写作质量、可移除性、误判，以及把全文提交给检测服务带来的隐私风险；支持者则认为统一标记有助于内容透明。', evidenceUrl: 'https://news.ycombinator.com/item?id=49324087' }
  },
  {
    id: 'enterprise-agent-shift-20260812', rank: 3, category: '产业 / Agent', date: '2026-08-12', heat: '高热',
    title: '企业 AI 从“辅助回答”转向“执行工作”，Agent 使用差距快速拉大',
    source: 'OpenAI', sourceUrl: 'https://openai.com/index/how-enterprises-put-ai-to-work/',
    summary: 'OpenAI 发布两项企业研究，称领先企业正更频繁地使用能连接上下文、工具和流程的 Agent；报告以使用数据描述了企业采用深度和岗位扩散。',
    analysis: '这类数据说明竞争重点正从单次模型能力转向组织级落地：权限、工具连接、复用工作流、人员培训和质量治理。需要注意样本来自平台客户，不能直接外推到全部企业。',
    audience: { tone: '务实乐观', summary: '讨论焦点从“模型是否聪明”转到“是否真正节省时间、谁来复核、怎样衡量单位成功成本”，对可执行价值期待更高。', evidenceUrl: 'https://www.reddit.com/r/artificial/' }
  },
  {
    id: 'biology-safeguard-20260807', rank: 4, category: '安全 / 产品', date: '2026-08-07', heat: '关注',
    title: 'Anthropic 调整生物安全防护，称相关降级误触减少约 85%',
    source: 'Anthropic', sourceUrl: 'https://www.anthropic.com/news/improving-fable-5-s-biology-safeguards',
    summary: 'Anthropic 更新 Claude Fable 5 的生物领域安全机制，目标是在保持防护的同时减少正常查询被切换到较弱模型的情况。',
    analysis: '安全产品的真实难点不是“开或关”，而是按风险分层并做好校准。面试中应能讨论误报、漏报、困难负样本、灰度门禁、申诉和事件回归。',
    audience: { tone: '欢迎但要求证据', summary: '用户欢迎减少误拦截，但更关心测量口径、漏报是否上升，以及高风险请求在边界情况下如何处置。', evidenceUrl: 'https://www.anthropic.com/news/improving-fable-5-s-biology-safeguards' }
  },
  {
    id: 'orchard-agent-framework-20260803', rank: 5, category: '研究 / Agent', date: '2026-08-03', heat: '技术热',
    title: 'Microsoft Research 开源 Orchard，聚焦可规模化 Agent 训练与评估环境',
    source: 'Microsoft Research', sourceUrl: 'https://www.microsoft.com/en-us/research/blog/orchard-an-open-framework-for-scalable-agentic-ai/',
    summary: 'Orchard 提供可复用、隔离的环境服务，用于跨任务收集数据、强化学习 rollout 与 Agent 评估，强调用统一基础设施降低实验复杂度。',
    analysis: 'Agent 训练越来越像分布式系统工程：环境重置、状态隔离、并行调度、可重复回放与成本治理，往往比单纯更换模型更决定实验效率。',
    audience: { tone: '开发者积极', summary: '工程社区对可复用环境和较小模型训练价值感兴趣，同时会关注部署复杂度、基准是否贴近生产，以及维护环境的真实成本。', evidenceUrl: 'https://www.microsoft.com/en-us/research/blog/orchard-an-open-framework-for-scalable-agentic-ai/' }
  },
  {
    id: 'gpt56-price-20260730', rank: 6, category: '模型 / 成本', date: '2026-07-30', heat: '高热',
    title: 'GPT-5.6 Luna 与 Terra 降价，模型竞争进一步转向单位任务成本',
    source: 'OpenAI', sourceUrl: 'https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/',
    summary: 'OpenAI 宣布 GPT-5.6 Luna 价格降低 80%，Terra 降低 20%，将更低推理成本扩展到高吞吐工作负载。',
    analysis: '价格下降会加快 Agent 和批处理任务渗透，但企业仍应以单位成功成本评估：质量、输出长度、重试、工具调用、延迟和路由策略都可能改变最终账单。',
    audience: { tone: '兴奋且分化', summary: '部分开发者认为价格性能跃迁非常明显；也有人报告特定任务上并未优于旧模型，强调必须用自身数据做回放和灰度。', evidenceUrl: 'https://news.ycombinator.com/item?id=49112867' }
  }
];
