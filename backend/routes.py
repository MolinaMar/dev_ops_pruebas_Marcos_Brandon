from flask import Blueprint, request, jsonify, current_app
from db import mongo
from bson.objectid import ObjectId
from models import user_to_dict, salon_to_dict, reserva_to_dict
from email_service import generate_confirmation_token, send_confirmation_email, verify_confirmation_token, generate_password_reset_token, send_password_reset_email
import os
from werkzeug.utils import secure_filename
import base64
from datetime import datetime, timedelta

routes_blueprint = Blueprint("routes", __name__)

# VALIDACIÓN DE CONTRASEÑA
import re

def validar_password(pw):
    if len(pw) < 8:
        return False
    if not re.search(r"[A-Z]", pw):
        return False
    if not re.search(r"[a-z]", pw):
        return False
    if not re.search(r"[^a-zA-Z0-9]", pw):
        return False
    if re.search(r"(012|123|234|345|456|567|678|789)", pw):
        return False
    if re.search(r"(ab|bc|cd|de|ef|fg|gh|hi|ij|jk|kl|lm|mn|no|op|pq|qr|rs|st|tu|uv|vw|wx|xy|yz)", pw, re.IGNORECASE):
        return False
    return True

# REGISTRO
@routes_blueprint.route("/register", methods=["POST"])
def register():
    from app import mail  # Importar mail desde app
    
    data = request.json
    nombre = data["nombre"]
    correo = data["correo"]
    password = data["password"]
    rol = data.get("rol", "usuario")

    if not validar_password(password):
        return jsonify({"error": "Contraseña no cumple con los requisitos"}), 400

    if mongo.db.usuarios.find_one({"correo": correo}):
        return jsonify({"error": "Correo ya registrado"}), 409

    # Generar token de confirmación
    confirmation_token = generate_confirmation_token(correo)
    
    # Crear usuario inactivo hasta que confirme el email
    mongo.db.usuarios.insert_one({
        "nombre": nombre,
        "correo": correo,
        "password": password,
        "rol": rol,
        "activo": False,
        "email_confirmado": False,
        "token_confirmacion": confirmation_token,
        "fecha_token": datetime.now(),
        "fecha_registro": datetime.now()
    })
    
    # Enviar correo de confirmación
    email_sent = send_confirmation_email(mail, correo, nombre, confirmation_token)
    
    if email_sent:
        return jsonify({
            "mensaje": "Usuario registrado correctamente. Por favor, revisa tu correo electrónico para confirmar tu cuenta.",
            "rol": rol,
            "requiere_confirmacion": True
        }), 201
    else:
        # Si falla el envío del correo, eliminar el usuario creado
        mongo.db.usuarios.delete_one({"correo": correo})
        return jsonify({"error": "Error al enviar correo de confirmación. Intenta nuevamente."}), 500

# CONFIRMACIÓN DE EMAIL
@routes_blueprint.route("/confirmar-email", methods=["POST"])
def confirmar_email():
    data = request.json
    token = data.get("token")
    correo = data.get("email")
    
    if not token or not correo:
        return jsonify({"error": "Token y correo son requeridos"}), 400
    
    # Buscar usuario con el token
    user = mongo.db.usuarios.find_one({
        "correo": correo,
        "token_confirmacion": token,
        "email_confirmado": False
    })
    
    if not user:
        return jsonify({"error": "Token inválido o usuario ya confirmado"}), 400
    
    # Verificar que el token no haya expirado (24 horas)
    fecha_token = user.get("fecha_token")
    if fecha_token and datetime.now() - fecha_token > timedelta(hours=24):
        return jsonify({"error": "El token ha expirado. Solicita un nuevo correo de confirmación."}), 400
    
    # Activar usuario
    mongo.db.usuarios.update_one(
        {"_id": ObjectId(user["_id"])},
        {
            "$set": {
                "email_confirmado": True,
                "activo": True
            },
            "$unset": {
                "token_confirmacion": "",
                "fecha_token": ""
            }
        }
    )
    
    return jsonify({
        "mensaje": "Email confirmado correctamente. Tu cuenta ha sido activada.",
        "usuario_activado": True
    }), 200

# LOGIN
@routes_blueprint.route("/login", methods=["POST"])
def login():
    data = request.json
    correo = data["correo"]
    password = data["password"]

    user = mongo.db.usuarios.find_one({"correo": correo, "password": password})

    if not user:
        return jsonify({"error": "Credenciales incorrectas"}), 401
    
    # Verificar si el email está confirmado
    if not user.get("email_confirmado", False):
        return jsonify({
            "error": "Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.",
            "requiere_confirmacion": True
        }), 403

    # Bloque comentado temporalmente para pruebas (sesión única)
    # if user.get('activo', False):
    #     return jsonify({"error": "Este usuario ya ha iniciado sesión en otro dispositivo."}), 403

    mongo.db.usuarios.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"activo": True}})

    return jsonify({
        "mensaje": "Login exitoso",
        "rol": user["rol"],
        "correo": user["correo"],
        "usuario": user_to_dict(user)
    }), 200

