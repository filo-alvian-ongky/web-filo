// Template CV (A4, 1 halaman) dengan @react-pdf/renderer — tampilan mengikuti CV versi lama:
// header (foto, nama, kontak), kolom kiri (profil, pengalaman, proyek, publikasi),
// kolom kanan (pendidikan, prestasi, sertifikasi, keahlian).

import fs from "node:fs";
import path from "node:path";
import { Document, Font, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const FONT_DIR = path.join(process.cwd(), "src/lib/cv/fonts");
Font.register({
  family: "Jakarta",
  fonts: [400, 600, 700, 800].map((fontWeight) => ({ src: path.join(FONT_DIR, `plus-jakarta-sans-latin-${fontWeight}-normal.woff`), fontWeight })),
});
// Jangan memenggal kata dengan tanda hubung
Font.registerHyphenationCallback((word) => [word]);

const PHOTO = (() => {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public/profile.jpeg"));
  } catch {
    return null;
  }
})();

const C = { ink: "#0b0b0d", body: "#2b2f36", muted: "#5f6470", faint: "#8a8f98", line: "#e4e7ec", accent: "#0a64e0", accentSoft: "#eaf2ff", panel: "#f3f4f6" };

const s = StyleSheet.create({
  page: { fontFamily: "Jakarta", color: C.ink, paddingTop: 36, paddingBottom: 26, paddingHorizontal: 40, fontSize: 8.6 },
  blob: { position: "absolute", top: -110, right: -90, width: 300, height: 300, borderRadius: 150, backgroundColor: "#0a6cf5", opacity: 0.06 },
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  photo: { width: 74, height: 74, borderRadius: 22, objectFit: "cover", marginRight: 16 },
  name: { fontSize: 24, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.05 },
  role: { marginTop: 5, fontSize: 10, fontWeight: 700, color: C.accent },
  contact: { marginLeft: "auto", paddingLeft: 12 },
  contactRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 2.6 },
  contactKey: { width: 52, textAlign: "right", fontSize: 6.4, fontWeight: 700, color: C.faint, textTransform: "uppercase", letterSpacing: 0.8, marginRight: 8, paddingTop: 1 },
  contactVal: { fontSize: 8, fontWeight: 600, color: C.body, textDecoration: "none" },
  main: { flexDirection: "row", paddingTop: 16, flexGrow: 1 },
  left: { flex: 1.7, paddingRight: 18 },
  right: { flex: 1, backgroundColor: C.panel, borderRadius: 14, paddingTop: 14, paddingHorizontal: 13, paddingBottom: 4, alignSelf: "flex-start" },
  section: { marginBottom: 13 },
  h2Row: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  h2: { fontSize: 7.4, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: 1.3, marginRight: 7 },
  h2Line: { flexGrow: 1, height: 1, backgroundColor: C.line },
  p: { fontSize: 8.6, lineHeight: 1.55, color: C.body },
  item: { marginBottom: 9 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 9.8, fontWeight: 700, lineHeight: 1.3 },
  sub: { fontSize: 8.4, fontWeight: 600, color: C.muted, marginTop: 1 },
  date: { fontSize: 7.2, fontWeight: 700, color: C.accent, backgroundColor: C.accentSoft, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 6, marginLeft: 8 },
  bulletRow: { flexDirection: "row", marginTop: 2.4 },
  bullet: { width: 8, fontSize: 8.6, color: "#0a6cf5", lineHeight: 1.55 },
  bulletText: { flex: 1, fontSize: 8.6, lineHeight: 1.55, color: C.body },
  tags: { fontSize: 7.4, fontWeight: 700, color: C.accent, marginTop: 1.5 },
  sideItem: { marginBottom: 8 },
  sideTitle: { fontSize: 8.8, fontWeight: 700, lineHeight: 1.3 },
  sideSub: { fontSize: 7.7, color: C.muted, lineHeight: 1.45, marginTop: 1 },
  sideWhen: { fontSize: 7.2, fontWeight: 700, color: C.accent, marginTop: 1.5 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  chip: { fontSize: 7.4, fontWeight: 600, color: C.body, backgroundColor: "#ffffff", borderWidth: 1, borderColor: C.line, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 6, marginRight: 4, marginBottom: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, fontSize: 7.2, color: C.faint },
});

