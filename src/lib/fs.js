import { mkdir, writeFile, cp, rm, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export const cleanDir = (dir) => rm(dir, { recursive: true, force: true });

export const writeFileSafe = async (filePath, contents) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
};

export const copyDir = (from, to) => cp(from, to, { recursive: true });

export const readMarkdownFiles = async (dir) => {
  const entries = await readdir(dir);
  const files = entries.filter((name) => name.endsWith('.md'));
  return Promise.all(
    files.map(async (name) => ({ name, source: await readFile(path.join(dir, name), 'utf8') })),
  );
};
