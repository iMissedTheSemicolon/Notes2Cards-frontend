import { AppClient } from './AppClient'

export const dynamic = 'force-static'

const DEMO_USER = {
  id: 'demo-student-id',
  email: 'student@notes2cards.study',
  user_metadata: {
    full_name: 'Alex Rivera',
    avatar_url: '',
  },
};

const DEMO_PROFILE = {
  full_name: 'Alex Rivera',
  email: 'student@notes2cards.study',
  plan: 'pro',
  pages_used_this_cycle: 14,
  cycle_reset_at: new Date().toISOString(),
  plan_expires_at: null,
};

export default function AppDashboard() {
  return <AppClient user={DEMO_USER} profile={DEMO_PROFILE} />
}
