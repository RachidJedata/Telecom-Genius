import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import 'github-markdown-css';

const MarkdownContent = ({ content }: { content: string }) => (
    <div className="markdown-body bg-white text-black dark:bg-gray-900 dark:text-white/80">
        <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
        >
            {content}
        </ReactMarkdown>
    </div>

);

export default MarkdownContent;
