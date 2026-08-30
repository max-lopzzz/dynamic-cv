import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { projects } from "../../projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} — Maximiliano López Montaño`,
    description: project.copy,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <main className="project-page">
      <div className="scanlines" />
      <Link href="/" className="project-back">
        ← back to desktop
      </Link>

      <section className="project-window">
        <div className="titlebar">
          <span>PROJECT.EXE — {project.name}</span>
        </div>

        <div className="project-body">
          {project.screenshot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.screenshot}
              alt={`${project.name} screenshot`}
              className="project-screenshot"
            />
          )}

          <div className="project-heading">
            <h1>{project.name}</h1>
            <span className={`project-status status-${project.status.replace(/\s+/g, "-")}`}>
              {project.status} · {project.progress}
            </span>
          </div>

          <div className="project-tech">
            {project.technologies.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>

          <div className="meter">
            <i style={{ width: project.progress }} />
          </div>

          <section className="project-section">
            <h2>what is it?</h2>
            <p>{project.whatIsIt ?? project.copy}</p>
          </section>

          {project.whyIMadeIt && (
            <section className="project-section">
              <h2>why i made it</h2>
              <p>{project.whyIMadeIt}</p>
            </section>
          )}

          {project.features && project.features.length > 0 && (
            <section className="project-section">
              <h2>features</h2>
              <ul>
                {project.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>
          )}

          {project.thingsLearned && project.thingsLearned.length > 0 && (
            <section className="project-section">
              <h2>things i learned</h2>
              <ul>
                {project.thingsLearned.map((thing) => (
                  <li key={thing}>{thing}</li>
                ))}
              </ul>
            </section>
          )}

          {project.thingsToChange && (
            <section className="project-section">
              <h2>things i&apos;d change</h2>
              <p>{project.thingsToChange}</p>
            </section>
          )}

          <div className="project-detail-links">
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer" className="bevel">
                ▶ live demo ↗
              </a>
            )}
            <a href={project.github} target="_blank" rel="noreferrer" className="bevel">
              ⌘ github ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
