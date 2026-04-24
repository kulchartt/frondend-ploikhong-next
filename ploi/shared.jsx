// ===== Shared components =====
const { useState, useMemo, useEffect, useRef } = React;

const fmt = n => '฿' + Number(n).toLocaleString('en-US');

function Thumb({ id, label, tall }) {
  const tints = window.PLOI_DATA.IMG_TINTS[(id-1) % window.PLOI_DATA.IMG_TINTS.length];
  const style = {
    background: `linear-gradient(135deg, ${tints[0]} 0%, ${tints[1]} 100%)`,
    aspectRatio: tall ? '3/4' : '1/1'
  };
  return (
    <div className="ph thumb" style={style}>
      <span className="ph-lbl">{label || `IMG ${String(id).padStart(2,'0')}`}</span>
    </div>
  );
}

function PostMedia({ id, label, tall }) {
  const tints = window.PLOI_DATA.IMG_TINTS[(id-1) % window.PLOI_DATA.IMG_TINTS.length];
  const style = {
    background: `linear-gradient(135deg, ${tints[0]} 0%, ${tints[1]} 100%)`,
  };
  return (
    <div className={"ph post-media" + (tall ? ' tall' : '')} style={style}>
      <span className="ph-lbl">{label || `IMG ${String(id).padStart(2,'0')}`}</span>
    </div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 21s-7-4.5-9.5-10C1 7.5 3 4 7 4c2 0 3.5 1.5 5 3 1.5-1.5 3-3 5-3 4 0 6 3.5 4.5 7C19 16.5 12 21 12 21z"/>
    </svg>
  );
}

function SearchIcon(){ return <svg viewBox="0 0 24 24" className="sic ic"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>; }

function PloiMark({ size=32 }) {
  const sw = Math.max(4, size*0.09);
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" style={{display:'block',flexShrink:0}}>
      <circle cx="28" cy="28" r="26" fill="var(--ink)"/>
      <path d="M18 14 h12 a10 10 0 0 1 0 20 h-8 v10 h-4 z M22 20 v8 h8 a4 4 0 0 0 0 -8 z" fill="var(--surface)"/>
      <line x1="8" y1="46" x2="48" y2="34" stroke="var(--accent)" strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
}

function PloiLogo({ size=20, markSize=28 }) {
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:10,fontFamily:'var(--font-display)',fontWeight:800,letterSpacing:'-.02em',fontSize:size,color:'var(--ink)'}}>
      <PloiMark size={markSize}/>
      <span>PloiKhong<span style={{color:'var(--accent)'}}>.</span></span>
    </span>
  );
}

function ProductCard({ p, onWishlist, wishlist }) {
  const on = wishlist.has(p.id);
  return (
    <div className="pcard" onClick={()=>window.__openProduct && window.__openProduct(p)}>
      <Thumb id={p.img} />
      <div className="flag">
        {p.boost && <span className="tag boost">BOOST</span>}
        {p.flag && <span className={"tag " + (p.flag==='SALE'?'accent':'solid')}>{p.flag}</span>}
        {p.free && <span className="tag pos">ส่งฟรี</span>}
      </div>
      <button className={"wl" + (on ? ' on' : '')} onClick={(e)=>{e.stopPropagation();onWishlist(p.id);}} aria-label="Wishlist">
        <HeartIcon filled={on}/>
      </button>
      <div className="body">
        <div className="title">{p.title}</div>
        <div className="price mono">{fmt(p.price)}{p.was && <s>{fmt(p.was)}</s>}</div>
        <div className="foot">
          <span>{p.loc.split('·')[0].trim()}</span>
          <span>{p.posted}</span>
        </div>
      </div>
    </div>
  );
}

function MoneyRail() {
  const { MONEY } = window.PLOI_DATA;
  return (
    <div className="money-rail">
      {MONEY.map((m,i)=>(
        <div key={i} className={"money-card" + (m.featured ? ' featured' : '')}>
          <span className="mkbadge">{m.badge}</span>
          <div className="mkh">{m.h}</div>
          <div className="mkd">{m.d}</div>
        </div>
      ))}
    </div>
  );
}

function BottomNav({ active='home' }) {
  return (
    <nav className="bnav">
      <a href="#" className={active==='home'?'on':''}>
        <svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V11z"/></svg>
        หน้าแรก
      </a>
      <a href="#">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
        ค้นหา
      </a>
      <a href="#" className="sell" onClick={e=>{e.preventDefault();window.__openListing && window.__openListing();}}>
        <span className="mk"><svg viewBox="0 0 24 24" stroke="#fff"><path d="M12 5v14M5 12h14"/></svg></span>
        ขาย
      </a>
      <a href="#">
        <svg viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h10M4 18h6"/></svg>
        แชท
      </a>
      <a href="#">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
        ฉัน
      </a>
    </nav>
  );
}

Object.assign(window, { Thumb, PostMedia, ProductCard, MoneyRail, BottomNav, HeartIcon, SearchIcon, PloiMark, PloiLogo, fmt });
