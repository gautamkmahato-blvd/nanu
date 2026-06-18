// components/ui/MarkdownRenderer.tsx
// Reusable, fast markdown renderer for AI responses.
// Uses `marked` (fast, ~40KB) — converts MD to HTML string, styled with CSS.
// No React tree overhead like react-markdown — just a single dangerouslySetInnerHTML.
//
// Usage:
//   import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
//   <MarkdownRenderer content={aiResponse} />

'use client';

import { useMemo } from 'react';
import { marked } from 'marked';

// ---------------------------------------------------------------------------
// Configure marked for speed + safety
// ---------------------------------------------------------------------------

marked.setOptions({
  gfm: true,        // GitHub Flavored Markdown (tables, strikethrough, etc.)
  breaks: true,     // Convert \n to <br> (AI responses often use single newlines)
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  content: string;
  className?: string;
};

export default function MarkdownRenderer({ content, className = '' }: Props) {
  // Memoize parsed HTML — only re-parses when content changes
  const html = useMemo(() => {
    if (!content) return '';
    try {
      return marked.parse(content, { async: false }) as string;
    } catch {
      return content;
    }
  }, [content]);

  if (!content) return null;

  return (
    <div
      className={`md-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}