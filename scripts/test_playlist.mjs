
async function run() {
    try {
        const fetch = await import('node-fetch').then(m => m.default).catch(() => global.fetch);

        // Test Playlist Details
        console.log("\n--- Playlist Details ---");
        const res = await fetch('http://localhost:3000/api/saavn/api.php?__call=playlist.getDetails&listid=158054216&_format=json');
        const data = await res.json();
        if (data.songs) {
            console.log("Playlist Name:", data.title || data.listname);
            console.log("Track Count:", data.songs.length);
            if (data.songs.length > 0) {
                console.log("First Song Keys:", Object.keys(data.songs[0]));
                // console.log("First Song:", JSON.stringify(data.songs[0], null, 2));
            }
        } else {
            console.log("No songs found");
        }

    } catch (e) {
        console.error(e);
    }
}

run();
