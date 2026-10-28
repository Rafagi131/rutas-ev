# Ruta EV v2 · Laboratorio REVE

La v1 sigue intacta en https://rafagi131.github.io/rutas-ev/. La rama codex/v1-estable conserva su referencia. Esta v2 se desarrolla en codex/v2-reve, sin fusionarla en main ni modificar la configuración de Pages.

## Arranque local

Requiere Node.js 22.9 o superior (verificado con Node 24). No necesita instalar dependencias.

Desde esta carpeta:

```
npm test
npm start
```

Abrir http://127.0.0.1:8877 y desplegar «REVE · En pruebas». «Comprobar servicio REVE» comprueba el servidor sin consumir consultas a REVE. Inicialmente mostrará que falta configurar la clave. La v2 tiene ajustes e historial independientes con prefijo `rutaev:v2:`.

Para activar consultas reales, copiar `.env.example` como `.env` y completar `REVE_API_KEY` solo en el editor local. Reiniciar el servidor. Nunca enviar la clave por chat ni publicarla en GitHub. `.env` está excluido de Git y el servidor no sirve archivos de configuración. No se ha guardado ninguna clave real.

«Consultar catálogo REVE» hace una consulta autenticada al endpoint oficial `/locations` con `x-api-key`, conserva una copia durante una hora y muestra fecha de actualización. Las solicitudes simultáneas comparten una sola petición. No hay consultas automáticas al abrir o calcular rutas.

## Alcance actual

- Servidor local y comprobación de configuración; tener una clave configurada no demuestra todavía que REVE la acepte.
- Primer acceso al catálogo sin interpretar como definitivo su esquema, cobertura o paginación.
- Rutas, consumo y recargas siguen usando el motor existente y Open Charge Map. Todavía no se usan datos REVE en el cálculo ni se muestran precios inventados.
- No está desplegado en Internet ni vinculado a Render. El servicio inicial escucha en localhost. Antes de publicarlo hay que elegir alojamiento, revisar acceso y añadir almacenamiento compartido de caché/cuota.

## Límites y próximos pasos

La documentación pública de REVE indica cinco solicitudes por hora: https://www.mapareve.es/docs/api/external/v1. El servicio limita a cinco intentos en una ventana móvil de una hora, también si fallan, y espera una hora al recibir 429. Caché y cuota se guardan en `.cache/reve-state.json`, excluido de Git. Los intentos se registran antes de contactar con REVE y sobreviven a reinicios. El servicio debe ejecutarse en un solo proceso; todavía no dispone de coordinación entre varias instancias. Si el archivo no se puede leer o guardar, se bloquean nuevas consultas para proteger la cuota. Confirmar las condiciones particulares de la clave antes de la primera consulta real.

Con la clave configurada localmente podremos validar respuestas y paginación, enlazar cargadores y conectores con el recorrido, consultar tarifas y calcular costes. La comparación con Kia Charge Easy requerirá conocer su tarifa aplicable. Posteriormente añadiremos una vista de pruebas en Internet separada de la v1.

## Selección económica entre estaciones comparables

`comparar-paradas.mjs` compara candidatas con acceso y compatibilidad verificados, reserva suficiente y continuación viable. Utiliza el tiempo completo de viaje (incluidos desvío y recarga) y el tiempo de carga calculado para el EV3. Margen inicial configurable: 10 % sobre el viaje más rápido y 20 % sobre su recarga; son valores de desarrollo pendientes de validar con el recorrido real.

Elige el método compatible de menor coste total verificado en EUR, con fuente y fecha. No interpreta precios desconocidos como gratuitos ni tarifas generales como precios confirmados de una estación. El coste de entrada debe representar todas las recargas necesarias para la alternativa, con suplementos; no basta el €/kWh aislado. Si faltan precios, el resultado se limita explícitamente a los precios verificados. El ahorro solo se calcula cuando también se conoce el coste de la estación de referencia.

