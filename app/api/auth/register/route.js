import { env } from 'cloudflare:workers';
import { createSession, ensureAuthSchema, hashPassword, isSameOrigin, takeRateLimit, validatePassword, validateUsername, withSessionCookie } from '../../../auth';

export const dynamic='force-dynamic';

export async function POST(request){
  if(!isSameOrigin(request))return Response.json({error:'请求来源无效'},{status:403});
  if(!env.DB)return Response.json({error:'云端数据库暂不可用'},{status:503});
  await ensureAuthSchema();
  if(!await takeRateLimit(request,'register',5,60*60*1000))return Response.json({error:'注册过于频繁，请稍后再试'},{status:429});
  let body;
  try{body=await request.json();}catch{return Response.json({error:'请求格式无效'},{status:400});}
  const nameResult=validateUsername(body?.username);
  if(nameResult.error)return Response.json({error:nameResult.error},{status:400});
  const passwordResult=validatePassword(body?.password);
  if(passwordResult.error)return Response.json({error:passwordResult.error},{status:400});
  const exists=await env.DB.prepare('SELECT id FROM app_users WHERE username_key=?').bind(nameResult.usernameKey).first();
  if(exists)return Response.json({error:'该用户名已被使用'},{status:409});
  const credentials=await hashPassword(passwordResult.password);
  const id=crypto.randomUUID();
  try{
    await env.DB.prepare('INSERT INTO app_users (id,username,username_key,password_hash,password_salt,created_at) VALUES (?,?,?,?,?,?)')
      .bind(id,nameResult.username,nameResult.usernameKey,credentials.hash,credentials.salt,new Date().toISOString()).run();
  }catch{
    return Response.json({error:'该用户名已被使用'},{status:409});
  }
  const token=await createSession(id);
  return withSessionCookie(Response.json({user:{id,username:nameResult.username,displayName:nameResult.username}}),token);
}
