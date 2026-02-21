# Gentlemen's Club

A personal media library app I built to organize my video collection. It's an Electron desktop app with an embedded browser, so you can search sites directly without leaving the app.

## What is this?

Basically a hub for saving and organizing videos from various sites. You paste a URL, it grabs the metadata, and you can organize everything into playlists, favorites, etc. Think of it like your own private YouTube but for... whatever you want.

## Running it

You'll need Node.js installed. Then:

```bash
npm install
npm start
```

That's it. The app opens and you're good to go.

## Main Features

**Video Library** - Save videos from pretty much any site. Paste the URL and it tries to auto-fetch the title, thumbnail, and duration. You can edit everything manually too.

**Embedded Browser** - The search tab lets you search external sites (PornHub, XVideos, Reddit, etc.) and the results load right inside the app. No more switching between browser tabs. This only works in the desktop app since websites block iframe embedding.

**Playlists & Organization** - Create playlists, mark favorites, add to watch later. Standard stuff but it works well.

**Creators** - Save your favorite artists, models, channels, studios. Keeps track of how many videos you have from each one.

**Quick Sites** - Shortcuts to your frequently visited sites with auto-fetched logos.

**Customizable Home** - The home screen has widgets you can add, remove, and reorder. Recent videos, favorites, stats, quick links, etc.

**Dark/Light Mode** - Toggle in the top right. The dark mode is the default and looks way better imo.

## Editing stuff

- On desktop: hover over any card and you'll see edit/delete icons
- On mobile/touch: long-press on a card to edit it
- Right-click also works for a context menu

## Building for distribution

If you want to package it as a proper installable app:

```bash
npm run build:win    # Windows .exe
npm run build:mac    # macOS .dmg  
npm run build:linux  # Linux AppImage
```

Outputs go to the `dist/` folder.

## Data

Everything saves to localStorage, so it persists between sessions but stays local to your machine. Nothing is sent anywhere.

Keys used:
- `gentlemensclub_videos` - your saved videos
- `gentlemensclub_sites` - quick link sites
- `gentlemensclub_playlists` - playlists
- `gentlemensclub_favorites` - favorited video IDs
- `gentlemensclub_subscriptions` - saved creators
- `gentlemensclub_theme` - dark/light preference
- `gentlemensclub_widgets` - home screen layout

## Dev stuff

Live reload is enabled by default when you run `npm start`. Save a file and the app refreshes automatically. Makes development way faster.

The code is pretty straightforward - just HTML/CSS/JS, no frameworks. Everything's in a few files:

- `main.js` - Electron main process, handles the window and strips iframe-blocking headers
- `app.js` - All the app logic
- `styles.css` - All styling
- `index.html` / `player.html` - The two pages

## Color palette

If you're tweaking the theme:

- `#1A1A1A` - Main dark background
- `#D99BA1` - Accent color (soft rose)
- `#6B1A1A` - Deep burgundy for borders
- `#F2E8CF` - Light mode background
- `#C9A080` - Secondary text color

---

Built this for personal use but figured I'd clean it up in case anyone else finds it useful.
