// ===== Shared mock data =====
const PRODUCTS = [
  { id:1, title:'iPhone 14 Pro 256GB สี Deep Purple เครื่องศูนย์ไทย ประกันศูนย์เหลือ 4 เดือน', price:24900, was:29900, cat:'มือถือ', cond:'มือสอง สภาพดี', seller:'TechBKK', sellerAva:'TB', loc:'กรุงเทพ · พระราม 9', posted:'2 ชม.ที่แล้ว', boost:true, free:false, flag:'HOT', img:1 },
  { id:2, title:'เก้าอี้ทำงาน Herman Miller Aeron Size B ของแท้ 100% สภาพใช้งานปกติ', price:38500, was:null, cat:'เฟอร์นิเจอร์', cond:'มือสอง', seller:'HomeOffice.th', sellerAva:'HO', loc:'กรุงเทพ · ทองหล่อ', posted:'1 วัน', boost:false, free:true, flag:null, img:2 },
  { id:3, title:'Lego Technic 42158 NASA Mars Rover Perseverance กล่องซีล ไม่เคยเปิด', price:2990, was:3490, cat:'ของเล่น', cond:'ใหม่ในกล่อง', seller:'BrickHouse', sellerAva:'BH', loc:'นนทบุรี', posted:'3 ชม.', boost:true, free:false, flag:'SALE', img:3 },
  { id:4, title:'Nintendo Switch OLED White + เกม 3 แผ่น Zelda, Mario, Smash', price:11500, was:null, cat:'เกม', cond:'มือสอง สภาพ 95%', seller:'GameLoop', sellerAva:'GL', loc:'เชียงใหม่', posted:'5 ชม.', boost:false, free:false, flag:null, img:4 },
  { id:5, title:'กล้องฟิล์ม Canon AE-1 Program + เลนส์ 50mm f/1.8 พร้อมใช้งาน', price:8900, was:null, cat:'กล้อง', cond:'มือสอง', seller:'FilmHouse', sellerAva:'FH', loc:'กรุงเทพ · อารีย์', posted:'12 ชม.', boost:false, free:false, flag:'VINTAGE', img:5 },
  { id:6, title:'รองเท้า Nike Air Jordan 1 High OG Chicago Lost & Found US 9 ใหม่ในกล่อง', price:18900, was:22000, cat:'แฟชั่น', cond:'ใหม่ในกล่อง', seller:'KickSpot', sellerAva:'KS', loc:'กรุงเทพ · สยาม', posted:'30 นาที', boost:true, free:false, flag:'HOT', img:6 },
  { id:7, title:'ตู้เย็น Samsung Side by Side 22Q ใช้งาน 1 ปี ย้ายบ้านรีบขาย', price:15900, was:28900, cat:'เครื่องใช้ไฟฟ้า', cond:'มือสอง', seller:'SomchaiC', sellerAva:'SC', loc:'ปทุมธานี', posted:'2 วัน', boost:false, free:false, flag:'-45%', img:7 },
  { id:8, title:'หนังสือ Zero to One ภาษาไทย ปกแข็ง สภาพดีเยี่ยม', price:250, was:450, cat:'หนังสือ', cond:'มือสอง', seller:'BookDrop', sellerAva:'BD', loc:'ส่งไปรษณีย์ทั่วไทย', posted:'1 ชม.', boost:false, free:true, flag:null, img:8 },
  { id:9, title:'จักรยาน Trek FX 3 Disc Size M ใช้ครั้งเดียว พร้อมไฟหน้า-ท้าย', price:18500, was:24900, cat:'กีฬา', cond:'มือสอง', seller:'VeloCafe', sellerAva:'VC', loc:'กรุงเทพ · เอกมัย', posted:'6 ชม.', boost:true, free:false, flag:'SALE', img:9 },
  { id:10, title:'MacBook Pro 14" M2 Pro 16/512 สีเงิน AppleCare เหลือ 1 ปี', price:54900, was:null, cat:'คอมพิวเตอร์', cond:'มือสอง สภาพ 99%', seller:'AppleGuy', sellerAva:'AG', loc:'กรุงเทพ · ลาดพร้าว', posted:'45 นาที', boost:true, free:false, flag:'HOT', img:10 },
  { id:11, title:'พวงมาลัยจำลอง Logitech G29 + Shifter พร้อมแท่น PlayStation', price:9500, was:null, cat:'เกม', cond:'มือสอง', seller:'SimRigs', sellerAva:'SR', loc:'ชลบุรี', posted:'8 ชม.', boost:false, free:false, flag:null, img:11 },
  { id:12, title:'แมวเปอร์เซีย 3 เดือน วัคซีนครบ 2 เข็ม ทำหมันแล้ว', price:4500, was:null, cat:'สัตว์เลี้ยง', cond:'—', seller:'CatHouse', sellerAva:'CH', loc:'กรุงเทพ · บางนา', posted:'1 วัน', boost:false, free:false, flag:null, img:12 },
];

