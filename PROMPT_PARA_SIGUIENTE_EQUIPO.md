# 🎯 PROMPT PARA SIGUIENTE EQUIPO DE MANUS - EventAI

## Contexto General

EventAI es una **plataforma de eventos con IA** que permite:
- Crear eventos privados/públicos con código de invitación
- Compartir fotos/videos en tiempo real en galería compartida
- Chat en vivo entre participantes
- Edición automática de fotos con IA (Gemini)
- Generación de videos narrativos con IA (OpenAI)
- Compartir eventos por WhatsApp

**Estado**: v11.0 - Completamente funcional en desarrollo
**Repositorio**: https://github.com/delalmarte13-app/Event-ai
**Dominio**: eventai-bc5v85kn.manus.space

---

## 🚀 Misión para Siguiente Equipo

**Objetivo Principal**: Convertir EventAI en un **negocio rentable** implementando:

1. **Sistema de Pagos (Stripe)** - Generar $2,500+ MRR en 6 meses
2. **Flujo de Invitados** - Permitir participar sin crear cuenta
3. **Notificaciones en Tiempo Real** - Mantener usuarios enganchados
4. **Marketplace de Profesionales** - Comisión 10% en servicios

---

## 📋 Checklist de Tareas Prioritarias

### Semana 1: Monetización (CRÍTICO)

- [ ] **Integración Stripe**
  - Ejecutar: `webdev_add_feature --feature=stripe`
  - Crear tabla `subscriptions` en schema
  - Planes: Free ($0), Pro ($4.99/mes), Enterprise ($19.99/mes)
  - Webhook para confirmar pagos
  - Botón "Upgrade" en Settings

- [ ] **Feature Gating por Tier**
  - Función `requireTier()` en server/db.ts
  - Limitar: eventos (3/20/∞), fotos (50/500/∞)
  - Mostrar upgrade prompt cuando se alcanza límite

- [ ] **Tests para Stripe**
  - Test de creación de subscription
  - Test de webhook de pago
  - Test de feature gating

### Semana 2: Flujo de Invitados

- [ ] **Tabla guest_sessions**
  - Campos: id, eventId, inviteCode, expiresAt, createdAt
  - Índices en eventId e inviteCode

- [ ] **Página /join?code=XYZ**
  - Validar código
  - Crear sesión temporal (24h)
  - Acceso a galería y chat sin login
  - Mostrar botón "Crear cuenta" en chat

- [ ] **Tests para invitados**
  - Test de validación de código
  - Test de acceso a galería
  - Test de expiración de sesión

### Semana 3: Notificaciones en Tiempo Real

- [ ] **WebSocket Server**
  - Crear `server/_core/websocket.ts`
  - Broadcast cuando se sube foto: `{ type: 'photo', eventId, userId }`
  - Broadcast cuando se envía mensaje: `{ type: 'message', eventId, userId }`

- [ ] **Hook useEventNotifications**
  - Crear `client/src/hooks/useEventNotifications.ts`
  - Toast cuando llega foto nueva
  - Badge de mensajes no leídos

- [ ] **Tests para WebSocket**
  - Test de conexión
  - Test de broadcast
  - Test de desconexión

---

## 🔑 Puntos Técnicos Clave

### Stack Actual
- **Frontend**: React 19 + Tailwind 4 + tRPC
- **Backend**: Express 4 + tRPC 11
- **BD**: MySQL/TiDB (Drizzle ORM)
- **IA**: Gemini (fotos), OpenAI (videos)
- **Auth**: OAuth Manus
- **Hosting**: Manus (Autoscale)

### Convenciones Importantes
1. **Rutas tRPC**: Todas bajo `/api/trpc`
2. **Validación**: Zod en routers
3. **Errores**: TRPCError con código apropiado
4. **Tests**: Vitest con patrón describe/it
5. **Commits**: Mensajes descriptivos en inglés
6. **Checkpoints**: Cada 30 min de trabajo importante

### Archivos Críticos
- `server/routers.ts` - Lógica de negocio
- `client/src/pages/EventDetail.tsx` - Página principal
- `drizzle/schema.ts` - Modelo de datos
- `client/src/index.css` - Diseño (colores: azul 250 84% 54%, púrpura 280 85% 56%, dorado 38 92% 50%)

---

## 💰 Modelo de Ingresos

### Tiers
| Plan | Precio | Eventos | Fotos | Marketplace |
|------|--------|---------|-------|-------------|
| Free | $0 | 3 | 50 | No |
| Pro | $4.99/mes | 20 | 500 | Sí (comisión 10%) |
| Enterprise | $19.99/mes | ∞ | ∞ | Sí (comisión 5%) |

### Proyección
- Mes 1: 50 usuarios (10% conversion) = $25 MRR
- Mes 3: 500 usuarios (15% conversion) = $750 MRR
- Mes 6: 2,000 usuarios (20% conversion) = $2,500 MRR

---

## 🐛 Bugs Conocidos / Limitaciones

1. **Cámara en navegador**: Requiere HTTPS + permisos del usuario
2. **WhatsApp**: Solo genera enlace (no integración directa)
3. **IA**: Timeout si imagen > 10MB
4. **Chat**: No tiene persistencia de historial (solo sesión actual)

---

## 📚 Documentación Existente

- `NEXT_STEPS.md` - Instrucciones técnicas detalladas
- `CONTINUITY.md` - Contexto histórico del proyecto
- `ROADMAP.md` - Visión de producto a largo plazo
- `.manus-logs/devserver.log` - Logs de desarrollo

---

## 🎓 Cómo Empezar

1. **Clonar y setup**
   ```bash
   gh repo clone delalmarte13-app/Event-ai
   cd Event-ai
   pnpm install
   pnpm dev
   ```

2. **Verificar estado**
   ```bash
   pnpm test  # Debe pasar 14 tests
   ```

3. **Crear rama de trabajo**
   ```bash
   git checkout -b feature/stripe-integration
   ```

4. **Implementar Stripe**
   - Leer `NEXT_STEPS.md` sección "Fase 1"
   - Ejecutar `webdev_add_feature --feature=stripe`
   - Crear tabla subscriptions
   - Agregar webhook

5. **Guardar progreso**
   ```bash
   webdev_save_checkpoint  # Cada 30 min
   ```

---

## ⚠️ Reglas de Oro

1. **Mantener tests en verde**: 14/14 siempre
2. **Guardar checkpoints frecuentemente**: Cada 30 min
3. **No eliminar código**: Usar rollback si es necesario
4. **Documentar cambios**: Actualizar NEXT_STEPS.md
5. **Probar en navegador**: Antes de hacer commit
6. **Optimizar tokens**: Usar `grep` en lugar de leer archivos grandes

---

## 📞 Recursos

- **Manus Docs**: https://docs.manus.im
- **Stripe Docs**: https://stripe.com/docs
- **tRPC Docs**: https://trpc.io/docs
- **Tailwind 4**: https://tailwindcss.com/docs
- **Drizzle ORM**: https://orm.drizzle.team

---

## 🎯 Éxito

EventAI tiene potencial para ser un **negocio rentable**. El siguiente equipo debe enfocarse en:
1. ✅ Implementar pagos (Stripe)
2. ✅ Reducir fricción (flujo de invitados)
3. ✅ Mantener engagement (notificaciones)
4. ✅ Monetizar profesionales (marketplace)

**¡Adelante con EventAI! 🚀**
