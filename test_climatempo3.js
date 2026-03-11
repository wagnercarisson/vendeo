async function test() {
    try {
        const city = "Ibirama SC";
        const res = await fetch(`https://www.climatempo.com.br/busca/tempo-e-temperatura?q=${encodeURIComponent(city)}`);
        const text = await res.text();
        const matches = text.match(/\/previsao-do-tempo\/cidade\/\d+\/[a-z0-9\-]+/g);
        console.log("Found:", Array.from(new Set(matches)));
    } catch(e) {
        console.error(e);
    }
}
test();
