import { useState } from 'react';

// Único usuario permitido (no hay registro de nuevos usuarios).
const USUARIO = 'Blackcrip';
const CLAVE = 'Blackcrip';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (usuario === USUARIO && clave === CLAVE) {
      onLogin();
    } else {
      setError(true);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="tricolor login-tricolor">
          <span className="r" /><span className="g" /><span className="b" />
        </div>
        <img className="login-logo" src="/logo-red.svg" alt="Logo — silueta de auto" />
        <div className="login-uni">Universidad de Los Lagos</div>
        <h1>Registro de Patentes</h1>
        <p className="login-sub">Ingresá tus credenciales para continuar</p>

        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => { setUsuario(e.target.value); setError(false); }}
          autoFocus
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => { setClave(e.target.value); setError(false); }}
        />

        {error && <div className="login-error">Usuario o contraseña incorrectos.</div>}

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}
