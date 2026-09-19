// Mock server client for Frontend Showcase demonstration (zero secrets or backend dependencies)
export async function createClient() {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: 'demo-user-id',
            email: 'student@notes2cards.study',
            user_metadata: { full_name: 'Alex Rivera' },
          },
        },
        error: null,
      }),
      exchangeCodeForSession: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              full_name: 'Alex Rivera',
              email: 'student@notes2cards.study',
              plan: 'pro',
              pages_used_this_cycle: 14,
              cycle_reset_at: new Date().toISOString(),
              plan_expires_at: null,
            },
            error: null,
          }),
        }),
      }),
    }),
  };
}
