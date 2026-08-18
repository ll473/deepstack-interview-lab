'use client';

import React, { useState } from 'react';
import { Check, Folder, FolderPlus, Pencil, Trash2, X } from 'lucide-react';

export default function FolderManager({open,onClose,folders,counts,activeFolder,onSelect,onCreate,onRename,onDelete}){
  const [newName,setNewName]=useState('');
  const [editing,setEditing]=useState(null);
  const [editName,setEditName]=useState('');
  if(!open)return null;
  const create=()=>{const name=newName.trim();if(!name)return;onCreate(name);setNewName('');};
  const startEdit=(folder)=>{setEditing(folder.id);setEditName(folder.name);};
  const saveEdit=(id)=>{const name=editName.trim();if(name)onRename(id,name);setEditing(null);};
  return <div className="modal-backdrop folder-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="folder-panel">
      <div className="history-head"><div><span className="section-kicker">QUESTION FOLDERS</span><h2>题库文件夹</h2><p>选择一个文件夹进行专项训练，也可以新建、改名或删除。</p></div><button className="icon-btn" onClick={onClose}><X/></button></div>
      <div className="new-folder"><FolderPlus size={18}/><input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')create()}} placeholder="新文件夹名称"/><button onClick={create} disabled={!newName.trim()}>新建</button></div>
      <div className="folder-list">{folders.map(folder=><div className={`folder-row ${activeFolder===folder.id?'active':''}`} key={folder.id}>
        <button className="folder-main" onClick={()=>{onSelect(folder.id);onClose()}}><span><Folder size={18}/></span><div>{editing===folder.id?<input autoFocus value={editName} onClick={e=>e.stopPropagation()} onChange={e=>setEditName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();saveEdit(folder.id)}}}/>:<b>{folder.name}</b>}<small>{counts[folder.id]||0} 道题{folder.system?' · 默认文件夹':' · 我的文件夹'}</small></div></button>
        <div className="folder-actions">{editing===folder.id?<button onClick={()=>saveEdit(folder.id)} aria-label="保存名称"><Check size={15}/></button>:<button onClick={()=>startEdit(folder)} aria-label="修改名称"><Pencil size={15}/></button>}<button className="danger" onClick={()=>{if(window.confirm(`确定删除“${folder.name}”吗？`))onDelete(folder.id)}} aria-label="删除文件夹"><Trash2 size={15}/></button></div>
      </div>)}</div>
      <p className="folder-note">这些修改不会影响其他访问者；登录后会同步到你自己的其他设备。</p>
    </section>
  </div>
}
