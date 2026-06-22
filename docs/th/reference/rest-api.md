# ข้อมูลอ้างอิง REST API

ตัวระบบ control plane มีการเปิดให้บริการระบบ REST API สำหรับทุกส่วนงานที่หน้าเว็บ console ทำงานได้ เช่น การจัดการองค์กร โครงการ ผู้ให้บริการ การจัดเส้นทาง งบประมาณ ขีดจำกัดการใช้งาน ระบบ guardrails คีย์ API เซิร์ฟเวอร์ MCP ระบบระบุตัวตน สถิติการใช้งาน และประวัติการตรวจสอบความปลอดภัย ซึ่งคุณสามารถเขียนสคริปต์อัตโนมัติมาสั่งการระบบผ่านทาง API นี้แทนการกดผ่านหน้าเว็บได้ทันที

::: info การยืนยันตัวตนและบทบาทสิทธิ์การใช้งาน
การเรียกใช้ API ทั้งหมดจำเป็นต้องยืนยันตัวตนด้วย OIDC โทเค็นที่ถูกต้อง และควบคุมสิทธิ์การเข้าถึงตาม [โมเดลบทบาทผู้ใช้ (RBAC)](/th/security/rbac) ได้แก่ platform_admin, org_admin ที่มีสิทธิ์เฉพาะองค์กรตนเอง และ member ที่มีสิทธิ์เฉพาะบริการตนเอง ส่วนปลายทาง API ที่ระบุกำเป็น **internal** จะใช้สำหรับบริการภายในคลัสเตอร์เองเท่านั้น เช่น บริการรับส่งสถิติการใช้งานหรือตัวตรวจสอบสุขภาพระบบ โดยจำกัดสิทธิ์ผ่านโทเค็นภายในระบบ และพอร์ต URL จะใช้ตัวแปร `{org}`, `{project}`, `{user}` เพื่อระบุโครงสร้างตัวตนผู้ใช้
:::

::: tip เอกสารนี้แสดงฟังก์ชันความสามารถโดยรวมเท่านั้น ไม่ใช่เอกสารข้อตกลงเครือข่ายที่ตายตัว
เนื่องจากที่อยู่ base paths และรูปแบบการรับส่งข้อมูลจริงอาจมีการปรับเปลี่ยนไปตามรุ่นซอฟต์แวร์ที่เปลี่ยนไป ขอแนะนำให้ยึดการทำงานของหน้าเว็บ console เป็นหลัก และใช้ตารางนี้เป็นเพียงแผนที่แสดงรายการปลายทาง API ที่มีให้ใช้งานในระบบ พร้อมทั้งแนะนำให้ระบุรุ่นซอฟต์แวร์ที่แน่นอนหากจะเขียนโปรแกรมทำงานอัตโนมัติร่วมกับระบบ
:::

## สุขภาพและข้อมูลตัววัด (Health & metrics)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | การยืนยันสิทธิ์ |
|---|---|---|
| `GET /healthz` | ตัวตรวจสอบ Liveness probe | public |
| `GET /readyz` | ตัวตรวจสอบ Readiness probe โดยจะผ่านด่านเมื่อระบบควบคุมพร้อมทำงาน | public |
| `GET /metrics` | ข้อมูลตัววัดสำหรับ Prometheus | internal |

## การจัดการองค์กร (Organizations)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs` | แสดงรายการองค์กรทั้งหมด | platform admin / console |
| `GET /api/orgs/{org}` | ดึงข้อมูลรายละเอียดองค์กร | org admin |
| `POST /api/orgs` | สร้างองค์กรใหม่ | platform admin |
| `DELETE /api/orgs/{org}` | ลบองค์กรออกจากระบบ | platform admin |
| `POST /api/orgs/{org}/admins` | แต่งตั้งสิทธิ์ผู้ดูแลระบบองค์กร | platform admin |
| `GET /api/orgs/{org}/memberships` | แสดงรายการสมาชิกในองค์กร | org admin |
| `POST /api/orgs/{org}/memberships` | เชิญสมาชิกใหม่เข้าร่วมองค์กร | org admin |
| `DELETE /api/orgs/{org}/memberships/{email}` | นำสมาชิกออกจากองค์กร | org admin |
| `GET /api/orgs/{org}/groups` | แสดงรายการกลุ่มผู้ใช้ | org admin |
| `POST /api/orgs/{org}/groups` | สร้างกลุ่มผู้ใช้ใหม่ | org admin |
| `POST /api/orgs/{org}/groups/{group}/projects/{project}` | กำหนดกลุ่มผู้ใช้เข้ากับโครงการ | org admin |

## การจัดการโครงการ (Projects)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/projects` | แสดงรายการโครงการทั้งหมด | internal |
| `POST /api/orgs/{org}/projects` | สร้างโครงการใหม่ | org admin |
| `PATCH /api/orgs/{org}/projects/{project}` | เปลี่ยนชื่อโครงการ | org admin |
| `DELETE /api/orgs/{org}/projects/{project}` | ลบโครงการออกจากระบบ | org admin |

## ผู้ใช้ระบบ (Consumers)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/consumers` | แสดงรายการผู้ใช้ (consumers) ในโครงการ | org admin |
| `POST /api/orgs/{org}/projects/{project}/consumers` | สร้างผู้ใช้ (consumer) ใหม่ | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/consumers/{user}` | ลบผู้ใช้ออกจากโครงการ | org admin |
| `PUT /api/orgs/{org}/projects/{project}/consumers/{user}/budget` | กำหนดงบประมาณใช้งานหน่วยดอลลาร์สหรัฐสำหรับผู้ใช้ | org admin |

## คีย์ API

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/me/keys` | แสดงรายการคีย์ API ของฉัน | member |
| `POST /api/me/consumers/{name}/key` | ออกคีย์ API ใหม่สำหรับผู้ใช้ของฉัน | member |
| `DELETE /api/me/keys/{id}` | เพิกถอนสิทธิ์คีย์ API ของฉัน | member |
| `POST /api/orgs/{org}/projects/{project}/consumers/{user}/key` | ออกคีย์ API ใหม่หรือหมุนเวียนคีย์ให้ผู้ใช้ | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/consumers/{user}/keys/{id}` | เพิกถอนสิทธิ์คีย์ API ของผู้ใช้ | org admin |

## ผู้ให้บริการโมเดล (Providers)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/providers` | แสดงรายการผู้ให้บริการโมเดล | org admin |
| `POST /api/orgs/{org}/projects/{project}/providers` | เพิ่มผู้ให้บริการโมเดลใหม่พร้อมบันทึกคีย์เชื่อมต่อ | org admin |
| `POST /api/orgs/{org}/projects/{project}/providers/{id}/test` | ทดสอบการเชื่อมต่อไปยังผู้ให้บริการ | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/providers/{id}` | นำผู้ให้บริการโมเดลออกจากระบบ | org admin |

## โมเดลและการจัดเส้นทาง (Models & routing)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/models` | แสดงรายการเส้นทางจัดส่งโมเดล | org admin |
| `POST /api/orgs/{org}/projects/{project}/models` | สร้างเส้นทางใหม่ระบุการแมปจากชื่อเล่นไปยังคีย์จริง | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/models/{logical}` | ลบเส้นทางจัดส่งโมเดล | org admin |

## งบประมาณและขีดจำกัดการใช้งาน (Budgets & limits)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/limits` | แสดงรายการขีดจำกัดการใช้งานโครงการ กลุ่ม หรือผู้ใช้ | org admin |
| `PUT /api/orgs/{org}/projects/{project}/limits` | กำหนดขีดจำกัดการใช้งานในระดับโครงการ | org admin |
| `PUT /api/orgs/{org}/projects/{project}/groups/{group}/limits` | กำหนดขีดจำกัดการใช้งานในระดับกลุ่ม | org admin |
| `PUT /api/orgs/{org}/projects/{project}/users/{user}/limits` | กำหนดขีดจำกัดการใช้งานในระดับผู้ใช้ | org admin |
| `GET /api/orgs/{org}/projects/{project}/effective-config` | แสดงผลสรุปกฎการจำกัดปริมาณและนโยบาย guardrails ที่มีผลบังคับใช้งานจริง | org admin |

## ระบบควบคุมความปลอดภัย (Guardrails)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/guardrails` | แสดงรายการกฎและแพทเทิร์นของ guardrails | org admin |
| `POST /api/orgs/{org}/projects/{project}/guardrails` | เพิ่มกฎความปลอดภัยใหม่ในโครงการ | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/guardrails/{pattern}` | นำกฎความปลอดภัยออกจากระบบ | org admin |

## ระบบแคชด้านความหมาย (Semantic cache)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/semantic-cache` | ดึงข้อมูลการตั้งค่าแคชด้านความหมาย | org admin |
| `PUT /api/orgs/{org}/projects/{project}/semantic-cache` | อัปเดตการตั้งค่าแคชด้านความหมาย | org admin |
| `POST /api/cache-hits` | ส่งข้อมูลสถิติประวัติการใช้งานแคช | internal |

## ระบบควบคุมความปลอดภัยด้านความหมาย (Semantic guard)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/semantic-guard` | ดึงข้อมูลตั้งค่าควบคุมความปลอดภัยด้านความหมาย | org admin |
| `PUT /api/orgs/{org}/projects/{project}/semantic-guard` | อัปเดตการตั้งค่าควบคุมความปลอดภัยด้านความหมาย | org admin |
| `GET /api/orgs/{org}/projects/{project}/semantic-guard/prompts` | แสดงตัวอย่างคำสั่งที่ใช้ในการเปรียบเทียบ | org admin |
| `PUT /api/orgs/{org}/projects/{project}/semantic-guard/prompts` | อัปเดตตัวอย่างคำสั่งที่ใช้ในการเปรียบเทียบ | org admin |

