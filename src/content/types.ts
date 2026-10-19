export type ProjectCategory = "ai-ml" | "frontend" | "backend" | "fullstack";

export type Project = {
  title: string;
  slug: string;
  categories: ProjectCategory[];
  summary: string;
  description: string;
  problem: string;
  solution: string;
  whyBuilt: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  coverImage?: string;
  images: string[];
  videoUrl?: string;
  featured: boolean;
  order: number;
};

export type Experience = {
  role: string;
  company: string;
  location: string;
  companyUrl?: string;
  engagement: string;
  startDate: string;
  endDate: string;
  techStack: string[];
  highlights: string[];
};

export type Education = {
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  grade?: string;
  highlights?: string[];
};

export type Profile = {
  name: string;
  fullName: string;
  badge: string;
  email: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  xUrl?: string;
  cvPath?: string;
  about: string;
  avatarUrl?: string;
};

export type SkillGroup = {
  title: string;
  skills: string[];
};

export type Achievement = {
  title: string;
  description: string;
  date?: string;
};
