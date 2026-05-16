import React from "react";

type Props = {
  content: string;
};

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string; key: string }
  | { type: "paragraph"; text: string; key: string }
  | { type: "list"; items: string[]; key: string };

type InlineToken =
  | { type: "text"; text: string; key: string }
  | { type: "bold"; text: string; key: string }
  | { type: "link"; text: string; href: string; key: string };

function normalizeMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const normalized: string[] = [];

  for (const line of lines) {
    const previous = normalized[normalized.length - 1];
    const trimmed = line.trim();

    if (previous && previous.trim().endsWith("]") && /^\(https?:\/\/.+\)$/.test(trimmed)) {
      normalized[normalized.length - 1] = `${previous}${trimmed}`;
      continue;
    }

    normalized.push(line);
  }

  return normalized.join("\n");
}

function parseBlocks(markdown: string): Block[] {
  const lines = normalizeMarkdown(markdown).split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push({
      type: "paragraph",
      text: paragraph.join(" ").trim(),
      key: `p-${blocks.length}`,
    });
    paragraph = [];
  }

  function flushList() {
    if (list.length === 0) return;
    blocks.push({ type: "list", items: list, key: `l-${blocks.length}` });
    list = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2],
        key: `h-${blocks.length}`,
      });
      continue;
    }

    const listMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (listMatch) {
      flushParagraph();
      list.push(listMatch[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function isSafeHref(href: string) {
  return /^(https?:\/\/|mailto:)/i.test(href);
}

function renderBoldText(text: string) {
  const parts: React.ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index));
    }

    parts.push(<strong key={`strong-${parts.length}`}>{match[1]}</strong>);
    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+(?:\)[^\s)]*)?)\)|\*\*(.+?)\*\*|(https?:\/\/[^\s)]+)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push({
        type: "text",
        text: text.slice(cursor, match.index),
        key: `t-${tokens.length}`,
      });
    }

    if (match[1] && match[2]) {
      tokens.push({
        type: "link",
        text: match[1],
        href: match[2],
        key: `a-${tokens.length}`,
      });
    } else if (match[3]) {
      tokens.push({
        type: "bold",
        text: match[3],
        key: `b-${tokens.length}`,
      });
    } else if (match[4]) {
      tokens.push({
        type: "link",
        text: match[4],
        href: match[4],
        key: `u-${tokens.length}`,
      });
    }

    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    tokens.push({ type: "text", text: text.slice(cursor), key: `t-${tokens.length}` });
  }

  return tokens;
}

function InlineMarkdown({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((token) => {
        if (token.type === "bold") {
          return <strong key={token.key}>{token.text}</strong>;
        }

        if (token.type === "link") {
          const href = token.href.trim();
          if (!isSafeHref(href)) return <React.Fragment key={token.key}>{token.text}</React.Fragment>;

          return (
            <a key={token.key} href={href} target="_blank" rel="noreferrer">
              {renderBoldText(token.text)}
            </a>
          );
        }

        return <React.Fragment key={token.key}>{token.text}</React.Fragment>;
      })}
    </>
  );
}

export function MarkdownNotes({ content }: Props) {
  const blocks = parseBlocks(content);

  if (blocks.length === 0) {
    return <p className="text-sm text-gray-400">Sin notas capturadas.</p>;
  }

  return (
    <div className="meeting-notes">
      {blocks.map((block) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h1 key={block.key}>
                <InlineMarkdown text={block.text} />
              </h1>
            );
          }

          if (block.level === 2) {
            return (
              <h2 key={block.key}>
                <InlineMarkdown text={block.text} />
              </h2>
            );
          }

          return (
            <h3 key={block.key}>
              <InlineMarkdown text={block.text} />
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={block.key}>
              {block.items.map((item, index) => (
                <li key={`${block.key}-${index}`}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={block.key}>
            <InlineMarkdown text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
