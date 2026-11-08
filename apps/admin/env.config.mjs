import { envField } from 'astro/config';

// Repository identity and branding are public; credentials remain runtime secrets.
export const adminEnv = {
  schema: {
    ADMIN_BRAND_NAME: envField.string({
      context: 'client',
      access: 'public',
      default: 'Content Admin',
    }),
    KEYSTATIC_GITHUB_REPO: envField.string({
      context: 'client',
      access: 'public',
      default: 'customer/replace-me',
    }),
  },
};
