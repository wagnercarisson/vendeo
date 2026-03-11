const https = require('https');

const city = 'Ibirama SC';
const searchUrl = `https://www.climatempo.com.br/busca/tempo-e-temperatura?q=${encodeURIComponent(city)}`;
console.log("Fetching", searchUrl);

https.get(searchUrl, (res) => {
    let raw = '';
    res.on('data', d => raw += d);
    res.on('end', () => {
        // search for links like /previsao-do-tempo/cidade/\d+/.*
        const matches = raw.match(/\/previsao-do-tempo\/cidade\/\d+\/[a-z0-9\-]+/g);
        console.log("Found matches:", Array.from(new Set(matches)));
    });
}).on('error', e => console.error(e));
