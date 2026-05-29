# RESTORE POINT
**Fecha y Hora:** 29 de Mayo de 2026 - 08:35 hrs (Hora de Argentina)

## Estado de la Aplicación
- **Motor de IA Actualizado (Multi-Modelo Fallback):** Se eliminó la dependencia a versiones deprecadas (1.5) y experimentales (2.5) con límites estrictos. El sistema ahora usa en cascada dinámica: `gemini-2.0-flash` -> `gemini-2.0-flash-lite` -> `gemini-2.5-flash` -> `gemini-pro`. Esto garantiza alta disponibilidad y evita cuellos de botella por cuota diaria ("Quota Exceeded").
- **Enrutamiento público corregido:** La URL raíz entra directo al portafolio de cliente de forma limpia y transparente, el acceso de admin requiere la URL secreta `?view=admin`.
- **UI/UX Modo Oscuro perfeccionado:** Sin errores de inversión en AdminLogin y variables tailwind balanceadas.
- **Branding Footer unificado:** Consistencia total de identidad (Client, Admin, Dashboard) con diseño exclusivo NODO AI (©).
- **Esquema de Supabase estable:** Se corrigió el error de tabla (eliminado guardado de status local que generaba conflicto de esquema).
- **KAIZEN BACKLOG:** 4 ideas de alto impacto documentadas en PENDIENTES.md listas para iteración (incluyendo propuesta de indicador de tokens y modelos alternativos como Groq/Claude).

**Último Commit Seguro:** `c9ae8cc` (Vercel Prod Active)
