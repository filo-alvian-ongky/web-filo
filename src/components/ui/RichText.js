// Format sederhana untuk teks dari CMS (mis. kalimat perkenalan hero):
// **teks** = tebal, ==teks== = tebal berwarna aksen. Selain itu ditampilkan apa adanya (bukan HTML).
const TOKEN = /(\*\*[^*]+\*\*|==[^=]+==)/;

export default function RichText({ text }) {
  return (text ?? "").split(TOKEN).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <span key={i} className="font-bold text-fg">
          {part.slice(2, -2)}
        </span>
      );
    }
    if (/^==[^=]+==$/.test(part)) {
      return (
        <span key={i} className="font-bold text-accent-fg">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}
