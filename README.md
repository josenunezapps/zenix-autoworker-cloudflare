# Zenix AutoWorker — motor de encargos remunerados

## Propósito

Encontrar encargos remunerados publicados por terceros, intentar ejecutar con IA tareas que permitan agentes, y derivar al propietario los trabajos de páginas web, apps y software que la IA todavía no pueda resolver.

Los contactos comerciales obtenidos de OpenStreetMap NO son encargos confirmados. Esa prospección permanece como herramienta secundaria.

## Proyectos publicados por clientes

- Nueva fuente: Freelancer.com, mediante su API pública de proyectos activos, con búsquedas para web, software/apps y diseño gráfico.
- Cada anuncio muestra enlace original, presupuesto mínimo y máximo, divisa, cantidad de propuestas y competencia estimada. El panel permite ordenar por relevancia, menor cantidad de propuestas o fecha y despliega pocos resultados a la vez.
- Se descartan ventas a comisión, campañas de marketing sin entregables de diseño, apuestas y anuncios de alto riesgo. Se distingue el diseño técnico/CAD del gráfico y no se comparan cifras monetarias entre distintas divisas como si tuvieran el mismo valor.
- Se priorizan los anuncios recientes (últimos 7 días); los cerrados, no públicos, falsos o de marketing ajenos a diseño/desarrollo se descartan.
- El escaneo automático consulta la fuente dos veces por día y el botón principal permite pedir una búsqueda nueva.
- Encontrar una oferta NO significa adjudicación, aceptación del uso de IA, financiación ni cobro. Las postulaciones a Freelancer.com NO están automatizadas.
- Workana y PeoplePerHour son destinos relevantes para revisar proyectos de clientes, pero todavía no están conectados como fuentes automáticas: no se debe afirmar lo contrario.

## Bandejas

- Puede intentar la IA: solo candidatos aptos para generar un borrador. No significa entrega ni pago.
- Para vos: proyectos de software que necesitan desarrollo humano. Verificar anuncio, cliente y cobro antes de aceptar.
- Por verificar: anuncios viejos, sin permiso explícito, sin presupuesto claro, o sin comprador validado.
- Postulaciones de ugig: estados consultados de la cuenta, que no equivalen a fondos recibidos.

## Estado técnico al 11/10/2026

- Cloudflare Worker + D1 y Workers AI; escaneo dos veces al día.
- Fuentes de clientes: Freelancer.com. Otras fuentes: ugig, BountyBoard, Opire, Taskmarket, BasedAgents, Jobicy y opcionalmente Photon/OSM para prospección comercial.
- La clave UGIG_API_KEY queda como secreto del servidor.
- UGIG_AUTO_APPLY está marcado como enabled en wrangler.jsonc, pero el Worker solo puede postular por la API autorizada si además tiene UGIG_API_KEY, un encargo apto, borrador previo y el límite diario disponible. No significa que haya enviado postulaciones.
- BasedAgents: el Worker ahora prepara automáticamente, como máximo, un borrador por escaneo exitoso cuando detecta un encargo financiado, de texto y con todos los datos de entrada. Lo almacena sin reclamar la tarea, sin entregar el resultado y sin cobrar.
- Código y textos de IA generados son borradores SIN PRUEBAS salvo que se incorporen validaciones externas.
- El Worker todavía NO ejecuta proyectos completos, NO garantiza entrega y NO puede cobrar o certificar pagos por sí solo.
- Encuestas de opinión humana falsas, visionado de anuncios, CAPTCHA y fraude de clics están excluidos.

## Para ganar ingresos automáticamente de verdad

Se necesita conseguir pedidos actuales de compradores reales; confirmar permiso de IA, aceptación y fondos; ejecutar en un entorno aislado con pruebas; entregar mediante la plataforma; y verificar el pago en una cuenta conectada. Si alguna etapa falla o requiere desarrollo humano, la oportunidad pasa a la bandeja del propietario.

© Zenix AR
