# Pendientes e ideas para el Visor ETR

Lista corta para decidir más adelante. **Las ideas de producto siguen pendientes; las pruebas tienen su estado separado abajo.**

## Datos nuevos de la V3 que convendría mostrar
- **Presupuesto con totales completos**: subtotal, indirectos, utilidad, IVA y total del presupuesto (hoy solo se ve el total referencial).
- **Cronograma como gráfico** (barras o Gantt simple) además de la tabla de porcentajes.
- **Planillas / avance de obra**: planilla por periodo, cantidades ejecutadas vs. contratadas, avance real vs. planificado (hoy el % de avance viene fijo en el archivo).
- **Fórmula polinómica y reajuste de precios**, si la V3 la exporta.
- **Lista de materiales / insumos totales de la obra** (suma de todos los periodos) para compras.
- **Fotos o notas de obra** tomadas desde el celular y asociadas a un rubro.

## Mejoras de uso
- Poder **borrar o actualizar** un proyecto importado (hoy solo se puede sumar; si se vuelve a importar el mismo código, se rechaza).
- Importar **varios archivos a la vez** y mostrar la fecha/versión de exportación de cada proyecto.
- **Compartir o exportar** a PDF/Excel lo que se ve en pantalla (un rubro, un periodo).
- Buscar dentro del análisis de precios (APU) y ordenar rubros por monto.
- Mostrar más decimales en el análisis de precios si la V3 trabaja con 3 o 4 decimales (hoy los valores se redondean a 2).
- Definir y documentar el **formato oficial del archivo de exportación** (versión, campos obligatorios) para que V3 y visor evolucionen juntos.

## Licencias y seguridad (decisiones del dueño)
- La licencia guardada en el celular se verifica con firma solo al activar; después solo se compara el código del equipo. Conviene decidir si se vuelve a verificar la firma en cada arranque (no se tocó el algoritmo de validación).
- La lista de equipos dados de baja (`LICENCIAS_REVOCADAS`) exige volver a publicar la app; evaluar si se prefiere otro mecanismo.
- Quitar del producto final el aviso "Prototipo · datos de ejemplo", los proyectos de ejemplo y el botón de proyecto de ejemplo cuando se publique la versión definitiva.
- Las tipografías vienen de Google Fonts: sin internet se usa una letra del sistema. Si se quiere el mismo aspecto sin conexión, guardar las fuentes dentro de la app.

## Pruebas
- Pruebas automáticas del importador y alcance: ver [PRUEBAS_IMPORTADOR.md](PRUEBAS_IMPORTADOR.md).

### Pendientes manuales (sin evidencia de ejecución en esta revisión)
- Probar en un celular Android real (varias marcas y tamaños de pantalla) y con archivos reales exportados por la V3, en especial proyectos grandes (cientos de rubros).
- Probar el botón "atrás" del celular dentro del APK.
