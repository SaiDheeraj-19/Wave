
async function run() {
    try {
        const fetch = await import('node-fetch').then(m => m.default).catch(() => global.fetch);

        // Test 1: Modules (Home Page)
        console.log("\n--- Modules ---");
        const res1 = await fetch('http://localhost:3000/api/saavn/api.php?__call=content.getModules&_format=json&_marker=0&ctx=web6dot0');
        const data1 = await res1.json();
        console.log(Object.keys(data1));
        if (data1.new_trending) console.log("New Trending Keys:", Object.keys(data1.new_trending));
        if (data1.charts) console.log("Charts Keys:", Object.keys(data1.charts));

        // Test 2: Top Charts
        console.log("\n--- Charts ---");
        const res2 = await fetch('http://localhost:3000/api/saavn/api.php?__call=content.getCharts&api_version=4&_format=json&_marker=0&ctx=web6dot0');
        const data2 = await res2.json();
        console.log(JSON.stringify(data2).substring(0, 200));

        // Test 3: Playlist Search (Backup)
        console.log("\n--- Playlist Search 'Top' ---");
        const res3 = await fetch('http://localhost:3000/api/saavn/api.php?__call=search.getPlaylistResults&q=Top&p=1&n=5&_format=json&_marker=0');
        const data3 = await res3.json();
        if (data3.results) console.log("Found playlists:", data3.results.length);

    } catch (e) {
        console.error(e);
    }
}

run();
