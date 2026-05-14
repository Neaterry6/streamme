const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── YouTube Search (working via oembed + search) ───
app.get("/api/youtube/search", async (req, res) => {
  const q = String(req.query.q || "");
  if (!q) return res.json({ results: [] });
  try {
    const r = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=en`);
    const html = await r.text();
    const ids = [...html.matchAll(/watch\?v=([a-zA-Z0-9_-]{11})/g)].map(m => m[1]);
    const unique = [...new Set(ids)].slice(0, 20);
    
    const results = await Promise.all(unique.map(async (id) => {
      try {
        const oembed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`).then(r => r.json());
        return {
          id, title: oembed.title || "Untitled",
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          author: oembed.author_name || "Unknown",
          url: `https://www.youtube.com/watch?v=${id}`
        };
      } catch { return null; }
    }));
    res.json({ results: results.filter(Boolean) });
  } catch { res.json({ results: [] }); }
});

app.get("/api/youtube/trending", async (req, res) => {
  try {
    const r = await fetch("https://www.youtube.com/feed/trending?hl=en");
    const html = await r.text();
    const ids = [...html.matchAll(/watch\?v=([a-zA-Z0-9_-]{11})/g)].map(m => m[1]);
    const unique = [...new Set(ids)].slice(0, 30);
    
    const results = await Promise.all(unique.map(async (id) => {
      try {
        const oembed = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`).then(r => r.json());
        return {
          id, title: oembed.title || "Untitled",
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          author: oembed.author_name || "Unknown", views: "Trending",
          url: `https://www.youtube.com/watch?v=${id}`
        };
      } catch { return null; }
    }));
    res.json({ results: results.filter(Boolean) });
  } catch { res.json({ results: [] }); }
});

// ─── Images (Unsplash) ───
app.get("/api/images/search", async (req, res) => {
  const q = String(req.query.q || "nature");
  try {
    const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=20`, {
      headers: { 'Authorization': `Client-ID ${process.env.UNSPLASH_KEY || 'demo'}` }
    });
    const data = await r.json();
    const results = (data.results || []).map(img => ({
      id: img.id, url: img.urls?.regular || img.urls?.small || '',
      thumb: img.urls?.thumb || '', description: img.alt_description || '',
      author: img.user?.name || 'Unknown',
      download: img.links?.download || img.urls?.full || ''
    }));
    res.json({ results });
  } catch { res.json({ results: [] }); }
});

app.get("/api/images/trending", async (req, res) => {
  try {
    const r = await fetch(`https://api.unsplash.com/photos?per_page=30&order_by=popular`, {
      headers: { 'Authorization': `Client-ID ${process.env.UNSPLASH_KEY || 'demo'}` }
    });
    const data = await r.json();
    const results = (data || []).map(img => ({
      id: img.id, url: img.urls?.regular || '', thumb: img.urls?.thumb || '',
      description: img.alt_description || '', author: img.user?.name || 'Unknown',
      download: img.links?.download || img.urls?.full || ''
    }));
    res.json({ results });
  } catch { res.json({ results: [] }); }
});

// ─── Tools ───
app.get("/api/tools/weather", async (req, res) => {
  const city = String(req.query.city || "london");
  try {
    const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
    const data = await r.json();
    const c = data?.current_condition?.[0] || {};
    res.json({
      city, temp: c.temp_C + "°C", condition: c.weatherDesc?.[0]?.value || "N/A",
      humidity: c.humidity + "%", wind: c.windspeedKmph + " km/h",
      feelsLike: c.FeelsLikeC + "°C"
    });
  } catch { res.json({ error: "Weather unavailable" }); }
});

app.get("/api/tools/translate", async (req, res) => {
  const text = String(req.query.text || "");
  const target = String(req.query.target || "es");
  if (!text) return res.json({ error: "Text required" });
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`);
    const data = await r.json();
    res.json({ translated: data?.responseData?.translatedText || text, target });
  } catch { res.json({ error: "Translation failed" }); }
});

app.get("/api/tools/qr", (req, res) => {
  const text = String(req.query.text || "");
  if (!text) return res.json({ error: "Text required" });
  res.json({ url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`, text });
});

app.get("/api/tools/password", (req, res) => {
  const len = Number(req.query.length) || 16;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < len; i++) password += chars[Math.floor(Math.random() * chars.length)];
  res.json({ password, length: len });
});

app.get("/api/tools/lyrics", async (req, res) => {
  const artist = String(req.query.artist || "");
  const title = String(req.query.title || "");
  if (!artist || !title) return res.json({ error: "Artist and title required" });
  try {
    const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    const data = await r.json();
    res.json({ lyrics: data?.lyrics || "Not found", artist, title });
  } catch { res.json({ error: "Lyrics not found" }); }
});

app.get("/api/tools/ip", async (req, res) => {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const data = await r.json();
    res.json({ ip: data.ip || "Unknown" });
  } catch { res.json({ error: "Failed" }); }
});

// ─── Serve Frontend ───
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => console.log(`🚀 StreamMe running on http://localhost:${PORT}`));
}
