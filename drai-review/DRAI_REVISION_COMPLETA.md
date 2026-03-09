# 🏥 DrAI — Revisión Multidisciplinaria Completa (v2)
**Fecha de revisión:** 9 de marzo de 2026
**Branch:** `claude/review-drai-system-yt2xT`
**Datos fuente:** BD de producción DrAI + 10 workflows n8n activos inspeccionados directamente

---

> **Metodología:** Esta revisión se basa en datos extraídos directamente de la base de datos de producción (PostgreSQL), el roadmap completo almacenado en `drai_roadmap`, y los 10 workflows n8n activos con sus nodos contados. No es una revisión teórica.

> **Correcciones importantes respecto a v1:**
> - Telegram **no es** la interfaz principal del producto — es el canal de desarrollo actual. La visión final es web + PWA + WhatsApp + Telegram como canales iguales (Fase 24).
> - Los 129 casos y 44 pacientes son **datos de prueba del autor** — ningún otro médico ha usado el sistema todavía.
> - Existen **10 workflows activos** (836 nodos en total), no los 1-2 que se analizaron en v1.
> - La Fase 20 (Seguridad) es **intencionalmente la última** por decisión de diseño explícita en el roadmap: "construir funcionalidad completa, luego asegurar TODO de una vez". No es un descuido.

---

## Inventario real del sistema al 9 de marzo de 2026

### Workflows activos (10 en total — 836 nodos)

| Workflow | Nodos | Creado | Última actualización | Estado |
|----------|-------|--------|---------------------|--------|
| DrAI - Triage Médico | **233** | Dic 2025 | Mar 9 2026 | ✅ Estable |
| DrAI - Historia Clínica | **171** | Oct 2025 | Mar 9 2026 | ✅ Funcional |
| DrAI - Evoluciones | **139** | Nov 2025 | Mar 9 2026 | 🔄 En desarrollo |
| DrAI - ADMISIONES (Registro Inicial) | **120** | Ene 2026 | Mar 9 2026 | ✅ Estable |
| DrAI - Expediente y Folios | **35** | Nov 2025 | Mar 9 2026 | 🔄 Pendiente revisión |
| DrAI - Pre clasificacion TRIAGE | **23** | Oct 2025 | Mar 9 2026 | ✅ Estable |
| DrAI - Activar o Direccionar ADMISIONES | **16** | Ene 2026 | Mar 9 2026 | ✅ Estable |
| DrAI - TABLERO/Triage Auto-Update | **15** | Nov 2025 | Mar 9 2026 | ✅ Estable |
| DrAI - TABLERO/Admisiones Auto-Update | **15** | Ene 2026 | Mar 9 2026 | ✅ Estable |
| DrAI - TABLERO/Historia Clinica Auto-Update | **15** | Ene 2026 | Mar 9 2026 | ✅ Estable |

### Datos objetivos en base de datos

| Indicador | Valor | Nota |
|-----------|-------|------|
| Casos registrados | 129 | **Todos son pruebas del autor** |
| Pacientes | 44 | **Todos son pruebas del autor** |
| Notas clínicas (HC) | 40 | Datos de prueba |
| Evoluciones inmutables | 27 (100% `is_immutable=true`) | Datos de prueba |
| Incapacidades generadas | 6 | Datos de prueba |
| Usuarios registrados | 3 | Solo el equipo de desarrollo |
| Instituciones activas | 1 (Clínica Primavera) | Configuración real, datos de prueba |
| Chunks RAG ingestados | 1,812,964 | Libros médicos reales |
| Tamaño kb_chunks | 28 GB | |
| Índice HNSW | 11.5 GB — **0 scans registrados** | Requiere verificación |
| RAG on-topic eval | 14.9% (309/2,075) | Última eval: Oct 2025 |
| Buffer cache tablas | 84.4% (umbral: 95%) | Por debajo del óptimo |
| Réplicas de BD | **0** | SPOF actual |
| Fases roadmap completas | 8 de 26 | + 2 en desarrollo parcial |

### Estado del roadmap (basado en workflows reales)

```
Fases 0–7   ████████████████████  COMPLETAS
Fase 7.5    ████████████████░░░░  ~80% funcional, refinando
Fase 7.6    ████████░░░░░░░░░░░░  ~40% — workflow existe, revisión post-Evoluciones
Fase 7.7    ██████████████░░░░░░  ~70% — EN DESARROLLO ACTIVO, bugs abiertos
Fase 7.55   ░░░░░░░░░░░░░░░░░░░░  0% pendiente
Fase 8      ░░░░░░░░░░░░░░░░░░░░  0% — CRÍTICA
Fases 9-25  ░░░░░░░░░░░░░░░░░░░░  0%
```

---

## 🏗️ BACKEND ARCHITECT — Informe de Revisión DrAI

### Resumen ejecutivo
DrAI tiene un modelo de datos médico bien diseñado y un stack tecnológico pragmático y adecuado para el contexto de un desarrollador único. Los 10 workflows (836 nodos) sobre PostgreSQL con pgvector, Telegram como canal de desarrollo y Docker Compose forman una arquitectura coherente para la etapa actual. Los problemas críticos son todos de infraestructura, no de diseño: un único VPS sin réplica, el índice HNSW sin uso medido, y n8n compartiendo instancia con el dominio médico. Ninguno es un defecto de diseño — son deuda de infraestructura priorizable.

### Hallazgos positivos

