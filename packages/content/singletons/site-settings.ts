import { singleton, fields } from '@keystatic/core';

export const siteSettings = singleton({
  label: 'Site settings',
  path: 'content/settings/site',
  schema: {
    siteName: fields.text({
      label: 'Site name',
      validation: { isRequired: true },
    }),
    description: fields.text({ label: 'Description', multiline: true }),
    logo: fields.image({
      label: 'Logo',
      directory: 'apps/site/src/assets/images/settings',
      publicPath: '@assets/images/settings/',
    }),
    defaultSEO: fields.object(
      {
        title: fields.text({ label: 'Default title' }),
        description: fields.text({
          label: 'Default description',
          multiline: true,
        }),
      },
      { label: 'SEO defaults' },
    ),
  },
});
