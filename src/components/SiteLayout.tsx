import { PropsWithChildren } from "react";
import { NavLink, Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/react-exe", label: "React-EXE", end: false },
  { to: "/slapify", label: "Slapify", end: false },
];

const linkedinUrl = "https://www.linkedin.com/company/slaps-dev";

function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="site-shell">
      <header className="site-nav">
        <Link to="/" className="site-logo">
          <span className="spark" aria-hidden="true" />
          slaps.dev
        </Link>

        <nav className="site-nav__links" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link--active" : "nav-link"
              }
            >
              {link.label}
            </NavLink>
          ))}
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
          <a href={linkedinUrl} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a
            href="https://github.com/vgulerianb/react-exe"
            target="_blank"
            rel="noreferrer"
          >
            React-EXE
          </a>
          <a
            href="https://github.com/vgulerianb/slapify"
            target="_blank"
            rel="noreferrer"
          >
            Slapify
          </a>
        </div>
      </footer>
    </div>
  );
}

export default SiteLayout;
