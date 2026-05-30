# Registro Activo de Pendientes - portfolio-de-fotografia-profesional

## 1. Tareas Inmediatas (Sesión Actual)

### Fase 1: Estructuración Operativa y Limpieza de Código (Completada)
- [x] Crear estructura `ops/` y archivos de gobernanza (`plan-de-vuelo.md`, `project-context.yaml`, `PENDIENTES.md`, `AUDITORIA.md`, `KAIZEN.md`)
- [x] Refactorizar componentes para cumplir con la regla de < 500 líneas
  - [x] Dividir `PhotographerDashboard.tsx` (1684 líneas) en módulos más pequeños.
  - [x] Dividir `ClientPortfolioView.tsx` (608 líneas) en módulos más pequeños.
- [x] Eliminar credenciales fijas y configurar variables de entorno `.env`
- [x] Ejecutar verificaciones de calidad (`typecheck`, `lint`, `build`)
- [x] Crear el primer punto de restauración (Restore Point)

---

## 2. Próximas Fases (Base de Datos en la Nube)

### Fase 2: Migración a Supabase (PostgreSQL + Cloud Storage) — COMPLETADA 2026-05-28
- [x] Creación e inicialización del proyecto en Supabase (por parte de Christian Rotger).
- [x] Instalación de dependencia `@supabase/supabase-js`.
- [x] Configuración del cliente Supabase en `src/utils/supabase.ts` y conexión `.env`.
- [x] Modelado de bases de datos e inicialización de tablas (`portfolio_config`, `photos`, `reviews`).
- [x] Configuración de Supabase Storage para alojar las imágenes físicas y retornar URLs públicas rápidas.
- [x] Refactorización de `App.tsx` para sincronizar estados con la base de datos de Supabase en tiempo real.
- [x] Adaptación de la importación del archivo JSON para poblar Supabase automáticamente.

---

## 2.0.1 Ola 2B — Completada 2026-05-30

- [x] **Supabase Storage activo**: Bucket `portfolio-photos` operativo. Fotos subidas con URL permanente `supabase.co/storage/...`. Thumbnail automático en `/thumbnails/`. Fallback a base64 si Storage falla. Verificado en producción. | Restore: `ola2b-storage-verificado-20260530_1042`

---

## 2.1 Plan de Acción — Auditoría Externa 2026-05-29

Ver plan completo en `ops/PLAN-ACCION-AUDITORIA-29MAY2026.md`

- [x] **BLOQUE A** (Crítico): Hardcoding eliminado. Auth con SHA-256 desde .env. Google OAuth dormido. Login solo contraseña. — 2026-05-29 ✓ | Restore: `auditoria-bloque-a-20260529_0936`
- [x] **BLOQUE B** (Alto — código): Validación longitud comentarios, `.env.example` actualizado, error explícito Supabase client. — 2026-05-29 ✓ | Restore: `auditoria-bloque-b-20260529_0940`
- [x] **BLOQUE B** (Manual RLS): RLS configurado en Supabase — `photos` SELECT, `portfolio_config` SELECT, `public_comments` INSERT+SELECT aprobados, `client_feedbacks` y `client_review_sessions` bloqueadas. — 2026-05-29 ✓ | Restore: `bloque-b-verificado-20260529_1226`
- [x] **BLOQUE C** (Deuda técnica): `src/types/database.ts` creado, `any` eliminados de `supabase.ts`, `@ts-ignore` eliminados, `db.ts` borrado. — 2026-05-29 ✓ | Restore: `bloque-c-tipos-db-20260529_1241`
- [x] **BLOQUE D** (Arquitectura): `useToast`, `useAuth`, `usePortfolioData` creados. `App.tsx` → 130 líneas. `CustomEvent` eliminado. Función zombi eliminada. — 2026-05-29 ✓ | Restore: `bloque-d-hooks-20260529_1423`

---

## 3.0 Ola 3 — KAIZEN x10 — Completada 2026-05-30

