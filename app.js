let currentLang = 'fi';
let pageData = null;
let reportIndex = 0;
let reportTimer = null;

const driftProducts = [
    { item: "HooGee Pelipaita", size: "152cm", price: "15€", seller: "M. Virtanen" },
    { item: "Adidas Nappulakengät", size: "38", price: "20€", seller: "S. Korhonen" },
    { item: "HooGee Treenitakki", size: "S", price: "25€", seller: "J. Laine" },
    { item: "Verryttelyhousut", size: "140cm", price: "10€", seller: "A. Nieminen" },
    { item: "Säärisuojat", size: "M", price: "5€", seller: "T. Mäkelä" },
    { item: "Maalivahdin hanskat", size: "7", price: "12€", seller: "H. Koskinen" },
    { item: "HooGee Reppu", size: "OS", price: "15€", seller: "E. Järvinen" },
    { item: "Talvitreenitakki", size: "164cm", price: "30€", seller: "P. Heikkilä" },
    { item: "HooGee Pipo", size: "Lapsi", price: "5€", seller: "K. Rantanen" },
    { item: "Treenishortsit", size: "152cm", price: "8€", seller: "O. Manner" }
];

const fanProducts = [
    { name: "Huivi", price: "20€" }, { name: "Lippis", price: "15€" },
    { name: "Pullo", price: "10€" }, { name: "Kassi", price: "12€" },
    { name: "Pipo", price: "18€" }, { name: "Sukat", price: "8€" },
    { name: "Viiri", price: "5€" }, { name: "Muki", price: "12€" },
    { name: "Sateenvarjo", price: "25€" }
];

const fields = ["Matinkylä TN1", "Matinkylä TN2", "Toppelund", "Westendinpuisto", "Opinmäki", "Kaitaa", "Myntinsyrjä"];

const teamRosters = {
    'P2018': ["Luka", "Aamos", "Oliver", "Nooa", "Elias", "Hugo", "Mikael", "Niilo", "Otso", "Peetu"],
    'T2018': ["Ellen", "Saga", "Aada", "Venla", "Alisa", "Isla", "Lumi", "Minea", "Selma", "Hilla"],
    'Miehet': ["J. Virtanen", "M. Korhonen", "S. Laine", "A. Nieminen", "T. Mäkelä", "H. Koskinen", "E. Järvinen", "P. Heikkilä", "K. Rantanen", "O. Manner"],
    'Naiset': ["M. Aaltonen", "L. Salonen", "K. Turunen", "E. Peltonen", "S. Haavisto", "A. Rautiainen", "V. Lehtonen", "I. Karjalainen", "J. Huttunen", "R. Seppälä"]
};

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
    
    updateText('motto-top', t.mottoT); updateText('motto-bottom', t.mottoB);
    updateText('h3-next-match', t.nextM); updateText('h3-weather', t.weather);
    updateText('weather-location', t.wLoc); updateText('h3-news', t.news);
    updateText('h3-results', t.results); updateText('h3-welcome', t.welcome);
    updateText('h3-report', t.report); updateText('h3-fields', t.fields);
    updateText('h3-drift', t.drift); updateText('drift-sub', t.driftSub);
    updateText('cta-text', t.cta); updateText('h3-tactics', t.tactics);

    await loadData();
}

async function loadData() {
    try {
        const res = await fetch(`data-${currentLang}.json?v=${Date.now()}`);
        pageData = await res.json();
        
        document.getElementById('game-label').innerText = "HooGee vs " + pageData.config.seuraavaPeli.vastustaja;
        document.getElementById('game-venue').innerText = pageData.config.seuraavaPeli.paikka || "Matinkylä TN 1";
        document.getElementById('welcome-p1').innerText = pageData.welcomeText1;
        document.getElementById('tactics-text').innerText = pageData.tacticsText || "";
        
        document.getElementById('results-list').innerHTML = pageData.config.tulokset.map(r => 
            `<div class="list-item">${r.peli} <strong style="float:right">${r.tulos}</strong></div>`
        ).join('');

        document.getElementById('news-list').innerHTML = pageData.config.events.map(e => `<div><b>${e.pvm}</b> ${e.nimi}</div>`).join('');
        document.getElementById('partner-logos').innerHTML = pageData.config.kumppanit.map(p => `<img src="${p.logo}" alt="${p.nimi}" style="height:35px; margin-left:15px; filter: grayscale(1); opacity: 0.7;">`).join('');
        
        updateTimer(pageData.config.seuraavaPeli.aika);
        fetchWeather();
        startReportRotation();
    } catch(e) { console.error("Data error", e); }
}

function startReportRotation() {
    if (reportTimer) clearInterval(reportTimer);
    const reports = pageData.config.allReports || [pageData.config.latestReport];
    
    const updateDisplay = () => {
        const rpt = reports[reportIndex];
        const previewEl = document.getElementById('report-preview');
        previewEl.innerHTML = `
            <div style="font-weight:900; color:var(--hoogee-blue); margin-bottom:2px;">${rpt.match || rpt.team}</div>
            <div style="font-size:11px; color:gray; margin-bottom:8px;">Kirjoittaja: ${rpt.author}</div>
            <div style="line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                ${rpt.text}...
            </div>
        `;
        reportIndex = (reportIndex + 1) % reports.length;
    };
    updateDisplay();
    reportTimer = setInterval(updateDisplay, 4000);
}

