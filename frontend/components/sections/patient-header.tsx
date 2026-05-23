const nav = [
  { href: "/", label: "Home" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/upload", label: "Reports" },
  { href: "/analysis", label: "Analysis" },
  { href: "/hospitals", label: "Hospitals" },
  { href: "/dashboard", label: "Live" },
];

export function PatientHeader() {
  return (
    <header className="app-header">
      <div className="site-container app-header-inner">
        <a href="/" className="app-brand" aria-label="MediRoute AI home">
          <span className="app-brand-mark">M</span>
          <span className="app-brand-name">MediRoute AI</span>
        </a>

        <nav className="app-nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="app-nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="app-header-actions">
          <a href="tel:112" className="btn btn-danger btn-sm">
            112 Emergency
          </a>

          <details className="app-mobile-menu">
            <summary aria-label="Open navigation menu">
              <span />
              <span />
              <span />
            </summary>
            <div className="app-mobile-panel">
              {nav.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
              <a href="tel:112" className="app-mobile-emergency">
                Emergency Call 112
              </a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
