const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const pages = { dashboard: "Command Center", map: "Situation Map", report: "Report Issue", incidents: "Incident Operations", analytics: "Civic Analytics", ai: "AI Intelligence", authority: "Authority Center" };
let incidents = [
    { id: "CL-2026-0847", title: "Severe Waterlogging", loc: "Pond Area", type: "Waterlogging", priority: 94, status: "Critical", owner: "Maintenance", reports: 127, color: "#f04450" },
    { id: "CL-2026-0851", title: "Road Damage / Pothole", loc: "Gate-2 / Main Road", type: "Road Damage", priority: 88, status: "High", owner: "Maintenance", reports: 84, color: "#ffad45" },
    { id: "CL-2026-0854", title: "Waste Accumulation", loc: "Garden Zone", type: "Waste", priority: 82, status: "High", owner: "Cleaning", reports: 61, color: "#ffad45" },
    { id: "CL-2026-0860", title: "Street Light Failure", loc: "Admission Office", type: "Lighting", priority: 67, status: "In Progress", owner: "Electrical", reports: 19, color: "#2f86ff" },
    { id: "CL-2026-0863", title: "Congestion Cluster", loc: "Girls Hostel Zone", type: "Traffic", priority: 61, status: "In Progress", owner: "Security", reports: 31, color: "#8b76ff" },
    { id: "CL-2026-0868", title: "Drain Blockage", loc: "Panorama", type: "Water", priority: 58, status: "Verified", owner: "Maintenance", reports: 17, color: "#f4d64b" },
    { id: "CL-2026-0872", title: "Waste Collection Delay", loc: "Café", type: "Waste", priority: 54, status: "Verified", owner: "Cleaning", reports: 12, color: "#f4d64b" },
    { id: "CL-2026-0879", title: "Broken Walkway", loc: "Mosque", type: "Road Damage", priority: 49, status: "Resolved", owner: "Maintenance", reports: 9, color: "#45d991" },
    { id: "CL-2026-0881", title: "Lighting Flicker", loc: "Admin-1", type: "Lighting", priority: 43, status: "Resolved", owner: "Electrical", reports: 7, color: "#45d991" }
];
const buildings = [
    { name: "Admin-1", x: 62, y: 10, w: 17, h: 12, c: "#2f86ff", icon: "▣" },
    { name: "Playground", x: 82, y: 10, w: 16, h: 12, c: "#2f86ff", icon: "✦" },
    { name: "Nexus", x: 57, y: 26, w: 28, h: 9, c: "#2f86ff", icon: "▣" },
    { name: "Panorama", x: 57, y: 38, w: 28, h: 9, c: "#7c6be0", icon: "▣" },
    { name: "Mosque", x: 88, y: 37, w: 10, h: 16, c: "#2f86ff", icon: "⌂" },
    { name: "Pond", x: 56, y: 52, w: 15, h: 15, c: "#2f86ff", icon: "≈" },
    { name: "Garden", x: 72, y: 52, w: 13, h: 15, c: "#2f86ff", icon: "✦" },
    { name: "Girls Hostel", x: 88, y: 58, w: 10, h: 20, c: "#7c6be0", icon: "▣" },
    { name: "Garden", x: 55, y: 71, w: 10, h: 11, c: "#2f86ff", icon: "✦" },
    { name: "Hostel", x: 64, y: 70, w: 17, h: 10, c: "#a65c27", icon: "⌂" },
    { name: "Admission Office", x: 56, y: 84, w: 12, h: 11, c: "#2f86ff", icon: "●" },
    { name: "Café", x: 70, y: 84, w: 11, h: 11, c: "#a65c27", icon: "☕" },
    { name: "Stationery Store", x: 83, y: 84, w: 13, h: 11, c: "#7c6be0", icon: "▣" }
];
const pinData = [
    { x: 55, y: 45, inc: 1 }, { x: 64, y: 68, inc: 0 }, { x: 76, y: 48, inc: 2 }, { x: 91, y: 62, inc: 4 }, { x: 78, y: 81, inc: 6 }, { x: 64, y: 91, inc: 3 }, { x: 95, y: 45, inc: 5 }, { x: 67, y: 24, inc: 8 }
];
let mapZoom = 100, activeLayer = "standard", currentIncident = null;

