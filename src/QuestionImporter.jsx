'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Check, FileText, PenLine, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';

const questionCategories = ['RAG','Agent','Harness工程','模型工程','Go','数据库','系统设计','Python后端','项目表达'];
const levels = ['基础','进阶','高级'];

function inferCategory(text) {
  const value = text.toLowerCase();
  const rules = [
    ['Harness工程', /harness|脚手架工程|agent legibility|context reset|evaluation harness/],
    ['RAG', /rag|检索|召回|向量|embedding|rerank|分块|chunk|知识库/],
    ['Agent', /agent|智能体|function.?calling|工具调用|cypher|提示注入/],
    ['模型工程', /lora|qlora|transformer|微调|量化|蒸馏|ppo|dpo|模型|损失函数/],
    ['Go', /\bgo\b|goroutine|channel|context|gmp|pprof/],
    ['数据库', /mysql|redis|sql|索引|事务|mvcc|数据库|缓存/],
    ['Python后端', /python|fastapi|flask|pydantic|async|协程|接口/],
    ['项目表达', /自我介绍|项目介绍|个人贡献|为什么离职|为什么没有转正|职业规划/],
    ['系统设计', /高并发|系统设计|限流|熔断|消息队列|微服务|部署|压测|容灾/]
  ];
  return rules.find(([,pattern])=>pattern.test(value))?.[0] || '系统设计';
}

function inferLevel(text) {
  if (/源码|推导|公式|损失函数|高并发|一致性|容灾|安全|百万|架构设计|为什么.*原理/i.test(text)) return '高级';
  if (/如何|区别|设计|优化|排查|实现|评估|原理/i.test(text)) return '进阶';
  return '基础';
}

function inferHint(cat) {
  const hints = {
    RAG:'先区分数据入库、检索排序和生成评测。', Agent:'从状态、工具、边界和失败恢复展开。', Harness工程:'从执行循环、上下文、工具、安全与评测展开。', 模型工程:'先讲核心原理，再说明训练或部署取舍。',
    Go:'先讲运行机制，再补充常见问题和排查方式。', 数据库:'从数据结构、一致性和性能权衡回答。', 系统设计:'先明确目标与约束，再拆组件、链路和容灾。',
    Python后端:'从接口契约、并发模型、异常与可观测性回答。', 项目表达:'按背景、职责、方案、结果组织，明确个人边界。'
  };
  return hints[cat];
}

function normalizeAnswer(value) {
  if (Array.isArray(value)) return value.map(String).map(x=>x.trim()).filter(Boolean);
  if (!value) return [];
  return String(value).split(/\n|(?:^|\s)[•·*-]\s+|；/).map(x=>x.replace(/^\d+[.、)]\s*/, '').trim()).filter(Boolean);
}

function makeQuestion(q, answer='', extra={}) {
  const question = String(q||'').replace(/^(?:Q|问题|题目)\s*[:：]\s*/i,'').replace(/^\d+[.、)]\s*/,'').trim();
  if (question.length < 4) return null;
  const cat = questionCategories.includes(extra.cat) ? extra.cat : inferCategory(`${question} ${answer}`);
  return {
    id:`custom-${crypto.randomUUID()}`, source:'我的题目', cat,
    level:levels.includes(extra.level) ? extra.level : inferLevel(question),
    q:question, hint:extra.hint?.trim() || inferHint(cat),
    answer:normalizeAnswer(answer), keys:Array.isArray(extra.keys)?extra.keys:[]
  };
}

export function parseQuestions(raw) {
  const text = raw.replace(/\r/g,'').trim();
  if (!text) return [];
  try {
    const json=JSON.parse(text); const rows=Array.isArray(json)?json:[json];
    const parsed=rows.map(x=>makeQuestion(x.q||x.question||x.title,x.answer||x.answers||x.referenceAnswer,{cat:x.cat||x.category,level:x.level,hint:x.hint,keys:x.keys})).filter(Boolean);
    if (parsed.length) return parsed;
  } catch {}

  const lines=text.split('\n').map(x=>x.trim()).filter(Boolean);
  const result=[]; let active=null; let answer=[]; let hint='';
  const flush=()=>{ if(active){const item=makeQuestion(active,answer.join('\n'),{hint}); if(item)result.push(item);} active=null;answer=[];hint=''; };
  for(const line of lines){
    const q=line.match(/^(?:Q(?:uestion)?|问题|题目|\d{1,3}[.、)])\s*[:：]?\s*(.+)$/i);
    const a=line.match(/^(?:A(?:nswer)?|答案|参考答案|回答)\s*[:：]\s*(.*)$/i);
    const h=line.match(/^(?:提示|思路|Hint)\s*[:：]\s*(.*)$/i);
    if(q){flush();active=q[1].trim();continue;}
    if(a){if(active&&a[1])answer.push(a[1]);continue;}
    if(h){hint=h[1].trim();continue;}
    if(active){answer.push(line);continue;}
    const questions=line.match(/[^。；!！\n]{5,}[?？]/g);
    if(questions) questions.forEach(x=>{const item=makeQuestion(x);if(item)result.push(item);});
  }
  flush();
  if(result.length) return [...new Map(result.map(x=>[x.q,x])).values()];
  return lines.filter(x=>/[?？]$/.test(x)||/^(如何|为什么|什么是|请|设计|介绍|解释|对比)/.test(x)).map(x=>makeQuestion(x)).filter(Boolean);
}

