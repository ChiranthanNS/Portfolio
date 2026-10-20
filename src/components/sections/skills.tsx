"use client";

import { useState, type ComponentType } from "react";
import {
  BrainCircuit,
  Code2,
  Database,
  LayoutGrid,
  MonitorSmartphone,
  Server,
  Wrench,
} from "lucide-react";
import {
  SiPython,
  SiJavascript,
  SiC,
  SiHtml5,
  SiCss,
  SiScikitlearn,
  SiPytorch,
  SiTensorflow,
  SiPandas,
  SiNumpy,
  SiJupyter,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiVite,
  SiExpress,
  SiNodedotjs,
  SiMongodb,
  SiPostgresql,
  SiSqlite,
  SiSupabase,
  SiMysql,
  SiGit,
  SiGithub,
  SiVercel,
  SiDocker,
  SiLinux,
  SiGooglecolab,
  SiReplit,
  SiFastapi,
} from "react-icons/si";
import { DiJava } from "react-icons/di";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "../motion/reveal";
import { SectionHeading } from "./section-heading";
import { PillTabs } from "../pill-tabs";
import { skillGroups } from "../../content/skills";

const tabs = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "languages", label: "Languages", icon: Code2 },
  { id: "ai-ml", label: "AI/ML", icon: BrainCircuit },
  { id: "db", label: "Databases", icon: Database },
  { id: "tools", label: "Tools", icon: Wrench },
] as const;

type TabId = (typeof tabs)[number]["id"];

const groupByTab: Record<Exclude<TabId, "all">, string> = {
  languages: "Languages",
  "ai-ml": "AI/ML & Data",
  db: "Databases",
  tools: "Tools & DevOps",
};

const skillIcons: Record<string, ComponentType<{ className?: string }>> = {
  Python: SiPython,
  Java: DiJava,
  C: SiC,
  SQL: Database,
  HTML: SiHtml5,
  CSS: SiCss,
  "scikit-learn": SiScikitlearn,
  PyTorch: SiPytorch,
  TensorFlow: SiTensorflow,
  Pandas: SiPandas,
  NumPy: SiNumpy,
  Matplotlib: BrainCircuit,
  Seaborn: BrainCircuit,
  Jupyter: SiJupyter,
  React: SiReact,
  "Next.js": SiNextdotjs,
  "Tailwind CSS": SiTailwindcss,
  Vite: SiVite,
  FastAPI: SiFastapi,
  Express: SiExpress,
  "Node.js": SiNodedotjs,
  "REST APIs": Server,
  "Gemini API": BrainCircuit,
  SQLite: SiSqlite,
  MongoDB: SiMongodb,
  PostgreSQL: SiPostgresql,
  Supabase: SiSupabase,
  MySQL: SiMysql,
  Git: SiGit,
  GitHub: SiGithub,
  Vercel: SiVercel,
  Docker: SiDocker,
  Linux: SiLinux,
  WSL: SiLinux,
  Replit: SiReplit,
  "Google Colab": SiGooglecolab,
};

export function SkillsSection() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const reducedMotion = useReducedMotion();

  const visibleGroups =
    activeTab === "all"
      ? skillGroups
      : skillGroups.filter((g) => g.title === groupByTab[activeTab]);

  return (
    <section id="skills" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <SectionHeading title="Skills" />
        </Reveal>

        <Reveal>
          <PillTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            label="Skill categories"
            idPrefix="skill"
          />
        </Reveal>

        <motion.div
          key={activeTab}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 0.8, 0.35, 1] }}
          className="space-y-8"
        >
          {visibleGroups.map((group) => (
            <div key={group.title}>
              <Reveal>
                <h3 className="text-muted-foreground mb-4 font-mono text-xs uppercase tracking-widest">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {group.skills.map((skill) => {
                    const Icon = skillIcons[skill];
                    return (
                      <div
                        key={skill}
                        className="border-border bg-surface hover:border-primary/40 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors"
                      >
                        {Icon && (
                          <Icon className="text-muted-foreground size-4 shrink-0" />
                        )}
                        <span>{skill}</span>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