function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(window.__toast); window.__toast = setTimeout(() => t.classList.remove("show"), 2500) }
function showPage(id) { $$(".page").forEach(p => p.classList.remove("active")); $("#" + id)?.classList.add("active"); $$(".nav").forEach(n => n.classList.toggle("active", n.dataset.page === id)); $("#pageTitle").textContent = pages[id] || "Command Center"; if (id === "map") renderMap("campusMap"); if (id === "dashboard") renderMap("miniMap");  if (id === "incidents") {
    loadReportsFromDatabase();
} renderRows(); window.scrollTo({ top: 0, behavior: "smooth" }) }
$$(".nav").forEach(b => b.onclick = () => showPage(b.dataset.page)); $$("[data-target]").forEach(b => b.onclick = () => showPage(b.dataset.target));

function clock() { const d = new Date(); $("#clock").textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) } setInterval(clock, 1000); clock();
setTimeout(() => $("#boot").classList.add("fade"), 1100);
setTimeout(() => $$("[data-count]").forEach(el => { const target = +el.dataset.count; let n = 0; const step = Math.max(1, Math.ceil(target / 40)); const timer = setInterval(() => { n = Math.min(target, n + step); el.textContent = n.toLocaleString(); if (n >= target) clearInterval(timer) }, 22) }), 900);

function svgMap(target) {
    const id = target.replace(/[^a-z]/gi, "");
    const roads = `<path d="M70 0 C100 140 75 230 95 700 M250 0 C270 120 240 220 260 700 M450 0 C420 130 470 250 450 700 M680 0 C650 150 700 280 675 700 M890 0 C860 130 900 260 875 700" stroke="#152638" stroke-width="70" fill="none"/><path d="M0 145H1000 M0 350H1000 M0 555H1000" stroke="#1c2c3d" stroke-width="52"/><path d="M0 145H1000 M0 350H1000 M0 555H1000" stroke="#607084" stroke-width="1.3" stroke-dasharray="10 9"/>`;
    const b = buildings.map((o, i) => `<g class="building" data-name="${o.name}" transform="translate(${o.x * 10},${o.y * 7})"><rect width="${o.w * 10}" height="${o.h * 7}" rx="8" fill="${o.c}" fill-opacity=".12" stroke="${o.c}" stroke-width="2"/><rect x="5" y="5" width="${o.w * 10 - 10}" height="${o.h * 7 - 10}" rx="5" fill="none" stroke="${o.c}" stroke-opacity=".25"/><text x="${o.w * 5}" y="${o.h * 3.6}" text-anchor="middle" fill="#e7eff9" font-size="${o.name.length > 12 ? 10 : 12}" font-weight="700">${o.name}</text><text x="${o.w * 5}" y="${o.h * 5.1}" text-anchor="middle" fill="${o.c}" font-size="15">${o.icon}</text></g>`).join("");
    const pins = pinData.map((p, i) => { const inc = incidents[p.inc]; return `<g class="pin" data-i="${p.inc}" transform="translate(${p.x * 10},${p.y * 7})"><circle r="${inc.priority > 85 ? 17 : 12}" fill="${inc.color}" opacity=".16"><animate attributeName="r" from="8" to="${inc.priority > 85 ? 25 : 19}" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" from=".28" to="0" dur="1.8s" repeatCount="indefinite"/></circle><circle r="${inc.priority > 85 ? 8 : 6}" fill="${inc.color}" stroke="#fff" stroke-opacity=".7"/><text y="3" text-anchor="middle" fill="#fff" font-size="8" font-weight="800">!</text></g>` }).join("");
    return `<svg class="map-svg layer-${activeLayer}" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice"><defs><pattern id="g${id}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#19324b" stroke-opacity=".22"/></pattern><filter id="blur${id}"><feGaussianBlur stdDeviation="22"/></filter></defs><rect width="1000" height="700" fill="#06101a"/><rect width="1000" height="700" fill="url(#g${id})"/>${activeLayer === "heat" ? `<g filter="url(#blur${id})" opacity=".55"><circle cx="640" cy="470" r="90" fill="#2f86ff"/><circle cx="550" cy="300" r="70" fill="#f04450"/><circle cx="760" cy="340" r="75" fill="#ffad45"/><circle cx="900" cy="420" r="60" fill="#8b76ff"/></g>` : ""}${activeLayer === "risk" ? `<path d="M510 390 Q650 330 780 430 T960 420 L960 600 Q820 590 690 530 T510 540Z" fill="#f04450" opacity=".09" stroke="#f04450" stroke-dasharray="7 7"/><path d="M520 170 Q650 120 800 180 T980 190" fill="none" stroke="#ffad45" opacity=".18" stroke-width="50"/>` : ""}${roads}<g>${b}</g>${pins}<g><rect x="18" y="30" width="75" height="28" rx="6" fill="#0b1623" stroke="#2f86ff"/><text x="55" y="48" text-anchor="middle" fill="#75b6ff" font-size="10" font-weight="700">GATE-2</text><rect x="18" y="600" width="75" height="28" rx="6" fill="#0b1623" stroke="#2f86ff"/><text x="55" y="618" text-anchor="middle" fill="#75b6ff" font-size="10" font-weight="700">GATE-1</text></g><text x="520" y="30" fill="#60748a" font-size="9">BAUET DIGITAL CIVIC TWIN · LIVE</text></svg>`
}
function renderMap(target) {
    const el = $("#" + target); if (!el) return; el.innerHTML = svgMap(target);
    el.querySelectorAll(".pin").forEach(p => p.onclick = () => openIncident(incidents[+p.dataset.i]));
    el.querySelectorAll(".building").forEach(b => b.onclick = () => selectZone(b.dataset.name));
    el.querySelector(".map-svg").style.transform = `scale(${mapZoom / 100})`;
}
function selectZone(name) { const related = incidents.filter(i => i.loc.toLowerCase().includes(name.toLowerCase()) || i.loc.includes(name)); $("#zoneInfo").innerHTML = `<b>${name}</b><span>${related.length || 1} active intelligence item${related.length === 1 ? "" : "s"}</span><span>${related.reduce((a, x) => a + x.reports, 0) || Math.floor(Math.random() * 40 + 10)} reports linked</span>`; $("#inspectorTitle").textContent = name; $("#inspectorDesc").textContent = "Location intelligence selected from campus digital twin."; $("#riskScore").textContent = related.length ? Math.max(...related.map(x => x.priority)) : Math.floor(Math.random() * 25 + 30); $("#reportScore").textContent = related.reduce((a, x) => a + x.reports, 0) || "—"; $("#inspectorBody").innerHTML = `<div class="mini-row"><span>AI status</span><b class="good">Monitoring</b></div><div class="mini-row"><span>Top issue</span><b>${related[0]?.type || "No active cluster"}</b></div><div class="mini-row"><span>Recommended</span><b>${related[0]?.owner || "Observe"}</b></div>` }
function openIncident(inc) { currentIncident = inc; $("#modalTag").textContent = inc.status.toUpperCase() + " INCIDENT"; $("#modalTitle").textContent = inc.title; $("#modalDesc").textContent = `${inc.type} detected at ${inc.loc}. CivicLens AI combines evidence, affected population, recurrence, recency and location criticality to prioritize this incident.`; $("#modalScore").textContent = inc.priority; $("#modalReports").textContent = inc.reports; $("#modalReason").textContent = `Priority is driven by ${inc.reports} linked reports, ${inc.priority >= 85 ? "critical impact and recurring evidence" : "moderate impact and location context"}, plus recent activity.`; $("#incidentModal").classList.remove("hidden") }
$("#closeModal").onclick = $("#modalClose2").onclick = () => $("#incidentModal").classList.add("hidden"); $("#incidentModal").onclick = e => { if (e.target.id === "incidentModal") $("#incidentModal").classList.add("hidden") }; $("#modalOpen").onclick = () => { $("#incidentModal").classList.add("hidden"); showPage("authority") };

