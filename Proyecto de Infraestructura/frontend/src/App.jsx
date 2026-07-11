import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import PlateForm from './components/PlateForm.jsx';
import PlateDetail from './components/PlateDetail.jsx';
import EstadisticasPanel from './components/EstadisticasPanel.jsx';
import HistorialTable from './components/HistorialTable.jsx';
import DetalleModal from './components/DetalleModal.jsx';
import NavTabs from './components/NavTabs.jsx';
import Login from './components/Login.jsx';
import { consultarPatente, listarPatentes, obtenerEstadisticas, obtenerDetalle } from './services/api.js';

// El login solo se exige si VITE_REQUIRE_LOGIN === 'true' (por defecto: sin login).
const REQUIERE_LOGIN = import.meta.env.VITE_REQUIRE_LOGIN === 'true';

export default function App() {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [stats, setStats] = useState(null);
  const [periodo, setPeriodo] = useState('dia'); // día por defecto
  const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'claro');
  const [modal, setModal] = useState(null); // { cargando, data } o null
  const [vista, setVista] = useState('registrar'); // registrar | estadisticas | historial
  const [autenticado, setAutenticado] = useState(
    () => !REQUIERE_LOGIN || localStorage.getItem('auth') === '1'
  );

  const login = () => {
    localStorage.setItem('auth', '1');
    setAutenticado(true);
  };
  const logout = () => {
    localStorage.removeItem('auth');
    setAutenticado(false);
  };

  // Aplica el tema al <html> y lo recuerda para la próxima visita
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    localStorage.setItem('tema', tema);
  }, [tema]);

  const toggleTema = () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro'));

  // Carga historial + estadísticas (al inicio, al cambiar período y tras cada consulta)
  const cargarDatos = useCallback(async () => {
    try {
      const [h, s] = await Promise.all([listarPatentes(), obtenerEstadisticas(periodo)]);
      setHistorial(h.items || []);
      setStats(s);
    } catch {
      /* si el backend no está arriba, no rompemos la UI */
    }
  }, [periodo]);

  useEffect(() => {
    if (autenticado) cargarDatos();
  }, [autenticado, cargarDatos]);

  async function verDetalle(patente) {
    setModal({ cargando: true, data: null });
    try {
      const r = await obtenerDetalle(patente);
      setModal({ cargando: false, data: r.data });
    } catch {
      setModal(null);
    }
  }

  async function handleConsulta(patente, tipo) {
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const r = await consultarPatente(patente, tipo);
      setResultado(r);
      await cargarDatos();
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  if (!autenticado) {
    return <Login onLogin={login} />;
  }

  return (
    <>
      <Header tema={tema} onToggle={toggleTema} onLogout={REQUIERE_LOGIN ? logout : undefined} />
      <NavTabs vista={vista} onVista={setVista} />
      <main className="container">
        {vista === 'registrar' && (
          <>
            <PlateForm onSubmit={handleConsulta} cargando={cargando} />
            {error && <p className="error">{error}</p>}
            {resultado && <PlateDetail resultado={resultado} />}
          </>
        )}

        {vista === 'estadisticas' && (
          <EstadisticasPanel stats={stats} periodo={periodo} onPeriodo={setPeriodo} />
        )}

        {vista === 'historial' && (
          <HistorialTable items={historial} onSelect={verDetalle} />
        )}
      </main>
      {modal && (
        <DetalleModal data={modal.data} cargando={modal.cargando} onClose={() => setModal(null)} />
      )}
    </>
  );
}
