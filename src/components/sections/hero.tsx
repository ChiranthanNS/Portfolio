"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Download, ChevronDown, Sparkles } from "lucide-react";
import { GithubIcon, LinkedinIcon, XIcon } from "../icons";
import { profile } from "../../content/profile";
import { scrollToHash } from "../../lib/scroll";

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 0.8, 0.35, 1] },
  },
};

const photoIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.6, delay: 0.1, ease: [0.22, 0.8, 0.35, 1] },
  },
};

const marqueeTechs = [
  "Python",
  "Java",
  "C",
  "SQL",
  "scikit-learn",
  "PyTorch",
  "TensorFlow",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "Seaborn",
  "Jupyter",
  "MongoDB",
  "Supabase",
  "MySQL",
  "Docker",
  "Git",
  "Linux",
];

export function Hero() {
  const reducedMotion = useReducedMotion();
  const initial = reducedMotion ? "visible" : "hidden";

  return (
    <section className="relative flex flex-col justify-between overflow-hidden pt-28 pb-12 lg:pt-36 lg:pb-16 min-h-[92vh]">
      {/* Background glow and subtle dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-[600px] bg-[radial-gradient(circle,rgba(45,212,191,0.08)_0%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -left-32 size-[500px] bg-[radial-gradient(circle,rgba(20,184,166,0.05)_0%,transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Left Column: Intro */}
          <div className="text-left">
            {/* Role Badge */}
            <motion.div
              variants={rise}
              initial={initial}
              animate="visible"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3.5 py-1 text-xs font-mono text-muted-foreground"
            >
              <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
              <span>{profile.badge}</span>
            </motion.div>

            {/* Headline matching reference style */}
            <motion.h1
              variants={rise}
              initial={initial}
              animate="visible"
              transition={{ delay: 0.05 }}
              className="font-heading mb-6 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-foreground leading-[1.15]"
            >
              Building{" "}
              <span className="text-primary font-bold">applied AI</span>
              <br />
              systems with{" "}
              <span className="font-serif italic font-normal text-foreground/90">
                precision.
              </span>
            </motion.h1>

            {/* Bio */}
            <motion.p
              variants={rise}
              initial={initial}
              animate="visible"
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mb-8 max-w-xl text-base sm:text-lg leading-relaxed"
            >
              I am <strong className="text-foreground font-semibold">Chiranthan N S</strong>, an AI/ML student and practical builder dedicated to creating functional, real-world solutions. Leading initiatives at IEI and IEEE CIS student chapters, with hands-on experience building web applications, intelligent workflows, and data pipelines. CSE (AI & ML) undergraduate at VVCE (CGPA 9.2).
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={rise}
              initial={initial}
              animate="visible"
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={() => scrollToHash("projects")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold shadow-md transition-all duration-150"
              >
                View Projects
              </button>

              {profile.cvPath ? (
                <a
                  href={profile.cvPath}
                  download
                  className="border-border bg-surface-2 hover:bg-surface text-foreground hover:border-primary/40 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
                >
                  <Download className="size-4" />
                  <span>Download CV</span>
                </a>
              ) : (
                <button
                  onClick={() => scrollToHash("contact")}
                  className="border-border bg-surface-2 hover:bg-surface text-foreground hover:border-primary/40 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
                >
                  <Sparkles className="size-4 text-primary" />
                  <span>Get in Touch</span>
                </button>
              )}
            </motion.div>

            {/* Social Links */}
            <motion.div
              variants={rise}
              initial={initial}
              animate="visible"
              transition={{ delay: 0.2 }}
              className="mt-8 flex items-center gap-3 text-xs font-mono text-muted-foreground"
            >
              <span>Follow me:</span>
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <GithubIcon className="size-4.5" />
              </a>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <LinkedinIcon className="size-4.5" />
              </a>
              {profile.xUrl && (
                <a
                  href={profile.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter) profile"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <XIcon className="size-4.5" />
                </a>
              )}
            </motion.div>
          </div>

          {/* Right Column: Photo Card with Pinned Badges */}
          <motion.div
            variants={photoIn}
            initial={initial}
            animate="visible"
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
              {/* Main Card Frame matching reference */}
              <div className="border-border bg-surface relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border p-2 shadow-2xl">
                {/* Photo / Treatment Area */}
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.6rem] bg-gradient-to-b from-surface-2 to-surface">
                  {profile.avatarUrl ? (
                    <>
                      <Image
                        src={profile.avatarUrl}
                        alt={`${profile.fullName} — Portrait`}
                        fill
                        priority
                        sizes="(max-width: 640px) 340px, 380px"
                        className="object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
                      />
                      {/* Subtle vignette overlay matching reference */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-60"
                      />
                    </>
                  ) : (
                    <>
                      {/* Subtle lighting backdrop */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(45,212,191,0.15),transparent_70%)]"
                      />
                      {/* Monogram / Portrait treatment */}
                      <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
                        <div className="flex size-32 items-center justify-center rounded-3xl border border-primary/30 bg-surface-2 shadow-[0_0_40px_rgba(45,212,191,0.12)]">
                          <span className="font-heading text-6xl font-black text-primary">
                            C
                          </span>
                        </div>
                        <div className="mt-5">
                          <h3 className="font-heading text-lg font-bold text-foreground">
                            Chiranthan N S
                          </h3>
                          <p className="font-mono text-xs text-muted-foreground mt-1">
                            Mandya, Karnataka, India
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Pinned Top-Left Badge: "5+ Live projects" */}
                <div className="border-border bg-surface/90 absolute top-4 left-4 z-20 rounded-xl border px-3.5 py-2 backdrop-blur-md shadow-lg">
                  <span className="text-primary block font-heading text-base font-extrabold leading-none">
                    5+
                  </span>
                  <span className="text-muted-foreground font-mono text-[0.68rem] tracking-wider">
                    Live projects
                  </span>
                </div>

                {/* Pinned Bottom-Right Badge: "● Available for work" */}
                <div className="border-border bg-surface/90 absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur-md shadow-lg">
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                  <span className="text-foreground text-xs font-medium">
                    Available for work
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee Ticker: "TECHNOLOGIES I WORK WITH" */}
      <div className="mt-16 w-full border-t border-b border-border/60 bg-surface/40 py-5 backdrop-blur-sm">
        <p className="text-center font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground/75 mb-3.5">
          TECHNOLOGIES I WORK WITH
        </p>
        <div className="relative flex overflow-x-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-6 whitespace-nowrap px-4 font-mono text-xs text-foreground/85">
            {marqueeTechs.concat(marqueeTechs).map((tech, idx) => (
              <span key={idx} className="flex items-center gap-6">
                <span className="hover:text-primary transition-colors cursor-default">
                  {tech}
                </span>
                <span className="text-primary/40">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="mt-6 flex flex-col items-center justify-center text-center">
        <button
          onClick={() => scrollToHash("projects")}
          className="flex flex-col items-center gap-1 font-mono text-[0.65rem] tracking-widest text-muted-foreground/70 hover:text-primary transition-colors uppercase cursor-pointer"
        >
          <span>SCROLL</span>
          <ChevronDown className="size-3.5 animate-bounce text-muted-foreground/70" />
        </button>
      </div>
    </section>
  );
}
