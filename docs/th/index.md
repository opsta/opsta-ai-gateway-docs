---
layout: home
hero:
  name: "Opsta AI Gateway"
  text: "ควบคุมการใช้งาน AI ในองค์กร"
  tagline: "กำกับดูแลค่าใช้จ่าย การเข้าถึง และความเสี่ยงสำหรับทุกการร้องขอของ LLM และ AI-agent ในรูปแบบ self-hosted บนโครงสร้างพื้นฐานที่คุณเป็นเจ้าของ ซึ่งข้อมูลของคุณจะไม่มีวันไหลออกนอกสภาพแวดล้อมของตนเอง"
  image: { src: /favicon.svg, alt: Opsta }
  actions:
    - { theme: brand, text: "คืออะไร", link: /th/overview/what-is }
    - { theme: alt, text: "การบริหารจัดการ", link: /th/admin/console-tour }
    - { theme: alt, text: "การติดตั้งและดูแลระบบ", link: /th/operate/requirements }
features:
  - title: "การใช้งาน"
    details: "นักพัฒนาสามารถเชื่อมต่อเครื่องมือ จัดการ API key เลือกโมเดล ใช้ MCP server และติดตามค่าใช้จ่ายได้"
    link: /th/user/get-access
  - title: "การดูแลระบบ"
    details: "สำหรับ platform admin และ org admin ในการจัดการองค์กร โปรเจกต์ ผู้ให้บริการ (provider) งบประมาณ guardrail ระบบ MCP ระบบ SSO และตรวจสอบประวัติการใช้งาน (audit) ทั้งหมดได้จาก console"
    link: /th/admin/console-tour
  - title: "การติดตั้งและปฏิบัติการ"
    details: "สำหรับ platform engineer ในการติดตั้งบน Kubernetes กำหนดค่า ปรับปรุงความปลอดภัย ขยายระบบ ติดตั้งแบบ air-gap อัปเกรด และสำรองข้อมูล"
    link: /th/operate/requirements
  - title: "การควบคุมค่าใช้จ่าย"
    details: "กำหนดงบประมาณ USD แบบลำดับขั้นตั้งแต่ระดับองค์กร โปรเจกต์ กลุ่ม จนถึงผู้ใช้งาน พร้อมทั้งจำกัดจำนวน token และใช้งานระบบ semantic caching"
    link: /th/admin/budgets-and-limits
  - title: "การกำกับดูแลการเข้าถึงและความปลอดภัย"
    details: "มาพร้อมระบบยืนยันตัวตนด้วย API key ระบบกำหนดสิทธิ์ตามบทบาท (RBAC) การปิดบังข้อมูลส่วนบุคคล (PII masking) ระบบป้องกันการทำ prompt injection (guardrail) บันทึกประวัติการใช้งานอย่างละเอียด และระบบเชื่อมต่อกับ IdP ภายนอก (SSO/IdP brokering)"
    link: /th/admin/guardrails
  - title: "ความเป็นเจ้าของข้อมูลอย่างสมบูรณ์"
    details: "ติดตั้งบนระบบของคุณเอง รองรับการทำงานแบบ air-gap และรองรับการใช้งานหลายผู้เช่า (multi-tenant) โดยที่ data plane จะทำงานอยู่ภายในคลัสเตอร์ของคุณทั้งหมด"
    link: /th/security/data-sovereignty
---
