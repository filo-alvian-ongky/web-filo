import { renderToBuffer } from "@react-pdf/renderer";
import CvDocument from "@/lib/cv/CvDocument";
import { buildCv } from "@/lib/cv/select";
import { getContent } from "@/lib/content/server";

// CV PDF (ID & EN) yang dibuat dari konten CMS terbaru.
// Dibuat statis & di-cache; menyimpan konten di /admin langsung memperbaruinya.
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "id" }, { lang: "en" }];
}

export async function GET(_request, { params }) {
  const { lang } = await params;
  const data = buildCv(await getContent(), lang === "en" ? "en" : "id");
  const pdf = await renderToBuffer(<CvDocument data={data} />);
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="CV-Filo-Alvian-Ongky-${lang.toUpperCase()}.pdf"`,
    },
  });
}
