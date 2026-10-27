// 로컬 개발 서버: dist/ 를 서빙하고, 소스가 바뀌면 다시 빌드한다.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../src/config.js';

const PORT = Number(process.env.PORT ?? 4000);
const WATCH_DIRS = ['content', 'public', 'src'];
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/rss+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

// 템플릿 모듈 캐시를 피하려고 빌드는 매번 별도 프로세스로 실행한다.
const runBuild = () =>
  new Promise((resolve) => spawn(process.execPath, ['src/build.js'], { stdio: 'inherit' }).on('exit', resolve));

const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

const resolveFile = async (urlPath) => {
  const safePath = path.normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const candidate = path.join(config.paths.out, safePath);
  const info = await stat(candidate).catch(() => null);
  if (info?.isDirectory()) return path.join(candidate, 'index.html');
  return info ? candidate : null;
};

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url);
  const target = file ?? path.join(config.paths.out, '404.html');
  res.writeHead(file ? 200 : 404, { 'Content-Type': MIME[path.extname(target)] ?? 'application/octet-stream' });
  res.end(await readFile(target));
});

await runBuild();
const rebuild = debounce(runBuild, 100);
WATCH_DIRS.forEach((dir) => watch(dir, { recursive: true }, rebuild));
server.listen(PORT, () => console.log(`▶ http://localhost:${PORT}`));
