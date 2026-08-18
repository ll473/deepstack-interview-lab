'use client';

import { useEffect, useRef, useState } from 'react';

export default function useCloudSync({user,hydrated,records,customQuestions,folderState,setRecords,setCustomQuestions,setFolderState}){
  const [status,setStatus]=useState(user?'正在连接云端':'未登录');
  const [lastSyncedAt,setLastSyncedAt]=useState(null);
  const ready=useRef(false);
  const booting=useRef(false);

  useEffect(()=>{
    ready.current=false;
    if(!user){setStatus('未登录');return;}
    if(!hydrated||booting.current)return;
    booting.current=true;
    let cancelled=false;
    (async()=>{
      try{
        setStatus('正在同步');
        const response=await fetch('/api/sync',{cache:'no-store'});
        if(!response.ok)throw new Error('sync load failed');
        const data=await response.json();
        if(cancelled)return;
        if(data.state){
          if(Array.isArray(data.state.records))setRecords(data.state.records);
          if(Array.isArray(data.state.customQuestions))setCustomQuestions(data.state.customQuestions);
          if(data.state.folderState?.custom&&data.state.folderState?.renames&&data.state.folderState?.hidden)setFolderState(data.state.folderState);
        }else{
          const firstSave=await fetch('/api/sync',{
            method:'PUT',headers:{'content-type':'application/json'},
            body:JSON.stringify({state:{records,customQuestions,folderState}})
          });
          if(!firstSave.ok)throw new Error('initial sync failed');
          const saved=await firstSave.json();
          data.updatedAt=saved.updatedAt;
        }
        setLastSyncedAt(data.updatedAt||null);
        ready.current=true;
        setStatus('云端已同步');
      }catch{
        setStatus('云端暂不可用');
      }finally{
        booting.current=false;
      }
    })();
    return()=>{cancelled=true;};
  },[user?.id,hydrated,setRecords,setCustomQuestions,setFolderState]);

  useEffect(()=>{
    if(!user||!hydrated||!ready.current)return;
    setStatus('有更改待同步');
    const timer=setTimeout(async()=>{
      try{
        setStatus('正在同步');
        const response=await fetch('/api/sync',{
          method:'PUT',headers:{'content-type':'application/json'},
          body:JSON.stringify({state:{records,customQuestions,folderState}})
        });
        if(!response.ok)throw new Error('sync save failed');
        const data=await response.json();
        setLastSyncedAt(data.updatedAt||new Date().toISOString());
        setStatus('云端已同步');
      }catch{
        setStatus('同步失败，保留本机副本');
      }
    },900);
    return()=>clearTimeout(timer);
  },[user?.id,hydrated,records,customQuestions,folderState]);

  return {status,lastSyncedAt};
}
