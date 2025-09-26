import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Login.css';

function ConfirmarEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('verificando'); // 'verificando', 'exito', 'error'
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const confirmarEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setEstado('error');
        setMensaje('Enlace de confirmación inválido. Faltan parámetros.');
        setCargando(false);
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/confirmar-email`, {
          token: token,
          email: email
        });

        if (response.status === 200) {
          setEstado('exito');
          setMensaje(response.data.mensaje);
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        setEstado('error');
        if (error.response && error.response.data && error.response.data.error) {
          setMensaje(error.response.data.error);
        } else {
          setMensaje('Error al confirmar el correo electrónico. Intenta nuevamente.');
        }
      } finally {
        setCargando(false);
      }
    };

    confirmarEmail();
  }, [searchParams, navigate]);

  const handleVolverLogin = () => {
    navigate('/login');
  };

  const handleVolverInicio = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Confirmación de Email</h2>
        
        {cargando && (
          <div className="confirmacion-estado">
            <div className="spinner"></div>
            <p>Verificando tu correo electrónico...</p>
          </div>
        )}
        
        {!cargando && estado === 'exito' && (
          <div className="confirmacion-exito">
            <div className="icono-exito">✅</div>
            <h3>¡Cuenta Activada!</h3>
            <p>{mensaje}</p>
            <p>Serás redirigido al login en unos segundos...</p>
            <button onClick={handleVolverLogin} className="btn-primary">
              Ir al Login Ahora
            </button>
          </div>
        )}
        
        {!cargando && estado === 'error' && (
          <div className="confirmacion-error">
            <div className="icono-error">❌</div>
            <h3>Error de Confirmación</h3>
            <p>{mensaje}</p>
            <div className="botones-error">
              <button onClick={handleVolverLogin} className="btn-primary">
                Ir al Login
              </button>
              <button onClick={handleVolverInicio} className="btn-secondary">
                Volver al Inicio
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .confirmacion-estado {
          text-align: center;
          padding: 20px;
        }
        
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
        
        .confirmacion-exito, .confirmacion-error {
          text-align: center;
          padding: 20px;
        }
        
        .icono-exito, .icono-error {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .confirmacion-exito h3 {
          color: #28a745;
          margin-bottom: 15px;
        }
        
        .confirmacion-error h3 {
          color: #dc3545;
          margin-bottom: 15px;
        }
        
        .confirmacion-exito p, .confirmacion-error p {
          margin-bottom: 15px;
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

export default ConfirmarEmail;