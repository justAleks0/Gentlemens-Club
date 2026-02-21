// Gentlemen's Club - Personal Bookmark Dashboard

class GentlemensClub {
    constructor() {
        this.sites = JSON.parse(localStorage.getItem('gentlemensclub_sites')) || this.getDefaultSites();
        this.videos = JSON.parse(localStorage.getItem('gentlemensclub_videos')) || [];
        this.currentTab = 'videos';
        this.editingItem = null;
        this.editingPlaylist = null;
        this.contextTarget = null;
        this.activeTag = null;
        this.currentPlaylistId = null;
        this.addToPlaylistVideoId = null;
        this.currentTheme = localStorage.getItem('gentlemensclub_theme') || 'dark';
        this.widgets = JSON.parse(localStorage.getItem('gentlemensclub_widgets')) || this.getDefaultWidgets();
        this.editMode = false;
        
        this.init();
    }
    
    getDefaultWidgets() {
        return [
            { id: 'w1', type: 'stats' },
            { id: 'w2', type: 'recentVideos' },
            { id: 'w3', type: 'quickLinks' }
        ];
    }
    
    getDefaultSites() {
        return [
            { id: 'yt', name: 'YouTube', url: 'https://www.youtube.com', color: '#ff0000', logo: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128' },
            { id: 'ph', name: 'PornHub', url: 'https://www.pornhub.com', color: '#ff9000', logo: 'https://www.google.com/s2/favicons?domain=pornhub.com&sz=128' },
            { id: 'xv', name: 'XVideos', url: 'https://www.xvideos.com', color: '#c40808', logo: 'https://www.google.com/s2/favicons?domain=xvideos.com&sz=128' },
            { id: 'xn', name: 'XNXX', url: 'https://www.xnxx.com', color: '#ed1c24', logo: 'https://www.google.com/s2/favicons?domain=xnxx.com&sz=128' },
            { id: 'xh', name: 'xHamster', url: 'https://xhamster.com', color: '#f68b1f', logo: 'https://www.google.com/s2/favicons?domain=xhamster.com&sz=128' },
            { id: 'rt', name: 'RedTube', url: 'https://www.redtube.com', color: '#d21f1f', logo: 'https://www.google.com/s2/favicons?domain=redtube.com&sz=128' },
            { id: 'yp', name: 'YouPorn', url: 'https://www.youporn.com', color: '#c2004d', logo: 'https://www.google.com/s2/favicons?domain=youporn.com&sz=128' },
            { id: 'sb', name: 'SpankBang', url: 'https://spankbang.com', color: '#e53935', logo: 'https://www.google.com/s2/favicons?domain=spankbang.com&sz=128' },
            { id: 'ep', name: 'Eporner', url: 'https://www.eporner.com', color: '#1e88e5', logo: 'https://www.google.com/s2/favicons?domain=eporner.com&sz=128' },
            { id: 'rd', name: 'Reddit', url: 'https://www.reddit.com', color: '#ff4500', logo: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=128' },
            { id: 'rg', name: 'RedGifs', url: 'https://www.redgifs.com', color: '#ff0044', logo: 'https://www.google.com/s2/favicons?domain=redgifs.com&sz=128' },
            { id: 'r34', name: 'Rule34Video', url: 'https://rule34video.com', color: '#aad450', logo: 'https://www.google.com/s2/favicons?domain=rule34video.com&sz=128' },
            { id: 'sfm', name: 'SFM Compile', url: 'https://sfmcompile.club', color: '#9c27b0', logo: 'https://www.google.com/s2/favicons?domain=sfmcompile.club&sz=128' },
        ];
    }

    init() {
        // Save default sites if none exist
        if (!localStorage.getItem('gentlemensclub_sites')) {
            this.saveSites();
        }
        
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        
        this.bindEvents();
        this.handleUrlParams();
        this.render();
    }
    
    // Theme Toggle
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('gentlemensclub_theme', this.currentTheme);
        this.applyTheme(this.currentTheme);
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.src = theme === 'dark' ? 'dark mode.gif' : 'light mode.gif';
        }
    }
    
    // Sidebar Toggle
    toggleSidebar() {
        const sidenav = document.getElementById('sideNav');
        const overlay = document.getElementById('sideNavOverlay');
        if (sidenav && overlay) {
            sidenav.classList.toggle('open');
            overlay.classList.toggle('open');
            document.body.style.overflow = sidenav.classList.contains('open') ? 'hidden' : '';
        }
    }
    
