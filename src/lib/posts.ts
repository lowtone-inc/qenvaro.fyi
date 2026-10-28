import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const byNewest = (a: Post, b: Post) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

/** 공개된 글을 최신순으로 반환 (draft는 dev 모드에서만 노출) */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort(byNewest);
}

export interface TagGroup {
  name: string;
  posts: Post[];
}

/** 태그별로 글을 묶어 글 수 내림차순(동률은 이름순)으로 반환 */
export async function getTagGroups(): Promise<TagGroup[]> {
  const groups = new Map<string, TagGroup>();
  for (const post of await getPosts()) {
    for (const name of post.data.tags) {
      const group = groups.get(name) ?? { name, posts: [] };
      group.posts.push(post);
      groups.set(name, group);
    }
  }
  return [...groups.values()].sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name));
}

/** 이전/다음 글 계산 (posts는 최신순) */
export function getAdjacent(posts: Post[], id: string) {
  const index = posts.findIndex((p) => p.id === id);
  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

/** 목록을 perPage 단위로 자른다 (빈 목록도 1페이지) */
export function paginate<T>(items: T[], perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  return Array.from({ length: totalPages }, (_, i) => ({
    page: i + 1,
    totalPages,
    items: items.slice(i * perPage, (i + 1) * perPage),
  }));
}
