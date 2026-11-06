import { envField } from 'astro/config';

// Repository identity is public; authentication credentials remain runtime secrets.
export const adminEnv = {
  schema: {
    KEYSTATIC_GITHUB_REPO: envField.string({
      context: 'client',
      access: 'public',
      default: 'customer/replace-me',
    }),
  },
};
