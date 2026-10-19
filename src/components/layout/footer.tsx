import { GithubIcon, LinkedinIcon, XIcon } from "../icons";
import { profile } from "../../content/profile";

export function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
        <div className="text-center sm:text-left">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} {profile.fullName}. All rights
            reserved.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <GithubIcon className="size-5" />
          </a>
          <a
            href={profile.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LinkedinIcon className="size-5" />
          </a>
          {profile.xUrl && (
            <a
              href={profile.xUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter) profile"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="size-5" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
