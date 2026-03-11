async function test() {
    try {
        const query = encodeURIComponent(`site:climatempo.com.br/previsao-do-tempo/cidade "Ibirama" "SC"`);
        const res = await fetch('https://lite.duckduckgo.com/lite/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `q=${query}`
        });
        const html = await res.text();
        const parseMatch = html.match(/(https:\/\/www\.climatempo\.com\.br\/previsao-do-tempo\/cidade\/\d+\/[a-z0-9\-]+)/);
        console.log("Found:", parseMatch ? parseMatch[1] : "Not found");
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
test();
