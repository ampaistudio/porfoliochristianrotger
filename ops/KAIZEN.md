# KAIZEN DE CIERRE - portfolio-de-fotografia-profesional

## Técnico

1. **Sincronización en la Nube con Supabase:** Migrar la base de datos local (IndexedDB) a Supabase (PostgreSQL) y configurar Supabase Storage para alojar imágenes mediante URLs públicas seguras, resolviendo el problema de carga en Tor y dispositivos de clientes.
2. **Optimización Avanzada de Carga (LCP):** Generar automáticamente miniaturas (thumbnails) optimizadas en formato WebP en el navegador durante la carga para renderizar la grilla inicial de forma ultra-rápida, reservando la carga de la imagen de alta resolución exclusivamente para el modo slideshow.
3. **Seguridad y Aislamiento de Entorno:** Excluir estrictamente el archivo `.env` del control de versiones (Git) y mapear las variables en Vercel para garantizar cero fugas de tokens o llaves públicas.
4. **Offline Caching (PWA):** Configurar Service Workers para cachear las imágenes de Supabase localmente, permitiendo al cliente revisar la exposición de fotos offline o bajo conexiones móviles inestables.

## Operativo

5. **Automatización de Gobernanza (Husky Hooks):** Configurar ganchos de pre-commit para ejecutar automáticamente `npm run lint` y verificar que ningún archivo editado supere el límite estricto de las 500 líneas antes de permitir un commit.
6. **Integración Continua (CI/CD) en Vercel:** Automatizar el despliegue a producción solo cuando las ramas superen con éxito las validaciones del typecheck y pruebas del servidor.
7. **Cobertura de Tests Unitarios y E2E:** Agregar pruebas unitarias (Vitest/Jest) para la lógica de extracción de EXIF (`src/utils/image.ts`) y pruebas E2E (Playwright) para el flujo de envío de feedback del cliente.

## Estratégico

8. **Asistente Editorial de Inteligencia Artificial (Gemini Real):** Conectar la generación de notas de curación con la API real de Gemini 1.5 Flash (usando Supabase Edge Functions), de modo que al subir una foto con metadatos EXIF, la IA redacte automáticamente un pie de foto poético y técnico bilingüe.
9. **Monitoreo de Feedback en Tiempo Real:** Configurar Supabase Realtime para que los checkmarks de aprobación y comentarios del cliente aparezcan en la pantalla del fotógrafo de forma instantánea sin necesidad de recargar el navegador.
10. **Branding Consolidado y Modo Cliente Limpio:** Mantener el modo cliente libre de banners operacionales de previsualización para visitas externas, garantizando que el diseño premium de Nodo Ai Agency resalte sin interferencias de desarrollo.

## Lecciones principales

- La persistencia local-only limita la visibilidad en dispositivos móviles de clientes y navegadores limpios. Es fundamental un enfoque de base de datos distribuida en la nube (Supabase) desde etapas iniciales si se desea un producto premium listo para producción.
- La autenticación client-side pura (comparación de contraseña en el browser) es un anti-patrón incluso en proyectos personales. SHA-256 desde `.env` es el mínimo viable seguro.
- El RLS en Supabase es obligatorio desde el día 1. Una política `ALL public` es equivalente a no tener seguridad.
- Los tipos generados o escritos a mano para la capa de datos eliminan una clase entera de bugs silenciosos.

## KAIZEN ejecutados — Auditoría 2026-05-29

- [x] **SEC**: Contraseña movida a `.env` con hash SHA-256. Sin hardcoding en código fuente.
- [x] **SEC**: Login simplificado a solo contraseña. Google OAuth dormido.
- [x] **SEC**: RLS configurado en Supabase con políticas granulares por tabla.
- [x] **SEC**: Validación de longitud en comentarios públicos (nombre: 80 chars, texto: 500 chars).
- [x] **CALIDAD**: `src/types/database.ts` creado. Todos los `any` y `@ts-ignore` eliminados de `supabase.ts`.
- [x] **LIMPIEZA**: `db.ts` (IndexedDB legacy) eliminado.
- [x] **OPS**: `.env.example` actualizado con todas las variables reales del proyecto.
- [x] **OPS**: Formato de restore points con fecha y hora obligatorio documentado en Plan de Vuelo.

## KAIZEN Ola 3 — Aprobadas para próxima sesión (2026-05-30)

- [ ] K1 — Code splitting bundle JS (React.lazy) — bundle 632KB → < 200KB
- [ ] K2 — Lazy loading imágenes en grilla (`loading="lazy"`)
- [ ] K3 — Formulario de contacto EmailJS (vista cliente)
- [ ] K4 — Notificación email al recibir comentario (EmailJS)
- [ ] K5 — WebP en upload (30-40% más liviano que JPEG)
- [ ] K6 — Error boundary en App (pantalla de error elegante)
- [ ] K7 — Script migración fotos base64 → Supabase Storage
- [ ] K8 — Rate limiting comentarios públicos (throttle UI + RLS)
- [ ] K9 — Links protegidos por PIN por cliente
- [ ] K10 — Sección Wallpapers gratuitos descargables

**Orden de ejecución aprobado:**
- Paralelo 1: K2 + K5 + K6
- Paralelo 2: K3 + K4 (EmailJS)
- Secuencial: K1 → K7 → K8 → K9 → K10

---

## Próximas mejoras (Bloque D pendiente)

- [ ] Eliminar función zombi `handleClientFeedbackSubmit` en `App.tsx`
- [ ] Reemplazar `CustomEvent("show-toast")` por `useToast()` hook
- [ ] Extraer `useAuth()` y `usePortfolioData()` de `App.tsx` (target: < 200 líneas)
