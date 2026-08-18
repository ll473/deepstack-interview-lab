import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';

const SESSION_COOKIE = '__Host-deepstack_session';
const SESSION_SECONDS = 60 * 60 * 24 * 30;
// The Workers Web Crypto runtime caps one PBKDF2 operation at 100,000 rounds.
// A server-side pepper adds a second secret that is not stored in D1.
const PBKDF2_ITERATIONS = 100_000;

const userSchema = `CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  username_key TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL
)`;

const sessionSchema = `CREATE TABLE IF NOT EXISTS app_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
)`;

const attemptsSchema = `CREATE TABLE IF NOT EXISTS auth_attempts (
  attempt_key TEXT PRIMARY KEY NOT NULL,
  attempt_count INTEGER NOT NULL,
  window_started_at TEXT NOT NULL
)`;

export async function ensureAuthSchema(){
  if(!env.DB)throw new Error('Cloud database unavailable');
  await env.DB.batch([
    env.DB.prepare(userSchema),
    env.DB.prepare(sessionSchema),
    env.DB.prepare(attemptsSchema)
  ]);
}

export function validateUsername(value){
  const username=String(value||'').normalize('NFKC').trim();
  const length=Array.from(username).length;
  if(length<3||length>24)return {error:'用户名需为 3–24 个字符'};
  if(!/^[\p{L}\p{N}_-]+$/u.test(username))return {error:'用户名只能包含文字、字母、数字、下划线或短横线'};
  return {username,usernameKey:username.toLocaleLowerCase('zh-CN')};
}

export function validatePassword(value){
  const password=String(value||'');
  if(password.length<8)return {error:'密码至少需要 8 位'};
  if(password.length>128)return {error:'密码不能超过 128 位'};
  return {password};
}

export async function hashPassword(password,salt=toBase64Url(crypto.getRandomValues(new Uint8Array(16)))){
  if(!env.AUTH_PEPPER)throw new Error('Authentication secret unavailable');
  const pepperKey=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.AUTH_PEPPER),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const peppered=await crypto.subtle.sign('HMAC',pepperKey,new TextEncoder().encode(password));
  const key=await crypto.subtle.importKey('raw',peppered,'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:fromBase64Url(salt),iterations:PBKDF2_ITERATIONS},key,256);
  return {hash:toBase64Url(new Uint8Array(bits)),salt};
}

export function safeEqual(left,right){
  const a=new TextEncoder().encode(String(left));
  const b=new TextEncoder().encode(String(right));
  if(a.length!==b.length)return false;
  let mismatch=0;
  for(let i=0;i<a.length;i++)mismatch|=a[i]^b[i];
  return mismatch===0;
}

export async function createSession(userId){
  await ensureAuthSchema();
  const token=toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash=await sha256(token);
  const now=new Date();
  const expires=new Date(now.getTime()+SESSION_SECONDS*1000);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM app_sessions WHERE expires_at<=?').bind(now.toISOString()),
    env.DB.prepare('INSERT INTO app_sessions (token_hash,user_id,created_at,expires_at) VALUES (?,?,?,?)')
      .bind(tokenHash,userId,now.toISOString(),expires.toISOString())
  ]);
  return token;
}

export async function getAppUser(){
  const cookieStore=await cookies();
  const token=cookieStore.get(SESSION_COOKIE)?.value;
  if(!token||!env.DB)return null;
  await ensureAuthSchema();
  const tokenHash=await sha256(token);
  const row=await env.DB.prepare(`SELECT u.id, u.username
    FROM app_sessions s JOIN app_users u ON u.id=s.user_id
    WHERE s.token_hash=? AND s.expires_at>?`)
    .bind(tokenHash,new Date().toISOString()).first();
  if(!row)return null;
  return {id:row.id,username:row.username,displayName:row.username};
}

export async function deleteCurrentSession(){
  const cookieStore=await cookies();
  const token=cookieStore.get(SESSION_COOKIE)?.value;
  if(token&&env.DB){
    await ensureAuthSchema();
    await env.DB.prepare('DELETE FROM app_sessions WHERE token_hash=?').bind(await sha256(token)).run();
  }
}

export function withSessionCookie(response,token){
  response.headers.append('Set-Cookie',`${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`);
  return response;
}

export function withClearedSessionCookie(response){
  response.headers.append('Set-Cookie',`${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  return response;
}

export function isSameOrigin(request){
  const origin=request.headers.get('origin');
  if(!origin)return true;
  try{return origin===new URL(request.url).origin;}catch{return false;}
}

export async function takeRateLimit(request,bucket,limit,windowMs){
  await ensureAuthSchema();
  const ip=request.headers.get('cf-connecting-ip')||'unknown';
  const attemptKey=await sha256(`${bucket}|${ip}`);
  const now=new Date();
  const existing=await env.DB.prepare('SELECT attempt_count, window_started_at FROM auth_attempts WHERE attempt_key=?').bind(attemptKey).first();
  if(!existing||now.getTime()-new Date(existing.window_started_at).getTime()>windowMs){
    await env.DB.prepare(`INSERT INTO auth_attempts (attempt_key,attempt_count,window_started_at) VALUES (?,1,?)
      ON CONFLICT(attempt_key) DO UPDATE SET attempt_count=1, window_started_at=excluded.window_started_at`)
      .bind(attemptKey,now.toISOString()).run();
    return true;
  }
  if(existing.attempt_count>=limit)return false;
  await env.DB.prepare('UPDATE auth_attempts SET attempt_count=attempt_count+1 WHERE attempt_key=?').bind(attemptKey).run();
  return true;
}

async function sha256(value){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(digest));
}

function toBase64Url(bytes){
  let binary='';
  for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}

function fromBase64Url(value){
  const normalized=value.replaceAll('-','+').replaceAll('_','/');
  const binary=atob(normalized+'='.repeat((4-normalized.length%4)%4));
  return Uint8Array.from(binary,char=>char.charCodeAt(0));
}
