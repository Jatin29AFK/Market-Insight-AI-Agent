import ReactMarkdown from "react-markdown";

type MarkdownAnswerProps = {
  content: string;
};

export function MarkdownAnswer({ content }: MarkdownAnswerProps) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-6 text-3xl font-semibold text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-6 text-xl font-semibold text-cyan-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-5 text-lg font-semibold text-slate-100">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-8 text-slate-200">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-5 ml-5 list-disc space-y-2 text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 ml-5 list-decimal space-y-2 text-slate-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-7 text-slate-200">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          code: ({ children }) => (
            <code className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-sm text-cyan-200">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}