import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import 'github-markdown-css';
import { cn } from "@/lib/utils";

const MarkdownContent = ({ content, className }: { content: string, className?: string }) => (
    <div className={cn("markdown-body", className)}
        style={{ backgroundColor: "inherit", color: "inherit" }}
    >
        <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
        >
            {content}
        </ReactMarkdown>
    </div>

);

export default MarkdownContent;
