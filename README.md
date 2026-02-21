# Gentlemen's Club

A personal video bookmarking and favorites manager. Save, organize, and quickly access your favorite videos from across the web.

## Features

### Video Management
- **Save Videos** - Add videos from any supported site with auto-fetched metadata (title, thumbnail, duration, channel)
- **Edit & Delete** - Right-click any video or site for edit/delete options
- **Favorites** - Mark videos as favorites for quick access (with clear all option)
- **Watch Later** - Queue videos to watch later (with clear all option)
- **Watch History** - Automatically tracks watched videos (with clear all option)
- **Custom Playlists** - Create, edit, and delete playlists
- **Tags** - Add tags to videos for easy filtering

### Creator Management
- **Save Creators** - Save your favorite artists, models, channels, and studios
- **Creator Types** - Categorize as Artist, Model, Channel, Studio, or Creator
- **Profile Links** - Store profile URLs for quick access
- **Avatar Images** - Add profile pictures for visual identification
- **Notes** - Add personal notes about creators
- **Filter by Type** - Quickly filter saved creators by category

### Site Shortcuts
- **Pre-Made Shortcuts** - Comes with 13 popular sites pre-configured
- **Quick Access** - Add shortcuts to your frequently visited sites
- **Custom Colors** - Personalize each site shortcut with custom colors
- **Organized Grid** - Visual grid layout for easy navigation

### Dark/Light Mode
- **Theme Toggle** - Switch between dark and light themes with animated toggle button
- **Persistent Preference** - Your theme choice is saved and remembered
- **Smooth Transitions** - Clean visual switching between modes

### Multi-Site Search
Search directly on external video sites from the search bar:
- YouTube
- PornHub, XVideos, XNXX, xHamster
- RedTube, YouPorn, SpankBang, Eporner
- Reddit, RedGifs, Rule34Video, SFM Compile

### Video Player
- **Embedded Playback** - Watch videos directly in the app when supported
- **Native HTML5 Player** - Direct MP4/WebM files play with native controls
- **Channel Discovery** - "More of Me" button to find creator's page
- **Quick Actions** - Favorite, Watch Later, Add to Playlist from player

### Import/Export
- **Export Profile** - Download your entire profile as a JSON backup file
- **Import Profile** - Restore from a backup file
- **Full Backup** - Includes sites, videos, favorites, playlists, creators, history
- **Reset Options** - Clear all data or reset sites to defaults

### Supported Sites
Automatic metadata fetching and embedding for:
- YouTube, Vimeo, Dailymotion
- PornHub, XVideos, XNXX, xHamster
- RedTube, YouPorn, SpankBang, Eporner
- RedGifs, Streamable, Reddit
- SFM Compile (direct MP4 playback)
- Motherless, ThisVid, Beeg
- HClips, HotMovs, Txxx, Upornia
- And more...

## Usage

1. **Open `index.html`** in your browser
2. **Add Sites** - Click the "+" button in Sites section to add shortcuts
3. **Add Videos** - Click the upload button (📤) to add videos
   - Paste a URL and click "Fetch Info" to auto-fill details
   - Or manually enter video information
4. **Save Creators** - Go to Creators tab and click "Add Creator"
5. **Organize** - Use playlists, favorites, and tags to organize your content
6. **Toggle Theme** - Click the theme toggle button in the header to switch between dark and light modes

### Deleting Items

- **Videos & Sites** - Right-click → Delete
- **Playlists** - Right-click → Delete, or use "Clear All" to delete all playlists
- **Creators** - Click the 🗑️ button on the creator card
- **Favorites/Watch Later/History** - Use "Clear All" button or right-click individual items

### Backup & Restore

1. Click the **Settings** button (⚙️) in the header
2. **Export Profile** - Downloads a `.json` file with all your data
3. **Import Profile** - Select a backup file to restore your data
4. Backups can be transferred between browsers/devices

## Data Storage

All data is stored locally in your browser using `localStorage`:
- `gentlemensclub_sites` - Site shortcuts
- `gentlemensclub_videos` - Saved videos
- `gentlemensclub_favorites` - Favorited video IDs
- `gentlemensclub_playlists` - Custom playlists
- `gentlemensclub_history` - Watch history
- `gentlemensclub_watchlater` - Watch later queue
- `gentlemensclub_subscriptions` - Saved creators
- `gentlemensclub_theme` - Dark/Light mode preference

**Note:** Data is stored locally and never leaves your browser. Clearing browser data will remove all saved content.

## File Structure

```
Gentlemens-Club/
├── index.html        # Main application page
├── player.html       # Video player page
├── styles.css        # All styling (includes dark/light themes)
├── app.js            # Main application logic
├── player.js         # Video player logic
├── user.js           # User data management (favorites, playlists, etc.)
├── metadata.js       # Video metadata fetching
├── logo.png          # Website logo
├── dark mode.gif     # Dark mode toggle icon
├── light mode.gif    # Light mode toggle icon
└── README.md         # This file
```

## Color Palette

The site uses a classic pin-up inspired color scheme:

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Burgundy | `#6B1A1A` | Borders, accents, buttons |
| Soft Rose | `#D99BA1` | Primary accent color |
| Warm Tan | `#C9A080` | Secondary text |
| Classic Black | `#1A1A1A` | Dark mode background |
| Golden Cream | `#F2E8CF` | Light mode background, primary text |
| Clean White | `#FFFFFF` | Light mode cards |

## Technical Details

- **Pure Vanilla JS** - No frameworks or build tools required
- **Client-Side Only** - No server needed, runs entirely in browser
- **CORS Proxies** - Uses proxy services to fetch metadata from external sites
- **Responsive Design** - Works on desktop and tablet screens
- **Dark/Light Themes** - Toggle between themes with persistent preference

## Privacy

- All data stays in your browser's localStorage
- No accounts, no servers, no tracking
- Metadata fetching uses public CORS proxies
- Video playback connects directly to source sites

## Browser Support

Works best in modern browsers:
- Chrome / Edge (Chromium)
- Firefox
- Safari

## Disclaimer

This is a personal project for organizing bookmarks. Users are responsible for the content they save and must comply with all applicable laws and terms of service of the sites they access.
