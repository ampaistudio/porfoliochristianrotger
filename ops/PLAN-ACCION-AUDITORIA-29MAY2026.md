# PLAN DE ACCIÓN — Auditoría Externa 2026-05-29

## Origen
Basado en la tabla de hallazgos de la auditoría RUFLO + Claude del 2026-05-29.
Ejecutar en orden de bloques. No avanzar al siguiente bloque sin cerrar el anterior.

---

## BLOQUE A — Seguridad Crítica (No negociable antes de producción pública)

| ID | Archivo | Acción concreta |
|----|---------|-----------------|
| SEC-01 | `src/App.tsx:53` | Eliminar fallback `"Gordini+2026"`. Si `VITE_ADMIN_PASSWORD` no está definida, lanzar error explícito. |
| SEC-03 | `src/App.tsx:83` | Eliminar `localStorage.setItem("admin_password", ...)`. La contraseña nunca debe persistir en el browser. |
| SEC-04 | `src/components/AdminLogin.tsx:40` | Migrar autenticación a Supabase Auth. Eliminar comparación client-side de contraseña. |
| SEC-02 | `src/App.tsx:77` | Mover Google Client ID a `VITE_GOOGLE_CLIENT_ID` en `.env`. Eliminar valor hardcodeado. |
| SEC-05 | `App.tsx:70`, `PhotographerDashboard.tsx:40`, `DashboardSettings.tsx:37`, `SettingsSecurity.tsx:19` | Mover email a `VITE_AUTHORIZED_EMAILS`. Eliminar `"rotgerchristian@gmail.com"` de los 4 archivos. |

**Criterio de cierre del bloque A:**
- `npm run lint` sin errores
- `npm run build` sin errores
- Ningún secreto, email ni credencial visible en `src/`
- `.env` tiene todas las variables definidas

---

## BLOQUE B — Seguridad Alta (Antes del próximo cliente real)

| ID | Archivo | Acción concreta |
|----|---------|-----------------|
| SEC-06 | `src/utils/supabase.ts:150` | Agregar validación de longitud en frontend: `authorName` max 80 chars, `comment_text` max 500 chars. Verificar que RLS esté activado en Supabase para `public_comments`. |
| HARD-01 | `.env.example` | Reescribir con todas las variables reales del proyecto: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PASSWORD`, `VITE_GOOGLE_CLIENT_ID`, `VITE_AUTHORIZED_EMAILS`, `VITE_GEMINI_API_KEY`. |
| HARD-02 | `src/utils/supabase.ts:11-12` | Reemplazar fallback `"placeholder_key"` por error explícito si faltan las vars de entorno. |

**Criterio de cierre del bloque B:**
- `.env.example` actualizado y revisado
- Comentarios públicos tienen validación de longitud visible en UI
- Confirmación manual de RLS activo en Supabase dashboard

---

## BLOQUE C — Deuda Técnica y Tipado (Siguiente ola de calidad)

| ID | Archivo | Acción concreta |
|----|---------|-----------------|
| TYPE-01 | `src/utils/supabase.ts` | Generar tipos Supabase con `supabase gen types typescript`. Reemplazar todos los `(p: any)`, `(session: any)`, `(c: any)` con tipos generados. |
| TYPE-02 | `src/utils/supabase.ts:85-87` | Crear tipo `PhotoPayload` sin `sortOrder` ni `status`. Eliminar los dos `@ts-ignore`. |
| TYPE-04 | `src/utils/db.ts` | Eliminar `db.ts` (código muerto, IndexedDB ya no se usa). Registrar eliminación en git con mensaje claro. |

**Criterio de cierre del bloque C:**
- Cero `@ts-ignore` en `supabase.ts`
- `db.ts` eliminado del árbol activo
- `npm run lint` sin errores

---

## BLOQUE D — Arquitectura Frontend (Refactor estructural)

| ID | Archivo | Acción concreta |
|----|---------|-----------------|
| TYPE-03 | `src/App.tsx:202` | Eliminar `handleClientFeedbackSubmit` (función zombi vacía). |
| ARCH-03 | `src/App.tsx:136` | Reemplazar `CustomEvent("show-toast")` por un contexto React `ToastContext` o hook `useToast()`. |
| ARCH-01 | `src/App.tsx` | Extraer lógica en custom hooks: `useAuth()`, `usePortfolioData()`, `useToast()`. Reducir `App.tsx` a orquestador puro (<150 líneas). |
| ARCH-02 | `src/components/dashboard/DashboardGallery.tsx` | Vigilar: está en 499 líneas. Al siguiente cambio funcional, extraer sub-componente. |

**Criterio de cierre del bloque D:**
- `App.tsx` bajo 200 líneas
- Sin `CustomEvent` global
- `npm run lint` + `npm run build` sin errores

---

## ORDEN DE EJECUCIÓN

```
BLOQUE A  →  BLOQUE B  →  BLOQUE C  →  BLOQUE D
(crítico)     (alto)        (deuda)      (arquitectura)
```

Los bloques A y B deben ejecutarse en la misma sesión.
Los bloques C y D pueden ejecutarse en olas separadas.

---

## PROTOCOLO DE CIERRE POR BLOQUE

1. Ejecutar `npm run lint` y `npm run build`
2. Verificar visualmente en `localhost:5173`
3. Crear restore point: `npm run restore:point -- "auditoria-bloque-X-FECHA"`
4. Actualizar `ops/PENDIENTES.md` marcando ítems completados

---

## ESTADO INICIAL

- Bloque A: ⬜ Pendiente
- Bloque B: ⬜ Pendiente
- Bloque C: ⬜ Pendiente
- Bloque D: ⬜ Pendiente

---

_Generado por auditoría externa RUFLO + Claude — 2026-05-29_
_© 2026 Nodo AI Agency — https://www.nodoai.co_
