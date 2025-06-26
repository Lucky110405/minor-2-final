export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  appearance: {
    baseTheme: 'light',
    variables: {
      colorPrimary: '#3b82f6',
      colorText: '#1f2937',
    },
  },
  // Development vs Production specific configs
  ...(process.env.NODE_ENV === 'development' 
    ? {
        // Development specific options
        debug: true,
      }
    : {
        // Production specific options
        debug: false,
      }
  ),
};