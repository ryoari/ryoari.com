import identity from "@/data/identity.json";

export default function Home() {
  return (
    <main className="container">
      <header className="section" style={{ marginTop: "var(--space-xl)" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 700, marginBottom: "var(--space-xs)" }}>
          {identity.name}
        </h1>
        <p className="text-secondary" style={{ fontSize: "1.5rem" }}>
          {identity.tagline}
        </p>
      </header>

      <section className="section">
        <h2 style={{ marginBottom: "var(--space-sm)" }}>About</h2>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.6, maxWidth: "60ch" }}>
          {identity.bio}
        </p>
      </section>

      <section className="section">
        <h2 style={{ marginBottom: "var(--space-md)" }}>Projects</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-md)" }}>
          {identity.projects.map((project) => (
            <a key={project.name} href={project.url} target="_blank" rel="noopener noreferrer" className="card flex-col gap-sm">
              <h3 style={{ fontSize: "1.2rem" }}>{project.name}</h3>
              <p className="text-secondary">{project.description}</p>
              <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap", marginTop: "auto" }}>
                {project.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: "0.8rem", padding: "2px 8px", background: "var(--border-color)", borderRadius: "4px", color: "var(--text-primary)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 style={{ marginBottom: "var(--space-sm)" }}>Connect</h2>
        <div style={{ display: "flex", gap: "var(--space-md)" }}>
          {identity.socials.map((social) => (
            <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "1.1rem" }}>
              {social.platform} <span className="text-secondary">↗</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="section" style={{ borderTop: "1px solid var(--border-color)", paddingTop: "var(--space-md)", marginTop: "var(--space-xl)" }}>
        <div className="flex-col gap-sm">
          <p className="text-secondary mono" style={{ fontSize: "0.9rem" }}>
            This site is designed for both humans and AI agents.
          </p>
          <p className="text-secondary mono" style={{ fontSize: "0.9rem" }}>
            Machine-readable data: <a href="/me" className="text-primary" style={{ textDecoration: "underline" }}>/me</a>
          </p>
          <p className="text-secondary" style={{ fontSize: "0.8rem", marginTop: "var(--space-md)" }}>
            © {new Date().getFullYear()} {identity.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
