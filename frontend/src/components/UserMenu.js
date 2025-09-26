import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import API_BASE_URL from '../config';
import './Login.css';

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!captchaToken) {
      alert('Por favor verifica el captcha.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        correo,
        password,
        captcha: captchaToken
      });

      const rol = res.data.rol;

      // Limpiar localStorage por si hay datos antiguos
      localStorage.clear();

      // Guardar datos en localStorage
      localStorage.setItem('correo', correo);
      localStorage.setItem('rol', rol);
      localStorage.setItem('userActivo', 'true');

      // Redireccionar según el rol
      if (rol === 'administrador') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
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

      <ReCAPTCHA
        sitekey="6LcBMWgrAAAAAHzL-8Ez7nyYE8etPb0LdyUSDjCF"
        onChange={token => setCaptchaToken(token)}
      />

      <button onClick={handleLogin}>Iniciar</button>
      <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
    </div>
  );
}

export default Login;
