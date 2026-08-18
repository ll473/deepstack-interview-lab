'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Clock3, Globe2, Plus, RefreshCw, Save, Settings2, Trash2, X } from 'lucide-react';

const defaults={enabled:true,mode:'daily',intervalHours:6,dailyTimes:['09:00'],weekdays:[1],timezone:'Asia/Shanghai'};
const hours=Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`);
const days=[['周日',0],['周一',1],['周二',2],['周三',3],['周四',4],['周五',5],['周六',6]];
const zoneLabels={'Asia/Shanghai':'北京时间','Asia/Tokyo':'日本时间','Asia/Hong_Kong':'香港时间','Asia/Singapore':'新加坡时间','UTC':'UTC'};

function scheduleText(settings){
  if(!settings.enabled)return '自动更新已暂停';
  if(settings.mode==='interval')return `每 ${settings.intervalHours} 小时更新一次`;
  const times=settings.dailyTimes.join('、');
  if(settings.mode==='daily')return `每天 ${times} 更新`;
  const names=days.filter(([,id])=>settings.weekdays.includes(id)).map(([name])=>name).join('、');
  return `每${names} ${times} 更新`;
}

export default function UpdateSettings({open,onClose}){
  const [settings,setSettings]=useState(defaults);
  const [canManage,setCanManage]=useState(false);
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [saved,setSaved]=useState(false);
  const [newTime,setNewTime]=useState('09:00');

  useEffect(()=>{
    if(!open)return;
    let cancelled=false;
    setLoading(true);setError('');setSaved(false);
    fetch('/api/update-settings',{cache:'no-store'})
      .then(async response=>{const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'读取设置失败');return data;})
      .then(data=>{if(!cancelled){setSettings({...defaults,...data.settings});setCanManage(Boolean(data.canManage));}})
      .catch(err=>{if(!cancelled)setError(err.message||'读取设置失败');})
      .finally(()=>{if(!cancelled)setLoading(false);});
    return()=>{cancelled=true;};
  },[open]);

  const summary=useMemo(()=>scheduleText(settings),[settings]);
  const update=value=>{setSaved(false);setSettings(prev=>({...prev,...value}));};
  const addTime=()=>{
    if(settings.dailyTimes.includes(newTime)||settings.dailyTimes.length>=8)return;
    update({dailyTimes:[...settings.dailyTimes,newTime].sort()});
  };
  const removeTime=time=>{
    if(settings.dailyTimes.length<=1)return;
    update({dailyTimes:settings.dailyTimes.filter(x=>x!==time)});
  };
  const toggleDay=day=>{
    const exists=settings.weekdays.includes(day);
    if(exists&&settings.weekdays.length===1)return;
    update({weekdays:exists?settings.weekdays.filter(x=>x!==day):[...settings.weekdays,day].sort()});
  };
  const save=async()=>{
    setSaving(true);setError('');setSaved(false);
    try{
      const response=await fetch('/api/update-settings',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(settings)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'保存失败');
      setSettings({...settings,...data.settings});setSaved(true);
    }catch(err){setError(err.message||'保存失败');}
    finally{setSaving(false);}
  };

  if(!open)return null;
  return <div className="modal-backdrop update-settings-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="update-settings-panel">
      <div className="update-settings-head"><div><span className="section-kicker"><Settings2 size={13}/> UPDATE SCHEDULE</span><h2>资讯自动更新设置</h2><p>控制 AI 新闻、重点应用和 GitHub AI 增长榜的更新时间。</p></div><button className="icon-btn" onClick={onClose} aria-label="关闭"><X/></button></div>

      {loading?<div className="settings-loading"><RefreshCw size={22}/>正在读取云端设置…</div>:<>
        <div className={`schedule-preview ${settings.enabled?'active':''}`}><Clock3 size={19}/><div><small>当前计划 · {zoneLabels[settings.timezone]}</small><b>{summary}</b></div><label className="toggle"><input type="checkbox" checked={settings.enabled} disabled={!canManage} onChange={e=>update({enabled:e.target.checked})}/><span/></label></div>

        {!canManage&&<div className="settings-permission">登录网站管理员账号后可以修改；其他用户只能查看当前更新计划。</div>}

        <fieldset disabled={!canManage||!settings.enabled}>
          <legend>更新方式</legend>
          <div className="schedule-modes">
            <button className={settings.mode==='interval'?'selected':''} onClick={()=>update({mode:'interval'})}><RefreshCw size={16}/><b>每隔几小时</b><small>适合持续追踪热点</small></button>
            <button className={settings.mode==='daily'?'selected':''} onClick={()=>update({mode:'daily'})}><Clock3 size={16}/><b>每天定时</b><small>可设置多个时间</small></button>
            <button className={settings.mode==='weekly'?'selected':''} onClick={()=>update({mode:'weekly'})}><CalendarDays size={16}/><b>每周定时</b><small>选择星期和时间</small></button>
          </div>

          {settings.mode==='interval'?<div className="schedule-block"><label>更新间隔</label><select value={settings.intervalHours} onChange={e=>update({intervalHours:Number(e.target.value)})}>{[1,2,3,4,6,8,12,24].map(x=><option key={x} value={x}>{x===24?'每 24 小时':`每 ${x} 小时`}</option>)}</select><small>后台每小时检查一次；选择 3 小时表示在 00:00、03:00、06:00…执行。</small></div>:<>
            {settings.mode==='weekly'&&<div className="schedule-block"><label>更新星期</label><div className="weekday-grid">{days.map(([name,id])=><button key={id} className={settings.weekdays.includes(id)?'selected':''} onClick={()=>toggleDay(id)}>{name}</button>)}</div></div>}
            <div className="schedule-block"><label>{settings.mode==='daily'?'每天更新时间':'当天更新时间'}</label><div className="time-entry"><select value={newTime} onChange={e=>setNewTime(e.target.value)}>{hours.map(x=><option key={x}>{x}</option>)}</select><button onClick={addTime} disabled={settings.dailyTimes.includes(newTime)||settings.dailyTimes.length>=8}><Plus size={15}/>添加时间</button></div><div className="time-chips">{settings.dailyTimes.map(time=><span key={time}><Clock3 size={13}/>{time}<button aria-label={`删除 ${time}`} onClick={()=>removeTime(time)} disabled={settings.dailyTimes.length<=1}><Trash2 size={12}/></button></span>)}</div><small>支持每天最多 8 个整点，后台调度精度为一小时。</small></div>
          </>}

          <div className="schedule-block"><label><Globe2 size={14}/>计划时区</label><select value={settings.timezone} onChange={e=>update({timezone:e.target.value})}>{Object.entries(zoneLabels).map(([value,label])=><option value={value} key={value}>{label}（{value}）</option>)}</select></div>
        </fieldset>

        {error&&<div className="auth-error" role="alert">{error}</div>}
        {saved&&<div className="settings-saved"><Check size={15}/>设置已保存，后台任务会从下一次每小时检查开始采用。</div>}
        <div className="settings-actions"><button className="ghost" onClick={onClose}>取消</button>{canManage&&<button className="primary" onClick={save} disabled={saving}><Save size={16}/>{saving?'正在保存…':'保存更新计划'}</button>}</div>
      </>}
    </section>
  </div>;
}
