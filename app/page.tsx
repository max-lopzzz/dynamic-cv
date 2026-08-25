const projects = [
  { name: "PakuPaku", type: "INDIE APP · IN PROGRESS", copy: "A nutrition tracker designed around the realities of transgender people and metabolic-rate conditions.", tags: ["Product", "Community", "Solo dev"], href: "https://github.com/max-lopzzz" },
  { name: "Bead Art Helper", type: "REACT · TYPESCRIPT", copy: "A 221-color palette matcher that uses CIELAB and Delta-E76 to make bead art color matching feel precise.", tags: ["Color science", "React", "TypeScript"], href: "https://github.com/max-lopzzz" },
  { name: "BoxBuddy", type: "NEXT.JS · SUPABASE", copy: "QR-powered inventory tracking with cost and margin visibility for the things that matter.", tags: ["QR codes", "Next.js", "Supabase"], href: "https://github.com/max-lopzzz" },
  { name: "Pedro No Quiere Pagar Impuestos", type: "UNITY · C#", copy: "A chaotic game jam project that took 1st place at Pixel Borregos’ 2025 Game Jam.", tags: ["1st place", "Unity", "Team lead"], href: "https://github.com/max-lopzzz" },
];

const experiences = [
  ["NOW", "Software Engineer Intern", "Iteramind", "Building practical tools for CFOSC and NGOs across Mexico — from Next.js platforms to a 29-tool CRM MCP server."],
  ["2026", "Indie App Developer", "Self-employed", "Shipping PakuPaku end-to-end: product direction, roadmap, community, and code."],
  ["2025", "Game Developer & Project Lead", "Pixel Borregos’ Game Jam", "Led a five-person C#/Unity team to 1st place."],
];

export default function Home() {
  return <main>
    <nav className="nav shell"><a className="wordmark" href="#top">max<span>.dev</span></a><div><a href="#work">work</a><a href="#about">about</a><a href="mailto:m.lopz.montn@gmail.com">contact</a></div></nav>

    <section id="top" className="hero shell">
      <p className="eyebrow">✦ AVAILABLE FOR INTERESTING THINGS · MONTERREY, MX</p>
      <h1>Building software<br /><em>with heart</em> &amp; teeth.</h1>
      <p className="intro">I’m Maximiliano — a software engineer, indie app maker, and game developer. I turn thoughtful ideas into useful, inclusive digital experiences.</p>
      <div className="hero-actions"><a className="button primary" href="#work">See selected work <span>↘</span></a><a className="button quiet" href="mailto:m.lopz.montn@gmail.com">Let’s talk <span>↗</span></a></div>
      <div className="hero-note"><span className="pulse" /> CURRENTLY: building software for civil society orgs + PakuPaku</div>
    </section>

    <section className="signal"><div className="shell signal-inner"><span>ENGINEER</span><i>✦</i><span>INDIE BUILDER</span><i>✦</i><span>GAME DEV</span><i>✦</i><span>DRUMMER</span></div></section>

    <section id="work" className="shell section"><div className="section-head"><p className="eyebrow">01 / SELECTED WORK</p><h2>Things I’ve made<br />and care about.</h2><p>Projects at the intersection of care, curiosity, and genuinely useful software.</p></div><div className="project-grid">{projects.map((project, index) => <a className="project" href={project.href} target="_blank" rel="noreferrer" key={project.name}><div className={`project-visual visual-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{project.name === "PakuPaku" ? "pakupaku" : project.name === "BoxBuddy" ? "▣" : project.name === "Bead Art Helper" ? "◌ ◍ ◉" : "✦"}</strong></div><div className="project-copy"><p>{project.type}</p><h3>{project.name}<b>↗</b></h3><div>{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div><p className="description">{project.copy}</p></div></a>)}</div><a className="all-work" href="https://github.com/max-lopzzz" target="_blank" rel="noreferrer">More experiments on GitHub <span>↗</span></a></section>

    <section id="about" className="shell story"><div><p className="eyebrow">02 / A LITTLE ABOUT ME</p><h2>Good software<br />is a form of care.</h2></div><div className="story-copy"><p>I’m an Engineering in Computer Technologies student at Tec de Monterrey. My favorite projects are practical, generous, and a little unexpected.</p><p>Whether I’m helping NGOs serve their communities, making inclusive tools for people too often overlooked by software, or building strange little games, I want the work to leave things better than I found them.</p><div className="skills"><span>TypeScript / JavaScript</span><span>React / Next.js</span><span>Python</span><span>PostgreSQL</span><span>C# / Unity</span><span>Product & UX</span></div></div></section>

    <section className="shell section journey"><div className="section-head"><p className="eyebrow">03 / THE TIMELINE</p><h2>Currently<br />in motion.</h2></div><div className="timeline">{experiences.map(([year, role, company, copy]) => <article key={role}><p>{year}</p><div><h3>{role}</h3><h4>{company}</h4><span>{copy}</span></div></article>)}</div></section>

    <section className="contact"><div className="shell"><p className="eyebrow">04 / GET IN TOUCH</p><h2>Let’s build<br /><em>something good.</em></h2><a className="email" href="mailto:m.lopz.montn@gmail.com">m.lopz.montn@gmail.com <span>↗</span></a><div className="socials"><a href="https://github.com/max-lopzzz" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/max-lopezzz/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="mailto:m.lopz.montn@gmail.com">Email ↗</a></div></div></section>
    <footer className="shell"><span>© {new Date().getFullYear()} MAXIMILIANO LÓPEZ MONTAÑO</span><span>MADE WITH INTENT + A LITTLE NOISE ✦</span></footer>
  </main>;
}
