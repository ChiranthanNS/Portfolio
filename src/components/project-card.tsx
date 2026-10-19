import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "./icons";
import type { Project } from "../content/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group border-border bg-surface hover:border-primary/40 relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      {/* Cover image area */}
      <div className="bg-surface-2 relative aspect-[16/10] overflow-hidden">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={`${project.title} — interface preview`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(52,211,153,0.08),rgba(34,211,238,0.04))]">
            <span className="font-heading text-primary/30 text-4xl font-extrabold select-none">
              {project.title.slice(0, 2)}
            </span>
          </div>
        )}

        {/* Top-right GitHub icon button matching reference */}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} GitHub repository`}
            className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur-md transition-colors hover:bg-black/90 hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <GithubIcon className="size-4" />
          </a>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-bold tracking-[-0.02em] text-foreground">
            {project.title}
          </h3>

          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {project.summary}
          </p>

          {/* Tech stack pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="border-border bg-surface-2 text-muted-foreground rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons matching reference */}
        <div className="mt-5 flex items-center gap-2.5">
          <Link
            href={`/projects/${project.slug}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center rounded-full px-4 py-1.5 font-semibold text-xs transition-colors"
          >
            View Details
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} live demo`}
              className="border-border bg-surface-2 hover:bg-surface text-foreground hover:border-primary/40 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3.5" />
              <span>Live</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
