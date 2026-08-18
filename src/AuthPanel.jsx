'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Cloud, Eye, EyeOff, LockKeyhole, LogIn, LogOut, ShieldCheck, Smartphone, UserRound, X } from 'lucide-react';

export default function AuthPanel({open,onClose,user,status,lastSyncedAt}){
  const [tab,setTab]=useState('login');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  useEffect(()=>{if(open){setError('');setPassword('');setConfirm('');}},[open,tab]);

  const submit=async event=>{
    event.preventDefault();
    if(tab==='register'&&password!==confirm){setError('两次输入的密码不一致');return;}
    setLoading(true);setError('');
    try{
      const response=await fetch(`/api/auth/${tab}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||'操作失败，请稍后再试');
      window.location.reload();
    }catch(err){setError(err.message||'操作失败，请稍后再试');setLoading(false);}
  };

  const logout=async()=>{
    setLoading(true);setError('');
    try{
      const response=await fetch('/api/auth/logout',{method:'POST'});
      if(!response.ok)throw new Error('退出失败，请稍后再试');
      window.location.reload();
    }catch(err){setError(err.message);setLoading(false);}
  };

  if(!open)return null;
  return <div className="modal-backdrop auth-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="auth-panel">
      <button className="icon-btn auth-close" onClick={onClose}><X/></button>
      <div className="auth-hero"><span><Cloud size={23}/></span><small>DEEPSTACK ACCOUNT</small><h2>{user?'你的学习数据已连接':'登录后跨设备同步'}</h2><p>网站内容公开可看；你的回答、练习进度、自建文件夹和自定义题目只归你的账户所有。</p></div>
      {user?<>
        <div className="account-card"><span>{user.username.slice(0,1).toUpperCase()}</span><div><b>{user.username}</b><small>深栈站内账号</small></div><i><CheckCircle2 size={15}/> 已登录</i></div>
        <div className="sync-state"><Cloud size={18}/><div><b>{status}</b><small>{lastSyncedAt?`最近同步 ${new Date(lastSyncedAt).toLocaleString('zh-CN')}`:'正在准备首次同步'}</small></div></div>
        {error&&<div className="auth-error" role="alert">{error}</div>}
        <button className="auth-primary secondary" onClick={logout} disabled={loading}><LogOut size={17}/>{loading?'正在退出…':'退出登录'}</button>
      </>:<>
        <div className="auth-benefits"><div><Smartphone size={18}/><span><b>电脑与手机一致</b><small>换设备后继续上次进度</small></span></div><div><ShieldCheck size={18}/><span><b>个人数据隔离</b><small>其他访问者看不到你的记录</small></span></div></div>
        <div className="auth-tabs"><button className={tab==='login'?'selected':''} onClick={()=>setTab('login')}>登录</button><button className={tab==='register'?'selected':''} onClick={()=>setTab('register')}>注册账号</button></div>
        <form className="auth-form" onSubmit={submit}>
          <label><span><UserRound size={14}/>用户名</span><input autoFocus value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" placeholder="3–24 个字符" maxLength={24}/></label>
          <label><span><LockKeyhole size={14}/>密码</span><div className="password-input"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={tab==='login'?'current-password':'new-password'} placeholder="至少 8 位" maxLength={128}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'隐藏密码':'显示密码'}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>
          {tab==='register'&&<label><span><LockKeyhole size={14}/>确认密码</span><input type={showPassword?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" placeholder="再次输入密码" maxLength={128}/></label>}
          {error&&<div className="auth-error" role="alert">{error}</div>}
          <button className="auth-primary auth-submit" disabled={loading||!username.trim()||password.length<8}>{loading?'请稍候…':tab==='login'?<><LogIn size={17}/>登录并同步</>:<><UserRound size={17}/>创建账号</>}</button>
        </form>
        <small className="auth-footnote">密码经过加盐哈希后保存，网站不会保存密码明文。未登录时数据仍保留在当前浏览器。</small>
      </>}
    </section>
  </div>
}
