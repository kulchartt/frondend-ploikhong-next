'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { PloiWordmark } from './PloiLogo';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import * as api from '@/lib/api';

interface ListingFlowProps {
  onClose: () => void;
  onPosted?: () => void;
}

const IMG_TINTS = [
  ['#d4a59a','#c8866e'],['#a5c4d4','#7ba8c8'],['#b8d4a5','#8ec87b'],
  ['#d4c4a5','#c8a87b'],['#c4a5d4','#a87bc8'],['#a5d4c4','#7bc8a8'],
  ['#d4d4a5','#c8c87b'],['#c4a5a5','#c87b7b'],['#a5b4d4','#7b8ec8'],
  ['#d4b4a5','#c8987b'],['#b4d4a5','#98c87b'],['#d4a5c4','#c87ba8'],
];

const CATS = [
  'มือถือ & แท็บเล็ต','คอมพิวเตอร์','เครื่องใช้ไฟฟ้า','เฟอร์นิเจอร์',
  'แฟชั่น','กล้อง & อุปกรณ์','กีฬา & จักรยาน','ของสะสม & เกม',
  'หนังสือ','สัตว์เลี้ยง','อื่นๆ',
];

const CONDS = [
  'ใหม่ในกล่อง','มือสอง สภาพ 95%+','มือสอง สภาพดี','มือสองทั่วไป','ซ่อมได้ / อะไหล่',
];

const STEPS = [
  { n: 1, name: 'รูปภาพ' },
  { n: 2, name: 'รายละเอียด' },
  { n: 3, name: 'ราคา & ส่ง' },
  { n: 4, name: 'ตรวจ & โพสต์' },
];

type Photo = { id: number; tint: number; url?: string; file?: File; uploading?: boolean; error?: boolean };

interface Form {
  title: string;
  desc: string;
  cat: string;
  cond: string;
  price: string;
  negotiable: boolean;
  loc: string;
  delivery: string;
  boost: boolean;
}

