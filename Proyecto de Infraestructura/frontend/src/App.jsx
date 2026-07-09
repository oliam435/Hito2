import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import PlateForm from './components/PlateForm.jsx';
import PlateDetail from './components/PlateDetail.jsx';
import EstadisticasPanel from './components/EstadisticasPanel.jsx';
import HistorialTable from './components/HistorialTable.jsx';
import DetalleModal from './components/DetalleModal.jsx';
import NavTabs from './components/NavTabs.jsx';
import { consultarPatente, listarPatentes, obtenerEstadisticas, obtenerDetalle } from './services/api.js';

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
    cargarDatos();
  }, [cargarDatos]);

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

  return (
    <>
      <Header tema={tema} onToggle={toggleTema} />
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
