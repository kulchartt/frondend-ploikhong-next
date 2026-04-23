export default function GuidePage() {
  const steps = [
    {
      title: '1. สมัครสมาชิก',
      icon: '👤',
      items: [
        'กดปุ่ม "เข้าสู่ระบบ" ที่มุมขวาบน',
        'เลือกสมัครด้วย Google หรืออีเมล',
        'ยืนยันอีเมลแล้วเริ่มใช้งานได้ทันที',
      ],
    },
    {
      title: '2. ลงขายสินค้า',
      icon: '📦',
      items: [
        'กด "ลงขาย" ที่ Navbar หรือใน My Hub',
        'อัปโหลดรูปภาพสินค้า (สูงสุด 5 รูป)',
        'กรอกชื่อ, คำอธิบาย, ราคา, หมวดหมู่',
        'เลือกวิธีส่งสินค้าและสภาพสินค้า',
        'กด "ลงประกาศ" — สินค้าจะปรากฏทันที',
      ],
    },
    {
      title: '3. ซื้อสินค้า',
      icon: '🛒',
      items: [
        'เรียกดูสินค้าหรือค้นหาด้วยคำสำคัญ',
        'กรองตามหมวดหมู่ ราคา สภาพ และพื้นที่',
        'กดที่สินค้าเพื่อดูรายละเอียด',
        'กด "แชท" เพื่อติดต่อผู้ขาย',
        'กด "เสนอราคา" เพื่อต่อรองราคา',
      ],
    },
    {
      title: '4. ระบบแชท',
      icon: '💬',
      items: [
        'แชทได้ทันทีกับผู้ขาย/ผู้ซื้อ',
        'แนบรูปภาพสินค้าเพิ่มเติมได้',
        'ดูประวัติการแชททั้งหมดใน My Hub',
        'รับแจ้งเตือนเมื่อมีข้อความใหม่',
      ],
    },
    {
      title: '5. Wishlist & ติดตาม',
      icon: '❤️',
      items: [
        'กดหัวใจที่การ์ดสินค้าเพื่อเพิ่ม Wishlist',
        'กด "ติดตามร้าน" เพื่อรับข่าวสารจากผู้ขาย',
        'ดูรายการ Wishlist ทั้งหมดใน My Hub',
      ],
    },
    {
      title: '6. ฟีเจอร์ Premium (PloiCoin)',
      icon: '⭐',
      items: [
        'ซื้อ PloiCoin ด้วย PromptPay ใน My Hub',
        'สินค้าเด่น — ปรากฏหน้าแรก 7 วัน (80 เหรียญ)',
        'ดันสินค้าขึ้นบนสุด — 7 วัน (30 เหรียญ)',
        'แจ้งเตือนผู้ติดตาม — 30 วัน (25 เหรียญ)',
        'Analytics Pro — ดูสถิติสินค้า (50 เหรียญ)',
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>
        <a href="/" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← กลับหน้าหลัก</a>

        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>วิธีการใช้งาน</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 48 }}>เริ่มต้นใช้งาน PloiKhong ได้ง่ายๆ ใน 6 ขั้นตอน</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              border: '1px solid var(--line)', borderRadius: 'var(--radius)',
              padding: '24px', background: 'var(--surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{step.icon}</span>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{step.title}</h2>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {step.items.map((item, j) => (
                  <li key={j} style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 48, textAlign: 'center',
          padding: '24px', background: 'var(--surface-2)',
          borderRadius: 'var(--radius)', border: '1px solid var(--line)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>พร้อมเริ่มแล้ว!</div>
          <a href="/" style={{
            display: 'inline-block', padding: '10px 28px',
            background: 'var(--accent)', color: '#fff',
            borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700,
            textDecoration: 'none',
          }}>เริ่มซื้อขายเลย →</a>
        </div>
      </div>
    </div>
  );
}
