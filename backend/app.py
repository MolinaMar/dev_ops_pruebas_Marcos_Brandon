from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail
from db import mongo
from routes import routes_blueprint
from bson.objectid import ObjectId

app = Flask(__name__)
app.config.from_object("config.Config")
mongo.init_app(app)
mail = Mail(app)
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

# Rutas de login/logout aquí, ANTES de registrar el Blueprint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    correo = data.get('correo')
    password = data.get('password')

    user = mongo.db.usuarios.find_one({"correo": correo})
    if not user or user['password'] != password:
        return jsonify({"error": "Credenciales incorrectas"}), 401
    if user.get('activo', False):
        return jsonify({"error": "Este usuario ya ha iniciado sesión en otro dispositivo."}), 403

    mongo.db.usuarios.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"activo": True}})
    return jsonify({"rol": user['rol'], "correo": user['correo']}), 200

@app.route('/logout', methods=['POST'])
def logout():
    data = request.get_json(silent=True)
    correo = data.get('correo') if data else None
    if not correo:
        return jsonify({"error": "Correo faltante"}), 400

    user = mongo.db.usuarios.find_one({"correo": correo})
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    mongo.db.usuarios.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"activo": False}})
    return jsonify({"mensaje": "Sesión cerrada correctamente"}), 200

@app.route('/admin/usuarios/<id>', methods=['DELETE'])
def eliminar_usuario(id):
    try:
        correo_actual = request.headers.get('X-User-Email') or request.args.get('current_user')
        usuario = mongo.db.usuarios.find_one({"_id": ObjectId(id)})
        
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
            
        if usuario['correo'] == correo_actual:
            return jsonify({"error": "No se puede borrar al administrador actual"}), 403
            
        mongo.db.usuarios.delete_one({"_id": ObjectId(id)})
        return jsonify({"mensaje": "Usuario eliminado"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validaciones básicas
        if not all([data.get('nombre'), data.get('correo'), data.get('password')]):
            return jsonify({"error": "Faltan campos obligatorios"}), 400
            
        # Verificar si el correo ya existe
        if mongo.db.usuarios.find_one({"correo": data['correo']}):
            return jsonify({"error": "El correo ya está registrado"}), 400
            
        # Crear nuevo usuario
        nuevo_usuario = {
            "nombre": data['nombre'],
            "correo": data['correo'],
            "password": data['password'],  # En producción deberías hashear la contraseña
            "rol": data.get('rol', 'usuario'),  # Por defecto 'usuario' si no se especifica
            "activo": False
        }
        
        # Insertar en la base de datos
        result = mongo.db.usuarios.insert_one(nuevo_usuario)
        nuevo_usuario['_id'] = str(result.inserted_id)
        
        return jsonify({
            "mensaje": "Usuario creado exitosamente",
            "usuario": nuevo_usuario
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Error al crear usuario: {str(e)}"}), 500

# Ahora registramos el resto de rutas
app.register_blueprint(routes_blueprint)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)

