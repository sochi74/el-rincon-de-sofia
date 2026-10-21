# CHANGELOG.md

## 2026-10-21 · Hito 12: 🪙 Monedas mágicas
- Monedas mágicas: un contador de la casa (compartido por los dos) que se ve en el panel, debajo del reloj, como "🪙 N". La partida nueva empieza con 20.
- Monedas brillantes: cada 30 a 60 segundos de juego aparece una moneda dorada en el pasto de la ciudad, en un lugar al azar donde se puede caminar. Nunca sale en el río, el puente, la casa, la plaza, los caminos de piedra, la carpa, la fogata ni bajo los árboles. Como máximo hay 3 a la vez.
- Las monedas brillan, flotan un poquito y giran suavemente, con una estrellita que titila. De noche brillan un poco más.
- Cuando Sofía o real.fixer (seleccionado o no) pasa sobre una moneda, la recoge: desaparece con un destello, sale "+5 🪙" flotando hacia arriba y el contador suma 5.
- En Pausa no aparecen monedas nuevas.
- El guardado recuerda el contador y las monedas que hay en el suelo. "Reiniciar" vuelve a 20 y sin monedas en el suelo.
- Palabra nueva al pasar el mouse sobre una moneda: Moneda · coin (KÓIN).
- Nuevo archivo js/coins.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta), y si pasan sobre una moneda la recogen. Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él. Con el mouse sobre el panel, la etiqueta muestra lo que hay debajo del panel. Las monedas todavía no se pueden gastar (eso llega en el Hito 13). real.fixer no va a buscar monedas solo; solo las recoge si pasa por encima.

## 2026-10-21 · Hito 11: 🔤 Palabras en las cosas
- Al pasar el mouse sobre un mueble, una habitación o un lugar, aparece cerca del cursor una etiqueta pequeña con su nombre en español (en negrita), en inglés (en cursiva) y cómo se pronuncia (entre paréntesis, más clarito). Por ejemplo: "Cama · bed (BED)".
- Palabras de la casa: Cocina · kitchen (KÍ-chen), Dormitorio · bedroom (BÉD-rum), Sala · living room (LÍ-ving rum), Refrigerador · fridge (FRICH), Cama · bed (BED), Televisión · TV (ti-VÍ), Sofá · couch (KÁUCH), Puerta · door (DOR).
- Palabras de la ciudad: Casa de Sofía · Sofía's house (so-FÍ-as JÁUS), Río · river (RÍ-ver), Puente · bridge (BRICH), Bosque · forest (FÓ-rest), Árbol · tree (TRÍI), Plaza · square (SKUÉR), Fuente · fountain (FÁUN-ten), Carpa · tent (TENT), Fogata · campfire (KÁMP-fáier), Luciérnaga · firefly (FÁIER-flai).
- La etiqueta va abajo a la derecha del cursor para no taparlo; cerca de los bordes se da vuelta para no salirse de la pantalla. Tiene fondo crema, así que se lee igual de día y de noche.
- Las luciérnagas se pueden "atrapar" con el mouse aunque se muevan. Si un personaje está bajo el mouse, no aparece etiqueta.
- En celular o tablet, al tocar una cosa la etiqueta aparece arriba del dedo durante 2 segundos.
- Tocar las cosas sigue haciendo lo mismo de antes, y los carteles que ya existían no cambiaron.
- Nuevo archivo js/words.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él. Con el mouse sobre el panel, la etiqueta muestra lo que hay debajo del panel.

## 2026-10-21 · Hito 10: 🌬️ Mundo vivo
- Parpadeo: cada personaje cierra los ojos un instante cada 3 a 6 segundos, en momentos distintos uno del otro.
- Respiración: cuando un personaje está quieto, su cuerpo sube y baja muy suavemente.
- Direcciones: cada personaje se ve de frente, de espalda o de costado (izquierda y derecha) según hacia dónde camina. Al detenerse mantiene la última dirección. Mientras charlan quietos, se miran de costado.
  - real.fixer de espalda: gorra por detrás con su abertura y correa, pelo oscuro, camisa negra y la correa de la riñonera (sin cara ni barba). De costado: visera hacia adelante, barba de perfil, riñonera de lado y reloj dorado.
  - Sofía de espalda: su pelo castaño largo cubre la cabeza y la espalda. De costado: su perfil, con el pelo cayendo por la espalda y un mechón sobre el hombro.
