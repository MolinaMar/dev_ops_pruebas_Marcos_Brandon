# Configuración del Sistema de Correo Electrónico

## Descripción
Este sistema implementa confirmación de usuarios por correo electrónico. Después de registrarse, los usuarios deben confirmar su email antes de poder iniciar sesión.

## Configuración del Servidor de Correo

Para que el sistema funcione completamente, necesitas configurar las credenciales del servidor de correo en `backend/config.py`:

```python
class Config:
    # ... otras configuraciones ...
    
    # Configuración del servidor de correo
    MAIL_SERVER = 'smtp.gmail.com'  # Para Gmail
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = 'tu-email@gmail.com'  # Reemplaza con tu email
    MAIL_PASSWORD = 'tu-contraseña-de-aplicacion'  # Contraseña de aplicación
    MAIL_DEFAULT_SENDER = 'tu-email@gmail.com'  # Reemplaza con tu email
```

## Configuración para Gmail

1. **Habilitar autenticación de dos factores** en tu cuenta de Gmail
2. **Generar una contraseña de aplicación**:
   - Ve a tu cuenta de Google
   - Seguridad → Contraseñas de aplicaciones
   - Genera una nueva contraseña para "Correo"
   - Usa esta contraseña en `MAIL_PASSWORD`

## Configuración para otros proveedores

### Outlook/Hotmail
```python
MAIL_SERVER = 'smtp-mail.outlook.com'
MAIL_PORT = 587
MAIL_USE_TLS = True
```

### Yahoo
```python
MAIL_SERVER = 'smtp.mail.yahoo.com'
MAIL_PORT = 587
MAIL_USE_TLS = True
```

## Flujo del Sistema

1. **Registro**: Usuario se registra → Se crea cuenta inactiva → Se envía email de confirmación
2. **Confirmación**: Usuario hace clic en enlace → Cuenta se activa
3. **Login**: Solo usuarios con email confirmado pueden iniciar sesión

## Estructura del Email de Confirmación

El email incluye:
- Saludo personalizado
- Enlace de confirmación con token único
- Instrucciones claras
- Información de expiración (24 horas)

## URLs del Sistema

- **Registro**: `https://localhost:3000/register`
- **Confirmación**: `https://localhost:3000/confirmar-email?token=XXX&email=XXX`
- **Login**: `https://localhost:3000/login`

## Seguridad

- Tokens únicos con expiración de 24 horas
- Verificación de email y token en backend
- Usuarios inactivos no pueden iniciar sesión
- Tokens se eliminan después de la confirmación

## Pruebas

1. Registra un nuevo usuario
2. Verifica que aparezca el mensaje de confirmación
3. Revisa tu email para el mensaje de confirmación
4. Haz clic en el enlace de confirmación
5. Intenta iniciar sesión con las credenciales

## Troubleshooting

### Error: "Error al enviar correo de confirmación"
- Verifica las credenciales del servidor de correo
- Asegúrate de que la contraseña de aplicación sea correcta
- Verifica la conexión a internet

### Error: "Token inválido o usuario ya confirmado"
- El token puede haber expirado (24 horas)
- El usuario ya confirmó su email
- Verifica que el enlace esté completo

### Error: "Debes confirmar tu correo electrónico"
- El usuario no ha confirmado su email
- Revisa la bandeja de entrada y spam
- Contacta al administrador si no recibiste el email