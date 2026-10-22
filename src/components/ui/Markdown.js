import ReactMarkdown from "react-markdown";
import { safeHttpUrl } from "@/lib/embeds.mjs";

// Tipografi teks panjang dari CMS (cerita proyek, deskripsi pencapaian) bergaya One UI.
// HTML mentah diabaikan (skipHtml) dan gambar tidak ditampilkan — gambar lewat galeri.
const tag = (Tag, className) =>
  function MarkdownTag({ node, ...props }) {
    return <Tag className={className} {...props} />;
  };

// Judul di markdown paling tinggi h2 (h1 dipakai judul halaman)
const h2 = tag("h2", "mt-8 first:mt-0 mb-3 text-xl md:text-2xl font-bold tracking-tight text-fg");
const h3 = tag("h3", "mt-6 first:mt-0 mb-2 text-lg font-bold text-fg");
const h4 = tag("h4", "mt-5 first:mt-0 mb-2 text-base font-bold text-fg");

const components = {
  h1: h2,
  h2,
  h3,
  h4,
  h5: h4,
  h6: h4,
  p: tag("p", "mb-4 last:mb-0 leading-relaxed"),
  ul: tag("ul", "mb-4 last:mb-0 list-disc pl-5 space-y-1.5 marker:text-fg-3"),
  ol: tag("ol", "mb-4 last:mb-0 list-decimal pl-5 space-y-1.5 marker:text-fg-3 marker:font-semibold"),
  li: tag("li", "pl-1 leading-relaxed"),
  strong: tag("strong", "font-semibold text-fg"),
  em: tag("em", "italic"),
  blockquote: tag("blockquote", "my-5 px-5 py-4 rounded-2xl bg-accent-soft text-fg [&>p]:mb-2 [&>p:last-child]:mb-0"),
  code: tag("code", "px-1.5 py-0.5 rounded-md bg-surface-2 font-mono text-[0.88em] text-fg"),
  pre: tag("pre", "mb-4 p-4 rounded-2xl bg-surface-2 overflow-x-auto text-sm [&>code]:p-0 [&>code]:bg-transparent"),
  hr: tag("hr", "my-8 border-separator"),
  // Link hanya http(s), selalu tab baru tanpa akses ke halaman ini
  a: function MarkdownLink({ node, href, children, ...props }) {
    const safe = safeHttpUrl(href);
    if (!safe) return <span>{children}</span>;
    return (
      <a href={safe} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-fg underline underline-offset-2 hover:opacity-80" {...props}>
        {children}
      </a>
    );
  },
  img: () => null,
};

export default function Markdown({ children, className = "" }) {
  return (
    <div className={`text-[15px] md:text-base text-fg-2 break-words ${className}`}>
      <ReactMarkdown components={components} skipHtml>
        {children ?? ""}
      </ReactMarkdown>
    </div>
  );
}