- [x] K1 — Code splitting React.lazy + manualChunks (bundle 632KB → 212KB, -63% gzip) — 2026-05-30 ✓ | Restore: `ola3-kaizen-completa-20260530_1213`
- [x] K2 — Lazy loading imágenes grilla (`loading="lazy"` + `decoding="async"`) — 2026-05-30 ✓
- [x] K5 — WebP en upload (compressImage + compressImageToBlob → image/webp 0.80q) — 2026-05-30 ✓
- [x] K6 — Error boundary elegante (`ErrorBoundary.tsx` class component + main.tsx) — 2026-05-30 ✓
- [x] K7 — Script migración base64 → Storage (`scripts/migrate-base64-to-storage.ts`, ejecutar con `npx tsx`) — 2026-05-30 ✓
- [x] K8 — Rate limiting comentarios: throttle UI 60s localStorage + `scripts/k8-rate-limit-comments.sql` — 2026-05-30 ✓
- [x] K9 — Links PIN: `ClientPinGate.tsx`, funciones Supabase `client_sessions`, integración App.tsx + `scripts/k9-client-sessions.sql` — 2026-05-30 ✓
- [x] K10 — Wallpapers descargables: `WallpapersSection.tsx`, toggle dashboard, `is_wallpaper` en DB + `scripts/k10-wallpapers.sql` — 2026-05-30 ✓

**Pendiente de usuario (no bloqueante):**
- [ ] K3 + K4 (EmailJS): proveer Service ID, Template ID y Public Key para activar formulario de contacto y notificaciones email.
- [ ] Ejecutar en Supabase SQL Editor: `k8-rate-limit-comments.sql`, `k9-client-sessions.sql`, `k10-wallpapers.sql`

---

## 2.2 Fase Vigente — Mega-KAIZEN (5 mejoras estructurales)

- [x] **Fase A:** Configurar Husky + pre-commit hooks (lint + typecheck) — completado en sesión anterior
- [x] **Fases B–E:** Completado vía Ola 3 KAIZEN x10.

---

## 3. Riesgos Registrados

| ID | Riesgo | Mitigación | Estado |
|---|---|---|---|
| R1 | Los archivos de código gigantes dificultan la escalabilidad y causan lints lentos | Refactorizar y modularizar archivos bajo la regla estricta de 500 líneas | **Mitigado** |
| R2 | La app es local-only; los clientes externos solo ven la plantilla por defecto | Migrar el almacenamiento a una base de datos global en la nube (Supabase) | **Mitigado** |
| R3 | Credenciales expuestas en archivos `.tsx` | Mapear credenciales a variables de entorno de Vite (`import.meta.env.VITE_*`) | **Mitigado** |

---

## 3.5 Ideas de Producto — Backlog Estratégico (2026-05-29)

> Ideas registradas para evaluar en futuras olas. No tienen orden de ejecución aprobado aún.

### 💰 Monetización
- [ ] **Tienda de venta de fotos** — El cliente puede comprar licencias o prints de fotos directamente desde la vista pública. Requiere catálogo de productos, precios por foto/licencia y pasarela de cobro.
- [ ] **Pasarela de cobro** — Integrar Stripe (o MercadoPago para LATAM) para procesar pagos de la tienda. Requiere cuenta Stripe + Supabase Edge Function para manejar webhooks.

### 🖼️ Contenido
- [ ] **Wallpapers gratuitos** — Sección pública con fotos seleccionadas disponibles para descarga libre (versión watermarked o resolución reducida). Genera tráfico orgánico y visibilidad de marca. No requiere pasarela — solo botón de descarga con tracking.

---

## 4. Deuda Técnica
- La lógica de IndexedDB es temporal y será reemplazada por Supabase en la Fase 2, por lo que no debemos invertir esfuerzo extra en optimizar su capacidad de búfer actual.

---

## 5. Historial de Puntos de Restauración (Restore Points)
- `fase1-estructuracion-completa` (legado — sin timestamp horario): Fase 1 terminada. Archivos refactorizados a <500 líneas y compilación validada.
- `fase2-supabase-completada-20260528_113156` (2026-05-28 11:31): Fase 2 completada. Migración a Supabase activa. Persistencia cloud operativa.
- `RESTORE POINT 28MAY2130` (legado — sin timestamp horario): Fix de routing — URL raíz redirige a vista cliente público por defecto.
- `RESTORE POINT 29MAY0835` (legado — sin timestamp horario): Actualización modelos Gemini fallback array (2.x en lugar de 1.5 deprecados).
- `auditoria-bloque-a-20260529_0936` (2026-05-29 09:36): Bloque A auditoria cerrado. Hardcoding eliminado, SHA-256 auth, Google OAuth dormido.
- `bloque-c-tipos-db-20260529_1241` (2026-05-29 12:41): Bloque C cerrado. Tipos DB creados, any/@ts-ignore eliminados, db.ts borrado.
- `auditoria-abc-deploy-20260529_1248` (2026-05-29 12:48): Commit + push + deploy Vercel. Bloques A+B+C completos en producción.
