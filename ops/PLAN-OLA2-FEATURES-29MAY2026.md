# PLAN OLA 2 — Features de Producto
**Fecha:** 2026-05-29 | **Estado:** Pendiente ejecución

## Objetivo
Convertir el portafolio de vitrina técnica a herramienta de negocio activa.
Prioridad: experiencia premium + captación de clientes.

---

## Dependencias

```
8 (Supabase Storage) ──► 2 (Thumbnails WebP)
3 (Contacto EmailJS) ──┐
                        ├──► misma cuenta EmailJS / Gmail
7 (Notif email)    ────┘
6 (Links protegidos) ──► nueva tabla Supabase + frontend
5 (PWA)            ──► independiente
9 (Tests Vitest)   ──► independiente
```

---

## Ola 2A — Impacto inmediato (Sesión 1)

### Feature 3 — Formulario de contacto
- Botón "Contratar / Contactar" visible en vista cliente
- Modal con campos: nombre, email, mensaje
- Envío vía **EmailJS** a `rotgerchristian@gmail.com`
- Sin backend — frontend puro
- **Requiere:** cuenta EmailJS + Service ID + Template ID

### Feature 7 — Notificación email al recibir comentario
- Cuando llega un comentario nuevo, dispara email a Gmail
- Misma cuenta EmailJS que el formulario de contacto
- Reemplaza el toast-only actual (solo visible si tenés el panel abierto)

### Feature 2 — Thumbnails WebP (LCP)
- Al subir una foto, generar thumbnail 400px WebP en canvas
- Guardar thumbnail_url separado del url de alta resolución
- Grilla carga thumbnails → slideshow carga full resolution
- Nueva columna `thumbnail_url` en tabla `photos` de Supabase
- **Requiere:** migración SQL en Supabase

---

## Ola 2B — Infraestructura (Sesión 2)

### Feature 8 — Supabase Storage
- Bucket `portfolio-photos` en Supabase Storage
- Upload desde el panel admin directamente (sin URLs externas)
- Retorna URL pública permanente
- Elimina dependencia de Unsplash / URLs de terceros

### Feature 5 — PWA (Offline)
- `manifest.json` con íconos y nombre
- Service Worker para cachear imágenes de Supabase
- El cliente puede revisar fotos sin internet
- Install prompt en mobile

---

## Ola 2C — Features avanzadas (Sesión 3)

### Feature 6 — Links protegidos por proyecto
- Desde el dashboard: crear "Sesión de cliente" con nombre + PIN de 4 dígitos
- Genera URL única: `tudominio.com/?session=abc123`
- El cliente ingresa el PIN para ver su selección específica de fotos
- Nueva tabla `client_sessions` en Supabase
- RLS: solo el dueño del PIN accede

### Feature 9 — Tests Vitest
- Setup Vitest + testing-library
- Tests unitarios: `image.ts` (EXIF parsing)
- Tests unitarios: `useToast`, `useAuth` hooks
- Test de integración: flujo de comentarios

---

## Requisitos previos antes de ejecutar Ola 2A

- [ ] Crear cuenta en **emailjs.com** (gratuito, 200 emails/mes)
- [ ] Conectar Gmail como servicio de envío
- [ ] Crear template de email para contacto
- [ ] Crear template de email para notificación de comentario
- [ ] Copiar: Service ID, Template IDs, Public Key

---

## Criterio de cierre por ola

- `npm run lint` + `npm run build` sin errores
- Verificación manual en `localhost:3000`
- Restore point con timestamp
- Commit + push + deploy Vercel

---

_© 2026 Nodo AI Agency — https://www.nodoai.co_
