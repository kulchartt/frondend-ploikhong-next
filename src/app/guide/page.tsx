import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'วิธีการใช้งาน | PloiKhong',
  description: 'คู่มือการใช้งาน PloiKhong ครบถ้วน — วิธีซื้อสินค้า ลงขายสินค้า วิธีชำระเงิน และวิธีจัดส่งสินค้า',
};

// ─── Icon components ──────────────────────────────────────────────────────────
function IconSearch() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>;
}
function IconChat() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function IconMoney() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8L2 7h20z"/><circle cx="12" cy="14" r="2"/></svg>;
}
function IconUser() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
}
function IconCamera() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
}
function IconTag() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function IconTruck() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
function IconPin() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function IconCard() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function IconQR() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01M14 22h.01M22 14h.01M22 18h.01M22 22h.01"/></svg>;
}
function IconBank() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V9M21 22V9M12 22V9M12 2L2 9h20L12 2z"/><line x1="2" y1="22" x2="22" y2="22"/></svg>;
}
function IconCash() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M2 10h2M20 10h2M2 14h2M20 14h2"/></svg>;
}
function IconStar() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

// ─── Step badge ───────────────────────────────────────────────────────────────
function StepBadge({ n }: { n: number }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'var(--accent)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 14, flexShrink: 0,
    }}>{n}</div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ color, title, sub }: { color: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'inline-block', background: color, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, marginBottom: 10, letterSpacing: '.04em' }}>{sub}</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-.02em' }}>{title}</h2>
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ n, icon, title, desc, items }: { n: number; icon: React.ReactNode; title: string; desc: string; items: string[] }) {
  return (
    <div style={{
      display: 'flex', gap: 20,
      padding: '24px', background: 'var(--surface)',
      border: '1px solid var(--line)', borderRadius: 'var(--radius)',
    }}>
      <StepBadge n={n} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ color: 'var(--accent)' }}>{icon}</span>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 12px', lineHeight: 1.6 }}>{desc}</p>
        <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Payment / Delivery card ──────────────────────────────────────────────────
