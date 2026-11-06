import { collection, fields } from '@keystatic/core';
import { titleField } from '../fields/title';
import { bodyField } from '../blocks/body';

export const pages = collection({
  label: 'Pages',
  slugField: 'title',
  path: 'content/pages/**/',
  format: { data: 'yaml' },
  schema: {
    title: titleField(),
    description: fields.text({ label: 'Description', multiline: true }),
    order: fields.integer({
      label: 'Order',
      defaultValue: 0,
      validation: { isRequired: true },
    }),
    showInNavigation: fields.checkbox({
      label: 'Show in navigation',
      defaultValue: true,
    }),
    content: bodyField('pages'),
  },
});
