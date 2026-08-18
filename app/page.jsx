import InterviewLab from '../src/main';
import { getAppUser } from './auth';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getAppUser();
  return <InterviewLab initialUser={user} />;
}
