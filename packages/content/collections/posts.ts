import { collection, fields } from '@keystatic/core';
import { titleField } from '../fields/title';
import { bodyField } from '../blocks/body';

export const posts = collection({
  label: 'Posts',
  slugField: 'title',
  columns: ['title', 'status', 'publishedDate'],
  path: 'content/posts/*/',
  format: { data: 'yaml' },
  schema: {
    title: titleField(),
    excerpt: fields.text({ label: 'Excerpt', multiline: true }),
    publishedDate: fields.date({
      label: 'Published date',
      validation: { isRequired: true },
    }),
    status: fields.select({
      label: 'Status',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
    }),
    content: bodyField('posts'),
  },
});
