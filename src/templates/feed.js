import { config } from '../config.js';
import { escapeHtml } from '../lib/html.js';
import { absoluteUrl, postPath } from '../lib/url.js';
import { fileRoute } from './route.js';

const FEED_LIMIT = 20;

const tag = (name, value) => `<${name}>${escapeHtml(value)}</${name}>`;

const feedItem = (post) => {
  const link = absoluteUrl(postPath(post.slug));
  return `<item>${[
    tag('title', post.title),
    tag('link', link),
    tag('guid', link),
    tag('pubDate', post.date.toUTCString()),
    tag('description', post.description),
    ...post.tags.map((name) => tag('category', name)),
  ].join('')}</item>`;
};

export const feedRoutes = ({ posts }) => [
  fileRoute(
    '/feed.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>${[
      tag('title', config.title),
      tag('link', absoluteUrl('/')),
      tag('description', config.description),
      tag('language', config.lang),
    ].join('')}${posts.all().slice(0, FEED_LIMIT).map(feedItem).join('')}</channel></rss>
`,
  ),
];
