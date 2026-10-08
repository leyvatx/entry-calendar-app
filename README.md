# Agenda

Front-end web de la agenda hecho con React 19, Vite y Ant Design 6 (`frontend/`), sobre el API de Rails 7.2 con SQLite (`backend/`). Funciona en computadora, tableta y teléfono.

## Instalación

### 1. Requisitos

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) en Windows o macOS, o Docker Engine con el plugin Docker Compose en Linux

No hace falta instalar Ruby ni Node: todo corre dentro de los contenedores. Los puertos 5173 y 65432 deben estar libres.

### 2. Clonar el repositorio

```bash
git clone https://github.com/leyvatx/entry-calendar-app.git
cd entry-calendar-app
```

### 3. Levantar la app

Con Docker Desktop abierto:

```bash
docker compose up --build
```

El primer arranque tarda unos minutos: construye la imagen del API, instala las gemas y los paquetes de npm, crea la base de datos y carga citas de ejemplo con fechas relativas al día de hoy. Está lista cuando la terminal muestra estas dos líneas:

```text
api-1  | * Listening on http://0.0.0.0:3000
web-1  |   ➜  Local:   http://localhost:5173/
```

### 4. Abrir la app

- App: http://localhost:5173
- API: http://localhost:65432 (por ejemplo, http://localhost:65432/appointments)

La app llama al API a través del proxy de Vite (`/api`), por eso no hace falta configurar CORS ni cambiar direcciones.

### Detener y volver a arrancar

- Detener: `Ctrl+C` en la terminal, o `docker compose down` desde otra.
- Volver a arrancar: `docker compose up`. Los datos se conservan entre arranques.

## Pruebas

Con la app levantada, desde otra terminal:

```bash
docker compose exec api bin/rails test
docker compose exec api bundle exec rubocop
docker compose exec web npm test
docker compose exec web npm run lint
```

## Requisitos y dónde se cumplen

| # | Requisito | Dónde |
|---|---|---|
| 1 | Web-app responsiva | Revisada en teléfono (375 px), tableta (820 px) y computadora (1280 px). En teléfonos el menú se abre desde la izquierda y las tablas pasan a una sola columna |
| 2 | Próximas citas en orden cronológico | Página principal (`/`): tabla de la más próxima a la más lejana, con `GET /appointments?from=<inicio de hoy>` |
| 3 | Índice de tipos de cita | Tipos de cita (`/types`), con el número de citas de cada tipo |
| 4 | Crear, editar y eliminar tipos | "Nuevo tipo" en el topbar; Editar y Eliminar en el menú contextual de cada fila |
| 5 | Crear, editar y eliminar citas | "Nueva cita" en el topbar y "Nueva cita este día" en el calendario; Editar y Eliminar (con confirmación) en el menú contextual de cada fila |
| 6 | Calendario del mes | Calendario (`/calendar`): cada día marca sus citas con el color de su tipo y al elegirlo muestra sus citas |
| 7 | Validaciones en el back-end | Modelos `AppointmentType`, `Appointment` y `Person`, con mensajes en `config/locales/es.yml` y pruebas |
| 8 | Buscador | Lupa del topbar, campo "Título o notas": busca en título y notas sin distinguir acentos ni mayúsculas (`GET /appointments?q=`). Con "Incluir citas pasadas" busca en todo el historial |
| 9 | Color por tipo | `appointment_types.color`, un color de la paleta de Ant Design; etiqueta de color en las tablas y punto de color en el calendario |
| 10 | Ubicación | `appointments.location` |
| 11 | Personas de interés | Tabla `people` (cada cita tiene sus personas); se capturan en el modal de cita |

Validaciones del back-end:

- Tipo de cita: nombre obligatorio y único sin distinguir acentos ni mayúsculas; color de la paleta. No se puede eliminar un tipo que tiene citas.
- Cita: título, tipo y fecha de inicio obligatorios; la fecha de fin no puede ser anterior a la de inicio.
- Persona: nombre obligatorio.

