export const githubProjectsUpdatedAt = '2026-08-18';
export const githubProjectsMethod = 'GitHub Trending 日榜 · AI 相关性筛选';

// 首页按 starsToday 降序展示当天增长最快的 AI 项目，而不是按历史总 Star 排名。
// 每日任务会追加新的日榜记录；firstSeen 用于区分今日发现与历史上榜项目。
export const githubProjects = [
  {
    id: 'money-printer-turbo-20260818', rank: 1, name: 'MoneyPrinterTurbo', repo: 'harry0703/MoneyPrinterTurbo',
    stars: 106419, starsToday: 1189, category: 'AI 视频', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '输入主题或关键词，用 AI 工作流一键生成高清短视频。',
    purpose: '自动生成脚本、匹配素材、制作字幕和配乐，并合成短视频。',
    whyTrending: '今日 AI 项目增速第一；把脚本、素材、TTS、字幕和发布串成完整工作流，结果可直接使用。',
    summary: '适合批量生产知识类和营销短视频，既有 WebUI 也有 API 与 CLI；正式使用前应检查素材授权、生成事实和平台内容规范。',
    repoUrl: 'https://github.com/harry0703/MoneyPrinterTurbo'
  },
  {
    id: 'unsloth-20260818', rank: 2, name: 'Unsloth', repo: 'unslothai/unsloth',
    stars: 73278, starsToday: 739, category: '模型训练', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '在本地运行和训练 LLM 与扩散模型的开源界面及工具链。',
    purpose: '降低模型微调、量化、训练与本地运行的显存和使用门槛。',
    whyTrending: '近期模型支持更新带来明显增长，今日新增超过七百 Star，在本地训练类项目中增速突出。',
    summary: '适合希望在有限 GPU 上微调或运行新模型的开发者；使用时仍应核对具体模型、显卡和训练配置的兼容性。',
    repoUrl: 'https://github.com/unslothai/unsloth'
  },
  {
    id: 'needle-20260818', rank: 3, name: 'Needle', repo: 'cactus-compute/needle',
    stars: 7178, starsToday: 660, category: '端侧模型', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '面向手机、可穿戴设备、智能家居和机器人的 14MB 基础模型。',
    purpose: '让小型设备在端侧直接运行轻量智能能力。',
    whyTrending: '单日新增约占总 Star 的显著比例，是今天最值得关注的新增长项目之一。',
    summary: '亮点是极小体积和端侧场景，适合隐私、低延迟或离线设备；实际价值需继续验证任务范围、精度与芯片兼容性。',
    repoUrl: 'https://github.com/cactus-compute/needle'
  },
  {
    id: 'strix-20260818', rank: 4, name: 'Strix', repo: 'usestrix/strix',
    stars: 54338, starsToday: 598, category: 'AI 安全', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '用于发现和修复应用漏洞的开源 AI 渗透测试工具。',
    purpose: '让安全 Agent 执行侦察、验证漏洞并辅助修复。',
    whyTrending: 'AI 安全与自动化渗透测试持续升温，项目今日新增接近六百 Star。',
    summary: '适合授权范围内的安全测试与研发自检；必须设置明确目标、速率限制、凭据隔离和人工审批，不能用于未授权系统。',
    repoUrl: 'https://github.com/usestrix/strix'
  },
  {
    id: 'modlens-20260818', rank: 5, name: 'Modlens', repo: 'liustack/modlens',
    stars: 2848, starsToday: 441, category: 'Harness 插件', language: 'TypeScript', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '为 DeepSeek Harness 和纯文本编码 Agent 提供视觉理解桥接。',
    purpose: '把截图转换为包含 OCR、布局与语义信息的结构化 JSON 证据。',
    whyTrending: '总量尚小但单日新增 441，增长比例很高，正好对应 Harness 工程与多模态 Agent 热点。',
    summary: '可以给缺少视觉能力的编码 Agent 补充界面证据，适合截图调试、UI 还原和视觉验收；需评估 OCR 准确度与隐私处理。',
    repoUrl: 'https://github.com/liustack/modlens'
  },
  {
    id: 'colleague-skill-20260818', rank: 6, name: 'Colleague Skill', repo: 'titanwings/colleague-skill',
    stars: 23174, starsToday: 358, category: 'Agent Skill', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '面向数字生命与人格延续场景的 Agent Skill 项目。',
    purpose: '探索把个人信息、表达方式和记忆组织为可调用 Skill。',
    whyTrending: '数字人格与 Agent Skill 的结合引发集中关注，今日增长超过三百 Star。',
    summary: '概念吸引力很强，但涉及逝者数据、身份表达、授权和情感风险；更适合作为前沿产品与伦理案例观察。',
    repoUrl: 'https://github.com/titanwings/colleague-skill'
  },
  {
    id: 'openviking-20260818', rank: 7, name: 'OpenViking', repo: 'volcengine/OpenViking',
    stars: 28921, starsToday: 239, category: 'Agent 上下文', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '统一 Agent 记忆、知识 RAG 与 Skills 的自演进上下文数据库。',
    purpose: '集中管理 Agent 的长期记忆、知识检索和可调用技能上下文。',
    whyTrending: 'Agent 上下文工程是近期热点，项目以统一记忆、RAG 与 Skill 的定位获得快速增长。',
    summary: '适合研究 Agent 上下文层如何独立于模型演进；落地时要重点验证召回质量、记忆更新、租户隔离和可删除性。',
    repoUrl: 'https://github.com/volcengine/OpenViking'
  },
  {
    id: 'career-ops-20260818', rank: 8, name: 'Career Ops', repo: 'santifer/career-ops',
    stars: 64830, starsToday: 218, category: 'AI 应用', language: 'JavaScript', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '在本地 AI 编码 CLI 中运行的开源求职工作流。',
    purpose: '扫描职位、结构化评分、定制简历并跟踪申请。',
    whyTrending: '把通用编码 Agent 直接变成求职工具，应用场景清晰，今天仍保持两百以上新增。',
    summary: '适合用 Claude Code、Codex 等工具管理求职流程；自动投递前应人工核对岗位事实、简历内容和网站规则。',
    repoUrl: 'https://github.com/santifer/career-ops'
  },
  {
    id: 'ai-memory-20260818', rank: 9, name: 'AI Memory', repo: 'akitaonrails/ai-memory',
    stars: 2196, starsToday: 207, category: 'Agent 记忆', language: 'Rust', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '为编码 Agent CLI 提供长期记忆和跨厂商任务交接。',
    purpose: '在不同编码 Agent 之间保存上下文、决策和工作状态。',
    whyTrending: '项目总体规模较新，但单日新增接近总 Star 的一成，增长速度明显高于成熟项目。',
    summary: '解决切换 Claude、Codex 等工具时上下文丢失的问题，适合长周期开发；需要防止错误记忆和敏感代码被长期保存。',
    repoUrl: 'https://github.com/akitaonrails/ai-memory'
  },
  {
    id: 'anthropic-cybersecurity-skills-20260818', rank: 10, name: 'Anthropic Cybersecurity Skills', repo: 'mukul975/Anthropic-Cybersecurity-Skills',
    stars: 28525, starsToday: 198, category: 'Agent Skill', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '面向多种 AI Agent 平台的结构化网络安全 Skills 集合。',
    purpose: '把威胁建模、检测、响应和合规知识组织为可复用 Skill。',
    whyTrending: 'Agent Skill 标准化与安全工程叠加，覆盖多个安全框架，今日新增接近两百 Star。',
    summary: '适合安全知识检索、流程模板和 Agent 能力扩展；名称不代表 Anthropic 官方仓库，内容仍需按原始框架核验。',
    repoUrl: 'https://github.com/mukul975/Anthropic-Cybersecurity-Skills'
  },
  {
    id: 'llmfit-20260818', rank: 11, name: 'llmfit', repo: 'AlexsJones/llmfit',
    stars: 32380, starsToday: 198, category: '本地模型', language: 'Rust', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '用一个命令判断数百种模型和提供商中哪些适合当前硬件。',
    purpose: '根据机器配置筛选可运行模型并降低本地模型选型成本。',
    whyTrending: '本地模型选择越来越复杂，项目用简单命令解决“我的机器能跑什么”，今天继续快速增长。',
    summary: '适合作为本地模型部署前的初筛工具；最终仍应根据上下文长度、量化版本、并发和真实任务做压测。',
    repoUrl: 'https://github.com/AlexsJones/llmfit'
  },
  {
    id: 'soup-20260818', rank: 12, name: 'Soup', repo: 'MakazhanAlpamys/Soup',
    stars: 2169, starsToday: 172, category: '模型训练', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '用一个 YAML 微调 LLM，并通过分层流式方案降低显存需求。',
    purpose: '让低显存笔记本也能尝试微调较大的语言模型。',
    whyTrending: '总 Star 尚低但今日新增 172，低显存训练的明确价值推动了较高增长比例。',
    summary: '适合教学、个人实验和小数据微调；需要独立验证训练速度、收敛质量和不同硬件下的稳定性。',
    repoUrl: 'https://github.com/MakazhanAlpamys/Soup'
  },
  {
    id: 'qlib-20260818', rank: 13, name: 'Qlib', repo: 'microsoft/qlib',
    stars: 47670, starsToday: 133, category: 'AI 量化', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '面向量化研究与生产的 AI 投资平台。',
    purpose: '支持数据处理、机器学习建模、回测和自动化研究流程。',
    whyTrending: 'AI 研究 Agent 与量化工具结合再次获得关注，项目今日新增超过一百 Star。',
    summary: '适合研究因子、模型和实验流水线，不等于可直接盈利的交易系统；回测偏差、成本和风险控制仍需单独处理。',
    repoUrl: 'https://github.com/microsoft/qlib'
  },
  {
    id: 'defending-code-harness-20260818', rank: 14, name: 'Defending Code Reference Harness', repo: 'anthropics/defending-code-reference-harness',
    stars: 7295, starsToday: 122, category: 'Harness 工程', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '包含威胁建模、扫描、分诊、补丁 Skills 与自主扫描 Harness。',
    purpose: '演示如何让安全 Agent 在受控 Harness 中完成代码防御流程。',
    whyTrending: '来自 Anthropic 官方组织，直接对应 Agent Harness 与代码安全热点，今天新增超过一百 Star。',
    summary: '适合学习如何把安全 Skills、工具和审核环节编排成可重复执行流程，是很好的 Harness 工程参考实现。',
    repoUrl: 'https://github.com/anthropics/defending-code-reference-harness'
  },
  {
    id: 'cli-anything-20260818', rank: 15, name: 'CLI-Anything', repo: 'HKUDS/CLI-Anything',
    stars: 47714, starsToday: 119, category: 'Agent 工具', language: 'Python', firstSeen: '2026-08-18', trendDate: '2026-08-18',
    officialIntro: '把常见软件能力转换成更容易被 Agent 调用的命令行接口。',
    purpose: '通过 CLI Hub 让桌面和专业软件进入 Agent 工具链。',
    whyTrending: '“让所有软件 Agent-native”的目标贴合工具调用热点，今日保持稳定增长。',
    summary: '适合为现有软件补 Agent 接口，核心价值在标准输入输出和可脚本化；落地时仍要处理权限、错误恢复和版本兼容。',
    repoUrl: 'https://github.com/HKUDS/CLI-Anything'
  }
];
