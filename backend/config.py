class Config:
    # Configuración de la base de datos MongoDB
    MONGO_URI = 'mongodb://localhost:27017/salones_db'
    
    # Clave secreta para sesiones y tokens
    SECRET_KEY = 'clave_secreta_super_segura'
    
    # Configuración del servidor de correo electrónico
    # IMPORTANTE: Debes configurar estas credenciales con tu información real
    
    # Servidor SMTP (Gmail)
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    
    # Credenciales de Gmail - CAMBIAR por tus credenciales reales
    MAIL_USERNAME = 'jrgjhgnw@gmail.com'  # ← CAMBIAR por tu email real
    MAIL_PASSWORD = 'jrgjhgnw123'  # ← CAMBIAR por tu contraseña de aplicación de Gmail
    MAIL_DEFAULT_SENDER = 'jrgjhgnw@gmail.com'  # ← CAMBIAR por tu email real
    
    # INSTRUCCIONES PARA GMAIL:
    # 1. Ve a tu cuenta de Google: https://myaccount.google.com/
    # 2. Seguridad → Verificación en 2 pasos (activar si no está activo)
    # 3. Seguridad → Contraseñas de aplicaciones
    # 4. Genera una nueva contraseña de aplicación para "Correo"
    # 5. Usa esa contraseña de 16 caracteres en MAIL_PASSWORD
    
    # CONFIGURACIÓN ALTERNATIVA PARA OUTLOOK:
    # MAIL_SERVER = 'smtp-mail.outlook.com'
    # MAIL_PORT = 587
    # MAIL_USE_TLS = True
    # MAIL_USE_SSL = False
    # MAIL_USERNAME = 'tu_email@outlook.com'
    # MAIL_PASSWORD = 'tu_contraseña_normal'  # Outlook no requiere contraseña de aplicación
    # MAIL_DEFAULT_SENDER = 'tu_email@outlook.com'