export function ListingFlow({ onClose, onPosted }: ListingFlowProps) {
  const { data: session } = useSession();
  const token: string | undefined = (session as any)?.token;
  const isMobile = useBreakpoint(768);
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [form, setForm] = useState<Form>({
    title: '', desc: '',
    cat: 'มือถือ & แท็บเล็ต', cond: 'มือสอง สภาพดี',
    price: '', negotiable: true,
    loc: 'กรุงเทพ · พระราม 9', delivery: 'นัดรับ + ส่งไปรษณีย์',
    boost: false,
  });
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [posted, setPosted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ESC to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const canNext =
    (step === 1 && photos.length >= 1) ||
    (step === 2 && form.title.trim().length >= 6 && form.desc.trim().length >= 10) ||
    (step === 3 && form.price !== '' && +form.price > 0) ||
    step === 4;

  function addPhoto() {
    const tint = photos.length % IMG_TINTS.length;
    setPhotos(p => [...p, { id: Date.now(), tint }]);
  }
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const slots = Math.min(files.length, 10 - photos.length);
    const newPhotos: Photo[] = files.slice(0, slots).map((file, i) => ({
      id: Date.now() + i,
      tint: (photos.length + i) % IMG_TINTS.length,
      url: URL.createObjectURL(file),
      file,
      uploading: false,
    }));
    setPhotos(p => [...p, ...newPhotos]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }
  function removePhoto(id: number) { setPhotos(p => p.filter(x => x.id !== id)); }
  function setAsCover(fromIdx: number) {
    setPhotos(p => {
      const n = [...p];
      const [x] = n.splice(fromIdx, 1);
      n.unshift(x);
      return n;
    });
  }

  function next() { if (step < 4) setStep(step + 1); }
  function prev() { if (step > 1) setStep(step - 1); }

  async function handleAiWrite() {
    if (!form.title.trim() && !form.desc.trim()) {
      setAiError('พิมพ์ชื่อหรือคำอธิบายก่อน แล้วให้ AI ช่วยเรียบเรียงใหม่');
      return;
    }
    setAiBusy(true); setAiError('');
    // Simulate AI rewrite (real integration would call Claude API)
    await new Promise(r => setTimeout(r, 1200));
    try {
      const improved = form.title.trim()
        ? form.title.trim() + ' · สภาพดี ครบกล่อง'
        : form.title;
      setForm(f => ({
        ...f,
        title: improved || f.title,
        desc: f.desc || 'สินค้าสภาพดี ใช้งานปกติทุกฟังก์ชัน พร้อมส่ง',
      }));
    } catch {
      setAiError('ขออภัย ระบบช่วยเรียบเรียงไม่พร้อมใช้งานตอนนี้');
    } finally {
      setAiBusy(false);
    }
  }

  async function handlePost() {
    if (!token) {
      setPostError('กรุณาเข้าสู่ระบบก่อนโพสต์');
      return;
    }
    setPosting(true);
    setPostError('');

    try {
      // 1. Upload photos that have real files
      const photosWithFiles = photos.filter(p => p.file);
      setUploadProgress({ done: 0, total: photosWithFiles.length });

      const imageUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        if (p.file) {
          const url = await api.uploadImage(p.file, token);
          imageUrls.push(url);
          setUploadProgress({ done: imageUrls.length, total: photosWithFiles.length });
        } else if (p.url && !p.url.startsWith('blob:')) {
          imageUrls.push(p.url); // already-uploaded URL
        }
      }

      setUploadProgress(null);

      // 2. Create the product
      await api.createProduct({
        title: form.title.trim(),
        description: form.desc.trim(),
        price: Number(form.price),
        category: form.cat,
        condition: form.cond,
        location: form.loc,
        delivery: form.delivery,
        negotiable: form.negotiable,
        is_boosted: form.boost,
        images: imageUrls,
        image_url: imageUrls[0] ?? '',
      }, token);

      setPosted(true);
      onPosted?.();
      setTimeout(onClose, 2200);
    } catch (err: any) {
      setPostError(err?.message || 'โพสต์ไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setPosting(false);
    }
  }

  if (posted) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>โพสต์สำเร็จแล้ว!</div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            ประกาศของคุณกำลังแสดงบนฟีด{form.boost ? ' พร้อม Boost 48 ชม.' : ''} สุ่มขายกันเลย!
          </div>
        </div>
      </div>
    );
  }

  // Only allow backdrop-click to close when there's no progress yet
  const hasProgress = photos.length > 0 || step > 1 || posting;

  return (
    <div
      onClick={hasProgress ? undefined : onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
        zIndex: 300, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
        padding: isMobile ? 0 : 20, overflowY: 'auto',
      }}>
      <style>{`
        @keyframes lstFade { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)', borderRadius: isMobile ? '16px 16px 0 0' : 16,
          width: '100%', maxWidth: 680,
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 80px rgba(0,0,0,.3)',
          animation: 'lstFade .22s cubic-bezier(.2,.8,.2,1)',
          maxHeight: isMobile ? '96vh' : '94vh', overflow: 'hidden',
        }}>

        {/* Stepper header */}
        <div style={{
          padding: isMobile ? '14px 18px' : '20px 28px', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 20, background: 'var(--surface)',
        }}>
          <div style={{ display: isMobile ? 'none' : undefined }}>
            <PloiWordmark size={16} markSize={26} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                    background: step > s.n ? 'var(--pos)' : step === s.n ? 'var(--ink)' : 'var(--surface-2)',
                    color: step >= s.n ? '#fff' : 'var(--ink-3)',
                    border: step === s.n ? 'none' : '1px solid var(--line)',
                    transition: '.2s',
                  }}>
                    {step > s.n ? '✓' : String(s.n).padStart(2, '0')}
                  </div>
                  <span style={{
                    fontSize: isMobile ? 10 : 11, fontWeight: step === s.n ? 600 : 400,
                    color: step === s.n ? 'var(--ink)' : 'var(--ink-3)',
                    whiteSpace: 'nowrap',
                  }}>{s.name}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, marginBottom: 16, marginLeft: 6, marginRight: 6,
                    background: step > s.n ? 'var(--pos)' : 'var(--line)',
                    transition: '.2s',
                  }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', whiteSpace: 'nowrap', display: isMobile ? 'none' : undefined }}>
              ลงฟรี · ไม่จำกัด
            </div>
            <button onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--surface-2)', border: '1px solid var(--line)',
                display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
              }}>
              <svg width={16} height={16} viewBox="0 0 24 24" stroke="var(--ink)" fill="none" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '18px 16px' : '24px 28px' }}>

          {/* ── Step 1: Photos ── */}
          {step === 1 && (
            <div>
              <StepHeader
                title="เพิ่มรูปสินค้า"
                sub="ถ่ายให้เห็นทั้งด้านหน้า ด้านข้าง และรอยตำหนิถ้ามี · ลงได้สูงสุด 10 รูป"
              />
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: 10, marginBottom: 20,
              }}>
                {photos.map((p, i) => {
                  const t = IMG_TINTS[p.tint % IMG_TINTS.length];
                  return (
                    <div key={p.id} style={{ position: 'relative' }}>
                      <div style={{
                        aspectRatio: '1/1', borderRadius: 'var(--radius-sm)',
                        background: p.url ? `url(${p.url}) center/cover` : `linear-gradient(135deg,${t[0]},${t[1]})`,
                        backgroundSize: 'cover',
                        border: i === 0 ? '2px solid var(--ink)' : '1px solid var(--line)',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 6,
                      }}>
                        {i === 0 && (
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                            background: 'var(--ink)', color: '#fff',
                            padding: '2px 7px', borderRadius: 999, letterSpacing: '.06em',
                          }}>COVER</span>
                        )}
                      </div>
                      <button
                        data-testid={`remove-photo-${p.id}`}
                        onClick={() => removePhoto(p.id)}
                        style={{
                          position: 'absolute', top: 5, right: 5, width: 20, height: 20,
                          borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff',
                          border: 'none', cursor: 'pointer', fontSize: 12, display: 'grid', placeItems: 'center',
                        }}>×</button>
                      {i > 0 && (
                        <button
                          onClick={() => setAsCover(i)}
                          title="ตั้งเป็นหน้าปก"
                          style={{
                            position: 'absolute', top: 5, left: 5, width: 20, height: 20,
                            borderRadius: '50%', background: 'rgba(255,255,255,.8)',
                            border: '1px solid var(--line)', cursor: 'pointer', fontSize: 10,
                            display: 'grid', placeItems: 'center', color: 'var(--ink)',
                          }}>⇱</button>
                      )}
                    </div>
                  );
                })}
                {photos.length < 10 && (
                  <button
                    data-testid="add-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      aspectRatio: '1/1', borderRadius: 'var(--radius-sm)',
                      border: '2px dashed var(--line-2)', background: 'var(--surface-2)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 6, cursor: 'pointer', color: 'var(--ink-3)',
                    }}>
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="M21 15l-5-5-11 11"/>
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>เพิ่มรูป</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{photos.length}/10</span>
                  </button>
                )}
              </div>

              <div style={{
                background: 'var(--surface-2)', borderRadius: 'var(--radius)',
                padding: '14px 16px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7,
              }}>
                <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>เคล็ดลับให้ขายเร็ว</div>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  <li>แสงธรรมชาติดีสุด ถ่ายใกล้หน้าต่างช่วงเช้า-บ่าย</li>
                  <li>พื้นหลังเรียบ ไม่รก ช่วยให้สินค้าเด่น</li>
                  <li>ถ่ายรอยตำหนิตรงๆ สร้างความไว้ใจให้ผู้ซื้อ</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <div>
              <StepHeader
                title="รายละเอียดสินค้า"
                sub="ชื่อและคำอธิบายที่ดีช่วยให้ขายเร็วขึ้น 3 เท่า"
              />

              {/* AI button */}
              <button
                data-testid="ai-write-btn"
                onClick={handleAiWrite}
                disabled={aiBusy}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 'var(--radius)',
                  border: '1px solid var(--line)', background: aiBusy ? 'var(--surface-2)' : 'var(--surface)',
                  cursor: aiBusy ? 'not-allowed' : 'pointer', marginBottom: 18,
                  fontSize: 13, fontWeight: 600, color: 'var(--ink)', width: '100%',
                }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.8}>
                  <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/>
                </svg>
                {aiBusy ? 'กำลังเรียบเรียง…' : 'AI ช่วยเรียบเรียงใหม่'}
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '.06em', color: 'var(--accent)', background: 'rgba(255,45,31,.1)', padding: '2px 6px', borderRadius: 999 }}>BETA</span>
              </button>
              {aiError && (
                <div style={{ padding: '10px 14px', background: 'rgba(184,50,22,.08)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--neg)', marginBottom: 14 }}>
                  {aiError}
                </div>
              )}

              <Field label="ชื่อประกาศ" required>
                <input
                  data-testid="listing-title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="เช่น iPhone 14 Pro 256GB สีม่วง เครื่องศูนย์ไทย"
                  maxLength={80}
                  style={inputStyle}
                />
                <div style={helpStyle}>{form.title.length}/80 · ใส่ยี่ห้อ รุ่น และสภาพให้ชัด</div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <Field label="หมวดหมู่" required>
                  <select
                    data-testid="listing-category"
                    value={form.cat}
                    onChange={e => setForm({ ...form, cat: e.target.value })}
                    style={selectStyle}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="สภาพ" required>
                  <select
                    data-testid="listing-condition"
                    value={form.cond}
                    onChange={e => setForm({ ...form, cond: e.target.value })}
                    style={selectStyle}>
                    {CONDS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="คำอธิบาย" required>
                <textarea
                  data-testid="listing-desc"
                  rows={5}
                  value={form.desc}
                  onChange={e => setForm({ ...form, desc: e.target.value })}
                  placeholder="บอกรายละเอียดการใช้งาน อายุการใช้ ประกันเหลือ อุปกรณ์ในกล่อง รอยตำหนิ เหตุผลที่ขาย"
                  style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 100 }}
                />
                <div style={helpStyle}>{form.desc.length} ตัวอักษร · อย่างน้อย 10</div>
              </Field>
            </div>
          )}

          {/* ── Step 3: Price & Delivery ── */}
          {step === 3 && (
            <div>
              <StepHeader
                title="ราคา & วิธีรับสินค้า"
                sub="ตั้งราคาให้ดีและเลือก Boost เพื่อให้เห็นมากขึ้น"
              />

              <Field label="ราคา (บาท)" required>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-2)', fontSize: 15,
                  }}>฿</span>
                  <input
                    data-testid="listing-price"
                    type="number"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0"
                    min={1}
                    style={{ ...inputStyle, paddingLeft: 32 }}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.negotiable}
                    onChange={e => setForm({ ...form, negotiable: e.target.checked })}
                  />
                  รับต่อรอง
                </label>
              </Field>

              <Field label="ที่ตั้งสินค้า">
                <input
                  value={form.loc}
                  onChange={e => setForm({ ...form, loc: e.target.value })}
                  placeholder="เขต · แขวง"
                  style={inputStyle}
                />
              </Field>

              <Field label="วิธีรับสินค้า">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['นัดรับ', 'ส่งไปรษณีย์', 'นัดรับ + ส่งไปรษณีย์'].map(d => (
                    <button
                      key={d}
                      onClick={() => setForm({ ...form, delivery: d })}
                      style={{
                        padding: '8px 14px', borderRadius: 999, fontSize: 13,
                        border: `1px solid ${form.delivery === d ? 'var(--ink)' : 'var(--line)'}`,
                        background: form.delivery === d ? 'var(--ink)' : 'var(--surface)',
                        color: form.delivery === d ? 'var(--bg)' : 'var(--ink-2)',
                        cursor: 'pointer', fontWeight: form.delivery === d ? 600 : 400,
                        transition: '.15s',
                      }}>
                      {d}
                    </button>
                  ))}
                </div>
                <div style={helpStyle}>นัดที่สาธารณะ หรือส่งแล้วเก็บ tracking ไว้เป็นหลักฐาน</div>
              </Field>

              {/* Boost card */}
              <div
                data-testid="boost-card"
                onClick={() => setForm(f => ({ ...f, boost: !f.boost }))}
                style={{
                  marginTop: 20, padding: '16px 18px',
                  border: `2px solid ${form.boost ? 'var(--accent)' : 'var(--line)'}`,
                  borderRadius: 'var(--radius)', cursor: 'pointer',
                  background: form.boost ? 'rgba(255,45,31,.04)' : 'var(--surface)',
                  transition: '.15s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 999,
                      background: 'linear-gradient(90deg,#111,#333)', color: '#fff',
                      fontFamily: 'var(--font-mono)', letterSpacing: '.06em', marginBottom: 6,
                    }}>BOOST</span>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                      ดันประกาศขึ้นบนสุด 48 ชั่วโมง
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>เห็นเพิ่มขึ้น 8-12 เท่า · ขายเร็วขึ้นเฉลี่ย 3 วัน</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>เพียง</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>฿29</div>
                  </div>
                </div>

                {/* Bar chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  {[
                    { label: 'ไม่ Boost', pct: '12%', fill: 'var(--ink-3)', count: '~120 ครั้ง' },
                    { label: 'Boost', pct: '92%', fill: 'var(--accent)', count: '~1,240 ครั้ง' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 54, color: 'var(--ink-2)', flexShrink: 0 }}>{row.label}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: row.pct, height: '100%', background: row.fill, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', width: 70, textAlign: 'right' }}>{row.count}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: form.boost ? 'var(--accent)' : 'var(--ink-3)' }}>
                  <input type="checkbox" checked={form.boost} readOnly />
                  {form.boost ? 'เลือก Boost แล้ว — เก็บเงินเมื่อโพสต์สำเร็จ' : 'แตะเพื่อเปิด Boost'}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Preview & Post ── */}
          {step === 4 && (
            <div>
              <StepHeader
                title="ตรวจสอบก่อนโพสต์"
                sub="นี่คือหน้าตาที่ผู้ซื้อจะเห็น"
              />

              {/* Preview card */}
              <div style={{
                border: '1px solid var(--line)', borderRadius: 'var(--radius)',
                overflow: 'hidden', marginBottom: 20,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  {/* Cover image */}
                  <div style={{
                    aspectRatio: '1/1',
                    background: photos[0]?.url
                      ? `url(${photos[0].url}) center/cover`
                      : photos[0]
                        ? `linear-gradient(135deg,${IMG_TINTS[photos[0].tint % IMG_TINTS.length][0]},${IMG_TINTS[photos[0].tint % IMG_TINTS.length][1]})`
                        : 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--ink-3)', fontSize: 12,
                  }}>
                    {photos.length > 0 && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#fff', background: 'rgba(0,0,0,.4)', padding: '2px 8px', borderRadius: 999 }}>
                        1/{photos.length}
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.07em', marginBottom: 8 }}>
                      {form.cat.toUpperCase()} · {form.loc} · เพิ่งลง
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-.01em', marginBottom: 6, lineHeight: 1.3 }}>
                      {form.title || 'ยังไม่ใส่ชื่อประกาศ'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginBottom: 8 }}>
                      {form.price ? `฿${Number(form.price).toLocaleString()}` : '฿—'}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <MiniTag>{form.cond}</MiniTag>
                      {form.negotiable && <MiniTag>ต่อรองได้</MiniTag>}
                      {form.boost && <MiniTag boost>BOOST</MiniTag>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                      {form.desc || 'ยังไม่ใส่คำอธิบาย'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>สรุปค่าใช้จ่าย</div>
                {[
                  { label: 'ค่าลงประกาศ', val: '฿0', pos: true },
                  { label: 'Boost 48 ชม.', val: form.boost ? '฿29' : '—', pos: false },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                    <span style={{ color: 'var(--ink-2)' }}>{row.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: row.pos ? 'var(--pos)' : 'var(--ink)' }}>{row.val}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', fontWeight: 700 }}>
                  <span>ชำระตอนนี้</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16 }}>{form.boost ? '฿29' : '฿0'}</span>
                </div>
                <div style={{ padding: '10px 16px', background: 'var(--surface-2)', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                  ลงประกาศฟรี ไม่มีค่าธรรมเนียมเมื่อขายสำเร็จ · ได้เต็มราคาที่คุยกับผู้ซื้อ
                </div>
              </div>

              {/* Upload progress */}
              {uploadProgress && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--ink-2)' }}>
                    <span>กำลังอัพโหลดรูป…</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{uploadProgress.done}/{uploadProgress.total}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 999, background: 'var(--accent)',
                      width: `${uploadProgress.total ? (uploadProgress.done / uploadProgress.total) * 100 : 0}%`,
                      transition: 'width .3s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Post error */}
              {postError && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(184,50,22,.08)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--neg)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  {postError}
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '14px 16px' : '16px 28px', borderTop: '1px solid var(--line)', background: 'var(--surface)',
        }}>
          <button
            onClick={step === 1 ? onClose : prev}
            style={{
              padding: '10px 18px', background: 'none',
              border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--ink-2)',
            }}>
            {step === 1 ? 'ยกเลิก' : '← ย้อนกลับ'}
          </button>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
            ขั้นตอน {step} จาก 4
          </div>

          {step < 4 ? (
            <button
              data-testid="listing-next-btn"
              onClick={next}
              disabled={!canNext}
              style={{
                padding: '10px 22px',
                background: canNext ? 'var(--accent)' : 'var(--line)',
                color: canNext ? '#fff' : 'var(--ink-3)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: 13, fontWeight: 600, cursor: canNext ? 'pointer' : 'not-allowed',
                transition: '.15s',
              }}>
              ต่อไป →
            </button>
          ) : (
            <button
              data-testid="listing-post-btn"
              onClick={handlePost}
              disabled={posting}
              style={{
                padding: '11px 26px',
                background: posting ? 'var(--line)' : 'var(--accent)',
                color: posting ? 'var(--ink-3)' : '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: 14, fontWeight: 700,
                cursor: posting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: '.15s',
              }}>
              {posting && (
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                  style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              )}
              {posting
                ? (uploadProgress ? `อัพโหลด ${uploadProgress.done}/${uploadProgress.total}…` : 'กำลังโพสต์…')
                : form.boost ? 'โพสต์ & Boost ฿29' : 'โพสต์ประกาศ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StepHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-.015em', marginBottom: 6, color: 'var(--ink)' }}>
        {title}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>{sub}</p>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--accent)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function MiniTag({ children, boost }: { children: React.ReactNode; boost?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 500,
      padding: '2px 8px', borderRadius: 999,
      background: boost ? 'linear-gradient(90deg,#111,#333)' : 'var(--surface-2)',
      color: boost ? '#fff' : 'var(--ink-2)',
      border: boost ? 'none' : '1px solid var(--line)',
    }}>{children}</span>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)', color: 'var(--ink)',
  fontFamily: 'inherit', fontSize: 14, outline: 'none',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const helpStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', marginTop: 5,
};
