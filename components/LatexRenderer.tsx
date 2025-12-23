
import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface Props {
  content: string;
  className?: string;
}

const LatexRenderer: React.FC<Props> = ({ content, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Logic to find and render math patterns like $...$ or $$...$$
      // For simplicity, we assume the content might contain multiple math segments
      const processLatex = (text: string) => {
        // Replace $[math]$ or $$[math]$ with KaTeX spans
        let processed = text;
        
        // Handle Display Math $$...$$
        processed = processed.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
          try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false });
          } catch (e) {
            return match;
          }
        });

        // Handle Inline Math $...$
        processed = processed.replace(/\$(.*?)\$/g, (match, formula) => {
          try {
            return katex.renderToString(formula, { displayMode: false, throwOnError: false });
          } catch (e) {
            return match;
          }
        });

        return processed;
      };

      containerRef.current.innerHTML = processLatex(content);
    }
  }, [content]);

  return <div ref={containerRef} className={`${className} whitespace-pre-wrap leading-relaxed`} />;
};

export default LatexRenderer;
