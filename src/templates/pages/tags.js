import { html } from '../../lib/html.js';
import { tagPath } from '../../lib/url.js';
import { Hero, PostGrid, TagChip } from '../components.js';
import { htmlRoute } from '../route.js';

const TagPage = ({ path, title, heroTitle, highlight, description, content }) =>
  htmlRoute({
    path,
    title,
    main: html`
      ${Hero({ eyebrow: 'Tags', title: heroTitle, highlight, description })}
      <section class="container section">${content}</section>`,
  });

const tagIndexRoute = (posts) => {
  const tags = posts.tags();
  return TagPage({
    path: '/tags/',
    title: 'Tags',
    heroTitle: 'Browse by',
    highlight: 'topic',
    description: `${tags.length}개의 태그`,
    content: html`<div class="tag-list tag-cloud">${tags.map(({ name, count }) => TagChip(name, { count }))}</div>`,
  });
};

const tagDetailRoute = (posts, { name }) => {
  const list = posts.byTag(name);
  return TagPage({
    path: tagPath(name),
    title: `#${name}`,
    heroTitle: 'Posts tagged',
    highlight: `#${name}`,
    description: `${list.length}개의 글`,
    content: PostGrid(list),
  });
};

export const tagRoutes = ({ posts }) => [tagIndexRoute(posts), ...posts.tags().map((tag) => tagDetailRoute(posts, tag))];