# RECUPERACIÓN DE CONTRASEÑA
@routes_blueprint.route("/solicitar-recuperacion", methods=["POST"])
def solicitar_recuperacion():
    data = request.json
    correo = data.get("correo")
    
    if not correo:
        return jsonify({"error": "El correo es requerido"}), 400
    
    # Buscar usuario por correo
    user = mongo.db.usuarios.find_one({"correo": correo})
    
    if not user:
        # Por seguridad, no revelamos si el email existe o no
        return jsonify({
            "mensaje": "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación."
        }), 200
    
    # Generar token de recuperación
    token = generate_password_reset_token(correo)
    fecha_expiracion = datetime.now() + timedelta(hours=1)  # Expira en 1 hora
    
    # Guardar token en la base de datos
    mongo.db.usuarios.update_one(
        {"_id": ObjectId(user["_id"])},
        {
            "$set": {
                "token_recuperacion": token,
                "fecha_token_recuperacion": fecha_expiracion
            }
        }
    )
    
    # Enviar correo de recuperación
    email_enviado = send_password_reset_email(correo, user["nombre"], token)
    
    if email_enviado:
        return jsonify({
            "mensaje": "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación."
        }), 200
    else:
        return jsonify({"error": "Error al enviar correo de recuperación. Intenta nuevamente."}), 500

@routes_blueprint.route("/restablecer-password", methods=["POST"])
def restablecer_password():
    data = request.json
    token = data.get("token")
    correo = data.get("email")
    nueva_password = data.get("password")
    
    if not token or not correo or not nueva_password:
        return jsonify({"error": "Token, correo y nueva contraseña son requeridos"}), 400
    
    # Validar longitud de contraseña
    if len(nueva_password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400
    
    # Buscar usuario con el token
    user = mongo.db.usuarios.find_one({
        "correo": correo,
        "token_recuperacion": token
    })
    
    if not user:
        return jsonify({"error": "Token inválido o expirado"}), 400
    
    # Verificar que el token no haya expirado
    fecha_expiracion = user.get("fecha_token_recuperacion")
    if not fecha_expiracion or datetime.now() > fecha_expiracion:
        return jsonify({"error": "El token ha expirado. Solicita un nuevo enlace de recuperación."}), 400
    
    # Actualizar contraseña y eliminar token
    mongo.db.usuarios.update_one(
        {"_id": ObjectId(user["_id"])},
        {
            "$set": {
                "password": nueva_password
            },
            "$unset": {
                "token_recuperacion": "",
                "fecha_token_recuperacion": ""
            }
        }
    )
    
    return jsonify({
        "mensaje": "Contraseña restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña."
    }), 200

# LOGOUT
@routes_blueprint.route("/logout", methods=["POST"])
def logout():
    data = request.json
    correo = data.get("correo")

    user = mongo.db.usuarios.find_one({"correo": correo})
    if user:
        mongo.db.usuarios.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"activo": False}})
        return jsonify({"mensaje": "Sesión cerrada correctamente"})

    return jsonify({"error": "Usuario no encontrado"}), 404

# OBTENER TODOS LOS USUARIOS (SOLO ADMIN)
@routes_blueprint.route("/admin/usuarios", methods=["GET"])
def get_usuarios():
    usuarios = mongo.db.usuarios.find()
    return jsonify([user_to_dict(u) for u in usuarios])

# MODIFICAR USUARIO
@routes_blueprint.route("/admin/usuarios/<id>", methods=["PUT"])
def update_usuario(id):
    data = request.json
    mongo.db.usuarios.update_one({"_id": ObjectId(id)}, {"$set": data})
    return jsonify({"mensaje": "Usuario actualizado"})

# BORRAR USUARIO
@routes_blueprint.route("/admin/usuarios/<id>", methods=["DELETE"])
def delete_usuario(id):
    mongo.db.usuarios.delete_one({"_id": ObjectId(id)})
    return jsonify({"mensaje": "Usuario eliminado"})

# OBTENER SALONES
@routes_blueprint.route("/salones", methods=["GET"])
def get_salones():
    salones = mongo.db.salones.find()
    return jsonify([salon_to_dict(s) for s in salones])

