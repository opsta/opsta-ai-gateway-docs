# ข้อมูลอ้างอิงการกำหนดค่าระบบ

ทุกการตั้งค่าการทำงานสำหรับผู้ควบคุมระบบจะกำหนดผ่านค่า Helm value ซึ่งมีค่าเริ่มต้นที่เหมาะสมกำหนดไว้ หน้านี้รวบรวมรายการตัวแปรการตั้งค่าจัดกลุ่มตามหมวดหมู่การทำงาน พร้อมอธิบายวัตถุประสงค์และระบุค่าเริ่มต้น สำหรับภาพรวมแนวคิดการกำหนดค่าสามารถศึกษาได้ที่หน้า [การกำหนดค่าระบบ (Configuration)](/th/operate/configuration)

::: tip ค่าเริ่มต้นเหมาะสำหรับระบบใช้งานจริง
สภาพแวดล้อมส่วนใหญ่จะปรับเปลี่ยนค่าตัวแปรเพียงไม่กี่รายการ เช่น โดเมน โหมด TLS การสลับเปิดใช้งานระบบ HA และระบุประเภทระบบย่อยที่จะเปิดรัน ส่วนค่าตั้งค่าที่เหลือทั้งหมดมีค่าเริ่มต้นที่ถูกปรับแต่งมาให้เหมาะสมสำหรับซอฟต์แวร์ระดับองค์กรที่รันในระบบปิดระยะยาวอยู่แล้ว
:::

## global

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `global.baseDomain` | โดเมนหลักของระบบ โดยโดเมนย่อยต่างๆ จะอ้างอิงจากโดเมนนี้ | `ai-gateway.opsta.dev` |
| `global.subdomainSeparator` | ใช้เครื่องหมาย `.` สำหรับแบ่งสองระดับ หรือใช้เครื่องหมาย `-` สำหรับระดับเดียวภายใต้ wildcard | `.` |
| `global.subdomains.api` / `.console` / `.grafana` / `.auth` / `.mcp` | ชื่อโดเมนย่อยของแต่ละส่วนงาน | `api` / `console` / `grafana` / `auth` / `mcp` |
| `global.highAvailability` | สลับเปิดใช้งานระหว่างโหมด Standalone หรือ HA สำหรับแพลตฟอร์มทั้งหมด | `false` |
| `global.registry` | คลังเก็บอิมเมจหลักสำหรับอิมเมจที่พัฒนาโดย Opsta | `ghcr.io/opsta/opsta-ai-gateway` |
| `global.imageMirror` | คลังทำสำเนาภายนอกสำหรับระบบปิด (air-gap) | `""` |
| `global.imageMirrorFlatten` | ยุบระดับชั้นชื่ออิมเมจที่คัดลอกมาให้อยู่ภายใต้โปรเจกต์เดียวกัน | `false` |
| `global.imagePullSecrets` | ข้อมูลความลับดึงอิมเมจที่บังคับใช้กับทุกอิมเมจ | `[]` |
| `global.namespacePrefix` | คำนำหน้าชื่อเนมสเปซที่จัดการโดยแพลตฟอร์ม | `""` |
| `global.storageClass` | StorageClass ที่บังคับใช้กับ PVC ทั้งหมด โดยเว้นว่างไว้หมายถึงใช้ค่าเริ่มต้นของคลัสเตอร์ | `""` |

## tls

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `tls.mode` | โหมดการทำงานของ TLS เลือกระหว่าง `letsencrypt`, `provided` หรือ `selfsigned` | `letsencrypt` |
| `tls.wildcardSecretName` | ชื่อของ Secret ที่เก็บใบรับรอง wildcard cert | `ai-gateway-wildcard-tls` |
| `tls.letsencrypt.issuer` | เลือกเป็น `letsencrypt-staging` หรือ `letsencrypt-prod` | `letsencrypt-staging` |
| `tls.letsencrypt.email` | อีเมลติดต่อสำหรับระบบ ACME | _(ระบุแยกตามสิ่งแวดล้อม)_ |
| `tls.letsencrypt.dns01.provider` | ผู้ให้บริการตรวจสอบสิทธิ์ DNS-01 | `cloudflare` |
| `tls.letsencrypt.dns01.dnsZone` | พื้นที่ Zone โดเมนที่ใช้จัดการ DNS token | `opsta.dev` |

## ตัวจัดการระบบ (Operators ในรูปแบบนำมาติดตั้งเอง)

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `certManager.enabled` | ติดตั้ง cert-manager ใหม่แทนการเรียกใช้จากระบบเดิมที่มีอยู่แล้ว | `true` |
| `redisOperator.enabled` | ติดตั้ง Redis operator ใหม่เพื่อจัดการ Redis | `true` |
| `cnpg.enabled` | ติดตั้ง CloudNativePG ใหม่เพื่อจัดการฐานข้อมูล | `true` |

