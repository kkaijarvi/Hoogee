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
    { name: "HooGee Huivi", price: "20€", img: "https://img.freepik.com/free-vector/soccer-fans-scarf-realistic-set-with-isolated-images-long-scarves-blank-fabric-with-fringes-vector-illustration_1284-75464.jpg" },
    { name: "HooGee Lippis", price: "15€", img: "https://cdn-icons-png.flaticon.com/512/7322/7322245.png" },
    { name: "HooGee Juomapullo", price: "10€", img: "https://cdn-icons-png.flaticon.com/512/3100/3100566.png" },
    { name: "HooGee Kangaskassi", price: "12€", img: "https://cdn-icons-png.flaticon.com/512/1040/1040232.png" }
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
        document.getElementById('partner-logos').innerHTML = pageData.config.kumppanit.map(p => `<img src="${p.logo}" alt="${p.nimi}" style="height:35px; margin-left:10px;">`).join('');
        
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
        // Päivitetään indeksi raportin valintaa varten, mutta pidetään nykyinen "muistissa"
        reportIndex = (reportIndex + 1) % reports.length;
    };
    updateDisplay();
    reportTimer = setInterval(updateDisplay, 4000); // 4 sekuntia
}

function openCurrentReport() {
    const reports = pageData.config.allReports || [pageData.config.latestReport];
    // Lasketaan oikea indeksi (koska startReportRotation ehti jo kasvattaa sitä)
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
        content = `<div style="text-align:center;"><img src="https://cdn-icons-png.flaticon.com/512/21/21104.png" style="height:120px; filter:grayscale(1);"><br><h2>Elias "Efu" Virtanen</h2><p>P2012</p></div>`;
    } else if (id === 'fanikama') {
        content = `<h2>HooGee Shop</h2><div class="shop-grid">`;
        fanProducts.forEach(p => {
            content += `<div class="shop-item">
                <img src="${p.img}" class="shop-img">
                <h4>${p.name}</h4>
                <p>${p.price}</p>
            </div>`;
        });
        content += `</div>`;
    } else if (id === 'driftshop') {
        content = `<h2>Drift Shop</h2>`;
        driftProducts.forEach(p => {
            content += `<div style="padding:10px; border-bottom:1px solid #eee;"><strong>${p.item}</strong> - ${p.price}<br><small>Myyjä: ${p.seller}</small></div>`;
        });
    } else if (id === 'kentat') {
        content = `<h2>Kotikentät</h2><ul>` + fields.map(f => `<li>${f}</li>`).join('') + `</ul>`;
    } else if (id === 'yhteistyo') {
        content = `<h2>Kiitos kumppaneille</h2><p>Kiitos tukijoillemme! Teidän panoksenne mahdollistaa seuran toiminnan.</p>`;
    } else if (id === 'tervetuloa') {
        content = `<h2>Tule mukaan!</h2><form><input type="text" placeholder="Nimi" class="form-input" required><input type="email" placeholder="Sähköposti" class="form-input" required><button class="cta-box" style="width:100%; border:none;">LÄHETÄ</button></form>`;
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