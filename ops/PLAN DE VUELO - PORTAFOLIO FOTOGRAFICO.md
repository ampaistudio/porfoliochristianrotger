# PORTAFOLIO FOTOGRÁFICO - Plan de Vuelo v4.0

## 1. Proposito

Este documento define las reglas operativas, tecnicas y de cierre para el proyecto `PORTAFOLIO FOTOGRAFICO - premium interactive platform`.
Su objetivo es reducir ambiguedad, evitar desalineacion entre agentes y mantener una unica referencia ejecutiva para trabajar dentro del repositorio.

## 2. Autoridad y Alcance

- Proyecto liderado por Christian Rotger bajo NODO AI AGENCY.
- Este archivo aplica al repositorio completo ubicado en:
  `/Users/christia/Documents/CEREBRO DIGITAL /03_EMPRESAS/04-CHRIS EXPEDITION GUIDE-04/PORFOLIO/portfolio-de-fotografía-profesional`
- Este proyecto es un compartimiento estanco. No debe mezclar decisiones, codigo ni contexto operativo con otros proyectos.
- Ante dudas de estandares generales, consultar:
  `/Users/christia/Documents/CEREBRO DIGITAL /02_PROYECTOS/01-NODO AI AGENCY/1-CORE`
- `1-CORE/*` es el marco superior de gobernanza para agentes, auditoria, calidad, seguridad y criterio operativo transversal.
- Este `Plan de Vuelo` define la adaptacion local del proyecto y no debe contradecir `1-CORE/*`.
- Toda operacion del proyecto por fuera de este `Plan de Vuelo` debe igualmente respetar `1-CORE/*`.

## 3. Centralizacion Operativa

- Toda la documentacion operativa interna debe vivir dentro de `ops/*`.
- Queda prohibido volver a dispersar `PENDIENTES`, `PLANES DE ACCION`, `RESTORE POINTS`, walkthroughs, auditorias operativas o notas de sesion en la raiz o dentro de `docs/*`.
- `docs/*` queda reservado para documentacion funcional, tecnica o de decision que forme parte estable del producto.
- La carpeta `ops/*` existe para acelerar la operacion y mantener este material fuera del flujo visible del producto.
- Al pasar a produccion, el contenido operativo debe poder excluirse, archivarse o retirarse sin afectar la aplicacion.
- El archivo activo de pendientes sera unico:
  `ops/PENDIENTES.md`
- Desde la creación del proyecto, todo restore point nuevo debe guardarse unicamente en `ops/restore-points/*`.
- No deben crearse multiples archivos `PENDIENTES_*` salvo archivo historico aprobado explicitamente.

## 4. Lectura Minima Obligatoria

Toda IA o agente que retome este proyecto debe leer, en este orden:

1. `ops/PLAN DE VUELO - PORTAFOLIO FOTOGRAFICO.md` (Este documento)
2. `ops/PENDIENTES.md`
3. plan canonico de la ola vigente o del bloque vigente:
   - `implementation_plan.md` (Plan Mega-Kaizen actual)
4. ultimo restore point validado en `ops/PENDIENTES.md`
5. `ops/KAIZEN.md` para entender el roadmap de mejoras.

### Regla de continuidad operativa

- Leer solo `Plan de Vuelo` no alcanza para ejecutar.
- Toda continuidad de trabajo requiere leer tambien el `Implementation Plan` vigente antes de tocar codigo o declarar el siguiente paso.
- El `Implementation Plan` vigente define alcance, fases, tiempos, entregables y criterio de cierre del bloque actual.

Este documento es la fuente de verdad del contexto variable del proyecto (stack, hosting, notas operativas).

## 5. No Negociables