function MethodCard({ icon, title, desc, note }: { icon: React.ReactNode; title: string; desc: string; note?: string }) {
  return (
    <div style={{
      padding: '20px', background: 'var(--surface)',
      border: '1px solid var(--line)', borderRadius: 'var(--radius)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ color: 'var(--accent)' }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{desc}</div>
      {note && <div style={{ fontSize: 12, color: 'var(--ink-3)', background: 'var(--surface-2)', padding: '6px 10px', borderRadius: 6 }}>{note}</div>}
    </div>
  );
}

export default function GuidePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'var(--font-th, system-ui, sans-serif)' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1667fe 50%, #0f55e8 100%)',
        color: '#fff', padding: '60px 24px 48px',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← กลับหน้าหลัก</a>
          <h1 style={{ fontSize: 38, fontWeight: 800, margin: '0 0 12px', letterSpacing: '-.02em', lineHeight: 1.15 }}>
            คู่มือการใช้งาน PloiKhong
          </h1>
          <p style={{ fontSize: 16, opacity: .85, margin: 0, maxWidth: 520, lineHeight: 1.7 }}>
            ตลาดซื้อขายออนไลน์ที่ใช้งานง่าย — ลงขายฟรี ไม่จำกัด ค้นหาสะดวก ติดต่อผู้ขายได้ทันที
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── สำหรับผู้ซื้อ ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <SectionHeader color="#16a34a" title="สำหรับผู้ซื้อ" sub="🛒 ขั้นตอนการซื้อสินค้า" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StepCard n={1} icon={<IconUser />}
              title="สมัครสมาชิก / เข้าสู่ระบบ"
              desc="สร้างบัญชีฟรี ใช้เวลาไม่ถึง 1 นาที"
              items={[
                'กดปุ่ม "เข้าสู่ระบบ" ที่มุมขวาบนของหน้าเว็บ',
                'สมัครด้วย Google หรืออีเมล + รหัสผ่าน',
                'ยืนยันอีเมลแล้วเริ่มใช้งานได้ทันที',
              ]} />
            <StepCard n={2} icon={<IconSearch />}
              title="ค้นหาและเลือกดูสินค้า"
              desc="ค้นหาสินค้าที่ต้องการได้หลายวิธี"
              items={[
                'พิมพ์ชื่อสินค้าในช่องค้นหาที่ด้านบน',
                'กรองสินค้าตามหมวดหมู่ ราคา สภาพสินค้า และพื้นที่',
                'กดที่การ์ดสินค้าเพื่อดูรูปภาพและรายละเอียดเพิ่มเติม',
                'กดหัวใจ ❤️ เพื่อบันทึกสินค้าที่สนใจลงใน Wishlist',
              ]} />
            <StepCard n={3} icon={<IconChat />}
              title="ติดต่อผู้ขาย"
              desc="แชทโดยตรงกับผู้ขายได้ทันที ไม่มีตัวกลาง"
              items={[
                'กดปุ่ม "แชท" หรือ "ติดต่อผู้ขาย" ในหน้ารายละเอียดสินค้า',
                'สอบถามรายละเอียด ขอรูปเพิ่มเติม หรือนัดหมายกับผู้ขายได้เลย',
                'กด "เสนอราคา" เพื่อต่อรองราคากับผู้ขาย',
                'รับการแจ้งเตือนทันทีเมื่อผู้ขายตอบกลับ',
              ]} />
            <StepCard n={4} icon={<IconMoney />}
              title="ชำระเงินและรับสินค้า"
              desc="ตกลงวิธีชำระเงินและจัดส่งกับผู้ขายผ่านแชท"
              items={[
                'ตกลงราคาและวิธีชำระเงินกับผู้ขายในแชท',
                'ชำระเงินตามวิธีที่ตกลงกัน (โอนเงิน / เงินสด / PromptPay)',
                'นัดรับสินค้าโดยตรงหรือให้ผู้ขายจัดส่งพัสดุ',
                'รีวิวและให้คะแนนผู้ขายหลังรับสินค้า',
              ]} />
          </div>
        </section>

        {/* ── สำหรับผู้ขาย ─────────────────────────────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <SectionHeader color="#e63946" title="สำหรับผู้ขาย" sub="📦 วิธีลงขายสินค้า" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StepCard n={1} icon={<IconUser />}
              title="สมัครสมาชิก"
              desc="บัญชีเดียวใช้ได้ทั้งซื้อและขาย"
              items={[
                'สมัครสมาชิกฟรีด้วย Google หรืออีเมล',
                'ไม่มีค่าธรรมเนียมสมัคร ไม่มีค่าลงประกาศ',
                'ลงขายได้ไม่จำกัดจำนวนสินค้า',
              ]} />
            <StepCard n={2} icon={<IconCamera />}
              title="ถ่ายรูปสินค้าให้สวยและชัด"
              desc="รูปภาพคือสิ่งแรกที่ผู้ซื้อจะเห็น — ยิ่งสวยยิ่งขายได้"
              items={[
                'ถ่ายรูปสินค้าในที่แสงสว่าง ไม่มีเงา',
                'ถ่ายหลายมุม ทั้งด้านหน้า ด้านหลัง และรายละเอียดสำคัญ',
                'อัปโหลดได้สูงสุด 5 รูปต่อ 1 ประกาศ',
                'แนะนำขนาดภาพ 1:1 หรือ 4:3 ให้ดูดีที่สุด',
              ]} />
            <StepCard n={3} icon={<IconTag />}
              title="กรอกรายละเอียดสินค้า"
              desc="ข้อมูลครบถ้วนช่วยให้ผู้ซื้อตัดสินใจง่ายขึ้น"
              items={[
                'ชื่อสินค้า: ระบุให้ชัดเจน เช่น ยี่ห้อ รุ่น สี ขนาด',
                'คำอธิบาย: บอกรายละเอียด สภาพ ข้อดี ข้อเสีย อย่างตรงไปตรงมา',
                'ราคา: ตั้งราคาที่ต้องการ สามารถเปิด/ปิด "ต่อรองราคาได้" ได้',
                'หมวดหมู่: เลือกหมวดที่ตรงกับสินค้าเพื่อให้ค้นหาเจอง่าย',
                'สภาพสินค้า: เลือกจาก ใหม่ในกล่อง / สภาพ 95%+ / สภาพดี / ทั่วไป / ซ่อมได้',
              ]} />
            <StepCard n={4} icon={<IconTruck />}
              title="เลือกวิธีจัดส่ง"
              desc="ระบุวิธีจัดส่งให้ผู้ซื้อทราบล่วงหน้า"
              items={[
                'นัดรับด้วยตัวเอง: ผู้ซื้อมารับสินค้าที่นัดหมาย',
                'ส่งพัสดุ: ส่งผ่าน Kerry / Flash Express / ไปรษณีย์ไทย',
                'ระบุค่าจัดส่งในคำอธิบายหรือตกลงกับผู้ซื้อในแชท',
              ]} />
            <StepCard n={5} icon={<IconStar />}
              title="Boost สินค้าให้ขายเร็วขึ้น (ตัวเลือกเสริม)"
              desc="ใช้เหรียญเพิ่มการมองเห็นสินค้าของคุณ"
              items={[
                'สินค้าเด่น (Featured): ปักหมุดหน้าแรก 7 วัน — 80 เหรียญ',
                'Boost สินค้า: ดันขึ้นบนสุดในหมวดหมู่ — 30 เหรียญ',
                'ซื้อเหรียญได้ที่เมนู "เติมเหรียญ & Premium" ในบัญชีของคุณ',
              ]} />
          </div>
        </section>

        {/* ── วิธีชำระเงิน ──────────────────────────────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <SectionHeader color="#f97316" title="วิธีชำระเงิน" sub="💳 Payment Methods" />
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.7 }}>
            การชำระเงินสินค้าบน PloiKhong เป็นการตกลงกันโดยตรงระหว่างผู้ซื้อและผู้ขาย
            รองรับหลากหลายวิธีตามที่ผู้ขายกำหนด
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
            <MethodCard icon={<IconQR />}
              title="PromptPay / พร้อมเพย์"
              desc="โอนเงินผ่าน QR Code หรือหมายเลขพร้อมเพย์ได้ทันที รองรับทุกธนาคาร"
              note="✅ วิธีที่นิยมที่สุด — รวดเร็ว ปลอดภัย" />
            <MethodCard icon={<IconBank />}
              title="โอนเงินผ่านธนาคาร"
              desc="โอนตรงเข้าบัญชีธนาคารของผู้ขาย รองรับทุกธนาคารในไทย เช่น กสิกร SCB กรุงไทย ออมสิน"
              note="📱 ใช้ได้ผ่าน Mobile Banking ทุกแอป" />
            <MethodCard icon={<IconCash />}
              title="เงินสด (นัดรับ)"
              desc="จ่ายเงินสดเมื่อนัดรับสินค้าด้วยตัวเอง ตรวจสอบสินค้าได้ก่อนจ่าย"
              note="🤝 เหมาะสำหรับสินค้าราคาสูงหรือต้องการตรวจสอบก่อนซื้อ" />
            <MethodCard icon={<IconCard />}
              title="วิธีอื่นๆ"
              desc="True Money Wallet, Line Pay, หรือวิธีอื่นตามที่ผู้ซื้อ-ผู้ขายตกลงกัน"
              note="💬 ตกลงวิธีชำระเงินกับผู้ขายในแชทได้เลย" />
          </div>
          <div style={{
            background: '#fef3c7', border: '1px solid #fde68a',
            borderRadius: 'var(--radius)', padding: '14px 18px',
            fontSize: 13, color: '#92400e', lineHeight: 1.7,
          }}>
            ⚠️ <strong>คำแนะนำด้านความปลอดภัย:</strong> ควรตรวจสอบประวัติและรีวิวของผู้ขายก่อนโอนเงิน
            และเก็บหลักฐานการโอนเงินไว้เสมอ หากพบปัญหาสามารถแจ้งทีมงาน PloiKhong ได้ทันที
          </div>
        </section>

        {/* ── วิธีจัดส่ง ────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <SectionHeader color="#1d4ed8" title="วิธีจัดส่งสินค้า" sub="🚚 Delivery Methods" />
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.7 }}>
            ผู้ขายสามารถเลือกวิธีจัดส่งสินค้าได้หลากหลาย
            ผู้ซื้อและผู้ขายสามารถตกลงกันได้โดยตรงผ่านระบบแชท
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            <MethodCard icon={<IconPin />}
              title="นัดรับด้วยตัวเอง"
              desc="ผู้ซื้อเดินทางมารับสินค้าที่นัดหมายกับผู้ขาย เหมาะสำหรับสินค้าขนาดใหญ่หรือต้องการตรวจสอบก่อนซื้อ"
              note="📍 ตกลงสถานที่นัดรับในแชทได้เลย" />
            <MethodCard icon={<IconTruck />}
              title="Kerry Express"
              desc="บริการขนส่งเอกชนที่ครอบคลุมทั่วประเทศ ส่งได้ถึงบ้าน มีระบบติดตามพัสดุ"
              note="⏱ ส่งถึงใน 1-3 วันทำการ" />
            <MethodCard icon={<IconTruck />}
              title="Flash Express"
              desc="บริการขนส่งราคาประหยัด ครอบคลุมทั่วประเทศ เหมาะสำหรับสินค้าขนาดเล็ก-กลาง"
              note="⏱ ส่งถึงใน 1-3 วันทำการ" />
            <MethodCard icon={<IconTruck />}
              title="ไปรษณีย์ไทย (EMS / พัสดุ)"
              desc="บริการของรัฐที่ครอบคลุมทุกพื้นที่ รวมถึงพื้นที่ห่างไกล เหมาะสำหรับสินค้าทุกขนาด"
              note="⏱ EMS 1-3 วัน / พัสดุ 3-7 วัน" />
          </div>

          <div style={{
            marginTop: 20, background: 'var(--surface-2)',
            border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px 20px',
            fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.8,
          }}>
            <strong>หมายเหตุ:</strong> ค่าจัดส่งและขั้นตอนการส่งสินค้าเป็นข้อตกลงระหว่างผู้ซื้อและผู้ขายโดยตรง
            PloiKhong ทำหน้าที่เป็นแพลตฟอร์มกลางในการซื้อขาย ไม่ใช่ผู้ดำเนินการจัดส่ง
          </div>
        </section>

        {/* ── เกี่ยวกับ ─────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 48 }}>
          <SectionHeader color="#8b5cf6" title="เกี่ยวกับ PloiKhong" sub="ℹ️ About Us" />
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 'var(--radius)', padding: '28px',
            display: 'flex', flexDirection: 'column', gap: 14,
            fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.8,
          }}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--ink)' }}>PloiKhong (ปล่อยของ)</strong> คือแพลตฟอร์มตลาดซื้อขายออนไลน์
              ที่เชื่อมต่อผู้ซื้อและผู้ขายในประเทศไทย รองรับสินค้าทุกประเภท ทั้งสินค้าใหม่และสินค้าผ่านการใช้งาน
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--ink)' }}>ลงขายฟรีไม่จำกัด</strong> — ไม่มีค่าธรรมเนียมลงประกาศ
              ผู้ขายสามารถโพสต์สินค้าได้ไม่จำกัดจำนวน รายได้หลักของแพลตฟอร์มมาจากบริการเสริม
              เช่น การ Boost สินค้าและแพ็กเกจ Premium สำหรับผู้ขาย
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 4 }}>
              {[
                { label: '🌐 เว็บไซต์', val: 'ploikhong.com' },
                { label: '📧 อีเมล', val: 'support@ploikhong.com' },
                { label: '📞 โทร', val: '-' },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'var(--surface-2)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '8px 14px', fontSize: 13,
                }}>
                  <span style={{ color: 'var(--ink-3)' }}>{item.label}: </span>
                  <strong>{item.val}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center', padding: '32px',
          background: 'linear-gradient(135deg, #1d4ed8, #1667fe)',
          borderRadius: 'var(--radius)', color: '#fff',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>พร้อมเริ่มซื้อขายแล้วใช่ไหม?</div>
          <div style={{ fontSize: 14, opacity: .85, marginBottom: 20 }}>ลงขายฟรี ไม่จำกัด ไม่มีค่าธรรมเนียม</div>
          <a href="/" style={{
            display: 'inline-block', padding: '12px 32px',
            background: '#fff', color: '#1667fe',
            borderRadius: 'var(--radius-sm)', fontSize: 15, fontWeight: 700,
            textDecoration: 'none',
          }}>เริ่มต้นใช้งาน →</a>
        </div>

      </div>
    </div>
  );
}
