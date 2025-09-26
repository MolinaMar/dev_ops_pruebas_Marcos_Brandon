import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import './ReservarSalonPage.css';

const ReservarSalonPage = () => {
  const [salones, setSalones] = useState([]);
  const [salonId, setSalonId] = useState('');
  const [salonNombre, setSalonNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const correoUsuario = localStorage.getItem('correo');

  // Efecto para manejar los parámetros de URL
  useEffect(() => {
    // Verificar si hay parámetros en la URL para pre-seleccionar un salón
    const params = new URLSearchParams(location.search);
    const salonIdParam = params.get('salonId');
    const salonNombreParam = params.get('salonNombre');
    
    if (salonIdParam) {
      setSalonId(salonIdParam);
    }
    
    if (salonNombreParam) {
      setSalonNombre(salonNombreParam);
    }
  }, [location.search]);

  // Efecto para cargar salones disponibles
  useEffect(() => {
    const cargarSalones = () => {
      setCargando(true);
      axios.get(`${API_BASE_URL}/salones`)
        .then(res => setSalones(res.data))
        .catch(err => console.error('Error al cargar salones:', err))
        .finally(() => setCargando(false));
    };
    
    cargarSalones();
    
    // Configurar un intervalo para recargar los salones cada 30 segundos
    const intervaloSalones = setInterval(cargarSalones, 30000);
    
    return () => clearInterval(intervaloSalones);
  }, []);

  const reservarSalon = () => {
    if (!salonId || !fecha || !hora) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    // Verificar si el usuario ha iniciado sesión
    if (!correoUsuario) {
      alert('Por favor inicia sesión para realizar una reserva');
      return;
    }
    
    setCargando(true);
    axios.post(`${API_BASE_URL}/reservar`, {
      correo_usuario: correoUsuario,
      salon_id: salonId,
      fecha,
      hora
    }).then(() => {
      alert('Reservación realizada correctamente');
      
      // Recargar la lista de salones para actualizar los disponibles
      axios.get(`${API_BASE_URL}/salones`)
        .then(res => setSalones(res.data))
        .catch(err => console.error('Error al recargar salones:', err))
        .finally(() => setCargando(false));
      
      // Limpiar el formulario
      setSalonId('');
      setSalonNombre('');
      setFecha('');
      setHora('');
      
      // Redirigir a la página de mis reservas
      navigate('/mis-reservas');
    }).catch(err => {
      console.error('Error al realizar la reserva:', err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert('Error al realizar la reserva');
      }
      setCargando(false);
    });
  };

  return (
    <div className="reservar-salon-container">
      <h1>Reservar Salón</h1>
      
      <div className="reservar-salon-section">
        <div className="reservar-form">
          <div className="form-group">
            <label>Salón:</label>
            <select 
              value={salonId} 
              onChange={e => {
                setSalonId(e.target.value);
                const salon = salones.find(s => s._id === e.target.value);
                if (salon) setSalonNombre(salon.nombre);
              }}
            >
              <option value="">Selecciona un salón</option>
              {salones
                .filter(s => s.estado === 'disponible')
                .map(s => (
                  <option key={s._id} value={s._id}>{s.nombre}</option>
                ))
              }
            </select>
          </div>
          
          <div className="form-group">
            <label>Fecha:</label>
            <input 
              type="date" 
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="form-group">
            <label>Hora:</label>
            <input 
              type="time" 
              value={hora}
              onChange={e => setHora(e.target.value)}
            />
          </div>
          
          <button 
            className="reservar-btn"
            onClick={reservarSalon}
            disabled={cargando}
          >
            {cargando ? 'Reservando...' : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservarSalonPage;