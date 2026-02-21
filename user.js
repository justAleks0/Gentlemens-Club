// Gentlemen's Club - User System (Favorites & Playlists)

class UserSystem {
    constructor() {
        this.loadData();
    }

    loadData() {
        this.favorites = JSON.parse(localStorage.getItem('gentlemensclub_favorites')) || [];
        this.playlists = JSON.parse(localStorage.getItem('gentlemensclub_playlists')) || [];
        this.watchHistory = JSON.parse(localStorage.getItem('gentlemensclub_history')) || [];
        this.watchLater = JSON.parse(localStorage.getItem('gentlemensclub_watchlater')) || [];
        this.subscriptions = JSON.parse(localStorage.getItem('gentlemensclub_subscriptions')) || [];
    }

    save() {
        localStorage.setItem('gentlemensclub_favorites', JSON.stringify(this.favorites));
        localStorage.setItem('gentlemensclub_playlists', JSON.stringify(this.playlists));
        localStorage.setItem('gentlemensclub_history', JSON.stringify(this.watchHistory));
        localStorage.setItem('gentlemensclub_watchlater', JSON.stringify(this.watchLater));
        localStorage.setItem('gentlemensclub_subscriptions', JSON.stringify(this.subscriptions));
    }

    // Subscriptions (Channels/Creators/Artists)
    isSubscribed(channelName) {
        return this.subscriptions.some(s => s.name.toLowerCase() === channelName.toLowerCase());
    }
    
    getSubscription(channelName) {
        return this.subscriptions.find(s => s.name.toLowerCase() === channelName.toLowerCase());
    }
    
    getSubscriptionById(id) {
        return this.subscriptions.find(s => s.id === id);
    }

    subscribe(channelName, siteHostname) {
        if (!channelName || this.isSubscribed(channelName)) return false;
        
        this.subscriptions.unshift({
            id: Date.now().toString(),
            name: channelName,
            site: siteHostname || 'unknown',
            type: 'channel',
            profileUrl: '',
            avatarUrl: '',
            notes: '',
            subscribedAt: new Date().toISOString()
        });
        this.save();
        return true;
    }
    
    addCreator(creatorData) {
        if (!creatorData.name || this.isSubscribed(creatorData.name)) return false;
        
        this.subscriptions.unshift({
            id: Date.now().toString(),
            name: creatorData.name,
            site: creatorData.site || 'unknown',
            type: creatorData.type || 'creator',
            profileUrl: creatorData.profileUrl || '',
            avatarUrl: creatorData.avatarUrl || '',
            notes: creatorData.notes || '',
            subscribedAt: new Date().toISOString()
        });
        this.save();
        return true;
    }
    
    updateCreator(id, creatorData) {
        const creator = this.subscriptions.find(s => s.id === id);
        if (!creator) return false;
        
        if (creatorData.name) creator.name = creatorData.name;
        if (creatorData.site !== undefined) creator.site = creatorData.site;
        if (creatorData.type !== undefined) creator.type = creatorData.type;
        if (creatorData.profileUrl !== undefined) creator.profileUrl = creatorData.profileUrl;
        if (creatorData.avatarUrl !== undefined) creator.avatarUrl = creatorData.avatarUrl;
        if (creatorData.notes !== undefined) creator.notes = creatorData.notes;
        
        this.save();
        return true;
    }

    unsubscribe(channelName) {
        this.subscriptions = this.subscriptions.filter(
            s => s.name.toLowerCase() !== channelName.toLowerCase()
        );
        this.save();
    }
    
    removeCreatorById(id) {
        this.subscriptions = this.subscriptions.filter(s => s.id !== id);
        this.save();
    }

    toggleSubscription(channelName, siteHostname) {
        if (this.isSubscribed(channelName)) {
            this.unsubscribe(channelName);
            return false;
        } else {
            this.subscribe(channelName, siteHostname);
            return true;
        }
    }

    getSubscriptions() {
        return this.subscriptions;
    }
    
    getCreatorsByType(type) {
        return this.subscriptions.filter(s => s.type === type);
    }

    // Favorites
    isFavorite(videoId) {
        return this.favorites.includes(videoId);
    }

    toggleFavorite(videoId) {
        if (this.isFavorite(videoId)) {
            this.favorites = this.favorites.filter(id => id !== videoId);
        } else {
            this.favorites.unshift(videoId);
        }
        this.save();
        return this.isFavorite(videoId);
    }

    getFavorites() {
        return this.favorites;
    }

    // Watch Later
    isInWatchLater(videoId) {
        return this.watchLater.includes(videoId);
    }

    toggleWatchLater(videoId) {
        if (this.isInWatchLater(videoId)) {
            this.watchLater = this.watchLater.filter(id => id !== videoId);
        } else {
            this.watchLater.unshift(videoId);
        }
        this.save();
        return this.isInWatchLater(videoId);
    }

    getWatchLater() {
        return this.watchLater;
    }

    // Watch History
    addToHistory(videoId) {
        this.watchHistory = this.watchHistory.filter(id => id !== videoId);
        this.watchHistory.unshift(videoId);
        if (this.watchHistory.length > 100) {
            this.watchHistory = this.watchHistory.slice(0, 100);
        }
        this.save();
    }

    getHistory() {
        return this.watchHistory;
    }

    clearHistory() {
        this.watchHistory = [];
        this.save();
    }
    
    // Clear Watch Later
    clearWatchLater() {
        this.watchLater = [];
        this.save();
    }
    
    // Clear Favorites
    clearFavorites() {
        this.favorites = [];
        this.save();
    }
    
    // Clear Playlists
    clearPlaylists() {
        this.playlists = [];
        this.save();
    }

    // Playlists
    createPlaylist(name, description = '') {
        const playlist = {
            id: Date.now().toString(),
            name,
            description,
            videos: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.playlists.unshift(playlist);
        this.save();
        return playlist;
    }

    getPlaylist(playlistId) {
        return this.playlists.find(p => p.id === playlistId);
    }

    getAllPlaylists() {
        return this.playlists;
    }

    updatePlaylist(playlistId, updates) {
        const index = this.playlists.findIndex(p => p.id === playlistId);
        if (index !== -1) {
            this.playlists[index] = {
                ...this.playlists[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save();
            return this.playlists[index];
        }
        return null;
    }

    deletePlaylist(playlistId) {
        this.playlists = this.playlists.filter(p => p.id !== playlistId);
        this.save();
    }

    addToPlaylist(playlistId, videoId) {
        const playlist = this.getPlaylist(playlistId);
        if (playlist && !playlist.videos.includes(videoId)) {
            playlist.videos.unshift(videoId);
            playlist.updatedAt = new Date().toISOString();
            this.save();
            return true;
        }
        return false;
    }

    removeFromPlaylist(playlistId, videoId) {
        const playlist = this.getPlaylist(playlistId);
        if (playlist) {
            playlist.videos = playlist.videos.filter(id => id !== videoId);
            playlist.updatedAt = new Date().toISOString();
            this.save();
            return true;
        }
        return false;
    }

    isInPlaylist(playlistId, videoId) {
        const playlist = this.getPlaylist(playlistId);
        return playlist ? playlist.videos.includes(videoId) : false;
    }

    getPlaylistsContaining(videoId) {
        return this.playlists.filter(p => p.videos.includes(videoId));
    }
}

// Global user instance
const user = new UserSystem();
