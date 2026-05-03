'use client';
import { useState } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ic: React.CSSProperties = { width: 20, height: 20, display: 'block', flexShrink: 0 };
function IconSearch()  { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>; }
function IconChat()    { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function IconMoney()   { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M2 10h2M20 10h2M2 14h2M20 14h2"/></svg>; }
function IconUser()    { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>; }
function IconCamera()  { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>; }
function IconTag()     { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function IconTruck()   { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function IconPin()     { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function IconCard()    { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function IconStar()    { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function IconCoin()    { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v2M12 15v2M9.5 9.5C9.5 8.4 10.6 7.5 12 7.5s2.5.9 2.5 2c0 2.5-5 2.5-5 5 0 1.1 1.1 2 2.5 2s2.5-.9 2.5-2"/></svg>; }
function IconInfo()    { return <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ n, icon, title, desc, items }: { n: number; icon: React.ReactNode; title: string; desc: string; items: string[] }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '20px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ color: 'var(--accent)' }}>{icon}</span>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 10px', lineHeight: 1.6 }}>{desc}</p>
        <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {items.map((item, i) => <li key={i} style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
}

// ─── Method card ──────────────────────────────────────────────────────────────
function MethodCard({ icon, title, desc, note }: { icon: React.ReactNode; title: string; desc: string; note?: string }) {
  return (
    <div style={{ padding: '18px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{desc}</div>
      {note && <div style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--surface-2)', padding: '5px 10px', borderRadius: 6 }}>{note}</div>}
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'buyer',   label: '🛒 สำหรับผู้ซื้อ' },
  { id: 'seller',  label: '📦 สำหรับผู้ขาย' },
  { id: 'payment', label: '💳 การชำระเงิน' },
  { id: 'delivery',label: '🚚 วิธีจัดส่ง' },
  { id: 'coins',   label: '🪙 เติมเหรียญ & Boost' },
  { id: 'about',   label: 'ℹ️ เกี่ยวกับเรา' },
];

// ─── Tab content components ───────────────────────────────────────────────────
function TabBuyer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <StepCard n={1} icon={<IconUser />} title="สมัครสมาชิก / เข้าสู่ระบบ" desc="สร้างบัญชีฟรี ใช้เวลาไม่ถึง 1 นาที" items={['กดปุ่ม "เข้าสู่ระบบ" ที่มุมขวาบนของหน้าเว็บ', 'สมัครด้วย Google, Apple หรืออีเมล + รหัสผ่าน', 'ยืนยันอีเมลแล้วเริ่มใช้งานได้ทันที']} />
      <StepCard n={2} icon={<IconSearch />} title="ค้นหาและเลือกดูสินค้า" desc="ค้นหาสินค้าที่ต้องการได้หลายวิธี" items={['พิมพ์ชื่อสินค้าในช่องค้นหาที่ด้านบน', 'กรองตามหมวดหมู่ ราคา สภาพสินค้า และพื้นที่', 'กดที่การ์ดสินค้าเพื่อดูรูปภาพและรายละเอียด', 'กดหัวใจ ❤️ เพื่อบันทึกลงใน Wishlist']} />
      <StepCard n={3} icon={<IconChat />} title="ติดต่อผู้ขาย" desc="แชทโดยตรงกับผู้ขายได้ทันที ไม่มีตัวกลาง" items={['กดปุ่ม "แชท" หรือ "ติดต่อผู้ขาย" ในหน้ารายละเอียดสินค้า', 'สอบถามรายละเอียด ขอรูปเพิ่มเติม หรือนัดหมายได้เลย', 'กด "เสนอราคา" เพื่อต่อรองราคากับผู้ขาย']} />
      <StepCard n={4} icon={<IconMoney />} title="ตกลงและรับสินค้า" desc="นัดหมายและรับสินค้าตามที่ตกลงกัน" items={['ตกลงราคา วิธีชำระเงิน และวิธีจัดส่งในแชท', 'ชำระเงินตามวิธีที่ตกลงกันกับผู้ขายโดยตรง', 'นัดรับสินค้าหรือรอรับพัสดุตามที่นัดหมาย']} />
    </div>
  );
}

function TabSeller() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <StepCard n={1} icon={<IconUser />} title="สมัครสมาชิก" desc="บัญชีเดียวใช้ได้ทั้งซื้อและขาย ฟรีตลอด" items={['สมัครด้วย Google, Apple หรืออีเมล', 'ไม่มีค่าธรรมเนียมสมัคร ไม่มีค่าลงประกาศ', 'ลงขายได้ไม่จำกัดจำนวนสินค้า']} />
      <StepCard n={2} icon={<IconCamera />} title="ถ่ายรูปสินค้า" desc="รูปภาพคือสิ่งแรกที่ผู้ซื้อเห็น" items={['ถ่ายในที่แสงสว่าง พื้นหลังสะอาด ไม่มีเงา', 'ถ่ายหลายมุม — หน้า หลัง และรายละเอียดสำคัญ', 'อัปโหลดได้สูงสุด 5 รูปต่อ 1 ประกาศ']} />
      <StepCard n={3} icon={<IconTag />} title="กรอกรายละเอียดสินค้า" desc="ข้อมูลครบช่วยให้ผู้ซื้อตัดสินใจง่ายขึ้น" items={['ชื่อสินค้า: ระบุให้ชัด เช่น ยี่ห้อ รุ่น สี ขนาด', 'คำอธิบาย: บอกสภาพ ข้อดี ข้อเสีย อย่างตรงไปตรงมา', 'ราคา: ตั้งราคาที่ต้องการ เปิด/ปิด "ต่อรองราคาได้" ได้', 'สภาพ: ใหม่ในกล่อง / 95%+ / สภาพดี / ทั่วไป / ซ่อมได้']} />
      <StepCard n={4} icon={<IconTruck />} title="เลือกวิธีจัดส่ง" desc="ระบุให้ผู้ซื้อทราบล่วงหน้าในคำอธิบาย" items={['นัดรับด้วยตัวเอง: กำหนดจุดนัดพบในแชท', 'ส่งพัสดุ: Kerry / Flash Express / ไปรษณีย์ไทย', 'ระบุค่าจัดส่งหรือตกลงกับผู้ซื้อในแชท']} />
      <StepCard n={5} icon={<IconStar />} title="Boost สินค้า (ตัวเลือกเสริม)" desc="ใช้เหรียญเพิ่มการมองเห็น" items={['สินค้าเด่น: ปักหมุดหน้าแรก 7 วัน — 80 เหรียญ', 'Boost: ดันขึ้นบนสุดในหมวดหมู่ — 30 เหรียญ', 'ดูรายละเอียดเพิ่มเติมในแท็บ "เติมเหรียญ & Boost"']} />
    </div>
  );
}

function TabPayment() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.8 }}>
        <p style={{ margin: '0 0 10px' }}>
          PloiKhong เป็นแพลตฟอร์มกลาง — <strong style={{ color: 'var(--ink)' }}>การชำระเงินค่าสินค้าเป็นการตกลงกันโดยตรงระหว่างผู้ซื้อและผู้ขาย</strong> ผ่านระบบแชทของแพลตฟอร์ม
        </p>
        <p style={{ margin: 0 }}>ผู้ซื้อและผู้ขายสามารถตกลงวิธีชำระเงินที่สะดวกกันเองได้ เช่น</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <MethodCard icon={<IconMoney />} title="PromptPay / พร้อมเพย์" desc="โอนผ่าน QR Code หรือหมายเลขพร้อมเพย์ รองรับทุกธนาคาร" note="✅ นิยมที่สุด รวดเร็ว ปลอดภัย" />
        <MethodCard icon={<IconCard />} title="โอนเงินผ่านธนาคาร" desc="โอนตรงเข้าบัญชีผู้ขาย รองรับทุกธนาคารในไทย" note="📱 ใช้ได้ผ่าน Mobile Banking ทุกแอป" />
        <MethodCard icon={<IconMoney />} title="เงินสด (นัดรับ)" desc="จ่ายเงินสดเมื่อนัดรับ ตรวจสินค้าได้ก่อนจ่าย" note="🤝 เหมาะสำหรับสินค้าราคาสูง" />
        <MethodCard icon={<IconStar />} title="วิธีอื่นๆ" desc="TrueMoney, Line Pay หรือวิธีอื่นตามที่ตกลงกัน" note="💬 ตกลงในแชทได้เลย" />
      </div>
      <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius)', padding: '14px 18px', fontSize: 13, color: '#92400e', lineHeight: 1.7 }}>
        ⚠️ <strong>ความปลอดภัย:</strong> ตรวจสอบประวัติผู้ขายก่อนโอนเงิน และเก็บหลักฐานการโอนไว้เสมอ หากพบปัญหาแจ้งทีมงาน PloiKhong ได้ทันที
      </div>
    </div>
  );
}

