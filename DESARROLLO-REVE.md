# Ruta EV v2 · REVE

Base independiente de desarrollo. Todavía usa Open Charge Map para las recargas; REVE no está conectado.

La v1 sigue publicada en https://rafagi131.github.io/rutas-ev/ y su código no se modifica al trabajar en esta carpeta. Copia estable en versiones/v1-estable, con hash y commit de referencia. GitHub conserva además la rama codex/v1-estable; el desarrollo remoto de v2 ocurre en codex/v2-reve. No fusionar v2 en main ni cambiar la fuente de Pages mientras la integración esté en pruebas.

Los ajustes, historial y clave OCM de v2 usan el prefijo independiente rutaev:v2:. No se copian ni se modifican los datos guardados de v1. La primera apertura requiere configurar el vehículo y las preferencias de prueba.

## Próximos pasos

1. Revisar las condiciones de uso y límites del acceso REVE aprobado.
2. Preparar un servicio privado con REVE_API_KEY en variables de entorno; nunca incluirla en HTML, Git, almacenamiento del navegador o URLs.
3. Consultar ubicaciones, conectores, tarifas y estado con caché compartida y fecha de actualización, respetando el límite aplicable.
4. Mostrar precios y coste estimado por parada, indicando datos ausentes y suplementos. Comparar con Kia Charge Easy solo cuando se conozca su tarifa aplicable.
5. Incorporar coste, desvíos y recarga al equilibrio entre ahorro y duración; validar antes de sustituir v1.

No se ha creado ni contratado alojamiento de servidor. La rama de desarrollo no tiene publicación independiente todavía.
