import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import './HomePage.css';

function HomePage() {
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
    <>
      {/* Sección de bienvenida */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1>Bienvenido a SalonesWeb</h1>
          <p className="hero-subtitle">Encuentra el lugar perfecto para tus eventos especiales</p>
        </div>
      </section>

      {/* Sección de misión, visión y valores */}
      <section className="about-section">
        <div className="about-card">
          <h2>Misión</h2>
          <p>Ofrecer los mejores espacios para eventos en un solo lugar, con transparencia y calidad.</p>
        </div>
        <div className="about-card">
          <h2>Visión</h2>
          <p>Ser la plataforma líder en renta de salones en la región, reconocida por nuestro servicio excepcional.</p>
        </div>
        <div className="about-card">
          <h2>Valores</h2>
          <ul>
            <li>Compromiso</li>
            <li>Calidad</li>
            <li>Confianza</li>
            <li>Servicio personalizado</li>
          </ul>
        </div>
      </section>

      {/* Catálogo de salones */}
      <section className="catalog-section">
        <h2>Catálogo de Salones</h2>
        <div className="salones-grid">
          {salones.map(salon => (
            <div 
              className="salon-card" 
              key={salon._id}
              onClick={() => openModal(salon)}
            >
              <div className="salon-name">{salon.nombre}</div>
              <div className="salon-image-container">
                <img 
                  src={salon.imagenes && salon.imagenes.length > 0 ? salon.imagenes[0] : (salon.imagen || '../images.jpg')} 
                  alt={salon.nombre} 
                  className="salon-image"
                />
                <div className="salon-overlay">
                <span>Ver detalles</span>
              </div>
              <button 
                className="reservar-btn salon-card-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReservar(salon);
                }}
                disabled={salon.estado !== 'disponible'}
              >
                Reservar
              </button>
              </div>
            </div>
          ))}
        </div>
      </section>

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
    </>
  );
}

export default HomePage;