function TabDelivery() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>
        ผู้ซื้อและผู้ขายตกลงวิธีจัดส่งได้โดยตรงผ่านแชท PloiKhong ไม่ได้เป็นผู้ดำเนินการจัดส่ง
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <MethodCard icon={<IconPin />} title="นัดรับด้วยตัวเอง" desc="ผู้ซื้อเดินทางมารับที่นัดหมาย เหมาะสำหรับสินค้าขนาดใหญ่หรือต้องการตรวจก่อนซื้อ" note="📍 กำหนดจุดนัดพบในแชท" />
        <MethodCard icon={<IconTruck />} title="Kerry Express" desc="ครอบคลุมทั่วประเทศ มีระบบติดตามพัสดุ" note="⏱ 1-3 วันทำการ" />
        <MethodCard icon={<IconTruck />} title="Flash Express" desc="ราคาประหยัด ทั่วประเทศ เหมาะสินค้าขนาดเล็ก-กลาง" note="⏱ 1-3 วันทำการ" />
        <MethodCard icon={<IconTruck />} title="ไปรษณีย์ไทย" desc="ครอบคลุมทุกพื้นที่รวมถึงพื้นที่ห่างไกล EMS และพัสดุธรรมดา" note="⏱ EMS 1-3 วัน / พัสดุ 3-7 วัน" />
      </div>
    </div>
  );
}