ศึกษาได้ที่หน้า [การใช้งานตัวจัดการระบบที่มีอยู่เดิม](/th/operate/byo-operators)

## ingress & secrets

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `ingress.tunnel.enabled` | เปิดใช้งาน Cloudflare Tunnel เป็นช่องทางรับข้อมูลขาเข้าหลัก | `false` |
| `secrets.createFromValues` | ตั้งค่าให้ติดตั้งสร้าง Secrets จากไฟล์ values ที่ไมู่อยู่ในระบบ git หรืออ้างอิงจากระบบความลับเดิมที่มีอยู่แล้ว | `true` |
| `secrets.values.*` / `secrets.existing.*` | รายละเอียดข้อมูลความลับหรือการอ้างอิงข้อมูล | _(ระบุแยกตามสิ่งแวดล้อม)_ |

## postgres (ฐานข้อมูลระบบควบคุมหลัก)

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `postgres.enabled` | ติดตั้งฐานข้อมูลสำหรับระบบควบคุมหลัก | `false` |
| `postgres.instances` | จำนวน replica ฐานข้อมูล โดยเว้นว่างไว้หมายถึงอ้างอิงตามค่า HA | `null` |
| `postgres.database` / `.owner` | ชื่อฐานข้อมูลและบทบาทเจ้าของฐานข้อมูล | `opsta` / `opsta` |
| `postgres.storageSize` | ขนาดพื้นที่จัดเก็บ PVC | `5Gi` |
| `postgres.backup.enabled` | เปิดใช้งานการตั้งเวลาสำรองข้อมูลอัตโนมัติ | `false` |
| `postgres.backup.method` | โหมดสำรองข้อมูล เลือกเป็น `objectStore` หรือ `volumeSnapshot` | `objectStore` |
| `postgres.backup.objectStore.destinationPath` / `.endpointURL` | ปลายทางและลิงก์ของถังเก็บข้อมูลสำรอง | `""` |

## redis

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `redis.enabled` | ติดตั้ง Redis สำหรับใช้เก็บตัวนับโควตาและตัวจำกัดความถี่การใช้งาน | `true` |
| `redis.replicas` | จำนวน replicas ในระบบ โดยเว้นว่างไว้หมายถึงอ้างอิงตามค่า HA | `null` |
| `redis.timeoutMs` | ระยะเวลารอเชื่อมต่อของปลั๊กอิน | `2000` |

## controlPlane

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `controlPlane.enabled` | ติดตั้งระบบ control plane โดยจำเป็นต้องเปิดใช้งาน `postgres.enabled` เสมอ | `false` |
| `controlPlane.replicas` | จำนวน replicas โดยเว้นว่างไว้หมายถึงอ้างอิงตามค่า HA | `null` |
| `controlPlane.networkPolicy.enabled` | ปฏิเสธการเชื่อมต่อเริ่มต้นเพื่อความปลอดภัยของระบบ API | `true` |
| `controlPlane.networkPolicy.extraIngressNamespaces` | ระบุเนมสเปซเพิ่มเติมที่อนุญาตให้เชื่อมต่อเข้ามายังระบบได้ | `[]` |
| `controlPlane.bootstrapAdmin.enabled` | สร้างบัญชีผู้ดูแลระบบเริ่มต้นในการติดตั้งครั้งแรก | `true` |
| `controlPlane.bootstrapAdmin.email` | อีเมลผู้ดูแลระบบเริ่มต้น ซึ่งแนะนำให้ตั้งค่าในระบบจริง | `""` |
| `controlPlane.bootstrapAdmin.group` | กลุ่มผู้ดูแลระบบเริ่มต้นสำหรับอ้างอิงกลุ่ม | `opsta-admins` |

## console

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `console.enabled` | ติดตั้งหน้าเว็บ console หลักสำหรับตั้งค่า | `true` |
| `console.replicas` | จำนวน replicas โดยเว้นว่างไว้หมายถึงอ้างอิงตามค่า HA | `null` |
| `console.adminGroups` | กลุ่มผู้ใช้ที่ได้รับสิทธิ์ผู้ดูแลระบบหลัก | `[opsta-admins]` |
| `console.adminEmails` | รายการอีเมลที่อนุญาตสิทธิ์กรณีฉุกเฉิน (break-glass) | `[]` |

