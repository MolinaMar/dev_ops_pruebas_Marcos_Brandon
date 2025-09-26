# Guía para Probar el Sistema de Confirmación por Email

## Prerrequisitos

1. **Servidores ejecutándose**:
   - Backend: `https://localhost:5000` ✅
   - Frontend: `https://localhost:3000` ✅

2. **Configuración de email**: Verifica que en `backend/config.py` tengas configurado:
   ```python
   MAIL_USERNAME = 'jrgjhgnw@gmail.com'
   MAIL_PASSWORD = 'jrgjhgnw123'  # Tu contraseña de aplicación real
   ```

## Pasos para Probar

### 1. Registro de Usuario

1. Ve a: `https://localhost:3000/register`
2. Completa el formulario:
   - **Nombre**: Tu nombre completo
   - **Correo**: Un email real al que tengas acceso
   - **Contraseña**: Una contraseña segura
   - ✅ Acepta el aviso de privacidad
3. Haz clic en **"Registrarse"**

**Resultado esperado**: 
- Aparece mensaje: "¡Registro Exitoso!"
- Se muestra: "Hemos enviado un correo de confirmación a [tu-email]"
- Botón para "Ir al Login"

### 2. Verificar Email Enviado

1. **Revisa tu bandeja de entrada** del email que usaste
2. **Busca un email** con asunto: "Confirma tu cuenta - Sistema de Salones"
3. **Si no lo ves**, revisa la carpeta de **SPAM/Correo no deseado**

**Contenido del email esperado**:
```
Asunto: Confirma tu cuenta - Sistema de Salones

Hola [Tu Nombre],

Gracias por registrarte en nuestro sistema de reserva de salones.

Para activar tu cuenta, haz clic en el siguiente enlace:
[Enlace de confirmación]

Este enlace expirará en 24 horas.

Si no te registraste en nuestro sistema, puedes ignorar este correo.

Saludos,
Equipo de Sistema de Salones
```

### 3. Confirmar Email

1. **Haz clic en el enlace** del correo
2. Te redirigirá a: `https://localhost:3000/confirmar-email?token=XXX&email=XXX`

**Resultado esperado**:
- Aparece: "¡Cuenta Activada!"
- Mensaje: "Email confirmado correctamente. Tu cuenta ha sido activada."
- Redirección automática al login en 3 segundos

### 4. Probar Login

1. Ve a: `https://localhost:3000/login`
2. Ingresa las credenciales del usuario que acabas de registrar
3. Completa el captcha
4. Haz clic en **"Iniciar Sesión"**

**Resultado esperado**:
- Login exitoso
- Redirección a la página principal
- Usuario logueado correctamente

## Pruebas Adicionales

### Probar Login Sin Confirmar Email

1. Registra otro usuario pero **NO confirmes el email**
2. Intenta hacer login con esas credenciales

**Resultado esperado**:
- Error: "Debes confirmar tu correo electrónico antes de iniciar sesión"
- Mensaje adicional sobre revisar bandeja de entrada

### Probar Token Expirado

1. Espera más de 24 horas después del registro
2. Intenta usar el enlace de confirmación

**Resultado esperado**:
- Error: "El token ha expirado. Solicita un nuevo correo de confirmación."

### Probar Token Inválido

1. Modifica manualmente el token en la URL del enlace
2. Intenta acceder

**Resultado esperado**:
- Error: "Token inválido o usuario ya confirmado"

## Verificación en Base de Datos

Puedes verificar el estado de los usuarios en MongoDB:

```javascript
// Conectar a MongoDB
use salones_db

// Ver usuarios registrados
db.usuarios.find({}, {nombre: 1, correo: 1, email_confirmado: 1, activo: 1})

// Usuario sin confirmar:
{
  "nombre": "Usuario Test",
  "correo": "test@email.com",
  "email_confirmado": false,
  "activo": false,
  "token_confirmacion": "abc123..."
}

// Usuario confirmado:
{
  "nombre": "Usuario Test",
  "correo": "test@email.com",
  "email_confirmado": true,
  "activo": true
  // token_confirmacion se elimina después de confirmar
}
```

## Troubleshooting

### No recibo el email

1. **Verifica la configuración** en `backend/config.py`
2. **Revisa los logs del backend** en la terminal
3. **Verifica la contraseña de aplicación** de Gmail
4. **Revisa spam/correo no deseado**

### Error al enviar email

**En la terminal del backend verás**:
```
Error al enviar email: [descripción del error]
```

**Soluciones comunes**:
- Verificar credenciales de email
- Verificar conexión a internet
- Verificar que Gmail tenga habilitada la autenticación de 2 factores
- Verificar que la contraseña sea de "aplicación" no la normal

### Error de certificado SSL

Si ves errores de SSL:
1. Acepta el certificado en el navegador
2. Ve a `https://localhost:3000` y acepta el riesgo
3. Ve a `https://localhost:5000` y acepta el riesgo

## Logs Útiles

**Backend (Terminal 14)**:
```
 * Running on https://127.0.0.1:5000
 * Running on https://192.168.0.152:5000
```

**Frontend (Terminal 13)**:
```
Local:            https://localhost:3000
On Your Network:  https://192.168.0.152:3000
```

## Resultado Final Esperado

✅ Usuario se registra → Recibe email → Confirma cuenta → Puede hacer login
❌ Usuario se registra → NO confirma email → NO puede hacer login

¡El sistema está funcionando correctamente cuando ambos escenarios se comportan como se espera!