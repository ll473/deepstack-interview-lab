'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight, BarChart3, CalendarDays, ChevronLeft, ChevronRight,
  Flame, Github, Newspaper, Settings2, Sparkles, Star, TrendingUp, Users, Wrench
} from 'lucide-react';
import { aiNews, aiNewsUpdatedAt } from './aiNews';
import { aiAppNews, aiAppNewsUpdatedAt } from './aiAppNews';
import { githubProjects, githubProjectsMethod, githubProjectsUpdatedAt } from './githubProjects';
import UpdateSettings from './UpdateSettings';

const PAGE_SIZE = 6;

const sectionMeta = {
  news: {
    kicker: 'DAILY AI SIGNAL', title: 'AI 新闻榜', updatedAt: aiNewsUpdatedAt,
    description: '追踪 AI、LLM 与 Agent 动态，提供事实摘要、影响分析、公开讨论态度与原文。'
  },
  apps: {
    kicker: 'USEFUL AI DAILY', title: '每日重点应用', updatedAt: aiAppNewsUpdatedAt,
    description: '筛选已经可用或明确进入预览的 AI 应用，说明它能做什么、为什么值得关注以及适合谁。'
  },
  github: {
    kicker: 'FAST GROWING OSS', title: 'GitHub AI 增长榜', updatedAt: githubProjectsUpdatedAt,
    description: '按当天新增 Star 排序，发现刚上榜和增长很快的 AI 应用；历史总 Star 只作为辅助信息。'
  }
};

function Pagination({page,totalPages,onChange,total}){
  if(totalPages<=1) return <div className="pagination-summary">共 {total} 条</div>;
  const pages=Array.from({length:totalPages},(_,i)=>i+1);
  return <nav className="pagination" aria-label="资讯翻页">
    <span>共 {total} 条 · 第 {page}/{totalPages} 页</span>
    <div>
      <button aria-label="上一页" disabled={page===1} onClick={()=>onChange(page-1)}><ChevronLeft size={15}/>上一页</button>
      <div className="page-numbers">{pages.map(n=><button key={n} className={n===page?'active':''} aria-label={`第 ${n} 页`} aria-current={n===page?'page':undefined} onClick={()=>onChange(n)}>{n}</button>)}</div>
      <button aria-label="下一页" disabled={page===totalPages} onClick={()=>onChange(page+1)}>下一页<ChevronRight size={15}/></button>
    </div>
  </nav>;
}

function NewsCard({item,index}){
  return <article className="news-card">
    <div className="news-rank"><span>{String(index).padStart(2,'0')}</span><Flame size={15}/></div>
    <div className="news-content">
      <div className="news-meta"><span>{item.category}</span><time>{item.date}</time><b>{item.heat}</b></div>
      <h3>{item.title}</h3>
      <div className="news-columns">
        <div><label><Newspaper size={14}/> 新闻摘要</label><p>{item.summary}</p></div>
        <div><label><Sparkles size={14}/> 影响分析</label><p>{item.analysis}</p></div>
      </div>
      <div className="audience-signal"><BarChart3 size={16}/><div><span>公开讨论态度 · {item.audience.tone}</span><p>{item.audience.summary}</p><small>定性归纳，不代表科学民调</small></div></div>
      <div className="news-links"><a href={item.sourceUrl} target="_blank" rel="noreferrer">查看 {item.source} 原文 <ArrowUpRight size={14}/></a>{item.audience.evidenceUrl!==item.sourceUrl&&<a className="discussion-link" href={item.audience.evidenceUrl} target="_blank" rel="noreferrer">查看讨论样本 <ArrowUpRight size={13}/></a>}</div>
    </div>
  </article>;
}

function AppNewsCard({item}){
  return <article className="app-news-card">
    <div className="app-news-top"><div><span>{item.category}</span><time>{item.date}</time></div><b>{item.badge}</b></div>
    <h3>{item.title}</h3>
    <div className="app-news-summary"><label><Newspaper size={14}/> 原文摘要</label><p>{item.summary}</p></div>
    <div className="app-value-grid">
      <div><label><Wrench size={14}/> 为什么值得用</label><p>{item.whyUse}</p></div>
      <div><label><Users size={14}/> 适用人群</label><p>{item.audience}</p><small>{item.availability}</small></div>
    </div>
    <a className="source-button" href={item.sourceUrl} target="_blank" rel="noreferrer">查看 {item.source} 原文 <ArrowUpRight size={14}/></a>
  </article>;
}

function formatStars(value){
  if(value>=1000) return `${(value/1000).toFixed(1)}k`;
  return String(value);
}

