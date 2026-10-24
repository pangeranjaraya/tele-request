import { OWNER, TELEGRAM_CHANNEL_ID } from './config.js';

const safeText = (value = '') => String(value).replace(/\u0000/g, '').slice(0, 3000);
const json = (res, status, body) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
const configured = value => Boolean(value && !String(value).includes('GANTI_') && !String(value).includes('ISI_ID_CHANNEL'));

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method tidak diizinkan.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== 'object') return json(res, 400, { error: 'Body request tidak valid.' });

  const name = String(body.name || '').trim().slice(0, 80);
  const telegramId = String(body.telegramId || '').trim();
  const type = String(body.type || 'Auto Request').trim().slice(0, 120);
  const message = String(body.message || '').trim();
  const destination = body.destination === 'channel' ? 'channel' : body.destination === 'owner' ? 'owner' : '';
  if (!name || !/^[0-9]{5,20}$/.test(telegramId) || !type || !message || message.length > 3000 || !destination) {
    return json(res, 400, { error: 'Data request tidak lengkap atau tidak valid.' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return json(res, 500, { error: 'TELEGRAM_BOT_TOKEN belum diisi di Vercel → Project Settings → Environment Variables.' });

  let chatId;
  if (destination === 'owner') {
    if (!configured(OWNER.telegramId)) return json(res, 500, { error: 'ID Telegram owner belum diatur. Edit api/config.js → OWNER.telegramId.' });
    chatId = OWNER.telegramId;
  } else {
    if (!configured(TELEGRAM_CHANNEL_ID) || !/^-100\d{5,}$/.test(String(TELEGRAM_CHANNEL_ID))) return json(res, 500, { error: 'ID channel belum diatur dengan benar. Isi TELEGRAM_CHANNEL_ID di api/config.js menggunakan ID numerik channel (biasanya diawali -100).'});
    chatId = TELEGRAM_CHANNEL_ID;
  }

  const ownerName = configured(OWNER.name) ? OWNER.name : 'Owner REQ BOT';
  const ownerRole = configured(OWNER.role) ? OWNER.role : 'Owner';
  const timestamp = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date());
  const text = [
    '📩 REQUEST BARU — REQ BOT',
    `Tujuan: ${destination === 'channel' ? 'Channel Telegram' : 'Owner pribadi'}`,
    `Owner: ${safeText(ownerName)}`,
    `Role: ${safeText(ownerRole)}`,
    `Nama user: ${safeText(name)}`,
    `Telegram ID user: ${telegramId}`,
    `Jenis: ${safeText(type)}`,
    `Waktu WIB: ${timestamp}`,
    '',
    'DETAIL REQUEST',
    safeText(message)
  ].join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      const description = result.description || 'Telegram gagal mengirim notifikasi.';
      return json(res, 502, { error: `Telegram menolak pengiriman: ${description}. Pastikan ID channel benar dan bot sudah ditambahkan sebagai admin channel dengan izin mengirim pesan.` });
    }
    return json(res, 200, { ok: true, destination, message: `Notifikasi berhasil dikirim ke ${destination === 'channel' ? 'channel' : 'owner'}.` });
  } catch {
    return json(res, 502, { error: 'Tidak dapat terhubung ke Telegram. Coba lagi nanti.' });
  }
}
