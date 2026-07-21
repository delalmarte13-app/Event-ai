# EventAI - Instrucciones para Siguiente Equipo de Manus

## 📋 Estado Actual (v11.0)

**Aplicación completamente funcional** con:
- ✅ Autenticación OAuth (Manus)
- ✅ Crear eventos con código de invitación único
- ✅ Galería compartida (fotos/videos en tiempo real)
- ✅ Chat en tiempo real entre participantes
- ✅ Edición de fotos con IA (Gemini)
- ✅ Generación de videos narrativos con IA (OpenAI)
- ✅ Compartir eventos por WhatsApp
- ✅ Cámara en vivo (foto/video)
- ✅ Diseño moderno (azul profundo + púrpura + dorado)
- ✅ 14 tests pasando
- ✅ TypeScript sin errores

**Dominio**: `eventai-bc5v85kn.manus.space`

---

## 🎯 Próximas Prioridades (Roadmap)

### Fase 1: Monetización (2-3 días)
**Objetivo**: Implementar sistema de pagos para generar ingresos

1. **Integración Stripe**
   ```bash
   webdev_add_feature --feature=stripe
   ```
   - Crear tabla `subscriptions` en `drizzle/schema.ts`
   - Planes: Free ($0), Pro ($4.99/mes), Enterprise ($19.99/mes)
   - Webhook para confirmar pagos

2. **Feature Gating por Tier**
   ```typescript
   // server/db.ts
   export async function requireTier(userId: string, minTier: 'free' | 'pro' | 'enterprise') {
     const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
     if (!user?.tier || tierLevel[user.tier] < tierLevel[minTier]) {
       throw new TRPCError({ code: 'FORBIDDEN' });
     }
   }
   ```
   - Free: 3 eventos, 50 fotos
   - Pro: 20 eventos, 500 fotos
   - Enterprise: Ilimitado

3. **Marketplace de Profesionales** (comisión 10%)
   - Tabla `professional_profiles` con rating
   - Búsqueda filtrada por especialidad
   - Sistema de reseñas

### Fase 2: Flujo de Invitados (1-2 días)
**Objetivo**: Permitir participar sin crear cuenta

1. **Tabla `guest_sessions`**
   ```sql
   CREATE TABLE guest_sessions (
     id VARCHAR(255) PRIMARY KEY,
     eventId INT NOT NULL,
     inviteCode VARCHAR(10) NOT NULL,
     expiresAt TIMESTAMP NOT NULL,
     createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Página `/join?code=XYZ`**
   - Validar código
   - Crear sesión temporal
   - Acceso a galería y chat sin login

### Fase 3: Notificaciones en Tiempo Real (2-3 días)
**Objetivo**: Alertas cuando se suben fotos o hay mensajes

1. **WebSocket Server**
   ```typescript
   // server/_core/websocket.ts
   import { WebSocketServer } from 'ws';
   
   const wss = new WebSocketServer({ noServer: true });
   // Broadcast cuando se sube foto: { type: 'photo', eventId, userId }
   ```

2. **Cliente WebSocket**
   ```typescript
   // client/src/hooks/useEventNotifications.ts
   export function useEventNotifications(eventId: number) {
     useEffect(() => {
       const ws = new WebSocket(`wss://...`);
       ws.onmessage = (e) => {
         const { type, data } = JSON.parse(e.data);
         if (type === 'photo') toast.success('Nueva foto!');
       };
     }, [eventId]);
   }
   ```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
pnpm dev          # Inicia servidor dev
pnpm test         # Ejecuta tests
pnpm build        # Build producción

# Base de datos
pnpm drizzle-kit generate  # Genera migraciones
pnpm drizzle-kit studio    # UI para ver BD

# Deployment
webdev_save_checkpoint     # Guarda versión
webdev_rollback_checkpoint # Revierte cambios
```

---

## 📁 Estructura Clave

```
client/src/
  ├── pages/
  │   ├── Home.tsx          # Landing page
  │   ├── Events.tsx        # Listado de eventos
  │   ├── CreateEvent.tsx   # Crear evento
  │   ├── EventDetail.tsx   # Detalle + galería + chat
  │   └── JoinEvent.tsx     # Página de invitación
  ├── components/
  │   ├── AppLayout.tsx     # Layout principal
  │   ├── EventGallery.tsx  # Galería compartida
  │   ├── AIChatBox.tsx     # Chat en tiempo real
  │   └── CameraCapture.tsx # Cámara en vivo
  └── lib/
      ├── trpc.ts          # Cliente tRPC
      └── whatsapp.ts      # Utilidades WhatsApp

server/
  ├── routers.ts           # Procedimientos tRPC
  ├── db.ts                # Helpers de BD
  └── _core/
      ├── llm.ts           # Integración IA (Gemini/OpenAI)
      ├── oauth.ts         # Autenticación
      └── context.ts       # Contexto tRPC

drizzle/
  └── schema.ts            # Esquema BD (tablas)
```

---

## 🚀 Pasos para Continuar

1. **Clonar proyecto**
   ```bash
   gh repo clone delalmarte13-app/Event-ai
   cd Event-ai
   pnpm install
   ```

2. **Configurar variables de entorno**
   - `MONGODB_URI` - Base de datos
   - `GEMINI_API_KEY` - IA para fotos
   - `OPENAI_API_KEY` - IA para videos
   - `VITE_APP_ID` - OAuth Manus

3. **Iniciar desarrollo**
   ```bash
   pnpm dev
   # Abre http://localhost:5173
   ```

4. **Implementar Fase 1 (Stripe)**
   - Crear tabla subscriptions
   - Agregar botón "Upgrade" en Settings
   - Webhook de Stripe
   - Limitar features por tier

---

## 💡 Notas Importantes

- **Tokens**: Usa `webdev_save_checkpoint` frecuentemente (cada 30 min)
- **Tests**: Escribe tests antes de features (vitest)
- **Diseño**: Mantén paleta actual (azul 250 84% 54%, púrpura 280 85% 56%, dorado 38 92% 50%)
- **Errores**: Revisa `.manus-logs/devserver.log` para debugging
- **GitHub**: Haz push después de cada checkpoint importante

---

## 📞 Contacto

Si necesitas ayuda:
1. Revisa `CONTINUITY.md` para contexto histórico
2. Revisa `ROADMAP.md` para visión de producto
3. Ejecuta `pnpm test` para verificar estado
4. Revisa logs: `tail -50 .manus-logs/devserver.log`

**¡Éxito con EventAI! 🎉**
