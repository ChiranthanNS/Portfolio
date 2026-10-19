"use client";

import { useState } from "react";
import { LayoutGrid, MonitorSmartphone, Server, BrainCircuit } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "../motion/reveal";
import { ProjectCard } from "../project-card";
import { SectionHeading } from "./section-heading";
import { PillTabs } from "../pill-tabs";
import { projects } from "../../content/projects";

const tabs = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "ai-ml", label: "AI/ML", icon: BrainCircuit },
  { id: "fullstack", label: "Full Stack", icon: Server },
  { id: "frontend", label: "Frontend", icon: MonitorSmartphone },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProjectsSection() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const reducedMotion = useReducedMotion();

  const filtered = [...projects]
    .filter((p) => activeTab === "all" || p.categories.includes(activeTab))
    .sort((a, b) => a.order - b.order);

  return (
    <section id="projects" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal>
          <SectionHeading title="Projects" />
        </Reveal>

        <Reveal>
          <PillTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            label="Project categories"
            idPrefix="proj"
          />
        </Reveal>

        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`proj-panel-${activeTab}`}
          aria-labelledby={`proj-tab-${activeTab}`}
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 0.8, 0.35, 1] }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-muted-foreground py-16 text-center font-mono text-sm">
            No projects in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
