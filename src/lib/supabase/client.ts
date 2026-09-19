// Mock client for Frontend Showcase demonstration (zero secrets or backend dependencies)
export function createClient() {
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
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: {}, error: null }),
      signUp: async () => ({ data: {}, error: null }),
      signInWithOAuth: async () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/app';
        }
        return { data: {}, error: null };
      },
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: {}, error: null }),
    },
  };
}
