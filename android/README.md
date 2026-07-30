# Argus MDM — Agente Android

App Kotlin (MVVM, Hilt, Room, WorkManager, Jetpack Compose/Material 3) que roda no
dispositivo gerenciado, se registra como **Device Owner** e sincroniza localização,
inventário de apps e métricas com o backend Argus MDM.

O dispositivo **sempre** mostra uma notificação permanente informando que está
gerenciado (canal "Dispositivo gerenciado") — não há coleta oculta.

## Instalação simples (sem Device Owner)

Se você não precisa de controle remoto forçado (bloquear câmera, exigir senha,
impedir reset de fábrica) — só localização, inventário de apps e métricas —, dá pra
instalar sem Android Studio, ADB nem deixar o aparelho "limpo":

1. No GitHub, vá em **Actions > Android CI**, abra a run mais recente da branch
   `main` e baixe o artefato **argus-mdm-debug-apk** (arquivo `.zip` com o `.apk`
   dentro).
2. Mande esse `.apk` pro celular por qualquer meio (WhatsApp, Google Drive, cabo).
3. No celular, ao tentar abrir o arquivo, o Android vai pedir pra permitir
   "instalar apps de fontes desconhecidas" pro app usado (Chrome, Arquivos, etc.) —
   permita e instale.
4. Abra o app, cole o ID do dispositivo e a chave de API (gerados no painel web em
   Dispositivos > Novo dispositivo), conceda as permissões pedidas.

Sem o passo de Device Owner, o app roda como um app comum — a tela de permissões e a
sincronização funcionam normalmente, só a aplicação de políticas remotas fica
inativa (fica sem efeito silenciosamente, não trava nada).

Para o controle completo via Device Owner, siga os passos abaixo.

## Pré-requisitos

- Android Studio (Koala ou mais recente) — já traz JDK e Android SDK embutidos
- Um dispositivo Android 8.0+ (API 26+) com depuração USB habilitada, **recém
  formatado/sem conta Google configurada** (Device Owner só pode ser definido antes
  do primeiro login de conta Google no aparelho — se já tiver conta, remova todas as
  contas em Configurações > Contas antes de continuar)
- O backend rodando e acessível pelo celular (mesma rede Wi-Fi, ou backend exposto
  publicamente com HTTPS para uso fora de casa)

## 1. Configurar a URL do backend

Em `app/build.gradle.kts`, o `buildTypes.debug` aponta por padrão para
`http://10.0.2.2:8080/` (loopback do emulador Android para o host). Para testar em um
celular físico na mesma rede Wi-Fi do computador, troque para o IP local da máquina
rodando o backend, por exemplo:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://192.168.0.10:8080/\"")
```

Para builds de `release`, defina a URL pública real (HTTPS) do servidor.

## 2. Build

Abra a pasta `android/` no Android Studio (File > Open) e deixe o Gradle sincronizar,
ou pela linha de comando (com o wrapper gerado pelo próprio Android Studio na primeira
sincronização):

```bash
./gradlew assembleDebug
```

O APK fica em `app/build/outputs/apk/debug/app-debug.apk`.

## 3. Instalar como Device Owner

Como o app é distribuído fora da Play Store (sideload), o caminho mais simples para um
único dispositivo pessoal é via ADB, **antes de configurar qualquer conta Google no
aparelho**:

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell dpm set-device-owner com.argusmdm.agent/.policy.ArgusDeviceAdminReceiver
```

Se o comando `set-device-owner` falhar reclamando de contas existentes, remova as
contas em Configurações > Contas e tente de novo.

## 4. Vincular o dispositivo

1. No painel web (Argus MDM), crie o dispositivo em **Dispositivos > Novo dispositivo**
   — a chave de API só é exibida **uma vez**, nesse momento. Copie o ID do dispositivo
   e a chave.
2. Abra o app no celular. Na tela de vínculo, cole o ID e a chave (ou escaneie um QR
   code no formato `{"deviceId":"...","apiKey":"..."}`, se você gerar um a partir
   desses dados).
3. Conceda as permissões solicitadas (localização, notificações; acesso a uso de apps
   é opcional, mas necessário para o inventário de aplicativos aparecer completo).
4. Pronto — o app passa a sincronizar automaticamente a cada ~15 minutos, e a
   localização é capturada em segundo plano via serviço em primeiro plano (com a
   notificação permanente visível o tempo todo).

## Uso responsável

Este app foi desenhado para gerenciar dispositivos com autorização do proprietário —
seja um parque corporativo de aparelhos ou, no caso de uso pessoal, um dispositivo de
um familiar que sabe e concorda com o monitoramento. O indicador de "dispositivo
gerenciado" é permanente e não pode ser ocultado pelo app.

## Estrutura do módulo

```
app/src/main/kotlin/com/argusmdm/agent/
├── di/              # Módulos Hilt (rede, banco, escopo de coroutine)
├── data/
│   ├── local/         # Room (fila offline) + DataStore (credenciais)
│   └── remote/        # Retrofit + DTOs (espelham /api/v1/sync/** do backend)
├── policy/           # DeviceAdminReceiver + aplicação de políticas via DevicePolicyManager
├── service/          # WorkManager (sync periódica) + Foreground Service (localização)
└── ui/                # Compose: provisionamento, permissões, dashboard
```