Este módulo tiene pruebas sintéticas y todavía no está conectado al resultado visible ni alimentado con tarifas REVE. Falta completar el catálogo y calcular accesos, desvíos y energía de las candidatas reales. La v1 no cambia.

El laboratorio incluye «Ver estaciones contrastadas»: muestra la estación Torrent dirección Alicante identificada en REVE, con sus conectores y fecha de consulta. No consume API. El servidor admite `/api/reve/locations?party_id=ZUN&page=4` y `/api/reve/tariffs?page=1`; los filtros están cerrados y todas las páginas comparten cuota y caché persistente. Una página completa de 100 registros se marca como posiblemente incompleta, nunca como catálogo nacional completo.

`tarifas-reve.mjs` interpreta únicamente tarifas simples de energía y cargo fijo sin restricciones, con IVA explícito y bloques de facturación. Las condiciones horarias y de ocupación se dejan pendientes. Esta interpretación todavía no está vinculada a un precio confirmado para Torrent ni al cálculo visible de rutas.

## Estudio local de Migjorn 4

En el laboratorio, «Migjorn 4 · Ver ida» y «Ver vuelta» muestran mapas OSRM y escenarios de batería a 16,5 y 20 kWh/100 km. Datos de trazado en `.cache/alquerias-study.json`, excluidos de Git; contienen extremos personales del recorrido y se sirven solo en localhost. La interfaz y el servidor sí se versionan; otra instalación sin ese archivo muestra «estudio no disponible».

Salida asumida al 100 % en cada sentido y llegada objetivo al 20 %. Con 16,5 kWh/100 km la carga objetivo es 71–72 %; a 20 kWh/100 km sube al 82–83 %, superando el objetivo habitual del 80 %. No es una garantía de autonomía ni una validación de tarifa. Acceso calculado por OSRM a las coordenadas de la estación; horario/acceso físico y portal exacto del destino siguen pendientes. No se consumen consultas REVE al abrir estos mapas.

## Reserva al volver a casa

Para destinos que contienen Vilanova i la Geltrú, con código 08800 si aparece un código postal, se usa una reserva doméstica del 15 %, seleccionable al 10 % o desactivable con «Usar reserva general». Se guarda con las preferencias de v2 al calcular. La reserva general y la de cargadores no se sobrescriben. El resumen indica «Casa» y la cifra efectiva; el cálculo usa esa misma cifra. La regla identifica la localidad, no verifica una vivienda concreta.

El estudio local de Migjorn usa ahora 15 % de reserva en la vuelta (20 % en ida). Con consumo plano de 16,5 kWh/100 km requiere salir de la estación al 67,1 %, unos 7,1 min de carga; a 20 kWh/100 km, 78,2 %, unos 20,7 min. El estudio guardado usa estos supuestos fijos y no recalcula al elegir 10 % en el formulario.

## Estaciones favoritas

Se guardan en `rutaev:v2:favoritos`, exclusivamente en el navegador de v2: nombre, identificador de origen, coordenadas, operador y potencia declarada, sin tarifas. Botones de guardar/quitar en paradas calculadas y estaciones contrastadas. La sección «Estaciones favoritas» permite eliminarlas. Incluye acceso para guardar Migjorn 4, sin guardarla automáticamente.

Los favoritos no crean puntos de paso. Se ha retirado «Añadir al recorrido»: una estación solo cuenta como parada cuando el motor la selecciona para recargar en un plan viable. La preferencia automática como estación de carga aún no está conectada al optimizador. No se sincronizan favoritos entre dispositivos y se mantienen al recargar la página.


## Información de servicios en las paradas

Se han retirado los botones y enlaces de restauración/aseos en favoritos y estaciones contrastadas. Solo las paradas de recarga del viaje muestran una nota informativa, consultada al renderizar el resultado. Usa el mismo servicio OSM/Overpass y caché de 24 h; no consume cuota REVE. No crea paradas ni afecta a la selección de cargadores.

