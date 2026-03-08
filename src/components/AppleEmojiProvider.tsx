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
  const el = node as Element;
  if (!el.tagName || el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'IMG') return;
  if ((el as HTMLElement).dataset?.ae === '1') return;
  const children = Array.from(node.childNodes);
  for (let i = 0; i < children.length; i++) {
    processNode(children[i]);
  }
}

export default function AppleEmojiProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    // Initial pass
    requestIdleCallback(() => processNode(root));

    let pending = false;
    const queue: Node[] = [];

    function flush() {
      pending = false;
      const nodes = queue.splice(0, queue.length);
      for (const n of nodes) processNode(n);
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (let i = 0; i < m.addedNodes.length; i++) {
          const n = m.addedNodes[i];
          // Skip our own img insertions
          if ((n as Element).classList?.contains('apple-emoji')) continue;
          queue.push(n);
        }
      }
      if (queue.length > 0 && !pending) {
        pending = true;
        requestAnimationFrame(flush);
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
