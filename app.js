let currentLang = 'fi';
let pageData = null;

const ui = {
    fi: { mottoT: "HOOGEESSA ON", mottoB: "HYVÄ OLLA", nextM: "SEURAAVA OTTELU", weather: "SÄÄ", news: "AJANKOHTAISTA", results: "TULOKSET", welcome: "TERVETULOA", report: "OTTELURAPORTTI", fields: "KOTIKENTÄT", drift: "DRIFT SHOP", driftSub: "Käytetyt varusteet", cta: "TULE MUKAAN" },
    se: { mottoT: "I HOOGEE ÄR DET", mottoB: "GOTT ATT VARA", nextM: "NÄSTA MATCH", weather: "VÄDER", news: "AKTUELLT", results: "RESULTAT", welcome: "VÄLKOMMEN", report: "MATCHRAPPORT", fields: "HEMMAPLANER", drift: "DRIFT SHOP", driftSub: "Begagnad utrustning", cta: "KOM MED" }
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

    await loadData();
}

async function loadData() {
    try {
        const res = await fetch(`data-${currentLang}.json?v=${Date.now()}`);
        pageData = await res.json();
        
        document.getElementById('game-label').innerText = "HooGee vs " + pageData.config.seuraavaPeli.vastustaja;
        document.getElementById('welcome-p1').innerText = pageData.welcomeText1;
        
        const rpt = pageData.config.latestReport;
        const txt = typeof rpt === 'object' ? rpt.text : rpt;
        document.getElementById('report-preview').innerText = txt.substring(0, 100) + "...";
        
        document.getElementById('results-list').innerHTML = pageData.config.tulokset.map(r => `<div>${r.peli} <strong style="float:right">${r.tulos}</strong></div>`).join('');
        document.getElementById('news-list').innerHTML = pageData.config.events.map(e => `<div><b>${e.pvm}</b> ${e.nimi}</div>`).join('');
        document.getElementById('partner-logos').innerHTML = pageData.config.kumppanit.map(p => `<img src="${p.logo}" alt="${p.nimi}">`).join('');
        
        startTimer(pageData.config.seuraavaPeli.aika);
        fetchWeather();
    } catch(e) { console.error("JSON virhe"); }
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
    update();
    setInterval(update, 60000);
}

function openModal(id) {
    const body = document.getElementById('modalBody');
    let content = "";

    if (id === 'driftshop') {
        const items = [
            {n: "Adidas Copa Pure", s: "38", p: "15€"},
            {n: "HooGee Treenipaita", s: "140cm", p: "5€"},
            {n: "Säärisuojat", s: "S", p: "5€"}
        ];
        content = `<h2>Drift Shop</h2>` + items.map(i => `
            <div class="drift-item">
                <strong>${i.n}</strong><br>Koko: ${i.s} | Hinta: ${i.p}
            </div>`).join('');
    } 
    else if (id === 'tervetuloa') {
        content = `<h2>Ilmoittaudu mukaan</h2>
            <form class="reg-form" onsubmit="event.preventDefault(); alert('Kiitos!'); closeModal();">
                <input type="text" placeholder="Pelaajan nimi" required>
                <input type="email" placeholder="Sähköposti" required>
                <select><option>Aloittelija</option><option>Harraste</option><option>Kilpa</option></select>
                <button type="submit" class="cta-box" style="border:none; cursor:pointer">LÄHETÄ</button>
            </form>`;
    }
    else if (id === 'kentat') {
        const k = [["Matinkylä TN1", "https://maps.google.com"], ["Toppelund", "https://maps.google.com"]];
        content = `<h2>Kotikentät</h2>` + k.map(f => `<a class="map-link" href="${f[1]}" target="_blank">${f[0]} ↗</a>`).join('');
    }
    else if (id === 'otteluraportit') {
        const rpt = pageData.config.latestReport;
        content = `<h2>Otteluraportti</h2><p>${typeof rpt === 'object' ? rpt.text : rpt}</p>`;
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
    } catch(e) {}
}

function openBoard() { if(prompt("Salasana:") === "hoogee2026") alert("Tervetuloa!"); }

setLanguage('fi');