- Árboles: los árboles del bosque se mecen suavemente con el viento, cada uno a su ritmo. En Pausa se quedan quietos.
- Todo funciona en la casa y en la ciudad, de día y de noche. En Pausa siguen parpadeando y respirando.
- ⭐ Extra desbloqueado: Sofía lleva una pequeña corona de princesa dorada, su "Princess crown", visible desde todos los lados.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo. Al recargar la página, los personajes vuelven a mirar de frente. Al usar un mueble no se giran hacia él.

## 2026-10-21 · Hito 9: 🕰️ Reloj, día y noche
- Reloj del juego: un día completo dura unos 8 minutos reales. La partida nueva empieza el Día 1 a las 08:00.
- El panel muestra arriba "☀️ Día N · HH:MM" de día y "🌙 Día N · HH:MM" de noche.
- De 07:00 a 19:00 es de día. De 19:00 a 20:00 el mundo se oscurece poco a poco con un tono azul-violeta, y de 06:00 a 07:00 se aclara poco a poco. Vale para la casa y para la ciudad. Los personajes siempre se ven bien.
- De noche brillan:
  - La fogata, con un halo de luz cálida que titila.
  - Las ventanas de la Casa de Sofía en el mapa, con luz amarilla.
  - Las luciérnagas, más grandes y brillantes.
  - Dentro de la casa, un brillo suave alrededor de la Televisión.
- De noche (de 19:00 a 07:00), la Energía de los dos baja ×1.3, además de los rasgos.
- Pausa también congela el reloj.
- El guardado recuerda el día y la hora. "Reiniciar" vuelve al Día 1, 08:00.
- Nuevo archivo js/time.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa. De noche los carteles se ven un poco más oscuros. La tele brilla de noche aunque nadie la esté viendo.

## 2026-10-21 · Hito 8: ⛺ La carpa de real.fixer
- En la ciudad, del otro lado del puente, junto al río, real.fixer tiene su hogar, dibujado con código:
  - Una carpa terracota vista desde arriba, con palo central, cuerdas, estacas y la entrada abierta adelante.
  - Una fogata con piedras, troncos cruzados, llamas que se mueven suavemente, chispitas y una luz cálida.
  - 7 luciérnagas que flotan y titilan alrededor de la carpa y la fogata.
  - Un cartel: "Carpa de real.fixer".
- Dos cosas nuevas para usar, como los muebles (brillan al pasar el mouse):
  - Carpa: "Durmiendo en la carpa 💤", Energía +50 en 6 segundos. Solo la usa real.fixer; si Sofía la toca, dice "Es la carpa de real.fixer".
  - Fogata: "Junto a la fogata 🔥", Diversión +30 en 4 segundos. La usan los dos.
- Al empezar una partida nueva (o con "Reiniciar"), real.fixer aparece junto a su carpa. Sofía sigue empezando en la Sala.
- Libre albedrío de real.fixer: Energía → su Carpa, Diversión → la Fogata, Hambre → el Refrigerador de la casa de Sofía (sale o entra por la puerta si hace falta). Para Sofía no cambia nada.
- Visitas: cuando real.fixer no está seleccionado, está quieto y todas sus necesidades están en 50 o más, cada 1 a 2 minutos camina a la casa de Sofía, entra, se queda unos 30 segundos en la Sala y vuelve a su carpa. Si está en la casa sin nada que hacer, también se queda un rato y luego vuelve.
- El guardado sigue funcionando: recuerda si real.fixer está en la ciudad o en la casa.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles, la fuente, la carpa y la fogata. Mientras duermen (también en la carpa) o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas. Si recargas en medio de una visita, real.fixer se queda un rato en la casa y después vuelve a su carpa.

## 2026-10-21 · Hito 7: 🚪 La puerta mágica
- Cada personaje está en un lugar: la casa o la ciudad. La pantalla muestra el lugar del personaje seleccionado.
- Con un personaje seleccionado, tocar la puerta (el tapete terracota abajo a la izquierda de la Sala) lo hace caminar hasta ella y salir: aparece en la ciudad, frente a la puerta de su casa.
- Mapa de la ciudad visto desde arriba, dibujado con código:
  - Casa de Sofía por fuera, con techo de tejas, chimenea, ventanas y puerta.
  - Un río que cruza el mapa, con ondas que se mueven, y un puente de madera.
  - Un bosque de árboles redondeados arriba a la izquierda.
  - Una plaza de piedra con una fuente que salpica.
  - Carteles con los nombres: Casa de Sofía, Río, Puente, Bosque, Plaza.
  - Espacio libre junto al río, del otro lado del puente, para la futura carpa de real.fixer.
