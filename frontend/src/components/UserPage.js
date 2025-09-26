import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import './UserPage.css';

function UserPage() {
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState('');
  const [correoActual, setCorreoActual] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const location = useLocation();
  const correoUsuario = localStorage.getItem('correo');

  // No necesitamos cargar salones ya que solo mostraremos la edición de perfil
  
  // Efecto para cargar datos del usuario
  useEffect(() => {
    if (correoUsuario) {
      setCargando(true);
      axios.get(`${API_BASE_URL}/usuario/${correoUsuario}`)
        .then(res => {
          if (res.data) {
            setNombre(res.data.nombre || '');
            setCorreoActual(res.data.correo || '');
          }
        })
        .catch(err => console.error('Error al cargar datos del usuario:', err))
        .finally(() => setCargando(false));
    }
  }, [correoUsuario]);
  
  // Ya no necesitamos manejar parámetros de URL para salones

  const actualizarPerfil = () => {
    if (!nombre) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    
    setCargando(true);
    axios.put(`${API_BASE_URL}/usuario/${correoUsuario}`, {
      nombre: nombre
    }).then(() => {
      alert('Perfil actualizado correctamente');
      setCargando(false);
    }).catch(err => {
      console.error('Error al actualizar el perfil:', err);
      alert('Error al actualizar el perfil');
      setCargando(false);
    });
  };
  
  const cambiarPassword = () => {
    if (!password || !confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    setCargando(true);
    axios.put(`${API_BASE_URL}/usuario/${correoUsuario}/password`, {
      password: password
    }).then(() => {
      alert('Contraseña actualizada correctamente');
      setPassword('');
      setConfirmPassword('');
      setCargando(false);
    }).catch(err => {
      console.error('Error al actualizar la contraseña:', err);
      alert('Error al actualizar la contraseña');
      setCargando(false);
    });
  };
  
  // Ya no necesitamos la función de reservar salón

  return (
    <div className="user-page-container">
      <h2>Panel de Usuario</h2>
      
      {/* Sección para Editar Perfil */}
        <div className="editar-perfil-section">
          <h3>Editar Perfil</h3>
          <div className="editar-form">
            <div className="form-group">
              <label>Correo Electrónico:</label>
              <input 
                type="email" 
                value={correoActual}
                disabled
              />
              <small>El correo electrónico no se puede modificar</small>
            </div>
            
            <div className="form-group">
              <label>Nombre:</label>
              <input 
                type="text" 
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            
            <button 
              className="actualizar-btn"
              onClick={actualizarPerfil}
              disabled={cargando}
            >
              {cargando ? 'Actualizando...' : 'Actualizar Perfil'}
            </button>
          </div>
          
          <h3>Cambiar Contraseña</h3>
          <div className="cambiar-password-form">
            <div className="form-group">
              <label>Nueva Contraseña:</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
              />
            </div>
            
            <div className="form-group">
              <label>Confirmar Contraseña:</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
              />
            </div>
            
            <button 
              className="actualizar-btn"
              onClick={cambiarPassword}
              disabled={cargando}
            >
              {cargando ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </div>
    </div>
  );
}

export default UserPage;

