import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userActivo = localStorage.getItem('userActivo');
    const role = localStorage.getItem('rol');
    setIsLoggedIn(userActivo === 'true');
    setUserRole(role || '');
  }, [location]);

  const handleLogout = async () => {
    try {
      const correo = localStorage.getItem('correo');
      
      // Llamada al logout en Flask
      await axios.post(`${API_BASE_URL}/logout`, {
        correo: correo
      });

      // Limpiar el frontend
      localStorage.setItem('userActivo', 'false');
      localStorage.removeItem('rol');
      localStorage.removeItem('correo');
      setIsLoggedIn(false);
      setUserRole('');
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Limpiar el frontend incluso si falla el logout en el backend
      localStorage.setItem('userActivo', 'false');
      localStorage.removeItem('rol');
      localStorage.removeItem('correo');
      setIsLoggedIn(false);
      setUserRole('');
      navigate('/');
      window.location.reload();
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">SalonesWeb</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/salones">Salones</Link></li>
        <li><Link to="/nosotros">Nosotros</Link></li>
      </ul>

      {isLoggedIn && userRole === 'usuario' ? (
        <div className="user-menu">
          <button onClick={toggleMenu} className="user-button">
            <FontAwesomeIcon icon={faUser} /> ▼
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <Link to="/user" onClick={() => setShowMenu(false)}>Perfil</Link>
              <Link to="/mis-reservas" onClick={() => setShowMenu(false)}>Mis reservas</Link>
              <button onClick={handleLogout}>Salir</button>
            </div>
          )}
        </div>
      ) : (
        <div className="navbar-login">
          <Link to="/login" className="login-button">Ingresar</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;