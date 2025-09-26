import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserPage from './components/UserPage';
import AdminPage from './components/AdminPage';
import HomePage from './pages/HomePage';
import SalonesPage from './pages/SalonesPage';
import NosotrosPage from './pages/NosotrosPage';
import MisReservasPage from './components/MisReservasPage';
import ReservarSalonPage from './pages/ReservarSalonPage';
import ConfirmarEmail from './components/ConfirmarEmail';
import SolicitarRecuperacion from './components/SolicitarRecuperacion';
import RecuperarPassword from './components/RecuperarPassword';

import Navbar from './components/Navbar';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <>
      {!isAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/salones" element={<SalonesPage />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirmar-email" element={<ConfirmarEmail />} />
        <Route path="/solicitar-recuperacion" element={<SolicitarRecuperacion />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/mis-reservas" element={<MisReservasPage />} />
        <Route path="/reservar-salon" element={<ReservarSalonPage />} />
        <Route path="/reservar" element={<ReservarSalonPage />} />
        
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
