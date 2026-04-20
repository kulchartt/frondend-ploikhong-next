export default function DeleteDataPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'sans-serif', color: '#1a1a1a', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>การลบข้อมูลส่วนตัว</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 40 }}>อัปเดตล่าสุด: เมษายน 2569</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>วิธีขอลบข้อมูล</h2>
        <p>หากคุณต้องการลบข้อมูลส่วนตัวทั้งหมดออกจากระบบ PloiKhong กรุณาส่งอีเมลมาที่:</p>
        <p style={{ marginTop: 12 }}>
          <a href="mailto:support@ploikhong.com" style={{ color: '#e03e1a', fontWeight: 600, fontSize: 16 }}>
            support@ploikhong.com
          </a>
        </p>
        <p style={{ marginTop: 12 }}>ระบุหัวข้อ: <strong>"ขอลบข้อมูลส่วนตัว"</strong> พร้อมอีเมลที่ใช้สมัคร</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>ข้อมูลที่จะถูกลบ</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>ชื่อและอีเมลของคุณ</li>
          <li>รูปโปรไฟล์</li>
          <li>ประวัติการโพสต์สินค้า</li>
          <li>ประวัติการสนทนา</li>
          <li>รายการถูกใจ</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>ระยะเวลาดำเนินการ</h2>
        <p>เราจะดำเนินการลบข้อมูลภายใน <strong>30 วัน</strong> นับจากวันที่ได้รับคำร้อง</p>
      </section>
    </div>
  );
}
