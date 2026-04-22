import Link from 'next/link';

export const metadata = { title: 'เงื่อนไขการใช้งาน — PloiKhong' };

const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>{title}</h2>
    <div style={{ color: '#374151', fontSize: 14, lineHeight: 1.8 }}>{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'var(--font-th, sans-serif)', color: '#1a1a1a', lineHeight: 1.7 }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>← กลับหน้าแรก</Link>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: '#0f172a' }}>เงื่อนไขการใช้งาน</h1>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 40 }}>อัปเดตล่าสุด: เมษายน 2569 · มีผลบังคับใช้ทันที</p>

      <S title="1. การยอมรับเงื่อนไข">
        <p>การเข้าใช้งานเว็บไซต์ PloiKhong ถือว่าคุณได้อ่านและยอมรับเงื่อนไขการใช้งานฉบับนี้ทั้งหมด หากคุณไม่เห็นด้วยกับเงื่อนไขใดๆ กรุณางดใช้บริการ</p>
      </S>

      <S title="2. การลงทะเบียนและบัญชีผู้ใช้">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>ผู้ใช้ต้องมีอายุ 18 ปีขึ้นไป หรือได้รับความยินยอมจากผู้ปกครอง</li>
          <li>ข้อมูลที่ลงทะเบียนต้องเป็นความจริง ถูกต้อง และเป็นปัจจุบัน</li>
          <li>ผู้ใช้รับผิดชอบต่อการรักษาความปลอดภัยของรหัสผ่าน</li>
          <li>PloiKhong ขอสงวนสิทธิ์ระงับหรือยกเลิกบัญชีที่ฝ่าฝืนเงื่อนไขโดยไม่แจ้งล่วงหน้า</li>
        </ul>
      </S>

      <S title="3. การลงประกาศขายสินค้า">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>สินค้าที่ลงขายต้องเป็นของผู้ขายจริง ไม่ใช่ทรัพย์สินที่ได้มาโดยมิชอบ</li>
          <li>รูปภาพและรายละเอียดต้องตรงกับสินค้าจริง</li>
          <li>ห้ามลงประกาศสินค้าต้องห้ามตามกฎหมาย (ดูรายละเอียดใน <Link href="/rules" style={{ color: '#e03e1a' }}>กฎข้อบังคับ</Link>)</li>
          <li>PloiKhong ขอสงวนสิทธิ์ลบประกาศที่ไม่เหมาะสมโดยไม่แจ้งล่วงหน้า</li>
        </ul>
      </S>

      <S title="4. การซื้อขายและการชำระเงิน">
        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>PloiKhong เป็นเพียงแพลตฟอร์มกลาง ไม่ใช่คู่สัญญาในการซื้อขาย</li>
          <li>ผู้ซื้อและผู้ขายต้องตกลงราคาและเงื่อนไขกันเอง</li>
          <li>แนะนำให้นัดพบในที่สาธารณะและตรวจสอบสินค้าก่อนชำระเงิน</li>
          <li>PloiKhong ไม่รับผิดชอบต่อความเสียหายจากการซื้อขายระหว่างผู้ใช้</li>
        </ul>
      </S>

      <S title="5. ทรัพย์สินทางปัญญา">
        <p>เนื้อหา โลโก้ และซอฟต์แวร์ทั้งหมดบนเว็บไซต์นี้เป็นทรัพย์สินของ PloiKhong ห้ามคัดลอก ดัดแปลง หรือนำไปใช้เชิงพาณิชย์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</p>
      </S>

      <S title="6. การจำกัดความรับผิด">
        <p>PloiKhong ไม่รับผิดชอบต่อความเสียหายทางตรงหรือทางอ้อม รวมถึงการสูญเสียข้อมูล รายได้ หรือโอกาสทางธุรกิจที่เกิดจากการใช้งานแพลตฟอร์ม</p>
      </S>

      <S title="7. การแก้ไขเงื่อนไข">
        <p>PloiKhong ขอสงวนสิทธิ์แก้ไขเงื่อนไขการใช้งานได้ตลอดเวลา การใช้งานต่อเนื่องหลังจากมีการแก้ไขถือเป็นการยอมรับเงื่อนไขใหม่</p>
      </S>

      <div style={{ marginTop: 40, padding: '16px 20px', background: '#f8fafc', borderRadius: 10, fontSize: 13, color: '#64748b' }}>
        มีข้อสงสัย? ติดต่อ <a href="mailto:support@ploikhong.com" style={{ color: '#e03e1a' }}>support@ploikhong.com</a>
      </div>
    </div>
  );
}
