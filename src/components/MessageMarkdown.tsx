/**
 * MessageMarkdown - Renders markdown content for chat messages
 */

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MessageMarkdownProps {
  content: string;
}

export function MessageMarkdown({ content }: MessageMarkdownProps) {
  const components: Components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark as any}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: '0.5rem 0', borderRadius: '0.375rem' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    a({ node, children, ...props }: any) {
      return (
        <a
          className="text-primary underline hover:text-primary/80"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    ul({ node, children, ...props }: any) {
      return (
        <ul className="list-disc list-inside my-2 space-y-1" {...props}>
          {children}
        </ul>
      );
    },
    ol({ node, children, ...props }: any) {
      return (
        <ol className="list-decimal list-inside my-2 space-y-1" {...props}>
          {children}
        </ol>
      );
    },
    p({ node, children, ...props }: any) {
      return (
        <p className="my-2 leading-relaxed" {...props}>
          {children}
        </p>
      );
    },
    h1({ node, children, ...props }: any) {
      return (
        <h1 className="text-2xl font-bold mt-4 mb-2" {...props}>
          {children}
        </h1>
      );
    },
    h2({ node, children, ...props }: any) {
      return (
        <h2 className="text-xl font-bold mt-3 mb-2" {...props}>
          {children}
        </h2>
      );
    },
    h3({ node, children, ...props }: any) {
      return (
        <h3 className="text-lg font-bold mt-2 mb-1" {...props}>
          {children}
        </h3>
      );
    },
    blockquote({ node, children, ...props }: any) {
      return (
        <blockquote
          className="border-l-4 border-muted-foreground/30 pl-4 italic my-2"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    table({ node, children, ...props }: any) {
      return (
        <div className="overflow-x-auto my-2">
          <table className="min-w-full border border-border" {...props}>
            {children}
          </table>
        </div>
      );
    },
    th({ node, children, ...props }: any) {
      return (
        <th className="border border-border px-4 py-2 bg-muted font-semibold" {...props}>
          {children}
        </th>
      );
    },
    td({ node, children, ...props }: any) {
      return (
        <td className="border border-border px-4 py-2" {...props}>
          {children}
        </td>
      );
    },
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
