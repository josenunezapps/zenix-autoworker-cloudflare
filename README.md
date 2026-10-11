# Zenix AutoWorker — Cloudflare + Qwen Coder + Groq opcional

Motor independiente para buscar oportunidades reales, filtrar permisos de IA y preparar borradores. No envía postulaciones ni entregas.

## Archivos
- src/worker.js: Worker, Cron, escaneo, Qwen AI y API privada.
- src/logic.js: validaciones conservadoras.
- src/ui.js: panel web de revisión.
- wrangler.jsonc: configuración de Cloudflare, Workers AI y D1.
- migrations/0001_init.sql: esquema D1 alternativo (el Worker crea tablas si faltan).
- tests/logic.test.js: pruebas locales.

## Publicar
1. Conectar este repositorio de GitHub a Cloudflare Workers, rama main, raíz /.
2. Si la configuración pide comando de despliegue, usar npx wrangler deploy.
3. Cloudflare debe crear o enlazar la base D1 zenix-autoworker-db (binding DB); si falla, crear manualmente la base D1 y colocar database_id en wrangler.jsonc.
4. Crear un SECRETO privado del Worker llamado ZENIX_ADMIN_TOKEN con un valor aleatorio de al menos 24 caracteres. Nunca poner el valor en GitHub ni compartirlo por chat.
5. Opcional: crear GROQ_API_KEY como secreto privado del Worker; si falta, Qwen funciona sin análisis de Groq.
6. Visitar /health y luego /, ingresar el token privado y probar Buscar ahora.
7. No activar planes pagos; detener el proceso si se exige pago o tarjeta.

## Seguridad y límites
Los anuncios públicos son contenido externo no confiable. Opire NO autoriza IA implícitamente. Solo los encargos BountyBoard con allowAgents=true, cupo libre y categoría de programación pueden generar borradores.
El Worker NO ejecuta ni prueba código ajeno ni verifica pagos. Los borradores están marcados SIN PRUEBAS y requieren revisión humana. No existen postulaciones, PR ni pagos automáticos.
El Cron corre a las 03:00 y 15:00 UTC. Las cuotas gratuitas pueden cambiar. El código no usa esta conversación de ChatGPT.

© Zenix AR