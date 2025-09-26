import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import './Login.css';

function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [aceptoPrivacidad, setAceptoPrivacidad] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const navigate = useNavigate();

  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const handleRegister = async () => {
    if (!aceptoPrivacidad) {
      alert('Debes aceptar el aviso de privacidad para registrarte');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, { 
        nombre, 
        correo, 
        password,
        acepto_privacidad: true  // Enviamos al backend que aceptó el aviso
      });
      
      // Mostrar mensaje de éxito y no iniciar sesión automáticamente
      setRegistroExitoso(true);
      setMensajeExito(response.data.mensaje || 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
      
    } catch (e) {
      alert(e.response?.data?.error || 'Error en el registro');
    }
  };

  const handleVolverLogin = () => {
    navigate('/login');
  };

  if (registroExitoso) {
    return (
      <div className="login-container">
        <div className="login-form">
          <div className="registro-exitoso">
            <div className="icono-exito">📧</div>
            <h2>¡Registro Exitoso!</h2>
            <p>{mensajeExito}</p>
            <p>Hemos enviado un correo de confirmación a <strong>{correo}</strong></p>
            <p>Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.</p>
            <button onClick={handleVolverLogin} className="btn-primary">
              Ir al Login
            </button>
          </div>
        </div>
        
        <style jsx>{`
          .registro-exitoso {
            text-align: center;
            padding: 20px;
          }
          
          .icono-exito {
            font-size: 48px;
            margin-bottom: 20px;
          }
          
          .registro-exitoso h2 {
            color: #28a745;
            margin-bottom: 20px;
          }
          
          .registro-exitoso p {
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
      <h2>Registro</h2>
      <input
        type="text"
        placeholder="Nombre Completo"
        onChange={e => setNombre(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo"
        onChange={e => setCorreo(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        onChange={e => setPassword(e.target.value)}
      />

      <div className="privacy-checkbox">
        <input
          type="checkbox"
          id="privacidad"
          checked={aceptoPrivacidad}
          onChange={(e) => setAceptoPrivacidad(e.target.checked)}
        />
        <label htmlFor="privacidad">
          Acepto el <span className="privacy-link" onClick={() => setMostrarAviso(true)}>Aviso de Privacidad</span>
        </label>
      </div>

      <button onClick={handleRegister}>Registrar</button>
      <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>

      {mostrarAviso && (
        <div className="privacy-modal">
          <div className="privacy-content">
            <h3>Aviso de Privacidad para Inicio de Sesión</h3>
            <div className="privacy-text">
              <p><strong>Responsable del tratamiento de datos personales:</strong></p>
              <p>SalonesWeb es responsable del tratamiento de sus datos personales conforme a lo establecido en este aviso de privacidad.</p>
              
              <p><strong>Datos personales que se recaban:</strong></p>
              <p>Para efectos del acceso a este sistema mediante el formulario de inicio de sesión, se recaban y tratan los siguientes datos personales:</p>

                <p>Nombre de usuario</p>
                <p>Correo electrónico</p>
                <p>Contraseña (en formato cifrado)</p>
              
              <p><strong>Finalidades del tratamiento:</strong></p>
              <p>Los datos personales recabados serán utilizados para las siguientes finalidades:</p>
              
                <p>Identificar y autenticar al usuario dentro del sistema.</p>
                <p>Permitir el acceso personalizado a las funcionalidades del sistema.</p>
                <p>Mantener un registro de accesos para control de seguridad.</p>
                <p>Verificar el cumplimiento de políticas de uso.</p>
              

              <p><strong>Medidas de seguridad:</strong></p>
              <p>La información proporcionada será tratada de forma confidencial y se encuentra protegida mediante mecanismos de seguridad tecnológica, física y administrativa para evitar el uso, pérdida, acceso o divulgación no autorizada.</p>

              <p><strong>Transferencia de datos:</strong></p>
              <p>No se realiza ninguna transferencia de datos personales a terceros sin su consentimiento, salvo las excepciones previstas por la ley.</p>

              <p><strong>Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición):</strong></p>
              <p>Usted tiene derecho a acceder, rectificar y cancelar sus datos personales, así como a oponerse al tratamiento de los mismos o revocar el consentimiento que para tal fin nos haya otorgado. Para ejercer dichos derechos, puede enviar su solicitud al correo: [correo de contacto].</p>

              <p><strong>Legislación aplicable:</strong></p>
              <p>Este aviso de privacidad cumple con lo dispuesto por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y los Lineamientos del Aviso de Privacidad publicados por el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI).</p>

              <p><strong>Modificaciones al aviso:</strong></p>
              <p>Nos reservamos el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso de privacidad, mismas que serán notificadas a través de este medio.</p>

              <p><strong>Fecha de última actualización:</strong> 02/07/2025</p>
            </div>
            <button 
              className="privacy-close-btn"
              onClick={() => setMostrarAviso(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;