import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'github', repo: 'compatibility-test/replace-me' },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.markdoc({ label: 'Content' }),
        image: fields.image({ label: 'Image', directory: 'public/images', publicPath: '/images/' }),
      },
    }),
  },
});
