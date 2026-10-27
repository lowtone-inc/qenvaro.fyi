// 클라이언트 동작: 테마 전환, 코드 복사. 기능별로 init 함수를 분리한다.
const STORAGE_KEY = 'theme';

const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* 저장 불가 환경은 무시 */
    }
  },
};

const currentTheme = () =>
  document.documentElement.dataset.theme ??
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

const initThemeToggle = () => {
  document.querySelectorAll('[data-theme-toggle]').forEach((button) =>
    button.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      storage.set(STORAGE_KEY, next);
    }),
  );
};

const flashLabel = (button, label, ms = 1500) => {
  const original = button.textContent;
  button.textContent = label;
  setTimeout(() => (button.textContent = original), ms);
};

const initCopyButtons = () => {
  document.querySelectorAll('.code-block').forEach((block) => {
    const button = block.querySelector('.copy-btn');
    const code = block.querySelector('code');
    button?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        flashLabel(button, 'Copied!');
      } catch {
        flashLabel(button, 'Failed');
      }
    });
  });
};

[initThemeToggle, initCopyButtons].forEach((init) => init());
