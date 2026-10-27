// 마크다운 상단의 YAML 프론트매터(간단한 부분집합)를 파싱한다.
// 지원: `key: value`, `key: [a, b]`, 따옴표 문자열, true/false
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const unquote = (value) => value.replace(/^(['"])(.*)\1$/, '$2');

const parseScalar = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return unquote(value);
};

const parseValue = (value) => {
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => parseScalar(item.trim()))
      .filter((item) => item !== '');
  }
  return parseScalar(value);
};

export const parseFrontmatter = (source) => {
  const match = source.match(FRONTMATTER_RE);
  if (!match) return { data: {}, content: source };

  const data = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([\w-]+)\s*:\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, parseValue(value.trim())]),
  );

  return { data, content: source.slice(match[0].length) };
};
