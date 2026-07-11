function IconoLuna() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 13.3A8.2 8.2 0 1 1 10.7 3.5 6.4 6.4 0 0 0 20.5 13.3z" />
      <path d="M17.5 4.2l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoSol() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.6M12 19.4V22M3.5 3.5l1.9 1.9M18.6 18.6l1.9 1.9M2 12h2.6M19.4 12H22M3.5 20.5l1.9-1.9M18.6 5.4l1.9-1.9" />
    </svg>
  );
}

function IconoSalir() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 21H5.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M15.5 16.5l4.5-4.5-4.5-4.5M20 12H9.5" />
    </svg>
  );
}

export default function Header({ tema, onToggle, onLogout }) {
  const oscuro = tema === 'oscuro';
  return (
    <header>
      <div className="tricolor">
        <span className="r" /><span className="g" /><span className="b" />
      </div>
      <div className="header">
        <div className="header-top">
          <div className="header-brand">
            <img className="header-logo" src="/logo.svg" alt="Logo — silueta de auto" />
            <div>
              <div className="uni">Universidad de Los Lagos</div>
              <h1>Sistema de Registro de Patentes</h1>
              <div className="sub">Control de ingreso vehicular</div>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="tema-btn"
              onClick={onToggle}
              aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={oscuro ? 'Modo claro' : 'Modo oscuro'}
            >
              {oscuro ? <IconoSol /> : <IconoLuna />}
            </button>
            {onLogout && (
              <button className="tema-btn" onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
                <IconoSalir />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
