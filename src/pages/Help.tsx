import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import systemFlowContent from "../../SYSTEM_FLOW.md?raw";

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">System Documentation</h1>
              <p className="text-sm text-muted-foreground">Complete operational guide — data flow, rules & calculations</p>
            </div>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
          v1.0 Manual
        </span>
      </div>

      {/* Markdown Content */}
      <article className="prose prose-slate max-w-none
        prose-headings:scroll-mt-20
        prose-h1:text-3xl prose-h1:font-extrabold prose-h1:border-b prose-h1:pb-4 prose-h1:mb-6
        prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-slate-800
        prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-8 prose-h3:text-slate-700
        prose-h4:text-base prose-h4:font-semibold prose-h4:mt-6
        prose-p:text-slate-600 prose-p:leading-relaxed
        prose-strong:text-slate-900
        prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:border prose-pre:border-slate-700
        prose-table:border prose-table:border-slate-200 prose-table:rounded-lg prose-table:overflow-hidden
        prose-th:bg-slate-50 prose-th:text-slate-700 prose-th:font-bold prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-th:px-4 prose-th:py-3 prose-th:border-b prose-th:border-slate-200
        prose-td:px-4 prose-td:py-2.5 prose-td:text-sm prose-td:border-b prose-td:border-slate-100
        prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-blue-900
        prose-hr:border-slate-200 prose-hr:my-8
        prose-li:text-slate-600 prose-li:marker:text-slate-400
        prose-ol:text-slate-600
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {systemFlowContent}
        </ReactMarkdown>
      </article>
    </div>
  );
}
