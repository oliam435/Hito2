function IconoLuna() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconoSol() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export default function Header({ tema, onToggle }) {
  const oscuro = tema === 'oscuro';
  return (
    <header>
      <div className="tricolor">
        <span className="r" /><span className="g" /><span className="b" />
      </div>
      <div className="header">
        <div className="header-top">
          <div className="header-brand">
            <div className="header-logo">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="#fff">
                <path d="M5 17h14M6.5 17a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm14 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                <path d="M4 17V9l2-4h9l3 4h1a2 2 0 0 1 2 2v6M4 11h16" />
              </svg>
            </div>
            <div>
              <div className="uni">Universidad de Los Lagos</div>
              <h1>Sistema de Registro de Patentes</h1>
              <div className="sub">Control de ingreso vehicular</div>
            </div>
          </div>
          <button
            className="tema-btn"
            onClick={onToggle}
            aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={oscuro ? 'Modo claro' : 'Modo oscuro'}
          >
            {oscuro ? <IconoSol /> : <IconoLuna />}
          </button>
        </div>
      </div>
    </header>
  );
}
