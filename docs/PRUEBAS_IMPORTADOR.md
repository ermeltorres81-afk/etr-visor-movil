# Comprobaciones reproducibles del importador

Desde la raíz del repositorio, con Node.js 22 o posterior, sin instalar paquetes:

```sh
node --test tests/importador.test.cjs
```

El mismo comando se ejecuta en GitHub Actions para pushes y pull requests.
Los casos usan proyectos sintéticos, no exportaciones certificadas de V3.

## Comprobado automáticamente

- Cero bytes, espacios y BOM sin contenido: mensaje de archivo vacío.
- JSON truncado, sintaxis inválida y HTML: mensaje de archivo dañado y reexportación.
- JSON válido ajeno al formato: mensaje de formato no reconocido.
- Código repetido, incluso con espacios: no duplica memoria ni almacenamiento.
- Archivo de 8.388.609 bytes: rechazado antes de leer; 8.388.608 bytes: aceptado.
- Tildes, ñ, Unicode, saltos de línea, etiquetas y comillas: se conservan al importar,
  guardar y recargar; el escape HTML transforma los cinco caracteres peligrosos.
- Cantidades 0.002 y 0.0001, precios, rendimientos y subtotales pequeños:
  se conservan sin redondearlos al importar. Formato visual ecuatoriano verificado.
- Fallo de lectura y falta de espacio: mensajes distintos; en este último caso
  el proyecto queda disponible en memoria y el aviso explica que debe reimportarse.
- Los rechazos no alteran proyectos anteriores ni almacenamiento.

El arnés ejecuta las funciones del script real de index.html y el manejador change
con dobles mínimos de DOM, FileReader y localStorage. Omite únicamente el arranque
final de la aplicación. No modifica ni ejecuta la activación y no genera licencias.
No certifica el DOM real, la lectura asíncrona del navegador ni la instalación PWA/APK.
El JSON usa números con punto decimal; la coma decimal se comprueba en presentación,
no como un formato adicional de entrada. Las cantidades visuales usan hasta cuatro
 decimales y los importes monetarios dos; conservar datos no implica mostrarlos todos.

## Pendiente de prueba manual (sin evidencia de ejecución en esta revisión)

- Exportaciones reales de ETR APUS PRO V3: contrastar todos los campos, rubros,
  APU, cronogramas y totales con el programa de origen.
- Proyectos reales grandes (cientos de rubros): tiempo, memoria, desplazamiento
  y persistencia cerca del límite en dispositivos con poco espacio.
- Android de varias marcas y tamaños: selector real, cancelación, reimportación,
  permisos, cierre y reapertura, orientación vertical/horizontal y modo sin conexión.
- Botón Atrás físico/gestual dentro del APK y navegación entre pantallas.
- Confirmar en navegador real que las etiquetas importadas aparecen como texto
  y no crean elementos ni ejecutan código.

Registrar para cada prueba manual: versión/commit del visor, versión de V3,
archivo usado (o huella), modelo y versión de Android, pasos, resultado esperado
 y observado. No marcar estas comprobaciones como realizadas por pasar Node.js.
