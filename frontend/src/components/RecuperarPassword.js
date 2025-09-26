import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Login.css';

function RecuperarPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [tokenValido, setTokenValido] = useState(null); // null = verificando, true = válido, false = inválido

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      setTokenValido(false);
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
    setTokenValido(true);
  }, [searchParams]);

  const handleRestablecer = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/restablecer-password`, {
        token: token,
        email: email,
        password: password
      });

      alert(response.data.mensaje);
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('Error al restablecer contraseña. Intenta nuevamente.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleVolverLogin = () => {
    navigate('/login');
  };

  const handleSolicitarNuevo = () => {
    navigate('/solicitar-recuperacion');
  };

  // Verificando token
  if (tokenValido === null) {
    return (
      <div className="login-container">
        <div className="login-form">
          <div style={{textAlign: 'center', padding: '20px'}}>
            <div className="spinner"></div>
            <p>Verificando enlace...</p>
          </div>
        </div>
        
        <style jsx>{`
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Token inválido
  if (tokenValido === false) {
    return (
      <div className="login-container">
        <div className="login-form">
          <div className="token-invalido">
            <div className="icono-error">❌</div>
            <h2>Enlace Inválido</h2>
            <p>El enlace de recuperación no es válido o está incompleto.</p>
            <p>Esto puede ocurrir si:</p>
            <ul style={{textAlign: 'left', margin: '20px 0'}}>
              <li>El enlace ha expirado (válido por 1 hora)</li>
              <li>El enlace ya fue utilizado</li>
              <li>El enlace está incompleto o dañado</li>
            </ul>
            <div className="botones-error">
              <button onClick={handleSolicitarNuevo} className="btn-primary">
                Solicitar Nuevo Enlace
              </button>
              <button onClick={handleVolverLogin} className="btn-secondary">
                Volver al Login
              </button>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          .token-invalido {
            text-align: center;
            padding: 20px;
          }
          
          .icono-error {
            font-size: 48px;
            margin-bottom: 20px;
          }
          
          .token-invalido h2 {
            color: #dc3545;
            margin-bottom: 20px;
          }
          
          .token-invalido p {
            margin-bottom: 15px;
            color: #666;
            line-height: 1.5;
          }
          
          .token-invalido ul {
            color: #666;
            line-height: 1.5;
          }
          
          .botones-error {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
          }
          
          .btn-primary {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
          }
          
          .btn-primary:hover {
            background-color: #0056b3;
          }
          
          .btn-secondary {
            background-color: #6c757d;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
          }
          
          .btn-secondary:hover {
            background-color: #545b62;
          }
        `}</style>
      </div>
    );
  }

  // Formulario para nueva contraseña
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Restablecer Contraseña</h2>
        <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>
          Ingresa tu nueva contraseña para la cuenta: <strong>{email}</strong>
        </p>
        
        <form onSubmit={handleRestablecer}>
          <input
            type="password"
            placeholder="Nueva contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={cargando}
            minLength={6}
          />
          
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={cargando}
            minLength={6}
          />
          
          {password && confirmPassword && password !== confirmPassword && (
            <p style={{color: '#dc3545', fontSize: '14px', margin: '5px 0'}}>
              Las contraseñas no coinciden
            </p>
          )}
          
          {password && password.length < 6 && (
            <p style={{color: '#dc3545', fontSize: '14px', margin: '5px 0'}}>
              La contraseña debe tener al menos 6 caracteres
            </p>
          )}
          
          <button 
            type="submit" 
            disabled={cargando || password !== confirmPassword || password.length < 6}
            style={{
              backgroundColor: (cargando || password !== confirmPassword || password.length < 6) ? '#ccc' : '#28a745',
              cursor: (cargando || password !== confirmPassword || password.length < 6) ? 'not-allowed' : 'pointer'
            }}
          >
            {cargando ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>
        
        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <button 
            onClick={handleVolverLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Volver al Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecuperarPassword;