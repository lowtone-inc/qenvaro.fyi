import { Layout } from './layout.js';

// 라우트 = { path, body }. path 가 '/' 로 끝나면 index.html 로 출력된다.
export const htmlRoute = (props) => ({ path: props.path, body: Layout(props).toString() });
export const fileRoute = (path, body) => ({ path, body });