    openSidebar() {
        const sidenav = document.getElementById('sideNav');
        const overlay = document.getElementById('sideNavOverlay');
        if (sidenav && overlay) {
            sidenav.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeSidebar() {
        const sidenav = document.getElementById('sideNav');
        const overlay = document.getElementById('sideNavOverlay');
        if (sidenav && overlay) {
            sidenav.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
    
    // Widget System
    saveWidgets() {
        localStorage.setItem('gentlemensclub_widgets', JSON.stringify(this.widgets));
    }
    
    toggleEditMode() {
        this.editMode = !this.editMode;
        const btn = document.querySelector('.customize-btn');
        const icon = document.getElementById('editModeIcon');
        const text = document.getElementById('editModeText');
        const addArea = document.getElementById('addWidgetArea');
        
        btn.classList.toggle('active', this.editMode);
        icon.textContent = this.editMode ? '✓' : '✏️';
        text.textContent = this.editMode ? 'Done' : 'Customize';
        addArea.classList.toggle('visible', this.editMode);
        
        document.querySelectorAll('.widget').forEach(w => {
            w.classList.toggle('editing', this.editMode);
        });
    }
    
    openWidgetPicker() {
        document.getElementById('widgetPickerModal').classList.add('active');
    }
    
    addWidget(type) {
        const widget = {
            id: 'w' + Date.now(),
            type: type
        };
        this.widgets.push(widget);
        this.saveWidgets();
        this.renderWidgets();
        this.closeModals();
    }
    
    removeWidget(widgetId) {
        this.widgets = this.widgets.filter(w => w.id !== widgetId);
        this.saveWidgets();
        this.renderWidgets();
    }
    
    moveWidgetUp(widgetId) {
        const index = this.widgets.findIndex(w => w.id === widgetId);
        if (index > 0) {
            [this.widgets[index], this.widgets[index - 1]] = [this.widgets[index - 1], this.widgets[index]];
            this.saveWidgets();
            this.renderWidgets();
        }
    }
    
    moveWidgetDown(widgetId) {
        const index = this.widgets.findIndex(w => w.id === widgetId);
        if (index < this.widgets.length - 1) {
            [this.widgets[index], this.widgets[index + 1]] = [this.widgets[index + 1], this.widgets[index]];
            this.saveWidgets();
            this.renderWidgets();
        }
    }
    
    renderWidgets() {
        const container = document.getElementById('widgetsContainer');
        if (!container) return;
        
        // Update greeting based on time
        const hour = new Date().getHours();
        let greeting = 'Good evening';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        document.getElementById('homeGreeting').textContent = greeting;
        
        if (this.widgets.length === 0) {
            container.innerHTML = `
                <div class="widget-empty" style="padding: 80px 20px;">
                    <div class="icon">🏠</div>
                    <p>Your dashboard is empty. Click "Customize" to add widgets!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.widgets.map(widget => this.renderWidget(widget)).join('');
        
        // Apply edit mode state
        if (this.editMode) {
            document.querySelectorAll('.widget').forEach(w => {
                w.classList.add('editing');
            });
        }
    }
    
    renderWidget(widget) {
        const widgetTypes = {
            stats: { icon: '📊', title: 'Stats', render: () => this.renderStatsWidget() },
            recentVideos: { icon: '🎬', title: 'Recent Videos', render: () => this.renderRecentVideosWidget() },
            favorites: { icon: '❤️', title: 'Favorites', render: () => this.renderFavoritesWidget() },
            watchLater: { icon: '⏱️', title: 'Watch Later', render: () => this.renderWatchLaterWidget() },
            quickLinks: { icon: '🔗', title: 'Quick Links', render: () => this.renderQuickLinksWidget() },
            creators: { icon: '⭐', title: 'Creators', render: () => this.renderCreatorsWidget() },
            playlists: { icon: '📁', title: 'Playlists', render: () => this.renderPlaylistsWidget() },
            randomVideo: { icon: '🎲', title: 'Random Video', render: () => this.renderRandomVideoWidget() },
            allVideos: { icon: '🔥', title: 'All Videos', render: () => this.renderAllVideosWidget() }
        };
        
        const wType = widgetTypes[widget.type];
        if (!wType) return '';
        
        return `
            <div class="widget" data-widget-id="${widget.id}">
                <div class="widget-header">
                    <div class="widget-title">
                        <span class="icon">${wType.icon}</span>
                        ${wType.title}
                    </div>
                    <div class="widget-actions">
                        <button class="widget-action-btn" onclick="app.moveWidgetUp('${widget.id}')" title="Move Up">↑</button>
                        <button class="widget-action-btn" onclick="app.moveWidgetDown('${widget.id}')" title="Move Down">↓</button>
                        <button class="widget-action-btn delete" onclick="app.removeWidget('${widget.id}')" title="Remove">🗑️</button>
                    </div>
                </div>
                <div class="widget-content">
                    ${wType.render()}
                </div>
            </div>
        `;
    }
    
    renderStatsWidget() {
        const playlists = user.getAllPlaylists();
        const favorites = user.getFavorites();
        const creators = user.getSubscriptions();
        const history = user.getHistory();
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="value">${this.videos.length}</span>
                    <span class="label">Videos</span>
                </div>
                <div class="stat-card">
                    <span class="value">${favorites.length}</span>
                    <span class="label">Favorites</span>
                </div>
                <div class="stat-card">
                    <span class="value">${playlists.length}</span>
                    <span class="label">Playlists</span>
                </div>
                <div class="stat-card">
                    <span class="value">${creators.length}</span>
                    <span class="label">Creators</span>
                </div>
                <div class="stat-card">
                    <span class="value">${this.sites.length}</span>
                    <span class="label">Sites</span>
                </div>
                <div class="stat-card">
                    <span class="value">${history.length}</span>
                    <span class="label">Watched</span>
                </div>
            </div>
        `;
    }
    
    renderRecentVideosWidget() {
        const recentVideos = this.videos.slice(0, 6);
        if (recentVideos.length === 0) {
            return `<div class="widget-empty"><div class="icon">🎬</div><p>No videos yet</p></div>`;
        }
        return `<div class="widget-video-grid">${recentVideos.map(v => this.renderWidgetVideoCard(v)).join('')}</div>`;
    }
    
    renderFavoritesWidget() {
        const favIds = user.getFavorites().slice(0, 6);
        const favVideos = favIds.map(id => this.videos.find(v => v.id === id)).filter(Boolean);
        if (favVideos.length === 0) {
            return `<div class="widget-empty"><div class="icon">❤️</div><p>No favorites yet</p></div>`;
        }
        return `<div class="widget-video-grid">${favVideos.map(v => this.renderWidgetVideoCard(v)).join('')}</div>`;
    }
    
    renderWatchLaterWidget() {
        const wlIds = user.getWatchLater().slice(0, 6);
        const wlVideos = wlIds.map(id => this.videos.find(v => v.id === id)).filter(Boolean);
        if (wlVideos.length === 0) {
            return `<div class="widget-empty"><div class="icon">⏱️</div><p>No videos in watch later</p></div>`;
        }
        return `<div class="widget-video-grid">${wlVideos.map(v => this.renderWidgetVideoCard(v)).join('')}</div>`;
    }
    
    renderQuickLinksWidget() {
        if (this.sites.length === 0) {
            return `<div class="widget-empty"><div class="icon">🔗</div><p>No sites added</p></div>`;
        }
        return `
            <div class="quick-links-grid">
                ${this.sites.slice(0, 12).map(site => `
                    <a href="${this.escapeHtml(site.url)}" target="_blank" class="quick-link-item">
                        <div class="quick-link-icon" style="background: ${site.color}">
                            ${site.logo 
                                ? `<img src="${this.escapeHtml(site.logo)}" alt="" style="width:100%;height:100%;object-fit:contain;border-radius:6px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"><span style="display:none">${site.name.charAt(0).toUpperCase()}</span>`
                                : site.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="quick-link-name">${this.escapeHtml(site.name)}</span>
                    </a>
                `).join('')}
            </div>
        `;
    }
    
    renderCreatorsWidget() {
        const creators = user.getSubscriptions().slice(0, 8);
        if (creators.length === 0) {
            return `<div class="widget-empty"><div class="icon">⭐</div><p>No creators saved</p></div>`;
        }
        return `
            <div class="creators-widget-grid">
                ${creators.map(c => `
                    <div class="creator-widget-item" onclick="app.searchChannelVideos('${this.escapeHtml(c.name)}')">
                        <div class="creator-widget-avatar">
                            ${c.avatarUrl 
                                ? `<img src="${this.escapeHtml(c.avatarUrl)}" alt="" onerror="this.outerHTML='${c.name.charAt(0).toUpperCase()}'">` 
                                : c.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="creator-widget-name">${this.escapeHtml(c.name)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderPlaylistsWidget() {
        const playlists = user.getAllPlaylists().slice(0, 4);
        if (playlists.length === 0) {
            return `<div class="widget-empty"><div class="icon">📁</div><p>No playlists yet</p></div>`;
        }
        return `<div class="playlists-widget-grid">${playlists.map(p => this.renderPlaylistCard(p)).join('')}</div>`;
    }
    
    renderRandomVideoWidget() {
        if (this.videos.length === 0) {
            return `<div class="widget-empty"><div class="icon">🎲</div><p>Add videos to get random suggestions</p></div>`;
        }
        const randomVideo = this.videos[Math.floor(Math.random() * this.videos.length)];
        return `
            <div class="random-video-widget">
                <div class="random-video-thumb" onclick="app.openVideo('${randomVideo.id}')">
                    ${randomVideo.thumbnail 
                        ? `<img src="${this.escapeHtml(randomVideo.thumbnail)}" alt="">` 
                        : '<div class="placeholder">▶</div>'}
                </div>
                <div class="random-video-info">
                    <div class="random-video-title" onclick="app.openVideo('${randomVideo.id}')">${this.escapeHtml(randomVideo.title)}</div>
                    <div class="random-video-meta">${randomVideo.channel ? this.escapeHtml(randomVideo.channel) : 'Unknown'} ${randomVideo.duration ? '• ' + randomVideo.duration : ''}</div>
                    <div class="random-video-actions">
                        <button class="shuffle-btn" onclick="app.renderWidgets()">🎲 Shuffle</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAllVideosWidget() {
        if (this.videos.length === 0) {
            return `<div class="widget-empty"><div class="icon">🔥</div><p>No videos yet</p></div>`;
        }
        return `<div class="widget-video-grid">${this.videos.map(v => this.renderWidgetVideoCard(v)).join('')}</div>`;
    }
    
    renderWidgetVideoCard(video) {
        return `
            <div class="video-card" data-id="${video.id}" onclick="app.openVideo('${video.id}')" oncontextmenu="app.showContextMenu(event, 'video', '${video.id}')">
                <div class="card-actions">
                    <button class="card-action-btn edit" onclick="event.preventDefault(); event.stopPropagation(); app.editItem('video', '${video.id}')" title="Edit">✏️</button>
                    <button class="card-action-btn delete" onclick="event.preventDefault(); event.stopPropagation(); app.deleteItem('video', '${video.id}')" title="Delete">🗑️</button>
                </div>
                <div class="video-thumb">
                    ${video.thumbnail
                        ? `<img src="${this.escapeHtml(video.thumbnail)}" alt="" loading="lazy">`
                        : '<span class="placeholder">▶</span>'}
                    ${video.duration ? `<span class="video-duration">${this.escapeHtml(video.duration)}</span>` : ''}
                </div>
                <div class="video-info">
                    <div class="video-title">${this.escapeHtml(video.title)}</div>
                    ${video.channel ? `<div class="video-channel"><span class="video-channel-name">${this.escapeHtml(video.channel)}</span></div>` : ''}
                </div>
            </div>
        `;
    }

    handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash.replace('#', '');

        // Handle hash-based tab navigation
        const validTabs = ['videos', 'search', 'create', 'favorites', 'subscriptions', 'playlists', 'watchlater', 'history', 'sites'];
        if (hash && validTabs.includes(hash)) {
            this.switchTab(hash);
        }

        const tag = params.get('tag');
        if (tag) {
            this.activeTag = tag;
        }

        const search = params.get('search');
        if (search) {
            this.switchTab('search');
            document.getElementById('searchSite').value = 'local';
            document.getElementById('globalSearch').value = search;
            setTimeout(() => this.searchLocal(search), 100);
        }

        const playlist = params.get('playlist');
        if (playlist) {
            this.viewPlaylist(playlist);
        }
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Long press duration (ms)
        this.longPressDuration = 500;


        // Modal close buttons
        document.querySelectorAll('.close-btn, .btn-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Form submissions
        document.getElementById('siteForm').addEventListener('submit', (e) => this.handleSiteSubmit(e));
        document.getElementById('videoForm').addEventListener('submit', (e) => this.handleVideoSubmit(e));
        document.getElementById('playlistForm').addEventListener('submit', (e) => this.handlePlaylistSubmit(e));
        document.getElementById('creatorForm').addEventListener('submit', (e) => this.handleCreatorSubmit(e));

        // Video URL paste/change - auto fetch
        document.getElementById('videoUrl').addEventListener('paste', (e) => {
            setTimeout(() => this.fetchVideoMetadata(), 100);
        });

        // Thumbnail preview on change
        document.getElementById('videoThumb').addEventListener('input', (e) => {
            this.updateThumbnailPreview(e.target.value);
        });
        
        // Creator avatar preview
        document.getElementById('creatorAvatar').addEventListener('input', (e) => {
            this.updateCreatorAvatarPreview(e.target.value);
        });
        
        // Site logo preview
        document.getElementById('siteLogo').addEventListener('input', (e) => {
            this.updateSiteLogoPreview(e.target.value);
        });

        // Global search - live search for local only
        const globalSearchInput = document.getElementById('globalSearch');
        if (globalSearchInput) {
            globalSearchInput.addEventListener('input', (e) => {
                if (document.getElementById('searchSite').value === 'local' && e.target.value.length >= 2) {
                    this.searchLocal(e.target.value);
                }
            });
        }
        
        if (globalSearchInput) {
            globalSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeSearch();
                }
            });
        }
        
        // Update placeholder when site changes
        const searchSiteSelect = document.getElementById('searchSite');
        if (searchSiteSelect) {
            searchSiteSelect.addEventListener('change', (e) => {
                const site = e.target.value;
                const input = document.getElementById('globalSearch');
                if (site === 'local') {
                    input.placeholder = 'Search your library...';
                } else {
                    const siteName = e.target.options[e.target.selectedIndex].text;
                    input.placeholder = `Search ${siteName}...`;
                }
            });
        }

        // Context menu actions
        document.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleContextAction(e.target.closest('.context-item').dataset.action));
        });

        // Close context menu on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.closeContextMenu();
            }
        });

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModals();
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
                this.closeContextMenu();
            }
        });
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(tab).classList.add('active');
        
        // Render tab content
        this.renderCurrentTab();
    }

    renderCurrentTab() {
        switch(this.currentTab) {
            case 'videos':
                this.renderWidgets();
                break;
            case 'search':
                // Search tab - focus the input
                setTimeout(() => {
                    const input = document.getElementById('globalSearch');
                    if (input) input.focus();
                }, 100);
                break;
            case 'create':
                // Create section is static HTML
                break;
            case 'favorites':
                this.renderFavorites();
                break;
            case 'subscriptions':
                this.renderSubscriptions();
                break;
            case 'playlists':
                this.renderPlaylists();
                break;
            case 'watchlater':
                this.renderWatchLater();
                break;
            case 'history':
                this.renderHistory();
                break;
            case 'sites':
                this.renderSites();
                break;
        }
    }

    openVideo(id) {
        user.addToHistory(id);
        window.location.href = `player.html?v=${id}`;
    }

    // Favorites
    toggleFavorite(videoId, e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const isFav = user.toggleFavorite(videoId);
        this.renderCurrentTab();
        return isFav;
    }

    // Watch Later
    toggleWatchLater(videoId, e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        user.toggleWatchLater(videoId);
        this.renderCurrentTab();
    }

    // History
    clearHistory() {
        if (confirm('Clear all watch history?')) {
            user.clearHistory();
            this.renderHistory();
        }
    }
    
    // Clear Watch Later
    clearWatchLater() {
        if (confirm('Clear all Watch Later items?')) {
            user.clearWatchLater();
            this.renderWatchLater();
        }
    }
    
    // Clear Favorites
    clearFavorites() {
        if (confirm('Clear all favorites?')) {
            user.clearFavorites();
            this.renderFavorites();
        }
    }
    
    // Clear Playlists
    clearPlaylists() {
        if (confirm('Delete all playlists? This cannot be undone.')) {
            user.clearPlaylists();
            this.renderPlaylists();
        }
    }

    // Playlists
    viewPlaylist(playlistId) {
        this.currentPlaylistId = playlistId;
        const playlist = user.getPlaylist(playlistId);
        
        if (!playlist) {
            alert('Playlist not found');
            return;
        }
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById('playlistView').classList.add('active');
        
        document.getElementById('playlistViewTitle').textContent = playlist.name;
        document.getElementById('playlistViewDesc').textContent = playlist.description || '';
        
        this.renderPlaylistVideos(playlist);
    }

    renderPlaylistVideos(playlist) {
        const grid = document.getElementById('playlistVideosGrid');
        const videoIds = playlist.videos;
        
        if (videoIds.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="icon">📁</div>
                    <p>This playlist is empty</p>
                </div>
            `;
            return;
        }
        
        const videos = videoIds.map(id => this.videos.find(v => v.id === id)).filter(Boolean);
        grid.innerHTML = videos.map(video => this.renderVideoCard(video, true)).join('');
    }

    editCurrentPlaylist() {
        const playlist = user.getPlaylist(this.currentPlaylistId);
        if (playlist) {
            this.editingPlaylist = playlist;
            document.getElementById('playlistModalTitle').textContent = 'Edit Playlist';
            document.getElementById('playlistName').value = playlist.name;
            document.getElementById('playlistDesc').value = playlist.description || '';
            this.openModal('playlist');
        }
    }

    deleteCurrentPlaylist() {
        if (confirm('Delete this playlist?')) {
            user.deletePlaylist(this.currentPlaylistId);
            this.switchTab('playlists');
        }
    }

    openAddToPlaylistModal(videoId) {
        this.addToPlaylistVideoId = videoId;
        this.renderPlaylistSelector();
        document.getElementById('addToPlaylistModal').classList.add('active');
    }

    renderPlaylistSelector() {
        const container = document.getElementById('playlistSelector');
        const playlists = user.getAllPlaylists();
        const videoId = this.addToPlaylistVideoId;
        
        if (playlists.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No playlists yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = playlists.map(playlist => {
            const isInPlaylist = user.isInPlaylist(playlist.id, videoId);
            return `
                <div class="playlist-selector-item ${isInPlaylist ? 'selected' : ''}" 
                     onclick="app.togglePlaylistSelection('${playlist.id}')">
                    <div class="playlist-selector-check">${isInPlaylist ? '✓' : ''}</div>
                    <div class="playlist-selector-info">
                        <div class="playlist-selector-name">${this.escapeHtml(playlist.name)}</div>
                        <div class="playlist-selector-count">${playlist.videos.length} videos</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    togglePlaylistSelection(playlistId) {
        const videoId = this.addToPlaylistVideoId;
        if (user.isInPlaylist(playlistId, videoId)) {
            user.removeFromPlaylist(playlistId, videoId);
        } else {
            user.addToPlaylist(playlistId, videoId);
        }
        this.renderPlaylistSelector();
    }

    createPlaylistAndAdd() {
        const name = prompt('Playlist name:');
        if (name && name.trim()) {
            const playlist = user.createPlaylist(name.trim());
            if (this.addToPlaylistVideoId) {
                user.addToPlaylist(playlist.id, this.addToPlaylistVideoId);
            }
            this.renderPlaylistSelector();
        }
    }

    async fetchVideoMetadata() {
        const urlInput = document.getElementById('videoUrl');
        const fetchBtn = document.getElementById('fetchBtn');
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Please enter a URL first');
            return;
        }
        
        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            alert('Invalid URL');
            return;
        }
        
        // Show loading state
        fetchBtn.classList.add('loading');
        fetchBtn.disabled = true;
        
        try {
            const metadata = await metadataFetcher.fetchMetadata(url);
            
            // Fill in the form fields
            if (metadata.title && !document.getElementById('videoTitle').value) {
                document.getElementById('videoTitle').value = metadata.title;
            }
            if (metadata.thumbnail && !document.getElementById('videoThumb').value) {
                document.getElementById('videoThumb').value = metadata.thumbnail;
                this.updateThumbnailPreview(metadata.thumbnail);
            }
            if (metadata.duration && !document.getElementById('videoDuration').value) {
                document.getElementById('videoDuration').value = metadata.duration;
            }
            if (metadata.channel && !document.getElementById('videoChannel').value) {
                document.getElementById('videoChannel').value = metadata.channel;
            }
            
            // If no title found, try to extract from URL
            if (!document.getElementById('videoTitle').value) {
                const titleFromUrl = metadataFetcher.extractTitleFromUrl(url);
                if (titleFromUrl) {
                    document.getElementById('videoTitle').value = titleFromUrl;
                }
            }
            
            // If no channel found, use site name as fallback
            if (!document.getElementById('videoChannel').value) {
                const siteName = metadataFetcher.getSiteName(url);
                if (siteName && siteName !== 'Unknown') {
                    document.getElementById('videoChannel').value = siteName;
                }
            }
            
        } catch (e) {
            console.error('Error fetching metadata:', e);
        } finally {
            fetchBtn.classList.remove('loading');
            fetchBtn.disabled = false;
        }
    }

    updateThumbnailPreview(url) {
        const preview = document.getElementById('thumbPreview');
        
        if (!url) {
            preview.classList.remove('has-image');
            preview.innerHTML = '';
            return;
        }
        
        preview.classList.add('has-image');
        preview.innerHTML = `<img src="${this.escapeHtml(url)}" alt="Preview" onerror="this.parentElement.innerHTML='<span class=\\'placeholder\\'>❌ Invalid</span>'">`;
    }
    
    updateSiteLogoPreview(url) {
        const preview = document.getElementById('siteLogoPreview');
        if (!preview) return;
        
        if (!url) {
            preview.classList.remove('has-image');
            preview.innerHTML = '';
            return;
        }
        
        preview.classList.add('has-image');
        preview.innerHTML = `<img src="${this.escapeHtml(url)}" alt="Logo" onerror="this.parentElement.classList.remove('has-image'); this.parentElement.innerHTML='';">`;
    }
    
    setupLongPress(element, type, id) {
        let pressTimer = null;
        let isLongPress = false;
        
        const startPress = (e) => {
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                element.classList.add('long-press-active');
                navigator.vibrate && navigator.vibrate(50);
                this.editItem(type, id);
            }, this.longPressDuration);
        };
        
        const endPress = (e) => {
            clearTimeout(pressTimer);
            element.classList.remove('long-press-active');
            if (isLongPress) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        const cancelPress = () => {
            clearTimeout(pressTimer);
            element.classList.remove('long-press-active');
        };
        
        // Mouse events
        element.addEventListener('mousedown', startPress);
        element.addEventListener('mouseup', endPress);
        element.addEventListener('mouseleave', cancelPress);
        
        // Touch events
        element.addEventListener('touchstart', startPress, { passive: true });
        element.addEventListener('touchend', endPress);
        element.addEventListener('touchcancel', cancelPress);
        element.addEventListener('touchmove', cancelPress, { passive: true });
        
        // Prevent click if long press
        element.addEventListener('click', (e) => {
            if (isLongPress) {
                e.preventDefault();
                e.stopPropagation();
                isLongPress = false;
            }
        }, true);
    }
    
    bindLongPressToItems() {
        // Sites
        document.querySelectorAll('.site-card[data-id]').forEach(card => {
            if (!card.dataset.longPressBound) {
                this.setupLongPress(card, 'site', card.dataset.id);
                card.dataset.longPressBound = 'true';
            }
        });
        
        // Videos
        document.querySelectorAll('.video-card[data-id]').forEach(card => {
            if (!card.dataset.longPressBound) {
                this.setupLongPress(card, 'video', card.dataset.id);
                card.dataset.longPressBound = 'true';
            }
        });
        
        // Playlists
        document.querySelectorAll('.playlist-card[data-id]').forEach(card => {
            if (!card.dataset.longPressBound) {
                this.setupLongPress(card, 'playlist', card.dataset.id);
                card.dataset.longPressBound = 'true';
            }
        });
        
        // Creators (subscription cards)
        document.querySelectorAll('.subscription-card[data-id]').forEach(card => {
            if (!card.dataset.longPressBound) {
                this.setupLongPress(card, 'creator', card.dataset.id);
                card.dataset.longPressBound = 'true';
            }
        });
    }
    
    async fetchSiteInfo() {
        const urlInput = document.getElementById('siteUrl');
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('Please enter a URL first');
            return;
        }
        
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.replace('www.', '');
            
            // Auto-fill name from hostname
            const nameInput = document.getElementById('siteName');
            if (!nameInput.value) {
                const siteName = hostname.split('.')[0];
                nameInput.value = siteName.charAt(0).toUpperCase() + siteName.slice(1);
            }
            
            // Try multiple favicon sources
            const faviconUrls = [
                `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
                `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
                `${urlObj.origin}/favicon.ico`,
                `${urlObj.origin}/favicon.png`,
                `https://favicon.twenty.com/${hostname}`
            ];
            
            const logoInput = document.getElementById('siteLogo');
            
            // Use Google's favicon service as it's most reliable
            logoInput.value = faviconUrls[0];
            this.updateSiteLogoPreview(faviconUrls[0]);
            
        } catch (e) {
            console.error('Error fetching site info:', e);
            alert('Invalid URL');
        }
    }

    openModal(type) {
        if (type === 'playlist') {
            if (!this.editingPlaylist) {
                document.getElementById('playlistModalTitle').textContent = 'Create Playlist';
                document.getElementById('playlistForm').reset();
            }
        }
        
        if (type === 'creator') {
            if (!this.editingCreator) {
                document.getElementById('creatorModalTitle').textContent = 'Add Creator';
                document.getElementById('creatorForm').reset();
                document.getElementById('creatorId').value = '';
                document.getElementById('creatorAvatarPreview').innerHTML = '';
                document.getElementById('creatorAvatarPreview').classList.remove('has-image');
            }
        }
        
        const modal = document.getElementById(`${type}Modal`);
        modal.classList.add('active');
        
        if (type === 'site') {
            document.getElementById('siteName').focus();
        } else if (type === 'video') {
            document.getElementById('videoTitle').focus();
        } else if (type === 'playlist') {
            document.getElementById('playlistName').focus();
        } else if (type === 'creator') {
            document.getElementById('creatorName').focus();
        } else if (type === 'settings') {
            this.updateSettingsStats();
        }
    }
    
    updateSettingsStats() {
        const stats = document.getElementById('settingsStats');
        const playlists = user.getAllPlaylists();
        const favorites = user.getFavorites();
        const creators = user.getSubscriptions();
        const history = user.getHistory();
        const watchLater = user.getWatchLater();
        
        stats.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${this.sites.length}</span>
                <span class="stat-label">Sites</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${this.videos.length}</span>
                <span class="stat-label">Videos</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${favorites.length}</span>
                <span class="stat-label">Favorites</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${playlists.length}</span>
                <span class="stat-label">Playlists</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${creators.length}</span>
                <span class="stat-label">Creators</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${history.length}</span>
                <span class="stat-label">History</span>
            </div>
        `;
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });

        document.getElementById('siteForm').reset();
        document.getElementById('videoForm').reset();
        document.getElementById('playlistForm').reset();
        document.getElementById('creatorForm').reset();
        document.getElementById('siteColor').value = '#D99BA1';
        this.editingCreator = null;

        // Clear thumbnail preview
        const thumbPreview = document.getElementById('thumbPreview');
        if (thumbPreview) {
            thumbPreview.classList.remove('has-image');
            thumbPreview.innerHTML = '';
        }

        // Clear site logo preview
        const logoPreview = document.getElementById('siteLogoPreview');
        if (logoPreview) {
            logoPreview.classList.remove('has-image');
            logoPreview.innerHTML = '';
        }
        
        // Clear creator avatar preview
        const avatarPreview = document.getElementById('creatorAvatarPreview');
        if (avatarPreview) {
            avatarPreview.classList.remove('has-image');
            avatarPreview.innerHTML = '';
        }
        
        // Reset modal titles
        document.getElementById('playlistModalTitle').textContent = 'Create Playlist';
        document.getElementById('creatorModalTitle').textContent = 'Add Creator';

        this.editingItem = null;
        this.editingPlaylist = null;
        this.addToPlaylistVideoId = null;
    }

    closeContextMenu() {
        document.getElementById('contextMenu').classList.remove('active');
        this.contextTarget = null;
    }

    showContextMenu(e, type, id) {
        e.preventDefault();
        e.stopPropagation();

        const menu = document.getElementById('contextMenu');
        this.contextTarget = { type, id };

        // Show/hide video-only items
        const videoOnlyItems = menu.querySelectorAll('.video-only');
        videoOnlyItems.forEach(item => {
            item.style.display = type === 'video' ? '' : 'none';
        });

        // Update context menu text based on current state
        if (type === 'video') {
            const favText = menu.querySelector('.fav-text');
            const wlText = menu.querySelector('.wl-text');
            favText.textContent = user.isFavorite(id) ? 'Remove from Favorites' : 'Add to Favorites';
            wlText.textContent = user.isInWatchLater(id) ? 'Remove from Watch Later' : 'Add to Watch Later';
        }

        const x = Math.min(e.clientX, window.innerWidth - 200);
        const y = Math.min(e.clientY, window.innerHeight - 200);
        
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.classList.add('active');
    }

    handleContextAction(action) {
        if (!this.contextTarget) return;
        
        const { type, id } = this.contextTarget;
        
        switch(action) {
            case 'favorite':
                this.toggleFavorite(id);
                break;
            case 'watchlater':
                this.toggleWatchLater(id);
                break;
            case 'addtoplaylist':
                this.openAddToPlaylistModal(id);
                break;
            case 'edit':
                this.editItem(type, id);
                break;
            case 'delete':
                this.deleteItem(type, id);
                break;
        }
        
        this.closeContextMenu();
    }

    editItem(type, id) {
        if (type === 'site') {
            const site = this.sites.find(s => s.id === id);
            if (site) {
                this.editingItem = { type, id };
                document.getElementById('siteName').value = site.name;
                document.getElementById('siteUrl').value = site.url;
                document.getElementById('siteLogo').value = site.logo || '';
                document.getElementById('siteColor').value = site.color || '#D99BA1';
                this.updateSiteLogoPreview(site.logo || '');
                this.openModal('site');
            }
        } else if (type === 'playlist') {
            const playlist = user.getPlaylist(id);
            if (playlist) {
                this.editingPlaylist = playlist;
                document.getElementById('playlistModalTitle').textContent = 'Edit Playlist';
                document.getElementById('playlistName').value = playlist.name;
                document.getElementById('playlistDesc').value = playlist.description || '';
                this.openModal('playlist');
            }
        } else if (type === 'creator') {
            const creator = user.getCreator(id);
            if (creator) {
                this.editingCreator = creator;
                document.getElementById('creatorModalTitle').textContent = 'Edit Creator';
                document.getElementById('creatorId').value = creator.id;
                document.getElementById('creatorName').value = creator.name || '';
                document.getElementById('creatorType').value = creator.type || 'pornstar';
                document.getElementById('creatorSite').value = creator.site || '';
                document.getElementById('creatorUrl').value = creator.profileUrl || '';
                document.getElementById('creatorAvatar').value = creator.avatarUrl || '';
                document.getElementById('creatorNotes').value = creator.notes || '';
                this.updateCreatorAvatarPreview(creator.avatarUrl || '');
                this.openModal('creator');
            }
        } else if (type === 'video') {
            const video = this.videos.find(v => v.id === id);
            if (video) {
                this.editingItem = { type, id };
                document.getElementById('videoTitle').value = video.title;
                document.getElementById('videoUrl').value = video.url;
                document.getElementById('videoThumb').value = video.thumbnail || '';
                document.getElementById('videoDuration').value = video.duration || '';
                document.getElementById('videoChannel').value = video.channel || '';
                document.getElementById('videoTags').value = video.tags.join(', ');

                // Show thumbnail preview
                if (video.thumbnail) {
                    this.updateThumbnailPreview(video.thumbnail);
                }

                this.openModal('video');
            }
        }
    }

    deleteItem(type, id) {
        if (!confirm('Are you sure you want to delete this?')) return;
        
        if (type === 'site') {
            this.sites = this.sites.filter(s => s.id !== id);
            this.saveSites();
            this.renderSites();
        } else if (type === 'playlist') {
            user.deletePlaylist(id);
            this.renderPlaylists();
        } else {
            this.videos = this.videos.filter(v => v.id !== id);
            this.saveVideos();
            this.render();
        }
    }

    handleSiteSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('siteName').value.trim();
        const url = document.getElementById('siteUrl').value.trim();
        const logo = document.getElementById('siteLogo').value.trim();
        const color = document.getElementById('siteColor').value;
        
        if (this.editingItem && this.editingItem.type === 'site') {
            const index = this.sites.findIndex(s => s.id === this.editingItem.id);
            if (index !== -1) {
                this.sites[index] = { ...this.sites[index], name, url, logo, color };
            }
        } else {
            this.sites.push({
                id: Date.now().toString(),
                name,
                url,
                logo,
                color
            });
        }
        
        this.saveSites();
        this.closeModals();
        this.render();
    }

    handleVideoSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('videoTitle').value.trim();
        const url = document.getElementById('videoUrl').value.trim();
        const thumbnail = document.getElementById('videoThumb').value.trim();
        const duration = document.getElementById('videoDuration').value.trim();
        const channel = document.getElementById('videoChannel').value.trim();
        const tagsInput = document.getElementById('videoTags').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
        
        if (this.editingItem && this.editingItem.type === 'video') {
            const index = this.videos.findIndex(v => v.id === this.editingItem.id);
            if (index !== -1) {
                this.videos[index] = { 
                    ...this.videos[index], 
                    title, url, thumbnail, duration, channel, tags 
                };
            }
        } else {
            this.videos.unshift({
                id: Date.now().toString(),
                title,
                url,
                thumbnail,
                duration,
                channel,
                tags,
                views: Math.floor(Math.random() * 500) + 1,
                rating: Math.floor(Math.random() * 30) + 70,
                likes: Math.floor(Math.random() * 300) + 50,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveVideos();
        this.closeModals();
        this.render();
    }

    handlePlaylistSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('playlistName').value.trim();
        const description = document.getElementById('playlistDesc').value.trim();
        
        if (this.editingPlaylist) {
            user.updatePlaylist(this.editingPlaylist.id, { name, description });
            if (this.currentPlaylistId === this.editingPlaylist.id) {
                document.getElementById('playlistViewTitle').textContent = name;
                document.getElementById('playlistViewDesc').textContent = description;
            }
        } else {
            user.createPlaylist(name, description);
        }
        
        this.closeModals();
        this.renderPlaylists();
    }
    
    handleCreatorSubmit(e) {
        e.preventDefault();
        
        const id = document.getElementById('creatorId').value;
        const creatorData = {
            name: document.getElementById('creatorName').value.trim(),
            type: document.getElementById('creatorType').value,
            site: document.getElementById('creatorSite').value.trim(),
            profileUrl: document.getElementById('creatorUrl').value.trim(),
            avatarUrl: document.getElementById('creatorAvatar').value.trim(),
            notes: document.getElementById('creatorNotes').value.trim()
        };
        
        if (id) {
            user.updateCreator(id, creatorData);
        } else {
            user.addCreator(creatorData);
        }
        
        this.closeModals();
        this.renderSubscriptions();
    }
    
    editCreator(id, e) {
        e.stopPropagation();
        const creator = user.getSubscriptionById(id);
        if (!creator) return;
        
        this.editingCreator = creator;
        document.getElementById('creatorModalTitle').textContent = 'Edit Creator';
        document.getElementById('creatorId').value = creator.id;
        document.getElementById('creatorName').value = creator.name || '';
        document.getElementById('creatorType').value = creator.type || 'creator';
        document.getElementById('creatorSite').value = creator.site || '';
        document.getElementById('creatorUrl').value = creator.profileUrl || '';
        document.getElementById('creatorAvatar').value = creator.avatarUrl || '';
        document.getElementById('creatorNotes').value = creator.notes || '';
        
        this.updateCreatorAvatarPreview(creator.avatarUrl || '');
        this.openModal('creator');
    }
    
    deleteCreator(id, name, e) {
        e.stopPropagation();
        if (confirm(`Remove "${name}" from saved creators?`)) {
            user.removeCreatorById(id);
            this.renderSubscriptions();
        }
    }
    
    openCreatorProfile(url, e) {
        e.stopPropagation();
        if (url) {
            window.open(url, '_blank');
        }
    }
    
    updateCreatorAvatarPreview(url) {
        const preview = document.getElementById('creatorAvatarPreview');
        if (!url) {
            preview.classList.remove('has-image');
            preview.innerHTML = '';
            return;
        }
        
        preview.classList.add('has-image');
        preview.innerHTML = `<img src="${this.escapeHtml(url)}" alt="Preview" onerror="this.parentElement.innerHTML='<span class=\\'placeholder\\'>❌ Invalid</span>'">`;
    }
    
    filterCreators(type) {
        this.currentCreatorFilter = type;
        
        // Update active button
        document.querySelectorAll('.creator-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === type);
        });
        
        // Filter cards
        const cards = document.querySelectorAll('#subscriptionsGrid .subscription-card');
        cards.forEach(card => {
            if (type === 'all') {
                card.style.display = '';
            } else {
                card.style.display = card.dataset.type === type ? '' : 'none';
            }
        });
    }

    handleSearch(query) {
        const q = query.toLowerCase();
        
        const grids = ['videosGrid', 'favoritesGrid', 'watchLaterGrid', 'historyGrid', 'playlistVideosGrid'];
        
        grids.forEach(gridId => {
            const grid = document.getElementById(gridId);
            if (grid) {
                const cards = grid.querySelectorAll('.video-card');
                cards.forEach(card => {
                    const title = card.dataset.title?.toLowerCase() || '';
                    const tags = card.dataset.tags?.toLowerCase() || '';
                    const channel = card.dataset.channel?.toLowerCase() || '';
                    const matches = title.includes(q) || tags.includes(q) || channel.includes(q);
                    card.style.display = matches ? '' : 'none';
                });
            }
        });
        
        const sitesGrid = document.getElementById('sitesGrid');
        if (sitesGrid) {
            const cards = sitesGrid.querySelectorAll('.site-card');
            cards.forEach(card => {
                const name = card.dataset.name?.toLowerCase() || '';
                card.style.display = name.includes(q) ? '' : 'none';
            });
        }
    }
    
    executeSearch() {
        const site = document.getElementById('searchSite').value;
        const query = document.getElementById('globalSearch').value.trim();

        if (!query) return;

        if (site === 'local') {
            this.searchLocal(query);
            return;
        }

        // Encode query - use + for spaces in query params, encode for URL paths
        const queryPlus = encodeURIComponent(query).replace(/%20/g, '+');
        const queryPath = encodeURIComponent(query).replace(/%20/g, '-').toLowerCase();

        const searchUrls = {
            youtube: `https://www.youtube.com/results?search_query=${queryPlus}`,
            pornhub: `https://www.pornhub.com/video/search?search=${queryPlus}`,
            xvideos: `https://www.xvideos.com/?k=${queryPlus}`,
            xnxx: `https://www.xnxx.com/search/${queryPath}`,
            xhamster: `https://xhamster.com/search/${queryPath}`,
            redtube: `https://www.redtube.com/?search=${queryPlus}`,
            youporn: `https://www.youporn.com/search/?query=${queryPlus}`,
            spankbang: `https://spankbang.com/s/${queryPath}/`,
            eporner: `https://www.eporner.com/search/${queryPath}/`,
            reddit: `https://www.reddit.com/search/?q=${queryPlus}&type=link`,
            redgifs: `https://www.redgifs.com/gifs/${queryPath}`,
            rule34video: `https://rule34video.com/search/${queryPath}/`,
            sfmcompile: `https://sfmcompile.club/?s=${queryPlus}`,
        };

        const siteNames = {
            youtube: 'YouTube',
            pornhub: 'PornHub',
            xvideos: 'XVideos',
            xnxx: 'XNXX',
            xhamster: 'xHamster',
            redtube: 'RedTube',
            youporn: 'YouPorn',
            spankbang: 'SpankBang',
            eporner: 'Eporner',
            reddit: 'Reddit',
            redgifs: 'RedGifs',
            rule34video: 'Rule34Video',
            sfmcompile: 'SFM Compile',
        };

        const url = searchUrls[site];
        if (url) {
            this.showExternalSearch(url, siteNames[site] || site, query);
        }
    }
    
    searchLocal(query) {
        const resultsContainer = document.getElementById('localSearchResults');
        const frameContainer = document.getElementById('searchFrameContainer');
        
        // Hide frame, show local results
        frameContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        const q = query.toLowerCase();
        const matchedVideos = this.videos.filter(v => 
            v.title.toLowerCase().includes(q) ||
            (v.channel && v.channel.toLowerCase().includes(q)) ||
            v.tags.some(t => t.toLowerCase().includes(q))
        );
        
        if (matchedVideos.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <div class="search-placeholder-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>No videos matching "${this.escapeHtml(query)}" in your library</p>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <div class="local-results-header">
                <h3>Search Results</h3>
                <p>${matchedVideos.length} video${matchedVideos.length !== 1 ? 's' : ''} found for "${this.escapeHtml(query)}"</p>
            </div>
            <div class="search-results-grid">
                ${matchedVideos.map(v => this.renderWidgetVideoCard(v)).join('')}
            </div>
        `;
        
        // Bind long press to new cards
        requestAnimationFrame(() => this.bindLongPressToItems());
    }
    
    showExternalSearch(url, siteName, query) {
        const resultsContainer = document.getElementById('localSearchResults');
        const webviewContainer = document.getElementById('webviewContainer');
        const webview = document.getElementById('searchWebview');
        const urlBar = document.getElementById('webviewUrl');
        
        // Store for later use
        this.currentSearchUrl = url;
        this.currentSearchSite = siteName;
        this.currentSearchQuery = query;
        
        // Hide local results, show webview
        resultsContainer.style.display = 'none';
        webviewContainer.style.display = 'flex';
        
        // Load the URL in webview
        webview.src = url;
        urlBar.textContent = url;
        
        // Listen for URL changes
        webview.addEventListener('did-navigate', (e) => {
            urlBar.textContent = e.url;
            this.currentSearchUrl = e.url;
        });
        
        webview.addEventListener('did-navigate-in-page', (e) => {
            if (e.isMainFrame) {
                urlBar.textContent = e.url;
                this.currentSearchUrl = e.url;
            }
        });
    }
    
    webviewGoBack() {
        const webview = document.getElementById('searchWebview');
        if (webview && webview.canGoBack()) {
            webview.goBack();
        }
    }
    
    webviewGoForward() {
        const webview = document.getElementById('searchWebview');
        if (webview && webview.canGoForward()) {
            webview.goForward();
        }
    }
    
    webviewReload() {
        const webview = document.getElementById('searchWebview');
        if (webview) {
            webview.reload();
        }
    }
    
    copyWebviewUrl() {
        if (this.currentSearchUrl) {
            navigator.clipboard.writeText(this.currentSearchUrl).then(() => {
                alert('URL copied to clipboard!');
            }).catch(() => {
                prompt('Copy this URL:', this.currentSearchUrl);
            });
        }
    }
    
    openWebviewExternal() {
        if (this.currentSearchUrl) {
            // Open in system default browser
            window.open(this.currentSearchUrl, '_blank');
        }
    }
    
    closeWebview() {
        const resultsContainer = document.getElementById('localSearchResults');
        const webviewContainer = document.getElementById('webviewContainer');
        const webview = document.getElementById('searchWebview');
        
        // Stop loading and clear
        if (webview) {
            webview.src = 'about:blank';
        }
        
        webviewContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        // Reset to placeholder
        resultsContainer.innerHTML = `
            <div class="search-placeholder">
                <div class="search-placeholder-icon">🔍</div>
                <h3>Search your library or the web</h3>
                <p>Select a site from the dropdown and enter your search query</p>
            </div>
        `;
    }
    
    openSearchInNewTab() {
        if (this.currentSearchUrl) {
            window.open(this.currentSearchUrl, '_blank');
        }
    }

    filterByTag(tag) {
        this.activeTag = this.activeTag === tag ? null : tag;
        this.renderVideos();
        this.renderTags();
    }

    saveSites() {
        localStorage.setItem('gentlemensclub_sites', JSON.stringify(this.sites));
    }

    saveVideos() {
        localStorage.setItem('gentlemensclub_videos', JSON.stringify(this.videos));
    }

    getAllTags() {
        const tagCounts = {};
        this.videos.forEach(video => {
            video.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([tag]) => tag);
    }

    render() {
        this.renderWidgets();
        this.renderSites();
        this.renderFavorites();
        this.renderSubscriptions();
        this.renderPlaylists();
        this.renderWatchLater();
        this.renderHistory();
        
        // Bind long press after DOM updates
        requestAnimationFrame(() => this.bindLongPressToItems());
    }

    renderTags() {
        const tagsBar = document.getElementById('tagsBar');
        const tags = this.getAllTags();
        
        if (tags.length === 0) {
            tagsBar.innerHTML = '';
            return;
        }
        
        tagsBar.innerHTML = tags.map(tag => `
            <span class="tag-pill ${this.activeTag === tag ? 'active' : ''}" 
                  onclick="app.filterByTag('${this.escapeHtml(tag)}')"
                  style="${this.activeTag === tag ? 'background: var(--accent); color: #000;' : ''}">
                ${this.escapeHtml(tag)}
            </span>
        `).join('');
    }

    renderSites() {
        const grid = document.getElementById('sitesGrid');

        if (this.sites.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="icon">🔗</div>
                    <p>No sites yet. Go to Create to add one.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.sites.map(site => `
            <a href="${this.escapeHtml(site.url)}"
               target="_blank"
               rel="noopener noreferrer"
               class="site-card"
               data-id="${site.id}"
               data-name="${this.escapeHtml(site.name)}"
               oncontextmenu="app.showContextMenu(event, 'site', '${site.id}')">
                <div class="card-actions">
                    <button class="card-action-btn edit" onclick="event.preventDefault(); event.stopPropagation(); app.editItem('site', '${site.id}')" title="Edit">✏️</button>
                    <button class="card-action-btn delete" onclick="event.preventDefault(); event.stopPropagation(); app.deleteItem('site', '${site.id}')" title="Delete">🗑️</button>
                </div>
                <div class="site-icon" style="background: ${site.color}">
                    ${site.logo
                        ? `<img src="${this.escapeHtml(site.logo)}" alt="${this.escapeHtml(site.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"><span style="display:none">${site.name.charAt(0).toUpperCase()}</span>`
                        : site.name.charAt(0).toUpperCase()}
                </div>
                <div class="site-name">${this.escapeHtml(site.name)}</div>
            </a>
        `).join('');
    }

    renderVideos() {
        const grid = document.getElementById('videosGrid');
        
        let filteredVideos = this.videos;
        if (this.activeTag) {
            filteredVideos = this.videos.filter(v => v.tags.includes(this.activeTag));
        }
        
        if (filteredVideos.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="icon">🎬</div>
                    <p>${this.activeTag ? 'No videos with this tag.' : 'No videos yet. Click "+ Add Video" to save your first one.'}</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = filteredVideos.map(video => this.renderVideoCard(video)).join('');
    }

    renderFavorites() {
        const grid = document.getElementById('favoritesGrid');
        const favoriteIds = user.getFavorites();
        
        if (favoriteIds.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="icon">❤️</div>
                    <p>No favorites yet. Right-click a video to add it to favorites.</p>
                </div>
            `;
            return;
        }
        
        const videos = favoriteIds.map(id => this.videos.find(v => v.id === id)).filter(Boolean);
        grid.innerHTML = videos.map(video => this.renderVideoCard(video)).join('');
    }

    renderWatchLater() {
        const grid = document.getElementById('watchLaterGrid');
        const watchLaterIds = user.getWatchLater();
        
        if (watchLaterIds.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="icon">⏱️</div>
                    <p>No videos in watch later. Right-click a video to add it.</p>
                </div>
            `;
            return;
        }
        
        const videos = watchLaterIds.map(id => this.videos.find(v => v.id === id)).filter(Boolean);
        grid.innerHTML = videos.map(video => this.renderVideoCard(video)).join('');
    }

    renderHistory() {
        const grid = document.getElementById('historyGrid');
        const historyIds = user.getHistory();
        
        if (historyIds.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="icon">📜</div>
                    <p>No watch history yet.</p>
                </div>
            `;
            return;
        }
        
        const videos = historyIds.map(id => this.videos.find(v => v.id === id)).filter(Boolean);
        grid.innerHTML = videos.map(video => this.renderVideoCard(video)).join('');
    }

    renderSubscriptions() {
        const grid = document.getElementById('subscriptionsGrid');
        const videosGrid = document.getElementById('subscriptionVideosGrid');
        const subscriptions = user.getSubscriptions();
        
        if (subscriptions.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="icon">⭐</div>
                    <p>No saved creators yet. Click "Add Creator" to save your favorite artists, models, and channels.</p>
                </div>
            `;
            videosGrid.innerHTML = '';
            return;
        }
        
        // Render enhanced creator cards
        grid.innerHTML = subscriptions.map(sub => {
            const type = sub.type || 'channel';
            const videoCount = this.videos.filter(v => 
                v.channel && v.channel.toLowerCase() === sub.name.toLowerCase()
            ).length;
            
            return `
                <div class="subscription-card" data-id="${sub.id}" data-type="${type}" onclick="app.searchChannelVideos('${this.escapeHtml(sub.name)}')">
                    <div class="card-actions">
                        <button class="card-action-btn edit" onclick="event.preventDefault(); event.stopPropagation(); app.editItem('creator', '${sub.id}')" title="Edit">✏️</button>
                        <button class="card-action-btn delete" onclick="event.preventDefault(); event.stopPropagation(); app.deleteCreator('${sub.id}', '${this.escapeHtml(sub.name)}', event)" title="Delete">🗑️</button>
                    </div>
                    <div class="subscription-avatar">
                        ${sub.avatarUrl 
                            ? `<img src="${this.escapeHtml(sub.avatarUrl)}" alt="${this.escapeHtml(sub.name)}" onerror="this.outerHTML='${sub.name.charAt(0).toUpperCase()}'">` 
                            : sub.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="subscription-info">
                        <div class="subscription-name">${this.escapeHtml(sub.name)}</div>
                        <div class="subscription-meta">
                            <span class="subscription-type ${type}">${type}</span>
                            ${sub.site ? `<span class="subscription-site">${this.escapeHtml(sub.site)}</span>` : ''}
                        </div>
                        ${sub.notes ? `<div class="subscription-notes">${this.escapeHtml(sub.notes)}</div>` : ''}
                        ${sub.profileUrl ? `<a href="${this.escapeHtml(sub.profileUrl)}" target="_blank" class="subscription-link" onclick="event.stopPropagation()">View Profile →</a>` : ''}
                        ${videoCount > 0 ? `<div class="subscription-site">${videoCount} video${videoCount !== 1 ? 's' : ''} in library</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // Apply current filter if any
        if (this.currentCreatorFilter && this.currentCreatorFilter !== 'all') {
            this.filterCreators(this.currentCreatorFilter);
        }
        
        // Find videos from saved creators
        const subNames = subscriptions.map(s => s.name.toLowerCase());
        const subVideos = this.videos.filter(v => 
            v.channel && subNames.includes(v.channel.toLowerCase())
        );
        
        if (subVideos.length === 0) {
            videosGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="icon">🎬</div>
                    <p>No videos from your saved creators in your library.</p>
                </div>
            `;
            return;
        }
        
        videosGrid.innerHTML = subVideos.map(video => this.renderVideoCard(video)).join('');
    }

    searchChannelVideos(channelName) {
        // Switch to search tab and search locally
        this.switchTab('search');
        document.getElementById('searchSite').value = 'local';
        document.getElementById('globalSearch').value = channelName;
        this.searchLocal(channelName);
    }

    unsubscribe(channelName, e) {
        e.stopPropagation();
        if (confirm(`Unsubscribe from ${channelName}?`)) {
            user.unsubscribe(channelName);
            this.renderSubscriptions();
        }
    }

    renderPlaylists() {
        const grid = document.getElementById('playlistsGrid');
        const playlists = user.getAllPlaylists();
        
        if (playlists.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="icon">📁</div>
                    <p>No playlists yet. Click "+ New Playlist" to create one.</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = playlists.map(playlist => this.renderPlaylistCard(playlist)).join('');
    }

    renderPlaylistCard(playlist) {
        const videos = playlist.videos.slice(0, 4).map(id => this.videos.find(v => v.id === id)).filter(Boolean);
        
        return `
            <div class="playlist-card" 
                 data-id="${playlist.id}"
                 onclick="app.viewPlaylist('${playlist.id}')"
                 oncontextmenu="app.showContextMenu(event, 'playlist', '${playlist.id}')">
                <div class="card-actions">
                    <button class="card-action-btn edit" onclick="event.preventDefault(); event.stopPropagation(); app.editItem('playlist', '${playlist.id}')" title="Edit">✏️</button>
                    <button class="card-action-btn delete" onclick="event.preventDefault(); event.stopPropagation(); app.deleteItem('playlist', '${playlist.id}')" title="Delete">🗑️</button>
                </div>
                <div class="playlist-thumb">
                    ${videos.slice(0, 2).map(v => `
                        <div class="playlist-thumb-item">
                            ${v.thumbnail 
                                ? `<img src="${this.escapeHtml(v.thumbnail)}" alt="">`
                                : '<span class="placeholder">▶</span>'
                            }
                        </div>
                    `).join('')}
                    ${videos.length < 2 ? `<div class="playlist-thumb-item"><span class="placeholder">▶</span></div>`.repeat(2 - videos.length) : ''}
                    <div class="playlist-thumb-overlay">
                        <span class="count">${playlist.videos.length}</span>
                        <span class="label">videos</span>
                    </div>
                </div>
                <div class="playlist-info">
                    <div class="playlist-name">${this.escapeHtml(playlist.name)}</div>
                    <div class="playlist-meta">Updated ${this.formatDate(playlist.updatedAt)}</div>
                </div>
            </div>
        `;
    }

    renderVideoCard(video, inPlaylist = false) {
        const isFav = user.isFavorite(video.id);
        const isWL = user.isInWatchLater(video.id);
        
        return `
            <div class="video-card" 
                 data-id="${video.id}"
                 data-title="${this.escapeHtml(video.title)}"
                 data-tags="${this.escapeHtml(video.tags.join(' '))}"
                 data-channel="${this.escapeHtml(video.channel || '')}"
                 onclick="app.openVideo('${video.id}')"
                 oncontextmenu="app.showContextMenu(event, 'video', '${video.id}')">
                <div class="card-actions">
                    <button class="card-action-btn edit" onclick="event.preventDefault(); event.stopPropagation(); app.editItem('video', '${video.id}')" title="Edit">✏️</button>
                    <button class="card-action-btn delete" onclick="event.preventDefault(); event.stopPropagation(); app.deleteItem('video', '${video.id}')" title="Delete">🗑️</button>
                </div>
                <div class="video-thumb">
                    <div class="video-card-actions">
                        <button class="video-card-action ${isFav ? 'active' : ''}" 
                                onclick="app.toggleFavorite('${video.id}', event)" 
                                title="${isFav ? 'Remove from Favorites' : 'Add to Favorites'}">
                            ${isFav ? '❤️' : '🤍'}
                        </button>
                        <button class="video-card-action ${isWL ? 'active' : ''}" 
                                onclick="app.toggleWatchLater('${video.id}', event)" 
                                title="${isWL ? 'Remove from Watch Later' : 'Watch Later'}">
                            ⏱️
                        </button>
                        <button class="video-card-action" 
                                onclick="app.openAddToPlaylistModal('${video.id}'); event.stopPropagation();" 
                                title="Add to Playlist">
                            📁
                        </button>
                    </div>
                    ${video.thumbnail 
                        ? `<img src="${this.escapeHtml(video.thumbnail)}" alt="" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                           <span class="placeholder" style="display:none; position:absolute; inset:0; align-items:center; justify-content:center;">▶</span>`
                        : '<span class="placeholder">▶</span>'
                    }
                    ${video.duration ? `<span class="video-duration">${this.escapeHtml(video.duration)}</span>` : ''}
                    <span class="video-hd">HD</span>
                </div>
                <div class="video-info">
                    ${video.channel ? `
                        <div class="video-channel">
                            <span class="video-channel-name">${this.escapeHtml(video.channel)}</span>
                            <span class="verified-badge">✓</span>
                        </div>
                    ` : ''}
                    <div class="video-title">${this.escapeHtml(video.title)}</div>
                    <div class="video-meta">
                        <span class="views">${this.formatViews(video.views || 0)}</span>
                        <span class="rating">${video.rating || 95}%</span>
                    </div>
                    ${video.tags.length > 0 ? `
                        <div class="video-tags">
                            ${video.tags.slice(0, 3).map(tag => `<span class="video-tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatViews(views) {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views.toString();
    }

    formatDate(dateStr) {
        if (!dateStr) return 'Unknown';
        
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // Export all data to JSON file
    exportData() {
        const exportObj = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                sites: this.sites,
                videos: this.videos,
                favorites: JSON.parse(localStorage.getItem('gentlemensclub_favorites')) || [],
                playlists: JSON.parse(localStorage.getItem('gentlemensclub_playlists')) || [],
                watchHistory: JSON.parse(localStorage.getItem('gentlemensclub_history')) || [],
                watchLater: JSON.parse(localStorage.getItem('gentlemensclub_watchlater')) || [],
                subscriptions: JSON.parse(localStorage.getItem('gentlemensclub_subscriptions')) || []
            }
        };
        
        const dataStr = JSON.stringify(exportObj, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `gentlemensclub-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Profile exported successfully!');
    }
    
    // Import data from JSON file
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importObj = JSON.parse(e.target.result);
                
                // Validate structure
                if (!importObj.data) {
                    throw new Error('Invalid backup file format');
                }
                
                const data = importObj.data;
                
                // Confirm import
                const stats = [];
                if (data.sites?.length) stats.push(`${data.sites.length} sites`);
                if (data.videos?.length) stats.push(`${data.videos.length} videos`);
                if (data.favorites?.length) stats.push(`${data.favorites.length} favorites`);
                if (data.playlists?.length) stats.push(`${data.playlists.length} playlists`);
                if (data.subscriptions?.length) stats.push(`${data.subscriptions.length} creators`);
                
                const confirmMsg = `This will import:\n${stats.join('\n')}\n\nExisting data will be replaced. Continue?`;
                
                if (!confirm(confirmMsg)) {
                    event.target.value = '';
                    return;
                }
                
                // Import data
                if (data.sites) {
                    this.sites = data.sites;
                    this.saveSites();
                }
                if (data.videos) {
                    this.videos = data.videos;
                    this.saveVideos();
                }
                if (data.favorites) {
                    localStorage.setItem('gentlemensclub_favorites', JSON.stringify(data.favorites));
                    user.favorites = data.favorites;
                }
                if (data.playlists) {
                    localStorage.setItem('gentlemensclub_playlists', JSON.stringify(data.playlists));
                    user.playlists = data.playlists;
                }
                if (data.watchHistory) {
                    localStorage.setItem('gentlemensclub_history', JSON.stringify(data.watchHistory));
                    user.watchHistory = data.watchHistory;
                }
                if (data.watchLater) {
                    localStorage.setItem('gentlemensclub_watchlater', JSON.stringify(data.watchLater));
                    user.watchLater = data.watchLater;
                }
                if (data.subscriptions) {
                    localStorage.setItem('gentlemensclub_subscriptions', JSON.stringify(data.subscriptions));
                    user.subscriptions = data.subscriptions;
                }
                
                // Refresh UI
                this.render();
                this.updateSettingsStats();
                
                alert('Profile imported successfully!');
                
            } catch (err) {
                alert('Error importing file: ' + err.message);
            }
            
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    // Clear all data
    clearAllData() {
        if (!confirm('⚠️ This will permanently delete ALL your data including:\n\n• All saved sites\n• All saved videos\n• All favorites\n• All playlists\n• All creators\n• Watch history\n\nThis cannot be undone. Are you sure?')) {
            return;
        }
        
        if (!confirm('Are you REALLY sure? This is your last chance to cancel.')) {
            return;
        }
        
        // Clear all localStorage
        localStorage.removeItem('gentlemensclub_sites');
        localStorage.removeItem('gentlemensclub_videos');
        localStorage.removeItem('gentlemensclub_favorites');
        localStorage.removeItem('gentlemensclub_playlists');
        localStorage.removeItem('gentlemensclub_history');
        localStorage.removeItem('gentlemensclub_watchlater');
        localStorage.removeItem('gentlemensclub_subscriptions');
        
        // Reset in-memory data
        this.sites = this.getDefaultSites();
        this.videos = [];
        user.favorites = [];
        user.playlists = [];
        user.watchHistory = [];
        user.watchLater = [];
        user.subscriptions = [];
        
        // Save default sites
        this.saveSites();
        
        // Refresh UI
        this.render();
        this.updateSettingsStats();
        this.closeModals();
        
        alert('All data has been cleared.');
    }
    
    // Reset sites to defaults
    resetToDefaults() {
        if (!confirm('This will replace your current sites with the default sites. Your videos and other data will not be affected. Continue?')) {
            return;
        }
        
        this.sites = this.getDefaultSites();
        this.saveSites();
        this.renderSites();
        this.updateSettingsStats();
        
        alert('Sites have been reset to defaults.');
    }
}

// Initialize app
const app = new GentlemensClub();
