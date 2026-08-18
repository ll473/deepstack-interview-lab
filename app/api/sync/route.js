import { env } from 'cloudflare:workers';
import { getAppUser } from '../../auth';

export const dynamic='force-dynamic';

const schema=`CREATE TABLE IF NOT EXISTS user_learning_state (
  user_email TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
)`;

async function getAuthorized(){
  const user=await getAppUser();
  if(!user)return {error:Response.json({error:'请先登录'},{status:401})};
  if(!env.DB)return {error:Response.json({error:'云端数据库尚未就绪'},{status:503})};
  await env.DB.prepare(schema).run();
  return {user};
}

export async function GET(){
  const auth=await getAuthorized();
  if(auth.error)return auth.error;
  const row=await env.DB.prepare('SELECT payload, revision, updated_at FROM user_learning_state WHERE user_email = ?').bind(`app:${auth.user.id}`).first();
  let state=null;
  if(row?.payload){try{state=JSON.parse(row.payload);}catch{}}
  return Response.json({state,revision:row?.revision||0,updatedAt:row?.updated_at||null});
}

export async function PUT(request){
  const auth=await getAuthorized();
  if(auth.error)return auth.error;
  let body;
  try{body=await request.json();}catch{return Response.json({error:'请求格式无效'},{status:400});}
  const state=body?.state;
  if(!state||!Array.isArray(state.records)||!Array.isArray(state.customQuestions)||!state.folderState){
    return Response.json({error:'同步数据格式无效'},{status:400});
  }
  const payload=JSON.stringify(state);
  if(payload.length>1_500_000)return Response.json({error:'同步数据超过 1.5MB'},{status:413});
  const updatedAt=new Date().toISOString();
  await env.DB.prepare(`INSERT INTO user_learning_state (user_email,payload,revision,updated_at)
    VALUES (?,?,1,?)
    ON CONFLICT(user_email) DO UPDATE SET payload=excluded.payload, revision=user_learning_state.revision+1, updated_at=excluded.updated_at`)
    .bind(`app:${auth.user.id}`,payload,updatedAt).run();
  return Response.json({ok:true,updatedAt});
}
