import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import './MisReservasPage.css';

const MisReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [correoUsuario, setCorreoUsuario] = useState(localStorage.getItem('correo'));

  // Efecto para verificar si el usuario está logueado
  useEffect(() => {
    // Función para verificar el estado de login
    const verificarLogin = () => {
      const correo = localStorage.getItem('correo');
      console.log('Verificando login, correo en localStorage:', correo);
      setCorreoUsuario(correo);
    };
    
    // Verificar al inicio
    verificarLogin();
    
    // Configurar un intervalo para verificar el estado de login cada 2 segundos
    const intervaloLogin = setInterval(verificarLogin, 2000);
    
    return () => clearInterval(intervaloLogin);
  }, []);

  // Efecto para cargar reservas del usuario
  useEffect(() => {
    const cargarReservas = () => {
      if (correoUsuario) {
        setCargando(true);
        console.log('Cargando reservas para:', correoUsuario);
        axios.get(`${API_BASE_URL}/reservas/${correoUsuario}`)
          .then(res => {
            console.log('Reservas recibidas:', res.data);
            setReservas(res.data);
          })
          .catch(err => {
            console.error('Error al cargar reservas:', err);
            alert('Error al cargar las reservas. Por favor, intenta de nuevo más tarde.');
          })
          .finally(() => setCargando(false));
      } else {
        console.log('No hay usuario logueado');
        setReservas([]);
        setCargando(false);
      }
    };
    
    cargarReservas();
    
    // Configurar un intervalo para recargar las reservas cada 15 segundos
    const intervaloReservas = setInterval(cargarReservas, 15000);
    
    return () => clearInterval(intervaloReservas);
  }, [correoUsuario]);

  const cancelarReserva = (reservaId) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      setCargando(true);
      console.log('Intentando cancelar reserva con ID:', reservaId);
      axios.delete(`${API_BASE_URL}/reservas/${reservaId}`)
        .then((response) => {
          console.log('Respuesta de cancelación:', response.data);
          alert('Reserva cancelada correctamente');
          // Recargar la lista de reservas para asegurar sincronización con el servidor
          if (correoUsuario) {
            console.log('Recargando reservas después de cancelar');
            axios.get(`${API_BASE_URL}/reservas/${correoUsuario}`)
              .then(res => {
                console.log('Reservas actualizadas después de cancelar:', res.data);
                setReservas(res.data);
              })
              .catch(err => {
                console.error('Error al recargar reservas después de cancelar:', err);
                alert('Error al recargar las reservas. Por favor, actualiza la página.');
              })
              .finally(() => setCargando(false));
          } else {
            console.log('No hay usuario logueado para recargar reservas');
            setReservas([]);
            setCargando(false);
          }
        })
        .catch(err => {
          console.error('Error al cancelar la reserva:', err);
          alert('Error al cancelar la reserva. Por favor, intenta de nuevo más tarde.');
          setCargando(false);
        });
    }
  };

  console.log('Estado actual - correoUsuario:', correoUsuario);
  console.log('Estado actual - reservas:', reservas);
  console.log('Estado actual - cargando:', cargando);

  return (
    <div className="mis-reservas-container">
      <h1>Mis Reservas</h1>
      
      {correoUsuario ? (
        <div className="mis-reservas-section">
          <table className="reservas-table">
            <thead>
              <tr>
                <th>Salón</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="4" className="cargando">Cargando reservas...</td>
                </tr>
              ) : reservas && reservas.length > 0 ? (
                reservas.map(reserva => (
                  <tr key={reserva._id}>
                    <td>{reserva.salon_nombre || 'Salón no especificado'}</td>
                    <td>{reserva.fecha || 'Fecha no especificada'}</td>
                    <td>{reserva.hora || 'Hora no especificada'}</td>
                    <td>
                      <button 
                        className="cancelar-btn"
                        onClick={() => cancelarReserva(reserva._id)}
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-reservas">No hay reservas disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mis-reservas-section">
          <p className="no-reservas">Inicia sesión para ver tus reservas</p>
        </div>
      )}
    </div>
  );
};

export default MisReservasPage;