function setLayer(layer) { activeLayer = layer; $$("[data-layer]").forEach(b => b.classList.toggle("active", b.dataset.layer === layer)); renderMap("miniMap"); renderMap("campusMap"); toast(`${layer.toUpperCase()} layer enabled`) }
$$("[data-layer]").forEach(b => b.onclick = () => setLayer(b.dataset.layer));
$("#locate").onclick = () => { mapZoom = 110; $("#zoomVal").textContent = "110%"; renderMap("campusMap"); toast("Campus position centered · live grid locked") };
$("#zoomIn").onclick = () => { mapZoom = Math.min(135, mapZoom + 10); $("#zoomVal").textContent = mapZoom + "%"; renderMap("campusMap") };
$("#zoomOut").onclick = () => { mapZoom = Math.max(80, mapZoom - 10); $("#zoomVal").textContent = mapZoom + "%"; renderMap("campusMap") };
$("#simulate").onclick = () => { const i = incidents[Math.floor(Math.random() * incidents.length)]; i.priority = Math.min(99, i.priority + 3); toast(`Live simulation: ${i.type} spike detected at ${i.loc}`); openIncident(i); renderMap("campusMap") };

$$(".queue-item").forEach(q => q.onclick = () => openIncident(incidents[{ water: 0, road: 1, waste: 2, light: 3 }[q.dataset.incident]]));
$("#alertBtn").onclick = () => toast("5 active alerts · 2 critical · 3 high priority");
$("#evidenceBtn").onclick = () => toast("Evidence picker opened · demo mode");
// Safe check diye analyze button select kora
const analyzeBtn = document.getElementById("analyze") || document.querySelector("#analyze");