## Manual de uso

- **Navegar:** el sidebar se contrae y se expande con el botón junto a la marca de Agenda, y recuerda cómo lo dejaste. "Buscar módulo…" filtra las opciones del menú y Enter abre la primera. En teléfonos, el botón de menú del topbar abre el sidebar.
- **Crear:** "Nueva cita" o "Nuevo tipo" en el topbar (en teléfonos, el botón "+").
- **Ver detalles, editar o eliminar:** en computadora, clic derecho sobre la fila; en pantallas táctiles, desliza la fila de izquierda a derecha. Se abre un menú con Ver detalles, Editar y Eliminar. Un clic o un toque normal no hace nada.
- **Filtrar y buscar:** la lupa del topbar o la tecla `/` abre los filtros de la pantalla actual:
  - Próximas citas: Incluir citas pasadas, Título o notas, Tipo, Desde y Hasta.
  - Calendario: Título o notas y Tipo.
  - Tipos de cita: Nombre y Color.

  Los filtros aplicados se muestran como etiquetas: la × quita uno y "Limpiar filtros" los quita todos. Al recargar la página se limpian.
- **Calendario:** cambia de mes con los selectores de arriba o eligiendo un día del mes anterior o siguiente. Al elegir un día se abre un modal con sus citas y el botón "Nueva cita este día", que propone las 09:00 de ese día.
- **Modo oscuro:** interruptor al pie del sidebar; la elección se recuerda.
- **Sin recargar:** lo que guardas o eliminas se ve al instante, también en otras pestañas abiertas. Los cambios hechos desde otra computadora aparecen al volver a la pestaña o en 30 segundos como máximo.

## Decisiones

- **Rangos con `from` y `to`:** el API devuelve las citas que se traslapan con el rango. El navegador calcula el rango con la hora local, así una cita del 31 a las 23:30 no se pasa al mes siguiente. El mismo endpoint sirve para próximas citas, el calendario y los filtros.
- **Texto normalizado:** la búsqueda y el nombre único de los tipos comparan contra columnas guardadas sin acentos ni mayúsculas.
- **`description` pasó a llamarse `title`:** el enunciado pide título. El commit está marcado como cambio incompatible.
- **Colores de la paleta de Ant Design:** el texto de las etiquetas siempre se lee bien, también en modo oscuro.
- **Próximas citas en una tabla cronológica:** se lee de arriba abajo; las citas en curso aparecen en el día de hoy con la etiqueta "En curso".
- **Modales:** crear, editar y ver detalles abren un modal sobre la pantalla actual; al cerrarlo sigues donde estabas.
- **Menú contextual:** las acciones de cada fila están en el menú contextual (clic derecho o deslizar), sin botones repetidos en cada fila.
- **Filtros por pantalla:** cada pantalla tiene los suyos en la lupa del topbar y se limpian al recargar.
- **Zona horaria del API:** `America/Tijuana`.

## Limitaciones conocidas

- Rails 7.2 ya no recibe parches de seguridad (Brakeman lo advierte); actualizar a 8.x sería un cambio aparte.
- No hay autenticación.
- El API no pagina: devuelve todas las citas del rango y la tabla pagina en el navegador (20 por página).
- La búsqueda recorre la tabla (`LIKE '%…%'`), suficiente para el volumen de una agenda.
- La semana del calendario empieza en lunes.

---

# Enunciado original

## # Bienvenido!

Este es un repositorio para evaluar candidatos para el equipo de desarrollo de Grupo Petsa.

Este repositorio tiene el back-end de una agenda o calendario, hecho en Ruby on Rails, con una base de datos sencilla en SQLite.

La idea es que desarrolles una Web-App que sirva como el front-end y la interfaz de usuario de la aplicación en cuestión.

### Requerimientos para correr

Te recomendamos *mucho* que utilices alguna distribución de Linux para arrancar, pero eres libre de utilizar lo que gustes.

### Cómo arrancar el servidor