**1. Modelo de datos médico coherente**
- Separación correcta: `patients` / `cases` / `clinical_notes` / `medical_notes` cubre el ciclo completo
- JSONB para campos variables (medicamentos, signos vitales, laboratorios, historial de conversación) es la elección correcta en PostgreSQL
- `unique_case_folio` en `medical_notes` garantiza integridad de foliación a nivel BD
- Catálogos oficiales completos: CIE-10, CUPS, ~9,700 medicamentos POS/No-POS
- Multi-institución modelado desde la Fase 1: `institutions` + `telegram_routing` sin duplicar workflows — diseño escalable

**2. Stack tecnológico correcto para el contexto**
- PostgreSQL + pgvector es la elección estándar para sistemas que necesitan SQL relacional + búsqueda semántica sin introducir una segunda base de datos
- El diseño multi-plataforma futuro (Fase 24) es compatible con la arquitectura actual: n8n como core + API unificada REST/GraphQL es un patrón viable
- Docker Compose + Traefik es infraestructura madura para el volumen actual

**3. Audit trail existe y funciona**
- `audit_log` con 359 registros, múltiples índices por acción/documento/institución
- `medical_notes.is_immutable = true` en el 100% de los registros actuales

**4. Sistema de tableros en tiempo real**
- 3 workflows de auto-update de tableros (Triage, Admisiones, HC Pendientes) son una solución ingeniosa para visibilidad operativa sin un dashboard complejo

### Hallazgos preocupantes / riesgos identificados

**🔴 CRÍTICO — Sin réplica de base de datos**
- Análisis de salud confirma: sin réplicas activas, sin replication slots
- Un VPS único en Hostinger es SPOF para datos con retención legal de 20 años
- Relevancia actual: baja (son datos de prueba). Relevancia al llegar a producción real: inaceptable

**🔴 CRÍTICO — HNSW index: 11.5 GB, 0 scans**
- El índice vectorial `kb_chunks_embedding_hnsw_idx` no registra ningún escaneo en `pg_stat`
- Si PostgreSQL no está usando el HNSW, las búsquedas de similitud coseno sobre 1.8M vectores son costosísimas (sequential scan)
- Posibles causas: configuración de `work_mem`, tipo de operador en el query, o el índice fue creado con parámetros incorrectos

**🔴 CRÍTICO — n8n y DrAI comparten la misma instancia PostgreSQL**
- Tablas de n8n (`execution_entity`, `workflow_entity`, `credentials_entity`) en el mismo schema `public` que las tablas médicas
- Un bug en un workflow puede afectar tablas clínicas sin protección de schema separation
- Las credenciales del sistema están en la misma BD que los datos de pacientes

**🟡 IMPORTANTE — Inmutabilidad solo a nivel de aplicación**
- `is_immutable = true` es un flag — no hay trigger de BD que prevenga UPDATE/DELETE
- Un bug en n8n puede modificar una nota "inmutable"
- Solución: 2 líneas de SQL con un trigger `BEFORE UPDATE OR DELETE`

**🟡 IMPORTANTE — Buffer cache por debajo del umbral**
- Tablas: 84.4% / Índices: 90.7% (umbral recomendado: 95%)
- Con 28 GB de `kb_chunks` en un VPS con RAM limitada, las búsquedas RAG generan I/O constante

**🟡 IMPORTANTE — PDFs almacenados como BYTEA en PostgreSQL**
- `medical_notes` tiene múltiples columnas `bytea` para PDFs (HC, órdenes, labs, incapacidades)
- Esto infla el tamaño de la BD y los backups exponencialmente al aumentar el volumen
- Solución: almacenar en filesystem del VPS o MinIO, guardar solo la ruta en BD

**🟠 MENOR — 10 índices duplicados + ~60 índices raramente usados**
- `idx_disabilities_note_id` cubierto por `disabilities_note_id_unique`
- `idx_medical_notes_case_id` cubierto por `unique_case_folio`
- Con el volumen actual esto no impacta rendimiento; sí complica el mantenimiento

### Brechas críticas

1. Sin backup automático verificado para los 28 GB de datos
2. Sin separación de schemas (n8n vs dominio médico)
3. Sin Row Level Security para aislamiento multi-institución a nivel BD (actualmente solo filtrado por `institution_id` en queries)

### Recomendaciones específicas (priorizadas)

1. **(Antes de producción real)** Backup automático diario a storage externo — `pg_dump` a Hetzner Storage Box o similar
2. **(Antes de producción real)** Trigger de BD para inmutabilidad: `BEFORE UPDATE OR DELETE ON medical_notes WHEN (OLD.is_immutable)`
3. **(Investigar ahora)** `EXPLAIN ANALYZE` en una query de búsqueda vectorial para confirmar si se usa el HNSW
4. **(Mediano plazo)** Mover PDFs de `bytea` a filesystem, guardar solo rutas
5. **(Mediano plazo)** Separar schema n8n del schema médico
6. **(Al escalar)** Row Level Security en tablas de pacientes y casos por `institution_id`
7. **(Al escalar)** Streaming replication a segundo VPS

### Veredicto del dominio
**VIABLE CON CONDICIONES** — El diseño de datos es correcto y escalable. Las deudas son de infraestructura, no de arquitectura de datos. El sistema puede continuar en desarrollo sin resolverlas hoy, pero deben estar cerradas antes de incorporar pacientes reales de terceros.

---

## 🤖 AI ENGINEER — Informe de Revisión DrAI

