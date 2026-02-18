

📄 README.md

`markdown

StreamMe 🎶📺

StreamMe is a full-stack music and video streaming/downloader platform with:
- YouTube, Spotify, SoundCloud, TikTok, Instagram integration
- Lyrics finder
- Real-time chatroom
- Albums & playlists
- Modern React + TypeScript + Vite frontend
- Node.js + Express + MongoDB backend

---

🚀 Project Structure

`
streamme/
├── backend/          # Express + MongoDB + Socket.IO
│   ├── routes/       # API routes
│   ├── models/       # Database schemas
│   ├── chat/         # Socket.IO chat logic
│   ├── utils/        # Helpers (API client, middleware)
│   ├── public/       # Static HTML files
│   └── server.js     # Entry point
│
├── frontend/         # React + TypeScript + Vite
│   ├── src/
│   │   ├── assets/   # Images (logo if local)
│   │   ├── components/ # UI components
│   │   ├── pages/    # Login, Signup, Home, Chatroom, Lyrics
│   │   ├── api/      # API wrappers
│   │   ├── hooks/    # Custom hooks
│   │   ├── types/    # TypeScript interfaces
│   │   ├── App.tsx   # Routing
│   │   └── main.tsx  # Entry point
│   └── vite.config.ts
│
├── package.json      # Root (optional workspace setup)
└── README.md
`

---

🎨 Logo

The StreamMe logo is loaded from an external URL:

`
https://n.uguu.se/UttreQqr.jpg
`

This is used directly in the frontend:

`tsx
<img src="https://n.uguu.se/UttreQqr.jpg" alt="StreamMe Logo" />
`

---

⚙️ Environment Variables

Backend .env
`env
PORT=5000
MONGO_URI=mongodb://localhost:27017/streamme
SESSION_SECRET=streamme-secret
QASIMAPIKEY=qasim-dev
`

Frontend .env
`env
VITEAPIURL=http://localhost:5000/api
`

---

🛠️ Installation

1. Clone the repo
`bash
git clone https://github.com/Neaterry6/StreamMe-songs-and-video-.git
cd streamme
`

2. Backend setup
`bash
cd backend
npm install
npm run dev
`

3. Frontend setup
`bash
cd frontend
npm install
npm run dev
`

---

📡 API Endpoints

- GET /api/youtube/search?q=... → Search YouTube
- GET /api/youtube/download?url=... → Download YouTube video
- GET /api/music?query=... → Search Spotify/SoundCloud
- GET /api/social?url=... → Download TikTok/Instagram
- GET /api/lyrics?song=... → Fetch lyrics
- POST /api/auth/login → Login
- POST /api/auth/signup → Signup

---

💬 Chatroom

- Real-time messaging powered by Socket.IO
- Supports text messages (extendable to images/voice notes)

---

🎨 Frontend Features

- Loading Screen with StreamMe logo (via external URL)
- Login/Signup forms
- Home Feed with search + trending cards
- Player at bottom for streaming
- Chatroom with live messages
- Lyrics Finder

---

🧑‍💻 Development Notes

- Use npm workspaces if you want one package.json at root:
`json
{
  "name": "streamme",
  "private": true,
  "workspaces": ["backend", "frontend"],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace backend\" \"npm run dev --workspace frontend\""
  },
  "devDependencies": {
    "concurrently": "^8.0.1"
  }
}
`

- Backend runs on http://localhost:5000
- Frontend runs on http://localhost:5173

---

📦 Deployment

- Frontend → Deploy via Vercel/Netlify (static build from Vite).
- Backend → Deploy via Heroku, Render, or Docker.
- Ensure .env.production files are set correctly.

---

📜 License

MIT License © 2026 Broken
