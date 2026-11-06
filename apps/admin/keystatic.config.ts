import { config } from '@keystatic/core';

// Task 02 supplies the shared schemas. Configure the customer repo before deployment.
export default config({
  storage: { kind: 'github', repo: 'customer/replace-me' },
  collections: {},
});
