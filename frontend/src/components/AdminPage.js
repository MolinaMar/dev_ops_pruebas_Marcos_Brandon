import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import './AdminPage.css';

function AdminPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [salones, setSalones] = useState([]);
  const [nuevoSalon, setNuevoSalon] = useState({ 
    nombre: '', 
    descripcion: '', 
    ubicacion: '', 
    capacidad: '',
    estado: 'disponible',
    imagenes: []
  });
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [mostrarFormularioUsuario, setMostrarFormularioUsuario] = useState(false);
  const [mostrarFormularioSalon, setMostrarFormularioSalon] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'usuario'
  });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/admin/usuarios`).then(res => setUsuarios(res.data));
    axios.get(`${API_BASE_URL}/admin/reservas`).then(res => setReservas(res.data));
    axios.get(`${API_BASE_URL}/salones`).then(res => setSalones(res.data));
  }, []);

  const eliminarUsuario = id => {
    const usuarioAEliminar = usuarios.find(u => u._id === id);
    const usuarioActual = localStorage.getItem('correo');
    
    if (usuarioAEliminar && usuarioAEliminar.correo === usuarioActual) {
      alert("No se puede borrar al administrador actual");
      return;
    }

    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      axios.delete(`${API_BASE_URL}/admin/usuarios/${id}`, {
        headers: {
          'X-User-Email': usuarioActual
        }
      }).then(() => {
        setUsuarios(usuarios.filter(u => u._id !== id));
        alert('Usuario eliminado correctamente');
      }).catch(error => {
        console.error("Error al eliminar usuario:", error);
        alert(error.response?.data?.error || "Error al eliminar usuario");
      });
    }
  };

  const eliminarReserva = id => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      axios.delete(`${API_BASE_URL}/admin/reservas/${id}`).then(() => {
        setReservas(reservas.filter(r => r._id !== id));
        // Recargar los salones para ver el cambio de estado
        axios.get(`${API_BASE_URL}/salones`).then(res => setSalones(res.data));
        alert('Reserva eliminada correctamente');
      });
    }
  };
  
  const marcarDisponible = reservaId => {
    if (window.confirm('¿Estás seguro de que deseas marcar este salón como disponible?')) {
      axios.delete(`${API_BASE_URL}/admin/reservas/${reservaId}`).then(() => {
        // Actualizar la lista de reservas
        setReservas(reservas.filter(r => r._id !== reservaId));
        // Recargar los salones para ver el cambio de estado
        axios.get(`${API_BASE_URL}/salones`).then(res => setSalones(res.data));
        alert('Salón marcado como disponible');
      });
    }
  };

  const eliminarSalon = id => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este salón?')) {
      axios.delete(`${API_BASE_URL}/admin/salones/${id}`).then(() => {
        setSalones(salones.filter(s => s._id !== id));
        alert('Salón eliminado correctamente');
      });
    }
  };

  const actualizarEstadoSalon = (id, nuevoEstado) => {
    axios.put(`${API_BASE_URL}/admin/salones/${id}/estado`, { estado: nuevoEstado }, {
      headers: { 'Content-Type': 'application/json' }
    }).then(() => {
      // Actualizar el estado local sin recargar la página
      setSalones(salones.map(salon => 
        salon._id === id ? {...salon, estado: nuevoEstado} : salon
      ));
    }).catch(error => {
      console.error("Error al actualizar el estado del salón:", error);
      alert("Error al actualizar el estado del salón");
    });
  };

  const handleImagenChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Actualizar la imagen seleccionada
      setImagenSeleccionada(file);
      
      // Crear URL para previsualizar la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagen(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const eliminarImagen = () => {
    setImagenSeleccionada(null);
    setPreviewImagen(null);
  };

  const crearSalon = async () => {
    try {
      let salonData = {...nuevoSalon};
      salonData.imagenes = [];
      
      // Si hay una imagen seleccionada, subirla
      if (imagenSeleccionada) {
        const formData = new FormData();
        formData.append('imagen', imagenSeleccionada);
        
        const respuestaImagen = await axios.post(`${API_BASE_URL}/upload/imagen`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Guardar la imagen en base64 en el array de imágenes del salón
        salonData.imagenes.push(`data:image/${imagenSeleccionada.type.split('/')[1]};base64,${respuestaImagen.data.imagen}`);
      }
      
      // Crear el salón con la imagen (si existe)
      await axios.post(`${API_BASE_URL}/admin/salones`, salonData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      alert('Salón creado correctamente');
      setMostrarFormularioSalon(false);
      setNuevoSalon({ 
        nombre: '', 
        descripcion: '', 
        ubicacion: '', 
        capacidad: '',
        estado: 'disponible',
        imagenes: []
      });
      setImagenSeleccionada(null);
      setPreviewImagen(null);
      window.location.reload();
    } catch (error) {
      console.error('Error al crear el salón:', error);
      alert('Error al crear el salón');
    }
  };

  const agregarUsuario = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, nuevoUsuario);
      if (response.status === 201) {
        alert('Usuario creado exitosamente');
        setUsuarios([...usuarios, response.data.usuario]);
        setMostrarFormularioUsuario(false);
        setNuevoUsuario({
          nombre: '',
          correo: '',
          password: '',
          rol: 'usuario'
        });
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error al crear usuario');
    }
  };

  const cerrarSesion = () => {
    const correo = localStorage.getItem('correo');
    console.log('cerrando sesión de:', correo);
    if (!correo) {
      alert('No hay sesión activa');
      return;
    }
    axios.post(`${API_BASE_URL}/logout`, { correo }, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(() => {
      localStorage.removeItem('correo');
      window.location.href = '/';
    })
    .catch(err => {
      console.error(err);
      alert('Error al cerrar sesión');
    });
  };

  return (
    <div className="admin-container">
      <div className="logout-container">
        <button 
          className="admin-btn add-user-btn"
          onClick={() => setMostrarFormularioUsuario(true)}
        >
          Agregar usuario
        </button>
        <button 
          className="admin-btn add-user-btn"
          onClick={() => setMostrarFormularioSalon(true)}
        >
          Agregar salón
        </button>
        <button className="logout-btn" onClick={cerrarSesion}>Cerrar sesión</button>
      </div>

      {mostrarFormularioUsuario && (
        <div className="modal-overlay">
          <div className="user-form-modal">
            <h3>Registrar Nuevo Usuario</h3>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                value={nuevoUsuario.nombre}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Correo</label>
              <input 
                type="email" 
                value={nuevoUsuario.correo}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, correo: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                value={nuevoUsuario.password}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Asignar Rol</label>
              <select
                value={nuevoUsuario.rol}
                onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
              >
                <option value="usuario">Usuario</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <div className="form-buttons">
              <button className="admin-btn" onClick={agregarUsuario}>Agregar</button>
              <button className="admin-btn cancel-btn" onClick={() => setMostrarFormularioUsuario(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarFormularioSalon && (
        <div className="modal-overlay">
          <div className="user-form-modal">
            <h3>Registrar Nuevo Salón</h3>
            <div className="form-group">
              <label>Nombre del Salón</label>
              <input 
                type="text" 
                value={nuevoSalon.nombre}
                onChange={(e) => setNuevoSalon({...nuevoSalon, nombre: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea 
                value={nuevoSalon.descripcion}
                onChange={(e) => setNuevoSalon({...nuevoSalon, descripcion: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Ubicación</label>
              <input 
                type="text" 
                value={nuevoSalon.ubicacion}
                onChange={(e) => setNuevoSalon({...nuevoSalon, ubicacion: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Capacidad</label>
              <input 
                type="text" 
                value={nuevoSalon.capacidad}
                onChange={(e) => setNuevoSalon({...nuevoSalon, capacidad: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select
                value={nuevoSalon.estado}
                onChange={(e) => setNuevoSalon({...nuevoSalon, estado: e.target.value})}
              >
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
            <div className="form-group">
              <label>Imagen del Salón</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImagenChange}
                className="file-input"
              />
              <small className="form-help-text">Selecciona una imagen desde tu dispositivo</small>
              
              {previewImagen && (
                <div className="imagen-container">
                  <div className="imagen-preview">
                    <img src={previewImagen} alt="Vista previa" />
                    <button 
                      type="button" 
                      className="eliminar-imagen-btn" 
                      onClick={eliminarImagen}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="form-buttons" style={{marginTop: '15px', position: 'sticky', bottom: '0', backgroundColor: '#2c2c3e', padding: '10px 0'}}>
              <button className="admin-btn" onClick={crearSalon}>Agregar</button>
              <button className="admin-btn cancel-btn" onClick={() => setMostrarFormularioSalon(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <h2>Panel de Administrador</h2>

      <div className="table-container">
        <h3>Usuarios Registrados</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u._id}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>
                  <button 
                    className={`admin-btn delete-btn ${u.correo === localStorage.getItem('correo') ? 'disabled-btn' : ''}`} 
                    onClick={() => eliminarUsuario(u._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Reservas</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Salón</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r._id}>
                <td>{r.correo_usuario || r.usuario_id}</td>
                <td>{r.salon_nombre || r.salon_id}</td>
                <td>{r.fecha}</td>
                <td>{r.hora}</td>
                <td>
                  <button className="admin-btn disponible-btn" onClick={() => marcarDisponible(r._id)}>Disponible</button>
                  <button className="admin-btn delete-btn" onClick={() => eliminarReserva(r._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Salones Disponibles</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Ubicación</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salones.map(s => (
              <tr key={s._id}>
                <td>{s.nombre}</td>
                <td>{s.descripcion}</td>
                <td>{s.ubicacion}</td>
                <td>{s.capacidad}</td>
                <td>
                  <select 
                    value={s.estado}
                    onChange={(e) => actualizarEstadoSalon(s._id, e.target.value)}
                    className="estado-select"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="reservado">Reservado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </td>
                <td>
                  <button className="admin-btn delete-btn" onClick={() => eliminarSalon(s._id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>


      </div>
    </div>
  );
}

export default AdminPage;