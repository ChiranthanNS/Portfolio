import type { Project } from "./types";

export const projects: Project[] = [
  {
    title: "SettleIQ",
    slug: "settleiq",
    categories: ["ai-ml", "fullstack"],
    summary:
      "A financial reconciliation and discrepancy-analysis application with AI-powered transaction matching, settlement breakdowns, and a Next.js dashboard backed by a FastAPI backend.",
    description:
      "SettleIQ is a financial reconciliation tool designed to automate the tedious process of matching transactions and identifying discrepancies between financial records. The application provides a clean Next.js dashboard where users can upload transaction data, view automated reconciliation results, and receive clear explanations of any discrepancies. A FastAPI backend handles the heavy lifting of transaction matching, settlement calculations, and generating human-readable explanations of mismatches.",
    problem:
      "Financial reconciliation is a manual, error-prone process. Accountants and finance teams spend hours matching transactions line by line across different data sources, and subtle discrepancies are easy to miss.",
    solution:
      "An automated reconciliation engine that matches transactions across sources, computes settlement breakdowns, identifies and explains discrepancies, and presents the results in a clean dashboard—reducing reconciliation time from hours to minutes.",
    whyBuilt:
      "I built SettleIQ to explore the intersection of AI and financial data processing—applying practical AI workflows to a domain where accuracy and clarity genuinely matter.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "Python", "Tailwind CSS"],
    githubUrl: "https://github.com/ChiranthanNS/SettleIQ",
    liveUrl: "https://chiranthanns.github.io/SettleIQ/",
    coverImage: "/images/projects/settleiq.webp",
    images: ["/images/projects/settleiq.webp"],
    featured: true,
    order: 0,
  },
  {
    title: "IEEE CIS VVCE Student Chapter Website",
    slug: "ieee-cis-vvce",
    categories: ["frontend", "fullstack"],
    summary:
      "A deployed website for the IEEE Computational Intelligence Society Student Chapter at VVCE, featuring event listings, chapter information, and member resources.",
    description:
      "A production website for the IEEE Computational Intelligence Society Student Chapter at Vidyavardhaka College of Engineering, Mysuru. The site serves as the public face of the student chapter, providing information about the organization, upcoming events, team members, and resources for IEEE CIS members. It is live and actively maintained.",
    problem:
      "The IEEE CIS VVCE student chapter lacked a dedicated online presence, making it difficult to communicate events, showcase achievements, and recruit new members effectively.",
    solution:
      "A clean, professional website that presents chapter information, lists events, highlights the team, and provides an accessible entry point for students interested in computational intelligence research and activities.",
    whyBuilt:
      "As a core team member, I developed this site to give the chapter a professional online presence and streamline communication with members and prospective joiners.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    githubUrl: "https://github.com/ChiranthanNS/ieee-cis-vvce",
    liveUrl: "https://ieee-cis-vvce.vercel.app/",
    coverImage: "/images/projects/ieee-cis-vvce.webp",
    images: ["/images/projects/ieee-cis-vvce.webp"],
    featured: true,
    order: 1,
  },
  {
    title: "MailCerti",
    slug: "mailcerti",
    categories: ["fullstack", "backend"],
    summary:
      "An event and outreach management console with automated email workflows, PDF certificate generation, spreadsheet handling, and Gemini API integration.",
    description:
      "MailCerti is a management console built for running events and outreach campaigns. It handles participant data from spreadsheets, automates bulk email delivery, generates personalized PDF certificates, and integrates with the Gemini API for smart content assistance. The authentication system ensures only authorized organizers can access and operate the console.",
    problem:
      "Event organizers managing certificates and participant communications face tedious manual work: exporting spreadsheets, generating individual PDFs, and sending hundreds of personalized emails—all error-prone and time-consuming.",
    solution:
      "A unified console that ingests spreadsheet data, generates personalized PDF certificates, sends bulk personalized emails, and uses AI assistance for drafting outreach content—all in one authenticated workflow.",
    whyBuilt:
      "I built MailCerti to solve a real pain point I encountered while managing events at my college student chapters, where certificate generation and email outreach consumed disproportionate time.",
    techStack: [
      "React",
      "Vite",
      "Express",
      "MongoDB",
      "Node.js",
      "Gemini API",
      "PDF generation",
    ],
    githubUrl: "https://github.com/ChiranthanNS/Mailcerti",
    liveUrl: undefined,
    coverImage: "/images/projects/mailcerti.webp",
    images: ["/images/projects/mailcerti.webp"],
    featured: true,
    order: 2,
  },
  {
    title: "Solvyn",
    slug: "solvyn",
    categories: ["ai-ml", "frontend"],
    summary:
      "An AI-powered problem-solving assistant that helps users work through challenges step by step.",
    description:
      "Solvyn is an AI-assisted problem-solving tool designed to help users decompose, analyze, and work through complex problems systematically using LLM-based reasoning workflows.",
    problem:
      "Complex problems often feel overwhelming because there's no structured way to approach them. Users need guidance to break problems into manageable steps.",
    solution:
      "An AI assistant that uses prompt-engineered workflows to guide users through structured problem decomposition and solution development.",
    whyBuilt:
      "Built to practice applied AI workflow design and LLM integration using API-based tools.",
    techStack: ["Python", "LLM APIs", "Prompt Engineering"],
    githubUrl: "https://github.com/ChiranthanNS/Solvyn",
    liveUrl: undefined,
    coverImage: "/images/projects/solvyn.webp",
    images: ["/images/projects/solvyn.webp"],
    featured: false,
    order: 3,
  },
  {
    title: "Digital Complaint Management System",
    slug: "digital-complaint-management",
    categories: ["fullstack", "frontend"],
    summary:
      "A web-based system for submitting, tracking, and managing digital complaints with a clean public-facing interface.",
    description:
      "A digital complaint management system that allows users to submit complaints online, track their status, and receive updates. The system streamlines the complaint lifecycle from submission through resolution.",
    problem:
      "Traditional complaint processes rely on paper forms and manual tracking, leading to lost submissions, lack of transparency, and slow resolution times.",
    solution:
      "A web interface where complainants can submit and track complaints digitally, with a management view for processing and updating complaint status.",
    whyBuilt:
      "Built to apply full-stack web development skills to a civic-utility problem with real-world relevance.",
    techStack: ["HTML", "CSS", "JavaScript"],
    githubUrl:
      "https://github.com/ChiranthanNS/Digital_Complaint_Management_System",
    liveUrl:
      "https://ChiranthanNS.github.io/Digital_Complaint_Management_System/",
    coverImage: "/images/projects/digital-complaint-management.webp",
    images: ["/images/projects/digital-complaint-management.webp"],
    featured: false,
    order: 4,
  },
  {
    title: "VVCE Campus App",
    slug: "vvce-campus",
    categories: ["frontend"],
    summary:
      "A campus information and utility application for Vidyavardhaka College of Engineering students.",
    description:
      "A web application providing campus utility features and information for VVCE students, including schedule and campus resource information.",
    problem:
      "VVCE students needed a centralized, easily accessible place to find campus information and resources.",
    solution:
      "A lightweight web app delivering campus-relevant content in a clean, mobile-friendly interface.",
    whyBuilt:
      "Built as a practical project for my own campus community, applying frontend development skills to a directly useful tool.",
    techStack: ["HTML", "CSS", "JavaScript"],
    githubUrl: "https://github.com/ChiranthanNS/vvce",
    liveUrl: "https://chiranthanns.github.io/vvce/",
    coverImage: "/images/projects/vvce-campus.webp",
    images: ["/images/projects/vvce-campus.webp"],
    featured: false,
    order: 5,
  },
];
