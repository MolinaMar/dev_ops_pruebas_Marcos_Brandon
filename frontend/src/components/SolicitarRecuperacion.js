import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import './Login.css';

function SolicitarRecuperacion() {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSolicitar = async (e) => {
    e.preventDefault();
    
    if (!correo) {
      alert('Por favor ingresa tu correo electrónico');
      return;
    }

    setCargando(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/solicitar-recuperacion`, {
        correo: correo
      });

      setEnviado(true);
      setMensaje(response.data.mensaje);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('Error al solicitar recuperación. Intenta nuevamente.');
      }
    } finally {
      setCargando(false);
    }
  };

  const handleVolverLogin = () => {
    navigate('/login');
  };

  if (enviado) {
    return (
      <div className="login-container">
        <div className="login-form">
          <div className="recuperacion-enviada">
            <div className="icono-email">📧</div>
            <h2>Solicitud Enviada</h2>
            <p>{mensaje}</p>
            <p>Si tu correo está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña.</p>
            <p><strong>Revisa tu bandeja de entrada y la carpeta de spam.</strong></p>
            <p>El enlace expirará en 1 hora por seguridad.</p>
            <button onClick={handleVolverLogin} className="btn-primary">
              Volver al Login
            </button>
          </div>
        </div>
        
        <style jsx>{`
          .recuperacion-enviada {
            text-align: center;
            padding: 20px;
          }
          
          .icono-email {
            font-size: 48px;
            margin-bottom: 20px;
          }
          
          .recuperacion-enviada h2 {
            color: #28a745;
            margin-bottom: 20px;
          }
          
          .recuperacion-enviada p {
            margin-bottom: 15px;
            color: #666;
            line-height: 1.5;
          }
          
          .btn-primary {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
            transition: background-color 0.3s;
          }
          
          .btn-primary:hover {
            background-color: #0056b3;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Recuperar Contraseña</h2>
        <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        
        <form onSubmit={handleSolicitar}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            disabled={cargando}
          />
          
          <button 
            type="submit" 
            disabled={cargando}
            style={{
              backgroundColor: cargando ? '#ccc' : '#007bff',
              cursor: cargando ? 'not-allowed' : 'pointer'
            }}
          >
            {cargando ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
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

export default SolicitarRecuperacion;