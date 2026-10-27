# Ruta EV

Planificador personal de viajes para Kia EV3. Revisión 1: comparación de consumo y duración total.

Web: https://rafagi131.github.io/rutas-ev/

Solicita hasta tres rutas disponibles y recomienda el menor consumo dentro de un margen de tiempo adicional del 10 %, ajustable. El tiempo incluye conducción, recargas y paradas. Con paradas intermedias se evalúa un único recorrido.

Para buscar recargas necesita una clave propia de Open Charge Map, introducida en Ajustes y guardada en el navegador. Los trayectos sin recargas pueden calcularse sin clave.

Los tiempos y consumos son estimaciones. No incluye tráfico ni disponibilidad en tiempo real; conserva un modelo de consumo con velocidad de referencia común y aproxima los accesos a cargadores con un tiempo extra fijo. Las aplicaciones de navegación pueden cambiar el recorrido.

Los datos del navegador usan el prefijo `rutaev:` para separarlos de otras aplicaciones. La versión anterior se conserva en la rama `respaldo-antes-comparacion`.
