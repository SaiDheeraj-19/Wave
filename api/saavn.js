
export default async function handler(req, res) {
    try {
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const query = searchParams.toString();

        // Construct the target URL with original query parameters
        const targetUrl = `https://www.jiosaavn.com/api.php?${query}`;

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.jiosaavn.com/',
                'Origin': 'https://www.jiosaavn.com'
            }
        });

        if (!response.ok) {
            throw new Error(`Upstream API failed with status: ${response.status}`);
        }

        const data = await response.json();

        // Forward the response
        res.status(200).json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Failed to fetch data from Saavn API' });
    }
}
