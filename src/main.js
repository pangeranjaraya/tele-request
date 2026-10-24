import './style.css';

const app = document.querySelector('#app');
const state = { profile: null, owner: new URLSearchParams(location.search).get('owner') === '1', activeTab: 'overview' };
const KEYS = { profile:'req_profile', requests:'req_tickets_v1', announcements:'req_announcements_v1', faqs:'req_faqs_v1' };
const defaultsAnnouncements = [
  { id:'welcome', title:'Selamat datang di REQ BOT', body:'Kirim ide, laporan bug, atau permintaan fitur melalui formulir request. Simpan nomor tiket untuk memeriksa status.', date:'2026-10-23', active:true }
];
const defaultsFaqs = [
  { id:'faq-1', q:'Bagaimana cara mengirim request?', a:'Buka menu Buat Request, pilih kategori, isi judul dan detail, lalu tekan Kirim Request. Jika konfigurasi Telegram tersedia, owner akan menerima notifikasi.', active:true },
  { id:'faq-2', q:'Di mana saya melihat status request?', a:'Buka menu Riwayat Request. Status akan terlihat dari data yang tersimpan di browser ini.', active:true },
  { id:'faq-3', q:'Apakah riwayat tersinkron ke semua perangkat?', a:'Belum. Riwayat dan status disimpan di localStorage browser/perangkat ini. Menghapus data browser atau memakai perangkat lain tidak akan membawa riwayat tersebut.', active:true },
  { id:'faq-4', q:'Kenapa notifikasi Telegram gagal?', a:'Periksa TELEGRAM_BOT_TOKEN di Vercel, nilai OWNER dan channel di api/config.js, lalu pastikan bot sudah /start ke owner atau menjadi admin channel.', active:true },
];
const readJSON = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback; } catch { return fallback; } };
const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getRequests = () => { const value=readJSON(KEYS.requests,[]); return Array.isArray(value)?value:[]; };
const getAnnouncements = () => { const value=readJSON(KEYS.announcements,null); return Array.isArray(value)?value:defaultsAnnouncements; };
const getFaqs = () => { const value=readJSON(KEYS.faqs,null); return Array.isArray(value)?value:defaultsFaqs; };
const escapeHTML = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials = name => (name || 'U').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const avatar = (name, url) => url ? `<img src="${escapeHTML(url)}" alt="Foto ${escapeHTML(name)}">` : `<span>${escapeHTML(initials(name))}</span>`;
const fmtDate = value => { try { return new Date(value).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}); } catch { return String(value||''); } };
const toast = msg => { const el=document.querySelector('#toast'); if(el){el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3000);} };
function shell(content) { app.innerHTML = `${content}<div id="toast" class="toast"></div>`; }
function installParticles() {
  if (document.getElementById('particle-bg')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-bg';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  let w = 0, h = 0, dpr = 1, points = [], raf = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(w < 650 ? 36 : 68, Math.min(w < 650 ? 58 : 110, Math.floor(w * h / (w < 650 ? 10500 : 11500))));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      z: .25 + Math.random() * .75,
      vx: (Math.random() - .5) * .34, vy: (Math.random() - .5) * .34,
      r: 1 + Math.random() * 2.1, phase: Math.random() * Math.PI * 2
    }));
  };
  const draw = (time = 0) => {
    ctx.clearRect(0, 0, w, h);
    // Glow halus supaya efek tetap terbaca di atas background gelap.
    const glow = ctx.createRadialGradient(w * .72, h * .22, 0, w * .72, h * .22, Math.max(w, h) * .72);
    glow.addColorStop(0, 'rgba(116, 91, 210, .12)');
    glow.addColorStop(.55, 'rgba(74, 84, 145, .045)');
    glow.addColorStop(1, 'rgba(16, 19, 27, 0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (!reduced) {
        p.x += p.vx * (.45 + p.z); p.y += p.vy * (.45 + p.z);
        if (p.x < -8) p.x = w + 8; if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8; if (p.y > h + 8) p.y = -8;
      }
      const pulse = reduced ? 1 : .82 + Math.sin(time / 850 + p.phase) * .18;
      const radius = p.r * (.65 + p.z * 1.1) * pulse;
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j], dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy), maxDist = 145;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * .27 * Math.min(p.z, q.z);
          ctx.strokeStyle = `rgba(164, 143, 255, ${alpha})`;
          ctx.lineWidth = .55 + Math.min(p.z, q.z) * .35;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 4.8);
      halo.addColorStop(0, `rgba(190, 177, 255, ${.42 * p.z})`);
      halo.addColorStop(1, 'rgba(167, 139, 250, 0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(p.x, p.y, radius * 4.8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(222, 214, 255, ${.42 + p.z * .5})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduced) raf = requestAnimationFrame(draw);
  };
  resize(); draw();
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); draw(); }, { passive: true });
}
function landing() {
  shell(`<nav class="nav wrap"><a class="brand" href="#"><span class="brand-mark">R</span><span>REQ<span class="muted">BOT</span></span></a><div class="nav-links"><a href="#fitur">Fitur</a><a href="#alur">Cara kerja</a><button class="btn btn-small btn-quiet" id="navLogin">Buka Dashboard <span>↗</span></button></div><button class="menu-btn" id="menuBtn" aria-label="Buka menu">☰</button></nav>
  <main><section class="hero wrap"><div class="hero-copy"><div class="eyebrow"><span class="live-dot"></span> REQUEST CENTER · ONLINE</div><h1>Punya ide keren?<br><span class="gradient-text">Bikin jadi nyata.</span></h1><p class="hero-desc">Pusat request fitur, tiket bantuan, pengumuman, dan panduan. Kirim kebutuhanmu dengan alur yang jelas dan pantau status request.</p><div class="hero-actions"><button class="btn btn-primary" id="heroStart">Mulai Sekarang <span>→</span></button><a class="btn btn-outline" href="#fitur">Jelajahi fitur</a></div><div class="trust-row"><div class="avatar-stack"><span>R</span><span>✦</span><span>⌘</span></div><span>Pusat request praktis</span><span class="trust-sep">•</span><span>Partikel 3D ringan</span></div></div>
  <div class="hero-visual"><div class="orb orb-one"></div><div class="orb orb-two"></div><div class="glass-card main-card"><div class="card-top"><div class="window-dots"><i></i><i></i><i></i></div><span class="tiny-label">REQUEST OVERVIEW</span><span class="status-pill"><i></i> Active</span></div><div class="mini-profile"><div class="profile-icon">✦</div><div><b>Tiket bantuan</b><small>Nomor tiket dan status request.</small></div><span class="more">•••</span></div><div class="progress-title"><span>Proses request</span><b>TRACKED</b></div><div class="progress-track"><span></span></div><div class="chat-preview"><div class="chat-avatar">R</div><div class="chat-bubble"><small>REQUEST · OPEN</small><p>Ide fitur baru dikirim ke owner...</p></div></div><div class="chat-preview owner-preview"><div class="chat-avatar owner-avatar">✓</div><div class="chat-bubble"><small>STATUS</small><p>Nomor tiket tersimpan di dashboard.</p></div></div><div class="card-foot"><span><i class="live-dot"></i> Request center</span><span>REQ / TICKET</span></div></div><div class="float-chip chip-top"><span class="chip-icon">↗</span><div><b>Notifikasi Telegram</b><small>Untuk owner</small></div></div><div class="float-chip chip-bottom"><span class="chip-icon purple">✦</span><div><b>FAQ & Pengumuman</b><small>Info satu tempat</small></div></div></div></section>
  <section class="metrics wrap"><div><b>01</b><span>Kirim request</span></div><div><b>02</b><span>Pantau tiket</span></div><div><b>03</b><span>Baca info & FAQ</span></div></section>
  <section id="fitur" class="section wrap"><div class="section-heading"><div><div class="eyebrow">DIBUAT UNTUK IDE BESAR</div><h2>Semua yang kamu butuhkan.<br><span class="muted">Dalam satu tempat.</span></h2></div><p>Request yang rapi, nomor tiket, status, pengumuman, dan jawaban untuk pertanyaan umum.</p></div><div class="feature-grid"><article class="feature-card"><div class="feature-icon violet">↗</div><div class="feature-tag">01 / REQUEST</div><h3>Formulir Request</h3><p>Kirim ide, laporan bug, atau permintaan bantuan dengan kategori dan detail yang jelas.</p><span class="feature-link">Kirim kebutuhan <b>↗</b></span></article><article class="feature-card featured"><div class="feature-icon mint">▣</div><div class="feature-tag">02 / TICKET</div><h3>Sistem Tiket</h3><p>Setiap request memiliki nomor unik dan status yang bisa dipantau di browser ini.</p><span class="feature-link">Pantau status <b>↗</b></span><div class="feature-glow"></div></article><article class="feature-card"><div class="feature-icon blue">✦</div><div class="feature-tag">03 / HELP CENTER</div><h3>Pengumuman & FAQ</h3><p>Lihat informasi terbaru dan jawaban untuk pertanyaan yang sering diajukan.</p><span class="feature-link">Baca informasi <b>↗</b></span></article></div></section>
  <section id="alur" class="steps-section"><div class="wrap steps-inner"><div class="eyebrow">GAMPANG BANGET</div><h2>Dari ide ke tiket.<br><span class="muted">Cuma beberapa langkah.</span></h2><div class="steps-grid"><div class="step"><span>01</span><div class="step-line"></div><h3>Lengkapi profil</h3><p>Masukkan nama, ID Telegram, dan opsional URL foto profil.</p></div><div class="step"><span>02</span><div class="step-line"></div><h3>Kirim formulir</h3><p>Isi kategori, judul, dan penjelasan. Telegram owner menerima notifikasi jika dikonfigurasi.</p></div><div class="step"><span>03</span><div class="step-line"></div><h3>Pantau riwayat</h3><p>Lihat nomor tiket dan status yang tersimpan di browser ini.</p></div></div><div class="bottom-cta"><div><h3>Siap kirim ide pertamamu?</h3><p>Buat tiket baru dan simpan nomor request-mu.</p></div><button class="btn btn-primary" id="bottomStart">Masuk Dashboard <span>→</span></button></div></div></section></main>
  <footer class="footer wrap"><a class="brand" href="#"><span class="brand-mark">R</span><span>REQ<span class="muted">BOT</span></span></a><span>Made for ideas that move forward.</span><span>© 2026 REQ FEATURE / REQ BOT</span></footer>`);
  ['navLogin','heroStart','bottomStart'].forEach(id=>document.getElementById(id)?.addEventListener('click',onboarding));
  document.getElementById('menuBtn')?.addEventListener('click',()=>document.querySelector('.nav-links')?.classList.toggle('menu-open'));
}
function onboarding() {
  shell(`<div class="onboard-page"><button class="back-link" id="backHome">← Kembali ke landing page</button><div class="onboard-card"><div class="onboard-brand"><span class="brand-mark">R</span><span>REQ<span class="muted">BOT</span></span></div><div class="onboard-avatar">${avatar('Kamu','')}</div><div class="eyebrow center">SEBELUM KITA MULAI</div><h1>Kenalan dulu, yuk.</h1><p class="onboard-sub">Profil ini dipakai untuk menyertai request dan notifikasi Telegram.</p><form id="profileForm" class="form-stack"><label>Nama tampilan<input id="displayName" required maxlength="40" placeholder="Contoh: Raka Pratama" autocomplete="name"></label><label>Telegram numeric ID<input id="telegramId" required inputmode="numeric" pattern="[0-9]{5,20}" placeholder="Contoh: 123456789"><small>Masukkan ID numerik, bukan username @nama.</small></label><label>URL foto profil <span class="optional">OPSIONAL</span><input id="avatarUrl" type="url" placeholder="https://.../foto.jpg"></label><button class="btn btn-primary btn-full" type="submit">Lanjut ke Dashboard <span>→</span></button></form><div class="privacy-note">▣ Riwayat tiket disimpan di localStorage browser ini.</div></div></div>`);
  document.getElementById('backHome').onclick=landing;
  document.getElementById('displayName').addEventListener('input',e=>{document.querySelector('.onboard-avatar').innerHTML=avatar(e.target.value,'');});
  document.getElementById('profileForm').onsubmit=e=>{e.preventDefault();const profile={name:document.getElementById('displayName').value.trim(),telegramId:document.getElementById('telegramId').value.trim(),avatarUrl:document.getElementById('avatarUrl').value.trim()};if(!/^[0-9]{5,20}$/.test(profile.telegramId))return toast('Masukkan ID Telegram numerik yang valid.');if(profile.avatarUrl&&!/^https?:\/\//i.test(profile.avatarUrl))return toast('URL foto harus dimulai dengan https:// atau http://');localStorage.setItem(KEYS.profile,JSON.stringify(profile));state.profile=profile;dashboard();};
}
function dashboard() {
 const p=state.profile;
 shell(`<div class="app-layout"><aside class="sidebar"><a class="brand" href="#" id="brandHome"><span class="brand-mark">R</span><span>REQ<span class="muted">BOT</span></span></a><div class="side-label">WORKSPACE</div><button class="side-item active" data-tab="overview"><span>▦</span> Overview</button><button class="side-item" data-tab="request"><span>↗</span> Buat Request</button><button class="side-item" data-tab="history"><span>▣</span> Riwayat Tiket</button><button class="side-item" data-tab="announcements"><span>✦</span> Pengumuman</button><button class="side-item" data-tab="faq"><span>?</span> FAQ / Bantuan</button><div class="side-bottom"><div class="side-help"><span>✦</span><b>Punya ide?</b><small>Buat tiket untuk owner.</small></div><button class="side-item" id="editProfile"><span>⚙</span> Edit Profil</button><button class="side-item" id="logout"><span>↪</span> Keluar Dashboard</button><div class="side-user">${avatar(p.name,p.avatarUrl)}<div><b>${escapeHTML(p.name)}</b><small>ID ${escapeHTML(p.telegramId)}</small></div><span class="online-indicator"></span></div></div></aside><main class="dash-main"><header class="dash-header"><div><div class="eyebrow">YOUR WORKSPACE</div><h1 id="dashTitle">Overview</h1></div><div class="header-right"><span class="system-status"><i class="live-dot"></i> Browser aktif</span><div class="header-avatar">${avatar(p.name,p.avatarUrl)}</div></div></header><div id="dashContent"></div></main></div>`);
 document.getElementById('brandHome').onclick=e=>{e.preventDefault();landing();};document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));document.getElementById('editProfile').onclick=onboarding;document.getElementById('logout').onclick=()=>{localStorage.removeItem(KEYS.profile);state.profile=null;landing();};showTab('overview');
}
function showTab(tab) {
 state.activeTab=tab;document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 const titles={overview:'Overview',request:'Buat Request',history:'Riwayat Tiket',announcements:'Pengumuman',faq:'FAQ / Bantuan'};document.getElementById('dashTitle').textContent=titles[tab]||'Overview';const target=document.getElementById('dashContent');
 if(tab==='overview') {
  const own=getRequests().filter(x=>x.telegramId===state.profile.telegramId);const active=own.filter(x=>x.status!=='Selesai'&&x.status!=='Ditolak').length;
  target.innerHTML=`<section class="welcome-banner"><div><div class="eyebrow">REQUEST WORKSPACE</div><h2>Halo, ${escapeHTML(state.profile.name.split(' ')[0])} <span class="wave">✦</span></h2><p>Kirim ide atau masalahmu, lalu pantau status melalui nomor tiket.</p><button class="btn btn-primary" id="quickRequest">Buat Request <span>→</span></button></div><div class="welcome-art"><div class="art-ring"></div><div class="art-center">R<span>✦</span></div><div class="art-orbit orbit-a">↗</div><div class="art-orbit orbit-b">▣</div></div></section><div class="dash-section-head"><div><h2>Ringkasan</h2><p>Statistik dari data yang tersimpan di browser ini.</p></div><span class="subtle-pill">LOCAL DATA</span></div><div class="quick-grid"><div class="quick-card metric-quick"><span class="quick-icon violet">▣</span><h3>${own.length} tiket</h3><p>Total request yang tercatat untuk profil ini.</p><b>${active} masih aktif</b></div><button class="quick-card" data-go="history"><span class="quick-icon mint">↗</span><span class="quick-arrow">↗</span><h3>Riwayat Request</h3><p>Lihat nomor tiket dan status terbaru.</p><b>Buka riwayat <span>→</span></b></button><button class="quick-card" data-go="announcements"><span class="quick-icon blue">✦</span><span class="quick-arrow">↗</span><h3>Pengumuman</h3><p>Baca info dan perubahan terbaru.</p><b>Lihat pengumuman <span>→</span></b></button></div><div class="notice-row"><span class="notice-icon">ⓘ</span><div><b>Penting tentang penyimpanan</b><p>Riwayat tiket memakai localStorage di browser ini. Data tidak tersinkron lintas perangkat dan dapat hilang jika data browser dihapus.</p></div></div>`;
  document.getElementById('quickRequest').onclick=()=>showTab('request');document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>showTab(b.dataset.go));
 } else if(tab==='request') renderRequestForm(target);
 else if(tab==='history') renderHistory(target);
 else if(tab==='announcements') renderAnnouncements(target);
 else if(tab==='faq') renderFaq(target);
}
function renderRequestForm(target) {
 target.innerHTML=`<div class="content-narrow"><div class="intro-block"><div class="large-icon violet">↗</div><h2>Kirim request ke owner.</h2><p>Request akan mendapatkan nomor tiket. Notifikasi dikirim ke Telegram jika token dan tujuan sudah dikonfigurasi di Vercel.</p></div><form id="ticketForm" class="panel request-panel"><div class="panel-heading"><div><h3>Formulir Request</h3><p>Isi detail agar owner mudah memahami kebutuhanmu.</p></div><span class="secure-label">● TICKET</span></div><label>Kategori<select id="reqCategory" class="form-select"><option>Request Fitur</option><option>Laporan Bug</option><option>Bantuan</option><option>Kerja Sama</option><option>Lainnya</option></select></label><label>Tujuan notifikasi<select id="reqDestination" class="form-select"><option value="channel" selected>Channel Telegram (utama)</option><option value="owner">Owner (Telegram pribadi)</option></select></label><label>Judul request<input id="reqTopic" required maxlength="100" placeholder="Contoh: Tambahkan fitur pencarian"></label><label>Detail request<textarea id="reqBody" required rows="5" maxlength="3000" placeholder="Jelaskan kebutuhan, masalah, dan hasil yang diharapkan..."></textarea><small id="charCount">0 / 3000</small></label><button class="btn btn-primary btn-full" id="sendRequest" type="submit">Kirim Request <span>↗</span></button><p class="form-footnote">Jangan masukkan kata sandi atau informasi sensitif.</p></form><div class="info-strip"><span>ⓘ</span><p>Nomor tiket dan status disimpan di browser ini. Pengiriman ke Telegram tidak berarti riwayat tersinkron ke perangkat lain.</p></div></div>`;
 document.getElementById('reqBody').oninput=e=>document.getElementById('charCount').textContent=`${e.target.value.length} / 3000`;
 document.getElementById('ticketForm').onsubmit=submitTicket;
}
async function submitTicket(e) {
 e.preventDefault();const p=state.profile,category=document.getElementById('reqCategory').value,topic=document.getElementById('reqTopic').value.trim(),body=document.getElementById('reqBody').value.trim(),destination=document.getElementById('reqDestination').value;
 if(!topic||!body)return toast('Isi judul dan detail request.');const btn=document.getElementById('sendRequest');btn.disabled=true;btn.textContent='Mengirim notifikasi…';
 const ticket={id:`REQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,name:p.name,telegramId:p.telegramId,avatarUrl:p.avatarUrl||'',category,topic,body,destination,status:'Menunggu',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),telegramSent:false};
 try {
  const response=await fetch('/api/notify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:p.name,telegramId:p.telegramId,type:`${category} [${ticket.id}]: ${topic}`,message:`Nomor tiket: ${ticket.id}\nKategori: ${category}\n\n${body}`,destination})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Gagal mengirim notifikasi Telegram.');ticket.telegramSent=true;
 } catch(err) { ticket.telegramError=err.message||'Notifikasi Telegram gagal'; }
 const all=getRequests();all.unshift(ticket);writeJSON(KEYS.requests,all.slice(0,300));
 btn.disabled=false;btn.textContent='Kirim Request ↗';
 if(ticket.telegramSent){toast(`Tiket ${ticket.id} dibuat dan notifikasi Telegram terkirim.`);}else{toast(`Tiket tersimpan di browser. Telegram gagal: ${ticket.telegramError}`);}
 const target=document.getElementById('dashContent');target.innerHTML=`<section class="panel success-panel"><div class="success-mark">${ticket.telegramSent?'✓':'!'}</div><div class="eyebrow">TIKET TERCATAT</div><h2>Request kamu sudah dicatat.</h2><p>Nomor tiket:</p><code class="ticket-code">${escapeHTML(ticket.id)}</code><p>Status awal: <span class="status-pill-local">Menunggu</span></p><p class="muted-copy">${ticket.telegramSent?'Notifikasi juga telah dikirim ke Telegram.':'Notifikasi Telegram belum terkirim. Periksa konfigurasi Vercel dan coba lagi pada request berikutnya.'}</p><button class="btn btn-primary" id="goHistory">Lihat Riwayat <span>→</span></button></section>`;document.getElementById('goHistory').onclick=()=>showTab('history');
}
function statusClass(status){return status==='Selesai'?'done':status==='Diproses'?'working':status==='Ditolak'?'rejected':'pending';}
function renderHistory(target) {
 const own=getRequests().filter(x=>x.telegramId===state.profile.telegramId);
 target.innerHTML=`<div class="dash-section-head"><div><h2>Riwayat Request</h2><p>Nomor tiket dan status dari localStorage browser ini.</p></div><button class="btn btn-primary btn-small" id="newTicket">+ Request Baru</button></div>${own.length?`<div class="ticket-list">${own.map(t=>`<article class="panel ticket-card"><div class="ticket-top"><code>${escapeHTML(t.id)}</code><span class="ticket-status ${statusClass(t.status)}">${escapeHTML(t.status)}</span></div><h3>${escapeHTML(t.topic)}</h3><p>${escapeHTML(t.category)} · ${escapeHTML(fmtDate(t.createdAt))}</p><div class="ticket-detail">${escapeHTML(t.body).replace(/\n/g,'<br>')}</div><div class="ticket-bottom"><span>Notifikasi Telegram: ${t.telegramSent?'Terkirim':'Belum terkirim'}</span><button class="btn btn-outline btn-small" data-detail="${escapeHTML(t.id)}">Detail</button></div>${t.statusNote?`<div class="status-note">Catatan owner: ${escapeHTML(t.statusNote)}</div>`:''}</article>`).join('')}</div>`:'<div class="panel empty-panel"><div class="empty-icon">▣</div><h3>Belum ada tiket</h3><p>Request yang kamu kirim akan muncul di sini.</p><button class="btn btn-primary" id="newTicketEmpty">Buat Request</button></div>'}<div class="info-strip"><span>ⓘ</span><p>Riwayat ini hanya berada di browser/perangkat ini. Perubahan status dari panel admin tidak akan tersinkron ke perangkat lain karena project tidak memakai database bersama.</p></div>`;
 document.getElementById('newTicket')?.addEventListener('click',()=>showTab('request'));document.getElementById('newTicketEmpty')?.addEventListener('click',()=>showTab('request'));document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>{const t=own.find(x=>x.id===b.dataset.detail);if(t)alert(`Tiket: ${t.id}\nStatus: ${t.status}\nDibuat: ${fmtDate(t.createdAt)}\n\n${t.body}`);});
}
function renderAnnouncements(target) {
 const items=getAnnouncements().filter(x=>x.active!==false).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 target.innerHTML=`<div class="intro-block"><div class="large-icon blue">✦</div><h2>Pusat Pengumuman</h2><p>Informasi dan perubahan terbaru dari pengelola website.</p></div>${items.length?`<div class="announcement-list">${items.map(a=>`<article class="panel announcement-card"><div class="announcement-date">${escapeHTML(a.date||'Informasi')}</div><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.body).replace(/\n/g,'<br>')}</p></article>`).join('')}</div>`:'<div class="panel empty-panel"><h3>Belum ada pengumuman aktif</h3><p>Pengumuman baru akan muncul di sini.</p></div>'}<div class="info-strip"><span>ⓘ</span><p>Tanpa database bersama, pengumuman yang dibuat lewat panel admin hanya tersedia pada browser yang sama.</p></div>`;
}
function renderFaq(target) {
 const items=getFaqs().filter(x=>x.active!==false);
 target.innerHTML=`<div class="intro-block"><div class="large-icon mint">?</div><h2>Pusat Bantuan / FAQ</h2><p>Temukan jawaban untuk pertanyaan umum tentang request dan tiket.</p></div><label class="faq-search-label">Cari pertanyaan<input id="faqSearch" placeholder="Ketik kata kunci..."></label><div id="faqList" class="faq-list">${faqItems(items)}</div>`;
 document.getElementById('faqSearch').oninput=e=>{const q=e.target.value.toLowerCase();document.getElementById('faqList').innerHTML=faqItems(items.filter(f=>(f.q+' '+f.a).toLowerCase().includes(q)));};
}
function faqItems(items){return items.length?items.map(f=>`<details class="panel faq-item"><summary>${escapeHTML(f.q)}</summary><p>${escapeHTML(f.a).replace(/\n/g,'<br>')}</p></details>`).join(''):'<div class="panel empty-panel"><p>Tidak ada pertanyaan yang cocok.</p></div>';}
function ownerDashboard() {
 shell(`<div class="owner-shell"><header class="owner-top"><a class="brand" href="/"><span class="brand-mark">R</span><span>REQ<span class="muted">BOT</span></span></a><span class="owner-badge">PANEL ADMIN · DATA LOKAL</span><a class="btn btn-quiet btn-small" href="/">Buka Website ↗</a></header><main class="owner-content"><div class="eyebrow">ADMIN WORKSPACE</div><h1>Kelola request<span class="gradient-text">.</span></h1><p class="owner-desc">Panel ini mengelola tiket, pengumuman, dan FAQ yang tersimpan di localStorage browser ini. Ini bukan inbox bersama untuk semua pengunjung.</p><div class="admin-tabs"><button class="admin-tab active" data-admin-tab="tickets">Tiket</button><button class="admin-tab" data-admin-tab="announcements">Pengumuman</button><button class="admin-tab" data-admin-tab="faqs">FAQ</button></div><div id="adminContent"></div><div class="security-warning">PENTING: panel ?owner=1 tidak dilindungi login server. Jangan mengandalkan panel ini sebagai admin privat untuk data publik. localStorage dan status tidak tersinkron lintas perangkat.</div></main></div>`);
 document.querySelectorAll('[data-admin-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-admin-tab]').forEach(x=>x.classList.toggle('active',x===b));renderAdminTab(b.dataset.adminTab);});renderAdminTab('tickets');
}
function renderAdminTab(tab) {
 const target=document.getElementById('adminContent');if(!target)return;
 if(tab==='tickets') {
  const items=getRequests();target.innerHTML=`<div class="admin-toolbar"><div><h2>Daftar tiket (${items.length})</h2><p>Ubah status dan catatan untuk tiket yang tersimpan di browser ini.</p></div><button class="btn btn-outline btn-small" id="exportTickets">Ekspor JSON</button></div>${items.length?`<div class="admin-ticket-list">${items.map(t=>`<article class="panel admin-ticket" data-ticket="${escapeHTML(t.id)}"><div class="ticket-top"><code>${escapeHTML(t.id)}</code><span class="ticket-status ${statusClass(t.status)}">${escapeHTML(t.status)}</span></div><h3>${escapeHTML(t.topic)}</h3><p>${escapeHTML(t.name)} · ID ${escapeHTML(t.telegramId)} · ${escapeHTML(fmtDate(t.createdAt))}</p><p class="admin-ticket-body">${escapeHTML(t.body).replace(/\n/g,'<br>')}</p><div class="admin-ticket-controls"><label>Status<select class="form-select status-select"><option ${t.status==='Menunggu'?'selected':''}>Menunggu</option><option ${t.status==='Diproses'?'selected':''}>Diproses</option><option ${t.status==='Selesai'?'selected':''}>Selesai</option><option ${t.status==='Ditolak'?'selected':''}>Ditolak</option></select></label><label>Catatan owner<input class="status-note-input" maxlength="300" value="${escapeHTML(t.statusNote||'')}" placeholder="Catatan untuk tiket ini"></label><button class="btn btn-primary btn-small save-status">Simpan Status</button></div></article>`).join('')}</div>`:'<div class="panel empty-panel"><h3>Belum ada tiket tersimpan</h3><p>Ticket baru akan muncul di browser tempat request dibuat.</p></div>'}`;
  document.getElementById('exportTickets')?.addEventListener('click',()=>downloadJSON('reqbot-tickets.json',getRequests()));
  document.querySelectorAll('.admin-ticket').forEach(card=>card.querySelector('.save-status').onclick=()=>{const all=getRequests(),t=all.find(x=>x.id===card.dataset.ticket);if(!t)return;t.status=card.querySelector('.status-select').value;t.statusNote=card.querySelector('.status-note-input').value.trim();t.updatedAt=new Date().toISOString();writeJSON(KEYS.requests,all);toast(`Status ${t.id} disimpan di browser ini.`);renderAdminTab('tickets');});
 } else if(tab==='announcements') {
  const items=getAnnouncements();target.innerHTML=`<div class="admin-toolbar"><div><h2>Kelola Pengumuman</h2><p>Tambah dan hapus pengumuman lokal.</p></div></div><form id="announcementForm" class="panel admin-form"><label>Judul<input id="announcementTitle" required maxlength="120" placeholder="Judul pengumuman"></label><label>Isi pengumuman<textarea id="announcementBody" required maxlength="2000" rows="4" placeholder="Tulis informasi..."></textarea></label><button class="btn btn-primary" type="submit">Tambah Pengumuman</button></form><div class="admin-item-list">${items.map(a=>`<article class="panel admin-item"><div><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.body)}</p><small>${escapeHTML(a.date||'')}</small></div><button class="btn btn-outline btn-small delete-announcement" data-id="${escapeHTML(a.id)}">Hapus</button></article>`).join('')}</div>`;
  document.getElementById('announcementForm').onsubmit=e=>{e.preventDefault();const next=getAnnouncements();next.unshift({id:`ann-${Date.now()}`,title:document.getElementById('announcementTitle').value.trim(),body:document.getElementById('announcementBody').value.trim(),date:new Date().toISOString().slice(0,10),active:true});writeJSON(KEYS.announcements,next);renderAdminTab('announcements');toast('Pengumuman disimpan pada browser ini.');};
  document.querySelectorAll('.delete-announcement').forEach(b=>b.onclick=()=>{writeJSON(KEYS.announcements,getAnnouncements().filter(x=>x.id!==b.dataset.id));renderAdminTab('announcements');});
 } else {
  const items=getFaqs();target.innerHTML=`<div class="admin-toolbar"><div><h2>Kelola FAQ</h2><p>Tambah atau hapus pertanyaan bantuan.</p></div></div><form id="faqForm" class="panel admin-form"><label>Pertanyaan<input id="faqQuestion" required maxlength="180" placeholder="Pertanyaan umum"></label><label>Jawaban<textarea id="faqAnswer" required maxlength="2500" rows="4" placeholder="Jawaban... "></textarea></label><button class="btn btn-primary" type="submit">Tambah FAQ</button></form><div class="admin-item-list">${items.map(f=>`<article class="panel admin-item"><div><h3>${escapeHTML(f.q)}</h3><p>${escapeHTML(f.a)}</p></div><button class="btn btn-outline btn-small delete-faq" data-id="${escapeHTML(f.id)}">Hapus</button></article>`).join('')}</div>`;
  document.getElementById('faqForm').onsubmit=e=>{e.preventDefault();const next=getFaqs();next.push({id:`faq-${Date.now()}`,q:document.getElementById('faqQuestion').value.trim(),a:document.getElementById('faqAnswer').value.trim(),active:true});writeJSON(KEYS.faqs,next);renderAdminTab('faqs');toast('FAQ disimpan pada browser ini.');};document.querySelectorAll('.delete-faq').forEach(b=>b.onclick=()=>{writeJSON(KEYS.faqs,getFaqs().filter(x=>x.id!==b.dataset.id));renderAdminTab('faqs');});
 }
}
function downloadJSON(name,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
function init(){installParticles();if(state.owner){ownerDashboard();return;}try{const saved=JSON.parse(localStorage.getItem(KEYS.profile)||'null');if(saved?.name&&saved?.telegramId){state.profile=saved;dashboard();return;}}catch{}landing();}
init();
