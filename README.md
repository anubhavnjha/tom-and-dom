# tom' and dom' 🖋️

A poetry website built with love for literature and tom.

---

## 🚀 How to put this live on GitHub Pages

1. Create a new **public** repository on GitHub (e.g. `tom-and-dom`)
2. Upload ALL these files keeping the folder structure exactly as-is
3. Go to **Settings → Pages → Source → Deploy from branch → main / root**
4. GitHub gives you a free URL: `https://yourusername.github.io/tom-and-dom/`

---

## 🖼️ Adding your background image

1. Place your dark library background photo inside `assets/images/`
2. Name it exactly **`bg.jpg`**
3. Push to GitHub — done ✅

> **Tip:** For best quality, use a photo that is at least 1920×1080px and under 500 KB (compress at [squoosh.app](https://squoosh.app)).

---

## ✍️ How to add a new poem

Open `data/poems.json` and add a new object inside the `"poems": [ … ]` array.

**Template:**
```json
{
  "id": 6,
  "title": "Your Poem Title",
  "date": "2025-01-20",
  "tags": ["love", "nature"],
  "excerpt": "First line of the poem — shown on the card preview...",
  "content": "First line\nSecond line\n\nNew stanza starts here\nAnother line."
}
```

**Rules:**
- `id` must be a unique number — just increment from the last one
- `date` format: `YYYY-MM-DD`
- `tags` — array of lowercase strings, used for search
- `excerpt` — optional short preview (1–2 lines). If omitted, the site auto-generates one
- `content` — the full poem. Use `\n` for line breaks and `\n\n` for new stanzas
- Add a **comma** after the closing `}` of the previous poem before adding yours

**Save the file and push to GitHub.** The site updates in ~1 minute. The Service Worker automatically delivers the new poem to all returning visitors.

---

## 📱 PWA (saves to phones)

This site is a **Progressive Web App**. When visitors open it on their phone, they can tap *"Add to Home Screen"* and use it like a native app — poems load even offline because the Service Worker caches everything automatically.

---

## 🔗 Updating social links

In `index.html`, find the `<div class="social-row">` block and replace the `href="#"` placeholders:

```html
<a href="https://instagram.com/yourhandle" class="social-icon" ...>
<a href="https://linkedin.com/in/yourprofile" class="social-icon" ...>
<a href="https://x.com/yourhandle" class="social-icon" ...>
<a href="https://youtube.com/@yourchannel" class="social-icon" ...>
```

---

## 📂 File structure

```
tom-and-dom/
├── index.html          ← main page (hero, about, credit, contact)
├── poems.html          ← all poems grid + search
├── style.css           ← all styles
├── script.js           ← main page JavaScript
├── poems-script.js     ← poems page JavaScript
├── sw.js               ← Service Worker (offline / PWA)
├── manifest.json       ← PWA manifest
├── data/
│   └── poems.json      ← 📝 ADD YOUR POEMS HERE
└── assets/
    ├── images/
    │   └── bg.jpg      ← 🖼️ YOUR BACKGROUND IMAGE HERE
    └── icons/
        ├── icon-192.png  ← app icon (192×192)
        └── icon-512.png  ← app icon (512×512)
```

---

Made with love for literature & tom. 🤍
