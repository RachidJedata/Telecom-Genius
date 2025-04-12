import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import 'github-markdown-css';
import { cn } from "@/app/lib/utils";

const MarkdownContent = ({ content, className, style }: { content: string, className?: string, style?: {} }) => (
    <div className={cn("markdown-body", className)} style={style}>
        <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
        >
            {content}
        </ReactMarkdown>
    </div>

);

export default MarkdownContent;
