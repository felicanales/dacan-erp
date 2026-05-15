# 📑 Seguridad en la Cadena de Suministro y Vulnerabilidades Next.js (2025–2026)

## 1. Contexto General

La cadena de suministro de software basada en **NPM** y frameworks como **Next.js** sigue siendo un vector crítico de ataque. Los incidentes recientes (2025–2026) han demostrado que:

- Los atacantes apuntan a dependencias populares con millones de descargas.
- La velocidad y escala de propagación hacen imposible responder manualmente.
- La visibilidad centralizada de dependencias es clave para mitigar riesgos.

---

## 2. Ataques en la Cadena de Suministro (ArmorCode)

### 🚨 Caso Axios – Marzo 2026

- **Paquete afectado:** `axios` (100M descargas semanales).
- **Actor:** Grupo vinculado a Corea del Norte.
- **Técnica:** Dependencia oculta que instalaba un **Remote Access Trojan (RAT)** en máquinas de desarrollo y pipelines CI/CD.

### 🪱 Caso Shai-Hulud – Otoño 2025

- **Vector:** Cuentas de mantenedores NPM comprometidas.
- **Impacto:** Infección de cientos de paquetes mediante un **worm auto-replicante**.
- **Problema principal:** Escala y velocidad de aparición de paquetes comprometidos cada pocas horas.

### 🔑 Lecciones Aprendidas

- **Visibilidad inmediata:** Inventario de dependencias actualizado y escaneado continuamente.
- **Herramientas críticas:** Uso de **ArmorCode Supply Chain Security Module** para correlación rápida y reducción de tiempos de investigación de días a horas.
- **Protecciones efectivas:**
  - Lockfiles que fijan versiones específicas.
  - Políticas CI/CD que bloquean scripts automáticos.

---

## 3. Vulnerabilidades Next.js – Mayo 2026 (Vercel)

### 📌 Áreas afectadas

1. **Middleware y Proxy Bypass**
   - Bypass de autorización en `middleware.js` y `proxy.js`.
   - Segment-prefetch y rutas dinámicas manipuladas.
   - Riesgo: **Autenticación rota**.

2. **Denegación de Servicio (DoS)**
   - **CVE-2026-23870** en React Server Components.
   - Explotación de **Cache Components** y API de optimización de imágenes.
   - Riesgo: **Exhaustión de conexiones**.

3. **Server-Side Request Forgery (SSRF)**
   - Aplicaciones que manejan **WebSocket upgrades** vulnerables.
   - Riesgo: **Acceso no autorizado a recursos internos**.

4. **Cache Poisoning**
   - Respuestas de React Server Components manipuladas.
   - Colisiones en mecanismos de cache-busting.
   - Riesgo: **Datos corruptos en caché compartida**.

5. **Cross-Site Scripting (XSS)**
   - Uso inseguro de **CSP nonces** en App Router.
   - Scripts `beforeInteractive` con input no confiable.
   - Riesgo: **Ejecución de código malicioso en cliente**.

### 🛠️ Resolución

- **Mitigación única:** Actualizar a versiones parcheadas:
  - Next.js → `15.5.18` y `16.2.6`.
  - React → `19.0.6`, `19.1.7`, `19.2.6`.
- **Nota:** No existen reglas WAF capaces de bloquear estos vectores.

---

## 4. Recomendaciones Estratégicas

- **Visibilidad continua:** Mantener inventario actualizado de dependencias y correlación automática de vulnerabilidades.
- **Automatización:** Integrar herramientas como ArmorCode en flujos de CI/CD y ticketing.
- **Políticas de seguridad:**
  - Uso obligatorio de lockfiles.
  - Restricción de scripts automáticos en pipelines.
- **Actualización inmediata:** Aplicar parches de seguridad en Next.js y React sin demora.
- **Preparación ante incidentes:** Responder en horas, no días, para evitar escaladas.

---

## 5. Conclusión

Los ataques de cadena de suministro en NPM y las vulnerabilidades críticas en Next.js demuestran que:

- La **respuesta rápida** y la **visibilidad unificada** son la diferencia entre un incidente controlado y un desastre.
- La inversión en herramientas de seguridad y procesos automatizados es esencial para proteger aplicaciones modernas a gran escala.