- La aplicación principal vive en la raíz (`src/`) y es la unica implementacion productiva activa.
- No hardcodear secretos, tokens o credenciales.
- Toda `API key` (ej. Supabase, Gemini), token, secreto o credencial operativa debe inyectarse vía `.env`.
- Si una superficie puede verse localmente, debe priorizarse siempre la validacion local (servidor de desarrollo `Vite`) antes que depender de servicios remotos, a excepción de las bases de datos en la nube como Supabase.
- Ningún archivo de código de desarrollo (ej. `.ts`, `.tsx`, `.css`) debe superar las 500 líneas.
- Todo cambio con impacto funcional debe validar al menos tipado (`npm run lint`) y build (`npm run build`).
- Toda documentacion operativa interna debe centralizarse en `ops/*`.
- Branding de `Nodo Ai Agency` obligatorio segun este documento.
- Todo agente debe trabajar guiado por `1-CORE/*` y por este `Plan de Vuelo`, en ese orden de jerarquia.

## 6. Estado Canonico del Proyecto

- Aplicacion oficial activa en `src/*` (React + Vite).
- `ops/restore-points/*` conserva copias historicas seguras del proyecto.
- Todo cambio productivo de interfaz o logica principal de negocio debe implementarse en `src/`.

## 7. Vision Operativa

- Carga rapida y experiencia estable (Optimización LCP).
- Seguridad alta por defecto.
- Diseno cuidado, consistente y listo para presentacion premium a clientes externos.
- Codigo mantenible, auditable y preparado para evolucionar sin deuda innecesaria.

## 8. Rol de Arquitectura y Criterio de Diseno

### 8.1 Rol

Toda IA o agente que trabaje sobre este proyecto debe asumir, por defecto, el rol combinado de:
- `Principal Product Architect`
- `Frontend Architect`
- `UX Director`
- `Backend Architect`

El criterio esperado es senior, con foco en productos digitales premium, escalables, mantenibles y comercialmente viables.
Para control de ejecucion y cierre, este proyecto reconoce explicitamente:
- `ROL 1`: Ejecutor (Antigravity/IA)
- `ROL 2`: Auditor (Christian Rotger)

`ROL 2` toma como referencia la carpeta `1-CORE` y obliga a verificar consistencia, riesgos, deuda visible y estado real del proyecto antes de declarar un ciclo como cerrado.

### 8.2 Capacidades Esperadas

Este rol implica criterio experto sobre:
- Arquitectura web moderna (React 18, Vite).
- TailwindCSS y diseño UI/UX premium minimalista.
- Backend escalable y mantenible (Supabase, PostgreSQL).
- Integración de IA Generativa (Gemini 1.5 Flash).
- Sistemas de aprobación B2B/B2C interactivos.

### 8.3 Objetivo de Trabajo

Toda intervencion debe pensar el sistema como un negocio real y no como una demo. La meta es disenar la mejor arquitectura para un producto digital de portafolio premium.

### 8.4 Marco de Analisis

Cuando se evalua una idea, feature, modulo o cambio, debe analizarse al mismo tiempo como:
- arquitectura de software
- producto y UX
- escalabilidad comercial

### 8.5 Condiciones Obligatorias

Toda respuesta, recomendacion o implementacion debe:
- priorizar mantenibilidad, claridad y escalabilidad
- evitar soluciones de demo o atajos
- reducir deuda tecnica innecesaria

### 8.6 Uso como Contexto Persistente

Este bloque funciona como contexto estrategico persistente del proyecto. Evita que futuras IAs tengan que reconstruir desde cero el nivel de exigencia arquitectonica.

## 9. Stack Tecnologico Actual

### 9.1 Web

- `React 18`
- `Vite`
- `TypeScript`
- `TailwindCSS`
- `Lucide React`

### 9.2 Backend y Datos

- `Supabase`
- `PostgreSQL` (Cliente asíncrono para persistencia total)

### 9.3 Contratos y Validacion

- `TypeScript` estricto en `src/types.ts`

### 9.4 Testing y Calidad

- `ESLint`
- `TypeScript` estricto (noEmit)

### 9.5 Observabilidad y Analytics

- Ninguno activo actualmente. Consola de desarrollo (dev tools).

### 9.6 Hosting y Billing

- `Vercel` (Producción)
- Gratuito (Vercel Free Tier, Supabase Free Tier)

## 10. Matriz de Estado del Proyecto

### 10.1 Activo

- `src/components/`
- `src/utils/`
- `ops/` para operacion interna