function openCurrentReport() {
    const reports = pageData.config.allReports || [pageData.config.latestReport];
    let idx = (reportIndex === 0) ? reports.length - 1 : reportIndex - 1;
    const rpt = reports[idx];
    
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <h2>${rpt.match || rpt.team}</h2>
        <p style="font-size:18px; line-height:1.6; margin-top:20px;">${rpt.text}</p>
        <hr style="margin:20px 0; border:0; border-top:1px solid #eee;">
        <p style="color:gray;">Kirjoittaja: ${rpt.author}</p>
    `;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function openTeamModal(teamName) {
    const body = document.getElementById('modalBody');
    const players = teamRosters[teamName];
    let content = `<h2>Joukkue: ${teamName}</h2><p>Pelaajalista:</p><ul class="player-list">`;
    players.forEach(p => content += `<li>${p}</li>`);
    content += `</ul>`;
    body.innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function openModal(id) {
    const body = document.getElementById('modalBody');
    if(!pageData && !['potw', 'fanikama'].includes(id)) return;
    let content = "";

    if (id === 'potw') {
        content = `
            <div style="text-align:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/21/21104.png" style="height:120px; filter:grayscale(1); margin-bottom:15px;">
                <h2>Elias "Efu" Virtanen</h2>
                <p><strong>Joukkue:</strong> P2012</p>
                <div style="text-align:left; background:#f0f2f5; padding:20px; border-radius:20px; margin-top:20px;">
                    <p><strong>Kuvaus:</strong> Elias on tällä viikolla osoittanut poikkeuksellista periksiantamattomuutta.</p>
                    <p style="font-style:italic; margin-top:10px;">"Efu on ollut treeneissä todellinen esimerkin näyttäjä. Asenne on ollut 100% jokaisessa harjoituksessa." <br><strong>- Valmentaja</strong></p>
                </div>
            </div>`;
    } else if (id === 'fanikama') {
        content = `<h2>HooGee Shop</h2><div class="shop-grid">`;
        fanProducts.forEach(p => {
            content += `<div class="shop-item">
                <div class="shop-placeholder">IMG</div>
                <strong>${p.name}</strong><br>${p.price}
            </div>`;
        });
        content += `</div>`;
    } else if (id === 'tervetuloa') {
        content = `<h2>Tule mukaan!</h2>
            <form onsubmit="event.preventDefault(); alert('Kiitos! Otamme yhteyttä.'); closeModal();" style="margin-top:20px;">
                <input type="text" placeholder="Pelaajan nimi" class="form-input" required>
                <input type="number" placeholder="Syntymävuosi" class="form-input" required>
                <input type="text" placeholder="Koulu" class="form-input">
                <input type="text" placeholder="Muut harrastukset" class="form-input">
                <input type="text" placeholder="Aikaisempi seura" class="form-input">
                <input type="email" placeholder="Huoltajan sähköposti" class="form-input" required>
                <input type="tel" placeholder="Huoltajan puhelinnumero" class="form-input" required>
                <button type="submit" class="cta-box" style="border:none; cursor:pointer; width:100%; margin-top:10px;">LÄHETÄ</button>
            </form>`;
    } else if (id === 'driftshop') {
        content = `<h2>Drift Shop</h2>`;
        driftProducts.forEach(p => {
            content += `<div style="padding:10px; border-bottom:1px solid #eee;"><strong>${p.item}</strong> - ${p.price}<br><small>Myyjä: ${p.seller}</small></div>`;
        });
    } else if (id === 'kentat') {
        content = `<h2>Kotikentät</h2><ul>` + fields.map(f => `<li style="padding:10px 0; border-bottom:1px solid #eee;">${f}</li>`).join('') + `</ul>`;
    } else if (id === 'yhteistyo') {
        content = `<h2>Yhteistyössä</h2><p>Lämmin kiitos kumppaneillemme, jotka mahdollistavat laadukkaan jalkapallotoiminnan Espoossa.</p>`;
        content += `<div style="display:flex; flex-wrap:wrap; gap:20px; margin-top:20px; justify-content:center;">` + 
            pageData.config.kumppanit.map(p => `<img src="${p.logo}" style="height:60px; filter:grayscale(1);">`).join('') + `</div>`;
    }

    body.innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() { document.getElementById('modalOverlay').style.display = 'none'; }
function updateTimer(target) {
    const el = document.getElementById('timer');
    const tick = () => {
        const diff = new Date(target) - new Date();
        if (diff <= 0) { el.innerText = "LIVE"; return; }
        el.innerText = `${Math.floor(diff / 86400000)}pv ${Math.floor((diff % 86400000) / 3600000)}h`;
    };
    tick(); setInterval(tick, 60000);
}
async function fetchWeather() {
    try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=60.15&longitude=24.74&current_weather=true");
        const w = await res.json();
        document.getElementById('temp').innerText = Math.round(w.current_weather.temperature) + "°C";
    } catch(e) {}
}
function openBoard() { if(prompt("Salasana:") === "hoogee2026") alert("Hallitus"); }

document.addEventListener('DOMContentLoaded', () => setLanguage('fi'));