import Experience from "./Experience";
import { getContent } from "@/lib/content/server";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pengalaman Profesional | Filo Alvian Ongky",
  description: "Jejak pengalaman kerja dan organisasi Filo Alvian Ongky sebagai Coding Instructor dan Team Leader & UI/UX Designer.",
  path: "/experience",
});

export const revalidate = 3600;

export default async function Page() {
  const { experiences } = await getContent();
  return <Experience experiences={experiences} />;
}