Para correr esta aplicación de la forma tradicional, debes tener instalado previamente
  - Ruby, versión 3.3.12 (te recomendamos utilizar [rvm](https://rvm.io) o [rbenv](https://devhints.io/rbenv))
  - NodeJS
  - Yarn
  - Git

Posteriormente, podrás iniciar el arranque haciendo lo siguiente:

- Clona el repositorio en tu computadora
- Utiliza `bundle` para instalar las gemas requeridas
- Configura la base de datos y webpacker por medio del comando `rails`
- Arranca el servidor con `rails server`

Si así lo deseas, puedes utilizar Docker y Docker Compose en lugar de lo anterior para arrancar la aplicación. Los archivos de configuración estan completos, cuestión de que los revises para que puedas utilizarlos para correr la aplicación.

### Las funciones que se ocupan arreglar

El back-end está listo para trabajar con las siguientes tablas en su base de datos

- Appointment: Citas
  - Indica las citas a guardar en la agenda
  - Permite guardar titulo (`string`), notas (`text`), fecha de inicio (`datetime`), fecha de fin (`datetime`), y tipo de cita (`foreign key` a tabla `appointment_types`).
- `AppointmentType`: Tipo de cita
  - Para permitir una agrupación entre citas
  - Columnas: `name: :string`.

Con este back-end sencillo, te solicitamos que completes (en la medida de lo posible) los siguientes puntos:

- Hacer una aplicación Web que permita interactuar con el API / back-end hecho en Rails. Puede hacerse en cualquier tipo de framework, lenguaje o esquema, siempre y cuando sea un framework de Web Development y que la aplicación sea responsiva para su uso en computadoras, tablets o móviles.
- Como página principal, mostrar una lista de las citas por ocurrir (de hoy en adelante), en orden cronológico.
- Un índice para todos los tipos de cita disponibles
- Una interfaz de captura que permita crear, editar o eliminar tipos de cita.
- Una interfaz de captura que permita crear, editar o eliminar citas, capturando los datos y el tipo de cita de cada una.
- Una vista tipo "Calendario del mes", que permita mostrar un mes en particular, indicando los días que tienen eventos guardados
- Agregar validaciones al back-end, para forzar a que:
  - todos los tipos de cita tengan un nombre.
  - todas las citas tengan un título y un tipo de cita definido.
- Un buscador, que permita encontrar citas por medio del contenido de su nombre o las notas
- Permitir guardar un color predeterminado para cada tipo de cita, y en las vistas de citas (tanto en lista como en calendario), mostrar dentro del UX el color capturado por el usuario
- Agregar un campo en `appointments` para permitir guardar ubicación, como `string`.
- Permitir agregar personas de interes en cada `appointment`, para enlistar qué personas están involucradas por cita

### Comentarios

- Lo ideal es que resuelvas *todos* los puntos, pero tampoco es una obligación. Aunque no hayas terminado todos los puntos, igual enviannos tu respuesta para evaluar tu progreso.
- Cuando hayas terminado, crea un repositorio en el sitio de tu preferencia (GitHub, GitLab, BitBucket, etc) y haznos llegar la liga de acceso para su revisión. Ten en cuenta que evaluaremos la forma y tipos de commits que hagas para el desarrollo de la aplicación.
- No esperamos que sepas todo de memoria tampoco, eres libre de guiarte de la forma que tu consideres para poder completar el ejercicio.

### Siguientes pasos

- En caso de que tus resultados sean los esperados, procederemos a una segunda entrevista en nuestras oficinas corporativas.
- Dicha entrevista será **presencial**, y la usaremos para conocerte y evaluar frente a frente las decisiones que hayas tomado al diseñar la interfaz de usuario.
- Como parte de la entrevista, te pediremos agregar o modificar algunos puntos de tu desarrollo, emulando cómo los usuarios te darán retroalimentación de tus proyectos.
- Si tienes alguna otra duda no dudes en comunicarte con nosotros.
