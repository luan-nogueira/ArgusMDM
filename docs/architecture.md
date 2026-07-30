# Arquitetura

## Backend (Clean Architecture)

```
backend/src/main/java/com/tactio/mdm/
├── domain/        entidades JPA, enums, repositórios (interfaces Spring Data)
├── application/    DTOs, mappers, use cases — a lógica de negócio propriamente dita
├── api/            controllers REST, WebSocket, exception handling — a "porta de entrada"
├── security/       JWT, refresh token, 2FA (TOTP), autenticação de dispositivo por API key
├── infrastructure/ integrações externas: FCM, auditoria (AOP), cache Redis
└── scheduler/       jobs periódicos (detecção de dispositivo offline)
```

Fluxo de uma requisição típica: `Controller` (api) → `UseCase` (application) →
`Repository` (domain) → banco. Os `Controller`s nunca acessam repositórios
diretamente nem contêm lógica de negócio — isso mantém a camada de API fina e a lógica
testável isoladamente (veja `src/test/java/.../unit`).

### Modelo de dados

Entidades principais e relacionamentos (ver migrações Flyway em
`backend/src/main/resources/db/migration` para o schema exato):

- `User` (ADMIN/SUPERVISOR/OPERATOR) → `RefreshToken`, `AuditLog`
- `Device` → `Department`, `Tag` (N:N), `LocationHistory`, `InstalledApp`,
  `DeviceMetric`, `PolicyAssignment`
- `Policy` → `PolicyAssignment` (aplicável a Device, Department ou Tag)
- `Geofence` (N:N com `Device`) → `GeofenceEvent`
- `Alert` — gerado pelo scheduler (offline, bateria baixa) ou por eventos de geofence

### Segurança

Dois esquemas de autenticação distintos, roteados por prefixo de URL:

- `/api/v1/**` (exceto `/sync`) — JWT de usuário humano (access + refresh token),
  emitido em `/api/v1/auth/login`. 2FA opcional via TOTP.
- `/api/v1/sync/**` — API key de dispositivo, enviada nos headers `X-Device-Id` /
  `X-Device-Key`. A chave só é exibida uma vez, no momento da criação do dispositivo
  (o backend guarda apenas o hash).

## App Android (MVVM)

```
android/app/src/main/kotlin/com/argusmdm/agent/
├── di/          módulos Hilt (rede, banco, escopo de coroutine)
├── data/
│   ├── local/     Room (fila de localização offline) + DataStore (credenciais)
│   └── remote/    Retrofit + DTOs, espelhando /api/v1/sync/** do backend
├── policy/      DeviceAdminReceiver + DevicePolicyManagerHelper (aplica Policy via DevicePolicyManager)
├── service/     WorkManager (sync periódica) + Foreground Service (localização)
└── ui/           Compose: provisionamento → permissões → dashboard
```

O app nunca coleta em segredo: o Foreground Service de localização mantém uma
notificação permanente enquanto ativo, e a tela de permissões explica cada uma antes
de solicitá-la. Políticas (bloqueio de câmera, senha mínima, restrição de instalação
de apps etc.) chegam do backend via `GET /api/v1/sync/policy` e são aplicadas
localmente através do `DevicePolicyManager` — só funcionam se o app for o Device
Owner do aparelho.

## Painel Web (React)

SPA com React Router para navegação, React Query para cache/sincronização de dados
com a API (revalidação automática, estados de loading/erro), Tailwind + componentes
no estilo shadcn/ui para a UI, e um cliente STOMP sobre SockJS (`src/lib/ws-client.ts`)
para atualizações em tempo real de localização e alertas — consumido via o hook
`useStompTopic`.