### 10.2 Opcional o Preparado

- `Gemini 1.5 Flash` (Integración IA inminente)
- `Supabase Realtime`

### 10.3 Historico

- `ops/restore-points/*`

### 10.4 Prohibido

- Crear archivos de más de 500 líneas.
- Dejar secretos en texto plano en el repositorio.

## 11. Decisiones de Producto Vigentes

- El producto opera como un Portafolio fotográfico premium y plataforma de aprobación interactiva.
- Mantiene dos modos de vista: `Photographer Dashboard` (Admin) y `Client Portfolio View` (Público).
- La Fase 2 de migración de datos locales (IndexedDB) a Supabase (PostgreSQL) está completada de forma nativa.
- El despliegue opera sobre Vercel y Supabase.
- Integrará próximamente un asistente editorial de IA para metadatos EXIF.

## 12. Responsabilidad por Carpetas

- `src/components/dashboard`: Panel de administración exclusivo para el fotógrafo.
- `src/components/client`: Vistas limpias y bloqueadas exclusivas para clientes externos.
- `src/utils/`: Lógica de clientes de BD (Supabase) y helpers (exif, imagen).
- `ops/`: Operacion interna, planes, pendientes, restore points y auditoria.

## 13. Reglas de Ingenieria

### 13.1 Tipado y Contratos
- No usar `any` salvo justificacion excepcional. Validar interfaces en `src/types.ts`.

### 13.2 Seguridad
- Nunca hardcodear secretos. Toda credencial debe ingresar por variables de entorno `.env`.

### 13.3 Arquitectura
- Separar la logica por dominios funcionales.
- Evitar archivos de más de 500 líneas.

### 13.4 Frontend
- Componentes minimalistas alineados al branding de agencia premium.

### 13.5 Cambios con Riesgo
- Todo cambio en autenticación o Supabase debe probarse cuidadosamente.

### 13.6 Calidad Minima Antes de Cerrar
- `npm run lint`
- `npm run build`

## 14. Reglas de Operacion para Agentes

- Trabajar con foco en produccion, sin ruido innecesario.
- Evitar cambios fuera del alcance del pedido.
- No revertir trabajo ajeno sin autorizacion explicita.
- Documentar cualquier decision no obvia que cambie el comportamiento del sistema.

## 15. Branding Obligatorio

- El proyecto debe incluir la marca `Nodo Ai Agency`.
- Debe incluir referencia visible a `www.nodoai.co`.
- La leyenda `Powered by Nodo Ai Agency` debe ser visible, sutil y elegante.

## 16. Protocolo de Decisiones

- Toda decision estructural debe quedar en un documento trazable.
- Si la decision es operativa, vive en `ops/`.
- Prevalece la decisión documentada más reciente.

## 17. Scripts Operativos

Desde la raiz del proyecto:
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run restore:point -- "nombre-del-checkpoint"`

## 18. Revision Local Rapida

- Levantar servidor de Vite (`npm run dev`).
- Probar vista local: `http://localhost:5173/`
- Probar vista cliente: `http://localhost:5173/?view=client`

## 19. Capacidades Reusables Activas

- Galería interactiva con EXIF parsing.
- Slideshow inmersivo.
- Sistema de feedback en tiempo real.

## 20. Acceso Demo Local

- No aplicable con servidores remotos; todo se prueba contra el Vercel / Supabase vivo desde `localhost:5173`.

## 21. Variables de Entorno

- Ver `.env.example` en la raíz (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).

## 22. Protocolo de Cierre de Sesión

1. Auditar el estado real del proyecto con criterio de `ROL 2: Auditor`.
2. Revisar cambios, riesgos, y consistencia general.
3. Actualizar `ops/PENDIENTES.md` con fecha y hora por ítem.
4. Crear el restore point final de la sesión ejecutando el script.
5. Cerrar la sesión con trazabilidad.

## 23. Condiciones obligatorias

- No se considera cerrada una sesión si `ops/PENDIENTES.md` no fue auditado y actualizado.
- No se considera cerrada una sesión si falta el restore point final.

## 24. Restore Points

