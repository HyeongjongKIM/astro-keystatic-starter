import { fileURLToPath } from 'node:url';
import { root } from 'astro:config/server';
import { readContent } from '@starter/content/reader';

export const reader = readContent(fileURLToPath(new URL('../../', root)));
