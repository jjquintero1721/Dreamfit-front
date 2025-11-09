export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  tokenStorage: {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  },
} as const;