if (analyzeBtn) {
    analyzeBtn.onclick = async () => {
        const text = document.getElementById("issueText") ? document.getElementById("issueText").value.trim() : "";
        const locationInput = document.getElementById("location");
        const location = locationInput ? locationInput.value : "Campus Area";

        if (!text) {
            alert("Please enter an issue description first!");
            return;
        }

        const aiResultBox = document.getElementById("aiResult");
        if (aiResultBox) {
            aiResultBox.innerHTML = "Analyzing issue with Gemini AI...";
        }

        try {
            // Django backend-e fetch diye data pathano hocche
            const response = await fetch('/app/analyze/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    description: text, 
                    location: location 
                })
            });

            const result = await response.json();

            if (result.success) {
                const data = result.data;
                
                if (aiResultBox) {
                    aiResultBox.innerHTML = `
                        AI ANALYSIS COMPLETE (GEMINI)<br>
                        <b>Category:</b> ${data.category}<br>
                        <b>Severity/Priority:</b> ${data.priority}<br>
                        <b>AI Confidence:</b> ${data.confidence}<br>
                        <b>Location:</b> ${data.location}<br>
                        <b>Assigned Dept:</b> ${data.owner}<br>
                        <hr>
                        <b>AI PRIORITY SCORE:</b> ${data.score}/100<br>
                        ✓ Tracking ID: ${data.tracking_id}
                    `;
                }

                const submitReportBtn = document.getElementById("submitReport");
                if (submitReportBtn) submitReportBtn.onclick = async () => {

    toast(
        `Sending ${data.tracking_id} to Incident Operations...`
    );


    // নতুন report memory-তেও add হবে
    const priorityScore = Number(data.score || 50);

    let color = "#2f86ff";

    if (
        data.priority === "Critical" ||
        priorityScore >= 90
    ) {

        color = "#f04450";

    }

    else if (
        data.priority === "High" ||
        priorityScore >= 70
    ) {

        color = "#ffad45";

    }


    const newIncident = {

        id: data.tracking_id,

        title:
            data.description && data.description.length > 45
                ? data.description.substring(0, 45) + "..."
                : (data.category || "New Civic Incident"),

        loc: data.location,

        type: data.category,

        priority: priorityScore,

        status: data.status || "Under Review",

        owner: data.owner,

        reports: 1,

        color: color,

        isDatabaseReport: true
    };


    // duplicate prevent
    const alreadyExists = incidents.some(
        incident =>
            incident.id === newIncident.id
    );


    if (!alreadyExists) {

        incidents.unshift(newIncident);

    }


    renderRows();


    toast(
        `✓ ${data.tracking_id} sent to Incident Operations`
    );


    // 1 second পরে Incident Operations open
    setTimeout(() => {

        showPage("incidents");

    }, 700);

};
                }
             else {
                if (aiResultBox) {
                    aiResultBox.innerHTML = "Error: " + (result.error || "Failed to analyze.");
                }
            }
        } catch (error) {
            console.error("Connection Error:", error);
            if (aiResultBox) {
                aiResultBox.innerHTML = "Error: Could not connect to the backend server.";
            }
        }
    };
}

function renderRows(filter = "") {
    const host = $("#incidentRows"); if (!host) return; const q = filter.toLowerCase(); host.innerHTML = incidents.filter(i => `${i.id} ${i.title} ${i.loc} ${i.owner}`.toLowerCase().includes(q)).map((i, idx) => `<div class="tr"><span><b>${i.title}</b><small>${i.id}</small></span><span>${i.loc}</span><span><b class="${i.priority >= 85 ? "danger" : i.priority >= 65 ? "warn" : "good"}">${i.priority}</b></span><span><em class="badge ${i.status.toLowerCase().replace(" ", "-")}">${i.status}</em></span><span>${i.owner}</span><button class="open-row" data-row="${incidents.indexOf(i)}">→</button></div>`).join("");
    host.querySelectorAll(".open-row").forEach(b => b.onclick = () => openIncident(incidents[+b.dataset.row]));
}

