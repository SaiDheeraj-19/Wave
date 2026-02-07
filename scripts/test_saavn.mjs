
// Native fetch is available correctly in Node 18+

async function run() {
    try {
        const res = await fetch('http://localhost:3000/api/saavn/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=believer');
        const data = await res.json();

        console.log("=== SONGS DATA SAMPLE ===");
        if (data.songs && data.songs.data && data.songs.data.length > 0) {
            console.log(JSON.stringify(data.songs.data[0], null, 2));
            const firstSong = data.songs.data[0];

            // Test detail fetch if song exists
            const id = firstSong.id;
            const res2 = await fetch(`http://localhost:3000/api/saavn/api.php?__call=song.getDetails&pids=${id}&_format=json`);
            const data2 = await res2.json();
            console.log("\n=== SONG DETAILS SAMPLE ===");
            console.log(JSON.stringify(data2[id], null, 2));
        } else {
            console.log("No songs found");
        }

    } catch (e) {
        console.error(e);
    }
}

run();