La nota indica restauración próxima y aseos expresamente etiquetados en OSM, con distancias en línea recta hasta 500 m. Un bar no implica aseo confirmado. Acceso peatonal y apertura requieren comprobación. Si el proveedor falla, se mantiene «información no disponible; pendiente de confirmar». En la prueba anterior de Migjorn el proveedor rechazó la consulta; no se han confirmado servicios reales allí.

El buscador OCM descarta estaciones o conectores que la fuente marque expresamente como no operativos. Un estado desconocido no garantiza disponibilidad.

## Ruta con precios disponibles (sin optimización económica)

El formulario incluye «Mostrar precios disponibles de REVE». Al calcular, cada recarga consulta exclusivamente el catálogo y las tarifas ya guardados, sin consumir nuevas peticiones REVE. La asociación OCM–REVE exige un solo emplazamiento del operador reconocido a menos de 60 m; el precio se une por identificador exacto del conector CCS. Se muestran potencia del conector, precio con IVA, energía estimada, coste y fecha. La proximidad no sustituye la comprobación física del conector ni confirma el precio de una tarjeta de roaming.

Solo se muestran tarifas completas que interpreta el lector conservador y que se han consultado en la última hora. Faltas de asociación, condiciones no interpretadas y páginas sin tarifa resultan en «Precio no disponible». En modo normal, la tarifa no altera la elección del motor. El modo «Calcular solo con recargas con precio REVE disponible» filtra candidatos por cobertura de precio; no busca la opción más barata. No se suma un total de viaje si faltan precios. Estimación sobre energía hacia la batería, sin pérdidas de carga.

Validación real: página 28 de tarifas REVE incluye el conector `0ee90c66-72c5-4f3c-ac52-c422affa46b5`, CCS 340 kW de Zunder Torrent dirección Alicante: 0,4876 €/kWh sin IVA, 21 % de IVA, equivalente a aproximadamente 0,59 €/kWh. Para 17,512107 kWh del estudio preliminar, 10,33 €. Confirmación específica de ese conector, no del resto de conectores ni de Kia Charge Easy. La ficha de estaciones contrastadas permite comprobar ese precio mientras su consulta siga vigente.


## Prueba de ruta con precio garantizado en la selección

El modo «Calcular solo con recargas con precio REVE disponible» usa únicamente conectores de la caché con tarifa completa y reciente, proyectados a menos de 1 km del trazado. No crea puntos de paso obligatorios: el motor debe encontrar un plan viable con ellos, respetando reservas y tiempos. Si no lo encuentra, avisa y no devuelve silenciosamente un plan sin precios. Si no hace falta cargar, tampoco fuerza una parada. Esta proyección conserva la aproximación de desvíos existente: no verifica por sí sola el acceso real ni disponibilidad.

Al entrar en este modo se intentan actualizar como máximo dos páginas de tarifas ya conocidas que contengan conectores CCS de operadores asociados, solo si han caducado. Usa el contador compartido REVE. Si la cuota o el proveedor impiden actualizar, no se presentan datos caducados como recientes. La cobertura depende de las páginas ya descargadas.

Diagnóstico real: el modo normal eligió Consum Gilet (REMO Mobility), sin asociación de tarifa guardada; por eso no mostraba precio aunque Torrent sí tuviera uno. El nuevo modo permite probar rutas con la cobertura de tarifas disponible, sin optimización económica.

Prueba completa en interfaz con el viaje guardado Vilanova–Alicante, batería de salida 90 % y mínimo destino 20 %: el modo con precios selecciona Zunder Torrent dirección Alicante, 26,53 kWh aproximadamente, 17 min de carga y 15,65 € estimados a 0,59 €/kWh. La nota del motor advierte de que ese plan supera la preferencia de 300 km entre paradas y conserva el máximo de 40 min de carga. El modo normal seleccionó Consum Gilet sin tarifa asociada. Las dos opciones de precios se conservan en las preferencias al calcular.