function GithubCard({item}){
  return <article className="github-card">
    <div className="github-card-top">
      <div className="github-name"><span><Github size={18}/></span><div><h3>{item.name}</h3><small>{item.repo}</small></div></div>
      <div className="github-growth"><TrendingUp size={14}/><b>+{item.starsToday}</b><small>今日 Star</small></div>
    </div>
    <div className="github-tags"><span className="rank-tag">今日 #{item.rank}</span><span>{item.category}</span><span>{item.language}</span></div>
    <div className="github-official"><label>官方介绍</label><p>{item.officialIntro}</p></div>
    <div className="github-detail"><label>主要作用</label><p>{item.purpose}</p></div>
    <div className="github-detail trend-reason"><label><Flame size={13}/> 为什么正在变热</label><p>{item.whyTrending}</p></div>
    <div className="github-detail summary"><label><Sparkles size={13}/> 中文总结</label><p>{item.summary}</p></div>
    <div className="github-foot"><small>首次收录 {item.firstSeen} · 总 Star {formatStars(item.stars)}</small><a href={item.repoUrl} target="_blank" rel="noreferrer">打开仓库 <ArrowUpRight size={14}/></a></div>
  </article>;
}

export default function NewsBoard(){
  const [section,setSection]=useState('news');
  const [filter,setFilter]=useState('全部');
  const [page,setPage]=useState(1);
  const [settingsOpen,setSettingsOpen]=useState(false);

  const source=section==='news'?aiNews:section==='apps'?aiAppNews:githubProjects;
  const categories=useMemo(()=>{
    const items=section==='news'?aiNews:section==='apps'?aiAppNews:githubProjects;
    return ['全部',...new Set(items.map(x=>section==='news'?x.category.split(' / ')[0]:x.category))];
  },[section]);
  const filtered=filter==='全部'?source:source.filter(x=>section==='news'?x.category.startsWith(filter):x.category===filter);
  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const safePage=Math.min(page,totalPages);
  const shown=filtered.slice((safePage-1)*PAGE_SIZE,safePage*PAGE_SIZE);
  const meta=sectionMeta[section];

  const changeSection=next=>{setSection(next);setFilter('全部');setPage(1)};
  const changeFilter=next=>{setFilter(next);setPage(1)};
  const changePage=next=>{
    setPage(Math.max(1,Math.min(totalPages,next)));
    document.getElementById('news')?.scrollIntoView({behavior:'smooth',block:'start'});
  };

  return <section className="news-board" id="news">
    <div className="content-tabs" role="tablist" aria-label="AI 资讯栏目">
      <button role="tab" aria-selected={section==='news'} className={section==='news'?'selected':''} onClick={()=>changeSection('news')}><Newspaper size={15}/><span>AI 新闻榜</span><b>{aiNews.length}</b></button>
      <button role="tab" aria-selected={section==='apps'} className={section==='apps'?'selected':''} onClick={()=>changeSection('apps')}><Sparkles size={15}/><span>重点应用</span><b>{aiAppNews.length}</b></button>
      <button role="tab" aria-selected={section==='github'} className={section==='github'?'selected':''} onClick={()=>changeSection('github')}><TrendingUp size={15}/><span>GitHub 增长榜</span><b>{githubProjects.length}</b></button>
    </div>

    <div className="news-board-head">
      <div><span className="section-kicker">{section==='github'?<Github size={13}/>:<Newspaper size={13}/>} {meta.kicker}</span><h2>{meta.title}</h2><p>{meta.description}</p></div>
      <div className="news-freshness"><span><span className="live-dot"/>按计划自动更新</span><small><CalendarDays size={13}/> 最近内容 {meta.updatedAt}</small><button className="update-settings-button" onClick={()=>setSettingsOpen(true)}><Settings2 size={14}/>更新设置</button></div>
    </div>
    <div className="news-toolbar">
      <div className="news-filters">{categories.map(x=><button key={x} className={filter===x?'selected':''} onClick={()=>changeFilter(x)}>{x}</button>)}</div>
      <small>{filtered.length} 条内容</small>
    </div>

    {section==='news'&&<div className="news-list">{shown.map((item,i)=><NewsCard item={item} index={(safePage-1)*PAGE_SIZE+i+1} key={item.id}/>)}</div>}
    {section==='apps'&&<div className="app-news-list">{shown.map(item=><AppNewsCard item={item} key={item.id}/>)}</div>}
    {section==='github'&&<><div className="snapshot-note"><TrendingUp size={13}/> {githubProjectsMethod} · 按“今日新增 Star”排序 · {githubProjectsUpdatedAt} 快照</div><div className="github-grid">{shown.map(item=><GithubCard item={item} key={item.id}/>)}</div></>}

    <Pagination page={safePage} totalPages={totalPages} total={filtered.length} onChange={changePage}/>
    <UpdateSettings open={settingsOpen} onClose={()=>setSettingsOpen(false)}/>
  </section>;
}
