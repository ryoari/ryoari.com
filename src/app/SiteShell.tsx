"use client";

import { useEffect, useRef, useState } from "react";

type Social = { platform: string; url: string; username: string };
type Project = { name: string; description: string; url: string; tags: string[] };

export type Identity = {
  name: string;
  tagline: string;
  epigraph: string;
  bio: string;
  now: string;
  email: string;
  website: string;
  socials: Social[];
  projects: Project[];
};

type Palette = { ink: string; accent: string; faint: string; paper: string };

function hexA(hex: string, al: number) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const n = parseInt(hex, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${al})`;
}

export default function SiteShell({ identity }: { identity: Identity }) {
  const [dark, setDark] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const genRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const colors = useRef<Palette>({ ink: "#1d1813", accent: "#b34a26", faint: "#a4937c", paper: "#f3ede1" });

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const readColors = () => {
    if (!rootRef.current) return;
    const cs = getComputedStyle(rootRef.current);
    colors.current = {
      ink: cs.getPropertyValue("--ink").trim() || colors.current.ink,
      accent: cs.getPropertyValue("--accent").trim() || colors.current.accent,
      faint: cs.getPropertyValue("--faint").trim() || colors.current.faint,
      paper: cs.getPropertyValue("--paper").trim() || colors.current.paper,
    };
  };

  useEffect(() => { readColors(); }, [dark]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    root.classList.add("anim");
    const items = Array.from(root.querySelectorAll<HTMLElement>(".rise"));
    const timers = items.map((el, i) => window.setTimeout(() => el.classList.add("show"), 120 + i * 100));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    const spec = specRef.current;
    if (!cv || !spec) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    readColors();

    let W = 0, H = 0;
    const size = () => {
      const r = spec.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    let mx = -999, my = -999, active = false;
    const onMove = (e: PointerEvent) => {
      const r = spec.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top; active = true;
      if (hintRef.current) hintRef.current.style.opacity = "0";
    };
    const onLeave = () => { active = false; mx = -999; my = -999; };
    spec.addEventListener("pointermove", onMove);
    spec.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", size);

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mode: "soup" | "flock" = Math.random() < 0.5 ? "soup" : "flock";
    if (genRef.current) genRef.current.textContent = mode === "soup" ? "self-organizing from noise" : "live · artificial life · gen 0000";
    if (hintRef.current) hintRef.current.textContent = mode === "soup" ? "disturb the field" : "move your cursor";

    let raf = 0;
    const cleanup = () => {
      cancelAnimationFrame(raf);
      spec.removeEventListener("pointermove", onMove);
      spec.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", size);
    };

    // --- Mode A: self-organizing particle soup (life from noise) ---
    if (mode === "soup") {
      type SP = { x: number; y: number; vx: number; vy: number; s: number };
      const A = [[0.4, -0.3, 0.1], [0.6, 0.2, -0.3], [-0.2, 0.5, 0.3]];
      const RAD = [1.3, 1.6, 1.2];
      const rmax = 56, rmin = 16, ff = 0.3, fric = 0.85, cR = 92, cPush = 1.4, pad = 3;
      const N = 240;
      const P: SP[] = Array.from({ length: N }, () => {
        const r = Math.random(), s = r < 0.6 ? 0 : r < 0.8 ? 1 : 2;
        return { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, s };
      });

      const draw = () => {
        const c = colors.current;
        const col = [hexA(c.ink, 0.62), hexA(c.accent, 0.9), hexA(c.faint, 0.5)];
        ctx.fillStyle = hexA(c.paper, 0.4); ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < N; i++) {
          const p = P[i];
          ctx.beginPath(); ctx.fillStyle = col[p.s]; ctx.arc(p.x, p.y, RAD[p.s], 0, 6.283); ctx.fill();
        }
      };

      if (reduce) {
        draw();
        if (genRef.current) genRef.current.textContent = "self-organization · paused";
        if (hintRef.current) hintRef.current.style.opacity = "0";
        return cleanup;
      }

      const step = () => {
        for (let i = 0; i < N; i++) {
          const p = P[i];
          let fx = 0, fy = 0;
          for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const q = P[j];
            let dx = q.x - p.x; if (dx > W * 0.5) dx -= W; else if (dx < -W * 0.5) dx += W;
            const dy = q.y - p.y, d2 = dx * dx + dy * dy;
            if (d2 >= rmax * rmax || d2 === 0) continue;
            const d = Math.sqrt(d2);
            const F = d < rmin ? (d / rmin - 1) : A[p.s][q.s] * (1 - Math.abs(2 * d - rmin - rmax) / (rmax - rmin));
            fx += F * dx / d; fy += F * dy / d;
          }
          if (active) {
            const cx = p.x - mx, cy = p.y - my, cd = Math.sqrt(cx * cx + cy * cy);
            if (cd < cR && cd > 0) { const w = 1 - cd / cR; fx += cx / cd * cPush * w; fy += cy / cd * cPush * w; }
          }
          p.vx = (p.vx + fx * ff) * fric; p.vy = (p.vy + fy * ff) * fric;
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
          if (p.y < pad) { p.y = pad; p.vy = -p.vy * 0.5; } else if (p.y > H - pad) { p.y = H - pad; p.vy = -p.vy * 0.5; }
        }
      };
      const loop = () => { step(); draw(); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      return cleanup;
    }

    // --- Mode B: the first iteration, emergent flocking from local rules ---
    type Boid = { x: number; y: number; vx: number; vy: number; a: boolean };
    const N = 82;
    const B: Boid[] = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: Math.random() - 0.5, vy: Math.random() - 0.5,
      a: Math.random() < 0.16,
    }));

    const draw = () => {
      const c = colors.current;
      ctx.fillStyle = hexA(c.paper, 0.14); ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        const b = B[i];
        const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 0.001;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx / sp * 4, b.y - b.vy / sp * 4);
        ctx.strokeStyle = b.a ? hexA(c.accent, 0.5) : hexA(c.ink, 0.28);
        ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = b.a ? hexA(c.accent, 0.85) : hexA(c.ink, 0.5);
        ctx.arc(b.x, b.y, b.a ? 1.7 : 1.3, 0, 6.283); ctx.fill();
      }
    };

    if (reduce) {
      const c = colors.current;
      ctx.fillStyle = c.paper; ctx.fillRect(0, 0, W, H);
      B.forEach((b) => { ctx.beginPath(); ctx.fillStyle = b.a ? hexA(c.accent, 0.85) : hexA(c.ink, 0.5); ctx.arc(b.x, b.y, 1.5, 0, 6.283); ctx.fill(); });
      if (genRef.current) genRef.current.textContent = "artificial life · paused";
      if (hintRef.current) hintRef.current.style.opacity = "0";
      return cleanup;
    }

    const step = () => {
      for (let i = 0; i < N; i++) {
        const b = B[i];
        let sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, cnt = 0;
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const o = B[j], dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 900 && d2 > 0) { const d = Math.sqrt(d2); sx -= dx / d; sy -= dy / d; }
          if (d2 < 2600) { ax += o.vx; ay += o.vy; cx += o.x; cy += o.y; cnt++; }
        }
        if (cnt > 0) {
          ax /= cnt; ay /= cnt; cx = cx / cnt - b.x; cy = cy / cnt - b.y;
          b.vx += ax * 0.012 + cx * 0.0009 + sx * 0.04;
          b.vy += ay * 0.012 + cy * 0.0009 + sy * 0.04;
        }
        if (active) {
          const px = mx - b.x, py = my - b.y, pd = Math.sqrt(px * px + py * py);
          if (pd < 130 && pd > 0) { const f = (130 - pd) / 130; b.vx += (px / pd) * f * 0.1; b.vy += (py / pd) * f * 0.1; }
        }
        const sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), max = 0.85;
        if (sp > max) { b.vx = b.vx / sp * max; b.vy = b.vy / sp * max; }
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) b.x += W; if (b.x > W) b.x -= W;
        if (b.y < 0) b.y += H; if (b.y > H) b.y -= H;
      }
    };

    const t0 = performance.now();
    const pad = (n: number) => ("0000" + Math.round(n)).slice(-4);
    const loop = (now: number) => {
      step(); draw();
      if (genRef.current) genRef.current.textContent = "live · artificial life · gen " + pad((now - t0) / 1000 * 6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return cleanup;
  }, []);

  return (
    <div className="site" ref={rootRef}>
      <div className="grain" aria-hidden="true" />
      <main className="pg">
        <div className="top">
          <span className="mark">ryo ari</span>
          <button
            className="tog"
            aria-label="Toggle light and dark"
            onClick={() => {
              const next = !dark;
              setDark(next);
              document.documentElement.classList.toggle("dark", next);
              try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
            }}
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
        </div>

        <div className="spec rise" ref={specRef}>
          <canvas ref={canvasRef} />
        </div>
        <div className="cap rise">
          <span ref={genRef}>self-organizing from noise</span>
          <span className="hint" ref={hintRef}>disturb the field</span>
        </div>

        <div className="hero-wrap">
          {identity.epigraph && <p className="epi rise">{identity.epigraph}</p>}
          <h1 className="hero rise">
            {identity.tagline.replace(/\.$/, "")}
            <span className="dot">.</span>
          </h1>
          <p className="role rise">
            <b>Rajat Roy</b>, also Ryo Ari. Systems architect and developer, researching artificial life.
          </p>
        </div>

        <section className="sec rise">
          <p className="lbl">About</p>
          <p className="about">{identity.bio}</p>
        </section>

        {identity.now && (
          <section className="sec rise">
            <p className="lbl">Now</p>
            <p className="now">{identity.now}</p>
          </section>
        )}

        <section className="sec rise">
          <p className="lbl">Work</p>
          {identity.projects.map((p) => (
            <a key={p.name} className="entry" href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
              <h3>
                {p.name} <span className="ar">↗</span>
              </h3>
              <p>{p.description}</p>
              <div className="mtags">{p.tags.join(" · ")}</div>
            </a>
          ))}
        </section>

        <section className="sec rise">
          <p className="lbl">Connect</p>
          <div className="links">
            {identity.socials.map((s) => (
              <a key={s.platform} className="lk" href={s.url} target="_blank" rel="noopener noreferrer">
                {s.platform}
              </a>
            ))}
          </div>
        </section>

        <div className="colo rise">
          This site is written for humans and machines.
          <br />
          Machine-readable identity: <a href="/me.json">/me</a>
        </div>
        <p className="foot rise">© {new Date().getFullYear()} {identity.name}</p>
      </main>
    </div>
  );
}
