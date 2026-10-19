"use client";

import { BriefcaseBusiness, Calendar } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Reveal from "../../components/ui/Reveal";
import Tilt from "../../components/ui/Tilt";
import { chip } from "../../components/ui/styles";
import { experiences } from "@/lib/data";
import { spring } from "@/lib/motion";
import { useLang } from "@/lib/i18n";

export default function Experience() {
  const { t, L } = useLang();
  return (
    <>
      <PageHeader
        eyebrow={t.expEyebrow}
        title={t.expTitle}
        description={t.expDesc}
      />

      <section className="px-4 md:px-6">
        <ol className="mx-auto max-w-4xl space-y-3 md:space-y-6">
          {experiences.map((exp, i) => (
            <Reveal as="li" key={exp.role} tilt={false} className="relative md:pl-16">
              {/* Garis waktu (desktop) */}
              {i < experiences.length - 1 && <span aria-hidden className="hidden md:block absolute left-5 top-14 -bottom-6 w-px bg-separator" />}
              <span
                aria-hidden
                className="hidden md:grid absolute left-0 top-7 w-10 h-10 rounded-full place-items-center text-white ring-[6px] ring-bg"
                style={{ background: exp.tone }}
              >
                <BriefcaseBusiness size={18} />
              </span>

              <Tilt as="article" whileHover={{ y: -4 }} transition={spring.press} className="card p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="md:hidden grid place-items-center w-11 h-11 rounded-[14px] text-white shrink-0" style={{ background: exp.tone }}>
                      <BriefcaseBusiness size={20} />
                    </span>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-fg">{exp.role}</h2>
                      <p className="text-fg-2 font-medium">{exp.company}</p>
                    </div>
                  </div>
                  <span className="self-start inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-accent-soft text-accent-fg text-xs font-semibold whitespace-nowrap">
                    <Calendar size={14} /> {L(exp.period)}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {exp.points.map((point) => (
                    <li key={point.id} className="flex gap-3 text-fg-2 leading-relaxed">
                      <span className="mt-[0.6rem] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: exp.tone }} />
                      {L(point)}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-5 border-t border-separator flex flex-wrap gap-2">
                  {exp.stack.map((s) => {
                    const Icon = s.icon;
                    return (
                      <span key={s.name} className={chip}>
                        <Icon style={{ color: s.color }} /> {s.name}
                      </span>
                    );
                  })}
                </div>
              </Tilt>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
