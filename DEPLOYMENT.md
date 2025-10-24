# 🚀 Deployment Guide - Netlify dengan PWA

## Masalah yang Diperbaiki
Setelah implementasi PWA, aplikasi tidak muncul di Netlify karena:
1. ❌ Missing Service Worker headers
2. ❌ Missing manifest headers  
3. ❌ SPA redirect tidak dikonfigurasi untuk PWA
4. ❌ Cache control untuk SW tidak optimal

## ✅ Solusi yang Diimplementasikan

### 1. **netlify.toml - Konfigurasi PWA Headers**

```toml
# Service Worker Headers (CRITICAL!)
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Service-Worker-Allowed = "/"

[[headers]]
  for = "/workbox-*.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Service-Worker-Allowed = "/"

# Manifest Headers
[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Content-Type = "application/manifest+json"
    Cache-Control = "public, max-age=0, must-revalidate"

# SPA Redirect (CRITICAL!)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. **vite.config.js - PWA Strategy**

```javascript
VitePWA({
  // ... existing config
  strategies: 'generateSW',
  filename: 'sw.js',
})
```

## 📝 Checklist Deployment

### Pre-deployment
- [ ] ✅ PWA dinonaktifkan di development (`devOptions.enabled: false`)
- [ ] ✅ Build command: `npm run build`
- [ ] ✅ Publish directory: `dist`
- [ ] ✅ Node version: 20

### File yang Harus Ada di GitHub
```
✅ netlify.toml (dengan PWA headers)
✅ public/_redirects (SPA fallback)
✅ vite.config.js (dengan VitePWA)
✅ package.json (dengan dependencies PWA)
✅ src/main.js (dengan registerSW)
❌ dist/ (jangan di-push, auto-generated)
❌ node_modules/ (jangan di-push)
```

### Post-deployment Check
- [ ] ✅ Aplikasi muncul di URL Netlify
- [ ] ✅ Service Worker terdaftar (cek DevTools > Application > Service Workers)
- [ ] ✅ Manifest ter-load (cek DevTools > Application > Manifest)
- [ ] ✅ Installable di mobile/desktop
- [ ] ✅ Offline mode berfungsi

## 🔧 Troubleshooting

### Problem 1: Aplikasi Tidak Muncul (Blank Page)
**Gejala:** Setelah deploy, halaman kosong/blank

**Solusi:**
1. Pastikan `netlify.toml` ada dan benar
2. Pastikan redirects ada: `/* -> /index.html 200`
3. Clear cache Netlify: Settings > Build & Deploy > Clear cache and deploy

### Problem 2: Service Worker Tidak Terdaftar
**Gejala:** PWA tidak installable, no service worker

**Solusi:**
1. Pastikan headers untuk `/sw.js` dan `/workbox-*.js` ada
2. Check Console untuk error service worker
3. Pastikan HTTPS aktif (Netlify auto-enable)

### Problem 3: Manifest Tidak Ter-load
**Gejala:** Warning di console: "Manifest not found"

**Solusi:**
1. Pastikan headers untuk `/manifest.webmanifest` ada
2. Check `Content-Type: application/manifest+json`
3. Rebuild dan redeploy

### Problem 4: 404 Error Saat Reload Page
**Gejala:** Refresh page non-root menampilkan 404

**Solusi:**
1. Pastikan SPA redirect ada di `netlify.toml`
2. Atau pastikan `public/_redirects` ada dengan: `/* /index.html 200`

### Problem 5: Old Version Masih Muncul
**Gejala:** Update tidak muncul, masih versi lama

**Solusi:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Unregister service worker: DevTools > Application > Service Workers > Unregister
3. Hard reload: `Ctrl+Shift+R`

## 🚀 Deployment Steps

### Method 1: GitHub Auto Deploy (Recommended)

1. **Push ke GitHub:**
```bash
git add .
git commit -m "Fix PWA deployment for Netlify"
git push origin main
```

2. **Netlify Auto Build:**
   - Netlify akan otomatis detect perubahan
   - Build akan jalan otomatis
   - Deploy otomatis setelah build sukses

### Method 2: Manual Deploy

1. **Build Lokal:**
```bash
npm run build
```

2. **Deploy via Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### Method 3: Drag & Drop

1. Build lokal: `npm run build`
2. Buka Netlify dashboard
3. Drag folder `dist` ke Netlify drop zone

## 📊 Build Commands Reference

```bash
# Development (PWA disabled)
npm run dev

# Production Build (PWA enabled)
npm run build

# Preview Production Build
npm run preview

# Check Build Size
npm run build -- --mode production
```

## 🌐 Environment Variables (Optional)

Jika ada environment variables, set di Netlify:

1. Go to: Site settings > Build & Deploy > Environment
2. Add variables:
   - `VITE_SUPABASE_URL`: your_supabase_url
   - `VITE_SUPABASE_ANON_KEY`: your_anon_key

**Note:** Variabel harus diawali `VITE_` untuk accessible di Vite.

## 🔍 Verification Checklist

After deployment, verify:

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works (all routes)
- [ ] Login/signup works
- [ ] Dashboard loads data
- [ ] Transactions CRUD works
- [ ] Reports generate correctly

### 2. PWA Features
- [ ] Install prompt muncul (mobile/desktop)
- [ ] Aplikasi bisa di-install
- [ ] Icon muncul di home screen
- [ ] Splash screen muncul (mobile)
- [ ] Offline mode works
- [ ] Update notification works

### 3. Performance
- [ ] Lighthouse PWA score: 100
- [ ] Page load < 3s
- [ ] Time to Interactive < 5s
- [ ] Assets cached correctly

### 4. Security
- [ ] HTTPS enabled (auto by Netlify)
- [ ] Security headers present
- [ ] No mixed content warnings
- [ ] CSP headers (optional)

## 📱 Testing PWA Install

### Desktop (Chrome/Edge)
1. Buka aplikasi di browser
2. Look for install icon di address bar
3. Click install
4. App muncul di Start Menu/Applications

### Mobile (Android)
1. Buka di Chrome/Edge
2. Tap menu (3 dots)
3. Tap "Install app" / "Add to Home Screen"
4. Icon muncul di home screen

### Mobile (iOS)
1. Buka di Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Icon muncul di home screen

## 🐛 Debug Tips

### Check Service Worker Status
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered SWs:', regs.length)
  regs.forEach(reg => console.log(reg))
})
```

### Check Manifest
```javascript
// Run in browser console
fetch('/manifest.webmanifest')
  .then(r => r.json())
  .then(m => console.log('Manifest:', m))
```

### Check Cache
```javascript
// Run in browser console
caches.keys().then(keys => {
  console.log('Cache keys:', keys)
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(reqs => {
        console.log(`${key}:`, reqs.length, 'items')
      })
    })
  })
})
```

## 🔄 Rollback Strategy

Jika deployment bermasalah:

1. **Rollback via Netlify:**
   - Go to Deploys
   - Find last working deploy
   - Click "Publish deploy"

2. **Rollback via Git:**
```bash
git revert HEAD
git push origin main
```

3. **Emergency Fix:**
```bash
# Disable PWA temporarily
# Set devOptions.enabled = false in vite.config.js
# Remove VitePWA from plugins
git add vite.config.js
git commit -m "Temporary: disable PWA"
git push
```

## 📞 Support

Jika masih bermasalah:
1. Check Netlify deploy logs
2. Check browser console errors
3. Check Network tab untuk failed requests
4. Test di incognito mode
5. Clear all cache dan test lagi

## 🎉 Success Indicators

Deployment sukses jika:
- ✅ App muncul tanpa error
- ✅ Service Worker registered
- ✅ Manifest loaded
- ✅ Install prompt muncul
- ✅ Offline mode works
- ✅ All routes accessible
- ✅ Data loads from Supabase
- ✅ Lighthouse PWA score 100

---

**Created:** October 24, 2025
**Last Updated:** October 24, 2025
**Version:** 1.0
