# Guía para Probar el Sistema de Recuperación de Contraseña

## Descripción
Este sistema permite a los usuarios recuperar su contraseña cuando la olvidan, mediante un enlace enviado por correo electrónico.

## Prerrequisitos

✅ **Servidores ejecutándose**:
- Backend: `https://localhost:5000`
- Frontend: `https://localhost:3000`

✅ **Usuario registrado y confirmado**: Necesitas un usuario que ya haya confirmado su email para probar la recuperación.

## Flujo Completo de Recuperación

### 1. Solicitar Recuperación de Contraseña

1. **Ve al login**: `https://localhost:3000/login`
2. **Haz clic en**: "¿Olvidaste tu contraseña?"
3. **Te redirige a**: `https://localhost:3000/solicitar-recuperacion`
4. **Ingresa el correo** del usuario registrado
5. **Haz clic en**: "Enviar Enlace de Recuperación"

**Resultado esperado**:
- Mensaje: "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación."
- Instrucciones para revisar email y spam
- Botón para volver al login

### 2. Verificar Email de Recuperación

1. **Revisa tu bandeja de entrada** del email usado
2. **Busca email con asunto**: "Recuperar Contraseña - Sistema de Salones"
3. **Si no lo ves**, revisa **SPAM/Correo no deseado**

**Contenido del email esperado**:
```
Asunto: Recuperar Contraseña - Sistema de Salones

Hola [Nombre del Usuario],

Recibimos una solicitud para restablecer la contraseña de tu cuenta...

[Botón: Restablecer Contraseña]

Este enlace expirará en 1 hora por seguridad.
```

### 3. Restablecer Contraseña

1. **Haz clic en el enlace** del correo
2. **Te redirige a**: `https://localhost:3000/recuperar-password?token=XXX&email=XXX`
3. **Completa el formulario**:
   - Nueva contraseña (mínimo 6 caracteres)
   - Confirmar nueva contraseña
4. **Haz clic en**: "Restablecer Contraseña"

**Resultado esperado**:
- Mensaje: "Contraseña restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña."
- Redirección automática al login

### 4. Probar Nueva Contraseña

1. **Ve al login**: `https://localhost:3000/login`
2. **Ingresa**:
   - Correo del usuario
   - **Nueva contraseña** (la que acabas de establecer)
3. **Completa el captcha**
4. **Haz clic en**: "Iniciar Sesión"

**Resultado esperado**:
- Login exitoso con la nueva contraseña
- La contraseña anterior ya no funciona

## Pruebas de Seguridad

### Probar Email No Registrado

1. Ve a: `https://localhost:3000/solicitar-recuperacion`
2. Ingresa un email que NO esté registrado
3. Envía la solicitud

**Resultado esperado**:
- Mismo mensaje: "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación."
- NO se revela si el email existe o no (seguridad)
- NO se envía ningún correo

### Probar Token Expirado

1. Solicita recuperación de contraseña
2. **Espera más de 1 hora**
3. Intenta usar el enlace del correo

**Resultado esperado**:
- Error: "El token ha expirado. Solicita un nuevo enlace de recuperación."
- Opción para solicitar nuevo enlace

### Probar Token Inválido

1. Toma un enlace de recuperación válido
2. **Modifica manualmente el token** en la URL
3. Intenta acceder

**Resultado esperado**:
- Error: "Token inválido o expirado"
- Opciones para solicitar nuevo enlace o volver al login

### Probar Token Usado

1. Usa un enlace de recuperación para cambiar contraseña
2. **Intenta usar el mismo enlace nuevamente**

**Resultado esperado**:
- Error: "Token inválido o expirado"
- El token se elimina después del primer uso

## Validaciones del Frontend

### Contraseña Muy Corta

1. En el formulario de restablecer contraseña
2. Ingresa una contraseña de menos de 6 caracteres

**Resultado esperado**:
- Mensaje: "La contraseña debe tener al menos 6 caracteres"
- Botón deshabilitado hasta cumplir requisito

### Contraseñas No Coinciden

1. Ingresa contraseña y confirmación diferentes

**Resultado esperado**:
- Mensaje: "Las contraseñas no coinciden"
- Botón deshabilitado hasta que coincidan

## Verificación en Base de Datos

Puedes verificar los tokens en MongoDB:

```javascript
// Conectar a MongoDB
use salones_db

// Ver usuario con token de recuperación
db.usuarios.find(
  {"token_recuperacion": {$exists: true}}, 
  {nombre: 1, correo: 1, token_recuperacion: 1, fecha_token_recuperacion: 1}
)

// Después de usar el token, debería estar limpio:
db.usuarios.find(
  {correo: "usuario@email.com"}, 
  {nombre: 1, correo: 1, token_recuperacion: 1, fecha_token_recuperacion: 1}
)
```

## URLs del Sistema

- **Login**: `https://localhost:3000/login`
- **Solicitar recuperación**: `https://localhost:3000/solicitar-recuperacion`
- **Restablecer contraseña**: `https://localhost:3000/recuperar-password?token=XXX&email=XXX`

## Troubleshooting

### No recibo el email de recuperación

1. **Verifica que el usuario esté registrado y confirmado**
2. **Revisa spam/correo no deseado**
3. **Verifica configuración de email** en `backend/config.py`
4. **Revisa logs del backend** para errores de envío

### Error "Token inválido o expirado"

**Posibles causas**:
- Token expiró (más de 1 hora)
- Token ya fue usado
- URL del enlace está incompleta o dañada
- Usuario no existe

**Solución**: Solicitar nuevo enlace de recuperación

### Error al restablecer contraseña

1. **Verifica que el backend esté ejecutándose**
2. **Revisa que el token y email estén en la URL**
3. **Verifica que la contraseña cumpla requisitos**

## Logs Útiles

**Backend (Terminal)**:
```
 * Detected change in routes.py, reloading
 * Debugger is active!
```

**Consola del navegador (F12)**:
- Errores de red o JavaScript
- Respuestas de la API

## Resultado Final Esperado

✅ **Flujo completo exitoso**:
1. Usuario solicita recuperación → Recibe email
2. Hace clic en enlace → Puede cambiar contraseña  
3. Usa nueva contraseña → Login exitoso
4. Contraseña anterior → Ya no funciona

✅ **Seguridad funcionando**:
- Tokens expiran en 1 hora
- Tokens se usan solo una vez
- No se revela si emails existen
- Validaciones de contraseña funcionan

¡El sistema está funcionando correctamente cuando todos estos escenarios se comportan como se espera!