
import { Track } from '../types';
import { decryptUrl } from '../utils/saavnDecrypt';

interface SaavnSong {
    id: string;
    title: string;
    image: string;
    album: string;
    url: string;
    music?: string;
    description?: string;
    more_info: {
        primary_artists?: string; // Autocomplete specific
        artistMap?: {
            primary_artists: Array<{ name: string }>;
        };
        vlink?: string;
        encrypted_media_url?: string;
        album_url?: string;
        duration?: string;
    };
}


const mapSongToTrack = (song: any): Track => {
    const artist = song.more_info?.artistMap?.primary_artists?.[0]?.name
        || (typeof song.more_info?.primary_artists === 'string' ? song.more_info.primary_artists : null)
        || song.primary_artists
        || song.music
        || (Array.isArray(song.more_info?.primary_artists) ? song.more_info.primary_artists[0]?.name : null)
        || "Unknown Artist";

    let audioUrl = '';
    const encryptedMediaUrl = song.encrypted_media_url || song.more_info?.encrypted_media_url || song.more_info?.vlink;

    if (encryptedMediaUrl) {
        audioUrl = decryptUrl(encryptedMediaUrl);
        if (audioUrl && audioUrl.startsWith('http:')) {
            audioUrl = audioUrl.replace('http:', 'https:');
        }
    }

    return {
        id: song.id || song.songid || song.pid || '',
        title: (song.title || song.song || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
        artist: String(artist).replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
        album: (song.album || song.more_info?.album || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
        artwork: (song.image || '').replace('50x50', '500x500').replace('150x150', '500x500'),
        duration: parseInt(song.duration || song.more_info?.duration || '0'),
        audioUrl: audioUrl,
        isHiRes: true,
        isDownloaded: false,
        format: 'AAC',
        language: song.language || song.more_info?.language || ''
    };
};

export const getHomePageData = async () => {
    try {
        const [chartsRes, trendingRes] = await Promise.all([
            fetch('/api/saavn/api.php?__call=content.getCharts&api_version=4&_format=json&ctx=web6dot0'),
            fetch('/api/saavn/api.php?__call=content.getTrending&api_version=4&_format=json&ctx=web6dot0')
        ]);

        const charts = await chartsRes.json();
        const trending = await trendingRes.json();

        const allowedLanguages = ['english', 'hindi', 'telugu', 'tamil'];
        const unwantedTerms = ['punjabi', 'bhojpuri', 'haryanvi'];

        const filterSongs = (songs: any[]) => {
            return songs.filter(song => {
                const lang = (song.language || '').toLowerCase();
                return allowedLanguages.includes(lang) || lang === '';
            });
        };

        const filterCharts = (charts: any[]) => {
            return charts.filter(chart => {
                const title = (chart.title || '').toLowerCase();
                const language = (chart.language || '').toLowerCase();

                // Check for explicit unwanted terms
                if (unwantedTerms.some(term => title.includes(term))) return false;

                // Check if it matches allowed languages or is generic 'global'/'india'
                const isAllowed = allowedLanguages.some(lang => title.includes(lang) || language.includes(lang));
                const isGeneric = title.includes('global') || title.includes('top 50') || title.includes('superhits');

                return isAllowed || isGeneric;
            });
        };

        return {
            charts: Array.isArray(charts) ? filterCharts(charts) : [],
            trending: {
                songs: filterSongs(trending.songs || []).map(mapSongToTrack),
                albums: (trending.albums || [])
            }
        };
    } catch (error) {
        console.error("Failed to get cloud data:", error);
        return { charts: [], trending: { songs: [], albums: [] } };
    }
};

export const getPlaylistDetails = async (id: string): Promise<Track[]> => {
    try {
        const response = await fetch(`/api/saavn/api.php?__call=playlist.getDetails&listid=${id}&_format=json`);
        const data = await response.json();

        // In playlist details, 'songs' or 'list' contains the tracks
        const songs = data.songs || data.list || [];
        return songs.map(mapSongToTrack);
    } catch (error) {
        console.error("Failed to get playlist details:", error);
        return [];
    }
};

export const getAlbumDetails = async (id: string): Promise<Track[]> => {
    try {
        const response = await fetch(`/api/saavn/api.php?__call=content.getAlbumDetails&albumid=${id}&_format=json`);
        const data = await response.json();

        const songs = data.songs || data.list || [];
        return songs.map(mapSongToTrack);
    } catch (error) {
        console.error("Failed to get album details:", error);
        return [];
    }
};

export const searchTracks = async (query: string): Promise<Track[]> => {
    try {
        const response = await fetch(`/api/saavn/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data.songs?.data) return [];

        return data.songs.data.map(mapSongToTrack);
    } catch (error) {
        console.error("Failed search:", error);
        return [];
    }
};

export const searchSongs = async (query: string, count: number = 50): Promise<Track[]> => {
    try {
        const response = await fetch(`/api/saavn/api.php?__call=search.getResults&q=${encodeURIComponent(query)}&n=${count}&p=1&_format=json&_marker=0`);
        const data = await response.json();
        return (data.results || []).map(mapSongToTrack);
    } catch (error) {
        console.error("Failed song search:", error);
        return [];
    }
};

export const getTrackDetails = async (id: string): Promise<Track | null> => {
    try {
        const response = await fetch(`/api/saavn/api.php?__call=song.getDetails&pids=${id}&_format=json`);
        const data = await response.json();

        // Robust data extraction: Try exact ID, then fallback to first value
        let songData = null;
        if (data[id]) {
            songData = data[id];
        } else if (Array.isArray(data)) {
            songData = data[0];
        } else if (typeof data === 'object' && data !== null) {
            songData = Object.values(data)[0];
        }

        if (!songData) return null;
        return mapSongToTrack(songData);

    } catch (error) {
        console.error("Failed to get track details:", error);
        return null;
    }
};

export const searchPlaylists = async (query: string): Promise<any[]> => {
    try {
        const response = await fetch(`/api/saavn/api.php?__call=search.getPlaylistResults&q=${encodeURIComponent(query)}&n=20&p=1&_format=json&_marker=0`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Failed search:", error);
        return [];
    }
};

export const searchAll = async (query: string) => {
    try {
        const response = await fetch(`/api/saavn/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`);
        const data = await response.json();

        const songs = data.songs?.data?.map(mapSongToTrack) || [];
        const albums = data.albums?.data?.map((al: any) => ({
            id: al.id,
            title: al.title.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            artist: al.music || al.more_info?.music || "Various Artists",
            image: al.image.replace('50x50', '500x500').replace('150x150', '500x500')
        })) || [];
        const playlists = data.playlists?.data?.map((pl: any) => ({
            id: pl.id,
            title: pl.title.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            image: pl.image
        })) || [];

        // Enhance Artist Search: If autocomplete is thin on artists, try a dedicated artist search
        let artists = data.artists?.data?.map((ar: any) => ({
            id: ar.id,
            title: (ar.title || ar.name || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            image: (ar.image || '').replace('50x50', '500x500').replace('150x150', '500x500'),
            description: ar.description || ar.role || 'Artist'
        })) || [];

        if (artists.length === 0) {
            try {
                const artistRes = await fetch(`/api/saavn/api.php?__call=search.getArtistResults&q=${encodeURIComponent(query)}&n=10&_format=json`);
                const artistData = await artistRes.json();
                if (artistData.results) {
                    artists = artistData.results.map((ar: any) => ({
                        id: ar.id,
                        title: ar.name.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
                        image: ar.image.replace('50x50', '500x500').replace('150x150', '500x500'),
                        description: ar.role || 'Artist'
                    }));
                }
            } catch (err) {
                console.warn("Dedicated artist search failed", err);
            }
        }

        return {
            topResult: songs[0] || null,
            songs,
            albums,
            playlists,
            artists
        };
    } catch (error) {
        console.error("Failed search all:", error);
        return { topResult: null, songs: [], albums: [], playlists: [], artists: [] };
    }
};

export const getLyrics = async (id: string): Promise<string | null> => {
    try {
        const response = await fetch(`/api/saavn/api.php?__call=lyrics.getLyrics&lyrics_id=${id}&_format=json`);
        const data = await response.json();
        return data.lyrics || null;
    } catch (error) {
        console.error("Failed to get lyrics:", error);
        return null;
    }
};

export const getRecommendations = async (id: string): Promise<Track[]> => {
    try {
        const response = await fetch(`/api/saavn/api.php?__call=reco.getreco&pid=${id}&_format=json&ctx=web6dot0`);
        const data = await response.json();
        return (data || []).map(mapSongToTrack);
    } catch (error) {
        console.error("Failed to get recommendations:", error);
        return [];
    }
};

// Helper to get playlist tracks (reusing getPlaylistDetails but typing as any for flexibility if needed)
export const getInternalPlaylistDetails = async (id: string) => {
    return getPlaylistDetails(id);
};
