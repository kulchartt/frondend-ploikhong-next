import Link from 'next/link';

export const metadata = { title: 'กฎและข้อบังคับ — PloiKhong' };

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>{title}</h2>
    <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.8 }}>{children}</div>
  </section>
);

const BANNED = [
  'อาวุธปืน กระสุน วัตถุระเบิด และอาวุธทุกประเภทที่ผิดกฎหมาย',
  'สารเสพติดและสารที่ควบคุมโดยกฎหมาย',
  'สินค้าปลอม สินค้าละเมิดลิขสิทธิ์ หรือสินค้าละเมิดเครื่องหมายการค้า',
  'สัตว์ป่าคุ้มครองและชิ้นส่วนจากสัตว์ผิดกฎหมาย',
  'สื่อลามกอนาจาร หรือสื่อที่ไม่เหมาะสมสำหรับเด็ก',
  'บัตรเครดิต บัตรเดบิต หรือข้อมูลทางการเงินที่ผิดกฎหมาย',
  'บัญชีผู้ใช้ รหัสผ่าน หรือข้อมูลส่วนตัวของบุคคลอื่น',
  'ยาที่ต้องใช้ใบสั่งแพทย์โดยไม่มีเอกสารที่ถูกต้อง',
  'ผลิตภัณฑ์ปลอมแปลงเอกสารราชการ',
  'สินค้าที่ส่งเสริมความเกลียดชัง การเหยียดเชื้อชาติ หรือความรุนแรง',
];

const RESTRICTED = [
  { item: 'ยาและอาหารเสริม', note: 'ต้องแสดงฉลาก อย. ที่ถูกต้อง' },
  { item: 'เครื่องใช้ไฟฟ้าผ่านการใช้งาน', note: 'ต้องระบุสภาพและความปลอดภัยครบถ้วน' },
  { item: 'ยานพาหนะ', note: 'ต้องมีเอกสารกรรมสิทธิ์ครบถ้วน' },
  { item: 'สินค้าสำหรับผู้ใหญ่', note: 'ต้องยืนยันอายุและปฏิบัติตามกฎหมาย' },
  { item: 'ของโบราณและศิลปวัตถุ', note: 'ต้องมีเอกสารรับรองแหล่งที่มา' },
];

export default function RulesPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'var(--font-th, sans-serif)', color: '#1a1a1a', lineHeight: 1.7 }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>← กลับหน้าแรก</Link>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: '#0f172a' }}>กฎและข้อบังคับ</h1>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 40 }}>อัปเดตล่าสุด: เมษายน 2569 · บังคับใช้กับผู้ใช้ทุกคน</p>

      <S title="1. หลักการทั่วไป">
        <p>PloiKhong มุ่งมั่นสร้างตลาดซื้อขายที่ปลอดภัย โปร่งใส และยุติธรรมสำหรับทุกคน ผู้ใช้ทุกคนต้องปฏิบัติตามกฎเหล่านี้อย่างเคร่งครัด การฝ่าฝืนอาจส่งผลให้บัญชีถูกระงับหรือถูกดำเนินคดีตามกฎหมาย</p>
      </S>

      <S title="2. สินค้าต้องห้าม (ห้ามขายโดยเด็ดขาด)">
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '16px 20px', marginBottom: 0 }}>
          <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, margin: 0 }}>
            {BANNED.map(item => (
              <li key={item} style={{ color: '#991b1b' }}>{item}</li>
            ))}
          </ul>
        </div>
      </S>

      <S title="3. สินค้าควบคุม (ขายได้ภายใต้เงื่อนไข)">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 700, border: '1px solid #e2e8f0' }}>ประเภทสินค้า</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 700, border: '1px solid #e2e8f0' }}>เงื่อนไข</th>
            </tr>
          </thead>
          <tbody>
            {RESTRICTED.map(r => (
              <tr key={r.item}>
                <td style={{ padding: '10px 14px', fontSize: 13, border: '1px solid #e2e8f0', fontWeight: 600 }}>{r.item}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, border: '1px solid #e2e8f0', color: '#475569' }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </S>

      <S title="4. มาตรฐานชุมชน">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>ห้ามใช้ภาษาหยาบคาย ข่มขู่ หรือคุกคามผู้ใช้อื่น</li>
          <li>ห้ามสแปม หรือลงประกาศซ้ำซ้อนเพื่อดันอันดับ</li>
          <li>ห้ามใช้ชื่อ รูปภาพ หรือข้อมูลของบุคคลอื่นโดยไม่ได้รับอนุญาต</li>
          <li>ห้ามหลอกลวงผู้ซื้อด้วยข้อมูลเท็จหรือรูปภาพที่ไม่ตรงกับสินค้าจริง</li>
          <li>ห้ามขอข้อมูลส่วนตัวของผู้ใช้นอกแพลตฟอร์มเพื่อหลอกลวง</li>
        </ul>
      </S>

      <S title="5. การรายงานและบังคับใช้">
        <p>หากพบเนื้อหาหรือผู้ใช้ที่ฝ่าฝืนกฎ สามารถแจ้งได้ทันทีผ่านปุ่ม &quot;ร้องเรียน&quot; ที่อยู่ด้านล่างของทุกหน้า หรืออีเมลมาที่ <a href="mailto:report@ploikhong.com" style={{ color: '#e03e1a' }}>report@ploikhong.com</a></p>
        <p style={{ marginTop: 8 }}>เราจะตรวจสอบและดำเนินการภายใน 24 ชั่วโมงในวันทำการ</p>
      </S>

      <S title="6. บทลงโทษ">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong>คำเตือน</strong> — ครั้งแรกที่ฝ่าฝืนกฎเล็กน้อย</li>
          <li><strong>ระงับประกาศ</strong> — ลบสินค้าที่ผิดกฎออกจากระบบ</li>
          <li><strong>ระงับบัญชีชั่วคราว</strong> — 7-30 วัน สำหรับการฝ่าฝืนซ้ำ</li>
          <li><strong>ระงับบัญชีถาวร</strong> — สำหรับการฝ่าฝืนร้ายแรงหรือซ้ำซาก</li>
          <li><strong>แจ้งความดำเนินคดี</strong> — กรณีที่เกี่ยวข้องกับกฎหมาย</li>
        </ul>
      </S>

      <div style={{ marginTop: 40, padding: '16px 20px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>⚠️ พบการละเมิดกฎ?</div>
          <div style={{ fontSize: 13, color: '#7f1d1d' }}>แจ้งทีมงานได้ทันที เราจะดำเนินการอย่างเร็วที่สุด</div>
        </div>
        <a href="mailto:report@ploikhong.com?subject=แจ้งละเมิดกฎ" style={{ display: 'inline-block', padding: '9px 20px', background: '#dc2626', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          🚨 แจ้งทีมงาน
        </a>
      </div>
    </div>
  );
}
