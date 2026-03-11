const https = require('https');

https.get('https://www.climatempo.com.br/', (res) => {
    let raw = '';
    res.on('data', d => raw += d);
    res.on('end', () => {
        // Find autocomplete URL
        const matches = raw.match(/https:\/\/.*busca.*/g) || [];
        console.log("AutoComplete matches:", matches);
    });
});
