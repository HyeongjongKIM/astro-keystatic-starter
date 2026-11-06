import { fields } from '@keystatic/core';

export const bodyField = (kind: 'pages' | 'posts') =>
  fields.blocks(
    {
      richText: {
        label: 'Rich text',
        schema: fields.object({
          body: fields.mdx({
            label: 'Body',
            options: {
              image: {
                directory: `apps/site/src/assets/images/${kind}`,
                publicPath: `@assets/images/${kind}/`,
              },
            },
          }),
        }),
      },
    },
    { label: 'Content' },
  );
