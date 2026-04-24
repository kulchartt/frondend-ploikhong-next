// ===== Footer =====
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="v2-footer">
      <div className="v2-footer-in">
        {/* Brand + mission */}
        <div className="v2-ft-brand">
          <PloiLogo size={16} markSize={30}/>
          <p className="v2-ft-tag">ตลาดซื้อ-ขายของมือสองที่ใส่ใจคุณภาพและความปลอดภัย</p>
          <div className="v2-ft-apps">
            <button className="v2-ft-app">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              <div>
                <small>ดาวน์โหลดจาก</small>
                <b>App Store</b>
              </div>
            </button>
            <button className="v2-ft-app">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.302 2.303L5.864 2.658z"/></svg>
              <div>
                <small>ดาวน์โหลดจาก</small>
                <b>Google Play</b>
              </div>
            </button>
          </div>
        </div>

        {/* Column 1: ซื้อขาย */}
        <div className="v2-ft-col">
          <h4>ซื้อ-ขาย</h4>
          <ul>
            <li><a href="#">ค้นหาของมือสอง</a></li>
            <li><a href="#" onClick={(e)=>{e.preventDefault(); window.__openListing && window.__openListing();}}>ลงขายฟรี</a></li>
            <li><a href="#">ของมาใหม่</a></li>
            <li><a href="#">Featured Products</a></li>
            <li><a href="#">ดีลพนักงาน</a></li>
          </ul>
        </div>

        {/* Column 2: ช่วยเหลือ */}
        <div className="v2-ft-col">
          <h4>ช่วยเหลือ</h4>
          <ul>
            <li><a href="#">วิธีใช้งาน</a></li>
            <li><a href="#">คำถามที่พบบ่อย (FAQ)</a></li>
            <li><a href="#">ติดต่อฝ่ายบริการ</a></li>
            <li><a href="#">ศูนย์ความปลอดภัย</a></li>
            <li><a href="#">ทริคไม่โดนโกง</a></li>
          </ul>
        </div>

        {/* Column 3: เกี่ยวกับ */}
        <div className="v2-ft-col">
          <h4>เกี่ยวกับ ปลิวคง</h4>
          <ul>
            <li><a href="#">เกี่ยวกับเรา</a></li>
            <li><a href="#">บล็อก & ข่าวสาร</a></li>
            <li><a href="#">ร่วมงานกับเรา</a></li>
            <li><a href="#">สื่อมวลชน</a></li>
            <li><a href="#">พาร์ทเนอร์</a></li>
          </ul>
        </div>

        {/* Column 4: กฎและนโยบาย */}
        <div className="v2-ft-col">
          <h4>กฎและนโยบาย</h4>
          <ul>
            <li><a href="#">ข้อกำหนดการใช้งาน</a></li>
            <li><a href="#">นโยบายความเป็นส่วนตัว (PDPA)</a></li>
            <li><a href="#">กฎชุมชน</a></li>
            <li><a href="#">นโยบายการคืนเงิน</a></li>
            <li><a href="#">นโยบายคุกกี้</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="v2-ft-bot">
        <div className="v2-ft-bot-in">
          <div className="v2-ft-social">
            <a href="#" aria-label="Facebook" className="v2-ft-s"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47h-3.047V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z"/></svg></a>
            <a href="#" aria-label="Instagram" className="v2-ft-s"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/></svg></a>
            <a href="#" aria-label="Line" className="v2-ft-s"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.365 9.89c.50 0 .90.41.90.92s-.41.92-.91.92h-1.27v.82h1.27c.50 0 .91.41.91.92s-.41.92-.91.92h-2.19c-.50 0-.91-.41-.91-.92V8.92c0-.50.41-.92.91-.92h2.19c.50 0 .91.41.91.92s-.41.92-.91.92h-1.27v.82h1.27zM15.58 13.46c0 .40-.25.74-.63.86-.09.03-.19.04-.28.04-.30 0-.58-.14-.75-.39l-2.24-3.04v2.52c0 .50-.41.92-.91.92s-.91-.41-.91-.92V8.92c0-.40.25-.74.62-.86.09-.03.19-.05.29-.05.28 0 .56.14.73.38l2.25 3.04V8.92c0-.50.41-.92.91-.92s.91.41.91.92v4.54zM8.84 14.38h-2.19c-.50 0-.91-.41-.91-.92V8.92c0-.50.41-.92.91-.92s.91.41.91.92v3.63h1.28c.50 0 .91.41.91.92s-.41.91-.91.91zM4.76 13.46c0 .50-.41.92-.91.92s-.91-.41-.91-.92V8.92c0-.50.41-.92.91-.92s.91.41.91.92v4.54zM12 0C5.37 0 0 4.40 0 9.80c0 4.84 4.25 8.89 10 9.67.39.08.92.26 1.06.59.12.30.08.78.04 1.09l-.17.99c-.05.30-.24 1.14 1.00.62 1.25-.52 6.71-3.95 9.16-6.77C22.77 14.11 24 12.11 24 9.80 24 4.40 18.62 0 12 0z"/></svg></a>
            <a href="#" aria-label="X" className="v2-ft-s"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
            <a href="#" aria-label="TikTok" className="v2-ft-s"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></a>
          </div>
          <div className="v2-ft-trust">
            <span className="v2-ft-badge">🔒 เข้ารหัส SSL</span>
            <span className="v2-ft-badge">🇹🇭 จดทะเบียนในประเทศไทย</span>
            <span className="v2-ft-badge">DBD Verified</span>
          </div>
        </div>
        <div className="v2-ft-bot-in v2-ft-legal">
          <span>© {year} ปลิวคง จำกัด · เลขจดทะเบียน 0105567012345 · เลขประจำตัวผู้เสียภาษี 0992001234567</span>
          <span className="v2-ft-links">
            <a href="#">ข้อกำหนด</a> · <a href="#">ความเป็นส่วนตัว</a> · <a href="#">คุกกี้</a> · <a href="#">ลบบัญชี</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
window.Footer = Footer;
