import { useEffect } from 'react';

const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

function emojiToCodepoint(emoji: string): string {
  return [...emoji]
    .filter(c => c !== '\uFE0F' && c !== '\u200D')
    .map(c => c.codePointAt(0)!.toString(16))
    .join('-');
}

function replaceEmojisInNode(node: Text) {
  const parent = node.parentElement;
  if (!parent || parent.classList.contains('_ae') || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.tagName === 'TEXTAREA' || parent.tagName === 'INPUT') return;

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
    img.onerror = () => {
      // Fallback: replace img with original emoji text
      img.replaceWith(document.createTextNode(match![0]));
    };
    fragment.appendChild(img);
    lastIndex = match.index + match[0].length;
  }

  if (!replaced) return;

  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  parent.classList.add('_ae');
  node.parentNode?.replaceChild(fragment, node);
}

function processNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    replaceEmojisInNode(node as Text);
    return;
  }
  const el = node as Element;
  if (!el.tagName) return;
  if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'IMG') return;
  if (el.classList?.contains('_ae')) return;
  const children = Array.from(node.childNodes);
  children.forEach(processNode);
}

export default function AppleEmojiProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    // Initial pass (slight delay to let React render)
    const t = setTimeout(() => processNode(root), 100);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          processNode(node);
        }
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
