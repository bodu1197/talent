// Rollbar 설정
const rollbarConfig = {
  accessToken:
    process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN ||
    process.env.NEXT_PUBLIC_ROLLBAR_TALENT_CLIENT_TOKEN_1764791738,
  environment: process.env.NODE_ENV || 'development',
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    client: {
      javascript: {
        code_version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '1.0.0',
        source_map_enabled: true,
      },
    },
  },
};

export default rollbarConfig;
