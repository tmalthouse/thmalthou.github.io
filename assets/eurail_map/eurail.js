var map = L.map('map').setView([49.5, 9.5], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

async function load_paths() {
    try {
        const response = await fetch('/assets/eurail_map/eurail_path.geojson');
        const data = await response.text();

        var railpath = JSON.parse(data);

        L.geoJSON(railpath).addTo(map);
        return data;
    } catch (error) {
        return null;
    }
}

data = load_paths();