function TabCoins() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <StepCard n={1} icon={<IconUser />} title="เข้าเมนูเติมเหรียญ" desc="เข้าถึงได้จากเมนูบัญชีของคุณ" items={['กดไอคอนบัญชีที่ Navbar → "เติมเหรียญ & Premium"', 'หรือเข้าที่ ploikhong.com/coins โดยตรง']} />
      <StepCard n={2} icon={<IconCoin />} title="เลือกแพ็กเกจเหรียญ" desc="มีให้เลือก 4 แพ็กเกจ" items={['🪙 100 เหรียญ — ฿99', '🪙 350 เหรียญ (ประหยัด 15%) — ฿299', '🪙 800 เหรียญ (ประหยัด 25%) — ฿599 🔥 ยอดนิยม', '🪙 1,500 เหรียญ (ประหยัด 33%) — ฿999 ⭐']} />
      <StepCard n={3} icon={<IconCard />} title="ชำระผ่าน Omise" desc="รองรับหลายช่องทาง" items={['บัตรเครดิต / เดบิต (Visa, Mastercard) — 3-D Secure', 'PromptPay — สแกน QR Code', 'TrueMoney Wallet', 'Mobile Banking']} />
      <StepCard n={4} icon={<IconStar />} title="ใช้เหรียญซื้อบริการเสริม" desc="เพิ่มยอดขายด้วย Boost และ Premium" items={['สินค้าเด่น (Featured): ปักหมุดหน้าแรก 7 วัน — 80 เหรียญ', 'Boost สินค้า: ดันขึ้นบนสุดในหมวดหมู่ — 30 เหรียญ', 'แจ้งเตือนผู้ติดตาม — 25 เหรียญ', 'Analytics Pro — 50 เหรียญ', 'เหรียญไม่หมดอายุ คืนได้ภายใน 14 วันหากยังไม่ใช้']} />
    </div>
  );
}

function TabAbout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.9 }}>
        <p style={{ margin: '0 0 14px' }}>
          <strong style={{ color: 'var(--ink)', fontSize: 16 }}>PloiKhong (ปล่อยของ)</strong> คือแพลตฟอร์มตลาดซื้อขายออนไลน์ที่เชื่อมต่อผู้ซื้อและผู้ขายในประเทศไทย รองรับสินค้าทุกประเภท ทั้งสินค้าใหม่และสินค้าผ่านการใช้งาน
        </p>
        <p style={{ margin: '0 0 14px' }}>
          <strong style={{ color: 'var(--ink)' }}>ลงขายฟรีไม่จำกัด</strong> — ไม่มีค่าธรรมเนียมลงประกาศ รายได้หลักของแพลตฟอร์มมาจากบริการเสริม เช่น การ Boost สินค้าและแพ็กเกจ Premium
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: '🌐 เว็บไซต์', val: 'ploikhong.com' },
            { label: '📧 อีเมล', val: 'support@ploikhong.com' },
            { label: '📘 Facebook', val: 'facebook.com/ploikhong' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--ink-3)', minWidth: 100 }}>{item.label}</span>
              <strong>{item.val}</strong>
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '24px', background: 'linear-gradient(135deg, #1d4ed8, #1667fe)', borderRadius: 'var(--radius)', color: '#fff' }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>พร้อมเริ่มซื้อขายแล้วใช่ไหม?</div>
        <div style={{ fontSize: 13, opacity: .85, marginBottom: 16 }}>ลงขายฟรี ไม่จำกัด ไม่มีค่าธรรมเนียม</div>
        <a href="/" style={{ display: 'inline-block', padding: '10px 28px', background: '#fff', color: '#1667fe', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>เริ่มต้นใช้งาน →</a>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GuidePage() {
  const [active, setActive] = useState('buyer');

  const content: Record<string, React.ReactNode> = {
    buyer:    <TabBuyer />,
    seller:   <TabSeller />,
    payment:  <TabPayment />,
    delivery: <TabDelivery />,
    coins:    <TabCoins />,
    about:    <TabAbout />,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-th, system-ui, sans-serif)' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1667fe 100%)', color: '#fff', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>← กลับหน้าหลัก</a>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-.02em' }}>คู่มือการใช้งาน PloiKhong</h1>
          <p style={{ fontSize: 14, opacity: .85, margin: 0 }}>เลือกหัวข้อที่ต้องการด้านล่างได้เลย</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActive(tab.id)} style={{
              padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: active === tab.id ? 700 : 400,
              color: active === tab.id ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: active === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              whiteSpace: 'nowrap', fontFamily: 'inherit', flexShrink: 0,
              transition: 'color .15s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 80px' }}>
        {content[active]}
      </div>

    </div>
  );
}