function Section({ title, children }) {
  return (
    <View style={s.section}>
      <View style={s.h2Row}>
        <Text style={s.h2}>{title}</Text>
        <View style={s.h2Line} />
      </View>
      {children}
    </View>
  );
}

function SideList({ items }) {
  return items.map((a, i) => (
    <View key={i} style={s.sideItem} wrap={false}>
      <Text style={s.sideTitle}>{a.title}</Text>
      <Text style={s.sideSub}>{a.sub}</Text>
      <Text style={s.sideWhen}>{a.date}</Text>
    </View>
  ));
}

export default function CvDocument({ data }) {
  const L = data.labels;
  return (
    <Document title={`CV ${data.name}`} author={data.name} subject={data.headline} language={data.lang} creator="FiloAlvian.com">
      <Page size="A4" style={s.page}>
        <View style={s.blob} fixed />

        <View style={s.header}>
          {/* Image milik react-pdf (bukan <img> HTML), tidak punya atribut alt */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {PHOTO && <Image src={PHOTO} style={s.photo} />}
          <View>
            <Text style={s.name}>{data.name}</Text>
            <Text style={s.role}>{data.headline}</Text>
          </View>
          <View style={s.contact}>
            {data.contacts.map((c, i) => (
              <View key={i} style={s.contactRow}>
                <Text style={s.contactKey}>{c.label}</Text>
                {/* Kontak dari Pengaturan Website boleh tanpa link */}
                {c.href ? (
                  <Link src={c.href} style={s.contactVal}>
                    {c.value}
                  </Link>
                ) : (
                  <Text style={s.contactVal}>{c.value}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={s.main}>
          <View style={s.left}>
            <Section title={L.profile}>
              <Text style={s.p}>{data.summary}</Text>
            </Section>

            {data.experiences.length > 0 && (
              <Section title={L.experience}>
                {data.experiences.map((e, i) => (
                  <View key={i} style={s.item} wrap={false}>
                    <View style={s.head}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.title}>{e.role}</Text>
                        <Text style={s.sub}>{e.org}</Text>
                      </View>
                      {e.date ? <Text style={s.date}>{e.date}</Text> : null}
                    </View>
                    {e.points.map((p, j) => (
                      <View key={j} style={s.bulletRow}>
                        <Text style={s.bullet}>•</Text>
                        <Text style={s.bulletText}>{p}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </Section>
            )}

            {data.projects.length > 0 && (
              <Section title={L.projects}>
                {data.projects.map((p, i) => (
                  <View key={i} style={s.item} wrap={false}>
                    <Text style={s.title}>{p.name}</Text>
                    {p.tags ? <Text style={s.tags}>{p.tags}</Text> : null}
                    <Text style={[s.p, { marginTop: 2.5 }]}>{p.body}</Text>
                  </View>
                ))}
              </Section>
            )}

            {data.publication.title ? (
              <Section title={L.publication}>
                <View style={s.item} wrap={false}>
                  <Text style={[s.title, { fontSize: 8.8, lineHeight: 1.45 }]}>{data.publication.title}</Text>
                  {data.publication.authors ? <Text style={[s.p, { marginTop: 2.5 }]}>{data.publication.authors}</Text> : null}
                  {data.publication.venue ? <Text style={s.sub}>{data.publication.venue}</Text> : null}
                </View>
              </Section>
            ) : null}
          </View>

          <View style={s.right}>
            {data.education.school ? (
              <Section title={L.education}>
                <View style={s.sideItem}>
                  <Text style={s.sideTitle}>{data.education.school}</Text>
                  {data.education.major ? <Text style={s.sideSub}>{data.education.major}</Text> : null}
                </View>
              </Section>
            ) : null}
            {data.awards.length > 0 && (
              <Section title={L.awards}>
                <SideList items={data.awards} />
              </Section>
            )}
            {data.certifications.length > 0 && (
              <Section title={L.certifications}>
                <SideList items={data.certifications} />
              </Section>
            )}
            {data.skills.length > 0 && (
              <Section title={L.skills}>
                <View style={s.chips}>
                  {data.skills.map((name) => (
                    <Text key={name} style={s.chip}>
                      {name}
                    </Text>
                  ))}
                </View>
              </Section>
            )}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>
            {data.name} — CV · {L.updated} {data.updated}
          </Text>
          <Link src="https://filoalvian.com" style={{ color: C.faint, textDecoration: "none" }}>
            {L.footer}
          </Link>
        </View>
      </Page>
    </Document>
  );
}
