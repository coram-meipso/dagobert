export const config = { runtime: 'edge' };

export default async function handler(req) {
    const { ticker, module: mod } = Object.fromEntries(new URL(req.url).searchParams);
    
    if (!ticker) {
        return new Response(JSON.stringify({ error: 'ticker parameter required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const module = mod || 'calendarEvents';
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${module}`;

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://finance.yahoo.com/',
                'Origin': 'https://finance.yahoo.com'
            }
        });

        const data = await res.text();

        return new Response(data, {
            status: res.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, s-maxage=3600'
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