### Resumen ejecutivo
El pipeline RAG de DrAI es arquitectónicamente sofisticado: búsqueda semántica con HNSW, gate de calidad con evaluación `is_on_topic`, coherencia clínica por IA, y validación de prescripciones antes de confirmar. El problema central medido en datos reales es la tasa de on-topic del 14.9% en `rag_gate_eval` y el índice HNSW sin scans registrados — dos señales que requieren investigación antes de confiar en el RAG como respaldo bibliográfico de documentación clínica. La arquitectura es correcta; la calibración necesita atención.

### Hallazgos positivos

**1. Pipeline RAG bien diseñado**
- Cadena `narrativa libre → embedding → pgvector HNSW → gate de calidad → citas bibliográficas` es el patrón correcto
- HNSW es el algoritmo adecuado para ANN search sobre 1.8M vectores: mejor balance velocidad/recall que IVFFlat
- El gate `is_on_topic` es una salvaguarda que pocos sistemas implementan — demuestra pensamiento sistemático sobre calidad

**2. Validación clínica multi-capa**
- `AI ▸ Clinical Coherence Checker` en Evoluciones: valida coherencia entre subjetivo, objetivo y plan
- Validación de prescripciones y laboratorios antes de confirmar — el médico ve warnings antes de firmar
- Búsquedas paralelas sobre CIE-10, CUPS y medicamentos con embeddings en el mismo flujo

**3. Expansión de queries para mejor recall**
- Nodos `Expand CUPS Keywords`, `Function ▸ Build Expanded Queries (RAG)` muestran optimización activa del pipeline
- La deduplicación de chunks (`Deduplicador`) evita citas repetidas del mismo fragmento

**4. Principio de supervisión humana bien aplicado**
- La IA no decide — presenta opciones con justificación bibliográfica para que el médico confirme
- Los warnings de prescripciones, RAG y validaciones llegan al médico antes del guardado definitivo

### Hallazgos preocupantes / riesgos identificados

**🔴 CRÍTICO — RAG on-topic rate: 14.9%**
- De 2,075 evaluaciones en `rag_gate_eval`, solo 309 son `is_on_topic=true`
- Interpretaciones posibles:
  - (a) El criterio de evaluación es demasiado estricto — si así fuera, el gate bloquea demasiados chunks válidos
  - (b) El chunking incluyó contenido no clínico (índices, referencias, apéndices de libros)
  - (c) La búsqueda semántica retorna chunks irrelevantes frecuentemente
- 0 registros `is_blacklisted=true` — el sistema de blacklist existe pero no está filtrando nada
- La última evaluación fue el 2 de octubre de 2025 — hace 5 meses sin monitoreo activo

**🔴 CRÍTICO — HNSW: 11.5 GB, 0 scans**
- Si el índice no se usa, las búsquedas vectoriales hacen sequential scan sobre 1.8M filas de 1,536 dimensiones — potencialmente 30-60+ segundos por consulta
- Esto explicaría por qué el RAG puede ser lento en producción

**🟡 IMPORTANTE — Dependencia exclusiva de OpenAI**
- Un downtime de OpenAI (ocurre 2-4 veces por año) deja el sistema sin capacidad de documentar con asistencia IA
- No hay modo degradado: el médico debería poder documentar manualmente si la IA no está disponible
- Los embeddings fueron generados con un modelo específico — si OpenAI lo depreca, 1.8M chunks requieren re-generación

**🟡 IMPORTANTE — Sin validación post-generación de códigos**
- Los códigos CIE-10 y CUPS generados por IA no se verifican contra los catálogos en BD después de la generación
- Si el modelo alucina un código que no existe, puede guardarse en la historia clínica
- La búsqueda semántica reduce este riesgo pero no lo elimina

**🟡 IMPORTANTE — Sin modelo de embedding registrado**
- `kb_chunks` no tiene campo para registrar qué modelo de embedding generó cada vector
- Imposible hacer migración parcial o verificar consistencia en el futuro

### Brechas críticas

1. Causa del 14.9% on-topic no investigada — puede ser problema de chunking, criterio de evaluación, o búsqueda
2. HNSW sin uso confirmado — el componente más costoso del sistema puede estar inactivo
3. Sin monitoreo continuo del RAG en producción desde octubre 2025
4. Sin modo degradado para downtime de OpenAI

### Recomendaciones específicas (priorizadas)

1. **(Urgente)** Revisar 20-30 chunks off-topic manualmente para entender si el problema es el criterio o el contenido
2. **(Urgente)** `EXPLAIN ANALYZE` en una query de búsqueda vectorial real para verificar uso del HNSW
3. **(Corto plazo)** Post-validación de códigos: verificar que CIE-10/CUPS generados existen en `cie10` y `cups`
4. **(Corto plazo)** Implementar modo degradado: documentación manual sin IA si OpenAI no responde
5. **(Mediano plazo)** Registrar `embedding_model` en `kb_sources` o `kb_chunks` para gestión del ciclo de vida
6. **(Mediano plazo)** Reactivar evaluación RAG con muestra periódica de chunks usados en producción real
7. **(Largo plazo)** Evaluar modelo médico especializado (BioMistral, Meditron) para reducir costos y dependencia al escalar

### Veredicto del dominio
**VIABLE CON CONDICIONES** — La arquitectura del pipeline es correcta y madura para el contexto. Los problemas son de calibración y monitoreo, no de diseño. El HNSW y el on-topic rate son las dos investigaciones prioritarias antes de confiar el RAG en producción clínica real.

---