## keycloak (ระบบระบุตัวตน)

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `keycloak.enabled` | ติดตั้งระบบ Keycloak พร้อมกับฐานข้อมูลแยกเฉพาะ | `false` |
| `keycloak.replicas` | จำนวน replicas ของเซิร์ฟเวอร์ โดยเว้นว่างไว้หมายถึงอ้างอิงตามค่า HA | `null` |
| `keycloak.realm.name` | Realm name | `opsta` |
| `keycloak.realm.adminGroup` | กลุ่มผู้ใช้ที่ได้รับสิทธิ์เป็นผู้ดูแลระบบภายใน Keycloak | `opsta-admins` |
| `keycloak.realm.groups` | กลุ่มสมาชิกเริ่มต้นใน realm | `[eng, opsta-admins]` |

## sso

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `sso.enabled` | เปิดใช้งานการลงชื่อเข้าใช้ผ่าน SSO สำหรับ console และแดชบอร์ดสถิติ | `true` |
| `sso.mode` | โหมด OIDC เลือกระหว่าง `google` หรือ `mock` สำหรับพัฒนาทดสอบ | `google` |
| `sso.emailDomain` | Allowed email domain | _(ระบุแยกตามสิ่งแวดล้อม)_ |
| `sso.requireVerifiedEmail` | Require `email_verified` | `true` |
| `sso.scopes` / `.emailClaim` / `.groupsClaim` / `.nameClaim` | ข้อมูลสิทธิ์ OIDC scopes และชื่อของฟิลด์ข้อมูลสิทธิ์ยืนยันตัวตน | `openid email profile groups` / `email` / `groups` / `name` |

## observability (ระบบตรวจสอบการทำงาน)

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `observability.enabled` | ติดตั้งชุดระบบบันทึกความผิดปกติ ตัววัด และประวัติเส้นทางข้อมูลหลักในตัว | `true` |
| `observability.replicas` | จำนวน replicas ของ auth-proxy โดยเว้นว่างไว้หมายถึงอ้างอิงตามค่า HA | `null` |
| `observability.storage` | โหมดจัดเก็บข้อมูล เลือกเป็น `local` หรือใช้ถังข้อมูล `object` สำหรับระบบ HA | `local` |
| `observability.metricsRetention` | ระยะเวลาเก็บรักษาข้อมูลตัววัด metrics | `8760h` (365d) |
| `observability.logsRetention` | ระยะเวลาเก็บรักษาข้อมูลล็อกประวัติการทำงาน | `4320h` (180d) |
| `observability.tracesRetention` | ระยะเวลาเก็บรักษาข้อมูลประวัติเส้นทางข้อมูล traces | `2160h` (90d) |
| `observability.networkPolicy.enabled` | จำกัดการเชื่อมต่อฐานข้อมูลปลายทางให้เฉพาะตัวแทนตรวจสอบสิทธิ์เข้าถึงได้เท่านั้น | `true` |

## ค่านโยบายเริ่มต้นสำหรับส่วนรับส่งข้อมูลหลัก (Policy defaults)

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `budgets.enabled` | เปิดใช้งานระบบตรวจจับคีย์และควบคุมงบประมาณดอลลาร์สหรัฐ | `true` |
| `budgets.reconcileSchedule` | รอบเวลาความถี่ในการปรับปรุงสิทธิ์งบประมาณในระบบ | `*/1 * * * *` |
| `budgets.keyHeader` / `.keyPrefix` | ชื่อ header และคำนำหน้าสำหรับระบุคีย์ API | `Authorization` / `Bearer ` |
| `rateLimits.enabled` | เปิดใช้งานระบบจำกัดปริมาณโทเค็นต่อนาที (TPM) | `true` |
| `rateLimits.defaultUserPerMinute` | ค่าเริ่มต้น TPM สำหรับผู้ใช้ทั่วไปในโครงการ | `100000` |
| `modelAllowlist.enabled` | เปิดใช้งานระบบควบคุมรายการโมเดลที่อนุญาตตามกลุ่มผู้ใช้ | `true` |
| `modelAllowlist.defaultAction` | การดำเนินการเริ่มต้นเมื่อข้อมูลไม่ตรงกฎ เลือกระหว่าง `deny` หรือ `allow` | `deny` |
| `modelRouter.enabled` | เปิดใช้งานการจัดเส้นทางโมเดลตามฟิลด์คำขอไปยัง header | `true` |
| `modelRouter.modelHeader` | ชื่อ header สำหรับจัดส่งข้อมูลโมเดลปลายทาง | `x-higress-llm-model` |
| `guardrails.promptInjection.enabled` | เปิดใช้งานฟังก์ชันตรวจจับคำสั่งลวงระดับคำสั่งป้อนเข้า | `true` |
| `guardrails.dataMasking.enabled` | เปิดใช้งานระบบปกปิดข้อมูลระบุตัวตนบุคคล (PII) | `false` |
| `gateway.maxRequestBytes` | ขนาดเนื้อความคำขอสูงสุดที่เกตเวย์รับเก็บข้อมูล | `10485760` (10 MiB) |
| `audit.retentionDays` | ระยะเวลาเก็บรักษาบันทึกประวัติการตรวจสอบระบบ | `365` |

