let currentLang = 'fi';
let pageData = null;

// Kieliasetukset
const ui = {
    fi: { mottoT: "HOOGEESSA ON", mottoB: "HYVÄ OLLA", nextM: "SEURAAVA OTTELU", weather: "SÄÄ", wLoc: "Espoo", news: "AJANKOHTAISTA", results: "TULOKSET", welcome: "TERVETULOA", report: "OTTELURAPORTTI", fields: "KOTIKENTÄT", drift: "DRIFT SHOP", driftSub: "Käytetyt varusteet", cta: "TULE MUKAAN", tactics: "PÄIVÄN TAKTIIKKA" },
    se: { mottoT: "I HOOGEE ÄR DET", mottoB: "GOTT ATT VARA", nextM: "NÄSTA MATCH", weather: "VÄDER", wLoc: "Esbo", news: "AKTUELLT", results: "RESULTAT", welcome: "VÄLKOMMEN", report: "MATCHRAPPORT", fields: "HEMMAPLANER", drift: "DRIFT SHOP", driftSub: "Begagnad utrustning", cta: "KOM MED", tactics: "DAGENS TAKTIK" }
};

// Kielenvaihto
async function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    const t = ui[lang];
    // Päivitetään staattiset tekstit turvallisesti
    const updateText = (id, text) => { if(document.getElementById(id)) document.getElementById(id).innerText = text; };
    
    updateText('motto-top', t.mottoT);
    updateText('motto-bottom', t.mottoB);
    updateText('h3-next-match', t.nextM);
    updateText('h3-weather', t.weather);
    updateText('weather-location', t.wLoc);
    updateText('h3-news', t.news);
    updateText('h3-results', t.results);
    updateText('h3-welcome', t.welcome);
    updateText('h3-report', t.report);
    updateText('h3-fields', t.fields);
    updateText('h3-drift', t.drift);
    updateText('drift-sub', t.driftSub);
    updateText('cta-text', t.cta);
    updateText('h3-tactics', t.tactics);

    await loadData();
}

// Datan lataus
async function loadData() {
    try {
        const res = await fetch(`data-${currentLang}.json?v=${Date.now()}`);
        if (!res.ok) throw new Error("JSON-tiedostoa ei löydy");
        pageData = await res.json();
        
        // Seuraava peli
        if (pageData.config && pageData.config.seuraavaPeli) {
            const peli = pageData.config.seuraavaPeli;
            document.getElementById('game-label').innerText = "HooGee vs " + peli.vastustaja;
            document.getElementById('game-venue').innerText = peli.paikka || "Matinkylä TN 1";
            updateTimer(peli.aika);
        }

        // Tekstit
        if(document.getElementById('welcome-p1')) document.getElementById('welcome-p1').innerText = pageData.welcomeText1 || "";
        if(document.getElementById('tactics-text')) document.getElementById('tactics-text').innerText = pageData.tacticsText || "";
        
        // Raportti
        if (pageData.config && pageData.config.latestReport) {
            const rpt = pageData.config.latestReport;
            const txt = typeof rpt === 'object' ? rpt.text : rpt;
            if(document.getElementById('report-preview')) document.getElementById('report-preview').innerText = txt ? txt.substring(0, 85) + "..." : "";
        }
        
        // Listat
        if(document.getElementById('results-list')) {
            document.getElementById('results-list').innerHTML = pageData.config.tulokset.map(r => `<div>${r.peli} <strong style="float:right">${r.tulos}</strong></div>`).join('');
        }
        if(document.getElementById('news-list')) {
            document.getElementById('news-list').innerHTML = pageData.config.events.map(e => `<div><b>${e.pvm}</b> ${e.nimi}</div>`).join('');
        }
        
        fetchWeather();
    } catch(e) { 
        console.error("Latausvirhe:", e); 
        document.getElementById('game-label').innerText = "Virhe datan latauksessa";
    }
}

function updateTimer(target) {
    const el = document.getElementById('timer');
    if(!el) return;
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

async function fetchWeather() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=60.15&longitude=24.74&current_weather=true");
        const w = await res.json();
        const tempEl = document.getElementById('temp');
        if(tempEl) tempEl.innerText = Math.round(w.current_weather.temperature) + "°C";
    } catch(e) { 
        if(document.getElementById('temp')) document.getElementById('temp').innerText = "??°C";
    }
}

// Modal-toiminnot ja muut säilyvät ennallaan...
function openModal(id) {
    const body = document.getElementById('modalBody');
    if(!body || !pageData) return;
    let content = "";
    if (id === 'taktiikka') {
        content = `<h2>${ui[currentLang].tactics}</h2><p style="font-size:18px; line-height:1.6; white-space: pre-wrap;">${pageData.tacticsText}</p>`;
    } else {
        content = `<h2>${id.toUpperCase()}</h2><p>Tietoja päivitetään...</p>`;
    }
    body.innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }
function openBoard() { if(prompt("Salasana:") === "hoogee2026") alert("Tervetuloa!"); }

// KÄYNNISTYS
document.addEventListener('DOMContentLoaded', () => {
    setLanguage('fi');
});