## 💎 SENIOR DEVELOPER — Informe de Revisión DrAI

### Resumen ejecutivo
836 nodos distribuidos en 10 workflows, todos activos, con nomenclatura consistente y patrones de manejo de errores visibles — esto es ingeniería real, no prototipado. La calidad estructural es notable para un médico autodidacta. Las deudas técnicas más serias son la ausencia de tests automatizados, la lógica de negocio crítica que vive solo en nodos Code de n8n (fuera de git convencional), y una inconsistencia entre la documentación interna y el motor PDF real en uso.

### Hallazgos positivos

**1. Nomenclatura y organización de nodos ejemplar en todos los workflows**
- Prefijos semánticos consistentes: `DB ▸`, `AI ▸`, `CODE ▸`, `TG ▸`, `IF ▸`, `Switch ▸`
- Aplicado consistentemente en los 10 workflows — no es casual, es una convención sostenida
- Facilita debugging visual y onboarding de colaboradores futuros

**2. Complejidad apropiada por responsabilidad**
- Triage Médico (233 nodos): el proceso más complejo del sistema clínico — tiene sentido que sea el workflow más grande
- Historia Clínica (171 nodos): captura SOAP completo con RAG, codificación y generación de PDFs — justificado
- Tableros auto-update (15 nodos cada uno): lightweight, enfocados, correctos
- La distribución de complejidad refleja la complejidad real del dominio

**3. Patrón defensivo consistente**
- `IF ▸ Has Active Draft? → proceso | TG ▸ Error` en cada paso sensible
- Manejo explícito de todos los casos nulos antes de continuar el flujo
- Nodos dedicados `CODE ▸ Escape SQL Values` — conciencia del problema de encoding

**4. Pipeline conversacional SOAP bien modelado**
- Subjetivo → Objetivo → Paraclinicos → Análisis → Plan refleja exactamente el método médico
- Gestión de drafts con `status` en BD permite retomar sesiones interrumpidas — correcto para un sistema de uso clínico donde el médico puede ser interrumpido

**5. Decisión de Telegram como canal de desarrollo: correcta**
- Permite desarrollo y pruebas ágiles sin construir UI
- Los comandos slash (`/evolucion`, `/atender`) funcionan como CLI médica clara
- La arquitectura de n8n como core permite agregar la web, PWA y WhatsApp (Fase 24) sin reescribir lógica de negocio

### Hallazgos preocupantes / riesgos identificados

**🔴 CRÍTICO — Ausencia total de tests automatizados**
- n8n no tiene framework de testing nativo para workflows complejos
- No hay tests unitarios para los nodos Code con lógica crítica: `CODE ▸ Build Assessment + Parse CIE10`, `Code ▸ Validate Prescriptions Logic`, `Code ▸ Check if Evolution Complete`
- En un sistema médico, un bug no detectado en codificación puede guardar el diagnóstico incorrecto en una historia inmutable
- n8n tiene tablas `test_run` y `test_case_execution` en BD — no están siendo usadas

**🔴 CRÍTICO — Lógica de negocio médica fuera de control de versiones convencional**
- Todo el JavaScript de los nodos Code vive en el JSON de n8n, no en un repositorio git con historial, linting, ni revisión de código
- Un refactor visual de workflow puede romper silenciosamente lógica crítica sin dejar rastro
- `n8n export` existe en CLI — los workflows no se están exportando a git todavía

**🔴 CRÍTICO — Inconsistencia documentación vs. código**
- La documentación del sistema indica que se migró a **Gotenberg** para generación de PDFs
- Los workflows reales usan `HTTP Request ▸ WeasyPrint Evolution` y `HTTP Request ▸ WeasyPrint Evolution Preview`
- WeasyPrint y Gotenberg son motores con comportamientos distintos — cualquier colaborador futuro o el propio autor en 6 meses puede tomar decisiones basadas en documentación incorrecta

**🟡 IMPORTANTE — 233 nodos en un solo workflow (Triage Médico)**
- Es el workflow más complejo del sistema — un monolito visual difícil de debuggear
- n8n no tiene debugging de breakpoints para producción
- Sin mecanismo de rollback transaccional: si falla el nodo 200, los 199 anteriores ya ejecutaron
- Candidato para refactoring en sub-workflows cuando se estabilice

**🟡 IMPORTANTE — SQL construido con string interpolation**
- Los nodos `CODE ▸ Escape SQL Values` sugieren que las queries se construyen por concatenación, no con parámetros preparados (`$1, $2`)
- El nodo Postgres de n8n soporta parámetros preparados — es más seguro y elimina la necesidad de escape manual

**🟠 MENOR — Sin monitoring de errores centralizado**
- No hay evidencia de Sentry, alertas, o logging centralizado para errores de producción en workflows
- Los errores hoy se detectan cuando el médico reporta que algo no funcionó

### Brechas críticas

1. Código de negocio no está en git — si el VPS falla, se pierde toda la lógica de los workflows
2. Sin tests — riesgo de regresión silenciosa al modificar workflows grandes
3. Sin monitoring de errores en producción

### Recomendaciones específicas (priorizadas)