const CATS = [
  {n:'ทั้งหมด', c:24580},
  {n:'มือถือ & แท็บเล็ต', c:3420},
  {n:'คอมพิวเตอร์', c:1890},
  {n:'เครื่องใช้ไฟฟ้า', c:2150},
  {n:'ตกแต่งบ้าน', c:1120},
  {n:'แฟชั่น', c:5200},
  {n:'กีฬา', c:940},
  {n:'ของสะสม', c:2380},
  {n:'อื่นๆ', c:4630},
];

// placeholder color palettes per image id (so each card feels different)
const IMG_TINTS = [
  ['#e9d7c0','#b5927a'],['#dce6d1','#708c7e'],['#e4d8e8','#8a6ea1'],['#d8e2ec','#5b7893'],
  ['#efe1cf','#c08a56'],['#e3d7c5','#8a7a62'],['#d5dfe8','#6a8095'],['#ece0dc','#a07d77'],
  ['#d8ddd4','#6f8170'],['#e5dbe1','#8f7387'],['#d9e4df','#6d8a81'],['#eadfd4','#a57a5a'],
];

// Money-making features
const MONEY = [
  { h:'ลงขายฟรีไม่จำกัด', d:'โพสต์สินค้าได้ไม่มีเพดาน ไม่เก็บค่าธรรมเนียมลงประกาศ ขายเท่าไหร่ก็ได้เต็มจำนวน', badge:'001' },
  { h:'Boost ดันโพสต์ขึ้นบนสุด', d:'ใช้เหรียญ 30 ดันโพสต์จัดไปบนสุด 7 วัน เพิ่มยอดเข้าชม 8-12 เท่า', badge:'002', featured:true },
  { h:'⭐ Featured ป้ายเด่น', d:'80 เหรียญ / 7 วัน — ป้าย Featured + ขึ้นหมวด Featured ของพลอยทอง', badge:'003' },
  { h:'คุยจบในแชท', d:'นัดรับเองหรือส่งฟรี — ตกลงกับผู้ขายได้ทันที ไม่ต้องรอระบบ', badge:'004' },
];

const TAGS_QUICK = ['iPhone', 'MacBook', 'Aeron', 'Nintendo', 'Lego', 'Trek', 'Air Jordan', 'แมว', 'ตู้เย็น', 'หนังสือ', 'กล้องฟิล์ม'];

// Platform-level stats (reserved for landing page / pitch deck / dashboard)
const PLATFORM_STATS = [
  { n:'248K',  l:'ผู้ใช้รายเดือน' },
  { n:'฿4.2M', l:'ยอดซื้อขาย / วัน' },
  { n:'24K+',  l:'ประกาศใหม่วันนี้' },
  { n:'98.4%', l:'ขายสำเร็จภายใน 7 วัน' },
];

window.PLOI_DATA = { PRODUCTS, CATS, IMG_TINTS, MONEY, TAGS_QUICK, PLATFORM_STATS };
