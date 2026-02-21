// AleksHub - Video Metadata Fetcher (Enhanced)

class MetadataFetcher {
    constructor() {
        this.cache = {};
        // Multiple CORS proxies for redundancy
        this.corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest=',
        ];
    }

    async fetchMetadata(url) {
        if (this.cache[url]) {
            return this.cache[url];
        }

        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase().replace('www.', '');
            
            let metadata = {
                title: '',
                thumbnail: '',
                duration: '',
                channel: ''
            };

            // Try site-specific fetchers
            if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                metadata = await this.fetchYouTube(url, urlObj);
            } else if (hostname.includes('vimeo.com')) {
                metadata = await this.fetchVimeo(url, urlObj);
            } else if (hostname.includes('pornhub.com')) {
                metadata = await this.fetchPornHub(url, urlObj);
            } else if (hostname.includes('xvideos.com')) {
                metadata = await this.fetchXVideos(url, urlObj);
            } else if (hostname.includes('xnxx.com')) {
                metadata = await this.fetchXNXX(url, urlObj);
            } else if (hostname.includes('xhamster.com')) {
                metadata = await this.fetchXHamster(url, urlObj);
            } else if (hostname.includes('redtube.com')) {
                metadata = await this.fetchRedTube(url, urlObj);
            } else if (hostname.includes('youporn.com')) {
                metadata = await this.fetchYouPorn(url, urlObj);
            } else if (hostname.includes('spankbang.com')) {
                metadata = await this.fetchSpankBang(url, urlObj);
            } else if (hostname.includes('eporner.com')) {
                metadata = await this.fetchEporner(url, urlObj);
            } else if (hostname.includes('redgifs.com')) {
                metadata = await this.fetchRedGifs(url, urlObj);
            } else if (hostname.includes('streamable.com')) {
                metadata = await this.fetchStreamable(url, urlObj);
            } else if (hostname.includes('dailymotion.com')) {
                metadata = await this.fetchDailymotion(url, urlObj);
            } else if (hostname.includes('hclips.com') || hostname.includes('hotmovs.com') || 
                       hostname.includes('txxx.com') || hostname.includes('upornia.com')) {
                metadata = await this.fetchTubeNetwork(url, urlObj);
            } else if (hostname.includes('motherless.com')) {
                metadata = await this.fetchMotherless(url, urlObj);
            } else if (hostname.includes('thisvid.com')) {
                metadata = await this.fetchThisVid(url, urlObj);
            } else if (hostname.includes('beeg.com')) {
                metadata = await this.fetchBeeg(url, urlObj);
            } else if (hostname.includes('sfmcompile.club')) {
                metadata = await this.fetchSFMCompile(url, urlObj);
            } else if (hostname.includes('reddit.com') || hostname.includes('redd.it')) {
                metadata = await this.fetchReddit(url, urlObj);
            } else {
                metadata = await this.fetchNoembed(url);
            }

            // Validate thumbnail by trying to load it
            if (metadata.thumbnail) {
                const validThumb = await this.validateThumbnail(metadata.thumbnail);
                if (!validThumb) {
                    metadata.thumbnail = '';
                }
            }

            this.cache[url] = metadata;
            return metadata;

        } catch (e) {
            console.error('Error fetching metadata:', e);
            return { title: '', thumbnail: '', duration: '', channel: '' };
        }
    }

    // Validate thumbnail URL actually works
    async validateThumbnail(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            // Timeout after 5 seconds
            setTimeout(() => resolve(false), 5000);
        });
    }

    // Try to fetch page via CORS proxy and extract metadata
    async fetchWithProxy(url) {
        for (const proxy of this.corsProxies) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch(proxy + encodeURIComponent(url), {
                    headers: { 
                        'Accept': 'text/html,application/xhtml+xml',
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const text = await response.text();
                    if (text && text.length > 100) {
                        return text;
                    }
                }
            } catch (e) {
                console.log(`Proxy ${proxy} failed:`, e.message);
                continue;
            }
        }
        return null;
    }

    // Extract Open Graph / meta tags from HTML
    extractMetaFromHtml(html) {
        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };
        
        // Title - og:title or <title>
        const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        metadata.title = ogTitle ? this.decodeHtml(ogTitle[1]) : (titleTag ? this.decodeHtml(titleTag[1]) : '');
        
        // Clean up title (remove site name suffix)
        metadata.title = metadata.title.replace(/\s*[-|–—]\s*(Pornhub|XVideos|xHamster|RedTube|YouPorn|XNXX).*$/i, '').trim();
        
        // Thumbnail - og:image
        const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogImage) {
            metadata.thumbnail = this.decodeHtml(ogImage[1]);
        }
        
        // Duration - og:duration or video:duration
        const ogDuration = html.match(/<meta[^>]*property=["'](?:og:|video:)?duration["'][^>]*content=["']([^"']+)["']/i);
        if (ogDuration) {
            const secs = parseInt(ogDuration[1]);
            if (!isNaN(secs)) {
                metadata.duration = this.formatDuration(secs);
            }
        }
        
        // Try to find channel/uploader
        const uploaderMatch = html.match(/(?:uploadedBy|author|channel|pornstar|model)["'\s:]+["']?([^"'<,]+)/i);
        if (uploaderMatch) {
            metadata.channel = this.decodeHtml(uploaderMatch[1]).trim();
        }
        
        return metadata;
    }

    decodeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    // YouTube
    async fetchYouTube(url, urlObj) {
        let videoId = null;
        if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1).split('?')[0];
        } else {
            videoId = urlObj.searchParams.get('v');
        }

        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = {
            title: '',
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: '',
            channel: ''
        };

        // Try noembed for title and channel
        try {
            const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            if (data.title) metadata.title = data.title;
            if (data.author_name) metadata.channel = data.author_name;
        } catch (e) {}

        // Try different thumbnail qualities
        const thumbQualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'];
        for (const quality of thumbQualities) {
            const thumbUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
            if (await this.validateThumbnail(thumbUrl)) {
                metadata.thumbnail = thumbUrl;
                break;
            }
        }

        return metadata;
    }

    // Vimeo
    async fetchVimeo(url, urlObj) {
        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        try {
            const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            if (data.title) metadata.title = data.title;
            if (data.thumbnail_url) metadata.thumbnail = data.thumbnail_url.replace(/_\d+x\d+/, '_1280x720');
            if (data.author_name) metadata.channel = data.author_name;
            if (data.duration) metadata.duration = this.formatDuration(data.duration);
        } catch (e) {}

        return metadata;
    }

    // PornHub - Enhanced with real example analysis
    // Example: viewkey=696a7cb18a015 -> Title: "Black Lesbian...", Creator: "Deviante", Duration: 15:17
    async fetchPornHub(url, urlObj) {
        const viewkey = urlObj.searchParams.get('viewkey');
        if (!viewkey) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };
        console.log('[PornHub] Fetching metadata for viewkey:', viewkey);

        // Method 1: Try fetching the actual video page
        try {
            const html = await this.fetchWithProxy(url);
            
            if (html) {
                console.log('[PornHub] Got HTML, length:', html.length);
                
                // Try to extract JSON-LD structured data first (most reliable)
                const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
                for (const jsonLdMatch of jsonLdMatches) {
                    try {
                        const jsonLd = JSON.parse(jsonLdMatch[1]);
                        console.log('[PornHub] Found JSON-LD object:', jsonLd['@type']);
                        
                        if (jsonLd.name && !metadata.title) metadata.title = jsonLd.name;
                        if (jsonLd.thumbnailUrl && !metadata.thumbnail) {
                            metadata.thumbnail = Array.isArray(jsonLd.thumbnailUrl) ? jsonLd.thumbnailUrl[0] : jsonLd.thumbnailUrl;
                        }
                        if (jsonLd.duration && !metadata.duration) {
                            // ISO 8601 format like PT15M17S
                            const durMatch = jsonLd.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                            if (durMatch) {
                                const totalSecs = (parseInt(durMatch[1] || 0) * 3600) + 
                                                  (parseInt(durMatch[2] || 0) * 60) + 
                                                  parseInt(durMatch[3] || 0);
                                metadata.duration = this.formatDuration(totalSecs);
                            }
                        }
                        
                        // Try multiple author/creator fields
                        if (!metadata.channel) {
                            const authorFields = ['author', 'creator', 'publisher', 'uploadedBy', 'contentCreator'];
                            for (const field of authorFields) {
                                if (jsonLd[field]) {
                                    if (typeof jsonLd[field] === 'string') {
                                        metadata.channel = jsonLd[field];
                                        break;
                                    } else if (jsonLd[field].name) {
                                        metadata.channel = jsonLd[field].name;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        console.log('[PornHub] JSON-LD extracted:', metadata);
                    } catch (e) {
                        console.log('[PornHub] JSON-LD parse failed for one block');
                    }
                }
                
                // Extract title - multiple patterns (fallback)
                if (!metadata.title) {
                    const titlePatterns = [
                        /<h1[^>]*class="[^"]*title[^"]*"[^>]*>\s*<span[^>]*>([^<]+)</is,
                        /<h1[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</i,
                        /<span[^>]*class="[^"]*inlineFree[^"]*"[^>]*>([^<]+)</i,
                        /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
                        /<meta[^>]*content="([^"]+)"[^>]*property="og:title"/i,
                        /<meta[^>]*name="twitter:title"[^>]*content="([^"]+)"/i,
                        /"video_title"\s*:\s*"([^"]+)"/i,
                        /<title>([^<]+)<\/title>/i,
                    ];
                    
                    for (const pattern of titlePatterns) {
                        const match = html.match(pattern);
                        if (match && match[1]) {
                            metadata.title = this.decodeHtml(match[1])
                                .replace(/\s*[-|–]\s*Pornhub.*$/i, '')
                                .replace(/^\s*Pornhub\s*[-|–]\s*/i, '')
                                .replace(/\s*\|\s*Pornhub\.com$/i, '')
                                .trim();
                            if (metadata.title.length > 5) {
                                console.log('[PornHub] Found title via pattern');
                                break;
                            }
                        }
                    }
                }
                
                // Extract thumbnail/poster image (fallback)
                if (!metadata.thumbnail) {
                    const thumbPatterns = [
                        /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
                        /<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i,
                        /<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i,
                        /"image_url"\s*:\s*"([^"]+)"/i,
                        /"poster"\s*:\s*"([^"]+)"/i,
                        /"thumbUrl"\s*:\s*"([^"]+)"/i,
                        /data-poster="([^"]+)"/i,
                        /poster="([^"]+)"/i,
                        /"thumbnail"\s*:\s*"([^"]+)"/i,
                        /"thumbnailUrl"\s*:\s*"([^"]+)"/i,
                    ];
                    
                    for (const pattern of thumbPatterns) {
                        const match = html.match(pattern);
                        if (match && match[1]) {
                            let thumb = this.decodeHtml(match[1]).replace(/\\u002F/g, '/').replace(/\\/g, '');
                            if (thumb.startsWith('//')) thumb = 'https:' + thumb;
                            if (thumb.includes('phncdn.com') || thumb.includes('pornhub.com')) {
                                metadata.thumbnail = thumb;
                                console.log('[PornHub] Found thumbnail via pattern');
                                break;
                            }
                        }
                    }
                }
                
                // Extract channel/pornstar/uploader (fallback)
                if (!metadata.channel) {
                    console.log('[PornHub] Looking for channel...');
                    
                    // Method 1: Look for uploader/channel link with common class patterns
                    const uploaderLinkPatterns = [
                        // Channel/model/pornstar links with text content
                        /<a[^>]*href="\/(?:channels|model|pornstar|users)\/([^"]+)"[^>]*>([^<]+)<\/a>/gi,
                        // Bolded/styled uploader names
                        /<a[^>]*class="[^"]*(?:bolded|usernameWrap|usernameBadge)[^"]*"[^>]*>([^<]+)<\/a>/gi,
                    ];
                    
                    for (const pattern of uploaderLinkPatterns) {
                        const matches = [...html.matchAll(pattern)];
                        if (matches.length > 0) {
                            // Get the first match that looks like a real channel name
                            for (const match of matches) {
                                const name = match[2] || match[1];
                                if (name && name.length > 1 && name.length < 50 && !/^(video|watch|embed)/i.test(name)) {
                                    metadata.channel = this.decodeHtml(name).trim();
                                    console.log('[PornHub] Found channel from link:', metadata.channel);
                                    break;
                                }
                            }
                            if (metadata.channel) break;
                        }
                    }
                    
                    // Method 2: Look for "From:" or "Uploaded by" text patterns
                    if (!metadata.channel) {
                        const fromPatterns = [
                            /(?:From|Uploaded\s*by|By)\s*:?\s*<[^>]*>?\s*<a[^>]*>([^<]+)<\/a>/i,
                            /(?:From|Uploaded\s*by|By)\s*:?\s*([A-Za-z0-9_-]+)/i,
                            /class="[^"]*video-info[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i,
                        ];
                        
                        for (const pattern of fromPatterns) {
                            const match = html.match(pattern);
                            if (match && match[1] && match[1].length > 1 && match[1].length < 50) {
                                metadata.channel = this.decodeHtml(match[1]).trim();
                                console.log('[PornHub] Found channel from "From:" pattern:', metadata.channel);
                                break;
                            }
                        }
                    }
                    
                    // Method 3: JSON patterns in script tags
                    if (!metadata.channel) {
                        const jsonPatterns = [
                            /"(?:author|uploader|channel|username|owner)(?:Name)?"\s*:\s*"([^"]+)"/i,
                            /"name"\s*:\s*"([^"]+)"[^}]*"@type"\s*:\s*"Person"/i,
                            /"@type"\s*:\s*"Person"[^}]*"name"\s*:\s*"([^"]+)"/i,
                        ];
                        
                        for (const pattern of jsonPatterns) {
                            const match = html.match(pattern);
                            if (match && match[1] && match[1].length > 1 && match[1].length < 50) {
                                metadata.channel = this.decodeHtml(match[1]).trim();
                                console.log('[PornHub] Found channel from JSON:', metadata.channel);
                                break;
                            }
                        }
                    }
                    
                    // Method 4: Extract from URL path as last resort (for channel pages)
                    if (!metadata.channel) {
                        const pathMatch = html.match(/href="\/(?:channels|model|pornstar)\/([^"\/]+)"/i);
                        if (pathMatch && pathMatch[1]) {
                            // Convert URL slug to readable name
                            metadata.channel = pathMatch[1]
                                .replace(/-/g, ' ')
                                .replace(/\b\w/g, c => c.toUpperCase());
                            console.log('[PornHub] Extracted channel from path:', metadata.channel);
                        }
                    }
                }
                
                // Extract duration (fallback)
                if (!metadata.duration) {
                    const durationPatterns = [
                        /<meta[^>]*property="video:duration"[^>]*content="(\d+)"/i,
                        /"duration"\s*:\s*"?(\d+)"?/i,
                        /"video_duration"\s*:\s*"?(\d+)"?/i,
                        /itemprop="duration"[^>]*content="PT([^"]+)"/i,
                    ];
                    
                    for (const pattern of durationPatterns) {
                        const match = html.match(pattern);
                        if (match && match[1]) {
                            if (match[1].includes('M') || match[1].includes('S')) {
                                const mins = match[1].match(/(\d+)M/);
                                const secs = match[1].match(/(\d+)S/);
                                const totalSecs = (mins ? parseInt(mins[1]) * 60 : 0) + (secs ? parseInt(secs[1]) : 0);
                                metadata.duration = this.formatDuration(totalSecs);
                            } else {
                                metadata.duration = this.formatDuration(parseInt(match[1]));
                            }
                            if (metadata.duration) break;
                        }
                    }
                }
            }
        } catch (e) {
            console.log('[PornHub] Page fetch failed:', e);
        }

        // Method 2: If still missing data, try embed page
        if (!metadata.thumbnail || !metadata.title) {
            try {
                console.log('[PornHub] Trying embed page...');
                const embedUrl = `https://www.pornhub.com/embed/${viewkey}`;
                const embedHtml = await this.fetchWithProxy(embedUrl);
                
                if (embedHtml) {
                    console.log('[PornHub] Got embed HTML, length:', embedHtml.length);
                    
                    if (!metadata.thumbnail) {
                        const thumbMatch = embedHtml.match(/"(?:image_url|poster|thumb(?:nail)?(?:Url)?)":\s*"([^"]+)"/i);
                        if (thumbMatch) {
                            let thumb = thumbMatch[1].replace(/\\u002F/g, '/').replace(/\\/g, '');
                            if (thumb.startsWith('//')) thumb = 'https:' + thumb;
                            metadata.thumbnail = thumb;
                        }
                    }
                    
                    if (!metadata.title) {
                        const titleMatch = embedHtml.match(/<title>([^<]+)<\/title>/i);
                        if (titleMatch) {
                            metadata.title = this.decodeHtml(titleMatch[1])
                                .replace(/\s*[-|–]\s*Pornhub.*$/i, '')
                                .trim();
                        }
                    }
                }
            } catch (e) {
                console.log('[PornHub] Embed fetch failed:', e);
            }
        }

        // Method 3: Try direct CDN thumbnail URLs as last resort
        if (!metadata.thumbnail) {
            console.log('[PornHub] Trying CDN thumbnail URLs...');
            const thumbUrls = this.generatePornHubThumbUrls(viewkey);
            for (const thumbUrl of thumbUrls) {
                if (await this.validateThumbnail(thumbUrl)) {
                    metadata.thumbnail = thumbUrl;
                    console.log('[PornHub] Found working CDN thumbnail');
                    break;
                }
            }
        }

        console.log('[PornHub] Final metadata:', metadata);
        return metadata;
    }

    generatePornHubThumbUrls(viewkey) {
        const patterns = [];
        const servers = ['di', 'ci', 'ei'];
        
        // Different path structures based on viewkey format
        for (const server of servers) {
            // Try various directory structures
            // Pattern: /videos/XXX/XXX/XXX/viewkey/
            patterns.push(
                `https://${server}.phncdn.com/videos/${viewkey.substring(0,3)}/${viewkey.substring(3,6)}/${viewkey.substring(6,9)}/${viewkey}/(m=eaAaGwObaaaa)(mh=duMqLiRzu3GnRWKi)1.jpg`,
                `https://${server}.phncdn.com/videos/${viewkey.substring(0,3)}/${viewkey.substring(3,6)}/${viewkey.substring(6,9)}/${viewkey}/(m=eaAaGwObaaaa)1.jpg`,
            );
            
            // For viewkeys starting with numbers (like 696a7cb18a015)
            if (/^\d/.test(viewkey)) {
                patterns.push(
                    `https://${server}.phncdn.com/videos/${viewkey.substring(0,2)}/${viewkey.substring(2,4)}/${viewkey.substring(4,6)}/${viewkey}/(m=eaAaGwObaaaa)1.jpg`,
                );
            }
            
            // For viewkeys starting with 'ph'
            if (viewkey.startsWith('ph')) {
                const id = viewkey.substring(2);
                patterns.push(
                    `https://${server}.phncdn.com/videos/${id.substring(0,2)}/${id.substring(2,4)}/${id.substring(4,6)}/${viewkey}/(m=eaAaGwObaaaa)1.jpg`,
                );
            }
        }
        
        return patterns;
    }

    // XVideos - Enhanced
    async fetchXVideos(url, urlObj) {
        const match = urlObj.pathname.match(/video(\d+)/);
        const videoId = match ? match[1] : null;
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        // Try to fetch page for metadata
        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                if (meta.title) metadata.title = meta.title;
                if (meta.thumbnail) metadata.thumbnail = meta.thumbnail;
                if (meta.channel) metadata.channel = meta.channel;
                
                // Try to extract uploader
                const uploaderMatch = html.match(/setVideoUploader\s*\(\s*["']([^"']+)["']/);
                if (uploaderMatch) {
                    metadata.channel = uploaderMatch[1];
                }
            }
        } catch (e) {}

        // If no thumbnail, try CDN patterns
        if (!metadata.thumbnail) {
            const thumbPatterns = [
                `https://img-l3.xvideos-cdn.com/videos/thumbs169lll/${Math.floor(videoId / 1000000)}/${Math.floor((videoId % 1000000) / 1000)}/${videoId}/${videoId}.1.jpg`,
                `https://img-hw.xvideos-cdn.com/videos/thumbs169lll/${Math.floor(videoId / 1000000)}/${Math.floor((videoId % 1000000) / 1000)}/${videoId}/${videoId}.1.jpg`,
                `https://cdn-cf-east.xvideos-cdn.com/videos/thumbs169ll/${Math.floor(videoId / 1000000)}/${Math.floor((videoId % 1000000) / 1000)}/${videoId}/${videoId}.1.jpg`,
            ];
            
            for (const thumbUrl of thumbPatterns) {
                if (await this.validateThumbnail(thumbUrl)) {
                    metadata.thumbnail = thumbUrl;
                    break;
                }
            }
        }

        return metadata;
    }

    // XNXX
    async fetchXNXX(url, urlObj) {
        const match = urlObj.pathname.match(/video-([a-zA-Z0-9]+)/);
        const videoId = match ? match[1] : null;
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        // Try to fetch page
        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                Object.assign(metadata, meta);
            }
        } catch (e) {}

        if (!metadata.thumbnail) {
            metadata.thumbnail = `https://img-l3.xnxx-cdn.com/videos/thumbs169xnxxll/${videoId.substring(0,2)}/${videoId.substring(2,4)}/${videoId.substring(4,6)}.${videoId}/${videoId}.1.jpg`;
        }

        return metadata;
    }

    // xHamster
    async fetchXHamster(url, urlObj) {
        const match = urlObj.pathname.match(/videos\/([^\/]+)-(\d+)/);
        const videoSlug = match ? match[1] : null;
        const videoId = match ? match[2] : null;
        
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        // Extract title from slug
        if (videoSlug) {
            metadata.title = videoSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        // Try to fetch page
        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                if (meta.title) metadata.title = meta.title;
                if (meta.thumbnail) metadata.thumbnail = meta.thumbnail;
                if (meta.channel) metadata.channel = meta.channel;
            }
        } catch (e) {}

        // Thumbnail patterns
        if (!metadata.thumbnail) {
            const thumbPatterns = [
                `https://thumb-v-cl04.xhcdn.com/${videoId.substring(0, 3)}/${videoId}/1.jpg`,
                `https://thumb-v.xhcdn.com/${videoId.substring(0, 3)}/${videoId}/1.jpg`,
            ];
            
            for (const thumbUrl of thumbPatterns) {
                if (await this.validateThumbnail(thumbUrl)) {
                    metadata.thumbnail = thumbUrl;
                    break;
                }
            }
        }

        return metadata;
    }

    // RedTube
    async fetchRedTube(url, urlObj) {
        const match = urlObj.pathname.match(/(\d+)/);
        const videoId = match ? match[1] : null;
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                Object.assign(metadata, meta);
            }
        } catch (e) {}

        if (!metadata.thumbnail) {
            const paddedId = videoId.padStart(7, '0');
            metadata.thumbnail = `https://thumbs-vod.redtubefiles.com/${paddedId.substring(0, 4)}/${paddedId}/vl_240p_${paddedId}/vl_240p_${paddedId}_00001.jpg`;
        }

        return metadata;
    }

    // YouPorn
    async fetchYouPorn(url, urlObj) {
        const match = urlObj.pathname.match(/watch\/(\d+)/);
        const videoId = match ? match[1] : null;
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                Object.assign(metadata, meta);
            }
        } catch (e) {}

        return metadata;
    }

    // SpankBang
    async fetchSpankBang(url, urlObj) {
        const match = urlObj.pathname.match(/([a-zA-Z0-9]+)\/video/);
        const videoId = match ? match[1] : null;
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                Object.assign(metadata, meta);
            }
        } catch (e) {}

        if (!metadata.thumbnail) {
            metadata.thumbnail = `https://static.spankbang.com/p/${videoId}/thumb.jpg`;
        }

        return metadata;
    }

    // Eporner
    async fetchEporner(url, urlObj) {
        const match = urlObj.pathname.match(/video-([a-zA-Z0-9]+)/);
        const videoId = match ? match[1] : null;
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                Object.assign(metadata, meta);
            }
        } catch (e) {}

        if (!metadata.thumbnail) {
            metadata.thumbnail = `https://static.eporner.com/thumbs/${videoId}/800.jpg`;
        }

        return metadata;
    }

    // RedGifs
    async fetchRedGifs(url, urlObj) {
        const match = urlObj.pathname.match(/watch\/([a-zA-Z]+)/i);
        const videoId = match ? match[1].toLowerCase() : null;
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        // RedGifs has a public API
        try {
            const response = await fetch(`https://api.redgifs.com/v2/gifs/${videoId}`);
            const data = await response.json();
            
            if (data.gif) {
                metadata.title = data.gif.title || '';
                metadata.thumbnail = data.gif.urls?.poster || data.gif.urls?.thumbnail || '';
                metadata.channel = data.gif.userName || '';
                if (data.gif.duration) {
                    metadata.duration = this.formatDuration(data.gif.duration);
                }
            }
        } catch (e) {
            // Fallback to static thumbnail
            metadata.thumbnail = `https://thumbs44.redgifs.com/${videoId}-poster.jpg`;
        }

        return metadata;
    }

    // Streamable
    async fetchStreamable(url, urlObj) {
        const videoId = urlObj.pathname.split('/').filter(Boolean).pop();
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = {
            title: '',
            thumbnail: `https://cdn-cf-east.streamable.com/image/${videoId}.jpg`,
            duration: '',
            channel: 'Streamable'
        };

        try {
            const response = await fetch(`https://api.streamable.com/videos/${videoId}`);
            const data = await response.json();
            
            if (data) {
                metadata.title = data.title || '';
                if (data.thumbnail_url) metadata.thumbnail = data.thumbnail_url;
                if (data.duration) metadata.duration = this.formatDuration(data.duration);
            }
        } catch (e) {}

        return metadata;
    }

    // Dailymotion
    async fetchDailymotion(url, urlObj) {
        const match = urlObj.pathname.match(/video\/([a-zA-Z0-9]+)/);
        const videoId = match ? match[1] : null;
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = {
            title: '',
            thumbnail: `https://www.dailymotion.com/thumbnail/video/${videoId}`,
            duration: '',
            channel: ''
        };

        try {
            const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            if (data.title) metadata.title = data.title;
            if (data.author_name) metadata.channel = data.author_name;
            if (data.thumbnail_url) metadata.thumbnail = data.thumbnail_url;
        } catch (e) {}

        return metadata;
    }

    // Tube Network (HClips, HotMovs, Txxx, Upornia)
    async fetchTubeNetwork(url, urlObj) {
        const match = urlObj.pathname.match(/videos\/(\d+)/);
        const videoId = match ? match[1] : null;
        const hostname = urlObj.hostname.replace('www.', '');
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                Object.assign(metadata, meta);
            }
        } catch (e) {}

        if (!metadata.thumbnail) {
            metadata.thumbnail = `https://${hostname}/contents/videos_screenshots/${Math.floor(videoId / 1000) * 1000}/${videoId}/preview.jpg`;
        }

        return metadata;
    }

    // Motherless
    async fetchMotherless(url, urlObj) {
        const match = urlObj.pathname.match(/([A-Za-z0-9]+)$/);
        const videoId = match ? match[1] : null;
        if (!videoId || videoId.length < 5) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = { title: '', thumbnail: '', duration: '', channel: 'Motherless' };

        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                Object.assign(metadata, meta);
            }
        } catch (e) {}

        if (!metadata.thumbnail) {
            metadata.thumbnail = `https://cdn5-thumbs.motherlessmedia.com/thumbs/${videoId}-strip.jpg`;
        }

        return metadata;
    }

    // ThisVid
    async fetchThisVid(url, urlObj) {
        const match = urlObj.pathname.match(/videos\/([^\/]+)/);
        const videoSlug = match ? match[1] : null;
        if (!videoSlug) return { title: '', thumbnail: '', duration: '', channel: '' };

        const metadata = {
            title: videoSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            thumbnail: '',
            duration: '',
            channel: 'ThisVid'
        };

        try {
            const html = await this.fetchWithProxy(url);
            if (html) {
                const meta = this.extractMetaFromHtml(html);
                if (meta.title) metadata.title = meta.title;
                if (meta.thumbnail) metadata.thumbnail = meta.thumbnail;
            }
        } catch (e) {}

        return metadata;
    }

    // Beeg
    async fetchBeeg(url, urlObj) {
        const match = urlObj.pathname.match(/(\d+)/);
        const videoId = match ? match[1] : null;
        if (!videoId) return { title: '', thumbnail: '', duration: '', channel: '' };

        return {
            title: '',
            thumbnail: `https://img.beeg.com/960/${videoId}.jpg`,
            duration: '',
            channel: ''
        };
    }

    // SFM Compile - SFM/Blender 3D animations
    async fetchSFMCompile(url, urlObj) {
        const metadata = { title: '', thumbnail: '', duration: '', channel: 'SFM Compile' };
        const pathname = urlObj.pathname;

        // Check if it's a direct MP4 link
        if (pathname.endsWith('.mp4')) {
            // Extract title from filename: /wp-content/uploads/2026/02/Video-Name-Here.mp4
            const filename = pathname.split('/').pop().replace('.mp4', '');
            metadata.title = filename.replace(/-/g, ' ');
            
            // Try to generate thumbnail (they might use poster images)
            const thumbUrl = url.replace('.mp4', '.jpg');
            if (await this.validateThumbnail(thumbUrl)) {
                metadata.thumbnail = thumbUrl;
            }
            
            return metadata;
        }

        // It's a video page URL like /video-slug/
        try {
            const html = await this.fetchWithProxy(url);
            
            if (html) {
                // Extract title from h2 or og:title
                const titlePatterns = [
                    /<h2[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</i,
                    /<h1[^>]*>([^<]+)</i,
                    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
                    /<title>([^<]+)<\/title>/i,
                ];
                
                for (const pattern of titlePatterns) {
                    const match = html.match(pattern);
                    if (match && match[1]) {
                        metadata.title = this.decodeHtml(match[1])
                            .replace(/\s*[-|–]\s*SFM Compile.*$/i, '')
                            .trim();
                        if (metadata.title.length > 2) break;
                    }
                }

                // Extract video URL to get thumbnail
                const videoMatch = html.match(/https:\/\/sfmcompile\.club\/wp-content\/uploads\/[^"'\s]+\.mp4/i);
                if (videoMatch) {
                    // Store the direct video URL for playback
                    metadata.videoUrl = videoMatch[0];
                    
                    // Try poster image
                    const posterMatch = html.match(/poster=["']([^"']+)["']/i);
                    if (posterMatch) {
                        metadata.thumbnail = posterMatch[1];
                    }
                }

                // Extract thumbnail from og:image or featured image
                if (!metadata.thumbnail) {
                    const thumbPatterns = [
                        /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i,
                        /<img[^>]*class="[^"]*featured[^"]*"[^>]*src="([^"]+)"/i,
                        /data-src="([^"]+\.(?:jpg|png|webp))"/i,
                    ];
                    
                    for (const pattern of thumbPatterns) {
                        const match = html.match(pattern);
                        if (match && match[1]) {
                            metadata.thumbnail = match[1];
                            break;
                        }
                    }
                }

                // Extract category as additional info
                const categoryMatch = html.match(/in\s+([^<]+)<\/a>\s*<h2/i) || 
                                     html.match(/class="[^"]*category[^"]*"[^>]*>([^<]+)</i);
                if (categoryMatch) {
                    metadata.tags = categoryMatch[1].trim();
                }
            }
        } catch (e) {
            console.log('[SFMCompile] Fetch failed:', e);
        }

        // Fallback: extract title from URL slug
        if (!metadata.title) {
            const slug = pathname.split('/').filter(Boolean).pop();
            if (slug && slug !== 'wp-content') {
                metadata.title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            }
        }

        return metadata;
    }

    // Reddit - videos and gifs
    async fetchReddit(url, urlObj) {
        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };
        
        try {
            // Convert short URLs (redd.it) to full URLs
            let fullUrl = url;
            if (urlObj.hostname.includes('redd.it')) {
                // v.redd.it URLs need the reddit post URL
                // Try to get it from the referrer or construct it
                const videoId = urlObj.pathname.split('/').filter(Boolean)[0];
                if (videoId) {
                    metadata.videoId = videoId;
                }
            }
            
            // For reddit.com URLs, use the JSON API
            if (urlObj.hostname.includes('reddit.com')) {
                // Clean up URL and add .json
                let jsonUrl = url.split('?')[0];
                if (!jsonUrl.endsWith('/')) jsonUrl += '/';
                jsonUrl += '.json';
                
                try {
                    const response = await fetch(jsonUrl, {
                        headers: { 'Accept': 'application/json' }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        const post = data[0]?.data?.children[0]?.data;
                        
                        if (post) {
                            metadata.title = post.title || '';
                            metadata.channel = post.subreddit_name_prefixed || `r/${post.subreddit}` || '';
                            metadata.author = post.author || '';
                            
                            // Get thumbnail
                            if (post.preview?.images?.[0]?.source?.url) {
                                metadata.thumbnail = post.preview.images[0].source.url.replace(/&amp;/g, '&');
                            } else if (post.thumbnail && post.thumbnail.startsWith('http')) {
                                metadata.thumbnail = post.thumbnail;
                            }
                            
                            // Get video info
                            if (post.media?.reddit_video) {
                                const redditVideo = post.media.reddit_video;
                                metadata.videoUrl = redditVideo.fallback_url;
                                metadata.duration = this.formatDuration(redditVideo.duration);
                                metadata.isRedditVideo = true;
                            } else if (post.secure_media?.reddit_video) {
                                const redditVideo = post.secure_media.reddit_video;
                                metadata.videoUrl = redditVideo.fallback_url;
                                metadata.duration = this.formatDuration(redditVideo.duration);
                                metadata.isRedditVideo = true;
                            }
                            
                            // Check for embedded content (gfycat, redgifs, imgur, etc.)
                            if (post.url_overridden_by_dest) {
                                metadata.externalUrl = post.url_overridden_by_dest;
                            }
                            
                            // Reddit GIFs
                            if (post.url && post.url.includes('.gif')) {
                                metadata.videoUrl = post.url;
                                metadata.isGif = true;
                            }
                            
                            console.log('[Reddit] Extracted metadata:', metadata);
                        }
                    }
                } catch (e) {
                    console.log('[Reddit] JSON API failed:', e);
                }
            }
            
            // Fallback: try fetching via proxy
            if (!metadata.title) {
                const html = await this.fetchWithProxy(url);
                if (html) {
                    const meta = this.extractMetaFromHtml(html);
                    if (meta.title) metadata.title = meta.title.replace(/\s*:\s*\w+\s*$/, '');
                    if (meta.thumbnail) metadata.thumbnail = meta.thumbnail;
                }
            }
            
        } catch (e) {
            console.log('[Reddit] Fetch failed:', e);
        }
        
        return metadata;
    }

    // Generic noembed fallback
    async fetchNoembed(url) {
        const metadata = { title: '', thumbnail: '', duration: '', channel: '' };

        try {
            const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.title) metadata.title = data.title;
            if (data.thumbnail_url) metadata.thumbnail = data.thumbnail_url;
            if (data.author_name) metadata.channel = data.author_name;
        } catch (e) {}

        // If noembed fails, try fetching with proxy
        if (!metadata.title && !metadata.thumbnail) {
            try {
                const html = await this.fetchWithProxy(url);
                if (html) {
                    const meta = this.extractMetaFromHtml(html);
                    Object.assign(metadata, meta);
                }
            } catch (e) {}
        }

        return metadata;
    }

    formatDuration(seconds) {
        if (!seconds) return '';
        seconds = Math.floor(seconds);
        
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    extractTitleFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const parts = pathname.split('/').filter(Boolean);
            
            for (let i = parts.length - 1; i >= 0; i--) {
                let part = parts[i];
                
                if (/^(video|watch|view|embed|v|id)s?$/i.test(part)) continue;
                if (/^[\d]+$/.test(part) && part.length < 12) continue;
                if (part.length < 5) continue;
                
                part = part.replace(/\.(html|htm|php|aspx?|mp4|webm|avi)$/i, '');
                part = part.replace(/[-_][a-z0-9]{6,12}$/i, '');
                
                if (/[a-zA-Z]{3,}/.test(part)) {
                    return part
                        .replace(/[-_+]/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .split(' ')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ');
                }
            }
        } catch (e) {}
        return '';
    }

    getSiteName(url) {
        try {
            const hostname = new URL(url).hostname.toLowerCase().replace('www.', '');
            const parts = hostname.split('.');
            if (parts.length >= 2) {
                const name = parts[parts.length - 2];
                // Capitalize properly
                const siteNames = {
                    'pornhub': 'PornHub',
                    'xvideos': 'XVideos',
                    'xnxx': 'XNXX',
                    'xhamster': 'xHamster',
                    'redtube': 'RedTube',
                    'youporn': 'YouPorn',
                    'spankbang': 'SpankBang',
                    'eporner': 'Eporner',
                    'redgifs': 'RedGifs',
                    'youtube': 'YouTube',
                    'vimeo': 'Vimeo',
                    'dailymotion': 'Dailymotion',
                    'streamable': 'Streamable',
                    'motherless': 'Motherless',
                    'beeg': 'Beeg',
                    'thisvid': 'ThisVid',
                    'hclips': 'HClips',
                    'txxx': 'Txxx',
                    'hotmovs': 'HotMovs',
                    'upornia': 'Upornia'
                };
                return siteNames[name] || name.charAt(0).toUpperCase() + name.slice(1);
            }
        } catch (e) {}
        return 'Unknown';
    }
}

// Global instance
const metadataFetcher = new MetadataFetcher();