### Formato obligatorio
El nombre de todo restore point DEBE seguir este formato exacto:

```
<descriptor-kebab-case>-<YYYYMMDD>_<HHMM>
```

Ejemplos válidos:
- `fase2-supabase-completada-20260528_1131`
- `auditoria-bloque-a-20260529_0936`
- `fix-routing-20260528_2130`

### Reglas
- La fecha y hora son **obligatorias** — un restore point sin timestamp no es válido.
- Todos deben vivir dentro de `ops/restore-points/*`.
- El timestamp evita colisiones entre sesiones y permite ordenar cronológicamente sin ambigüedad.
- Todo restore point de cierre de sesión debe dejar constancia de que los PENDIENTES fueron revisados y actualizados.
- Usar siempre hora local del sistema al momento de la creación.

## 25. Pendientes

- Existe un unico archivo activo de pendientes: `ops/PENDIENTES.md`.
- Cada item debe incluir fecha y hora.
- Todo pendiente completado conserva su marca temporal de cierre.

## 26. Definition of Done

Una tarea se considera cerrada cuando:
- resuelve el objetivo pedido
- `lint` no introduce errores nuevos
- `build` no introduce errores nuevos
- no hay regresion visual obvia

## 27. Core Reusable y Verticales Reusables

(Adaptado para el marco general de Nodo)

### 27.1 Separacion obligatoria de capas
Distinguir el *core reusable* del *vertical activo*.

### 27.2 Cierre reusable de olas
Toda ola debe pasar por validacion, smoke test, restore point, auditoria.

### 27.3 Procedimiento canonico de cierre de ola
Proponer `10` mejoras `KAIZEN` y ejecutar solo las aprobadas.

### 27.4 Olas de implementacion vs olas de reconciliacion
Reconocer explícitamente el tipo de ola actual.

### 27.5 Definition of Done reusable
Contratos claros y frontend alineado.

### 27.6 Interno vs publico
Clara separación de `Admin` vs `Cliente Final`.

### 27.7 KAIZEN reusable obligatorio
Mejoras de método bajan a `ops/KAIZEN.md` y a este `Plan de Vuelo`.

## 28. Formato Obligatorio de Cierre de Tarea

Cada cierre de ciclo debe incluir:
- `ESTADO:` `Verde`, `Amarillo` o `Rojo`
- `RESTORE POINT:` identificador o nota de checkpoint cuando aplique
- `PENDIENTES:` referencia al pendiente vigente cuando aplique

## 29. Fuentes de Verdad Relacionadas

- `ops/KAIZEN.md`
- `ops/PENDIENTES.md`
- `implementation_plan.md`

## 30. Versionado del Plan

- `v4.0 - 2026-05-28 - Adaptacion del template canonico de Plan de Vuelo APP ANTARTICA al proyecto PORTAFOLIO FOTOGRAFICO`

## 31. Regla Final

Cuando exista conflicto entre velocidad y claridad, se prioriza claridad.
Cuando exista conflicto entre preferencia y seguridad, se prioriza seguridad.
Cuando exista conflicto entre improvisacion y consistencia canonica, se prioriza la version canonica del proyecto.

## 32. Estado real del proyecto al 2026-05-28 (auditoría transversal)

### 32.1 Snapshot operativo
- **Ola vigente:** Mega-KAIZEN (5 mejoras estructurales).
- **Fase completada:** Migración a Supabase (Fase 2) finalizada con éxito. Persistencia cloud activa.
- **Punto de restauración validado:** `ops/restore-points/fase2-supabase-completada-20260528_113156`.

### 32.2 Bloqueantes vigentes
- Aprobación del `implementation_plan.md` (Mega-Kaizen) pendiente para iniciar Fase A (Husky & 500 lines limit).

## 33. ANEXO A. Olas y Modelos Recomendados

Reglas del anexo:
- `Antigravity / AI` queda como integrador principal del repo, ejecutor de cambios y auditor final de consistencia.
- La meta es mantener el portafolio ultraligero y con cero deuda técnica.

© 2026 Nodo AI Agency ® – https://www.nodoai.co – Powered by Nodo Ai Agency
