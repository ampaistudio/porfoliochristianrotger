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

### Fase 2: Migración a Supabase (PostgreSQL + Cloud Storage)
- [ ] Creación e inicialización del proyecto en Supabase (por parte de Christian Rotger).
- [ ] Instalación de dependencia `@supabase/supabase-js`.
- [ ] Configuración del cliente Supabase en `src/utils/supabase.ts` y conexión `.env`.
- [ ] Modelado de bases de datos e inicialización de tablas (`portfolio_config`, `photos`, `reviews`).
- [ ] Configuración de Supabase Storage para alojar las imágenes físicas y retornar URLs públicas rápidas.
- [ ] Refactorización de `App.tsx` para sincronizar estados con la base de datos de Supabase en tiempo real.
- [ ] Adaptación de la importación del archivo JSON para poblar Supabase automáticamente.

---

## 3. Riesgos Registrados

| ID | Riesgo | Mitigación | Estado |
|---|---|---|---|
| R1 | Los archivos de código gigantes dificultan la escalabilidad y causan lints lentos | Refactorizar y modularizar archivos bajo la regla estricta de 500 líneas | **Mitigado** |
| R2 | La app es local-only; los clientes externos solo ven la plantilla por defecto | Migrar el almacenamiento a una base de datos global en la nube (Supabase) | Pendiente Fase 2 |
| R3 | Credenciales expuestas en archivos `.tsx` | Mapear credenciales a variables de entorno de Vite (`import.meta.env.VITE_*`) | **Mitigado** |

---

## 4. Deuda Técnica
- La lógica de IndexedDB es temporal y será reemplazada por Supabase en la Fase 2, por lo que no debemos invertir esfuerzo extra en optimizar su capacidad de búfer actual.

---

## 5. Historial de Puntos de Restauración (Restore Points)
- `fase1-estructuracion-completa` (2026-05-28): Fase 1 terminada. Archivos refactorizados a <500 líneas y compilación validada.
