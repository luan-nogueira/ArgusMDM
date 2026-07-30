# Regras específicas do Argus MDM Agent.
# As regras padrão do Android/Compose/Hilt/Room já cobrem a maior parte do necessário.

-keepattributes *Annotation*
-keep class com.argusmdm.agent.data.remote.dto.** { *; }
