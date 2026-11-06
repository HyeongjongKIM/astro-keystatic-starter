import { createReader } from '@keystatic/core/reader';
import { contentConfig } from './index';

// Server/build-time entrypoint; never import from browser scripts.
export const readContent = (repositoryRoot: string) =>
  createReader(repositoryRoot, contentConfig);
