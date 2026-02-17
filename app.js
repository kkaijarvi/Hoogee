let currentLang = 'fi';
let pageData = null;

const uiTexts = {
    fi: {
        mottoT: "HOOGEESSA ON", mottoB: "HYVÄ OLLA", nextM: "SEURAAVA OTTELU",
        weather: "SÄÄ", news: "AJANKOHTAISTA", results: "TULOKSET", 
        welcome: "TERVETULOA", report: "OTTELURAPORTTI", fields: "KOTIKENTÄT",
        drift: "DRIFT SHOP", driftSub: "Käytetyt varusteet", cta: "TULE MUKAAN"
    },
    se: {
        mottoT: "I HOOGEE ÄR DET", mottoB: "GOTT ATT VARA", nextM: "NÄSTA MATCH",
        weather: "VÄDER", news: "AKTUELLT", results: "RESULTAT", 
        welcome: "VÄLKOMMEN", report: "MATCHRAPPORT", fields: "HEMMAPLANER",
        drift: "DRIFT SHOP", driftSub: "Begagnad utrustning", cta: "KOM MED"
    }
};

async function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    const t = uiTexts[lang];
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

    loadData();
}

async function loadData() {
    try {
        const res = await fetch(`data-${currentLang}.json?v=${Date.now()}`);
        pageData = await res.json();
        
        document.getElementById('game-label').innerText = "HooGee vs " + pageData.config.seuraavaPeli.vastustaja;
        document.getElementById('welcome-p1').innerText = pageData.welcomeText1;
        document.getElementById('report-preview').innerText = pageData.config.latestReport.substring(0, 100) + "...";
        
        document.getElementById('results-list').innerHTML = pageData.config.tulokset.map(r => 
            `<div>${r.peli} <strong style="float:right">${r.tulos}</strong></div>`
        ).join('');

        document.getElementById('news-list').innerHTML = pageData.config.events.map(e => 
            `<div><strong>${e.pvm}</strong> ${e.nimi}</div>`
        ).join('');
        
        document.getElementById('partner-logos').innerHTML = pageData.config.kumppanit.map(p => 
            `<a href="${p.linkki}" target="_blank" onclick="event.stopPropagation()"><img src="${p.logo}" alt="${p.nimi}"></a>`
        ).join('');
        
        startTimer(pageData.config.seuraavaPeli.aika);
        fetchWeather();
    } catch(e) { console.error("Virhe ladattaessa JSONia:", e); }
}

function startTimer(targetTime) {
    const el = document.getElementById('timer');
    function update() {
        const diff = new Date(targetTime) - new Date();
        if (diff <= 0) { el.innerText = "LIVE"; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        el.innerText = `${d}pv ${h}h ${m}min`;
    }
    update();
    setInterval(update, 60000);
}

function openModal(id) {
    const body = document.getElementById('modalBody');
    let content = "";

    if (id === 'kentat') {
        const k = [
            ["Matinkylä TN1", "https://www.google.com/maps/search/?api=1&query=Matinkylän+tekonurmi+1"],
            ["Matinkylä TN2", "https://www.google.com/maps/search/?api=1&query=Matinkylän+tekonurmi+2"],
            ["Toppelundin kenttä", "https://www.google.com/maps/search/?api=1&query=Toppelundin+kenttä"],
            ["Westendinpuisto", "https://www.google.com/maps/search/?api=1&query=Westendinpuiston+kenttä"],
            ["Opimäen kenttä", "https://www.google.com/maps/search/?api=1&query=Opimäen+kenttä"],
            ["Kaitaa", "https://www.google.com/maps/search/?api=1&query=Kaitaan+kenttä"],
            ["Myntinsyrjän halli", "https://www.google.com/maps/search/?api=1&query=Myntinsyrjän+halli"]
        ];
        content = `<h2>${uiTexts[currentLang].fields}</h2>` + 
                  k.map(f => `<a class="map-link" href="${f[1]}" target="_blank">${f[0]} ↗</a>`).join('');
    } 
    else if (id === 'driftshop') {
        content = `<h2>Drift Shop</h2>
                   <p><b>${currentLang === 'fi' ? 'Kategoriat:' : 'Kategorier:'}</b></p>
                   <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                     <div><h3>KENGÄT</h3><p>Adidas Copa 38 (10€)</p><p>Nike Mercurial 40 (15€)</p></div>
                     <div><h3>PAIDAT</h3><p>HooGee M (5€)</p><p>Huppari L (15€)</p></div>
                   </div>`;
    } 
    else if (id === 'otteluraportit') {
        content = `<h2>${uiTexts[currentLang].report}</h2>
                   <p style="font-size:18px; line-height:1.6;">${(pageData.config.latestReport + " ").repeat(20)}</p>`;
    }

    body.innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }
window.onclick = (e) => { if(e.target.id === 'modalOverlay') closeModal(); }
async function fetchWeather() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=60.15&longitude=24.74&current_weather=true");
        const w = await res.json();
        document.getElementById('temp').innerText = Math.round(w.current_weather.temperature) + "°C";
    } catch(e) {}
}
function openBoard() { if(prompt("Salasana") === "hoogee2026") alert("Tervetuloa hallituksen sivulle."); }

setLanguage('fi');