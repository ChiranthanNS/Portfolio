"use client";

import { useState } from "react";
import { BriefcaseBusiness, ExternalLink, GraduationCap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "../motion/reveal";
import { SectionHeading } from "./section-heading";
import { PillTabs } from "../pill-tabs";
import { experiences } from "../../content/experience";
import { educationList } from "../../content/education";

const tabs = [
  { id: "experience", label: "Experience", icon: BriefcaseBusiness },
  { id: "education", label: "Education", icon: GraduationCap },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ExperienceEducationSection() {
  const [activeTab, setActiveTab] = useState<TabId>("experience");
  const reducedMotion = useReducedMotion();

  return (
    <section id="experience" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <SectionHeading title="Experience & Education" />
        </Reveal>

        <Reveal>
          <PillTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            label="Experience and education"
            idPrefix="xp"
          />
        </Reveal>

        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`xp-panel-${activeTab}`}
          aria-labelledby={`xp-tab-${activeTab}`}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 0.8, 0.35, 1] }}
          className="mx-auto max-w-3xl space-y-5"
        >
          {activeTab === "experience" &&
            experiences.map((exp, i) => (
              <Reveal key={i}>
                <div className="border-border bg-surface rounded-2xl border p-6">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-heading text-base font-bold tracking-[-0.02em]">
                        {exp.role}
                      </h3>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm">
                        {exp.companyUrl ? (
                          <a
                            href={exp.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary inline-flex items-center gap-1 transition-colors"
                          >
                            {exp.company}
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <span>{exp.company}</span>
                        )}
                        <span>·</span>
                        <span>{exp.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="border-primary/20 bg-primary/8 text-primary rounded-full px-2.5 py-0.5 font-mono text-xs">
                        {exp.engagement}
                      </div>
                      <div className="text-muted-foreground mt-1 font-mono text-xs">
                        {exp.startDate} – {exp.endDate}
                      </div>
                    </div>
                  </div>

                  {exp.highlights.length > 0 && (
                    <ul className="text-muted-foreground mb-4 space-y-1.5 text-sm">
                      {exp.highlights.map((h, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-primary mt-1.5 shrink-0">
                            ›
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  {exp.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="border-border rounded-full border px-2.5 py-0.5 font-mono text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}

          {activeTab === "education" &&
            educationList.map((edu, i) => (
              <Reveal key={i}>
                <div className="border-border bg-surface rounded-2xl border p-6">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-heading text-base font-bold tracking-[-0.02em]">
                        {edu.institution}
                      </h3>
                      <p className="text-primary mt-0.5 text-sm">
                        {edu.degree}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {edu.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground font-mono text-xs">
                        {edu.startDate} – {edu.endDate}
                      </div>
                      {edu.grade && (
                        <div className="border-primary/20 bg-primary/8 text-primary mt-1 rounded-full px-2.5 py-0.5 font-mono text-xs">
                          {edu.grade}
                        </div>
                      )}
                    </div>
                  </div>

                  {edu.highlights && edu.highlights.length > 0 && (
                    <ul className="text-muted-foreground space-y-1.5 text-sm">
                      {edu.highlights.map((h, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-primary mt-1.5 shrink-0">
                            ›
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
