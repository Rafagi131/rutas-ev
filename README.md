# Ruta EV

Planificador personal de viajes para Kia EV3. Revisión 1: comparación de consumo y duración total.

Web: https://rafagi131.github.io/rutas-ev/

Solicita hasta tres rutas disponibles y recomienda el menor consumo dentro de un margen de tiempo adicional del 10 %, ajustable. El tiempo incluye conducción, recargas y paradas. Con paradas intermedias se evalúa un único recorrido.

Para buscar recargas necesita una clave propia de Open Charge Map, introducida en Ajustes y guardada en el navegador. Los trayectos sin recargas pueden calcularse sin clave.

Los tiempos y consumos son estimaciones. No incluye tráfico ni disponibilidad en tiempo real; conserva un modelo de consumo con velocidad de referencia común y aproxima los accesos a cargadores con un tiempo extra fijo. Las aplicaciones de navegación pueden cambiar el recorrido.

Los datos del navegador usan el prefijo `rutaev:` para separarlos de otras aplicaciones. La versión anterior se conserva en la rama `respaldo-antes-comparacion`.

Actualización 29/10/2026: comparación abierta de recorridos por vías principales. Para Alicante–Levante/Cataluña, sin puntos intermedios, se calculan AP-7 costa (Benissa) y A-7 interior (Alcoy). Se comprueba la referencia de vía cerca del punto de paso y se adapta la calzada al sentido de marcha. Los puntos del corredor se conservan en navegación Apple/Google; no son recargas. En otros trayectos se identifican las vías principales de las alternativas recibidas de OSRM. Si no se obtiene una segunda propuesta viable, se indica. No se generan desvíos laterales para completar dos opciones. La búsqueda explícita de corredores fuera de esta zona sigue pendiente de generalizar.