export default function QuestionImporter({open,onClose,onImport,customQuestions,onDelete,folders,defaultFolderId,onMove}){
  const [tab,setTab]=useState('smart');
  const [form,setForm]=useState({q:'',answer:'',hint:'',cat:'RAG',level:'基础'});
  const [raw,setRaw]=useState('');
  const [parsed,setParsed]=useState([]);
  const [selected,setSelected]=useState(new Set());
  const [targetFolder,setTargetFolder]=useState(defaultFolderId);
  const [busy,setBusy]=useState(false);
  const fileRef=useRef(null);
  const selectedItems=useMemo(()=>parsed.filter((_,i)=>selected.has(i)),[parsed,selected]);
  if(!open)return null;

  const recognize=(value=raw)=>{const items=parseQuestions(value);setParsed(items);setSelected(new Set(items.map((_,i)=>i)));};
  const readFile=async(file)=>{
    if(!file)return; setBusy(true);
    try{
      let value='';
      if(file.name.toLowerCase().endsWith('.docx')) { const mammoth=await import('mammoth/mammoth.browser'); value=(await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value; }
      else value=await file.text();
      setRaw(value); recognize(value);
    }catch{setParsed([]);}finally{setBusy(false);}
  };
  const addManual=()=>{
    const item=makeQuestion(form.q,form.answer,form); if(!item)return;
    item.folderId=form.folderId||targetFolder||defaultFolderId;onImport([item]); setForm({q:'',answer:'',hint:'',cat:'RAG',level:'基础'}); onClose();
  };
  const importSelected=()=>{if(!selectedItems.length)return;onImport(selectedItems.map(x=>({...x,folderId:targetFolder||defaultFolderId})));setRaw('');setParsed([]);setSelected(new Set());onClose();};

  return <div className="modal-backdrop import-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="import-panel">
      <div className="history-head"><div><span className="section-kicker">QUESTION STUDIO</span><h2>添加与识别题目</h2><p>题目保存在当前浏览器，可立即加入两种练习模式。</p></div><button className="icon-btn" onClick={onClose}><X/></button></div>
      <div className="import-tabs"><button className={tab==='smart'?'selected':''} onClick={()=>setTab('smart')}><Sparkles size={15}/>自动识别</button><button className={tab==='manual'?'selected':''} onClick={()=>setTab('manual')}><PenLine size={15}/>手动添加</button><button className={tab==='manage'?'selected':''} onClick={()=>setTab('manage')}><FileText size={15}/>我的题目 <b>{customQuestions.length}</b></button></div>

      {tab==='smart'&&<div className="smart-import">
        <label className="folder-target">导入到<select value={targetFolder||defaultFolderId} onChange={e=>setTargetFolder(e.target.value)}>{folders.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label>
        <div className="upload-zone" onClick={()=>fileRef.current?.click()}><Upload size={23}/><strong>{busy?'正在识别…':'选择题库文件'}</strong><span>支持 DOCX、TXT、Markdown、JSON</span><input ref={fileRef} type="file" accept=".docx,.txt,.md,.markdown,.json" onChange={e=>readFile(e.target.files?.[0])}/></div>
        <div className="or"><span>或粘贴内容</span></div>
        <textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder={'支持：\n1. 什么是 RAG？\n答案：……\n\n也可以直接粘贴一段面试记录。'}/>
        <button className="recognize-btn" onClick={()=>recognize()} disabled={!raw.trim()}><Sparkles size={16}/>自动识别题目</button>
        {parsed.length>0&&<div className="recognize-result"><div><strong>识别到 {parsed.length} 道题</strong><span>已选择 {selectedItems.length} 道，可取消误识别项</span></div><div className="parsed-list">{parsed.map((item,i)=><label key={item.id}><input type="checkbox" checked={selected.has(i)} onChange={()=>setSelected(prev=>{const next=new Set(prev);next.has(i)?next.delete(i):next.add(i);return next})}/><span><b>{item.q}</b><small>{item.cat} · {item.level}</small></span></label>)}</div><button className="primary import-selected" onClick={importSelected}><Check size={16}/>导入所选题目</button></div>}
      </div>}

      {tab==='manual'&&<div className="manual-form"><label>题目<input value={form.q} onChange={e=>setForm({...form,q:e.target.value})} placeholder="输入一道面试题"/></label><div className="form-row"><label>文件夹<select value={form.folderId||targetFolder||defaultFolderId} onChange={e=>setForm({...form,folderId:e.target.value})}>{folders.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></label><label>方向<select value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>{questionCategories.map(x=><option key={x}>{x}</option>)}</select></label><label>难度<select value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>{levels.map(x=><option key={x}>{x}</option>)}</select></label></div><label>思路提示（可选）<input value={form.hint} onChange={e=>setForm({...form,hint:e.target.value})} placeholder="不填则自动生成"/></label><label>参考答案（每行一个要点）<textarea value={form.answer} onChange={e=>setForm({...form,answer:e.target.value})} placeholder="要点一\n要点二\n要点三"/></label><button className="primary manual-add" onClick={addManual} disabled={!form.q.trim()}><Plus size={16}/>添加到题库</button></div>}

      {tab==='manage'&&<div className="manage-questions">{customQuestions.length===0?<div className="empty-state"><FileText size={34}/><h3>还没有自定义题目</h3><p>可以手动添加，或从题库文件中自动识别。</p></div>:customQuestions.map(item=><div className="manage-row" key={item.id}><div><b>{item.q}</b><span>{item.cat} · {item.level}</span><select value={item.folderId||defaultFolderId} onChange={e=>onMove(item.id,e.target.value)}>{folders.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select></div><button onClick={()=>onDelete(item.id)} aria-label="删除题目"><Trash2 size={16}/></button></div>)}</div>}
    </section>
  </div>
}