# SUBIR IMAGEN
@routes_blueprint.route("/upload/imagen", methods=["POST"])
def upload_imagen():
    if 'imagen' not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400
    
    file = request.files['imagen']
    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400
    
    # Leer la imagen como base64
    imagen_data = base64.b64encode(file.read()).decode('utf-8')
    return jsonify({"imagen": imagen_data})

# CREAR SALÓN (ADMIN)
@routes_blueprint.route("/admin/salones", methods=["POST"])
def create_salon():
    data = request.json
    mongo.db.salones.insert_one(data)
    return jsonify({"mensaje": "Salón creado"})

# BORRAR SALÓN
@routes_blueprint.route("/admin/salones/<id>", methods=["DELETE"])
def delete_salon(id):
    mongo.db.salones.delete_one({"_id": ObjectId(id)})
    return jsonify({"mensaje": "Salón eliminado"})

# ACTUALIZAR ESTADO DE SALÓN
@routes_blueprint.route("/admin/salones/<id>/estado", methods=["PUT"])
def update_salon_estado(id):
    data = request.json
    mongo.db.salones.update_one({"_id": ObjectId(id)}, {"$set": {"estado": data["estado"]}})
    return jsonify({"mensaje": "Estado del salón actualizado"})

# RESERVAR SALÓN
@routes_blueprint.route("/reservar", methods=["POST"])
def reservar():
    data = request.json
    
    # Obtener información del salón para guardar su nombre
    salon = mongo.db.salones.find_one({"_id": ObjectId(data["salon_id"])})
    if not salon:
        return jsonify({"error": "Salón no encontrado"}), 404
    
    # Verificar si el salón ya está reservado
    if salon.get("estado") == "reservado":
        return jsonify({"error": "Este salón ya ha sido reservado"}), 400
    
    # Verificar si el usuario ya tiene 2 reservas
    reservas_usuario = mongo.db.reservas.find({"correo_usuario": data["correo_usuario"]})
    if len(list(reservas_usuario)) >= 2:
        return jsonify({"error": "Has alcanzado el límite de 2 reservas por usuario"}), 400
    
    # Crear el objeto de reserva
    reserva = {
        "correo_usuario": data["correo_usuario"],
        "salon_id": data["salon_id"],
        "salon_nombre": salon["nombre"],
        "fecha": data["fecha"],
        "hora": data["hora"]
    }
    
    # Guardar la reserva
    mongo.db.reservas.insert_one(reserva)
    
    # Actualizar el estado del salón a reservado
    mongo.db.salones.update_one({"_id": ObjectId(data["salon_id"])}, {"$set": {"estado": "reservado"}})
    
    return jsonify({"mensaje": "Reservación realizada"})

# VER TODAS LAS RESERVAS (ADMIN)
@routes_blueprint.route("/admin/reservas", methods=["GET"])
def get_reservas():
    reservas = mongo.db.reservas.find()
    return jsonify([reserva_to_dict(r) for r in reservas])

# VER RESERVAS DE UN USUARIO
@routes_blueprint.route("/reservas/<correo_usuario>", methods=["GET"])
def get_reservas_usuario(correo_usuario):
    reservas = mongo.db.reservas.find({"correo_usuario": correo_usuario})
    return jsonify([reserva_to_dict(r) for r in reservas])

# ELIMINAR RESERVA (ADMIN)
@routes_blueprint.route("/admin/reservas/<id>", methods=["DELETE"])
def delete_reserva_admin(id):
    # Obtener la reserva para conocer el salón
    reserva = mongo.db.reservas.find_one({"_id": ObjectId(id)})
    if reserva:
        # Actualizar el estado del salón a disponible
        mongo.db.salones.update_one({"_id": ObjectId(reserva["salon_id"])}, {"$set": {"estado": "disponible"}})
    
    # Eliminar la reserva
    mongo.db.reservas.delete_one({"_id": ObjectId(id)})
    return jsonify({"mensaje": "Reservación eliminada"})

# CANCELAR RESERVA (USUARIO)
@routes_blueprint.route("/reservas/<id>", methods=["DELETE"])
def cancelar_reserva(id):
    # Obtener la reserva para conocer el salón
    reserva = mongo.db.reservas.find_one({"_id": ObjectId(id)})
    if reserva:
        # Actualizar el estado del salón a disponible
        mongo.db.salones.update_one({"_id": ObjectId(reserva["salon_id"])}, {"$set": {"estado": "disponible"}})
    
    # Eliminar la reserva
    mongo.db.reservas.delete_one({"_id": ObjectId(id)})
    return jsonify({"mensaje": "Reservación cancelada"})
