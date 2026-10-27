// HTML 문자열 생성 헬퍼. 모든 템플릿이 공유한다.
const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

// 신뢰할 수 있는 HTML 조각임을 표시하는 래퍼 (이스케이프 생략)
class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

export const raw = (value) => new SafeHtml(String(value ?? ''));

const renderValue = (value) => {
  if (value == null || value === false) return '';
  if (Array.isArray(value)) return value.map(renderValue).join('');
  if (value instanceof SafeHtml) return value.value;
  return escapeHtml(value);
};

// html`<p>${userText}</p>` — 보간 값은 자동 이스케이프, 결과는 SafeHtml
export const html = (strings, ...values) =>
  raw(strings.reduce((acc, str, i) => acc + str + (i < values.length ? renderValue(values[i]) : ''), ''));
