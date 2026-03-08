import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

function emojiToCodepoint(emoji: string): string {
  return [...emoji]
    .filter(c => c !== '\uFE0F' && c !== '\u200D')
    .map(c => c.codePointAt(0)!.toString(16))
    .join('-');
}

function replaceEmojisInNode(node: Text) {
  const parent = node.parentElement;
  if (!parent || parent.dataset.ae === '1' || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.tagName === 'TEXTAREA' || parent.tagName === 'INPUT') return;

  const text = node.textContent || '';
  EMOJI_REGEX.lastIndex = 0;
  if (!EMOJI_REGEX.test(text)) return;
  EMOJI_REGEX.lastIndex = 0;

  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;
  let replaced = false;

  while ((match = EMOJI_REGEX.exec(text)) !== null) {
    replaced = true;
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const img = document.createElement('img');
    const cp = emojiToCodepoint(match[0]);
    img.src = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/${cp}.png`;
    img.alt = match[0];
    img.className = 'apple-emoji';
    img.loading = 'lazy';
    img.draggable = false;
    const emoji = match[0];
    img.onerror = () => { img.replaceWith(document.createTextNode(emoji)); };
    fragment.appendChild(img);
    lastIndex = match.index + match[0].length;
  }

  if (!replaced) return;
  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  parent.dataset.ae = '1';
  node.parentNode?.replaceChild(fragment, node);
}

function processNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    replaceEmojisInNode(node as Text);
    return;
  }
  const el = node as HTMLElement;
  if (!el.tagName || el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'IMG') return;
  if (el.dataset?.ae === '1') return;
  const children = Array.from(node.childNodes);
  for (let i = 0; i < children.length; i++) {
    processNode(children[i]);
  }
}

function processRoot() {
  const root = document.getElementById('root');
  if (root) processNode(root);
}

export function useAppleEmoji() {
  const location = useLocation();

  const run = useCallback(() => {
    // Run after React finishes rendering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => processRoot());
    });
  }, []);

  // Process on route change
  useEffect(() => { run(); }, [location.pathname, run]);

  // Light observer: only watches direct children additions (not deep subtree churn)
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    let timer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => processRoot(), 300);
    });

    observer.observe(root, { childList: true, subtree: true });
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, []);
}
