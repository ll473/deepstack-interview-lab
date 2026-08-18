export const aiAppNewsUpdatedAt = '2026-08-18';

// 重点应用只收录已经可用、进入预览或明确公布上线节奏的产品能力。
export const aiAppNews = [
  {
    id: 'copilot-weekly-20260810', date: '2026-08-13', category: '开发工具', badge: '本周可用',
    title: 'GitHub Copilot 一周更新：模型、插件与 Agent 工作流集中升级',
    source: 'GitHub Changelog', sourceUrl: 'https://github.blog/changelog/2026-08-13-github-copilot-weekly-releases-august-10/',
    summary: 'GitHub 汇总 Copilot 在编辑器、命令行和 Copilot App 中的新模型、可移植插件与 Agent 工作流改进，重点是让同一套能力跨开发入口复用。',
    whyUse: '适合已经在 GitHub 上协作的研发团队，用一篇官方汇总快速判断哪些新能力值得启用和试点。',
    audience: '开发者、技术负责人、研发效能团队', availability: '按 Copilot 套餐与客户端逐步开放'
  },
  {
    id: 'copilot-agent-plugins-20260812', date: '2026-08-12', category: 'Agent 工具', badge: '正式可用',
    title: 'Agent Plugins 1.0 打通 VS Code、Copilot CLI、SDK 与 Copilot App',
    source: 'GitHub Changelog', sourceUrl: 'https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app/',
    summary: 'Agent 插件可把 Skill 与 MCP Server 打包在一起，在多个 Copilot 客户端共享，减少为不同 Agent 重复维护清单和目录结构。',
    whyUse: '团队可以把部署手册、代码规范和内部工具封装成可移植插件，降低 Agent 能力在不同客户端落地的维护成本。',
    audience: '平台工程、DevOps、Agent 开发者', availability: '所有 Copilot 套餐，具体能力以客户端版本为准'
  },
  {
    id: 'mai-code-flash-20260811', date: '2026-08-11', category: '开发工具', badge: '滚动上线',
    title: 'MAI-Code-1.1-Flash 进入 GitHub Copilot，新增原生图像理解',
    source: 'GitHub Changelog', sourceUrl: 'https://github.blog/changelog/2026-08-11-mai-code-1-1-flash-available-in-github-copilot/',
    summary: '微软的小型代码模型开始进入 Copilot，在编码、指令遵循、工具调用和性能之外加入原生视觉能力，可结合截图理解界面与报错。',
    whyUse: '对需要低延迟补全、从截图定位前端问题或快速处理小任务的开发者更实用。',
    audience: '个人开发者、学生、前端与全栈工程师', availability: 'Free/Student 自动路由；付费套餐可在模型选择器中使用'
  },
  {
    id: 'copilot-weekly-20260803', date: '2026-08-07', category: '开发工具', badge: '已发布',
    title: 'Copilot App、CLI 与 VS Code 增强续接、审查和不中断提问能力',
    source: 'GitHub Changelog', sourceUrl: 'https://github.blog/changelog/2026-08-07-github-copilot-weekly-releases-august-3/',
    summary: '一周更新集中改善任务续接、会话整理、变更审查与旁路提问，目标是在长任务中保留上下文，同时减少切换工具造成的中断。',
    whyUse: '适合把 Copilot 当作持续工作代理而非单次补全工具的人，尤其是跨文件重构和长时间调试。',
    audience: '软件工程师、代码审查者', availability: 'Copilot App、CLI 与新版 VS Code 分端发布'
  },
  {
    id: 'chatgpt-work-20260709', date: '2026-07-09', category: '通用办公', badge: '逐步开放',
    title: 'ChatGPT Work 面向长任务整合本地文件、应用连接与内置浏览器',
    source: 'OpenAI', sourceUrl: 'https://openai.com/index/chatgpt-for-your-most-ambitious-work/',
    summary: 'ChatGPT 的 Work 工作区面向多步骤任务，把文件、连接应用、浏览器与可持续执行的 Agent 体验放进统一界面，并扩展到桌面和移动端。',
    whyUse: '适合研究、材料整理、跨应用汇总和需要多轮推进的知识工作；使用前应检查连接器权限与最终输出。',
    audience: '知识工作者、研究人员、运营与管理者', availability: '网页与移动端逐步开放；桌面端依计划与套餐提供'
  },
  {
    id: 'openai-presence-20260722', date: '2026-07-22', category: '企业应用', badge: '可用',
    title: 'OpenAI Presence 面向企业上线语音与聊天 Agent',
    source: 'OpenAI', sourceUrl: 'https://openai.com/index/introducing-openai-presence/',
    summary: 'Presence 提供面向客户和内部流程的企业级语音、聊天 Agent 能力，强调从上线前评估到运行中监控和上线后治理。',
    whyUse: '适合客服、销售支持和内部服务台等高频流程，但上线前仍需设计转人工、权限、录音告知与质量抽检。',
    audience: '企业 AI 团队、客服与运营负责人', availability: '语音与聊天 Agent 已可用，需联系官方评估'
  },
  {
    id: 'workspace-agents-20260422', date: '2026-04-22', category: '企业应用', badge: '研究预览',
    title: 'ChatGPT Workspace Agents 支持团队创建共享、长时间运行的工作代理',
    source: 'OpenAI', sourceUrl: 'https://openai.com/index/introducing-workspace-agents-in-chatgpt/',
    summary: '团队可以在 ChatGPT 中创建由 Codex 驱动的共享 Agent，连接组织工具、按权限执行多步骤工作，并在云端持续运行。',
    whyUse: '适合报告生成、跨系统资料收集、消息处理等可标准化流程；先从低风险、可复核任务开始更稳妥。',
    audience: 'ChatGPT Business、Enterprise、Edu 与 Teachers 团队', availability: '研究预览'
  },
  {
    id: 'claude-opus5-20260724', date: '2026-07-24', category: '模型应用', badge: '已上线',
    title: 'Claude Opus 5 上线，主打长时间编码与知识工作',
    source: 'Anthropic', sourceUrl: 'https://www.anthropic.com/news/claude-opus-5',
    summary: 'Anthropic 将 Opus 5 定位为更主动的高端模型，面向多步骤编码、复杂知识任务与 Agent 执行，并提供更高速度的 Fast 模式。',
    whyUse: '适合对任务连续性和复杂代码库理解要求高的场景；实际选型应把准确率、耗时和总成本一起做回放测试。',
    audience: '高级开发者、研究与专业服务团队', availability: 'Claude 全平台与 API 可用'
  },
  {
    id: 'claude-design-20260417', date: '2026-04-17', category: '创作工具', badge: 'Labs 产品',
    title: 'Claude Design 支持协作生成设计、原型、演示文稿与单页材料',
    source: 'Anthropic', sourceUrl: 'https://www.anthropic.com/news/claude-design-anthropic-labs',
    summary: 'Claude Design 是 Anthropic Labs 的视觉工作产品，面向设计稿、交互原型、演示文稿和 one-pager 等可交付内容。',
    whyUse: '适合从文字 brief 快速得到第一版视觉方案，再由设计或业务人员调整结构、品牌规范与细节。',
    audience: '产品经理、设计师、市场与创业团队', availability: '以 Anthropic Labs 页面开放范围为准'
  },
  {
    id: 'claude-sonnet5-20260630', date: '2026-06-30', category: '模型应用', badge: '已上线',
    title: 'Claude Sonnet 5 面向规模化编码、Agent 与专业工作',
    source: 'Anthropic', sourceUrl: 'https://www.anthropic.com/news/claude-sonnet-5',
    summary: 'Sonnet 5 聚焦编码、Agent 和专业知识工作的性价比，在持续工具调用、调试与复杂上下文中提供更强执行层。',
    whyUse: '适合高并发 Agent 与日常开发工作流；应按自己的成功率、重试次数和工具调用成本做模型路由。',
    audience: 'Agent 开发者、研发团队、企业知识工作者', availability: 'Claude 产品与 API 可用'
  },
  {
    id: 'copilot-agent-metrics-20260807', date: '2026-08-07', category: '团队管理', badge: 'API 更新',
    title: 'Copilot 使用指标 API 新增 Claude、Codex 等 Agent App 活动',
    source: 'GitHub Changelog', sourceUrl: 'https://github.blog/changelog/2026-08-07-copilot-usage-metrics-api-adds-agent-app-activity/',
    summary: '企业和组织的 Copilot 指标可以按 Agent App 拆分活动，覆盖企业、组织及用户维度的一日和 28 日报告。',
    whyUse: '研发管理者可以区分不同 Agent 的真实采用情况，结合 PR 质量、周期和返工量评估，而不是只看调用次数。',
    audience: '工程管理者、平台团队、FinOps', availability: 'Copilot usage metrics API'
  },
  {
    id: 'chatgpt-small-business-20260721', date: '2026-07-21', category: '通用办公', badge: '已启动',
    title: 'ChatGPT 小企业计划聚焦可直接复用的运营与自动化场景',
    source: 'OpenAI', sourceUrl: 'https://openai.com/index/introducing-chatgpt-small-business-program/',
    summary: 'OpenAI 面向小企业推出培训与实践计划，示例覆盖把语音笔记整理成团队消息、自动化日常工作和补齐无人负责的运营任务。',
    whyUse: '适合人员精简的小团队从高频、低风险、可复核的流程开始建立 AI 使用习惯。',
    audience: '创业者、小企业与非营利组织', availability: '项目与相关活动已开放，功能依 ChatGPT 套餐'
  }
];
