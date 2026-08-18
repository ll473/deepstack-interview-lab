'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, BookOpen, BrainCircuit, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Clock3, Database, Eye, EyeOff, History,
  Layers3, Lightbulb, LockKeyhole, RotateCcw, Search, ServerCog,
  Sparkles, Target, Trash2, X, Plus, GraduationCap, BookMarked,
  FolderOpen, Settings2, Cloud, LogIn, Newspaper
} from 'lucide-react';
import { recordedQuestions } from './recordedQuestions';
import { harnessQuestions } from './harnessQuestions';
import { aiHotQuestions } from './aiHotQuestions';
import QuestionImporter from './QuestionImporter';
import FolderManager from './FolderManager';
import NewsBoard from './NewsBoard';
import AuthPanel from './AuthPanel';
import useCloudSync from './useCloudSync';

const baseQuestions = [
  {id:1,cat:'RAG',level:'基础',q:'请完整描述一个企业级 RAG 系统从文档入库到生成答案的链路。',hint:'按离线索引、在线检索、生成与评估四段展开。',answer:['入库：解析与清洗文档，按语义/结构切分，补充来源、权限、时间等元数据。','索引：用统一版本的 Embedding 生成向量，同时建立关键词索引，写入向量库。','查询：改写或分解问题，混合检索召回候选，用 Reranker 精排并进行权限过滤。','生成：将高相关上下文与引用注入 Prompt；低置信度时拒答或澄清。','评估：分别监控召回率、排序指标、忠实度、答案质量、延迟与成本。'],keys:['混合检索','Reranker','权限过滤','引用','可观测性']},
  {id:2,cat:'RAG',level:'进阶',q:'RAG 中召回结果“看似相关但无法回答问题”，你会如何定位和优化？',hint:'不要只说调 top_k，要区分召回、排序和上下文构造。',answer:['建立带标准答案和相关文档标注的离线评测集，先计算 Recall@K、MRR、NDCG。','检查 chunk 是否丢失标题、表格结构或跨段信息；尝试父子分块、滑动窗口或按章节切分。','混合稀疏与稠密检索，加入查询改写、多路召回和领域 Reranker。','分析失败样本是召回缺失、排序错误还是生成忽略上下文，再针对单点迭代。'],keys:['失败样本','Recall@K','父子分块','多路召回','精排']},
  {id:3,cat:'RAG',level:'进阶',q:'如何实现企业知识库的文档级与段落级权限隔离？',hint:'考虑索引、检索、缓存、日志四个位置。',answer:['文档入库时把租户、部门、用户组与 ACL 写入不可伪造的元数据。','检索阶段从可信身份系统获取权限条件，在向量/关键词查询中前置过滤，不能只在生成后过滤。','缓存键必须包含租户和权限版本，避免跨用户命中；权限变更时主动失效。','引用、日志和离线评测数据也应脱敏并按租户隔离；关键操作保留审计轨迹。'],keys:['ACL','前置过滤','缓存隔离','审计','最小权限']},
  {id:4,cat:'RAG',level:'高级',q:'多跳问题在普通 RAG 中为什么容易失败？你会怎样设计检索流程？',hint:'想想一个问题需要从两个文档各拿一条事实。',answer:['单次向量召回往往只覆盖问题中的一个实体或关系，且第二跳查询词尚未出现。','让模型先做任务分解，按子问题检索；用首跳证据生成第二跳查询，再聚合与去重证据。','为事实建立实体/关系索引，必要时结合知识图谱；在每一步记录来源和置信度。','设置最大跳数、证据充足性判断与循环终止条件，防止成本和错误传播失控。'],keys:['问题分解','迭代检索','证据聚合','终止条件']},
  {id:5,cat:'RAG',level:'基础',q:'Embedding 模型与 Reranker 各自解决什么问题？为什么常常组合使用？',hint:'一个负责大规模召回，一个负责小规模精排。',answer:['Embedding 把查询和文档映射到向量空间，适合从海量数据中快速近似召回。','Cross-Encoder Reranker 联合编码 query-document，交互更充分，排序更准但计算成本高。','工程上先用向量/关键词召回几十到几百条，再用 Reranker 选出少量上下文，兼顾延迟与准确率。'],keys:['双塔','Cross-Encoder','召回','精排','成本']},
  {id:6,cat:'RAG',level:'高级',q:'知识库频繁更新时，如何保证索引的一致性与可回滚？',hint:'从版本、事件、幂等和切换机制回答。',answer:['为文档、解析产物、Embedding 模型与索引建立显式版本；写入任务使用稳定幂等键。','采用事件驱动增量更新，并用 outbox/CDC 避免业务库已提交但索引事件丢失。','构建新索引后做完整性与质量校验，再通过别名原子切换；保留上一版本以快速回滚。','删除使用 tombstone 并异步清理，定期对账业务源与索引中的数量和校验和。'],keys:['版本化','幂等','CDC','索引别名','对账']},

  {id:7,cat:'Agent',level:'基础',q:'什么场景适合使用 Agent，什么场景用固定工作流更合适？',hint:'从任务确定性、工具数量和可控性比较。',answer:['目标开放、步骤需动态规划、工具选择依赖中间结果时适合 Agent。','步骤稳定、合规要求高、错误代价大、吞吐与延迟敏感时应优先固定工作流。','生产实践可采用“工作流骨架 + 局部 Agent”：限制工具、步数、预算和可写操作。'],keys:['开放目标','确定性','工作流骨架','边界']},
  {id:8,cat:'Agent',level:'进阶',q:'如何避免 Agent 陷入无限循环或反复调用同一工具？',hint:'从状态、预算和终止条件回答。',answer:['在状态中记录工具名、参数摘要和观测结果，对重复轨迹做检测。','设置最大步数、总 token、总时长和每类工具预算。','定义成功、无进展、不可恢复错误等明确终止条件；连续无新信息时停止并总结。','工具返回结构化错误和可重试标识，重试采用退避并限制次数。'],keys:['轨迹检测','预算','终止条件','重试上限']},
  {id:9,cat:'Agent',level:'高级',q:'有写操作的 Agent 上线前，需要哪些安全设计？',hint:'重点是权限、确认、隔离和审计。',answer:['工具按最小权限拆分读写能力，使用短期凭证和细粒度资源作用域。','外部发送、删除、支付等不可逆动作必须展示精确预览并获得人工确认。','Prompt 与工具输出视为不可信输入，防提示注入；在沙箱中限制网络和文件访问。','所有规划、调用参数、结果与审批形成不可篡改审计记录，支持幂等和补偿。'],keys:['最小权限','人工确认','提示注入','沙箱','审计']},
  {id:10,cat:'Agent',level:'进阶',q:'如何评估一个 Agent 系统，而不只看最终答案是否正确？',hint:'同时看任务、过程、成本和安全。',answer:['任务层：成功率、部分完成率、人工接管率和用户满意度。','过程层：工具选择正确率、参数准确率、无效步骤率、恢复能力和轨迹一致性。','效率层：端到端延迟、token、工具调用数与单位成功成本。','安全层：越权率、危险动作拦截率、提示注入成功率；结合离线回放与线上灰度。'],keys:['任务成功率','轨迹','单位成功成本','安全评测']},
  {id:11,cat:'Agent',level:'高级',q:'多 Agent 系统中如何设计状态共享与任务协调？',hint:'避免“所有 Agent 共享全部上下文”。',answer:['由协调器维护任务图、负责人、依赖和状态机，Agent 只读取完成子任务所需的最小上下文。','共享结构化工件和事件，而不是无限增长的聊天记录；写入采用版本号或 compare-and-set 防冲突。','为每个子任务定义输入输出契约、超时、重试和取消语义。','最终由单一汇总者校验冲突、来源和完成条件。'],keys:['任务图','最小上下文','结构化工件','并发控制']},
  {id:12,cat:'Agent',level:'基础',q:'Function Calling 与普通文本输出相比有什么优势和局限？',hint:'结构化不等于正确。',answer:['优势是参数有 Schema 约束、便于程序校验与路由，减少脆弱的文本解析。','模型仍可能选错工具或提供语义错误的合法参数，因此必须做业务校验和权限检查。','工具异常、超时、幂等、重试与结果裁剪仍需由应用层处理。'],keys:['Schema','业务校验','权限','幂等']},

  {id:13,cat:'模型工程',level:'基础',q:'LoRA/QLoRA 相比全参数微调的核心优势是什么？',hint:'从可训练参数、显存和部署回答。',answer:['LoRA 冻结基座，仅学习低秩增量矩阵，显著减少可训练参数、显存和检查点体积。','QLoRA 再把基座以低比特量化加载，在消费级或较小 GPU 上也能微调大模型。','局限是能力受数据与秩限制，部署时需合并权重或管理多个 Adapter，且量化会引入精度和算子兼容问题。'],keys:['低秩','冻结基座','量化','Adapter']},
  {id:14,cat:'模型工程',level:'进阶',q:'大模型推理服务中，Continuous Batching 为什么能提高吞吐？',hint:'不同请求生成长度不同，静态批处理会发生什么？',answer:['静态 batch 必须等待最长序列完成，已结束请求占用空槽。','Continuous Batching 在每个解码步动态加入新请求、移除已完成请求，提高 GPU 利用率。','需要调度器在吞吐、首 token 延迟、尾延迟和公平性间权衡，并配合 KV Cache 管理。'],keys:['动态调度','GPU 利用率','首 token','KV Cache']},
  {id:15,cat:'模型工程',level:'进阶',q:'模型服务出现 OOM，你会按照什么顺序定位？',hint:'区分模型权重、KV Cache、临时张量和内存碎片。',answer:['先关联请求并发、输入/输出长度、batch 大小和模型版本，复现峰值。','拆分显存：权重、KV Cache、激活/临时张量与碎片；查看 allocator 指标而非只看总量。','通过限制最大上下文和并发、分页 KV Cache、量化、张量并行或 CPU offload 缓解。','设置准入控制与内存水位，避免靠失败重试放大雪崩。'],keys:['显存分解','KV Cache','准入控制','量化']},
  {id:16,cat:'模型工程',level:'高级',q:'如何为在线大模型服务设计降级与容灾？',hint:'从入口、模型层、跨区与数据面展开。',answer:['入口进行限流、排队、超时和请求预算控制，优先保护核心流量。','模型层可降级到更小模型、更短上下文、关闭非必要 Rerank/Agent 步骤或返回检索结果。','多副本跨故障域部署，健康检查结合真实推理探针；熔断异常后端并做受控重试。','Prompt、模型和索引版本可快速回滚，缓存与请求幂等避免切换时重复副作用。'],keys:['限流','模型降级','故障域','熔断','回滚']},
  {id:17,cat:'模型工程',level:'基础',q:'量化为什么能加速大模型推理？它一定会更快吗？',hint:'考虑内存带宽、计算单元和算子支持。',answer:['低比特权重减小模型体积与显存访问量；LLM 解码常受内存带宽限制，因此可能显著提速。','是否更快取决于硬件原生指令、量化 kernel、反量化开销、batch 大小和框架支持。','需要同时评估精度、吞吐、首 token/单 token 延迟和实际并发，不能只看模型文件大小。'],keys:['内存带宽','Kernel','反量化','基准测试']},
  {id:18,cat:'模型工程',level:'高级',q:'如何做到大模型版本的灰度发布与安全回滚？',hint:'明确版本绑定、流量策略和质量门禁。',answer:['将模型、Tokenizer、Prompt、推理参数和依赖镜像绑定成不可变版本。','先影子流量验证稳定性，再按用户或请求哈希做一致性灰度，逐步扩大流量。','监控错误率、延迟、成本、安全与业务质量指标，触发自动暂停或回滚。','保留旧实例热备；对有状态会话固定版本，避免对话中途漂移。'],keys:['不可变版本','影子流量','一致性灰度','质量门禁']},

  {id:19,cat:'Go',level:'基础',q:'Go 的 goroutine 与操作系统线程有什么区别？',hint:'从调度模型、栈和切换成本回答。',answer:['goroutine 是 Go 运行时管理的轻量执行单元，初始栈小且可增长；线程由操作系统调度，创建与切换更重。','Go 使用 G-M-P 调度：G 是 goroutine，M 是线程，P 提供执行 Go 代码所需资源。','阻塞系统调用时运行时可让 P 交给其他 M，提高并发；goroutine 轻量但也不能无限创建。'],keys:['GMP','可增长栈','用户态调度','背压']},
  {id:20,cat:'Go',level:'进阶',q:'Go 中 channel 什么时候会死锁？如何系统定位？',hint:'画出发送、接收、关闭和等待关系。',answer:['无缓冲 channel 缺少同时接收者、缓冲已满仍发送、空 channel 接收、nil channel 操作都会永久阻塞。','重复 close 会 panic；未关闭 channel 上的 range 可能永不退出。','定位时获取 goroutine dump，看阻塞栈与 wait reason；用超时、context 和 race detector 辅助。','从所有者原则设计：创建者负责关闭，明确生命周期并避免用 channel 传递无界压力。'],keys:['阻塞关系','nil channel','goroutine dump','所有者']},
  {id:21,cat:'Go',level:'进阶',q:'context.Context 应该如何使用？常见误用有哪些？',hint:'取消信号与请求范围数据，不是万能参数包。',answer:['Context 作为首个参数沿调用链传递，用于 deadline、取消和少量请求范围元数据。','派生 context 后应调用 cancel 释放资源；阻塞操作需 select 监听 Done。','不要把 Context 存入结构体、不要传 nil、不要放业务可选参数或大对象，也不要在库中随意改用 Background 切断取消链。'],keys:['首参数','取消传播','defer cancel','请求元数据']},
  {id:22,cat:'Go',level:'高级',q:'高并发 Go 服务发生 goroutine 泄漏，你会怎样发现和修复？',hint:'看数量趋势、栈聚类和生命周期闭环。',answer:['监控 runtime.NumGoroutine 与 pprof goroutine profile，按相同阻塞栈聚类并关联流量。','常见原因是无接收者的 channel、无超时网络调用、ticker 未 Stop、worker 等不到退出、生产者快于消费者。','让每个 goroutine 有明确所有者与退出条件，传播 context，关闭资源并使用有界队列。','修复后做压力与取消场景测试，比较 goroutine 数是否回落到基线。'],keys:['pprof','阻塞栈','退出条件','有界队列']},
  {id:23,cat:'Go',level:'基础',q:'defer 的执行顺序和参数求值时机是什么？',hint:'LIFO；注册时求值。',answer:['defer 按后进先出执行，函数 return 后、真正返回调用者前运行。','defer 的函数值和显式参数在注册时求值；闭包捕获变量则在实际执行时读取。','它适合释放锁、文件和 span，但循环中大量 defer 可能延迟释放并增加开销。'],keys:['LIFO','注册时求值','闭包捕获','资源释放']},
  {id:24,cat:'Go',level:'高级',q:'Go 服务 CPU 飙高但 QPS 没增长，如何排查？',hint:'先确认范围，再用 profile 找热点。',answer:['确认是单实例还是全局、用户 CPU 还是系统 CPU，并关联发布、GC、重试与依赖异常。','抓取同时间窗口的 CPU profile，用 top/list/flame graph 找热点；结合 goroutine、mutex、block profile。','检查忙循环、正则/JSON 热点、锁竞争后的自旋、日志爆量、压缩加密和 GC 压力。','用可复现基准验证修复，避免仅凭采样图直觉下结论。'],keys:['CPU profile','火焰图','锁竞争','GC','基准']},

  {id:25,cat:'数据库',level:'基础',q:'MySQL B+ 树索引为什么适合范围查询？',hint:'内部节点、叶子节点和磁盘访问。',answer:['B+ 树分支因子高、树高低，适合减少磁盘随机 I/O；内部节点只保存键和指针。','所有记录或主键位于有序叶子节点，叶子之间相连，定位起点后可顺序扫描范围。','复合索引仍需遵守最左前缀；回表成本和选择性决定索引是否真正划算。'],keys:['高分支','叶子链表','顺序扫描','最左前缀']},
  {id:26,cat:'数据库',level:'进阶',q:'什么是 MVCC？它如何支持一致性读？',hint:'版本、快照和可见性规则。',answer:['MVCC 为记录保留版本信息，事务通过快照和可见性规则读取合适版本，减少读写互斥。','以 InnoDB 为例，隐藏事务 ID、回滚指针与 undo log 可重建旧版本；Read View 决定版本是否可见。','不同隔离级别创建 Read View 的时机不同；当前读仍可能加锁，MVCC 也不能消除所有并发异常。'],keys:['Read View','undo log','版本链','快照读']},
  {id:27,cat:'数据库',level:'进阶',q:'Redis 缓存穿透、击穿、雪崩分别是什么？怎么治理？',hint:'空数据、热点 key、大量 key。',answer:['穿透：查询不存在数据绕过缓存；可缓存空值、布隆过滤，并限制恶意请求。','击穿：热点 key 失效瞬间大量回源；用互斥重建、逻辑过期、预热和单飞。','雪崩：大量 key 同时过期或缓存集群不可用；过期时间加抖动、多级缓存、限流降级与高可用。','治理需防止重试放大，并监控命中率、回源量和重建耗时。'],keys:['空值','布隆过滤器','Singleflight','过期抖动']},
  {id:28,cat:'数据库',level:'高级',q:'如何解决数据库与缓存双写不一致？',hint:'先明确一致性目标，再谈模式。',answer:['常见读多写少场景用 Cache Aside：更新数据库后删除缓存，读 miss 再回填。','短暂不一致仍可能发生；可用延迟双删、按 key 串行、版本号/CAS 或 binlog CDC 异步失效增强。','消息必须幂等、可重试、有死信和对账；缓存值携带版本可阻止旧数据覆盖新数据。','强一致要求高时应避免把缓存当独立真相源，或在事务边界内使用专门方案。'],keys:['Cache Aside','CDC','幂等','版本号','对账']},
  {id:29,cat:'数据库',level:'高级',q:'一条 SQL 突然变慢，排查路径是什么？',hint:'计划、数据分布、锁与资源。',answer:['先记录 SQL、参数、耗时分位和影响范围，查看慢查询日志及等待事件。','用 EXPLAIN/实际执行计划比较估算与真实行数，检查索引、回表、排序、临时表和统计信息变化。','检查锁等待、连接池、Buffer Pool 命中、磁盘与 CPU，以及近期 Schema/版本变更。','参数分布可能造成计划不稳定；修复后用生产分布回放并持续观察。'],keys:['执行计划','基数估算','锁等待','统计信息']},
  {id:30,cat:'数据库',level:'基础',q:'事务隔离级别解决了哪些并发问题？',hint:'脏读、不可重复读、幻读。',answer:['读未提交可能脏读；读已提交避免脏读，但同一事务两次读取可能不同。','可重复读保证快照内重复读取一致；具体数据库通过 MVCC/锁处理幻读，语义要看实现。','串行化最强但并发代价最大。选择隔离级别应基于业务不变量，并用唯一约束、锁或原子更新补足。'],keys:['脏读','不可重复读','幻读','业务不变量']},

  {id:31,cat:'系统设计',level:'基础',q:'设计一个接口限流器，你会选择什么算法？',hint:'比较固定窗口、滑动窗口、漏桶和令牌桶。',answer:['固定窗口简单但边界突刺明显；滑动窗口更平滑但状态与计算更复杂。','漏桶按固定速率流出，适合整形；令牌桶允许受控突发，更常用于 API 限流。','分布式实现可用 Redis + Lua 保证原子性，key 按租户/用户/接口组合，并考虑时钟、热点和降级。','返回明确的 429 与 Retry-After，监控被限流率并区分保护性限流和容量不足。'],keys:['令牌桶','突发','Lua 原子性','429']},
  {id:32,cat:'系统设计',level:'进阶',q:'消息队列如何做到“至少一次”投递下的业务幂等？',hint:'消息不会天然只来一次。',answer:['为业务事件定义稳定唯一 ID，在消费者侧建立幂等记录或将业务状态机设计成幂等转换。','幂等判断与业务写入应在同一事务中；先 ack 后提交会丢，先提交后 ack 可能重复。','调用外部系统时传递幂等键；重试采用退避与死信，并建设人工重放和对账能力。'],keys:['唯一事件 ID','本地事务','ack 时机','死信','对账']},
  {id:33,cat:'系统设计',level:'高级',q:'设计一个支持百万级文档的企业问答平台，你会如何拆分架构？',hint:'把同步查询面与异步数据面分开。',answer:['数据面：对象存储、解析/OCR、切分、Embedding、索引构建，以消息队列驱动可重试流水线。','查询面：认证与权限、Query 理解、混合检索、精排、Prompt 编排、模型网关和流式输出。','平台面：租户隔离、配额、版本管理、评测集、Tracing、成本与质量监控。','按瓶颈独立扩缩容；索引以版本/别名原子切换，关键任务幂等并支持对账和回滚。'],keys:['数据面','查询面','租户隔离','独立扩缩容','版本切换']},
  {id:34,cat:'系统设计',level:'进阶',q:'服务超时、重试、熔断三者应如何配合？',hint:'先有总预算，再分配每跳超时。',answer:['客户端先设置端到端 deadline，各下游超时必须小于剩余预算。','只对瞬时且幂等错误重试，次数有限、指数退避加抖动，并设置重试预算防放大。','连续失败超过阈值时熔断，快速失败或降级；半开状态用少量探测恢复。','服务端传播取消信号，并监控超时来源、重试率与熔断状态。'],keys:['Deadline','重试预算','指数退避','熔断','取消传播']},
  {id:35,cat:'系统设计',level:'基础',q:'为什么微服务中要使用分布式追踪？一次请求如何串起完整链路？',hint:'Trace、Span 与上下文传播。',answer:['日志和指标难以单独还原跨服务请求，Tracing 用同一 Trace 下的多个 Span 表示调用与耗时。','入口创建或接收 trace context，跨 HTTP/MQ 注入并传播；每个组件记录 Span、状态和关键属性。','采样要兼顾成本与错误保留，避免记录敏感内容；将 Trace 与结构化日志、指标 exemplar 关联。'],keys:['Trace','Span','上下文传播','采样','关联']},
  {id:36,cat:'系统设计',level:'高级',q:'跨境电商库存服务如何防止超卖，并兼顾高并发？',hint:'库存真相、预占、幂等和最终对账。',answer:['数据库以条件更新“stock >= n”或版本号 CAS 保证扣减原子性，不能只依赖先查后写。','高并发可在缓存/队列层预扣与削峰，但数据库仍是最终真相；订单使用稳定幂等键。','设计预占—确认—释放状态机，超时订单通过可靠延迟任务释放；各转换必须幂等。','定期对账销售、占用和实物库存，异常进入补偿队列并告警。'],keys:['条件更新','CAS','预占状态机','幂等','对账']}
];

