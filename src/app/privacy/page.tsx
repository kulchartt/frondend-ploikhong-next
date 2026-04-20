export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>นโยบายความเป็นส่วนตัว</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 40 }}>อัปเดตล่าสุด: เมษายน 2569</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>1. ข้อมูลที่เราเก็บรวบรวม</h2>
        <p>เราเก็บรวบรวมข้อมูลที่จำเป็นสำหรับการให้บริการ ได้แก่ ชื่อ อีเมล และรูปโปรไฟล์ที่ได้รับจากการเข้าสู่ระบบผ่าน Google หรือ Facebook</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>2. วัตถุประสงค์การใช้ข้อมูล</h2>
        <p>ข้อมูลของคุณถูกใช้เพื่อ:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>ยืนยันตัวตนและเข้าสู่ระบบ</li>
          <li>แสดงโปรไฟล์ผู้ใช้ในแพลตฟอร์ม</li>
          <li>อำนวยความสะดวกในการซื้อขายสินค้ามือสอง</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>3. การแบ่งปันข้อมูล</h2>
        <p>เราไม่ขาย ไม่เช่า และไม่เปิดเผยข้อมูลส่วนตัวของคุณให้กับบุคคลที่สาม ยกเว้นกรณีที่กฎหมายกำหนด</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>4. การลบข้อมูล</h2>
        <p>คุณสามารถขอลบข้อมูลส่วนตัวของคุณออกจากระบบได้ที่ <a href="/delete" style={{ color: '#e03e1a' }}>หน้าลบข้อมูล</a></p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>5. ติดต่อเรา</h2>
        <p>หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อ <a href="mailto:support@ploikhong.com" style={{ color: '#e03e1a' }}>support@ploikhong.com</a></p>
      </section>
    </div>
  );
}
