from itsdangerous import URLSafeTimedSerializer
from flask_mail import Message
from flask import current_app
import secrets
import hashlib
from datetime import datetime, timedelta

def generate_confirmation_token(email):
    """Genera un token único para confirmación de email"""
    timestamp = str(datetime.now().timestamp())
    random_string = secrets.token_urlsafe(32)
    token_data = f"{email}:{timestamp}:{random_string}"
    token = hashlib.sha256(token_data.encode()).hexdigest()
    return token

def send_confirmation_email(mail, email, nombre, token):
    """Envía correo de confirmación al usuario"""
    try:
        # URL de confirmación (ajustar según tu dominio)
        confirmation_url = f"https://localhost:3000/confirmar-email?token={token}&email={email}"
        
        msg = Message(
            subject='Confirma tu cuenta en SalonesWeb',
            recipients=[email],
            html=f"""
            <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #333; text-align: center; margin-bottom: 30px;">¡Bienvenido a SalonesWeb!</h1>
                        
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">Hola <strong>{nombre}</strong>,</p>
                        
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">
                            Gracias por registrarte en SalonesWeb. Para completar tu registro y activar tu cuenta, 
                            por favor haz clic en el siguiente botón:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{confirmation_url}" 
                               style="background-color: #007bff; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; font-weight: bold; 
                                      display: inline-block;">Confirmar mi cuenta</a>
                        </div>
                        
                        <p style="color: #555; font-size: 14px; line-height: 1.6;">
                            Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
                        </p>
                        
                        <p style="color: #007bff; font-size: 14px; word-break: break-all; 
                                  background-color: #f1f1f1; padding: 10px; border-radius: 5px;">
                            {confirmation_url}
                        </p>
                        
                        <p style="color: #888; font-size: 12px; margin-top: 30px;">
                            Este enlace expirará en 24 horas por seguridad.
                        </p>
                        
                        <p style="color: #888; font-size: 12px;">
                            Si no te registraste en SalonesWeb, puedes ignorar este correo.
                        </p>
                    </div>
                </body>
            </html>
            """
        )
        
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error enviando correo: {str(e)}")
        return False

def verify_confirmation_token(token, expiration=86400):
    """Verificar token de confirmación"""
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, max_age=expiration)
        return email
    except:
        return None

# FUNCIONES PARA RECUPERACIÓN DE CONTRASEÑA

def generate_password_reset_token(email):
    """Generar token para recuperación de contraseña"""
    return secrets.token_urlsafe(32)

def send_password_reset_email(email, nombre, token):
    """Enviar correo de recuperación de contraseña"""
    try:
        from app import mail
        
        # URL de recuperación
        reset_url = f"https://localhost:3000/recuperar-password?token={token}&email={email}"
        
        # Crear mensaje
        msg = Message(
            subject="Recuperar Contraseña - Sistema de Salones",
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER']
        )
        
        # Cuerpo del mensaje
        msg.html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #007bff; text-align: center;">Recuperar Contraseña</h2>
                
                <p>Hola <strong>{nombre}</strong>,</p>
                
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en nuestro sistema de reserva de salones.</p>
                
                <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background-color: #007bff; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;
                              font-weight: bold;">Restablecer Contraseña</a>
                </div>
                
                <p><strong>Este enlace expirará en 1 hora por seguridad.</strong></p>
                
                <p>Si no solicitaste este cambio de contraseña, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                
                <p style="font-size: 12px; color: #666; text-align: center;">
                    Si tienes problemas con el enlace, copia y pega la siguiente URL en tu navegador:<br>
                    <span style="word-break: break-all;">{reset_url}</span>
                </p>
                
                <p style="text-align: center; margin-top: 20px;">
                    Saludos,<br>
                    <strong>Equipo de Sistema de Salones</strong>
                </p>
            </div>
        </body>
        </html>
        """
        
        # Enviar correo
        mail.send(msg)
        return True
        
    except Exception as e:
        print(f"Error al enviar email de recuperación: {e}")
        return False