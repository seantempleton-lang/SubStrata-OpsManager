# SubStrata — Field Operations Management

## Deploy to Netlify

### Option A — Drag & Drop (quickest)
1. Zip this entire folder
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag the zip onto the Netlify dashboard
4. Netlify will detect `netlify.toml`, run `npm install && npm run build`, and deploy

### Option B — GitHub + Netlify (recommended for ongoing updates)
1. Push this folder to a GitHub repository
2. In Netlify: **Add new site → Import an existing project → GitHub**
3. Select the repo — build settings are pre-configured in `netlify.toml`
4. Click **Deploy**

### Option C — Run locally first
```bash
npm install
npm run dev
```
Then open http://localhost:5173

## Project Structure
```
substrata/
├── index.html          # Entry point
├── netlify.toml        # Netlify build config
├── vite.config.js      # Vite bundler config
├── package.json        # Dependencies
├── public/
│   ├── favicon.svg     # SubStrata logo
│   └── _redirects      # Netlify SPA routing
└── src/
    ├── main.jsx        # React entry
    ├── index.css       # Global styles
    └── App.jsx         # Main application
```

## Built With
- React 18
- Vite 5
- No external UI libraries — fully self-contained
