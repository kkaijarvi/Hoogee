let currentLang = 'fi';
let pageData = null;

const ui = {
    fi: { mottoT: "HOOGEESSA ON", mottoB: "HYVÄ OLLA", nextM: "SEURAAVA OTTELU", weather: "SÄÄ", news: "AJANKOHTAISTA", results: "TULOKSET", welcome: "TERVETULOA", report: "OTTELURAPORTTI", fields: "KOTIKENTÄT", drift: "DRIFT SHOP", driftSub: "Käytetyt varusteet", cta: "TULE MUKAAN", tactics: "PÄIVÄN TAKTIIKKA" },
    se: { mottoT: "I HOOGEE ÄR DET", mottoB: "GOTT ATT VARA", nextM: "NÄSTA MATCH", weather: "VÄDER", news: "AKTUELLT", results: "RESULTAT", welcome: "VÄLKOMMEN", report: "MATCHRAPPORT", fields: "HEMMAPLANER", drift: "DRIFT SHOP", driftSub: "Begagnad utrustning", cta: "KOM MED", tactics: "DAGENS TAKTIK" }
};

async function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    const t = ui[lang];
    document.getElementById('motto-top').innerText = t.mottoT;
    document.getElementById('motto-bottom').innerText = t.mottoB;
    document.getElementById('h3-next-match').innerText = t.nextM;
    document.getElementById('h3-weather').innerText = t.weather;
    document.getElementById('h3-news').innerText = t.news;
    document.getElementById('h3-results').innerText = t.results;
    document.getElementById('h3-welcome').innerText = t.welcome;
    document.getElementById('h3-report').innerText = t.report;
    document.getElementById('h3-fields').innerText = t.fields;
    document.getElementById('h3-drift').innerText = t.drift;
    document.getElementById('drift-sub').innerText = t.driftSub;
    document.getElementById('cta-text').innerText = t.cta;
    if(document.getElementById('h3-tactics')) document.getElementById('h3-tactics').innerText = t.tactics;

    await loadData();
}

async function loadData() {
    try {
        const res = await fetch(`data-${currentLang}.json?v=${Date.now()}`);
        pageData = await res.json();
        
        // Seuraava peli ja paikka (Etsitään JSONista)
        const peli = pageData.config.seuraavaPeli;
        document.getElementById('game-label').innerText = "HooGee vs " + peli.vastustaja;
        // Jos JSONissa ei ole 'paikka' kenttää, käytetään oletusta 'Matinkylä'
        document.getElementById('game-venue').innerText = peli.paikka || "Matinkylä TN 1";

        // Tervetuloa ja Taktiikka
        document.getElementById('welcome-p1').innerText = pageData.welcomeText1;
        document.getElementById('tactics-text').innerText = pageData.tacticsText;
        
        // Raportti
        const rpt = pageData.config.latestReport;
        const txt = typeof rpt === 'object' ? rpt.text : rpt;
        document.getElementById('report-preview').innerText = txt.substring(0, 90) + "...";
        
        // Listat
        document.getElementById('results-list').innerHTML = pageData.config.tulokset.map(r => `<div>${r.peli} <strong style="float:right">${r.tulos}</strong></div>`).join('');
        document.getElementById('news-list').innerHTML = pageData.config.events.map(e => `<div><b>${e.pvm}</b> ${e.nimi}</div>`).join('');
        document.getElementById('partner-logos').innerHTML = pageData.config.kumppanit.map(p => `<img src="${p.logo}" style="height:40px; margin-left:15px;">`).join('');
        
        startTimer(peli.aika);
        fetchWeather();
    } catch(e) { console.error("Data error"); }
}

function startTimer(target) {
    const el = document.getElementById('timer');
    function update() {
        const diff = new Date(target) - new Date();
        if (diff <= 0) { el.innerText = "LIVE"; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        el.innerText = `${d}pv ${h}h`;
    }
    update(); setInterval(update, 60000);
}

function openModal(id) {
    const body = document.getElementById('modalBody');
    let content = "";

    if (id === 'tervetuloa') {
        content = `<h2>Tule mukaan toimintaan!</h2>
            <form class="reg-form" onsubmit="event.preventDefault(); alert('Kiitos! Olemme yhteydessä.'); closeModal();">
                <input type="text" placeholder="Pelaajan nimi" required>
                <input type="number" placeholder="Syntymävuosi" required>
                <input type="email" placeholder="Huoltajan sähköposti" required>
                <button type="submit" class="cta-box" style="border:none; cursor:pointer; width:100%">LÄHETÄ ILMOITTAUTUMINEN</button>
            </form>`;
    } else if (id === 'driftshop') {
        content = `<h2>Drift Shop</h2><div class="drift-item"><strong>Adidas Copa</strong><br>Koko: 38 | 15€</div><div class="drift-item"><strong>Treenipaita</strong><br>Koko: 140cm | 5€</div>`;
    } else if (id === 'kentat') {
        content = `<h2>Kotikentät</h2><a class="map-link" href="https://maps.google.com/?q=Matinkylän+urheilupuisto" target="_blank">Matinkylä TN1 ↗</a><a class="map-link" href="https://maps.google.com/?q=Haukilahden+kenttä" target="_blank">Toppelund ↗</a>`;
    } else if (id === 'otteluraportit' || id === 'taktiikka') {
        const rpt = pageData.config.latestReport;
        const text = id === 'taktiikka' ? pageData.tacticsText : (typeof rpt === 'object' ? rpt.text : rpt);
        content = `<h2>${id.toUpperCase()}</h2><p style="font-size:18px; line-height:1.6;">${text}</p>`;
    }

    body.innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }
async function fetchWeather() {
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=60.15&longitude=24.74&current_weather=true");
    const w = await res.json();
    document.getElementById('temp').innerText = Math.round(w.current_weather.temperature) + "°C";
}
function openBoard() { if(prompt("Salasana:") === "hoogee2026") alert("Tervetuloa!"); }

setLanguage('fi');