- En la ciudad, tocar el suelo hace caminar al seleccionado. Nunca pisa el agua: para cruzar usa el puente. Si tocas el agua, va a la orilla más cercana. No sale del mapa.
- Tocar la Casa de Sofía (brilla al pasar el mouse) hace que el personaje camine a su puerta y entre: vuelve a la Sala, junto a la puerta.
- Botones "Sofía" y "real.fixer" en el panel para elegir a cada uno aunque esté en otro lugar; la vista cambia a su lugar. El botón del seleccionado se ve terracota.
- Las necesidades bajan en los dos lugares. Charlar, contar chistes y chocar los cinco solo funcionan si los dos están en el mismo lugar.
- Libre albedrío: si el que no está seleccionado está en la ciudad y tiene una necesidad por debajo de 50, primero vuelve a la casa.
- El guardado recuerda en qué lugar está cada uno y su posición ahí.
- Colores nuevos de la ciudad: verdes de pasto, azul de agua y gris de piedra.
- Nuevo archivo js/city.js.
- Problemas conocidos: Los personajes atraviesan los muebles, y en la ciudad también la casa, los árboles y la fuente. Mientras duermen o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar (y pueden salir o entrar por la puerta). Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar. El panel puede tapar un poco la parte de arriba del mapa en pantallas chicas.

## 2026-10-20 · Plan de la Parte B
- Se escribió el roadmap del juego completo en paquetes

## 2026-10-20 · Hito 6: ✨ Vida propia
- Libre albedrío: el personaje que no está seleccionado, cuando está quieto y tiene una necesidad por debajo de 50, va solo a resolver la más baja:
  - Hambre → Refrigerador. Energía → Cama. Diversión → Sofá o Televisión. Social → "Charlar" con el otro.
  - Usa las mismas acciones, multiplicadores y esperas de siempre.
  - Si el mueble está ocupado o hay que esperar para charlar, espera unos segundos y vuelve a intentar.
  - Si nadie está seleccionado, los dos actúan solos. Con Pausa, nadie decide nada.
- Ánimo: una estrella flota sobre la cabeza de cada uno, según el promedio de sus cuatro necesidades: verde por encima de 60, amarilla de 30 a 60, roja por debajo de 30. Las burbujas de pensamiento, acción y diálogo se dibujan encima de la estrella.
- Guardado: cada 10 segundos y al cerrar o recargar la página se guardan las necesidades, la posición de cada personaje y la amistad. Al abrir el juego, se carga la partida guardada.
- Botón "🔄 Reiniciar" en el panel: borra lo guardado y vuelve a empezar.
- Si el navegador no deja guardar, el juego funciona igual, sin guardar.
- Nuevo archivo js/save.js.
- ⭐ Extra desbloqueado: un póster con marco de madera en la pared de la Sala que dice "That's what she said!".
- Arreglo: la estrella de ánimo ahora se ve rellena de color
- Problemas conocidos: Los personajes atraviesan los muebles. Mientras duermen o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar. Si real.fixer quiere charlar mientras Sofía usa un mueble, ella lo deja para charlar.

## 2026-10-20 · Hito 5: 💬 ¡A socializar!
- Con un personaje seleccionado, tocar al otro abre un menú: "Charlar", "Contar un chiste" y "Chocar los cinco". Tocar al otro dos veces lo selecciona.
- Al elegir, los dos caminan uno hacia el otro, se miran y alternan de 2 a 4 burbujas con sus frases de js/characters.js (saludo, charlar, chiste o chocar los cinco).
- real.fixer habla en inglés con el subtítulo en español debajo, más pequeño. Sofía habla en español.
- Si alguno estaba usando un mueble, lo deja para socializar.
- Efectos para los dos:
  - Charlar: Social +15, Amistad +5.
  - Contar un chiste: Social +10, Amistad +8.
  - Chocar los cinco: Social +8, Amistad +4, y aparece un 🙌 entre ellos.
