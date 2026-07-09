const VISTAS = [
  { id: 'registrar', label: 'Registrar' },
  { id: 'estadisticas', label: 'Estadísticas' },
  { id: 'historial', label: 'Historial' },
];

export default function NavTabs({ vista, onVista }) {
  return (
    <div className="nav-wrap">
      <nav className="nav-tabs">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            className={v.id === vista ? 'activo' : ''}
            onClick={() => onVista(v.id)}
          >
            {v.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
