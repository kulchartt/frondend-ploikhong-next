import Link from 'next/link';

export const metadata = { title: 'นโยบายการคืนสินค้า — PloiKhong' };

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>{title}</h2>
    <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.8 }}>{children}</div>
  </section>
);

export default function RefundPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'var(--font-th, sans-serif)', color: '#1a1a1a', lineHeight: 1.7 }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>← กลับหน้าแรก</Link>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: '#0f172a' }}>นโยบายการคืนสินค้า</h1>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 40 }}>อัปเดตล่าสุด: เมษายน 2569</p>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 18px', marginBottom: 32, fontSize: 13, color: '#1e40af' }}>
        ℹ️ PloiKhong เป็นแพลตฟอร์มกลางในการซื้อขาย การคืนสินค้าขึ้นอยู่กับข้อตกลงระหว่างผู้ซื้อและผู้ขายเป็นหลัก
      </div>

      <S title="1. กรณีที่สามารถขอคืนสินค้าได้">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>สินค้าไม่ตรงปก</strong> — รูปภาพหรือคำอธิบายไม่ตรงกับสินค้าที่ได้รับ</li>
          <li><strong>สินค้าชำรุดจากการส่ง</strong> — สินค้าเสียหายระหว่างขนส่ง มีหลักฐานรูปถ่ายชัดเจน</li>
          <li><strong>ได้รับสินค้าผิด</strong> — ได้รับสินค้าที่ไม่ตรงกับที่สั่ง</li>
          <li><strong>สินค้าไม่ครบ</strong> — ไม่ได้รับสินค้าครบตามที่ตกลงกัน</li>
        </ul>
      </S>

      <S title="2. กรณีที่ไม่รับการคืนสินค้า">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>เปลี่ยนใจหลังซื้อ (ไม่รับคืนเนื่องจากเปลี่ยนใจ)</li>
          <li>สินค้าเสียหายจากการใช้งานของผู้ซื้อหลังรับสินค้า</li>
          <li>แจ้งปัญหาหลังจาก 7 วันนับจากวันที่รับสินค้า</li>
          <li>ผู้ขายระบุชัดเจนว่า &quot;ไม่รับคืน&quot; และผู้ซื้อยืนยันซื้อแล้ว</li>
        </ul>
      </S>

      <S title="3. ขั้นตอนการขอคืนสินค้า">
        {[
          { step: '01', title: 'ติดต่อผู้ขาย', desc: 'แจ้งปัญหาผ่านระบบแชทใน PloiKhong ภายใน 7 วันหลังรับสินค้า พร้อมแนบรูปภาพหลักฐาน' },
          { step: '02', title: 'รอการตอบรับ', desc: 'ผู้ขายจะตอบกลับภายใน 48 ชั่วโมง หากไม่ได้รับการตอบรับให้แจ้ง PloiKhong' },
          { step: '03', title: 'ส่งสินค้าคืน', desc: 'หากผู้ขายยินยอมคืน ให้ส่งสินค้ากลับด้วยบริการขนส่งที่มีการติดตามพัสดุ เก็บหลักฐานการส่ง' },
          { step: '04', title: 'รับเงินคืน', desc: 'เมื่อผู้ขายได้รับสินค้าและตรวจสอบแล้ว จะโอนเงินคืนภายใน 3-5 วันทำการ' },
        ].map(s => (
          <div key={s.step} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: 'monospace' }}>{s.step}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#0f172a' }}>{s.title}</div>
              <div style={{ fontSize: 13, color: '#475569' }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </S>

      <S title="4. การระงับข้อพิพาท">
        <p>หากผู้ซื้อและผู้ขายไม่สามารถตกลงกันได้ สามารถแจ้ง PloiKhong เพื่อช่วยไกล่เกลี่ยได้ที่ <a href="mailto:support@ploikhong.com" style={{ color: '#e03e1a' }}>support@ploikhong.com</a></p>
        <p style={{ marginTop: 8 }}>ทีมงานจะพิจารณาจากหลักฐานทั้งสองฝ่ายและตัดสินใจโดยยึดถือความยุติธรรมเป็นหลัก</p>
      </S>

      <S title="5. ค่าใช้จ่ายในการส่งคืน">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong>ความผิดของผู้ขาย</strong> — ผู้ขายรับผิดชอบค่าขนส่งทั้งหมด</li>
          <li><strong>ตกลงร่วมกัน</strong> — แบ่งค่าขนส่งตามข้อตกลง</li>
          <li><strong>เปลี่ยนใจผู้ซื้อ</strong> — ผู้ซื้อรับผิดชอบค่าขนส่งเอง (กรณีผู้ขายยินยอมรับคืน)</li>
        </ul>
      </S>

      <div style={{ marginTop: 40, padding: '16px 20px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#64748b' }}>
        ต้องการความช่วยเหลือ? ติดต่อ <a href="mailto:support@ploikhong.com" style={{ color: '#e03e1a' }}>support@ploikhong.com</a> หรือ <Link href="/rules" style={{ color: '#e03e1a' }}>ดูกฎข้อบังคับ</Link>
      </div>
    </div>
  );
}
