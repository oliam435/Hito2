import { useState } from 'react';

export default function PlateForm({ onSubmit, cargando }) {
  const [patente, setPatente] = useState('');

  function go(tipo) {
    if (patente.trim()) onSubmit(patente.trim(), tipo);
  }

  return (
    <div className="card">
      <form className="plate-form" onSubmit={(e) => { e.preventDefault(); go('entrada'); }}>
        <input
          type="text"
          placeholder="Ingresá la patente (ej: GPDD74)"
          value={patente}
          onChange={(e) => setPatente(e.target.value.toUpperCase())}
        />
        <button type="button" className="btn-entrada" disabled={cargando} onClick={() => go('entrada')}>
          ↓ Entrada
        </button>
        <button type="button" className="btn-salida" disabled={cargando} onClick={() => go('salida')}>
          ↑ Salida
        </button>
      </form>
    </div>
  );
}
