import { html } from '../../lib/html.js';
import { url } from '../../lib/url.js';
import { Article } from './post.js';
import { Hero } from '../components.js';
import { htmlRoute } from '../route.js';

// content/pages/*.md → /{slug}/
export const staticPageRoutes = ({ pages }) =>
  pages.map((page) =>
    htmlRoute({
      path: `/${page.slug}/`,
      title: page.title,
      description: page.description || undefined,
      main: Article({
        header: html`<h1 class="article-title">${page.title}</h1>${page.description ? html`<p class="article-desc">${page.description}</p>` : ''}`,
        body: page.html,
      }),
    }),
  );

export const notFoundRoute = () => [
  htmlRoute({
    path: '/404.html',
    title: '404',
    main: html`
      ${Hero({ eyebrow: 'Error 404', title: 'Page', highlight: 'not found', description: '요청하신 페이지가 존재하지 않거나 이동되었습니다.' })}
      <div class="container center"><a class="btn btn-primary" href="${url('/')}">홈으로 돌아가기</a></div>`,
  }),
];
