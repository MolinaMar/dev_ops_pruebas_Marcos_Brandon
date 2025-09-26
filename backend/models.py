def user_to_dict(user):
    return {
        "_id": str(user["_id"]),
        "nombre": user["nombre"],
        "correo": user["correo"],
        "password": user["password"],
        "rol": user["rol"]
    }

def salon_to_dict(salon):
    salon_dict = {
        "_id": str(salon["_id"]),
        "nombre": salon["nombre"],
        "ubicacion": salon["ubicacion"],
        "estado": salon["estado"]
    }
    
    # Añadir capacidad solo si existe en el documento
    if "capacidad" in salon:
        salon_dict["capacidad"] = salon["capacidad"]
    else:
        salon_dict["capacidad"] = "No especificada"
        
    # Añadir descripción si existe
    if "descripcion" in salon:
        salon_dict["descripcion"] = salon["descripcion"]
    
    # Añadir imágenes si existen
    if "imagenes" in salon and salon["imagenes"]:
        salon_dict["imagenes"] = salon["imagenes"]
    elif "imagen" in salon and salon["imagen"]:  # Compatibilidad con versión anterior
        salon_dict["imagenes"] = [salon["imagen"]]
        
    return salon_dict

def reserva_to_dict(reserva):
    reserva_dict = {
        "_id": str(reserva["_id"]),
        "salon_id": reserva["salon_id"],
        "fecha": reserva["fecha"],
        "hora": reserva["hora"]
    }
    
    # Añadir correo de usuario si existe
    if "correo_usuario" in reserva:
        reserva_dict["correo_usuario"] = reserva["correo_usuario"]
    elif "usuario_id" in reserva:  # Para compatibilidad con versiones anteriores
        reserva_dict["usuario_id"] = reserva["usuario_id"]
    
    # Añadir nombre del salón si existe
    if "salon_nombre" in reserva:
        reserva_dict["salon_nombre"] = reserva["salon_nombre"]
    
    return reserva_dict

