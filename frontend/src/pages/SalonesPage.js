import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import './SalonesPage.css';

function SalonesPage() {
  const [salones, setSalones] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/salones`)
      .then(res => setSalones(res.data))
      .catch(err => console.error('Error al cargar salones:', err));
  }, []);

  const openModal = (salon) => {
    setSelectedSalon(salon);
  };

  const closeModal = () => {
    setSelectedSalon(null);
  };

  const handleReservar = (salon) => {
    const correoUsuario = localStorage.getItem('correo');
    
    if (!correoUsuario) {
      alert('Por favor inicia sesión para realizar una reserva');
      return;
    }
    
    navigate(`/reservar?salonId=${salon._id}&salonNombre=${salon.nombre}`);
  };

  return (
    <div className="salones-container">
      <h2>Todos los Salones Disponibles</h2>
      <div className="salones-lista">
        {salones.map(salon => (
          <div className="salon-card" key={salon._id} onClick={() => openModal(salon)}>
            <div className="salon-image-container">
              <img 
                src={salon.imagenes && salon.imagenes.length > 0 ? salon.imagenes[0] : (salon.imagen || 'https://via.placeholder.com/300x200?text=Salón')}
                alt={salon.nombre}
                className="salon-image"
              />
            </div>
            <h3>{salon.nombre}</h3>
            <p><strong>Ubicación:</strong> {salon.ubicacion}</p>
              <p><strong>Capacidad:</strong> {salon.capacidad} personas</p>
              <p><strong>Estado:</strong> {salon.estado}</p>
              <button 
                className="reservar-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReservar(salon);
                }}
                disabled={salon.estado !== 'disponible'}
              >
                Reservar
              </button>
          </div>
        ))}
      </div>

      {/* Modal de detalles */}
      {selectedSalon && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>×</button>
            <h2>{selectedSalon.nombre}</h2>
            <div className="modal-image-container">
              <img 
                src={selectedSalon.imagenes && selectedSalon.imagenes.length > 0 ? selectedSalon.imagenes[0] : (selectedSalon.imagen || 'https://via.placeholder.com/500x300?text=Salón')} 
                alt={selectedSalon.nombre}
                className="modal-single-image"
              />
            </div>
            <div className="modal-details">
              <p><strong>Nombre:</strong> {selectedSalon.nombre}</p>
              <p><strong>Descripción:</strong> {selectedSalon.descripcion}</p>
              <p><strong>Ubicación:</strong> {selectedSalon.ubicacion}</p>
              <p><strong>Capacidad:</strong> {selectedSalon.capacidad} personas</p>
              <p><strong>Estado:</strong> {selectedSalon.estado}</p>
              <button 
                className="reservar-btn modal-reservar-btn"
                onClick={() => handleReservar(selectedSalon)}
                disabled={selectedSalon.estado !== 'disponible'}
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalonesPage;
