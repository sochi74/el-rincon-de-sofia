# CLAUDE.md

## Qué es
El Rincón de Sofía: un juego de vida acogedor con nombre y arte propios. Una casa vista desde arriba donde vive Sofía, y su amigo real.fixer viene de visita.

## Reglas fijas (nunca cambiarlas)
- HTML, CSS y JavaScript puros con canvas 2D. Sin build, sin Node ni npm, sin frameworks, sin librerías, sin CDN, sin fuentes web (solo fuentes del sistema y emoji), sin imágenes: todo el arte se dibuja con código.
- Funciona igual con doble clic en index.html (file://) y en GitHub Pages: <script src> clásicos en orden fijo, sin módulos ES, sin fetch, todos los datos dentro de archivos .js.
- Nombres de archivo en minúsculas; referencias con las mismas mayúsculas exactas.
- Nunca usar "Sims", "The Sims", nombres o logos de EA, Simlish ni arte de EA.
- Exactamente dos personajes: Sofía y real.fixer. Una casa con Cocina, Dormitorio y Sala.
- Guardado (Hito 6): localStorage dentro de try/catch; el juego funciona aunque falle.
- Repo público; GitHub Pages desde main, carpeta raíz.

## Estructura
- index.html: página, pantalla de inicio y canvas
- style.css: estilos
- .nojekyll: GitHub Pages sin Jekyll
- js/config.js: colores, tamaños y constantes
- js/characters.js: datos de los personajes
- js/house.js: dibujo de la casa y los muebles
- js/sims.js: dibujo, selección y movimiento
- js/ui.js: panel
- js/main.js: arranque y bucle del juego
- js/needs.js: necesidades y cómo bajan
- js/objects.js: muebles que se pueden usar y sus acciones
- Más adelante: social.js
- Orden de scripts: config, characters, house, sims, needs, objects, social, ui, main
- Todo archivo nuevo se anota aquí.

## Convenciones
- Español: textos del juego, biblias, pull requests y la conversación con Sofía. Inglés: nombres en el código, nombres de archivo y mensajes de commit.
- Hito 1 va directo a main. Desde el Hito 2: una sesión = un hito = una rama hito-N-<slug>.
- Commits estilo conventional commits en inglés (feat, fix, docs).
- Pull request con secciones: Qué construimos, Cómo probarlo, Archivos que cambiaron, Biblias actualizadas, Problemas conocidos, Ideas para después.

## Forma de cada sesión
1. Leer las cinco biblias. 2. git checkout main y git pull. 3. Hacer un solo hito. 4. Probarlo con Sofía. 5. Actualizar las biblias. 6. Abrir el pull request. 7. Nunca hacer merge.

## Prohibido
- Cambiar las reglas fijas, agregar librerías, tocar archivos fuera del hito, hacer merge.
- CHARACTERS.md y js/characters.js cambian siempre juntos.

## Entorno de Sofía
Windows con terminal Linux (WSL). Para abrir el juego: explorer.exe index.html

## Paleta (estilo acogedor)
Crema #F5EBDD · Madera #B07A4F · Terracota #C8664A · Verde salvia #8FA88A · Café oscuro #4A3428
