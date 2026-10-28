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
