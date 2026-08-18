import { env } from 'cloudflare:workers';
import { getAppUser, isSameOrigin } from '../../auth';

export const dynamic='force-dynamic';

const schema=`CREATE TABLE IF NOT EXISTS site_update_settings (
  setting_key TEXT PRIMARY KEY NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  mode TEXT NOT NULL DEFAULT 'daily',
  interval_hours INTEGER NOT NULL DEFAULT 6,
  daily_times TEXT NOT NULL DEFAULT '["09:00"]',
  weekdays TEXT NOT NULL DEFAULT '[1]',
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  updated_by TEXT,
  updated_at TEXT NOT NULL
)`;

const allowedIntervals=new Set([1,2,3,4,6,8,12,24]);
const allowedTimezones=new Set(['Asia/Shanghai','Asia/Tokyo','Asia/Hong_Kong','Asia/Singapore','UTC']);

async function ensureSchema(){
  if(!env.DB)throw new Error('Cloud database unavailable');
  await env.DB.prepare(schema).run();
  await env.DB.prepare(`INSERT OR IGNORE INTO site_update_settings
    (setting_key,enabled,mode,interval_hours,daily_times,weekdays,timezone,updated_by,updated_at)
    VALUES ('global',1,'daily',6,'["09:00"]','[1]','Asia/Shanghai',NULL,?)`)
    .bind(new Date().toISOString()).run();
}

async function canManage(user){
  if(!user)return false;
  const owner=await env.DB.prepare('SELECT id FROM app_users ORDER BY created_at ASC LIMIT 1').first();
  return owner?.id===user.id;
}

function parseJson(value,fallback){
  try{return JSON.parse(value);}catch{return fallback;}
}

function serialize(row){
  return {
    enabled:Boolean(row.enabled),
    mode:row.mode,
    intervalHours:Number(row.interval_hours),
    dailyTimes:parseJson(row.daily_times,['09:00']),
    weekdays:parseJson(row.weekdays,[1]),
    timezone:row.timezone,
    updatedAt:row.updated_at
  };
}

function validate(body){
  const mode=String(body?.mode||'');
  if(!['interval','daily','weekly'].includes(mode))return {error:'更新方式无效'};
  const intervalHours=Number(body?.intervalHours);
  if(!allowedIntervals.has(intervalHours))return {error:'更新间隔无效'};
  const dailyTimes=[...new Set(Array.isArray(body?.dailyTimes)?body.dailyTimes.map(String):[])].sort();
  if(!dailyTimes.length||dailyTimes.length>8||dailyTimes.some(x=>!/^([01]\d|2[0-3]):00$/.test(x)))return {error:'请选择 1–8 个整点时间'};
  const weekdays=[...new Set(Array.isArray(body?.weekdays)?body.weekdays.map(Number):[])].filter(x=>Number.isInteger(x)&&x>=0&&x<=6).sort();
  if(!weekdays.length)return {error:'每周更新至少选择一天'};
  const timezone=String(body?.timezone||'');
  if(!allowedTimezones.has(timezone))return {error:'时区无效'};
  return {enabled:body?.enabled!==false,mode,intervalHours,dailyTimes,weekdays,timezone};
}

export async function GET(){
  if(!env.DB)return Response.json({error:'云端数据库尚未就绪'},{status:503});
  await ensureSchema();
  const user=await getAppUser();
  const row=await env.DB.prepare('SELECT * FROM site_update_settings WHERE setting_key=?').bind('global').first();
  return Response.json({settings:serialize(row),canManage:await canManage(user)},{headers:{'cache-control':'no-store'}});
}

export async function PUT(request){
  if(!isSameOrigin(request))return Response.json({error:'请求来源无效'},{status:403});
  if(!env.DB)return Response.json({error:'云端数据库尚未就绪'},{status:503});
  await ensureSchema();
  const user=await getAppUser();
  if(!user)return Response.json({error:'请先登录'},{status:401});
  if(!await canManage(user))return Response.json({error:'只有网站管理员可以修改全站更新计划'},{status:403});
  let body;
  try{body=await request.json();}catch{return Response.json({error:'请求格式无效'},{status:400});}
  const value=validate(body);
  if(value.error)return Response.json({error:value.error},{status:400});
  const updatedAt=new Date().toISOString();
  await env.DB.prepare(`UPDATE site_update_settings SET
    enabled=?,mode=?,interval_hours=?,daily_times=?,weekdays=?,timezone=?,updated_by=?,updated_at=?
    WHERE setting_key='global'`)
    .bind(value.enabled?1:0,value.mode,value.intervalHours,JSON.stringify(value.dailyTimes),JSON.stringify(value.weekdays),value.timezone,user.id,updatedAt).run();
  return Response.json({ok:true,settings:{...value,updatedAt}});
}
