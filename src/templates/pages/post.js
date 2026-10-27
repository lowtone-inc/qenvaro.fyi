import { html, raw } from '../../lib/html.js';
import { postPath, url } from '../../lib/url.js';
import { PostMeta, TagList, PostNeighbors, Arrow } from '../components.js';
import { htmlRoute } from '../route.js';

export const Article = ({ header, body, footer }) => html`
  <article class="container article">
    <header class="article-header">${header}</header>
    <div class="prose">${raw(body)}</div>
    ${footer ?? ''}
  </article>`;

export const postRoutes = ({ posts }) =>
  posts.all().map((post) =>
    htmlRoute({
      path: postPath(post.slug),
      title: post.title,
      description: post.description || undefined,
      type: 'article',
      main: Article({
        header: html`
          <a class="back-link" href="${url('/')}"><span class="flip">${Arrow()}</span> 모든 글</a>
          ${PostMeta(post)}
          <h1 class="article-title">${post.title}</h1>
          ${post.description ? html`<p class="article-desc">${post.description}</p>` : ''}
          ${TagList(post.tags)}`,
        body: post.html,
        footer: PostNeighbors(posts.neighbors(post.slug)),
      }),
    }),
  );
