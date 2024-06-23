import getpass  # Para ocultar la entrada de la clave
import requests

BASE_URL = "http://localhost:8000/api"

def iniciar_sesion():
    correo = input("Ingrese su correo electrónico: ")
    clave = getpass.getpass("Ingrese su clave: ")


    if verificar_credenciales(correo, clave):
        print("Inicio de sesión exitoso")
        mostrar_menu(correo, clave)
    else:
        print("Correo o clave incorrecta. Terminando la ejecución.")
        exit()

def verificar_credenciales(correo, clave):
    data = {
        "correo": correo,
        "clave": clave
    }
    response = requests.post(f"{BASE_URL}/verificar", json=data)
    if response.status_code == 200:
        response_data = response.json()
        if response_data.get('estado') == 200:
            return True
        else:
            print(response_data.get('mensaje'))
            return False
    else:
        print("Error en la comunicación con el servidor.")
        return False

def mostrar_menu(correo, clave):
    while True:
        print("\nMenú de Opciones:")
        print("1. Ver información de una dirección de correo electrónico")
        print("2. Ver correos marcados como favoritos")
        print("3. Marcar correo como favorito")
        print("4. Terminar con la ejecución del cliente")

        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            ver_informacion_correo()
        elif opcion == "2":
            ver_correos_favoritos(correo, clave)
        elif opcion == "3":
            marcar_correo_favorito(correo, clave)
        elif opcion == "4":
            print("Terminando la ejecución del cliente.")
            break
        else:
            print("Opción no válida. Intente de nuevo.")

def ver_informacion_correo():
    correo = input("Ingrese la dirección de correo: ")
    response = requests.get(f"{BASE_URL}/informacion/{correo}")

    if response.status_code == 200:
        datos = response.json()
        print(f"Nombre: {datos['nombre']}")
        print(f"Correo: {datos['correo']}")
        print(f"Descripción: {datos['descripcion']}")
    else:
        print("Error al obtener la información del correo.")

def ver_correos_favoritos(correo, clave):
    headers = {
        "correo": correo,
        "clave": clave
    }
    response = requests.get(f"{BASE_URL}/favoritos/{correo}", headers=headers)
    if response.status_code == 200:
        datos = response.json()
        favoritos = datos.get('favoritos', [])
        print("Correos favoritos:")
        for favorito in favoritos:
            print(f"- {favorito}")
    else:
        print("Error al obtener los correos favoritos.")

def marcar_correo_favorito(correo, clave):
    id_correo_favorito = input("Ingrese el ID del correo a marcar como favorito: ")
    data = {
        "correo": correo,
        "clave": clave,
        "id_correo_favorito": int(id_correo_favorito)
    }

    response = requests.post(f"{BASE_URL}/marcarcorreo", json=data)

    if response.status_code == 200:
        print("Correo marcado como favorito correctamente.")
    else:
        print("Error al marcar el correo como favorito.")

if __name__ == "__main__":
    iniciar_sesion()