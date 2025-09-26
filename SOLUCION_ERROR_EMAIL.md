# Solución al Error de Envío de Correo

## 🚨 Error Identificado

**Error**: `535, b'5.7.8 Username and Password not accepted'`

**Causa**: Las credenciales de Gmail en `backend/config.py` no son válidas o no están configuradas correctamente.

## 🔧 Solución Paso a Paso

### Opción 1: Configurar Gmail con Contraseña de Aplicación (Recomendado)

#### 1. Habilitar Verificación en 2 Pasos

1. Ve a tu **Cuenta de Google**: https://myaccount.google.com/
2. Selecciona **Seguridad** en el menú lateral
3. En "Iniciar sesión en Google", haz clic en **Verificación en 2 pasos**
4. **Actívala** si no está habilitada

#### 2. Generar Contraseña de Aplicación

1. En la misma sección de **Seguridad**
2. Busca **Contraseñas de aplicaciones** (aparece solo si tienes 2FA activado)
3. Haz clic en **Contraseñas de aplicaciones**
4. Selecciona:
   - **Aplicación**: Correo
   - **Dispositivo**: Otro (nombre personalizado)
5. Escribe: "Sistema Salones" o similar
6. Haz clic en **Generar**
7. **Copia la contraseña de 16 caracteres** que aparece

#### 3. Actualizar config.py

Reemplaza en `backend/config.py`:

```python
class Config:
    MONGO_URI = "mongodb://localhost:27017/salones_db"
    SECRET_KEY = "clave_secreta_super_segura"
    
    # Configuración de correo electrónico
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = 'tu_email_real@gmail.com'  # Tu email real
    MAIL_PASSWORD = 'xxxx xxxx xxxx xxxx'      # Contraseña de aplicación (16 caracteres)
    MAIL_DEFAULT_SENDER = 'tu_email_real@gmail.com'  # Tu email real
```

### Opción 2: Usar Otro Proveedor de Email

#### Para Outlook/Hotmail:

```python
class Config:
    # ... otras configuraciones ...
    
    MAIL_SERVER = 'smtp-mail.outlook.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = 'tu_email@outlook.com'
    MAIL_PASSWORD = 'tu_contraseña'  # Contraseña normal
    MAIL_DEFAULT_SENDER = 'tu_email@outlook.com'
```

#### Para Yahoo:

```python
class Config:
    # ... otras configuraciones ...
    
    MAIL_SERVER = 'smtp.mail.yahoo.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = 'tu_email@yahoo.com'
    MAIL_PASSWORD = 'contraseña_de_aplicacion'  # También requiere contraseña de app
    MAIL_DEFAULT_SENDER = 'tu_email@yahoo.com'
```

## 🔄 Pasos Después de Actualizar Credenciales

1. **Guarda** el archivo `config.py`
2. **Reinicia el servidor backend** (se reinicia automáticamente)
3. **Prueba nuevamente** la recuperación de contraseña

## ✅ Verificar que Funciona

1. Ve a: `https://localhost:3000/solicitar-recuperacion`
2. Ingresa un email válido y registrado
3. Haz clic en "Enviar Enlace de Recuperación"
4. **Deberías ver**: "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación."
5. **Revisa tu email** (y spam) para el correo de recuperación

## 🚨 Errores Comunes

### Error: "Username and Password not accepted"
- ❌ Usaste la contraseña normal de Gmail
- ✅ Usa la contraseña de aplicación de 16 caracteres

### Error: "Authentication failed"
- ❌ Email incorrecto o no existe
- ✅ Verifica que el email sea exactamente el mismo

### Error: "Connection refused"
- ❌ Configuración de servidor SMTP incorrecta
- ✅ Verifica MAIL_SERVER y MAIL_PORT

### No recibo el correo
- ❌ Email no está registrado en el sistema
- ❌ Correo va a spam
- ✅ Verifica que el usuario esté registrado y confirmado

## 📧 Configuración Recomendada (Gmail)

```python
class Config:
    MONGO_URI = "mongodb://localhost:27017/salones_db"
    SECRET_KEY = "clave_secreta_super_segura"
    
    # Configuración de correo electrónico - GMAIL
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = 'tu_email_real@gmail.com'        # ← CAMBIAR
    MAIL_PASSWORD = 'abcd efgh ijkl mnop'            # ← CONTRASEÑA DE APP
    MAIL_DEFAULT_SENDER = 'tu_email_real@gmail.com'  # ← CAMBIAR
```

## 🔐 Seguridad

- ✅ **Nunca** compartas tu contraseña de aplicación
- ✅ **Nunca** subas `config.py` a repositorios públicos
- ✅ Usa variables de entorno en producción
- ✅ Revoca contraseñas de aplicación si no las usas

## 📞 Soporte

Si sigues teniendo problemas:

1. **Verifica** que la verificación en 2 pasos esté activa
2. **Regenera** una nueva contraseña de aplicación
3. **Prueba** con otro proveedor de email (Outlook)
4. **Revisa** los logs del backend para errores específicos

---

**Próximo paso**: Actualiza las credenciales en `backend/config.py` y prueba nuevamente la recuperación de contraseña.