1. **(Urgente)** Exportar todos los workflows a git con `n8n export --all --output ./workflows/` — automatizable como cron diario
2. **(Urgente)** Sincronizar documentación con código real — definir cuál es el motor PDF en producción (WeasyPrint) y actualizar todos los documentos
3. **(Corto plazo)** Migrar queries SQL a parámetros preparados en lugar de string interpolation + escape manual
4. **(Corto plazo)** Agregar nodo de error handler en cada workflow crítico con notificación a canal de alertas Telegram (separado del canal médico)
5. **(Mediano plazo)** Dividir Triage Médico (233 nodos) en sub-workflows con `Execute Workflow` cuando se estabilice
6. **(Mediano plazo)** Implementar al menos smoke tests: un workflow de health-check que envíe mensajes de prueba periódicamente y verifique respuestas
7. **(Al escalar)** Extraer lógica de validación crítica (prescripciones, CIE-10, folios) a funciones PostgreSQL — testeables, versionadas, reutilizables desde cualquier canal (Telegram, web, WhatsApp)

### Veredicto del dominio
**VIABLE CON CONDICIONES** — El código existente funciona y la estructura es profesional. La deuda crítica es la ausencia de versionado de workflows y de tests. Mientras el sistema tenga un solo desarrollador y datos de prueba, esto es manejable. En el momento en que haya pacientes reales o un segundo colaborador, se vuelve bloqueante.

---

## ⚖️ LEGAL COMPLIANCE CHECKER — Informe de Revisión DrAI

### Resumen ejecutivo
DrAI tiene la arquitectura legal correcta para cumplir con el marco normativo colombiano: inmutabilidad modelada, foliación consecutiva, autoría identificable, catálogos oficiales completos, y el principio "IA sugiere, médico decide" reduce la exposición por uso de IA asistida. Las brechas actuales son reales pero no son bloqueantes hoy dado que el sistema opera con datos de prueba sin pacientes externos. Serán bloqueantes antes de la primera atención real de un tercero.

### Hallazgos positivos

**1. Inmutabilidad parcialmente implementada**
- `medical_notes.is_immutable = true` en el 100% de los 27 registros actuales
- `unique_case_folio` garantiza integridad de foliación a nivel BD
- `parent_note_id` permite notas aclaratorias encadenadas — exigido por Res. 1995/1999 para correcciones legales

**2. Contenido mínimo de HC cumplido (Res. 1995/1999)**
- `clinical_notes` captura: motivo de consulta, enfermedad actual, revisión de sistemas, examen físico, análisis, plan, medicamentos, signos vitales, laboratorios
- `patients` tiene: CC, nombre, fecha nacimiento, sexo, municipio, contacto de emergencia, grupo sanguíneo
- CIE-10 codificado en cada nota — requisito para RIPS

**3. Audit trail funcional**
- `audit_log` con timestamps, referencia a documentos y acciones, y campo `institution_id`
- `doctor_id` y `doctor_name` registrados en cada nota clínica — requisito de autoría

**4. Marco "IA sugiere, médico decide" correcto**
- Reduce sustancialmente la exposición por decisiones de IA asistida
- Los warnings de RAG, prescripciones y coherencia clínica se presentan al médico antes del guardado
- El documento PDF está firmado conceptualmente por el médico (nombre y registro)

**5. Catálogos oficiales colombianos presentes**
- CIE-10 completo, CUPS, medicamentos POS/No-POS: la base para RIPS está en la BD

**6. Aclaración legal en roadmap Fase 6**
- El roadmap tiene nota explícita: `"⚠️ ACLARACIÓN LEGAL: Este workflow NO clasifica triage médico. Hace PRE-clasificación en sala de espera para ordenar fila de atención. El médico siempre decide."`
- Demuestra conciencia legal activa en el diseño del sistema

### Hallazgos preocupantes / riesgos identificados

**🔴 CRÍTICO — Sin firma digital con validez jurídica colombiana**
- Los PDFs contienen nombre y registro médico como texto, pero no tienen firma electrónica avanzada
- Para validez probatoria plena ante juzgados o auditorías EPS: requieren firma conforme a Ley 527/1999 y Decreto 2364/2012 (Certicámara o Firma Digital Gov.co)
- La Fase 20 tiene este ítem: `"Firma digital (Certicámara/DocuSign, SHA-256, QR)"` — está planificado
- Relevancia actual: baja (datos de prueba). Relevancia antes de primera atención real: bloqueante

**🔴 CRÍTICO — RIPS no implementado**
- El reporte RIPS es obligatorio para toda IPS que preste servicios del SGSSS
- Los archivos AF, US, AC, AP, AM, AT están detallados en la Fase 8 — pendiente crítica
- Sin RIPS: la clínica no puede cobrar a EPS, ni cumplir con reportes a MinSalud
- La estructura de datos para generarlo ya existe (CIE-10, CUPS, `cases`, `patients`, `clinical_notes`)

**🔴 CRÍTICO — Inmutabilidad garantizada solo a nivel de aplicación**
- No hay trigger de BD que prevenga UPDATE/DELETE en notas `is_immutable=true`
- Viola el espíritu de la Res. 1995/1999: la norma exige que sea "imposible" modificar, no solo que "no se modifique en condiciones normales"
- Solución técnica: 2-3 líneas de SQL

**🟡 IMPORTANTE — Sin flujo de consentimiento Habeas Data (Ley 1581/2012)**
- Los datos de salud son "dato sensible" bajo Ley 1581 — requieren consentimiento explícito y separado
- No hay evidencia de: aviso de privacidad para pacientes, autorización explícita, ni procedimiento para derechos ARCO
- La captura de datos vía Telegram complica la cadena de custodia del consentimiento

