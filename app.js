let currentLang = 'fi';
let pageData = null;

const ui = {
    fi: { mottoT: "HOOGEESSA ON", mottoB: "HYVÄ OLLA", nextM: "SEURAAVA OTTELU", weather: "SÄÄ", wLoc: "Espoo", news: "AJANKOHTAISTA", results: "TULOKSET", welcome: "TERVETULOA", report: "OTTELURAPORTTI", fields: "KOTIKENTÄT", drift: "DRIFT SHOP", driftSub: "Käytetyt varusteet", cta: "TULE MUKAAN", tactics: "PÄIVÄN TAKTIIKKA" },
    se: { mottoT: "I HOOGEE ÄR DET", mottoB: "GOTT ATT VARA", nextM: "NÄSTA MATCH", weather: "VÄDER", wLoc: "Esbo", news: "AKTUELLT", results: "RESULTAT", welcome: "VÄLKOMMEN", report: "MATCHRAPPORT", fields: "HEMMAPLANER", drift: "DRIFT SHOP", driftSub: "Begagnad utrustning", cta: "KOM MED", tactics: "DAGENS TAKTIK" }
};

async function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    if(document.getElementById(`btn-${lang}`)) document.getElementById(`btn-${lang}`).classList.add('active');
    
    const t = ui[lang];
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

async function loadData() {
    try {
        const res = await fetch(`data-${currentLang}.json?v=${Date.now()}`);
        pageData = await res.json();
        
        // Seuraava peli
        const peli = pageData.config.seuraavaPeli;
        document.getElementById('game-label').innerText = "HooGee vs " + peli.vastustaja;
        document.getElementById('game-venue').innerText = peli.paikka || "Matinkylä TN 1";

        // Tervetuloa ja Taktiikka
        document.getElementById('welcome-p1').innerText = pageData.welcomeText1;
        document.getElementById('tactics-text').innerText = pageData.tacticsText || "";
        
        // OTTELURAPORTTI (Joukkueen nimi lisätty esikatseluun)
        const rpt = pageData.config.latestReport;
        if (rpt && typeof rpt === 'object') {
            document.getElementById('report-preview').innerHTML = `<strong>${rpt.team}:</strong> ${rpt.text.substring(0, 70)}...`;
        } else {
            document.getElementById('report-preview').innerText = rpt ? rpt.substring(0, 85) + "..." : "";
        }
        
        // Listat ja kumppanit
        document.getElementById('results-list').innerHTML = pageData.config.tulokset.map(r => `<div>${r.peli} <strong style="float:right">${r.tulos}</strong></div>`).join('');
        document.getElementById('news-list').innerHTML = pageData.config.events.map(e => `<div><b>${e.pvm}</b> ${e.nimi}</div>`).join('');
        document.getElementById('partner-logos').innerHTML = pageData.config.kumppanit.map(p => `<img src="${p.logo}" alt="${p.nimi}" style="height:35px; margin-left:10px;">`).join('');
        
        updateTimer(peli.aika);
        fetchWeather();
    } catch(e) { console.error("Latausvirhe:", e); }
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
    tick(); setInterval(tick, 60000);
}

async function fetchWeather() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=60.15&longitude=24.74&current_weather=true");
        const w = await res.json();
        if(document.getElementById('temp')) document.getElementById('temp').innerText = Math.round(w.current_weather.temperature) + "°C";
    } catch(e) { if(document.getElementById('temp')) document.getElementById('temp').innerText = "??°C"; }
}

function openModal(id) {
    const body = document.getElementById('modalBody');
    if(!pageData) return;
    let content = "";

    if (id === 'otteluraportit') {
        const rpt = pageData.config.latestReport;
        if (typeof rpt === 'object') {
            content = `<h2>Otteluraportti: ${rpt.team}</h2>
                       <p style="font-size:18px; line-height:1.6;">${rpt.text}</p>
                       <hr style="margin-top:20px; opacity:0.2;">
                       <p style="font-style:italic; color:gray;">Kirjoittaja: ${rpt.author}</p>`;
        } else {
            content = `<h2>Otteluraportti</h2><p>${rpt}</p>`;
        }
    } else if (id === 'taktiikka') {
        content = `<h2>${ui[currentLang].tactics}</h2><p style="font-size:18px; line-height:1.6; white-space: pre-wrap;">${pageData.tacticsText}</p>`;
    } else if (id === 'tervetuloa') {
        content = `<h2>Tule mukaan!</h2><form onsubmit="event.preventDefault(); alert('Kiitos!'); closeModal();" style="display:flex; flex-direction:column; gap:10px; margin-top:20px;"><input type="text" placeholder="Pelaajan nimi" required style="padding:12px; border-radius:10px; border:1px solid #ccc;"><input type="email" placeholder="Sähköposti" required style="padding:12px; border-radius:10px; border:1px solid #ccc;"><button type="submit" class="cta-box" style="border:none; cursor:pointer;">LÄHETÄ</button></form>`;
    } else {
        content = `<h2>${id.toUpperCase()}</h2><p>Päivitetään...</p>`;
    }

    body.innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }
function openBoard() { if(prompt("Salasana:") === "hoogee2026") alert("Tervetuloa!"); }

document.addEventListener('DOMContentLoaded', () => setLanguage('fi'));