async function loadReportsFromDatabase() {

    try {

        const response = await fetch('/app/reports/');

        const result = await response.json();

        if (!result.success) {
            console.error("Could not load reports");
            return;
        }

        const databaseReports = result.data.map(report => {

            let color = "#2f86ff";

            if (
                report.priority === "Critical" ||
                report.score >= 90
            ) {
                color = "#f04450";
            }

            else if (
                report.priority === "High" ||
                report.score >= 70
            ) {
                color = "#ffad45";
            }

            else if (
                report.status === "Resolved"
            ) {
                color = "#45d991";
            }

            return {

                id: report.tracking_id,

                title:
                    report.description &&
                    report.description.length > 45
                        ? report.description.substring(0, 45) + "..."
                        : report.description,

                loc: report.location,

                type: report.category || "General",

                priority: Number(report.score || 50),

                status: report.status || "Under Review",

                owner: report.owner || "Not Assigned",

                reports: 1,

                color: color,

                isDatabaseReport: true
            };

        });


        const existingIds = new Set(
            incidents.map(i => i.id)
        );


        databaseReports.forEach(report => {

            if (!existingIds.has(report.id)) {
                incidents.unshift(report);
            }

        });


        renderRows();

    }

    catch (error) {

        console.error(
            "Database report loading error:",
            error
        );

    }

}


renderRows(); $("#incidentSearch").oninput = e => renderRows(e.target.value);
$$(".filters button").forEach(b => b.onclick = () => { $$(".filters button").forEach(x => x.classList.remove("active")); b.classList.add("active"); const f = b.textContent; renderRows(f === "All" ? "" : f === "Critical" ? "critical" : ""); if (f !== "All" && f !== "Critical") toast(`${f} filter selected`) });
$("#exportBtn").onclick = () => { const csv = "ID,Title,Location,Priority,Status,Owner,Reports\n" + incidents.map(i => `${i.id},${i.title},${i.loc},${i.priority},${i.status},${i.owner},${i.reports}`).join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "civiclens-incidents.csv"; a.click(); toast("Incident CSV exported") };

function addFeed(title, detail) { const f = $("#feed"); const d = document.createElement("div"); d.innerHTML = `<i class="blue"></i><span><b>${title}</b>${detail}<small>just now</small></span>`; f.prepend(d); if (f.children.length > 6) f.lastElementChild.remove() }
const responses = {
    "what is the highest priority incident?": "CL-2026-0847 — Severe Waterlogging at Pond Area, with an AI priority of 94/100 and 127 linked reports.",
    "which area is most risky?": "Pond Area is currently the highest-risk zone. The waterlogging cluster is showing a +34% trend.",
    "what should maintenance do now?": "Dispatch a maintenance team to Pond Area, verify drainage obstruction on site, and capture closure evidence before marking the incident resolved."
};
function ask(q) { q = q.trim(); if (!q) return; const chat = $("#chat"); chat.insertAdjacentHTML("beforeend", `<div class="chat-msg user">${q}</div>`); const key = Object.keys(responses).find(k => q.toLowerCase().includes(k.split("?")[0].toLowerCase().slice(0, 18))); let ans = key ? responses[key] : "Based on the current civic grid, I would prioritize the Pond Area waterlogging cluster, then Gate-2 road damage. I can also explain the score or suggest the next response."; setTimeout(() => { chat.insertAdjacentHTML("beforeend", `<div class="chat-msg bot">${ans}</div>`); chat.scrollTop = chat.scrollHeight }, 280) }
$("#chatSend").onclick = () => { ask($("#chatInput").value); $("#chatInput").value = "" }; $("#chatInput").onkeydown = e => { if (e.key === "Enter") { $("#chatSend").click() } };
$$(".quick button").forEach(b => b.onclick = () => ask(b.dataset.q));
$("#assign").onclick = () => { toast(`Response started · ${$("#owner").value} notified`); addFeed("Response workflow started", "CL-2026-0847 · Maintenance"); };
$("#notify").onclick = () => toast("7 response teams notified · acknowledgement window started");

function openPalette() { $("#commandPalette").classList.remove("hidden"); $("#paletteInput").focus() }
$("#commandBtn").onclick = openPalette; document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette() } if (e.key === "Escape") { $$(".modal").forEach(m => m.classList.add("hidden")) } });
$("#commandPalette").onclick = e => { if (e.target.id === "commandPalette") e.target.classList.add("hidden") };
$("#paletteInput").oninput = e => { const q = e.target.value.toLowerCase(); $("#paletteItems").querySelectorAll("button").forEach(b => b.style.display = b.textContent.toLowerCase().includes(q) ? "flex" : "none") };
$("#paletteItems").querySelectorAll("button").forEach(b => b.onclick = () => { $("#commandPalette").classList.add("hidden"); showPage(b.dataset.cmd) });
$("#copilotFloat").onclick = () => showPage("ai");
$("#inspectAction").onclick = () => showPage("ai");
renderMap("miniMap");




document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReportsFromDatabase();

    }
);