**🟡 IMPORTANTE — Retención 20 años: sin garantía técnica**
- La Res. 1995/1999 exige custodia mínima de 20 años post-último servicio
- No hay política de backup a largo plazo ni estrategia de archivado cold/historical
- Un VPS de Hostinger puede terminar contrato sin estrategia de archivado

**🟠 MENOR — Consentimientos informados clínicos**
- La Fase 8 incluye `"Consentimientos informados"` como ítem pendiente
- Los procedimientos invasivos y quirúrgicos requieren consentimiento informado documentado
- No es un bloqueo hoy, pero debe estar antes del módulo de Evoluciones con procedimientos invasivos

### Tabla de brechas vs. cumplimiento

| Requisito | Estado | Acción requerida |
|-----------|--------|-----------------|
| Contenido mínimo HC (Res. 1995/1999) | ✅ Cumple | — |
| Inmutabilidad HC | ⚠️ Parcial | Trigger de BD (2-3 líneas SQL) |
| Foliación consecutiva | ✅ Cumple | — |
| Autoría identificable | ✅ Cumple | — |
| Notas aclaratorias | ✅ Modelado | (`parent_note_id`) |
| Firma digital válida | ❌ Pendiente | Fase 20 — planificado |
| RIPS obligatorio | ❌ Pendiente | Fase 8 — planificado |
| Autorización Habeas Data | ❌ No evidenciado | Flujo de consentimiento por paciente |
| Retención 20 años | ⚠️ Sin garantía | Política de backup + archivado |
| Aclaración legal triage | ✅ Documentado | En roadmap, Fase 6 |

### Recomendaciones específicas (priorizadas)

1. **(Antes de primer paciente real)** Trigger de BD para inmutabilidad
2. **(Antes de primer paciente real)** Flujo básico de autorización Habeas Data: capturar y registrar consentimiento al crear paciente
3. **(Fase 8)** RIPS: archivos AC y AT son suficientes para consultas y urgencias como punto de partida
4. **(Fase 20)** Firma digital — Certicámara tiene API. Gov.co tiene opción gratuita para profesionales
5. **(Mediano plazo)** Política documentada de backup con retención de 20 años antes de segunda institución
6. **(Antes de escalar)** Obtener concepto jurídico de abogado especialista en salud digital colombiana

### Veredicto del dominio
**VIABLE CON CONDICIONES** — El sistema tiene la arquitectura legal correcta y los datos necesarios. Las brechas son conocidas y están planificadas en el roadmap. El único riesgo activo hoy es la inmutabilidad sin enforce de BD — el resto puede resolverse en paralelo con el desarrollo de las fases pendientes. Antes de la primera atención real de un tercero, el trigger de inmutabilidad y el flujo de consentimiento son los dos ítems bloqueantes.

---

## 👔 SENIOR PROJECT MANAGER — Informe de Revisión DrAI

### Resumen ejecutivo
DrAI es un proyecto con visión clara, ejecutado con disciplina real: 10 workflows activos (836 nodos), 8 fases completas, sistema funcionando en entorno de desarrollo avanzado — todo construido por un solo médico en paralelo a su práctica clínica. El riesgo de PM principal es la distancia entre el estado actual (Evoluciones en desarrollo) y la primera fase que genera valor económico real (Fase 8: Facturación y RIPS). El roadmap de 26 fases es ambicioso pero coherente — la pregunta es de secuencia, no de viabilidad.

### Hallazgos positivos

**1. Velocidad de entrega real**
- 8 fases completas + 2 en desarrollo parcial en ~5 meses de construcción activa
- 836 nodos de lógica funcionando — no es un esqueleto, es un sistema real
- El autor es simultáneamente el diseñador, desarrollador y el usuario primario — esto elimina el ruido de requisitos

**2. El roadmap tiene secuencia lógica y priorización correcta**
- Las fases 0-7 construyen la base clínica correctamente antes de módulos especializados
- La Fase 8 (Facturación/RIPS) está marcada como CRÍTICA — hay conciencia de dónde está el valor económico
- La Fase 20 (Seguridad) al final es una decisión técnica consciente, no un descuido: "construir funcionalidad completa, luego asegurar TODO de una vez" es un enfoque válido para un solo desarrollador

**3. Modularidad del roadmap facilita priorización**
- Las sub-fases 7.x permiten granularidad sin bloquear el avance
- Fase 24 (Multiplataforma) está correctamente ubicada después de que el core esté estable — no antes
- El hecho de que los canales (Telegram hoy, web/WhatsApp/PWA después) estén separados del core de n8n es correcto arquitectónicamente

**4. Validación real aunque pequeña**
- 129 casos de prueba representan flujos completos que el autor ha ejecutado y corregido
- Los bugs activos en Evoluciones son normales — está en desarrollo activo, no en producción con pacientes

### Hallazgos preocupantes / riesgos identificados

**🔴 CRÍTICO — Bus factor = 1**
- Todo el conocimiento del sistema está en una persona
- Los workflows son el "código" pero no están en git todavía — si el VPS falla, se pierde todo
- Una incapacidad del desarrollador o una interrupción de la práctica clínica paraliza completamente el proyecto

**🔴 CRÍTICO — La Fase 7.6 (Folios) existe parcialmente pero está marcada PENDIENTE**
- Hay 27 `medical_notes` con `is_immutable=true` en BD — la implementación parcial ya está en uso
- El workflow "DrAI - Expediente y Folios" existe (35 nodos) pero el autor lo retomará post-Evoluciones
- Esto significa que hay documentos médicos generados sin que el sistema de garantías de folios esté formalmente cerrado

