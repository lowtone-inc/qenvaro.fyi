import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { config } from './config.js';
import { cleanDir, copyDir, writeFileSafe } from './lib/fs.js';
import { createPostRepository, loadPages } from './lib/content.js';
import { homeRoutes } from './templates/pages/home.js';
import { postRoutes } from './templates/pages/post.js';
import { tagRoutes } from './templates/pages/tags.js';
import { staticPageRoutes, notFoundRoute } from './templates/pages/static.js';
import { feedRoutes } from './templates/feed.js';

// 라우트 생성기 레지스트리: 새 페이지 타입은 여기에 함수 하나만 추가하면 된다.
const routeGenerators = [homeRoutes, postRoutes, tagRoutes, staticPageRoutes, notFoundRoute, feedRoutes];

const outputFile = (routePath) =>
  path.join(config.paths.out, routePath.endsWith('/') ? `${routePath}index.html` : routePath);

const assertUniquePaths = (routes) => {
  const seen = new Set();
  routes.forEach(({ path: p }) => {
    if (seen.has(p)) throw new Error(`[build] 중복된 경로: ${p}`);
    seen.add(p);
  });
};

export const build = async () => {
  const started = performance.now();
  const context = {
    posts: await createPostRepository(config.paths.posts),
    pages: await loadPages(config.paths.pages),
  };

  const routes = routeGenerators.flatMap((generate) => generate(context));
  assertUniquePaths(routes);

  await cleanDir(config.paths.out);
  await copyDir(config.paths.public, config.paths.out);
  await Promise.all(routes.map((route) => writeFileSafe(outputFile(route.path), route.body)));

  const ms = Math.round(performance.now() - started);
  console.log(`✓ ${routes.length} routes, ${context.posts.all().length} posts → ${config.paths.out}/ (${ms}ms, base "${config.basePath || '/'}")`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
