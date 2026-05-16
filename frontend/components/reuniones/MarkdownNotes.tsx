import React from "react";

type Props = {
  content: string;
};

type ListItem = {
  text: string;
  children: ListItem[];
  key: string;
};

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string; key: string }
  | { type: "paragraph"; text: string; key: string }
  | { type: "list"; items: ListItem[]; key: string };

type InlineToken =
  | { type: "text"; text: string; key: string }
  | { type: "bold"; text: string; key: string }
  | { type: "link"; text: string; href: string; key: string };

const SECTION_HEADINGS = new Set([
  "proposito de la reunion",
  "puntos clave",
  "temas",
  "proximos pasos",
  "action items",
  "decisiones",
  "pendientes",
  "resumen",
  "transcripcion",
  "observaciones",
]);

function normalizeLineEndings(content: string) {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
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

function normalizeHeading(text: string) {
  return text
    .trim()
    .replace(/:$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getIndent(line: string) {
  return (line.match(/^\s*/) ?? [""])[0].replace(/\t/g, "    ").length;
}

function getNextContent(lines: string[], startIndex: number) {
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (trimmed) return trimmed;
  }

  return "";
}

function isListLine(line: string) {
  return /^\s*[-*]\s+/.test(line);
}

function isRecordingLine(line: string) {
  return /^view recording\b/i.test(line.trim());
}

function looksLikeSubheading(text: string, nextContent: string) {
  if (!nextContent || !isListLine(nextContent)) return false;
  if (text.length > 90) return false;
  if (/https?:\/\//i.test(text)) return false;
  if (/[.!?]$/.test(text)) return false;
  if (isRecordingLine(text)) return false;

  return true;
}

function parseHeading(
  text: string,
  isFirstContent: boolean,
  nextContent: string
): { level: 1 | 2 | 3; text: string } | null {
  const markdownHeading = /^(#{1,3})\s+(.+)$/.exec(text);
  if (markdownHeading) {
    return {
      level: markdownHeading[1].length as 1 | 2 | 3,
      text: markdownHeading[2].trim(),
    };
  }

  if (isFirstContent && !isRecordingLine(text)) {
    return { level: 1, text };
  }

  const normalized = normalizeHeading(text);
  if (SECTION_HEADINGS.has(normalized)) {
    return { level: 2, text };
  }

  if (looksLikeSubheading(text, nextContent)) {
    return { level: 3, text };
  }

  return null;
}

function parseBlocks(content: string): Block[] {
  const lines = normalizeLineEndings(content).split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let listItems: ListItem[] = [];
  let listStack: { indent: number; items: ListItem[] }[] = [
    { indent: -1, items: listItems },
  ];
  let currentItem: ListItem | null = null;
  let isFirstContent = true;

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
    if (listItems.length === 0) return;
    blocks.push({ type: "list", items: listItems, key: `l-${blocks.length}` });
    listItems = [];
    listStack = [{ indent: -1, items: listItems }];
    currentItem = null;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const listMatch = /^(\s*)[-*]\s+(.+)$/.exec(line);
    if (listMatch) {
      flushParagraph();

      const indent = getIndent(line);
      while (
        listStack.length > 1 &&
        indent <= listStack[listStack.length - 1].indent
      ) {
        listStack.pop();
      }

      const parent = listStack[listStack.length - 1];
      const item: ListItem = {
        text: listMatch[2].trim(),
        children: [],
        key: `li-${index}`,
      };
      parent.items.push(item);
      listStack.push({ indent, items: item.children });
      currentItem = item;
      isFirstContent = false;
      continue;
    }

    if (currentItem && /^\s+/.test(line)) {
      currentItem.text = `${currentItem.text} ${trimmed}`;
      continue;
    }

    flushList();

    const heading = parseHeading(trimmed, isFirstContent, getNextContent(lines, index));
    if (heading) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: heading.level,
        text: heading.text,
        key: `h-${blocks.length}`,
      });
      isFirstContent = false;
      continue;
    }

    paragraph.push(trimmed);
    isFirstContent = false;
  }

  flushParagraph();
  flushList();

  return blocks;
}

function isSafeHref(href: string) {
  return /^(https?:\/\/|mailto:)/i.test(href);
}

