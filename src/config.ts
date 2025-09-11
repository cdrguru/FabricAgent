
// Centralized runtime configuration using Vite env variables
export const config = {
  apiBase: (import.meta.env.VITE_API_BASE as string) || 'https://api.fabricprompts.com',
  enableExperimental: String(import.meta.env.VITE_ENABLE_EXPERIMENTAL || '').toLowerCase() === 'true',
  helpCenterUrl: (import.meta.env.VITE_HELP_CENTER_URL as string) || 'https://docs.fabricprompts.com',
  analyticsKey: (import.meta.env.VITE_ANALYTICS_KEY as string) || ''
};
export default config;
