import { PropsWithChildren, useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const products = [
  {
    to: "/react-exe",
    label: "React-EXE",
    desc: "Execute React components from code strings",
  },
  {
    to: "/slapify",
    label: "Slapify",
    desc: "AI-powered browser automation",
  },
  {
    to: "/runmix",
    label: "runmix",
    desc: "Multi-language execution for agents",
  },
  {
    to: "/ghost-env",
    label: "ghost-env",
    desc: "Deterministic fake HTTP APIs for testing",
  },
];

const linkedinUrl = "https://www.linkedin.com/company/slaps-dev";

function ProductsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        className={`nav-link nav-dropdown__trigger${open ? " nav-link--active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        Products <ChevronDown size={13} className={`nav-dropdown__chevron${open ? " nav-dropdown__chevron--open" : ""}`} />
      </button>
      {open && (
        <div className="nav-dropdown__panel" onClick={() => setOpen(false)}>
          {products.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              className={({ isActive }) =>
                isActive ? "nav-dropdown__item nav-dropdown__item--active" : "nav-dropdown__item"
              }
            >
              <span className="nav-dropdown__item-label">{p.label}</span>
              <span className="nav-dropdown__item-desc">{p.desc}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="site-shell">
      <header className="site-nav">
        <Link to="/" className="site-logo">
          <span className="spark" aria-hidden="true" />
          slaps.dev
        </Link>

        <nav className="site-nav__links" aria-label="Primary">
          <ProductsDropdown />
          <NavLink
            to="/docs"
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            Docs
          </NavLink>
        </nav>

        <div className="site-nav__actions">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="nav-cta"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/vgulerianb"
            target="_blank"
            rel="noreferrer"
            className="nav-ghost"
          >
            GitHub <ArrowUpRight size={14} />
          </a>
        </div>
      </header>

      <main className="site-content">{children}</main>

      <footer className="site-footer">
        <div>
          <p className="footer-brand">slaps.dev</p>
          <p className="footer-copy">&copy; 2026 slaps.dev</p>
        </div>
        <div className="footer-links">
          <Link to="/docs">Docs</Link>
          <a href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://github.com/vgulerianb" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
}

export default SiteLayout;