::: warning ฟังก์ชันการปกปิดข้อมูล PII ปิดทำงานไว้เป็นค่าเริ่มต้น
ค่า `guardrails.dataMasking.enabled` จะเป็น `false` เป็นค่าเริ่มต้น เนื่องจากปลั๊กอินต้นทางมีข้อจำกัดในการตัดเนื้อความคำตอบแบบสตรีมมิ่งที่ระบุการทำงานคู่กับเครื่องมืออื่น ส่งผลให้ระบบตัวแทนเอเจนต์ไม่สามารถประมวลผลต่อได้ แนะนำให้เปิดใช้งานเฉพาะกรณีที่องค์กรของคุณมีข้อบังคับกฎหมายและไม่ได้ใช้งานโมเดลแบบเรียกใช้เครื่องมือภายนอกแบบสตรีมมิ่งเป็นหลัก โดยศึกษารายละเอียดเพิ่มเติมได้ที่หน้า [การกำหนดค่ากฎความปลอดภัย (Guardrails)](/th/admin/guardrails)
:::

## ฟีเจอร์ด้านความหมายและ MCP (Semantic features & MCP)

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `semanticCache.enabled` | เปิดใช้งานฟังก์ชันระบบแคชประวัติด้วยเวกเตอร์ด้านความหมาย | `false` |
| `semanticCache.collection` | ชื่อของ Vector collection ที่ใช้เก็บข้อมูลแคช | `opsta_cache` |
| `semanticGuard.enabled` | เปิดใช้งานระบบตรวจจับความปลอดภัยของคำสั่งลวงด้วยเวกเตอร์ | `false` |
| `semanticGuard.collection` | ชื่อของ Vector collection ที่ใช้ตรวจจับความปลอดภัย | `opsta_guard` |
| `semantic.qdrant.replicas` / `.storage` | จำนวน replicas และขนาดพื้นที่เก็บข้อมูลดิสก์ของฐานข้อมูลเวกเตอร์ Qdrant | `null` / `10Gi` |
| `semantic.ollama.replicas` / `.storage` / `.model` | จำนวน replicas ขนาดดิสก์ และโมเดลที่ใช้สำหรับบริการฝังข้อมูลตัวแทนเวกเตอร์ Ollama | `null` / `5Gi` / `bge-m3:latest` |
| `mcp.enabled` | เปิดใช้งานเกตเวย์ MCP | `false` |
| `mcp.transport` | โหมดตัวนำส่งข้อมูลของเกตเวย์ MCP | `streamable` |

## อิมเมจระบบ (images)

| ตัวแปรการตั้งค่า | วัตถุประสงค์ | ค่าเริ่มต้น |
|---|---|---|
| `images.builtTag` | แท็กเวอร์ชันของอิมเมจระบบที่พัฒนาโดย Opsta (สำหรับระบุรุ่นใช้งานจริง) | `dev` |
| `images.external.*` | รายการรุ่นเวอร์ชันของอิมเมจภายนอกที่ล็อกรุ่นไว้ | _(ตารางส่วนประกอบ)_ |
| `images.aiPlugins.*` | รายละเอียดรุ่นและลิงก์ดึงข้อมูลของปลั๊กอินภายในเกตเวย์ | _(ตารางส่วนประกอบ)_ |

รายการล็อกทั้งหมดนี้ทำหน้าที่ควบคุมความเข้ากันได้ของ**ตารางส่วนประกอบระบบ (Component matrix)** ซึ่งจะได้รับการปรับปรุงอย่างเป็นลายลักษณ์อักษรในทุกรอบการออกรุ่นใหม่ โดยศึกษาเพิ่มเติมได้ที่หน้า [การอัปเกรดระบบ (Upgrades)](/th/operate/upgrades)

## dev (สำหรับใช้ในการทดสอบเท่านั้น)

ตัวแปร `dev.mockUpstream`, `dev.mockOidc`, `dev.deepseekPoc` และ `dev.mcpTestServer` เป็นชุดสำหรับการทดสอบและพัฒนาภายในระบบ โดยค่าเริ่มต้นจะเป็น `false` ทั้งหมด **ห้ามเปิดใช้งานในระบบใช้งานจริงอย่างเด็ดขาด**

## ขั้นตอนต่อไป

- [การกำหนดค่าระบบ (Configuration)](/th/operate/configuration)
- [ข้อมูลอ้างอิง REST API (REST API reference)](/th/reference/rest-api)
