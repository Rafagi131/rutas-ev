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