- Rasgos: Fiestero/a da Social ×1.5, Tímido/a ×0.7; Conversador/a: Charlar da Social ×1.5; Bromista: sus chistes dan Amistad ×1.5. Hoy nadie es Fiestero, Tímido ni Bromista.
- Actividad favorita: ×1.25 y un ❤️. A real.fixer le encanta charlar.
- Social nunca pasa de 100. Amistad va de -100 a 100 y empieza en 0.
- El panel muestra "Amistad con <el otro>: <valor>".
- Hay que esperar unos segundos entre interacciones; si se intenta antes, sale la burbuja "Un momento…".
- El botón Pausa también congela las conversaciones.
- Problemas conocidos: Los personajes atraviesan los muebles. Mientras duermen o ven tele se quedan de pie. Con Pausa, los personajes todavía terminan de caminar.

## 2026-10-20 · Hito 4: 🛋️ Cosas de la casa
- Los muebles se iluminan con un brillo verde salvia cuando el mouse pasa por encima.
- Con un personaje seleccionado, tocar un mueble lo hace caminar hasta él y usarlo, con una burbuja encima:
  - Refrigerador: "Comiendo 🍳", Hambre +35 en 4 segundos.
  - Cama: "Durmiendo 💤", Energía +50 en 6 segundos.
  - Sofá o Televisión: "Viendo tele 📺", Diversión +35 en 4 segundos.
- Las necesidades nunca pasan de 100.
- Los rasgos pueden cambiar lo que da una actividad (Gamer: la tele da Diversión ×1.5). Hoy ningún personaje es Gamer.
- Actividad favorita: da ×1.25 y un ❤️ sobre la cabeza. A Sofía le encanta ver tele.
- Un solo personaje por mueble; si está ocupado, aparece la burbuja "Ocupado".
- Tocar el piso u otro mueble cancela la acción. Tocar a un personaje que está usando un mueble lo detiene.
- El botón Pausa también congela las acciones.
- Problemas conocidos: Los personajes atraviesan los muebles. Mientras duermen o ven tele se quedan de pie.

## 2026-10-20 · Hito 3: 📊 Necesidades
- Sofía y real.fixer tienen cuatro necesidades: 🍔 Hambre, 😴 Energía, 🎮 Diversión y 💬 Social, de 0 a 100.
- Empiezan cerca de 80, con una pequeña variación.
- Bajan con el tiempo, un poco distinto cada una (más o menos 1 punto cada 4 segundos).
- Los rasgos cambian la velocidad: Sofía (Dormilona, Glotona, Creativa) pierde Energía, Hambre y Diversión ×1.5; real.fixer (Tranquilo, Creativo) pierde todo ×0.85 y Diversión además ×1.5.
- El panel muestra las cuatro barras del personaje seleccionado: verde, amarilla o roja.
- Cuando una necesidad está en rojo, flota una burbuja de pensamiento con su emoji.
- Botón "Pausa / Continuar" para congelar el tiempo de las necesidades.
- Problemas conocidos: Los personajes atraviesan los muebles. Las necesidades todavía no se pueden subir (eso llega en el Hito 4).

## 2026-10-20 · Hito 2: 📦 Mudanza
- Sofía y real.fixer se mudan a la casa y empiezan en lugares distintos de la Sala.
- Dibujados como figuritas: real.fixer con gorra azul marino, barba con canas, camisa negra, riñonera y reloj dorado; Sofía con pelo castaño largo, blusa rosa y collar dorado. Cada uno con su nombre debajo.
- Tocar a un personaje lo selecciona: círculo brillante bajo sus pies y su nombre en un panel.
- Tocar el piso hace caminar al seleccionado en línea recta, con un pequeño rebote, sin salir de la casa. Para ir a otra habitación pasan por la puerta.
- Datos de los dos personajes en js/characters.js, iguales a CHARACTERS.md.
- ⭐ Extra desbloqueado: Sofía tiene una frase nueva de Sueño: "Time for a nap!" (¡Hora de la siesta!).
- Problemas conocidos: Los personajes atraviesan los muebles.

## 2026-10-20 · Hito 1: 🧱 Primera piedra
- Pantalla de inicio con "El Rincón de Sofía" y botón "Jugar".
- Casa vista desde arriba con Cocina, Dormitorio y Sala, y muebles decorativos: Refrigerador, Cama, Televisión y Sofá.
- Publicado en GitHub Pages.
- Problemas conocidos: ninguno por ahora.