**🟡 IMPORTANTE — Distancia al primer ingreso de dinero**
- La Fase 8 (Facturación, RIPS, antiglosas) es la primera que genera ROI directo para las clínicas
- El camino desde el estado actual hasta Fase 8 pasa por: cerrar Evoluciones → Folios → Multi-institución → Egreso/Facturación
- Ese es el camino mínimo para que una segunda institución pague por el sistema

**🟡 IMPORTANTE — Sin validación de mercado externa**
- 3 usuarios (todos del equipo de desarrollo), 1 institución configurada
- La hipótesis "otras clínicas colombianas adoptarán esto" no ha sido probada con usuarios externos
- El riesgo: construir las fases 8-25 con supuestos sobre qué quieren los clientes que no han sido validados

**🟡 IMPORTANTE — La práctica clínica es simultánea**
- El tiempo de desarrollo compite con guardias, urgencias y responsabilidades clínicas impredecibles
- El roadmap no tiene estimaciones de tiempo — imposible saber si la Fase 8 tarda 4 semanas o 4 meses

**🟠 MENOR — Scope de Fases 9-25**
- UCI, Obstetricia, Radiología, Farmacia, App Móvil, Dashboard Web, HL7/FHIR, DIAN: cada uno puede ser un proyecto de meses
- Son visión correcta del producto completo, pero no deben entrar en el backlog activo hasta tener 3-5 instituciones pagantes

### MVP hospitalario mínimo para primera institución pagante

| Fase | Por qué es bloqueante |
|------|----------------------|
| **7.7 Evoluciones** (cerrar bugs) | Flujo clínico esencial, en curso |
| **7.6 Folios** (formalizar) | Requisito legal para HC válida |
| **7.55 Multi-institución** | Sin esto no hay segunda institución |
| **8 Egreso + RIPS básico** | Sin esto no hay cobro ni cumplimiento |
| **20 Seguridad básica** (backups, 2FA, audit) | Sin esto ninguna clínica firmará contrato |

Todo lo demás puede venir financiado por las primeras clínicas pagantes.

### Recomendaciones específicas (priorizadas)

1. **(Esta semana)** Exportar todos los workflows n8n a git — el riesgo de pérdida total por falla del VPS es real
2. **(Al cerrar Evoluciones)** Formalizar Fase 7.6 y luego iniciar Fase 7.55 + Fase 8 en paralelo donde sea posible
3. **(Antes de segunda institución)** Fase 20 básica: backups automáticos, 2FA, retención audit log
4. **(Corto plazo)** Definir una métrica de "listo para cobrar" — qué funcionalidad mínima justifica un contrato con una clínica
5. **(Mediano plazo)** Buscar una segunda institución piloto con acuerdo de uso gratuito a cambio de feedback — validar mercado antes de invertir en Fases 9+
6. **(Mediano plazo)** Documentar el sistema operativamente — quién hace qué si el autor no está disponible

### Veredicto del dominio
**VIABLE CON CONDICIONES** — El progreso es real y la secuencia del roadmap es correcta. El riesgo de PM más urgente no es scope creep (el roadmap está bien priorizado) sino la fragilidad del bus factor = 1 combinada con la ausencia de workflows en git. Cerrar Evoluciones y luego ejecutar las 4 fases del MVP mínimo en secuencia es el camino más corto a un producto comercialmente viable.

---

## 🔍 REALITY CHECKER — Veredicto Final (v2)

### Metodología
Este veredicto consolida los cuatro informes con datos verificados en la BD de producción, el roadmap completo de 26 fases extraído directamente de `drai_roadmap`, y los 10 workflows activos inspeccionados. Incorpora las correcciones de contexto del autor: Telegram es canal de desarrollo (no el producto final), los 129 casos son datos de prueba (no producción real con terceros), y la Fase 20 es intencionalmente la última por decisión de diseño.

---

### 1. ¿DrAI es técnicamente viable?

**SÍ — con trabajo pendiente conocido y planificado**

El stack es correcto: PostgreSQL + pgvector para datos clínicos + búsqueda semántica, n8n como core de orquestación desacoplado del canal de presentación, Docker Compose para infraestructura self-hosted, y la Fase 24 con API unificada REST/GraphQL para agregar Web, WhatsApp y PWA sin reescribir lógica. Es una arquitectura que escala.

Los tres problemas técnicos pendientes son reales pero no son de diseño — son deuda de infraestructura manejable:
- El índice HNSW sin scans necesita investigación (puede ser una línea de configuración)
- La inmutabilidad sin enforce de BD es 2-3 líneas de SQL
- El backup automático es un cron job

Ninguno requiere rediseño. Todos tienen solución directa.

---

### 2. ¿DrAI es legalmente viable?

**SÍ, con brechas conocidas y en el roadmap**

A diferencia de lo que sugería v1, las brechas legales críticas **están planificadas**:
- Firma digital está en Fase 20 con proveedor especificado (Certicámara/DocuSign + SHA-256 + QR)
- RIPS está en Fase 8 con todos los archivos detallados (AF, US, AC, AP, AM, AT)
- Seguridad y cumplimiento Ley 1581 están en Fase 20

La única brecha legal que necesita resolución **antes** de las fases planificadas es el trigger de inmutabilidad en BD — porque hay documentos siendo generados hoy sin esa garantía. Todo lo demás puede resolverse en el orden que el roadmap establece.

---

### 3. ¿DrAI tiene sentido de negocio?

