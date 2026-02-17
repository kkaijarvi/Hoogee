let currentLang = 'fi';
let pageData = null;

const ui = {
    fi: { mottoT: "HOOGEESSA ON", mottoB: "HYVÄ OLLA", nextM: "SEURAAVA OTTELU", weather: "SÄÄ", wLoc: "Espoo", news: "AJANKOHTAISTA", results: "TULOKSET", welcome: "TERVETULOA", report: "OTTELURAPORTTI", fields: "KOTIKENTÄT", drift: "DRIFT SHOP", driftSub: "Käytetyt varusteet", cta: "TULE MUKAAN", tactics: "PÄIVÄN TAKTIIKKA" },
    se: { mottoT: "I HOOGEE ÄR DET", mottoB: "GOTT ATT VARA", nextM: "NÄSTA MATCH", weather: "VÄDER", wLoc: "Esbo", news: "AKTUELLT", results: "RESULTAT", welcome: "VÄLKOMMEN", report: "MATCHRAPPORT", fields: "HEMMAPLANER", drift: "DRIFT SHOP", driftSub: "Begagnad utrustning", cta: "KOM MED", tactics: "DAGENS TAKTIK" }
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
    document.getElementById('weather-location').innerText = t.wLoc;
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
        // Lisätty cache-breaker (?v=) jotta iPhone ei käytä vanhaa JSONia
        const res = await fetch(`data-${currentLang}.json?v=${Date.now()}`);
        pageData = await res.json();
        
        const peli = pageData.config.seuraavaPeli;
        document.getElementById('game-label').innerText = "HooGee vs " + peli.vastustaja;
        document.getElementById('game-venue').innerText = peli.paikka || "Matinkylä TN 1";

        document.getElementById('welcome-p1').innerText = pageData.welcomeText1;
        document.getElementById('tactics-text').innerText = pageData.tacticsText || "";
        
        const rpt = pageData.config.latestReport;
        const txt = typeof rpt === 'object' ? rpt.text : rpt;
        document.getElementById('report-preview').innerText = txt ? txt.substring(0, 85) + "..." : "";
        
        document.getElementById('results-list').innerHTML = pageData.config.tulokset.map(r => `<div>${r.peli} <strong style="float:right">${r.tulos}</strong></div>`).join('');
        document.getElementById('news-list').innerHTML = pageData.config.events.map(e => `<div><b>${e.pvm}</b> ${e.nimi}</div>`).join('');
        document.getElementById('partner-logos').innerHTML = pageData.config.kumppanit.map(p => `<img src="${p.logo}" alt="${p.nimi}">`).join('');
        
        updateTimer(peli.aika);
        fetchWeather();
    } catch(e) { console.error("JSON dataa ei voitu ladata."); }
}

function updateTimer(target) {
    const el = document.getElementById('timer');
    function tick() {
        const diff = new Date(target) - new Date();
        if (diff <= 0) { el.innerText = "LIVE"; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        el.innerText = `${d}pv ${h}h`;
    }
    tick();
    setInterval(tick, 60000);
}

function openModal(id) {
    const body = document.getElementById('modalBody');
    let content = "";

    if (id === 'tervetuloa') {
        content = `<h2>Tule mukaan!</h2><p>Täytä tiedot kokeilutreenejä varten.</p>
            <form onsubmit="event.preventDefault(); alert('Kiitos!'); closeModal();" style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                <input type="text" placeholder="Pelaajan nimi" required style="padding:12px; border-radius:10px; border:1px solid #ccc;">
                <input type="email" placeholder="Sähköposti" required style="padding:12px; border-radius:10px; border:1px solid #ccc;">
                <button type="submit" class="cta-box" style="border:none; cursor:pointer;">LÄHETÄ</button>
            </form>`;
    } else if (id === 'driftshop') {
        content = `<h2>Drift Shop</h2><p>Käytetyt varusteet kiertoon.</p><div style="background:#f0f2f5; padding:15px; border-radius:15px; margin-top:10px;"><strong>HooGee Pelipaita</strong><br>Koko 152cm | 10€</div>`;
    } else if (id === 'taktiikka') {
        content = `<h2>Päivän taktiikka</h2><p style="font-size:18px; line-height:1.6; white-space: pre-wrap;">${pageData.tacticsText}</p>`;
    } else if (id === 'kentat') {
        content = `<h2>Kotikentät</h2><a href="#" class="cta-box" style="display:block; text-decoration:none;">MATINKYLÄ TN1</a><a href="#" class="cta-box" style="display:block; text-decoration:none; margin-top:10px;">TOPPELUND</a>`;
    } else if (id === 'otteluraportit') {
        const rpt = pageData.config.latestReport;
        content = `<h2>Raportti</h2><p style="font-size:16px; line-height:1.5;">${typeof rpt === 'object' ? rpt.text : rpt}</p>`;
    }

    body.innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }

async function fetchWeather() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=60.15&longitude=24.74&current_weather=true");
        const w = await res.json();
        document.getElementById('temp').innerText = Math.round(w.current_weather.temperature) + "°C";
    } catch(e) { document.getElementById('temp').innerText = "??°C"; }
}

function openBoard() { if(prompt("Salasana:") === "hoogee2026") alert("Tervetuloa!"); }

setLanguage('fi');