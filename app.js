let currentLang = 'fi';
let pageData = null;

const driftProducts = [
    { item: "HooGee Pelipaita", size: "152cm", price: "15€", seller: "M. Virtanen" },
    { item: "Adidas Nappulakengät", size: "38", price: "20€", seller: "S. Korhonen" },
    { item: "HooGee Treenitakki", size: "S", price: "25€", seller: "J. Laine" },
    { item: "Verryttelyhousut", size: "140cm", price: "10€", seller: "A. Nieminen" },
    { item: "Säärisuojat", size: "M", price: "5€", seller: "T. Mäkelä" },
    { item: "Maalivahdin hanskat", size: "7", price: "12€", seller: "H. Koskinen" },
    { item: "HooGee Reppu", size: "One Size", price: "15€", seller: "E. Järvinen" },
    { item: "Talvitreenitakki", size: "164cm", price: "30€", seller: "P. Heikkilä" },
    { item: "HooGee Pipo", size: "Lapsi", price: "5€", seller: "K. Rantanen" },
    { item: "Shortsit", size: "152cm", price: "8€", seller: "O. Manner" }
];

const fields = ["Matinkylä TN1", "Matinkylä TN2", "Toppelund", "Westendinpuisto", "Opinmäki", "Kaitaa", "Myntinsyrjä"];

async function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    if(document.getElementById(`btn-${lang}`)) document.getElementById(`btn-${lang}`).classList.add('active');
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
        
        // Raportti-esikatselu
        const rpt = pageData.config.latestReport;
        document.getElementById('report-preview').innerHTML = `<strong>${rpt.team}</strong><br><small>Kirjoittaja: ${rpt.author}</small>`;
        
        // Tulokset välirivillä
        document.getElementById('results-list').innerHTML = pageData.config.tulokset.map(r => 
            `<div class="list-item">${r.peli} <strong style="float:right">${r.tulos}</strong></div>`
        ).join('');

        document.getElementById('news-list').innerHTML = pageData.config.events.map(e => `<div><b>${e.pvm}</b> ${e.nimi}</div>`).join('');
        document.getElementById('partner-logos').innerHTML = pageData.config.kumppanit.map(p => `<img src="${p.logo}" alt="${p.nimi}" style="height:35px; margin-left:10px;">`).join('');
        
        updateTimer(pageData.config.seuraavaPeli.aika);
        fetchWeather();
    } catch(e) { console.error(e); }
}

function openModal(id) {
    const body = document.getElementById('modalBody');
    let content = "";

    if (id === 'driftshop') {
        content = `<h2>Drift Shop</h2><p>Käytetyt varusteet kiertoon.</p><br>`;
        driftProducts.forEach(p => {
            content += `<div style="padding:10px; border-bottom:1px solid #eee;">
                <strong>${p.item} (${p.size})</strong> - ${p.price}<br>
                <small>Myyjä: ${p.seller}</small></div>`;
        });
    } else if (id === 'kentat') {
        content = `<h2>Kotikentät</h2><ul>` + fields.map(f => `<li style="padding:10px 0; font-size:18px;">${f}</li>`).join('') + `</ul>`;
    } else if (id === 'yhteistyo') {
        content = `<h2>Yhteistyössä</h2><p>Lämmin kiitos kaikille tukijoillemme ja yhteistyökumppaneillemme. Teidän panoksenne mahdollistaa laadukkaan jalkapallotoiminnan sadoille lapsille ja nuorille joka päivä.</p>`;
    } else if (id === 'otteluraportit') {
        const rpt = pageData.config.latestReport;
        content = `<h2>Raportti: ${rpt.team}</h2><p style="font-size:18px; line-height:1.6;">${rpt.text}</p><hr><p>Kirjoittaja: ${rpt.author}</p>`;
    } else if (id === 'tervetuloa') {
        content = `<h2>Tule mukaan!</h2>
            <form onsubmit="event.preventDefault(); alert('Kiitos viestistä! Otamme yhteyttä mahdollisimman pian.'); closeModal();" style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
                <input type="text" placeholder="Pelaajan nimi" class="form-input" required>
                <input type="number" placeholder="Syntymävuosi" class="form-input" required>
                <input type="text" placeholder="Koulu" class="form-input">
                <input type="text" placeholder="Muut harrastukset" class="form-input">
                <input type="text" placeholder="Aikaisempi seura" class="form-input">
                <input type="email" placeholder="Huoltajan sähköposti" class="form-input" required>
                <input type="tel" placeholder="Huoltajan puhelinnumero" class="form-input" required>
                <button type="submit" class="cta-box" style="border:none; cursor:pointer; width:100%;">LÄHETÄ</button>
            </form>`;
    } else {
        content = `<h2>${id.toUpperCase()}</h2><p>Tietoja päivitetään.</p>`;
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
    const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=60.15&longitude=24.74&current_weather=true");
    const w = await res.json();
    document.getElementById('temp').innerText = Math.round(w.current_weather.temperature) + "°C";
}
function openBoard() { if(prompt("Salasana:") === "hoogee2026") alert("Tervetuloa!"); }

setLanguage('fi');