**SÍ — propuesta de valor diferenciada en un mercado real**

Los EHR colombianos existentes son formularios rígidos. DrAI propone documentación en lenguaje natural con validación bibliográfica en tiempo real, codificación automática, y generación de documentos listos para auditoría. Eso no existe en el mercado colombiano.

El módulo antiglosas (Fase 8) es la propuesta de valor más directa: las glosas pueden representar 15-30% de la facturación no cobrada. Una clínica que reduce sus glosas en un 50% tiene ROI medible desde el primer mes.

La visión multiplataforma (Fase 24: Web + WhatsApp + PWA + Telegram) elimina el riesgo de que el canal de entrada limite la adopción. El médico usará el que prefiera.

---

### 4. ¿El trabajo realizado hasta hoy tiene coherencia?

**SÍ — las bases están correctamente puestas**

Los 10 workflows (836 nodos) no son un conjunto aleatorio de funcionalidades — forman una cadena clínica coherente:

```
Triage Médico (233n)
    ↓
Pre-clasificación (23n)
    ↓
ADMISIONES Registro (120n) + Activar/Direccionar (16n)
    ↓
Historia Clínica (171n) + Tablero HC (15n)
    ↓
Evoluciones (139n) ← en desarrollo
    ↓
Expediente y Folios (35n) ← pendiente formalizar
    ↓
[Egreso + Facturación + RIPS — Fase 8]
```

Cada workflow habilita el siguiente. La secuencia es correcta.

La única inconsistencia identificada: el workflow de Evoluciones existe y es funcional (139 nodos) pero la Fase 7.7 aparece como PENDIENTE en el roadmap. El código está más adelante que lo que el roadmap refleja — esto es señal de desarrollo activo, no de desorganización.

---

### 5. Nivel de madurez real

**Nivel 3.5 de 5: Sistema clínico de desarrollo avanzado**

```
Nivel 1: Prueba de concepto          ✅ Superado
Nivel 2: Demo funcional              ✅ Superado
Nivel 3: Sistema en desarrollo avanzado  ✅ AQUÍ ESTÁ DrAI HOY
Nivel 3.5: Pre-producción            ← Cerrar Evoluciones + Folios
Nivel 4: Producto comercial          ← Fase 8 + Seguridad básica
Nivel 5: Enterprise-Ready            ← Fases 22-25
```

La distinción importante respecto a v1: DrAI **no está en producción con pacientes reales**. Está en desarrollo avanzado con datos de prueba del autor. Eso cambia la evaluación de riesgo — los problemas identificados no están causando daño activo, hay tiempo para resolverlos ordenadamente.

---

### 6. Recomendación ejecutiva

**Continuar en la misma dirección, con una sola corrección de proceso: los workflows a git.**

El plan del autor es correcto:
1. Cerrar bugs de Evoluciones (Fase 7.7)
2. Formalizar Expediente y Folios (Fase 7.6)
3. Multi-institución (Fase 7.55)
4. Egreso y Facturación (Fase 8)
5. Seguridad (Fase 20)
6. Luego: canales web/WhatsApp/PWA (Fases 22-24)

El único ajuste recomendado: **exportar los workflows a git antes de seguir construyendo**. Es el riesgo más alto del proyecto hoy — no técnico ni legal ni de negocio, sino operativo. Si el VPS falla mañana, se pierden 836 nodos de lógica médica.

**Lo que NO debe cambiar:**
- La arquitectura de n8n como core desacoplado del canal — es correcta
- La decisión de Telegram para desarrollo — es eficiente
- La secuencia del roadmap — está bien priorizada
- La Fase 20 al final — es válida para el contexto de un solo desarrollador
- La visión de producto — es diferenciada y tiene mercado real

**Una sola cosa a hacer esta semana, antes de continuar con cualquier otra:**
```bash
n8n export:workflow --all --output ./workflows/
git add workflows/ && git commit -m "export: all n8n workflows snapshot"
git push
```

Todo lo demás puede resolverse en el orden que el roadmap establece.

---

### Veredicto Final Consolidado

| Dimensión | Veredicto v2 |
|-----------|-------------|
| Viabilidad técnica | ✅ **VIABLE** — arquitectura correcta, deudas conocidas y planificadas |
| Viabilidad legal | ✅ **VIABLE** — brechas en el roadmap, trigger de inmutabilidad urgente |
| Viabilidad de negocio | ✅ **VIABLE** — propuesta diferenciada, Fase 8 es el camino al ROI |
| Coherencia del trabajo | ✅ **SÍ** — 10 workflows forman cadena clínica coherente |
| Madurez actual | ⚙️ **Nivel 3.5/5** — desarrollo avanzado, no producción con terceros aún |
| Próxima acción crítica | 🔴 **Workflows a git — esta semana** |

**DrAI es un sistema médico viable, bien concebido, construido con disciplina real por un médico que entiende el problema desde adentro. La pregunta no es si puede llegar a producción — el trabajo realizado demuestra que sí puede. La pregunta es mantener el foco en las fases correctas hasta cruzar ese umbral.**

---

*Revisión v2 generada el 9 de marzo de 2026.*
*Basada en: roadmap completo de 26 fases (`drai_roadmap`), 10 workflows activos (836 nodos), análisis de BD de producción, y correcciones de contexto del autor.*
*v1 → v2: correcciones sobre rol de Telegram, estado real de los datos (todos son pruebas), workflows reales existentes, y decisión intencional de Fase 20 al final.*
