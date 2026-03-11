async function testHGBrasil() {
    try {
        const query = encodeURIComponent("Ibirama,SC");
        console.log("Fetching: ", `https://api.hgbrasil.com/weather?format=json-cors&city_name=${query}`);
        const res = await fetch(`https://api.hgbrasil.com/weather?format=json-cors&city_name=${query}`);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
testHGBrasil();
