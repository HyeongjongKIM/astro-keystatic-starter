import { fields } from '@keystatic/core';

export const titleField = () =>
  fields.slug({ name: { label: 'Title', validation: { isRequired: true } } });
