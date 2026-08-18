import { deleteCurrentSession, isSameOrigin, withClearedSessionCookie } from '../../../auth';

export const dynamic='force-dynamic';

export async function POST(request){
  if(!isSameOrigin(request))return Response.json({error:'请求来源无效'},{status:403});
  await deleteCurrentSession();
  return withClearedSessionCookie(Response.json({ok:true}));
}
