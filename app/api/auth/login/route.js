import { env } from 'cloudflare:workers';
import { createSession, ensureAuthSchema, hashPassword, isSameOrigin, safeEqual, takeRateLimit, validatePassword, validateUsername, withSessionCookie } from '../../../auth';

export const dynamic='force-dynamic';
const DUMMY_SALT='AAAAAAAAAAAAAAAAAAAAAA';

export async function POST(request){
  if(!isSameOrigin(request))return Response.json({error:'请求来源无效'},{status:403});
  if(!env.DB)return Response.json({error:'云端数据库暂不可用'},{status:503});
  let body;
  try{body=await request.json();}catch{return Response.json({error:'请求格式无效'},{status:400});}
  const nameResult=validateUsername(body?.username);
  const passwordResult=validatePassword(body?.password);
  if(nameResult.error||passwordResult.error)return Response.json({error:'用户名或密码错误'},{status:401});
  await ensureAuthSchema();
  if(!await takeRateLimit(request,`login:${nameResult.usernameKey}`,8,15*60*1000))return Response.json({error:'尝试次数过多，请 15 分钟后再试'},{status:429});
  const user=await env.DB.prepare('SELECT id,username,password_hash,password_salt FROM app_users WHERE username_key=?').bind(nameResult.usernameKey).first();
  const calculated=await hashPassword(passwordResult.password,user?.password_salt||DUMMY_SALT);
  if(!user||!safeEqual(calculated.hash,user.password_hash))return Response.json({error:'用户名或密码错误'},{status:401});
  const token=await createSession(user.id);
  return withSessionCookie(Response.json({user:{id:user.id,username:user.username,displayName:user.username}}),token);
}