const builtInQuestions = [
  ...baseQuestions.map(x=>({...x,folderId:'interview-core'})),
  ...recordedQuestions.map(x=>({...x,folderId:'interview-core'})),
  ...harnessQuestions,
  ...aiHotQuestions
];

const defaultFolders = [
  {id:'interview-core',name:'面试题库',system:true},
  {id:'harness-latest',name:'Harness 热点专题',system:true},
  {id:'ai-hot-topics',name:'AI 热点题库',system:true}
];

const categoryMeta = {
  '全部': {icon: Layers3, color:'#d7f96b'},
  'RAG': {icon: Search, color:'#d7f96b'},
  'Agent': {icon: BrainCircuit, color:'#b8a6ff'},
  '模型工程': {icon: ServerCog, color:'#ffb86b'},
  'Go': {icon: Sparkles, color:'#74d8ff'},
  '数据库': {icon: Database, color:'#ff8f9b'},
  '系统设计': {icon: Layers3, color:'#f5dc7b'},
  'Python后端': {icon: ServerCog, color:'#77e1c3'},
  '项目表达': {icon: Target, color:'#ff9fc7'},
  'Harness工程': {icon: BrainCircuit, color:'#9de7ff'}
};
const levels = ['全部','基础','进阶','高级'];
const categories = Object.keys(categoryMeta);
const STORE_KEY = 'deepstack-interview-v1';
const CUSTOM_KEY = 'deepstack-custom-questions-v1';
const FOLDER_KEY = 'deepstack-folder-state-v1';

function fmtDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth()+1}月${d.getDate()}日 ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export default function App({initialUser=null}){
  const [hydrated,setHydrated] = useState(false);
  const [folderState,setFolderState] = useState({custom:[],renames:{},hidden:[]});
  const [customQuestions,setCustomQuestions] = useState([]);
  const folders=useMemo(()=>[
    ...defaultFolders.filter(x=>!folderState.hidden.includes(x.id)).map(x=>({...x,name:folderState.renames[x.id]||x.name})),
    ...folderState.custom.filter(x=>!folderState.hidden.includes(x.id))
  ],[folderState]);
  const questions=useMemo(()=>{const ids=new Set(folders.map(x=>x.id));return [...builtInQuestions,...customQuestions].filter(x=>ids.has(x.folderId||'interview-core'));},[customQuestions,folders]);
  const [folderId,setFolderId] = useState('interview-core');
  const [category,setCategory] = useState('全部');
  const [level,setLevel] = useState('全部');
  const [current,setCurrent] = useState(builtInQuestions[0]);
  const [draft,setDraft] = useState('');
  const [revealed,setRevealed] = useState(false);
  const [hintShown,setHintShown] = useState(false);
  const [submitted,setSubmitted] = useState(false);
  const [mode,setMode] = useState('study');
  const [records,setRecords] = useState([]);
  const [historyOpen,setHistoryOpen] = useState(false);
  const [importOpen,setImportOpen] = useState(false);
  const [folderOpen,setFolderOpen] = useState(false);
  const [historyFilter,setHistoryFilter] = useState('全部');
  const [toast,setToast] = useState('');
  const [startedAt,setStartedAt] = useState(Date.now());
  const [elapsed,setElapsed] = useState(0);
  const [mobileMenu,setMobileMenu] = useState(false);
  const [authOpen,setAuthOpen] = useState(false);
  const textareaRef = useRef(null);

  const cloud=useCloudSync({user:initialUser,hydrated,records,customQuestions,folderState,setRecords,setCustomQuestions,setFolderState});

  useEffect(()=>{
    try { const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'[]'); if(Array.isArray(saved)) setRecords(saved); } catch {}
    try { const saved=JSON.parse(localStorage.getItem(CUSTOM_KEY)||'[]'); if(Array.isArray(saved)) setCustomQuestions(saved.map(x=>({...x,folderId:x.folderId||'interview-core'}))); } catch {}
    try { const saved=JSON.parse(localStorage.getItem(FOLDER_KEY)||'null'); if(saved&&Array.isArray(saved.custom)&&saved.renames&&Array.isArray(saved.hidden)) setFolderState(saved); } catch {}
    setHydrated(true);
  },[]);
  useEffect(()=>{ if(hydrated)localStorage.setItem(STORE_KEY,JSON.stringify(records)); },[records,hydrated]);
  useEffect(()=>{ if(hydrated)localStorage.setItem(CUSTOM_KEY,JSON.stringify(customQuestions)); },[customQuestions,hydrated]);
  useEffect(()=>{ if(hydrated)localStorage.setItem(FOLDER_KEY,JSON.stringify(folderState)); },[folderState,hydrated]);
  useEffect(()=>{if(folders.length&&folderId!=='all'&&!folders.some(x=>x.id===folderId)){const next=folders[0].id;setFolderId(next);const first=questions.find(x=>x.folderId===next);if(first)setCurrent(first);}},[folders,folderId,questions]);
  useEffect(()=>{ const t=setInterval(()=>setElapsed(Math.floor((Date.now()-startedAt)/1000)),1000); return()=>clearInterval(t); },[startedAt]);
  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(''),1800); return()=>clearTimeout(t); },[toast]);

  const scopedQuestions=useMemo(()=>folderId==='all'?questions:questions.filter(x=>x.folderId===folderId),[questions,folderId]);
  const pool=useMemo(()=>scopedQuestions.filter(x=>(category==='全部'||x.cat===category)&&(level==='全部'||x.level===level)),[scopedQuestions,category,level]);
  const folderCounts=useMemo(()=>questions.reduce((out,q)=>{out[q.folderId]=(out[q.folderId]||0)+1;return out},{}),[questions]);
  const stats=useMemo(()=>{
    const unique=new Set(records.map(r=>r.questionId)).size;
    const avg=records.length?Math.round(records.reduce((s,r)=>s+(r.seconds||0),0)/records.length):0;
    return {count:records.length,unique,avg};
  },[records]);
  const filteredRecords=useMemo(()=>historyFilter==='全部'?records:records.filter(r=>r.cat===historyFilter),[records,historyFilter]);

  const pick=(cat=category,lvl=level,fid=folderId)=>{
    const list=questions.filter(x=>(fid==='all'||x.folderId===fid)&&(cat==='全部'||x.cat===cat)&&(lvl==='全部'||x.level===lvl));
    const candidates=list.length>1?list.filter(x=>x.id!==current.id):list;
    const next=candidates[Math.floor(Math.random()*candidates.length)]||questions[0];
    setCurrent(next); setDraft(''); setRevealed(false); setHintShown(false); setSubmitted(false); setStartedAt(Date.now()); setElapsed(0); setMobileMenu(false);
    setTimeout(()=>textareaRef.current?.focus(),80);
  };
  const chooseFolder=(fid)=>{setFolderId(fid);setCategory('全部');setLevel('全部');pick('全部','全部',fid);};
  const chooseCategory=(cat)=>{ setCategory(cat); pick(cat,level,folderId); };
  const chooseLevel=(lvl)=>{ setLevel(lvl); pick(category,lvl,folderId); };
  const saveAnswer=()=>{
    if(!draft.trim()){setToast('先写下你的回答'); textareaRef.current?.focus(); return;}
    const record={id:crypto.randomUUID(),questionId:current.id,q:current.q,cat:current.cat,level:current.level,answer:draft.trim(),createdAt:new Date().toISOString(),seconds:elapsed};
    setRecords(prev=>[record,...prev]); setToast(initialUser?'回答已保存，正在同步':'回答已保存在此浏览器');
  };
  const submitExam=()=>{
    if(!draft.trim()){setToast('考试模式需要先写下回答');textareaRef.current?.focus();return;}
    if(!records.some(r=>r.questionId===current.id&&r.answer===draft.trim()))saveAnswer();
    setSubmitted(true);setRevealed(true);setToast('已交卷，现在对照参考答案复盘');
  };
  const changeMode=(next)=>{setMode(next);setDraft('');setRevealed(false);setHintShown(false);setSubmitted(false);setStartedAt(Date.now());setElapsed(0);};
  const importQuestions=(items)=>{const normalized=items.map(x=>({...x,folderId:x.folderId||(folderId==='all'?'interview-core':folderId)}));setCustomQuestions(prev=>[...normalized,...prev]);setCurrent(normalized[0]);setFolderId(normalized[0].folderId);setCategory(normalized[0].cat);setLevel('全部');setDraft('');setRevealed(false);setHintShown(false);setSubmitted(false);setToast(`已添加 ${items.length} 道题`);};
  const deleteQuestion=(id)=>{setCustomQuestions(prev=>prev.filter(x=>x.id!==id));if(current.id===id){setCurrent(builtInQuestions[0]);setCategory('全部');}};
  const moveQuestion=(id,targetFolder)=>setCustomQuestions(prev=>prev.map(x=>x.id===id?{...x,folderId:targetFolder}:x));
  const createFolder=(name)=>{const id=`folder-${crypto.randomUUID()}`;setFolderState(prev=>({...prev,custom:[...prev.custom,{id,name,system:false}]}));setFolderId(id);setToast('文件夹已新建');};
  const renameFolder=(id,name)=>setFolderState(prev=>defaultFolders.some(x=>x.id===id)?{...prev,renames:{...prev.renames,[id]:name}}:{...prev,custom:prev.custom.map(x=>x.id===id?{...x,name}:x)});
  const deleteFolder=(id)=>{setFolderState(prev=>({...prev,custom:prev.custom.filter(x=>x.id!==id),hidden:[...new Set([...prev.hidden,id])]}));setCustomQuestions(prev=>prev.filter(x=>x.folderId!==id));const next=folders.find(x=>x.id!==id)?.id||'all';chooseFolder(next);setToast('文件夹已删除');};
  const resetAll=()=>{ if(window.confirm('确定清空全部练习记录吗？此操作无法撤销。')){setRecords([]);setToast('练习记录已清空');} };
  const m=Math.floor(elapsed/60), s=elapsed%60;
  const Icon=(categoryMeta[current.cat]||categoryMeta['全部']).icon;
  const accent=(categoryMeta[current.cat]||categoryMeta['全部']).color;
  const activeFolderName=folderId==='all'?'全部文件夹':folders.find(x=>x.id===folderId)?.name||'题库文件夹';

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#practice" aria-label="深栈首页"><span className="brand-mark"><BrainCircuit size={18}/></span><span>深栈</span><em>INTERVIEW LAB</em></a>
      <nav className="main-nav" aria-label="主导航"><a className="active" href="#practice">练习台</a><a href="#news"><Newspaper size={13}/>AI 资讯库</a><button onClick={()=>setHistoryOpen(true)}>练习记录</button><a href="#guide">使用说明</a></nav>
      <div className="top-actions"><button className={`account-button ${initialUser?'signed-in':''}`} onClick={()=>setAuthOpen(true)}>{initialUser?<><Cloud size={15}/><span>{initialUser.displayName}</span></>:<><LogIn size={15}/><span>账号登录</span></>}</button><button className="folder-button" onClick={()=>setFolderOpen(true)}><FolderOpen size={16}/><span>文件夹</span></button><button className="add-question-btn" onClick={()=>setImportOpen(true)}><Plus size={16}/><span>添加题目</span></button><button className="history-btn" onClick={()=>setHistoryOpen(true)}><History size={17}/><span>记录</span><b>{records.length}</b></button></div>
    </header>

    <main>
      <section className="hero" id="practice">
        <div className="eyebrow"><span></span> LLM × BACKEND INTERVIEW PREP</div>
        <h1>把每一次回答，<br/><i>练成真正的理解。</i></h1>
        <p>背题、模拟考试与自建题库一站完成。随机抽题、按需提示，<br className="desktop"/>在表达中发现知识盲区。</p>
        <div className="hero-stats">
          <div><strong>{questions.length}</strong><span>精选题目</span></div><i></i>
          <div><strong>{categories.length-1}</strong><span>核心方向</span></div><i></i>
          <div><strong>{stats.unique}</strong><span>已练题目</span></div>
        </div>
      </section>

      <section className="workspace">
        <aside className={`filters ${mobileMenu?'open':''}`}>
          <div className="filter-head"><span>练习方向</span><button onClick={()=>setMobileMenu(false)}><X size={18}/></button></div>
          <div className="folder-filter"><label><FolderOpen size={15}/>题库文件夹</label><div><select value={folderId} onChange={e=>chooseFolder(e.target.value)}><option value="all">全部文件夹</option>{folders.map(folder=><option key={folder.id} value={folder.id}>{folder.name}（{folderCounts[folder.id]||0}）</option>)}</select><button onClick={()=>setFolderOpen(true)} aria-label="管理文件夹"><Settings2 size={16}/></button></div><small>当前：{activeFolderName}</small></div>
          <div className="category-list">
            {categories.map(cat=>{const C=categoryMeta[cat].icon; const count=cat==='全部'?scopedQuestions.length:scopedQuestions.filter(x=>x.cat===cat).length;if(!count)return null;return <button key={cat} className={category===cat?'selected':''} onClick={()=>chooseCategory(cat)} style={{'--accent':categoryMeta[cat].color}}><span><C size={17}/>{cat}</span><b>{count}</b></button>})}
          </div>
          <div className="level-wrap"><label>难度</label><div className="level-tabs">{levels.map(x=><button className={level===x?'selected':''} onClick={()=>chooseLevel(x)} key={x}>{x}</button>)}</div></div>
          <div className={`privacy-note ${initialUser?'cloud-connected':''}`}>{initialUser?<Cloud size={18}/>:<LockKeyhole size={18}/>}<div><strong>{initialUser?cloud.status:'未登录 · 本机保存'}</strong><p>{initialUser?'个人题库、回答与进度会同步到你的账户。':'登录后可在手机与电脑间同步个人数据。'}</p>{!initialUser&&<button onClick={()=>setAuthOpen(true)}>登录同步</button>}</div></div>
        </aside>

        <article className="practice-card">
          <div className="session-bar"><div><span>{mode==='study'?<BookMarked size={16}/>:<GraduationCap size={16}/>}</span><p><b>{mode==='study'?'背题模式':'考试模式'}</b><small>{mode==='study'?'题目与参考答案直接对照':'思路可按需展开，提交后查看答案'}</small></p></div><div className="mode-switch"><button className={mode==='study'?'selected':''} onClick={()=>changeMode('study')}><BookMarked size={14}/>背题</button><button className={mode==='exam'?'selected':''} onClick={()=>changeMode('exam')}><GraduationCap size={14}/>考试</button></div></div>
          <div className="mobile-filter-row"><button onClick={()=>setMobileMenu(true)}><FolderOpen size={16}/>{activeFolderName}<ChevronDown size={15}/></button><button onClick={()=>setMobileMenu(true)}><Layers3 size={16}/>{category}</button><button onClick={()=>setMobileMenu(true)}>{level}</button></div>
          <div className="question-meta">
            <span className="cat-badge" style={{'--accent':accent}}><Icon size={15}/>{current.cat}</span>
            <span className={`level-badge l-${current.level}`}>{current.level}</span>
            {current.source&&<span className="source-badge">{current.source}</span>}
            {current.updatedAt&&<span className="updated-badge">更新 {current.updatedAt}</span>}
            <span className="question-count">题库 {pool.findIndex(x=>x.id===current.id)+1||1} / {pool.length}</span>
          </div>
          <h2>{current.q}</h2>
          {mode==='exam'&&<><div className={`hint hint-choice ${hintShown?'expanded':''}`}><button onClick={()=>setHintShown(v=>!v)}><Lightbulb size={17}/>{hintShown?'收起思路':'需要思路提醒？'}<ChevronDown size={15}/></button>{hintShown&&<span><b>思考提示</b>{current.hint||'先明确问题目标，再从原理、实现和工程取舍三个层次回答。'}</span>}</div><label className="answer-label" htmlFor="answer"><span>考试作答</span><span><Clock3 size={14}/>{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span></label><textarea ref={textareaRef} id="answer" value={draft} readOnly={submitted} onChange={e=>setDraft(e.target.value)} placeholder="请完整作答，提交后才能查看参考答案……"/><div className="answer-tools"><span>{draft.trim().length} 字</span><div>{submitted?<button className="ghost" onClick={()=>setRevealed(v=>!v)}>{revealed?<><EyeOff size={16}/>收起答案</>:<><Eye size={16}/>再次查看答案</>}</button>:<button className="primary submit-exam" onClick={submitExam}><GraduationCap size={16}/>提交本题</button>}</div></div></>}

          <div className={`reference ${mode==='study'||revealed?'shown':''} ${mode==='study'?'study-reference':''}`} aria-hidden={mode!=='study'&&!revealed}>
            <div className="reference-head"><span><BookOpen size={17}/>{mode==='study'?'参考答案':'参考回答框架'}</span><em>{mode==='study'?'理解后尝试脱离答案复述':'请用自己的语言组织'}</em></div>
            {current.answer?.length?<ol>{current.answer.map((x,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{x}</p></li>)}</ol>:<div className="no-reference">这道自定义题还没有参考答案，可以先写下自己的答题框架。</div>}
            {!!current.keys?.length&&<div className="keywords"><span>关键点</span>{current.keys.map(x=><b key={x}>{x}</b>)}</div>}
          </div>

          <div className="card-footer">
            <p><CircleHelp size={15}/>{mode==='study'?'直接对照答案，理解后再脱离答案复述。':'提交前答案不可见，提交后及时复盘遗漏。'}</p>
            <button onClick={()=>pick()}><RotateCcw size={17}/>{mode==='exam'?'下一道考题':'随机下一题'}<ArrowRight size={17}/></button>
          </div>
        </article>
      </section>

      <NewsBoard/>

      <section className="guide" id="guide">
        <div><span>01</span><h3>选择模式</h3><p>背题直接看答案，考试先答后看解析。</p></div>
        <ArrowRight className="guide-arrow"/>
        <div><span>02</span><h3>按需提示</h3><p>卡住时再展开思路，不提前暴露答案。</p></div>
        <ArrowRight className="guide-arrow"/>
        <div><span>03</span><h3>扩充题库</h3><p>手动添加，或从文件和文本自动识别。</p></div>
      </section>
    </main>

    <footer><div className="brand muted"><span className="brand-mark"><BrainCircuit size={16}/></span><span>深栈</span></div><p>为真正的面试表达而练习</p><span>{initialUser?'个人数据云端同步 · 公开内容':'本机记录 · 公开内容'}</span></footer>

    {historyOpen&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setHistoryOpen(false)}}>
      <section className="history-panel">
        <div className="history-head"><div><span className="section-kicker">PRACTICE ARCHIVE</span><h2>练习记录</h2><p>{initialUser?'已登录，回答会同步到你的其他设备。':'当前保存在本机，登录后可跨设备同步。'}</p></div><button className="icon-btn" onClick={()=>setHistoryOpen(false)}><X/></button></div>
        <div className="record-stats"><div><span>累计回答</span><strong>{stats.count}</strong></div><div><span>不同题目</span><strong>{stats.unique}</strong></div><div><span>平均用时</span><strong>{stats.avg?`${Math.floor(stats.avg/60)}m ${stats.avg%60}s`:'—'}</strong></div></div>
        <div className="history-controls"><div>{categories.map(c=><button key={c} className={historyFilter===c?'selected':''} onClick={()=>setHistoryFilter(c)}>{c}</button>)}</div>{records.length>0&&<button className="clear-btn" onClick={resetAll}><Trash2 size={15}/>清空</button>}</div>
        <div className="record-list">
          {filteredRecords.length===0?<div className="empty-state"><History size={36}/><h3>还没有练习记录</h3><p>写下回答并保存后，会在这里形成你的复盘档案。</p><button onClick={()=>setHistoryOpen(false)}>开始练习</button></div>:
          filteredRecords.map(r=><details key={r.id}><summary><div><span className="record-cat">{r.cat}</span><span className={`mini-level l-${r.level}`}>{r.level}</span><time>{fmtDate(r.createdAt)}</time></div><h3>{r.q}</h3><span className="details-open"><ChevronDown size={18}/></span></summary><div className="record-answer"><span>你的回答</span><p>{r.answer}</p><small><Clock3 size={13}/>{Math.floor((r.seconds||0)/60)}m {(r.seconds||0)%60}s</small></div></details>)}
        </div>
      </section>
    </div>}
    <QuestionImporter open={importOpen} onClose={()=>setImportOpen(false)} onImport={importQuestions} customQuestions={customQuestions} onDelete={deleteQuestion} folders={folders} defaultFolderId={folderId==='all'?'interview-core':folderId} onMove={moveQuestion}/>
    <FolderManager open={folderOpen} onClose={()=>setFolderOpen(false)} folders={folders} counts={folderCounts} activeFolder={folderId} onSelect={chooseFolder} onCreate={createFolder} onRename={renameFolder} onDelete={deleteFolder}/>
    <AuthPanel open={authOpen} onClose={()=>setAuthOpen(false)} user={initialUser} status={cloud.status} lastSyncedAt={cloud.lastSyncedAt}/>
    {toast&&<div className="toast"><Check size={17}/>{toast}</div>}
  </div>
}
