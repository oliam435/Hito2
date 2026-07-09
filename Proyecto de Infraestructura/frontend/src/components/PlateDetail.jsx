import DetalleVehiculo from './DetalleVehiculo.jsx';

export default function PlateDetail({ resultado }) {
  const { source, tipo, data } = resultado;
  return (
    <div className="card plate-detail">
      <span className={`badge ${source}`}>
        {source === 'db' ? 'Ya estaba registrada' : 'Consultada en API Boostr'}
      </span>
      <span className={`badge tipo-${tipo}`}>
        {tipo === 'salida' ? 'Salida registrada' : 'Entrada registrada'}
      </span>
      <h2>{data.patente}</h2>
      <DetalleVehiculo data={data} />
    </div>
  );
}
