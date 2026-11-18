# Ruta EV 4.21 · Datos de recarga y revisión

Revisión: 18 de noviembre de 2026. Las consultas usan fuentes gratuitas.

## Procedencia y alcance

- Mapa REVE / Red Eléctrica: 147 páginas de ubicaciones y 453 páginas de estados operacionales, mediante su API oficial. Se han recogido 14.632 identidades de emplazamiento y 45.230 identidades de punto. Son datos vivos paginados, no una copia atómica: el total anunciado varió durante la descarga y se eliminaron duplicados por ID. No se afirma cobertura universal.
- Catálogo publicado: 3.520 estaciones de 50 operadores con al menos dos EVSE distintos declarados operacionales, CCS2 DC y potencia mínima de 50 kW. La selección del viaje aplica además sus filtros de acceso, operador y potencia.
- OpenStreetMap: consulta del 18/11/2026 a 5.355 estaciones españolas. 426 coincidencias únicas de operador y posición a 35 m o menos. Tres presentan restricciones de acceso y se excluyen del plan. No se fusionan coincidencias ambiguas ni se sustituye la posición REVE por un punto cercano.
- Open Charge Map sigue siendo un complemento mediante la clave personal del usuario. Se exige estado operacional positivo cuando es la única fuente; no se publica esa clave.

REVE: https://www.mapareve.es/docs/api/external/v1
OpenStreetMap: https://www.openstreetmap.org/copyright
Datos de contraste OSM © OpenStreetMap contributors, bajo ODbL: https://opendatacommons.org/licenses/odbl/1-0/
Open Charge Map: https://openchargemap.org/site/develop/api

El contraste se distribuye con cada registro en `contrasteOSM`, separado de sus datos REVE, con enlace al objeto y fecha. La disponibilidad de la consulta o un icono en el mapa no demuestra que una estación pueda usarse ahora.

## Criterios de selección

Se cuentan puntos EVSE, no mangueras. Se planifica como máximo con la potencia del segundo punto más potente, limitada además por la curva del EV3. No se multiplican conectores duplicados. Se excluyen estados operacionales falsos o sin confirmar en la captura REVE. Se descartan accesos privados conocidos y supermercados sin acceso 24 h declarado. Tesla queda fuera hasta confirmar admisión de vehículos ajenos a esa marca. Los demás horarios desconocidos se identifican como pendientes.

La posición del catálogo se conserva para el marcador y para Apple Maps, Google Maps y Waze. OSRM calcula la carretera de acceso con un ajuste máximo de 100 m. Una conexión discontinua representa separación entre el punto y la vía cartografiada: no certifica acceso físico, barreras, sentido de entrada ni maniobras posibles.

## Comprobaciones

42 pruebas automáticas sobre la versión a publicar: reservas, ida y vuelta, meteorología, altitud, tiempos, acceso por carretera, navegación externa y filtros de estaciones. Incluyen 120 viajes con balance de energía y 2.000 perfiles contra una simulación independiente de regeneración. El redondeo conservador del buscador no se utiliza para inventar energía cargada: la ficha se recalcula con la batería real del modelo.

Se exploran hasta seis planes de recarga por trazado, incluyendo candidatos próximos al recorrido. No se garantiza el óptimo global de todas las estaciones y carreteras posibles.

## Límites

El catálogo REVE publicado es una captura fechada: su renovación requiere una nueva actualización, no se refresca automáticamente desde el iPhone. Estado operacional declarado no equivale a ocupación o averías en directo. Las 426 coincidencias OSM corroboran identidad y posición, no disponibilidad, potencia ni acceso actual. Las restantes no tienen segunda confirmación cartográfica.

Las previsiones dependen del consumo configurado, orografía y meteorología disponibles. No incluyen tráfico en directo, colas, temperatura real de batería, potencia compartida o una garantía de carga. No se ha certificado físicamente ninguna estación. Revisar la aplicación del operador antes de desplazarse sigue siendo necesario.

## Contrastes puntuales con operadores

- Zunder Torrent dirección Alicante: la publicación oficial de apertura identifica la estación y su sentido de acceso. Es de 2021 y describe una configuración antigua; no sustituye las potencias de REVE de noviembre de 2026. La ficha OSM actual identifica 2 CCS de 90 kW y 4 de 340 kW, coincidentes con el catálogo actual. https://www.zunder.com/estacion-carga-torrent-direccion-alicante/
- Les Alqueries by Porsche: la nota de Iberdrola | bp pulse documenta el hub del Área Servidiesel junto a MAN, salida 48 de AP-7. Es una publicación de apertura de 2024; confirma la existencia de la instalación, no su ocupación actual. https://iberdrola-bppulse.es/prensa/iberdrola-bp-pulse-inaugura-en-les-alqueries-su-primerhub-de-recarga-para-vehiculos-electricos-en-castellon/

Comprobación en navegador: Vilanova–El Campello, salida 90 %, 493 km, una recarga, 6 h y 21 % al destino. Ida y vuelta: 968 km, tres recargas, 12 h 28 min, 12 % en El Campello y 16 % al destino Vilanova. Son resultados de esta consulta con los ajustes de prueba, no valores garantizados para otro día o configuración.
