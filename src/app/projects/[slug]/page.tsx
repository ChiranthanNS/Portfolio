import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { projects } from "../../../content/projects";
import { siteUrl } from "../../../lib/site";
import { ScreenshotGallery } from "../../../components/screenshot-gallery";
import { FeedbackForm } from "../../../components/feedback-form";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: `${project.title} · Chiranthan N S`,
      description: project.summary,
      url: `${siteUrl}/projects/${slug}`,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-32 sm:px-8">
      {/* Back link */}
      <Link
        href="/#projects"
        className="text-muted-foreground hover:text-foreground mb-10 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="mb-4 flex flex-wrap gap-2">
          {project.categories.map((cat) => (
            <span
              key={cat}
              className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3 py-0.5 font-mono text-xs"
            >
              {cat}
            </span>
          ))}
        </div>
        <h1 className="font-heading mb-4 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
          {project.title}
        </h1>
        <p className="text-muted-foreground text-lg">{project.summary}</p>

        {/* Links */}
        <div className="mt-6 flex flex-wrap gap-3">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-surface hover:border-primary/40 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors"
            >
              <Github className="size-4" />
              View Source
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              <ExternalLink className="size-4" />
              Live Demo
            </a>
          )}
        </div>
      </header>

      {/* Screenshot gallery */}
      {project.images.length > 0 && (
        <div className="mb-10">
          <ScreenshotGallery images={project.images} title={project.title} />
        </div>
      )}

      {/* No image placeholder */}
      {project.images.length === 0 && (
        <div className="bg-surface-2 mb-10 flex aspect-video items-center justify-center rounded-2xl">
          <span className="text-muted-foreground font-mono text-sm">
            Screenshots coming soon
          </span>
        </div>
      )}

      {/* Case study content */}
      <div className="space-y-10">
        {/* Tech stack */}
        <section>
          <h2 className="font-heading mb-4 text-xl font-bold tracking-[-0.02em]">
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="border-border bg-surface rounded-full border px-3 py-1 font-mono text-xs"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Problem */}
        <section>
          <h2 className="font-heading mb-4 text-xl font-bold tracking-[-0.02em]">
            The Problem
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {project.problem}
          </p>
        </section>

        {/* Solution */}
        <section>
          <h2 className="font-heading mb-4 text-xl font-bold tracking-[-0.02em]">
            The Solution
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {project.solution}
          </p>
        </section>

        {/* Description */}
        <section>
          <h2 className="font-heading mb-4 text-xl font-bold tracking-[-0.02em]">
            Overview
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {project.description}
          </p>
        </section>

        {/* Why built */}
        <section>
          <h2 className="font-heading mb-4 text-xl font-bold tracking-[-0.02em]">
            Why I Built This
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {project.whyBuilt}
          </p>
        </section>
      </div>

      {/* Feedback form */}
      <div className="border-border mt-16 border-t pt-12">
        <FeedbackForm projectSlug={project.slug} projectTitle={project.title} />
      </div>
    </div>
  );
}
