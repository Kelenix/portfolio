import { Fragment, type ReactNode } from "react";

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; lines: string[] }
  | { type: "code"; lang: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (/^```/.test(line)) {
      const lang = line.replace(/^```/, "").trim();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i]!)) {
        body.push(lines[i]!);
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", lang, text: body.join("\n") });
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1]!.length as 1 | 2 | 3,
        text: heading[2]!.trim(),
      });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const collected: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i]!)) {
        collected.push(lines[i]!.replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", lines: collected });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !/^(#{1,3})\s+/.test(lines[i]!) &&
      !/^>\s?/.test(lines[i]!) &&
      !/^\s*[-*]\s+/.test(lines[i]!) &&
      !/^\s*\d+\.\s+/.test(lines[i]!) &&
      !/^```/.test(lines[i]!)
    ) {
      paragraph.push(lines[i]!);
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

const INLINE_TOKENS = [
  { regex: /\*\*([^*\n]+)\*\*/, tag: "strong" as const },
  { regex: /`([^`\n]+)`/, tag: "code" as const },
  { regex: /\*([^*\n]+)\*/, tag: "em" as const },
  { regex: /_([^_\n]+)_/, tag: "em" as const },
  { regex: /\[([^\]]+)\]\(([^)\s]+)\)/, tag: "link" as const },
];

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    let best: {
      match: RegExpExecArray;
      tag: "strong" | "em" | "code" | "link";
    } | null = null;

    for (const { regex, tag } of INLINE_TOKENS) {
      const m = regex.exec(remaining);
      if (m && (best === null || m.index < best.match.index)) {
        best = { match: m, tag };
      }
    }

    if (!best) {
      nodes.push(remaining);
      break;
    }

    if (best.match.index > 0) {
      nodes.push(remaining.slice(0, best.match.index));
    }

    const k = `${keyPrefix}-${idx++}`;
    if (best.tag === "strong") {
      nodes.push(
        <strong key={k} style={{ color: "var(--foreground)" }}>
          {best.match[1]}
        </strong>
      );
    } else if (best.tag === "em") {
      nodes.push(<em key={k}>{best.match[1]}</em>);
    } else if (best.tag === "code") {
      nodes.push(
        <code
          key={k}
          className="px-1.5 py-0.5 rounded font-mono text-[0.85em]"
          style={{
            background: "var(--muted)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          }}
        >
          {best.match[1]}
        </code>
      );
    } else if (best.tag === "link") {
      const href = best.match[2]!;
      const isExternal = /^https?:\/\//.test(href);
      nodes.push(
        <a
          key={k}
          href={href}
          className="underline underline-offset-2 hover:opacity-70 transition-opacity"
          style={{ color: "var(--accent)" }}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {best.match[1]}
        </a>
      );
    }

    remaining = remaining.slice(best.match.index + best.match[0].length);
  }

  return nodes;
}

function renderBlock(block: Block, key: number): ReactNode {
  if (block.type === "heading") {
    const common = {
      className:
        block.level === 1
          ? "font-mono font-bold mt-10 mb-5 text-2xl tracking-tight"
          : block.level === 2
            ? "font-mono font-bold mt-8 mb-3 text-lg tracking-tight"
            : "font-mono font-semibold mt-6 mb-2 text-sm uppercase tracking-widest",
      style: { color: "var(--foreground)" },
    };
    if (block.level === 1) return <h1 key={key} {...common}>{renderInline(block.text, `h1-${key}`)}</h1>;
    if (block.level === 2) return <h2 key={key} {...common}>{renderInline(block.text, `h2-${key}`)}</h2>;
    return <h3 key={key} {...common}>{renderInline(block.text, `h3-${key}`)}</h3>;
  }

  if (block.type === "paragraph") {
    return (
      <p
        key={key}
        className="my-4 text-sm leading-relaxed"
        style={{ color: "var(--foreground)" }}
      >
        {renderInline(block.text, `p-${key}`)}
      </p>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote
        key={key}
        className="my-5 pl-4 border-l-2 italic text-sm"
        style={{
          borderColor: "var(--accent)",
          color: "var(--muted-foreground)",
        }}
      >
        {block.lines.map((line, li) => (
          <p key={li} className="my-1 leading-relaxed">
            {renderInline(line, `q-${key}-${li}`)}
          </p>
        ))}
      </blockquote>
    );
  }

  if (block.type === "code") {
    return (
      <pre
        key={key}
        className="my-5 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed"
        style={{
          background: "var(--muted)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        }}
        data-lang={block.lang || undefined}
      >
        <code>{block.text}</code>
      </pre>
    );
  }

  if (block.type === "ul") {
    return (
      <ul
        key={key}
        className="my-4 pl-5 list-disc space-y-1.5 text-sm"
        style={{ color: "var(--foreground)" }}
      >
        {block.items.map((it, li) => (
          <li key={li} className="leading-relaxed">
            {renderInline(it, `ul-${key}-${li}`)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ol
      key={key}
      className="my-4 pl-5 list-decimal space-y-1.5 text-sm"
      style={{ color: "var(--foreground)" }}
    >
      {block.items.map((it, li) => (
        <li key={li} className="leading-relaxed">
          {renderInline(it, `ol-${key}-${li}`)}
        </li>
      ))}
    </ol>
  );
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <Fragment>
      {blocks.map((b, i) => renderBlock(b, i))}
    </Fragment>
  );
}

export function stripMarkdown(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
