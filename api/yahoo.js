export const config = { runtime: 'edge' };

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://finance.yahoo.com/',
    'Origin': 'https://finance.yahoo.com'
};

async function getCrumb() {
    // Step 1: Get session cookie from Yahoo Finance
    const cookieRes = await fetch('https://finance.yahoo.com/', { headers: HEADERS });
    const setCookie = cookieRes.headers.get('set-cookie') || '';
    // Extract first cookie value
    const cookie = setCookie.split(',').map(c => c.split(';')[0].trim()).filter(c => c.includes('=')).join('; ');

    // Step 2: Get crumb using the cookie
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
        headers: { ...HEADERS, 'Cookie': cookie }
    });
    const crumb = await crumbRes.text();
    return { crumb: crumb.trim(), cookie };
}

export default async function handler(req) {
    const { ticker } = Object.fromEntries(new URL(req.url).searchParams);

    if (!ticker) {
        return new Response(JSON.stringify({ error: 'ticker parameter required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    try {
        const { crumb, cookie } = await getCrumb();

        const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=calendarEvents&crumb=${encodeURIComponent(crumb)}`;

        const res = await fetch(url, {
            headers: { ...HEADERS, 'Cookie': cookie }
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
