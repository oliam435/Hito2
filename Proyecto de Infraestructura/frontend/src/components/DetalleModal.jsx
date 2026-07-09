import DetalleVehiculo from './DetalleVehiculo.jsx';

export default function DetalleModal({ data, cargando, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        {cargando || !data ? (
          <div className="empty">Cargando detalle…</div>
        ) : (
          <>
            <h2>{data.patente}</h2>
            <DetalleVehiculo data={data} />
          </>
        )}
      </div>
    </div>
  );
}
