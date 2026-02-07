
async function run() {
    try {
        const fetch = await import('node-fetch').then(m => m.default).catch(() => global.fetch);

        // Test Trending
        console.log("\n--- Trending ---");
        const res = await fetch('http://localhost:3000/api/saavn/api.php?__call=content.getTrending&api_version=4&_format=json&_marker=0&ctx=web6dot0');
        // It might return a redirect or weird format, let's check text first
        const text = await res.text();
        console.log(text.substring(0, 500));

        try {
            const data = JSON.parse(text);
            if (data.songs) console.log("Trending Songs:", data.songs.length);
            if (data.albums) console.log("Trending Albums:", data.albums.length);
        } catch (e) {
            console.log("Not JSON");
        }

    } catch (e) {
        console.error(e);
    }
}

run();
