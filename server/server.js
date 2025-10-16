const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 4173;

app.use(cookieParser());
app.use(express.json());

// Serve static assets
app.use(express.static(path.join(__dirname, '..')));

// Middleware to inject GA/AdSense if consent cookie present
app.get(['/', '/index.html', '/home', '/*'], (req, res, next) => {
  const filePath = path.join(__dirname, '..', 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return next(err);

    const consentRaw = req.cookies['fap_user_consent_v1'];
    let consent = null;
    try {
      consent = consentRaw ? JSON.parse(consentRaw) : null;
    } catch (e) {
      consent = null;
    }

    let out = data;

    if (consent && consent.analytics) {
      // Replace analytics placeholder (type="text/plain" data-consent="analytics") with real GA scripts
      out = out.replace(/<script[^>]*data-consent="analytics"[^>]*>\s*<\/script>/i, '')
               .replace(/<script[^>]*id="gtag-init"[^>]*>[\s\S]*?<\/script>/i, (match) => match)
               .replace('</head>', `  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17652727564"></script>\n  <script>\n    window.dataLayer = window.dataLayer || [];\n    function gtag(){dataLayer.push(arguments);}\n    gtag('js', new Date());\n    gtag('config', 'AW-17652727564');\n  </script>\n</head>`);
    }

    if (consent && consent.ads) {
      // Replace ads placeholder with real AdSense script
      out = out.replace(/<script[^>]*data-consent="ads"[^>]*>\s*<\/script>/i, `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9817979142101005" crossorigin="anonymous"></script>\n`);
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(out);
  });
});

// API endpoint to set consent cookie
app.post('/api/consent', (req, res) => {
  const consent = req.body;
  if (!consent || typeof consent !== 'object') {
    return res.status(400).json({ error: 'invalid consent payload' });
  }

  // Cookie options: in production you should set Secure and HttpOnly as needed.
  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // client-side still reads localStorage; keep cookie readable for server injection
    sameSite: 'Lax'
  };

  res.cookie('fap_user_consent_v1', JSON.stringify(consent), cookieOptions);
  return res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
