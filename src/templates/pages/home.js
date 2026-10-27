import { config } from '../../config.js';
import { html } from '../../lib/html.js';
import { paginate } from '../../lib/content.js';
import { pagePath } from '../../lib/url.js';
import { Hero, PostGrid, Pagination, SectionHeader, TagChip } from '../components.js';
import { htmlRoute } from '../route.js';

const TagCloud = (tags) => html`<div class="tag-list tag-cloud">${tags.map(({ name, count }) => TagChip(name, { count }))}</div>`;

export const homeRoutes = ({ posts }) =>
  paginate(posts.all(), config.postsPerPage).map(({ page, totalPages, items }) =>
    htmlRoute({
      path: pagePath(page),
      title: page > 1 ? `Blog — ${page} 페이지` : undefined,
      main: html`
        ${page === 1 ? Hero({ ...config.hero, description: config.description }) : ''}
        <section class="container section">
          ${SectionHeader({ title: 'Latest posts', subtitle: `${posts.all().length}개의 글` })}
          ${page === 1 ? TagCloud(posts.tags()) : ''}
          ${PostGrid(items)}
          ${Pagination({ page, totalPages })}
        </section>`,
    }),
  );
