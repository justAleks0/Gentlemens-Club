// Gentlemen's Club - Video Player Page

class VideoPlayer {
    constructor() {
        this.videos = JSON.parse(localStorage.getItem('gentlemensclub_videos')) || [];
        this.currentVideo = null;
        this.init();
    }

    init() {
        const videoId = this.getVideoIdFromUrl();
        
        if (videoId) {
            this.currentVideo = this.videos.find(v => v.id === videoId);
            
            if (this.currentVideo) {
                user.addToHistory(videoId);
                this.renderPlayer();
            } else {
                this.showNotFound();
            }
        } else {
            this.showNotFound();
        }
        
        document.getElementById('globalSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.executeSearch();
            }
        });
        
        // Update placeholder when site changes
        document.getElementById('searchSite').addEventListener('change', (e) => {
            const site = e.target.value;
            const input = document.getElementById('globalSearch');
            if (site === 'local') {
                input.placeholder = 'Search Gentlemen\'s Club...';
            } else {
                const siteName = e.target.options[e.target.selectedIndex].text;
                input.placeholder = `Search ${siteName}...`;
            }
        });
    }

    getVideoIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('v') || params.get('id');
    }

    showNotFound() {
        document.getElementById('playerPage').style.display = 'none';
        document.getElementById('notFound').style.display = 'flex';
    }

    renderPlayer() {
        const video = this.currentVideo;
        
        document.title = `${video.title} - Gentlemen's Club`;
        
        document.getElementById('playerTitle').textContent = video.title;
        
        document.getElementById('playerViews').textContent = `${this.formatViews(video.views || 0)} Views`;
        document.getElementById('playerDate').textContent = this.formatDate(video.addedAt);
        document.getElementById('playerLikeCount').textContent = video.likes || Math.floor(Math.random() * 500) + 50;
        
        const channelName = video.channel || 'Unknown';
        document.getElementById('channelName').textContent = channelName;
        document.getElementById('channelAvatar').textContent = channelName.charAt(0).toUpperCase();
        
        // Count videos from this channel in library
        const channelVideoCount = this.videos.filter(v => 
            v.channel && v.channel.toLowerCase() === channelName.toLowerCase()
        ).length;
        document.getElementById('channelStats').textContent = `${channelVideoCount} video${channelVideoCount !== 1 ? 's' : ''} in your library`;
        
        const tagsContainer = document.getElementById('playerTags');
        tagsContainer.innerHTML = video.tags.map(tag => 
            `<a href="index.html?tag=${encodeURIComponent(tag)}" class="tag">${this.escapeHtml(tag)}</a>`
        ).join('');
        
        this.updateActionButtons();
        this.renderVideoEmbed();
        this.renderRelatedVideos();
    }

    updateActionButtons() {
        const video = this.currentVideo;
        const isFav = user.isFavorite(video.id);
        const isWL = user.isInWatchLater(video.id);
        const isSub = video.channel ? user.isSubscribed(video.channel) : false;
        
        const btnFav = document.getElementById('btnFavorite');
        const favIcon = document.getElementById('favIcon');
        const favText = document.getElementById('favText');
        
        btnFav.classList.toggle('active', isFav);
        favIcon.textContent = isFav ? '❤️' : '🤍';
        favText.textContent = isFav ? 'Favorited' : 'Favorite';
        
        const btnWL = document.getElementById('btnWatchLater');
        const wlText = document.getElementById('wlText');
        
        btnWL.classList.toggle('active', isWL);
        wlText.textContent = isWL ? 'In Watch Later' : 'Watch Later';
        
        // Subscribe button
        const subBtn = document.querySelector('.subscribe-btn');
        if (subBtn) {
            subBtn.classList.toggle('subscribed', isSub);
            subBtn.innerHTML = isSub ? '✓ Subscribed' : '📡 Subscribe';
        }
    }

    subscribeChannel() {
        if (!this.currentVideo || !this.currentVideo.channel) {
            alert('No channel info available for this video');
            return;
        }
        
        try {
            const hostname = new URL(this.currentVideo.url).hostname.replace('www.', '');
            const isNowSub = user.toggleSubscription(this.currentVideo.channel, hostname);
            this.updateActionButtons();
            
            if (isNowSub) {
                alert(`Subscribed to ${this.currentVideo.channel}!`);
            }
        } catch (e) {
            user.toggleSubscription(this.currentVideo.channel, 'unknown');
            this.updateActionButtons();
        }
    }

    toggleFavorite() {
        if (this.currentVideo) {
            user.toggleFavorite(this.currentVideo.id);
            this.updateActionButtons();
        }
    }

    toggleWatchLater() {
        if (this.currentVideo) {
            user.toggleWatchLater(this.currentVideo.id);
            this.updateActionButtons();
        }
    }

    openAddToPlaylist() {
        this.renderPlaylistSelector();
        document.getElementById('addToPlaylistModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('addToPlaylistModal').classList.remove('active');
    }

    renderPlaylistSelector() {
        const container = document.getElementById('playlistSelector');
        const playlists = user.getAllPlaylists();
        const videoId = this.currentVideo.id;
        
        if (playlists.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 20px; text-align: center;">
                    <p style="color: var(--text-muted);">No playlists yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = playlists.map(playlist => {
            const isInPlaylist = user.isInPlaylist(playlist.id, videoId);
            return `
                <div class="playlist-selector-item ${isInPlaylist ? 'selected' : ''}" 
                     onclick="player.togglePlaylistSelection('${playlist.id}')">
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
        const videoId = this.currentVideo.id;
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
            if (this.currentVideo) {
                user.addToPlaylist(playlist.id, this.currentVideo.id);
            }
            this.renderPlaylistSelector();
        }
    }

    renderVideoEmbed() {
        const video = this.currentVideo;
        const playerEl = document.getElementById('videoPlayer');
        const embedUrl = this.getEmbedUrl(video.url);
        
        if (embedUrl) {
            // Handle direct video files (MP4, WebM, etc.)
            if (embedUrl.startsWith('direct:')) {
                const videoSrc = embedUrl.substring(7);
                playerEl.innerHTML = `
                    <video 
                        controls 
                        autoplay 
                        style="width:100%;height:100%;position:absolute;top:0;left:0;background:#000;"
                        poster="${video.thumbnail ? this.escapeHtml(video.thumbnail) : ''}">
                        <source src="${this.escapeHtml(videoSrc)}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
                return;
            }
            
            // Handle SFM Compile pages (need to fetch the video URL)
            if (embedUrl.startsWith('sfmcompile:')) {
                this.loadSFMCompileVideo(embedUrl.substring(11), playerEl, video.thumbnail);
                return;
            }
            
            // Handle Reddit posts
            if (embedUrl.startsWith('reddit:')) {
                this.loadRedditVideo(embedUrl.substring(7), playerEl, video.thumbnail);
                return;
            }
            
            // Handle v.redd.it direct video links
            if (embedUrl.startsWith('reddit-video:')) {
                const videoUrl = embedUrl.substring(13);
                // v.redd.it URLs typically have /DASH_XXX.mp4 or similar
                let dashUrl = videoUrl;
                if (!dashUrl.includes('DASH_')) {
                    dashUrl = videoUrl.replace(/\/$/, '') + '/DASH_720.mp4';
                }
                playerEl.innerHTML = `
                    <video 
                        controls 
                        autoplay 
                        style="width:100%;height:100%;position:absolute;top:0;left:0;background:#000;"
                        poster="${video.thumbnail ? this.escapeHtml(video.thumbnail) : ''}">
                        <source src="${this.escapeHtml(dashUrl)}" type="video/mp4">
                        <source src="${this.escapeHtml(dashUrl.replace('DASH_720', 'DASH_480'))}" type="video/mp4">
                        <source src="${this.escapeHtml(dashUrl.replace('DASH_720', 'DASH_360'))}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
                return;
            }
            
            // Standard iframe embed
            playerEl.innerHTML = `
                <iframe 
                    src="${embedUrl}" 
                    allowfullscreen 
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture" 
                    referrerpolicy="no-referrer"
                    frameborder="0"
                    scrolling="no"
                    style="width:100%;height:100%;border:none;position:absolute;top:0;left:0;">
                </iframe>
            `;
        } else if (video.thumbnail) {
            playerEl.innerHTML = `
                <div class="player-placeholder" onclick="player.openSource()">
                    <img src="${this.escapeHtml(video.thumbnail)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.5;">
                    <span style="position:relative;z-index:1;">▶</span>
                    <p style="position:relative;z-index:1;">Click to open source</p>
                </div>
            `;
        } else {
            playerEl.innerHTML = `
                <div class="player-placeholder" onclick="player.openSource()">
                    <span>▶</span>
                    <p>Click to open source</p>
                </div>
            `;
        }
    }
    
    async loadSFMCompileVideo(pageUrl, playerEl, thumbnail) {
        // Show loading state
        playerEl.innerHTML = `
            <div class="player-placeholder">
                <span class="loading-spinner"></span>
                <p>Loading video...</p>
            </div>
        `;
        
        try {
            // Fetch the page to find the video URL
            const proxies = [
                'https://api.allorigins.win/raw?url=',
                'https://corsproxy.io/?',
            ];
            
            let html = null;
            for (const proxy of proxies) {
                try {
                    const response = await fetch(proxy + encodeURIComponent(pageUrl));
                    if (response.ok) {
                        html = await response.text();
                        break;
                    }
                } catch (e) { continue; }
            }
            
            if (html) {
                // Find the MP4 URL
                const videoMatch = html.match(/https:\/\/sfmcompile\.club\/wp-content\/uploads\/[^"'\s]+\.mp4/i);
                if (videoMatch) {
                    playerEl.innerHTML = `
                        <video 
                            controls 
                            autoplay 
                            style="width:100%;height:100%;position:absolute;top:0;left:0;background:#000;"
                            poster="${thumbnail ? this.escapeHtml(thumbnail) : ''}">
                            <source src="${videoMatch[0]}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                    return;
                }
            }
        } catch (e) {
            console.error('Failed to load SFM Compile video:', e);
        }
        
        // Fallback to open source
        playerEl.innerHTML = `
            <div class="player-placeholder" onclick="player.openSource()">
                ${thumbnail ? `<img src="${this.escapeHtml(thumbnail)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.5;">` : ''}
                <span style="position:relative;z-index:1;">▶</span>
                <p style="position:relative;z-index:1;">Click to open source</p>
            </div>
        `;
    }
    
    async loadRedditVideo(pageUrl, playerEl, thumbnail) {
        // Show loading state
        playerEl.innerHTML = `
            <div class="player-placeholder">
                <span class="loading-spinner"></span>
                <p>Loading Reddit video...</p>
            </div>
        `;
        
        try {
            // Use Reddit's JSON API
            let jsonUrl = pageUrl.split('?')[0];
            if (!jsonUrl.endsWith('/')) jsonUrl += '/';
            jsonUrl += '.json';
            
            const response = await fetch(jsonUrl, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                const post = data[0]?.data?.children[0]?.data;
                
                if (post) {
                    // Check for Reddit-hosted video
                    const redditVideo = post.media?.reddit_video || post.secure_media?.reddit_video;
                    
                    if (redditVideo?.fallback_url) {
                        playerEl.innerHTML = `
                            <video 
                                controls 
                                autoplay 
                                style="width:100%;height:100%;position:absolute;top:0;left:0;background:#000;"
                                poster="${thumbnail ? this.escapeHtml(thumbnail) : ''}">
                                <source src="${this.escapeHtml(redditVideo.fallback_url)}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        `;
                        return;
                    }
                    
                    // Check for external embed (redgifs, gfycat, imgur, etc.)
                    const externalUrl = post.url_overridden_by_dest || post.url;
                    if (externalUrl) {
                        // RedGifs
                        if (externalUrl.includes('redgifs.com')) {
                            const match = externalUrl.match(/watch\/([a-zA-Z]+)/i);
                            if (match) {
                                playerEl.innerHTML = `
                                    <iframe 
                                        src="https://www.redgifs.com/ifr/${match[1]}"
                                        allowfullscreen 
                                        style="width:100%;height:100%;border:none;position:absolute;top:0;left:0;">
                                    </iframe>
                                `;
                                return;
                            }
                        }
                        
                        // Imgur gifv/mp4
                        if (externalUrl.includes('imgur.com') && (externalUrl.includes('.gifv') || externalUrl.includes('.mp4'))) {
                            const videoUrl = externalUrl.replace('.gifv', '.mp4');
                            playerEl.innerHTML = `
                                <video 
                                    controls 
                                    autoplay 
                                    loop
                                    style="width:100%;height:100%;position:absolute;top:0;left:0;background:#000;"
                                    poster="${thumbnail ? this.escapeHtml(thumbnail) : ''}">
                                    <source src="${this.escapeHtml(videoUrl)}" type="video/mp4">
                                </video>
                            `;
                            return;
                        }
                        
                        // Gfycat
                        if (externalUrl.includes('gfycat.com')) {
                            const match = externalUrl.match(/gfycat\.com\/([a-zA-Z]+)/i);
                            if (match) {
                                playerEl.innerHTML = `
                                    <iframe 
                                        src="https://gfycat.com/ifr/${match[1]}"
                                        allowfullscreen 
                                        style="width:100%;height:100%;border:none;position:absolute;top:0;left:0;">
                                    </iframe>
                                `;
                                return;
                            }
                        }
                        
                        // Direct GIF
                        if (externalUrl.endsWith('.gif')) {
                            playerEl.innerHTML = `
                                <img 
                                    src="${this.escapeHtml(externalUrl)}"
                                    style="width:100%;height:100%;object-fit:contain;position:absolute;top:0;left:0;background:#000;">
                            `;
                            return;
                        }
                        
                        // Direct video file
                        if (/\.(mp4|webm)(\?|$)/i.test(externalUrl)) {
                            playerEl.innerHTML = `
                                <video 
                                    controls 
                                    autoplay 
                                    style="width:100%;height:100%;position:absolute;top:0;left:0;background:#000;"
                                    poster="${thumbnail ? this.escapeHtml(thumbnail) : ''}">
                                    <source src="${this.escapeHtml(externalUrl)}" type="video/mp4">
                                </video>
                            `;
                            return;
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load Reddit video:', e);
        }
        
        // Fallback to open source
        playerEl.innerHTML = `
            <div class="player-placeholder" onclick="player.openSource()">
                ${thumbnail ? `<img src="${this.escapeHtml(thumbnail)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.5;">` : ''}
                <span style="position:relative;z-index:1;">▶</span>
                <p style="position:relative;z-index:1;">Click to open source</p>
            </div>
        `;
    }

    getEmbedUrl(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase().replace('www.', '');
            const pathname = urlObj.pathname;
            
            // YouTube
            if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                let videoId = null;
                if (hostname.includes('youtu.be')) {
                    videoId = pathname.slice(1).split('?')[0];
                } else {
                    videoId = urlObj.searchParams.get('v');
                }
                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                }
            }
            
            // Vimeo
            if (hostname.includes('vimeo.com')) {
                const videoId = pathname.split('/').filter(Boolean).pop();
                if (videoId && /^\d+$/.test(videoId)) {
                    return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
                }
            }
            
            // Dailymotion
            if (hostname.includes('dailymotion.com')) {
                const match = pathname.match(/video\/([a-zA-Z0-9]+)/);
                if (match) {
                    return `https://www.dailymotion.com/embed/video/${match[1]}?autoplay=1`;
                }
            }
            
            // RedGifs
            if (hostname.includes('redgifs.com')) {
                const match = pathname.match(/watch\/([a-zA-Z]+)/i);
                if (match) {
                    return `https://www.redgifs.com/ifr/${match[1]}`;
                }
            }
            
            // Streamable
            if (hostname.includes('streamable.com')) {
                const videoId = pathname.split('/').filter(Boolean).pop();
                if (videoId) {
                    return `https://streamable.com/e/${videoId}?autoplay=1`;
                }
            }
            
            // PornHub
            if (hostname.includes('pornhub.com')) {
                const viewkey = urlObj.searchParams.get('viewkey');
                if (viewkey) {
                    return `https://www.pornhub.com/embed/${viewkey}`;
                }
                const embedMatch = pathname.match(/embed\/([a-zA-Z0-9]+)/);
                if (embedMatch) {
                    return `https://www.pornhub.com/embed/${embedMatch[1]}`;
                }
            }
            
            // XVideos
            if (hostname.includes('xvideos.com')) {
                const match = pathname.match(/video(\d+)/);
                if (match) {
                    return `https://www.xvideos.com/embedframe/${match[1]}`;
                }
            }
            
            // XNXX
            if (hostname.includes('xnxx.com')) {
                const match = pathname.match(/video-([a-zA-Z0-9]+)/);
                if (match) {
                    return `https://www.xnxx.com/embedframe/${match[1]}`;
                }
            }
            
            // xHamster
            if (hostname.includes('xhamster.com')) {
                const match = pathname.match(/videos\/[^\/]+-(\d+)/);
                if (match) {
                    return `https://xhamster.com/xembed.php?video=${match[1]}`;
                }
            }
            
            // RedTube
            if (hostname.includes('redtube.com')) {
                const match = pathname.match(/(\d+)/);
                if (match) {
                    return `https://embed.redtube.com/?id=${match[1]}`;
                }
            }
            
            // YouPorn
            if (hostname.includes('youporn.com')) {
                const match = pathname.match(/watch\/(\d+)/);
                if (match) {
                    return `https://www.youporn.com/embed/${match[1]}`;
                }
            }
            
            // SpankBang
            if (hostname.includes('spankbang.com')) {
                const match = pathname.match(/([a-zA-Z0-9]+)\/video/);
                if (match) {
                    return `https://spankbang.com/${match[1]}/embed/`;
                }
            }
            
            // Eporner
            if (hostname.includes('eporner.com')) {
                const match = pathname.match(/video-([a-zA-Z0-9]+)/);
                if (match) {
                    return `https://www.eporner.com/embed/${match[1]}`;
                }
            }
            
            // TNAFlix
            if (hostname.includes('tnaflix.com')) {
                const match = pathname.match(/video(\d+)/);
                if (match) {
                    return `https://player.tnaflix.com/video/${match[1]}`;
                }
            }
            
            // DrTuber
            if (hostname.includes('drtuber.com')) {
                const match = pathname.match(/video\/(\d+)/);
                if (match) {
                    return `https://www.drtuber.com/embed/${match[1]}`;
                }
            }
            
            // HClips
            if (hostname.includes('hclips.com')) {
                const match = pathname.match(/videos\/(\d+)/);
                if (match) {
                    return `https://www.hclips.com/embed/${match[1]}`;
                }
            }
            
            // HotMovs
            if (hostname.includes('hotmovs.com')) {
                const match = pathname.match(/videos\/(\d+)/);
                if (match) {
                    return `https://www.hotmovs.com/embed/${match[1]}`;
                }
            }
            
            // Txxx
            if (hostname.includes('txxx.com')) {
                const match = pathname.match(/videos\/(\d+)/);
                if (match) {
                    return `https://www.txxx.com/embed/${match[1]}`;
                }
            }
            
            // Upornia
            if (hostname.includes('upornia.com')) {
                const match = pathname.match(/videos\/(\d+)/);
                if (match) {
                    return `https://www.upornia.com/embed/${match[1]}`;
                }
            }
            
            // Beeg
            if (hostname.includes('beeg.com')) {
                const match = pathname.match(/(\d+)/);
                if (match) {
                    return `https://beeg.com/e/${match[1]}`;
                }
            }
            
            // Motherless
            if (hostname.includes('motherless.com')) {
                const match = pathname.match(/([A-Za-z0-9]+)$/);
                if (match && match[1].length > 4) {
                    return `https://motherless.com/embed/${match[1]}`;
                }
            }
            
            // ThisVid
            if (hostname.includes('thisvid.com')) {
                const match = pathname.match(/videos\/([^\/]+)/);
                if (match) {
                    return `https://thisvid.com/embed/${match[1]}/`;
                }
            }
            
            // Noodlemagazine
            if (hostname.includes('noodlemagazine.com')) {
                const match = pathname.match(/watch\/-?(\d+)/);
                if (match) {
                    return `https://noodlemagazine.com/embed/${match[1]}`;
                }
            }
            
            // SFM Compile - direct MP4 files
            if (hostname.includes('sfmcompile.club')) {
                // If it's already a direct MP4 link, return it with a marker
                if (pathname.endsWith('.mp4')) {
                    return `direct:${url}`;
                }
                // For page URLs, we'll need to extract the video URL
                // This is handled in renderVideoEmbed
                return `sfmcompile:${url}`;
            }
            
            // Reddit
            if (hostname.includes('reddit.com')) {
                return `reddit:${url}`;
            }
            
            // v.redd.it direct video links
            if (hostname.includes('v.redd.it')) {
                // v.redd.it videos need special handling
                return `reddit-video:${url}`;
            }
            
            // Generic direct video file support
            if (/\.(mp4|webm|ogg|m4v)(\?|$)/i.test(url)) {
                return `direct:${url}`;
            }
            
            return null;
        } catch (e) {
            console.error('Error parsing URL:', e);
            return null;
        }
    }

    renderRelatedVideos() {
        const related = this.videos
            .filter(v => v.id !== this.currentVideo.id)
            .slice(0, 10);
        
        const relatedHtml = related.map(video => `
            <a href="player.html?v=${video.id}" class="related-video">
                <div class="related-thumb">
                    ${video.thumbnail 
                        ? `<img src="${this.escapeHtml(video.thumbnail)}" alt="" loading="lazy" onerror="this.style.display='none';">`
                        : '<span class="placeholder">▶</span>'
                    }
                    ${video.duration ? `<span class="duration">${this.escapeHtml(video.duration)}</span>` : ''}
                </div>
                <div class="related-info">
                    ${video.channel ? `
                        <div class="related-channel">
                            ${this.escapeHtml(video.channel)}
                            <span class="verified">✓</span>
                        </div>
                    ` : ''}
                    <div class="related-title">${this.escapeHtml(video.title)}</div>
                    <div class="related-meta">
                        <span>👁 ${this.formatViews(video.views || 0)}</span>
                    </div>
                </div>
            </a>
        `).join('');
        
        document.getElementById('relatedVideos').innerHTML = relatedHtml || '<p style="color: var(--text-muted); padding: 20px;">No related videos</p>';
        
        const mobileHtml = related.map(video => `
            <a href="player.html?v=${video.id}" class="video-card">
                <div class="video-thumb">
                    ${video.thumbnail 
                        ? `<img src="${this.escapeHtml(video.thumbnail)}" alt="" loading="lazy">`
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
                </div>
            </a>
        `).join('');
        
        document.getElementById('relatedVideosMobile').innerHTML = mobileHtml;
    }

    openInPopup() {
        if (this.currentVideo) {
            const embedUrl = this.getEmbedUrl(this.currentVideo.url);
            const url = embedUrl || this.currentVideo.url;
            const width = Math.min(1280, window.screen.width - 100);
            const height = Math.min(720, window.screen.height - 100);
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            window.open(
                url, 
                'VideoPlayer',
                `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`
            );
        }
    }

    openSource() {
        if (this.currentVideo) {
            window.open(this.currentVideo.url, '_blank');
        }
    }

    openChannelPage() {
        if (!this.currentVideo) return;
        
        const channelUrl = this.getChannelUrl(this.currentVideo.url, this.currentVideo.channel);
        if (channelUrl) {
            window.open(channelUrl, '_blank');
        } else {
            // Fallback: search for channel name on Google
            const channel = this.currentVideo.channel || 'unknown';
            window.open(`https://www.google.com/search?q=${encodeURIComponent(channel + ' videos')}`, '_blank');
        }
    }

    getChannelUrl(videoUrl, channelName) {
        if (!videoUrl) return null;
        
        try {
            const urlObj = new URL(videoUrl);
            const hostname = urlObj.hostname.toLowerCase().replace('www.', '');
            const pathname = urlObj.pathname;
            
            // Clean channel name for URL (remove spaces, special chars)
            const cleanChannel = channelName ? channelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '';
            const searchChannel = channelName ? encodeURIComponent(channelName) : '';
            
            // YouTube
            if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                if (cleanChannel) {
                    return `https://www.youtube.com/results?search_query=${searchChannel}`;
                }
            }
            
            // PornHub
            if (hostname.includes('pornhub.com')) {
                if (channelName) {
                    // Try model page first, search as fallback
                    return `https://www.pornhub.com/video/search?search=${searchChannel}`;
                }
            }
            
            // XVideos
            if (hostname.includes('xvideos.com')) {
                if (channelName) {
                    return `https://www.xvideos.com/?k=${searchChannel}`;
                }
            }
            
            // XNXX
            if (hostname.includes('xnxx.com')) {
                if (channelName) {
                    return `https://www.xnxx.com/search/${searchChannel}`;
                }
            }
            
            // xHamster
            if (hostname.includes('xhamster.com')) {
                if (channelName) {
                    return `https://xhamster.com/search/${searchChannel}`;
                }
            }
            
            // RedTube
            if (hostname.includes('redtube.com')) {
                if (channelName) {
                    return `https://www.redtube.com/?search=${searchChannel}`;
                }
            }
            
            // YouPorn
            if (hostname.includes('youporn.com')) {
                if (channelName) {
                    return `https://www.youporn.com/search/?query=${searchChannel}`;
                }
            }
            
            // SpankBang
            if (hostname.includes('spankbang.com')) {
                if (channelName) {
                    return `https://spankbang.com/s/${cleanChannel}/`;
                }
            }
            
            // Eporner
            if (hostname.includes('eporner.com')) {
                if (channelName) {
                    return `https://www.eporner.com/search/${searchChannel}/`;
                }
            }
            
            // RedGifs
            if (hostname.includes('redgifs.com')) {
                if (channelName) {
                    return `https://www.redgifs.com/users/${cleanChannel}`;
                }
            }
            
            // Motherless
            if (hostname.includes('motherless.com')) {
                if (channelName) {
                    return `https://motherless.com/term/${searchChannel}`;
                }
            }
            
            // ThisVid
            if (hostname.includes('thisvid.com')) {
                if (channelName) {
                    return `https://thisvid.com/search/?q=${searchChannel}`;
                }
            }
            
            // HClips, HotMovs, Txxx, Upornia (same network)
            if (hostname.includes('hclips.com')) {
                return channelName ? `https://www.hclips.com/search/${searchChannel}/` : null;
            }
            if (hostname.includes('hotmovs.com')) {
                return channelName ? `https://www.hotmovs.com/search/${searchChannel}/` : null;
            }
            if (hostname.includes('txxx.com')) {
                return channelName ? `https://www.txxx.com/search/${searchChannel}/` : null;
            }
            if (hostname.includes('upornia.com')) {
                return channelName ? `https://www.upornia.com/search/${searchChannel}/` : null;
            }
            
            // Beeg
            if (hostname.includes('beeg.com')) {
                if (channelName) {
                    return `https://beeg.com/search?q=${searchChannel}`;
                }
            }
            
            // Noodlemagazine
            if (hostname.includes('noodlemagazine.com')) {
                if (channelName) {
                    return `https://noodlemagazine.com/search?q=${searchChannel}`;
                }
            }
            
            // Vimeo
            if (hostname.includes('vimeo.com')) {
                if (channelName) {
                    return `https://vimeo.com/search?q=${searchChannel}`;
                }
            }
            
            // Dailymotion
            if (hostname.includes('dailymotion.com')) {
                if (channelName) {
                    return `https://www.dailymotion.com/search/${searchChannel}`;
                }
            }
            
            // Generic fallback - search on the same site
            if (channelName) {
                return `https://${hostname}/search?q=${searchChannel}`;
            }
            
            return null;
        } catch (e) {
            console.error('Error constructing channel URL:', e);
            return null;
        }
    }

    reloadEmbed() {
        this.renderVideoEmbed();
    }

    shareVideo() {
        if (this.currentVideo) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(this.currentVideo.url);
                alert('Link copied to clipboard!');
            } else {
                prompt('Copy this link:', this.currentVideo.url);
            }
        }
    }

    searchAndRedirect() {
        const query = document.getElementById('globalSearch').value.trim();
        if (query) {
            window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        }
    }
    
    executeSearch() {
        const site = document.getElementById('searchSite').value;
        const query = document.getElementById('globalSearch').value.trim();
        
        if (!query) return;
        
        if (site === 'local') {
            this.searchAndRedirect();
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
        
        const url = searchUrls[site];
        if (url) {
            window.open(url, '_blank');
        }
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
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days < 7) return `${days} days ago`;
        if (weeks < 4) return `${weeks} weeks ago`;
        return `${months} months ago`;
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize player
const player = new VideoPlayer();

// Apply saved theme on load
(function initTheme() {
    const theme = localStorage.getItem('gentlemensclub_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.src = theme === 'dark' ? 'dark mode.gif' : 'light mode.gif';
    }
})();

// Theme toggle function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('gentlemensclub_theme', newTheme);
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.src = newTheme === 'dark' ? 'dark mode.gif' : 'light mode.gif';
    }
}

// Sidebar functions
function toggleSidebar() {
    const sidenav = document.getElementById('sideNav');
    const overlay = document.getElementById('sideNavOverlay');
    if (sidenav && overlay) {
        sidenav.classList.toggle('open');
        overlay.classList.toggle('open');
        document.body.style.overflow = sidenav.classList.contains('open') ? 'hidden' : '';
    }
}

function closeSidebar() {
    const sidenav = document.getElementById('sideNav');
    const overlay = document.getElementById('sideNavOverlay');
    if (sidenav && overlay) {
        sidenav.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Global search function
function searchAndRedirect() {
    player.searchAndRedirect();
}

function executeSearch() {
    player.executeSearch();
}
