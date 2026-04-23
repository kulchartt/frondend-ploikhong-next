export default function HelpPage() {
  const faqs = [
    {
      q: 'ลงขายสินค้าได้ฟรีไหม?',
      a: 'ฟรีทั้งหมดครับ ไม่มีค่าธรรมเนียมในการลงประกาศ สามารถลงได้ไม่จำกัดจำนวน',
    },
    {
      q: 'จะซื้อสินค้าได้อย่างไร?',
      a: 'กดที่สินค้าที่สนใจ แล้วกดปุ่ม "แชท" เพื่อติดต่อผู้ขายโดยตรง หรือกด "เสนอราคา" เพื่อต่อรองราคา',
    },
    {
      q: 'ชำระเงินผ่านช่องทางไหนได้บ้าง?',
      a: 'PloiKhong เป็นตลาดกลาง ผู้ซื้อและผู้ขายตกลงวิธีชำระเงินกันเอง เช่น โอนผ่านธนาคาร PromptPay หรือนัดรับจ่ายเงินสด',
    },
    {
      q: 'ถ้าสินค้าไม่ตรงปกทำอย่างไร?',
      a: 'ติดต่อผู้ขายโดยตรงผ่านระบบแชทก่อน หากไม่สามารถแก้ไขได้ ใช้ปุ่มร้องเรียนที่ด้านล่างของเว็บไซต์ ทีมงานจะดูแลภายใน 24 ชั่วโมง',
    },
    {
      q: 'PloiCoin คืออะไร?',
      a: 'เหรียญ PloiCoin ใช้เปิดฟีเจอร์พิเศษสำหรับผู้ขาย เช่น ดันสินค้าขึ้นบนสุด ตั้งสินค้าเด่น แจ้งเตือนผู้ติดตาม และ Analytics Pro',
    },
    {
      q: 'ลืมรหัสผ่านทำอย่างไร?',
      a: 'กดปุ่ม "เข้าสู่ระบบ" แล้วเลือก "ลืมรหัสผ่าน?" ระบบจะส่งลิงก์รีเซ็ตไปที่อีเมลของคุณ',
    },
    {
      q: 'จะลบบัญชีได้อย่างไร?',
      a: 'ติดต่อทีมงานผ่านปุ่มร้องเรียนด้านล่าง พร้อมระบุว่าต้องการลบบัญชี ทีมงานจะดำเนินการให้ภายใน 7 วันทำการ',
    },
    {
      q: 'แอปพลิเคชันมือถือมีไหม?',
      a: 'ยังไม่มีครับ แต่เว็บไซต์รองรับมือถือ (responsive) ใช้งานได้ดีบนทุกอุปกรณ์',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>
        <a href="/" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← กลับหน้าหลัก</a>

        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>ศูนย์ช่วยเหลือ</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 48 }}>คำถามที่พบบ่อย — หากไม่พบคำตอบ กดปุ่มร้องเรียนด้านล่างได้เลยครับ</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {faqs.map((item, i) => (
            <div key={i} style={{
              border: '1px solid var(--line)', borderRadius: 'var(--radius)',
              padding: '20px 24px', background: 'var(--surface)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--ink)' }}>
                {item.q}
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {item.a}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 48, padding: '24px', background: 'var(--surface-2)',
          borderRadius: 'var(--radius)', border: '1px solid var(--line)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>ยังไม่พบคำตอบ?</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>ทีมงานพร้อมช่วยเหลือคุณทุกวัน</div>
          <a href="/" style={{
            display: 'inline-block', padding: '10px 24px',
            background: 'var(--accent)', color: '#fff',
            borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700,
            textDecoration: 'none',
          }}>🚨 ร้องเรียน / แจ้งปัญหา</a>
        </div>
      </div>
    </div>
  );
}
