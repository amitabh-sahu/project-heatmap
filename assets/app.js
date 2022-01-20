mapboxgl.accessToken = 'pk.eyJ1IjoiYW1pdGFiaDEyIiwiYSI6ImNrcm5pc2lhOTF3aHgyd3B2OGRqMWJuMW4ifQ.gQ77bomCKIRMeLSqTR7a6w';
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    'zoom': 1.5,
    'center': [30, 18]
});

function checkSource(target) {
    return target['source'] == 'countryGeo';
}

map.on('load', () => {
    map.getCanvas().style.cursor = 'default';
    let cases = ['0-1000', '1000-2000', '2000-5000', '5000-10000', '10000-20000', '20000-50000', '50000-100000', '100000+'];
    let colors = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800000'];

    for (i = 0; i < cases.length; i++) {
        let item = document.createElement('div');
        let key = document.createElement('span');
        let value = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = colors[i];
        value.innerHTML = cases[i];
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
    }

    map.addSource('countryGeo', {
        'type': 'geojson',
        'data': './assets/countries.geojson'
    });

    fetch('https://corona.lmao.ninja/v3/covid-19/countries').then(response => response.json()).then(data => {
        data.forEach(element => {
            let iso3 = element['countryInfo']['iso3'];
            let countryColer;
            let details = {
                'country': element['country'],
                'population': element['population'],
                'cases': element['cases'],
                'recovered': element['recovered'],
                'deaths': element['deaths']
            };

            if (element['cases'] <= 1000) {
                countryColer = colors[0];
            }
            else if (element['cases'] > 1000 && element['cases'] <= 2000) {
                countryColer = colors[1];
            }
            else if (element['cases'] > 2000 && element['cases'] <= 5000) {
                countryColer = colors[2];
            }
            else if (element['cases'] > 5000 && element['cases'] <= 10000) {
                countryColer = colors[3];
            }
            else if (element['cases'] > 10000 && element['cases'] <= 20000) {
                countryColer = colors[4];
            }
            else if (element['cases'] > 20000 && element['cases'] <= 50000) {
                countryColer = colors[5];
            }
            else if (element['cases'] > 50000 && element['cases'] <= 100000) {
                countryColer = colors[6];
            }
            else if (element['cases'] > 100000) {
                countryColer = colors[7];
            }

            if (iso3) {
                map.addLayer({
                    'id': iso3,
                    'type': 'fill',
                    'source': 'countryGeo',
                    'metadata': details,
                    'filter': ['==', ['get', 'ISO_A3'], iso3],
                    'paint': {
                        'fill-outline-color': '#000',
                        'fill-color': countryColer,
                        'fill-opacity': 0.8
                    }
                }, 'road-label');
            }
        });
        document.querySelector(`.overlay`).style.display = 'block';
    });

    map.on('mousemove', function (e) {
        let target = map.queryRenderedFeatures(e.point).filter(checkSource);
        let features = document.getElementById(`features`);
        
        if (target.length > 0) {
            let details = target[0]['layer']['metadata'];
            features.innerHTML = `<h2>${details['country']}</h2>
                                    <p>Population: ${details['population']}</p>
                                    <p>Cases: ${details['cases']}</p>
                                    <p>Recovered: ${details['recovered']}</p>
                                    <p>Deaths: ${details['deaths']}</p>`;
        } else {
            features.innerHTML = '<h2>Hover over country to get details!</h2>';
        }
    });
});