function stripTrailingUrlPunctuation(href: string) {
  return href.replace(/[.,;:]$/, "");
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+(?:\)[^\s)]*)?)\)|\*\*(.+?)\*\*|(https?:\/\/[^\s]+)/g;
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
        href: stripTrailingUrlPunctuation(match[2]),
        key: `a-${tokens.length}`,
      });
    } else if (match[3]) {
      tokens.push({
        type: "bold",
        text: match[3],
        key: `b-${tokens.length}`,
      });
    } else if (match[4]) {
      const href = stripTrailingUrlPunctuation(match[4]);
      tokens.push({
        type: "link",
        text: href,
        href,
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

function InlineLabel({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index));
    }

    parts.push(<strong key={`label-strong-${parts.length}`}>{match[1]}</strong>);
    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}

function InlineBasic({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((token) => {
        if (token.type === "bold") {
          return <strong key={token.key}>{token.text}</strong>;
        }

        if (token.type === "link") {
          const href = token.href.trim();
          if (!isSafeHref(href)) {
            return <React.Fragment key={token.key}>{token.text}</React.Fragment>;
          }

          return (
            <a key={token.key} href={href} target="_blank" rel="noreferrer">
              <InlineLabel text={token.text} />
            </a>
          );
        }

        return <React.Fragment key={token.key}>{token.text}</React.Fragment>;
      })}
    </>
  );
}

function renderSpecialFathomLink(text: string) {
  const recordingMatch = /^(VIEW RECORDING(?:\s*-\s*[^:]+)?)\s*:\s*(https?:\/\/\S+)$/i.exec(
    text
  );

  if (recordingMatch) {
    return (
      <a
        href={stripTrailingUrlPunctuation(recordingMatch[2])}
        target="_blank"
        rel="noreferrer"
      >
        {recordingMatch[1]}
      </a>
    );
  }

  const watchMatch = /^(.*?)(?:\s+-\s+)?(WATCH\s*\([^)]+\)):\s*(https?:\/\/\S+)$/i.exec(
    text
  );

  if (watchMatch) {
    return (
      <>
        <InlineBasic text={watchMatch[1].trimEnd()} />
        {" - "}
        <a
          href={stripTrailingUrlPunctuation(watchMatch[3])}
          target="_blank"
          rel="noreferrer"
        >
          {watchMatch[2]}
        </a>
      </>
    );
  }

  return null;
}

function InlineText({
  text,
  emphasizeLead = false,
}: {
  text: string;
  emphasizeLead?: boolean;
}) {
  const special = renderSpecialFathomLink(text);
  if (special) return <>{special}</>;

  if (emphasizeLead && !/WATCH\s*\(/i.test(text)) {
    const fullLead = /^([^:]{2,70}:)$/.exec(text);
    if (fullLead && !/https?$/i.test(fullLead[1])) {
      return <strong>{fullLead[1]}</strong>;
    }

    const leadMatch = /^([^:]{2,70}:)(\s+.+)$/.exec(text);
    if (leadMatch && !/https?$/i.test(leadMatch[1])) {
      return (
        <>
          <strong>{leadMatch[1]}</strong>
          <InlineBasic text={leadMatch[2]} />
        </>
      );
    }
  }

  return <InlineBasic text={text} />;
}

function renderListItems(items: ListItem[]) {
  return items.map((item) => (
    <li key={item.key}>
      <span>
        <InlineText text={item.text} emphasizeLead />
      </span>
      {item.children.length > 0 && <ul>{renderListItems(item.children)}</ul>}
    </li>
  ));
}

export function MeetingNotes({ content }: Props) {
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
                <InlineText text={block.text} />
              </h1>
            );
          }

          if (block.level === 2) {
            return (
              <h2 key={block.key}>
                <InlineText text={block.text} />
              </h2>
            );
          }

          return (
            <h3 key={block.key}>
              <InlineText text={block.text} />
            </h3>
          );
        }

        if (block.type === "list") {
          return <ul key={block.key}>{renderListItems(block.items)}</ul>;
        }

        return (
          <p key={block.key}>
            <InlineText text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

export const MarkdownNotes = MeetingNotes;