## เซิร์ฟเวอร์ MCP (MCP servers)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs/{org}/projects/{project}/mcp-servers` | แสดงรายการเซิร์ฟเวอร์ MCP ทั้งหมด | org admin |
| `POST /api/orgs/{org}/projects/{project}/mcp-servers` | ลงทะเบียนเซิร์ฟเวอร์ MCP ใหม่ในโครงการ | org admin |
| `PUT /api/orgs/{org}/projects/{project}/mcp-servers/{id}` | อัปเดตข้อมูลเซิร์ฟเวอร์ MCP | org admin |
| `DELETE /api/orgs/{org}/projects/{project}/mcp-servers/{id}` | ยกเลิกการลงทะเบียนเซิร์ฟเวอร์ MCP | org admin |
| `POST /api/mcp-calls` | ส่งสถิติการใช้งานคำสั่งเครื่องมือ MCP | internal |

## ผู้ให้บริการยืนยันตัวตน (Identity providers)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/orgs/{org}/idp` | แสดงรายการผู้ให้บริการระบุตัวตนภายนอก IdP ทั้งหมด | org admin |
| `POST /api/orgs/{org}/idp` | เพิ่มการเชื่อมต่อ IdP ใหม่ระบบ OIDC หรือ SAML | org admin |
| `GET /api/orgs/{org}/idp/{id}` | ดึงข้อมูลรายละเอียดผู้ให้บริการระบุตัวตน | org admin |
| `DELETE /api/orgs/{org}/idp/{id}` | นำผู้ให้บริการระบุตัวตนออกจากระบบ | org admin |

## อัตราค่าบริการ (Pricing)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/prices` | แสดงรายการราคาของโมเดลทั้งหมด | internal / admin |
| `POST /api/prices` | กำหนดอัตราค่าบริการพิเศษด้วยตนเอง | platform admin |
| `POST /api/prices/sync` | ซิงก์ราคากับคลังราคาทางการของโมเดลภายนอก | platform admin |

## ข้อมูลการใช้งาน (Usage)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/usage` | ตรวจสอบยอดการใช้งานของตนเอง เช่น ปริมาณโทเค็นและจำนวนเงินสะสมรายเดือน | member / org admin |
| `GET /api/usage/history` | ประวัติการใช้งานแบบเรียงลำดับเวลา | member / org admin |
| `GET /api/usage/months` | ช่วงเวลาเดือนที่ระบบมีข้อมูลจัดเก็บไว้ | member / org admin |
| `GET /api/orgs/{org}/usage` | ข้อมูลการใช้งานระดับองค์กรทั้งหมด | org admin |
| `GET /api/orgs/{org}/projects/{project}/usage` | ข้อมูลการใช้งานระดับโครงการ | org admin |
| `POST /api/usage/ingest` | ส่งสถิติโทเค็นใช้งานเป็นรายคำขอ | internal |

## คำขอที่ถูกบล็อก (Blocked requests)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/me/blocks` | แสดงรายการคำขอที่ติดกฎการบล็อกของฉัน | member |
| `POST /api/me/blocks/{id}/report` | แจ้งเรื่องกรณีเป็นการตรวจจับผิดพลาด (false positive) | member |
| `GET /api/orgs/{org}/blocks` | แสดงรายการบล็อกขององค์กรทั้งหมดเพื่อปรับแต่งกฎเพิ่มเติม | org admin |
| `POST /api/guardrail-blocks` | ส่งสถิติและตัวอย่างข้อความกรณีคำสั่งถูกบล็อก | internal |

## ประวัติการตรวจสอบ (Audit)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `GET /api/audit` | บันทึกประวัติการตรวจสอบของทุกส่วนในระบบหลัก | platform admin |
| `GET /api/orgs/{org}/audit` | บันทึกประวัติการตรวจสอบเฉพาะองค์กร | org admin |

## ขั้นตอนนำเข้าและข้อมูลตั้งค่า Console (Onboarding & console config)

| วิธีและลิงก์เชื่อมต่อ (Method & Path) | วัตถุประสงค์ | บทบาทสิทธิ์ที่รองรับ |
|---|---|---|
| `POST /api/self-enroll` | ลงทะเบียนตนเองในองค์กรเริ่มต้นสำหรับการเข้าใช้งานระบบครั้งแรก | member |
| `GET /api/console-config` | แสดงรายละเอียดและสิทธิ์เข้าใช้ระบบสำหรับหน้าเว็บ console | console (SSO-gated) |

## ขั้นตอนต่อไป

- [ข้อมูลอ้างอิงการกำหนดค่าระบบ (Configuration reference)](/th/reference/configuration)
- [โมเดล RBAC (RBAC model)](/th/security/rbac)
