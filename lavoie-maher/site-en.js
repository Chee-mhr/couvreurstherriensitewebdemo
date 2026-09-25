(() => {
"use strict";
// Ouvrir en haut de page (sauf lien direct vers une section), sans restaurer l'ancienne position
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) scrollTo(0, 0);
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => n.toLocaleString("en-CA");
const norm = s => { let o = ""; for (const c of s.toLowerCase()) { const d = c.normalize("NFD").replace(/[̀-ͯ]/g, ""); o += d.length === 1 ? d : c; } return o; };
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const onView = (el, fn, opts = { threshold: .25 }) => {
  const io = new IntersectionObserver(es => es.forEach(e => fn(e.isIntersecting, e)), opts);
  io.observe(el); return io;
};

/* ---------- barre de navigation ---------- */
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("solid", scrollY > 30);
addEventListener("scroll", onScroll, { passive: true }); onScroll();

/* ---------- reveals (only below-the-fold elements start hidden) ---------- */
if (!RM) {
  const vh = innerHeight;
  $$(".reveal").forEach((el, i) => {
    if (el.getBoundingClientRect().top < vh * .95) return;
    el.classList.add("pending");
    const io = onView(el, v => { if (v) { el.style.transitionDelay = (el.classList.contains("cap") ? (i % 3) * .08 : 0) + "s"; el.classList.remove("pending"); io.disconnect(); } }, { threshold: .12 });
  });
}

/* =========================================================
   HERO — tunnel d'archives
   ========================================================= */
const QUERIES = [
  { mode: "question", q: "When was the formal notice sent?", stat: "3 passages · volume and page", hits: [
    ["P-7", "This constitutes a <mark>formal notice</mark> to deliver the work…", "Vol. 2 · p. 14"],
    ["P-4", "…I will send you a <mark>formal notice</mark> if the delay continues.", "Vol. 2 · p. 9"],
    ["Vol. 7", "Q. The <mark>formal notice</mark>, you sent it on the 19th? A. Yes.", "Examination · Vol. 7 · p. 212"]] },
  { mode: "mentions", q: "french drain", stat: "3 exhibits · 10 mentions · 7 ms", hits: [
    ["P-15", "5 mentions", "Expert report · Vol. 3"],
    ["P-1", "3 mentions", "Construction contract · Vol. 1"],
    ["P-12", "2 mentions", "Site meeting minutes · Vol. 2"]] },
  { mode: "partout", q: "harassment", stat: "123 passages · 3 files", hits: [
    ["File A", "61 passages", "12 volumes"],
    ["File B", "38 passages", "7 volumes"],
    ["File C", "24 passages", "3 volumes"]] }
];
(function hero() {
  const cv = $("#field"), ctx = cv.getContext("2d");
  const hitsEl = $("#hits"), qmode = $("#qmode"), qtext = $("#qtext"), qstat = $("#qstat"), qbar = $("#qbar"), qcount = $("#qcount");
  let W = 0, H = 0, DPR = 1, F = 520;
  const DEPTH = 3200, NEAR = -F * .55;
  const N = innerWidth < 700 ? 500 : 1100;
  const P = [];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = 380 + Math.random() * 900;
    P.push({ a, r, z: NEAR + Math.random() * (DEPTH - NEAR), w: 10 + Math.random() * 8, tw: Math.random() * 6.28, lit: 0, m: null });
  }
  const resize = () => { const b = cv.getBoundingClientRect(); DPR = Math.min(devicePixelRatio || 1, 2); W = b.width; H = b.height; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); F = Math.max(380, W * .42); };
  resize(); addEventListener("resize", resize);
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener("pointermove", e => { tmx = (e.clientX / innerWidth - .5); tmy = (e.clientY / innerHeight - .5); }, { passive: true });

  let roll = 0, scanZ = -1e9, matched = [], phase = "idle", pt = 0, qi = 0, cardRows = [], curQ = QUERIES[0];
  const cxF = () => (W > 980 ? W * .56 : W * .5), cyF = () => H * .46;
  function proj(p) {
    const ang = p.a + roll, x = Math.cos(ang) * p.r + mx * 70, y = Math.sin(ang) * p.r * .72 + my * 50;
    const s = F / (F + p.z); return { x: cxF() + x * s, y: cyF() + y * s, s };
  }
  const typeTo = (txt, done) => {
    if (RM) { qtext.textContent = txt; return done(); }
    let i = 0; qtext.textContent = "";
    const t = setInterval(() => { qtext.textContent = txt.slice(0, ++i); if (i >= txt.length) { clearInterval(t); done(); } }, 34);
  };
  function renderHits(q, show) {
    hitsEl.innerHTML = q.hits.map(h => `<div class="hit"><span class="cote">${h[0]}</span><p>${h[1]}</p><span class="loc">${h[2]}</span></div>`).join("");
    cardRows = $$(".hit", hitsEl);
    if (show) cardRows.forEach(r => r.classList.add("on"));
  }
  function cycle() {
    const q = curQ = QUERIES[qi++ % QUERIES.length];
    qmode.textContent = q.mode; renderHits(q, false); qbar.style.width = "0"; qstat.textContent = "Typing the question…";
    typeTo(q.q, () => {
      phase = "scan"; pt = 0; qstat.textContent = "Reading the index…"; scanZ = DEPTH;
    });
  }
  function startMatch() {
    phase = "match"; pt = 0;
    const cand = P.filter(p => p.z > 300 && p.z < 1600).sort(() => Math.random() - .5).slice(0, cardRows.length * 3);
    const cb = cv.getBoundingClientRect();
    matched = cand.map((p, i) => {
      const s = proj(p); const row = cardRows[i % cardRows.length].getBoundingClientRect();
      p.m = { sx: s.x, sy: s.y, tx: row.left - cb.left + 8 + (i / cardRows.length | 0) * 10, ty: row.top - cb.top + row.height / 2 + ((i / cardRows.length | 0) - 1) * 6, row: i % cardRows.length };
      return p;
    });
    qstat.textContent = curQ.stat;
  }
  let last = performance.now(), running = true, raf = 0;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    mx += (tmx - mx) * .04; my += (tmy - my) * .04;
    roll += dt * .015;
    ctx.clearRect(0, 0, W, H);
    const speed = phase === "scan" ? 190 : 55;
    if (phase === "scan") {
      pt += dt; scanZ -= dt * 2600;
      qbar.style.width = Math.min(100, pt / 1.3 * 100) + "%";
      qcount.textContent = fmt(Math.min(8622, Math.round(pt / 1.3 * 8622)));
      if (pt > 1.3) startMatch();
    } else if (phase === "match") {
      pt += dt;
      cardRows.forEach((r, i) => { if (pt > .55 + i * .18) r.classList.add("on"); });
      if (pt > 5.2) { phase = "release"; pt = 0; }
    } else if (phase === "release") {
      pt += dt; cardRows.forEach(r => r.classList.remove("on"));
      if (pt > .6) { matched.forEach(p => p.m = null); matched = []; phase = "idle"; pt = 0; }
    } else if (phase === "idle") { pt += dt; if (pt > .6) { phase = "typing"; cycle(); } }

    // draw field
    for (const p of P) {
      if (p.m) continue;
      p.z -= speed * dt;
      if (p.z < NEAR) p.z += DEPTH - NEAR;
      const s = proj(p);
      if (s.x < -40 || s.x > W + 40 || s.y < -40 || s.y > H + 40) continue;
      const depthA = Math.min(1, (DEPTH - p.z) / DEPTH * 1.4) * Math.min(1, (p.z - NEAR) / 220);
      if (Math.abs(p.z - scanZ) < 160) p.lit = 1;
      p.lit *= .94;
      const w = p.w * s.s, h = w * 1.3;
      const tw = .55 + .45 * Math.sin(now / 900 + p.tw);
      if (p.lit > .05) { ctx.fillStyle = `rgba(180,180,187,${(.18 + .32 * p.lit) * depthA})`; }
      else ctx.fillStyle = `rgba(215,215,220,${.16 * depthA * tw})`;
      ctx.fillRect(s.x - w / 2, s.y - h / 2, w, h);
      if (w > 9 && p.lit < .05) { ctx.fillStyle = `rgba(11,11,12,${.5 * depthA})`; for (let l = 0; l < 3; l++) ctx.fillRect(s.x - w * .32, s.y - h * .28 + l * h * .2, w * .64 * (l === 2 ? .6 : 1), Math.max(.6, h * .05)); }
    }
    // matched docs fly to the console
    if (matched.length) {
      const k = phase === "release" ? 1 : Math.min(1, pt / 1.1), e = 1 - Math.pow(1 - k, 3);
      const fade = phase === "release" ? 1 - pt / .6 : 1;
      ctx.lineWidth = 1;
      matched.forEach((p, i) => {
        const m = p.m, x = m.sx + (m.tx - m.sx) * e, y = m.sy + (m.ty - m.sy) * e - Math.sin(e * Math.PI) * 60;
        ctx.strokeStyle = `rgba(210,181,122,${.18 * fade * (1 - e * .5)})`;
        ctx.beginPath(); ctx.moveTo(m.sx, m.sy); ctx.quadraticCurveTo((m.sx + x) / 2, Math.min(m.sy, y) - 80, x, y); ctx.stroke();
        const w = 14 - e * 6, h = w * 1.3;
        ctx.fillStyle = `rgba(210,181,122,${.85 * fade})`; ctx.fillRect(x - w / 2, y - h / 2, w, h);
      });
    }
    if (running) raf = requestAnimationFrame(frame);
  }
  if (RM) { renderHits(QUERIES[0], true); qtext.textContent = QUERIES[0].q; qstat.textContent = QUERIES[0].stat; qbar.style.width = "100%";
    running = false; frame(performance.now()); return; }
  renderHits(QUERIES[0], false);
  raf = requestAnimationFrame(frame);
  onView($(".hero"), v => { if (v && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } else if (!v) { running = false; cancelAnimationFrame(raf); } }, { threshold: 0 });
})();

/* =========================================================
   L&M-1 — recherche sur dossier fictif
   ========================================================= */
const DOCS = [
  { c: "P-1", t: "Construction contract", d: "2021-02-03", p: 18, x: "The parties agree that the Contractor will deliver the work no later than June 15, 2021. Failing that, a late penalty of $2,500 per day will be payable (s. 7.4). The French drain is included in the specifications (s. 7.2). Acceptance of the work will be recorded in writing (s. 9.1)." },
  { c: "P-4", t: "Email from Mr. Tremblay to Ms. Gagnon", d: "2021-03-12", p: 1, x: "Ms. Gagnon, we note a delay of about three weeks on the site. Without a catch-up plan by Friday, I will send you a formal notice to meet the schedule." },
  { c: "P-7", t: "Formal notice", d: "2021-03-19", p: 2, x: "This constitutes a formal notice to deliver the work in accordance with the contract. We will claim the agreed late penalty, i.e. 29 days, for a total of $72,500." },
  { c: "D-2", t: "Email from Ms. Gagnon", d: "2021-04-02", p: 1, x: "The delay is due exclusively to the exceptional rain in March. We saw no water infiltration before May. No penalty is justified." },
  { c: "P-12", t: "Site meeting minutes", d: "2021-05-04", p: 4, x: "Water infiltration noted in the basement, present since mid-March according to the superintendent. The French drain is not visible in the excavation. Photos attached." },
  { c: "P-15", t: "Expert report, eng.", d: "2022-01-20", p: 31, x: "The cracks observed in the foundation result from missing perimeter drainage, not from frost action. The planned French drain was never installed. Repairs estimated at $38,500." },
  { c: "P-21", t: "Text message from Ms. Gagnon", d: "2021-06-02", p: 1, x: "We'll finish next week, promise. Finishing and landscaping are left. The rain held us up again." },
  { c: "D-5", t: "Final invoice", d: "2021-06-30", p: 2, x: "Final invoice for work performed: $84,350.00 taxes included, payable upon acceptance of the work." },
  { c: "D-9", t: "Site photos (automatic reading)", d: "2021-04-20", p: 22, x: "Photo 14: open trench on the north side, standing water. Photo 15: membrane installed, no drain visible. Handwritten note: “rain, 2-day stoppage”." },
  { c: "P-33", t: "Examination on discovery of Mr. Tremblay", d: "2023-03-08", p: 212, x: "Q. The formal notice, you sent it on March 19? A. Yes. Q. The water infiltration, when did you see it? A. From mid-March, in the basement, after the cracks." },
  { c: "P-40", t: "Email from Mtre Roy", d: "2021-07-14", p: 2, x: "Provisional acceptance granted with reservations: drainage, foundation cracks and incomplete landscaping. Signed today by the parties." },
  { c: "P-47", t: "Bank statement", d: "2021-08-02", p: 3, x: "Final payment to the Contractor: $11,850.00. $72,500.00 withheld from the final payment as the late penalty." }
];
(function search() {
  const STOP = new Set("the of and a an to in on at by for with from is was are be it its this that who what when where how did do does you your we our they".split(" "));
  const mm = $("#minimap"), res = $("#sres"), inp = $("#sq"), pagesEl = $("#spages"), timeEl = $("#stime");
  const CELLS = 24 * 6;
  mm.innerHTML = "<i></i>".repeat(CELLS);
  const cells = $$("i", mm);
  const cellOf = DOCS.map((_, i) => Math.floor((i + .5) / DOCS.length * CELLS));
  let run = 0;
  const terms = q => norm(q).split(/[^a-z0-9$]+/).filter(t => t.length > 2 && !STOP.has(t)).map(t => t.replace(/(s|x)$/, ""));
  // Une mention = l'expression entière (accents repliés, pluriels tolérés, un ou deux petits mots entre les termes permis)
  const phraseRe = ts => new RegExp("\\b" + ts.map(t => t + "(?:e?s|x)?").join("(?:[\\s']+[a-z]{1,3}){0,2}[\\s']+") + "\\b", "g");
  const termRe = t => new RegExp("\\b" + t + "(?:e?s|x)?\\b", "g");
  const spans = (n, re) => { const out = []; let m; re.lastIndex = 0; while ((m = re.exec(n))) { out.push([m.index, m.index + m[0].length]); if (!m[0].length) re.lastIndex++; } return out; };
  function highlight(text, hits) {
    const marks = new Array(text.length).fill(false);
    hits.forEach(([a, b]) => { for (let k = a; k < b; k++) marks[k] = true; });
    let out = "", open = false;
    for (let i = 0; i < text.length; i++) { if (marks[i] && !open) { out += "<mark>"; open = true; } if (!marks[i] && open) { out += "</mark>"; open = false; } out += esc(text[i]); }
    return out + (open ? "</mark>" : "");
  }
  function go(q) {
    const id = ++run, ts = terms(q);
    const pr = ts.length ? phraseRe(ts) : null;
    let scored = !pr ? [] : DOCS.map((d, i) => { const h = spans(norm(d.x), pr), t = spans(norm(d.t), pr); return { d, i, s: h.length + t.length, h }; }).filter(r => r.s > 0);
    if (ts.length > 1 && !scored.length) // aucune expression exacte : pièces où tous les termes apparaissent
      scored = DOCS.map((d, i) => { const n = norm(d.x), per = ts.map(t => spans(n, termRe(t))); return { d, i, s: per.every(x => x.length) ? per.reduce((a, x) => a + x.length, 0) : 0, h: per.flat() }; }).filter(r => r.s > 0);
    scored.sort((a, b) => b.s - a.s);
    const max = scored[0]?.s || 1, total = 8622, dur = RM ? 0 : 1100, t0 = performance.now();
    res.innerHTML = `<p class="empty mono">Reading the index…</p>`;
    cells.forEach(c => c.className = "");
    const hitCells = new Set(scored.map(r => cellOf[r.i]));
    const step = now => {
      if (id !== run) return;
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      pagesEl.textContent = fmt(Math.round(total * k));
      timeEl.textContent = Math.round(k * 7) + " ms";
      const upto = Math.floor(k * CELLS);
      for (let i = 0; i < upto; i++) cells[i].className = hitCells.has(i) ? "hit" : (i > upto - 10 ? "scan" : "");
      if (k < 1) return requestAnimationFrame(step);
      cells.forEach((c, i) => c.className = hitCells.has(i) ? "hit" : "");
      if (!ts.length || !scored.length) { res.innerHTML = `<p class="empty">No passage in this sample file matches “${esc(q)}”. Try one of the suggestions above.</p>`; return; }
      res.innerHTML = scored.slice(0, 5).map((r, j) => `<article class="res" style="animation-delay:${j * .09}s"><div class="res-head"><span class="cote">${r.d.c}</span><strong>${esc(r.d.t)}</strong><span class="mcount">${r.s} mention${r.s > 1 ? "s" : ""}</span><span class="mono">${r.d.d} · ${r.d.p} p.</span></div><p>${highlight(r.d.x, r.h)}</p><div class="score" title="Pertinence"><i style="width:${Math.round(40 + 60 * r.s / max)}%"></i></div></article>`).join("");
    };
    requestAnimationFrame(step);
  }
  $("#sform").addEventListener("submit", e => { e.preventDefault(); go(inp.value); });
  $$("#chips .chip").forEach(c => c.addEventListener("click", () => { inp.value = c.textContent; go(inp.value); }));
  let started = false;
  onView($("#recherche"), v => { if (v && !started) { started = true; go(inp.value); } }, { threshold: .2 });
})();

/* =========================================================
   L&M-2 — transcription synchronisée
   ========================================================= */
(function transcript() {
  const U = [
    ["04:11:52", "04:11:58", "Q. I am showing you exhibit P-7. Do you recognize it?"],
    ["04:11:58", "04:12:08", "A. Yes. It is the formal notice sent to Ms. Gagnon."],
    ["04:12:08", "04:12:11", "Q. On what date did you send it?"],
    ["04:12:11", "04:12:20", "A. On March 19, 2021, by email."],
    ["04:12:20", "04:12:26", "Objection, service is not in evidence."],
    ["04:12:26", "04:12:33", "Q. What made you send it at that point?"],
    ["04:12:33", "04:12:44", "A. The water in the basement. We saw it from mid-March."],
    ["04:12:44", "04:12:47", "Q. So before May?"],
    ["04:12:47", "04:12:55", "A. Well before. The May minutes only confirmed it."],
    ["04:12:55", "04:13:01", "Q. And the French drain, did you see it installed?"],
    ["04:13:01", "04:13:04", "A. Never."]
  ];
  const box = $("#script");
  box.innerHTML = U.map(u => `<div class="utt"><span class="t">${u[0]}</span><span class="who seg">→ ${u[1]}</span><p>${u[2].split(" ").map(w => `<w>${esc(w)}</w>`).join(" ")}</p></div>`).join("");
  const utts = $$(".utt", box), clock = $("#clock");
  const toS = t => { const [h, m, s] = t.split(":").map(Number); return h * 3600 + m * 60 + s; };
  const pad = n => String(n).padStart(2, "0");

  const cv = $("#wave"), ctx = cv.getContext("2d");
  const BARS = 220, amp = [];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < BARS; i++) { const env = .35 + .65 * Math.abs(Math.sin(i * .045) * Math.cos(i * .013)); amp.push(Math.max(.06, env * (.35 + rnd() * .65))); }
  let W = 0, H = 0;
  const size = () => { const b = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = b.width; H = b.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener("resize", size);

  let ui = 0, wi = 0, playing = !RM, visible = false, acc = 0, prog = .545, last = 0;
  function setUtt(i) {
    utts.forEach((u, k) => { u.classList.toggle("live", k <= i); if (k < i) $$("w", u).forEach(w => { w.className = "said"; }); if (k > i) $$("w", u).forEach(w => w.className = ""); });
    const off = Math.max(0, utts[i].offsetTop - 150);
    box.style.transform = `translateY(${-off}px)`;
  }
  function tick() {
    const words = $$("w", utts[ui]);
    if (wi < words.length) { words.forEach((w, k) => w.className = k < wi ? "said" : k === wi ? "now" : ""); wi++; }
    else { words.forEach(w => w.className = "said"); ui = (ui + 1) % utts.length; wi = 0; if (ui === 0) utts.forEach(u => { u.classList.remove("live"); $$("w", u).forEach(w => w.className = ""); }); setUtt(ui); }
    const s = toS(U[ui][0]) + wi * .45; const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = Math.floor(s % 60);
    clock.textContent = `${pad(h)}:${pad(m)}:${pad(sec)}`;
    prog = s / (7 * 3600 + 42 * 60);
  }
  function draw(now) {
    const dt = last ? (now - last) / 1000 : 0; last = now;
    if (playing) { acc += dt; while (acc > .19) { acc -= .19; tick(); } }
    ctx.clearRect(0, 0, W, H);
    const bw = W / BARS, mid = H / 2, ph = prog * W;
    for (let i = 0; i < BARS; i++) {
      const x = i * bw, live = playing && Math.abs(x - ph) < 30 ? 1 + .35 * Math.sin(now / 90 + i) : 1;
      const a = amp[i] * (H * .46) * live;
      ctx.fillStyle = x < ph ? "rgba(210,181,122,.9)" : "rgba(200,200,206,.28)";
      ctx.fillRect(x + bw * .2, mid - a, Math.max(1, bw * .6), a * 2);
    }
    ctx.fillStyle = "#F5F5F7"; ctx.fillRect(ph - 1, 0, 2, H);
    ctx.beginPath(); ctx.arc(ph, 4, 4, 0, 7); ctx.fill();
    if (visible) requestAnimationFrame(draw); else last = 0;
  }
  setUtt(0);
  const btn = $("#play"), ico = $("#pico");
  const setIcon = () => { ico.innerHTML = playing ? '<rect x="3" y="2" width="3.5" height="12"/><rect x="9.5" y="2" width="3.5" height="12"/>' : '<path d="M4 2l10 6-10 6z"/>'; btn.setAttribute("aria-label", playing ? "Pause" : "Play"); };
  setIcon();
  btn.addEventListener("click", () => { playing = !playing; setIcon(); });
  onView($("#transcription"), v => { const was = visible; visible = v; if (v && !was) requestAnimationFrame(draw); }, { threshold: .05 });
  requestAnimationFrame(draw);
})();

/* =========================================================
   Index liminaires — lecture ligne par ligne
   ========================================================= */
(function lim() {
  const box = $("#lim"), src = $$(".lim-page p[data-k]", box), out = $$(".lim-card [data-k]", box);
  const all = () => { src.forEach(p => p.classList.remove("read")); out.forEach(o => o.classList.add("on")); };
  all();
  if (RM) return;
  let t = [];
  const run = () => {
    t.forEach(clearTimeout); t = [];
    out.forEach(o => o.classList.remove("on"));
    for (let k = 0; k < 8; k++) t.push(setTimeout(() => {
      src.forEach(p => p.classList.toggle("read", +p.dataset.k === k));
      out.filter(o => +o.dataset.k === k).forEach(o => o.classList.add("on"));
    }, 500 + k * 450));
    t.push(setTimeout(() => src.forEach(p => p.classList.remove("read")), 500 + 8 * 450));
  };
  let on = false;
  onView(box, v => { if (v && !on) { on = true; run(); } else if (!v && on) { on = false; t.forEach(clearTimeout); all(); } }, { threshold: .3 });
})();

/* =========================================================
   L&M-4 — construction du tableau
   ========================================================= */
(function lists() {
  const pr = $("#lprompt"), panes = $$(".lpane"), tabs = $$(".ltab"), foot = $("#lfoot");
  const FOOT = ["Witness B · 3 volumes · fictional example", "P-40 · 4 passages in 3 volumes · fictional example", "4 undertakings · 2 never followed up · fictional example", "3 exhibits discussed that no list declares · fictional example"];
  let t = [], cur = 0;
  const clear = () => { t.forEach(clearTimeout); t = []; };
  const show = (k, animate) => {
    clear(); cur = k;
    tabs.forEach((b, i) => { b.classList.toggle("on", i === k); b.setAttribute("aria-selected", i === k); });
    panes.forEach((p, i) => p.hidden = i !== k);
    foot.textContent = FOOT[k];
    const rows = $$("tbody tr", panes[k]), full = panes[k].dataset.prompt;
    if (!animate || RM) { pr.textContent = full; rows.forEach(r => r.classList.add("on")); return; }
    rows.forEach(r => r.classList.remove("on"));
    let i = 0; pr.textContent = "";
    const ty = setInterval(() => { pr.textContent = full.slice(0, i += 2); if (i >= full.length) { clearInterval(ty); rows.forEach((r, n) => t.push(setTimeout(() => r.classList.add("on"), 300 + n * 260))); } }, 22);
    t.push(ty);
  };
  tabs.forEach((b, i) => b.addEventListener("click", () => show(i, true)));
  show(0, false);
  let done = false;
  onView($("#listbox"), v => { if (v && !done) { done = true; show(cur, true); } }, { threshold: .3 });
})();

/* =========================================================
   Sceau — anneau de chiffrement
   ========================================================= */
(function seal() {
  const cv = $("#seal"), ctx = cv.getContext("2d");
  let S = 0; const size = () => { const b = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); S = b.width; cv.width = S * d; cv.height = S * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener("resize", size);
  const RING = "LAW 25 · 100% LOCAL PROCESSING · QUÉBEC · PROFESSIONAL SECRECY · ";
  let vis = false;
  function draw(now) {
    const c = S / 2, rot = RM ? 0 : now / 1000 * .03;
    ctx.clearRect(0, 0, S, S);
    // or en relief : dégradé clair-foncé, et un filet d'ombre décalé
    const gold = ctx.createLinearGradient(0, 0, S, S);
    gold.addColorStop(0, "#F1E2B8"); gold.addColorStop(.45, "#D2B57A"); gold.addColorStop(1, "#8C7443");
    [.47, .36].forEach(r => {
      ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c + 1, c + 1.5, r * S, 0, 7); ctx.stroke();
      ctx.strokeStyle = gold; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(c, c, r * S, 0, 7); ctx.stroke();
    });
    ctx.strokeStyle = "rgba(210,181,122,.22)"; ctx.lineWidth = 1;
    [.455, .375].forEach(r => { ctx.beginPath(); ctx.arc(c, c, r * S, 0, 7); ctx.stroke(); });
    ctx.fillStyle = "rgba(245,245,247,.78)"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `500 ${Math.max(10, S * .032)}px "JetBrains Mono", monospace`;
    const chars = [...RING], step = Math.PI * 2 / chars.length, rr = .415 * S;
    chars.forEach((ch, i) => { const a = i * step + rot - Math.PI / 2; ctx.save(); ctx.translate(c + Math.cos(a) * rr, c + Math.sin(a) * rr); ctx.rotate(a + Math.PI / 2); ctx.fillText(ch, 0, 0); ctx.restore(); });
    ctx.strokeStyle = gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(c, c, S * .2, 0, 7); ctx.stroke();
    ctx.fillStyle = gold; ctx.font = `500 ${S * .034}px "JetBrains Mono", monospace`; ctx.fillText("LAW", c, c - S * .075);
    ctx.fillStyle = "#F5F5F7"; ctx.font = `italic 500 ${S * .14}px "Bodoni Moda", Georgia, serif`; ctx.fillText("25", c, c + S * .02);
    if (vis && !RM) requestAnimationFrame(draw);
  }
  onView(cv, v => { const was = vis; vis = v; if (v && !was) requestAnimationFrame(draw); }, { threshold: 0 });
  requestAnimationFrame(draw);
  document.fonts?.ready.then(() => requestAnimationFrame(draw));
})();

/* ---------- classement : 4 modes, réversible ---------- */
(function sorter() {
  const F = [
    ["scan_0042.pdf", "pdf", "2021-02-03", 2480],
    ["RE_ RE_ delay (2).msg", "msg", "2021-03-12", 86],
    ["NOTICE_final_FINAL.docx", "docx", "2021-03-19", 142],
    ["Document (3).pdf", "pdf", "2021-04-02", 310],
    ["IMG_2231.jpg", "jpg", "2021-04-20", 3920],
    ["site minutes may.rtf", "rtf", "2021-05-04", 64],
    ["eng report v4.pdf", "pdf", "2022-01-20", 5210],
    ["REC_2023-03-08.wav", "wav", "2023-03-08", 812000]
  ];
  const TYPES = { pdf: "PDF", msg: "Emails", docx: "Documents", rtf: "Documents", jpg: "Images", wav: "Audio" };
  const size = kb => kb >= 1024 ? (kb / 1024).toFixed(kb >= 10240 ? 0 : 1)+ " MB" : kb + " KB";
  const nn = i => String(i + 1).padStart(3, "0");
  const byName = (a, b) => F[a][0].localeCompare(F[b][0], "en", { sensitivity: "base" });
  const MODES = [
    { key: "date", order: (a, b) => F[a][2].localeCompare(F[b][2]), name: (f, n) => `${f[2]}_${f[0]}` },
    { key: "name", order: byName, name: (f, n) => `${nn(n)}_${f[0]}` },
    { key: "type", group: f => TYPES[f[1]], order: byName, name: (f, n) => `${nn(n)}_${f[0]}` },
    { key: "size", order: (a, b) => F[b][3] - F[a][3], name: (f, n) => `${nn(n)}_${f[0]}`, showSize: true }
  ];
  const raw = $("#raw"), tree = $("#tree"), chips = $$("#sorter .chip[data-rule]"), undo = $("#undo"), label = $("#after-label"), note = $("#sort-note");
  raw.innerHTML = F.map(f => `<li><span class="ext">${f[1].toUpperCase()}</span><span>${esc(f[0])}</span></li>`).join("");
  const rawLis = $$("li", raw);
  const GL = "abcdefghijklmnopqrstuvwxyz0123456789_-";
  let timers = [], cur = 0;
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  function scramble(el, text) {
    if (RM) { el.textContent = text; return; }
    let f = 0; const N = 12;
    const it = setInterval(() => {
      f++; const k = Math.floor(text.length * f / N);
      el.textContent = text.slice(0, k) + Array.from(text.slice(k), c => c === " " ? " " : GL[Math.random() * GL.length | 0]).join("");
      if (f >= N) { clearInterval(it); el.textContent = text; }
    }, 40);
    timers.push(it);
  }
  const row = (i, show) => `<div class="f" data-i="${i}"><span class="ext">${F[i][1].toUpperCase()}</span><span></span>${show ? `<span class="size mono">${size(F[i][3])}</span>` : ""}</div>`;
  function render(groups, names, animate, showSize) {
    tree.innerHTML = groups.map(([g, ids]) => `<div class="folder"><b>${esc(g)}</b>${ids.map(i => row(i, showSize)).join("")}</div>`).join("");
    const rows = $$(".f", tree);
    if (!animate || RM) { rows.forEach(el => { el.classList.add("on"); $("span:nth-child(2)", el).textContent = names[+el.dataset.i]; }); return; }
    rows.forEach((el, n) => timers.push(setTimeout(() => {
      const i = +el.dataset.i; rawLis[i].classList.add("gone"); el.classList.add("on");
      scramble($("span:nth-child(2)", el), names[i]);
    }, 350 + n * 260)));
  }
  function build(r, animate) {
    clear(); cur = r;
    const M = MODES[r];
    chips.forEach((c, i) => c.classList.toggle("on", i === r));
    label.textContent = "After"; note.textContent = "mode: " + M.key;
    rawLis.forEach(l => l.classList.toggle("gone", !animate || RM));
    const ids = F.map((_, i) => i);
    let groups;
    if (M.group) {
      const m = new Map();
      ids.forEach(i => { const g = M.group(F[i]); if (!m.has(g)) m.set(g, []); m.get(g).push(i); });
      groups = [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "en")).map(([g, v]) => [g + "/", v.sort(M.order)]);
    } else groups = [["Sorted/", ids.sort(M.order)]];
    const names = {};
    groups.forEach(([, v]) => v.forEach((i, n) => names[i] = M.name(F[i], n)));
    render(groups, names, animate, M.showSize);
  }
  function restore() {
    clear();
    chips.forEach(c => c.classList.remove("on"));
    label.textContent = "After defaire_classement"; note.textContent = "original names restored";
    rawLis.forEach(l => l.classList.remove("gone"));
    const names = {}; F.forEach((f, i) => names[i] = f[0]);
    render([["Disclosure/", F.map((_, i) => i)]], names, true, false);
  }
  chips.forEach((c, i) => c.addEventListener("click", () => build(i, true)));
  undo.addEventListener("click", restore);
  build(0, false);
  let seen = false;
  onView($("#sorter"), v => { if (v && !seen) { seen = true; build(cur, true); } }, { threshold: .3 });
})();

/* ---------- témoins : z de deux proportions ---------- */
(function witnesses() {
  const W = [["Witness A", 4, 120, 31, 180], ["Witness B", 6, 150, 22, 160], ["Witness C", 3, 90, 15, 110], ["Witness D", 8, 200, 24, 210], ["Witness E", 5, 80, 16, 95], ["Witness F", 7, 140, 9, 150], ["Witness G", 10, 160, 12, 170]];
  const pct = p => (p * 100).toFixed(1) + "%";
  const rows = W.map(([n, x1, n1, x2, n2]) => {
    const p1 = x1 / n1, p2 = x2 / n2, pp = (x1 + x2) / (n1 + n2);
    const z = (p2 - p1) / Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2));
    return { n, x1, n1, x2, n2, p1, p2, d: (p2 - p1) * 100, z };
  }).sort((a, b) => b.d - a.d);
  const body = $("#witbody");
  body.innerHTML = rows.map(r => `<tr><td>${r.n}</td>
    <td><span class="pbar"><i data-w="${Math.min(100, r.p1 * 500)}"></i></span>${r.x1}/${r.n1} · ${pct(r.p1)}</td>
    <td><span class="pbar c"><i data-w="${Math.min(100, r.p2 * 500)}"></i></span>${r.x2}/${r.n2} · ${pct(r.p2)}</td>
    <td>${r.d.toFixed(1)} pts</td><td>${r.z.toFixed(2)}</td>
    <td>${Math.abs(r.z) >= 1.96 ? '<span class="tag hit">Significant change</span>' : '<span class="tag">Within margin</span>'}</td></tr>`).join("");
  const bars = $$("i[data-w]", body);
  const fill = () => bars.forEach(b => b.style.width = b.dataset.w + "%");
  fill();
  if (RM) return;
  let done = false;
  onView($("#witbox"), v => { if (v && !done) { done = true; bars.forEach(b => b.style.width = "0"); requestAnimationFrame(() => requestAnimationFrame(fill)); } }, { threshold: .3 });
})();

/* ---------- droit du travail : échéance art. 123 LNT ---------- */
(function lnt() {
  const MOIS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = $("#lnt-date"), u = $("#lnt-unknown"), res = $("#lnt-res"), sub = $("#lnt-sub");
  const txt = dt => `${MOIS[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
  function calc() {
    d.disabled = u.checked;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.value);
    if (u.checked || !m) {
      res.textContent = "Unknown"; res.classList.add("unk");
      sub.textContent = "Date of the event unknown: no deadline is calculated.";
      return;
    }
    const start = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    const end = new Date(start.getTime() + 45 * 86400000);
    res.classList.remove("unk"); res.textContent = txt(end);
    sub.textContent = `${txt(start)} + 45 days`;
  }
  d.addEventListener("input", calc); u.addEventListener("change", calc);
  $("#calc").addEventListener("submit", e => e.preventDefault());
  calc();
})();

/* ---------- versus ---------- */
if (RM) $("#versus").classList.add("go");
else onView($("#versus"), v => { if (v) $("#versus").classList.add("go"); }, { threshold: .35 });

/* ---------- steps ---------- */
onView($("#steps"), v => { if (v) $("#steps").classList.add("go"); }, { threshold: .4 });

/* ---------- form (démo : aucun envoi) ---------- */

/* ---------- téléphone : fiches, carrousels, bouton démo ---------- */
$$("table").forEach(t => {
  const hs = $$("thead th", t).map(th => th.textContent);
  $$("tbody tr", t).forEach(tr => [...tr.children].forEach((td, i) => td.dataset.label = hs[i] || ""));
});
$$(".swipe").forEach(sw => {
  const items = [...sw.children], dots = document.createElement("div");
  dots.className = "swipe-dots"; dots.setAttribute("aria-hidden", "true");
  dots.innerHTML = items.map((_, i) => `<i${i ? "" : ' class="on"'}></i>`).join("");
  sw.after(dots);
  const ds = [...dots.children];
  sw.addEventListener("scroll", () => {
    const w = items[0].getBoundingClientRect().width + 12;
    const k = Math.min(items.length - 1, Math.round(sw.scrollLeft / w));
    ds.forEach((d, i) => d.classList.toggle("on", i === k));
  }, { passive: true });
});
(() => {
  const b = $("#mcta"), hero = $(".hero"), demo = $("#demo");
  let demoVisible = false;
  onView(demo, v => { demoVisible = v; upd(); }, { threshold: 0 });
  function upd() { b.classList.toggle("show", scrollY > hero.offsetHeight * .7 && !demoVisible); }
  addEventListener("scroll", upd, { passive: true }); upd();
})();

/* ---------- langue : l'autre version s'ouvre toujours en haut de page ---------- */
$("#lang").addEventListener("click", e => { const a = e.currentTarget; a.href = a.getAttribute("href").split("#")[0]; });


/* ---------- vitrine : l'écran se redresse au défilement ---------- */
(() => {
  const d = $("#device"); if (!d || RM) return;
  const upd = () => {
    const r = d.getBoundingClientRect(), vh = innerHeight;
    const p = Math.max(0, Math.min(1, (vh - r.top) / (vh * .85)));
    d.style.setProperty("--tilt", (9 * (1 - p)).toFixed(2) + "deg");
    d.style.setProperty("--sc", (.95 + .05 * p).toFixed(3));
  };
  addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
})();

/* ---------- menu mobile ---------- */
const burger = $("#burger");
const setMenu = open => { nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Close menu" : "Open menu"); };
burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
$$("#menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* ---------- formulaire : envoi réel si data-endpoint est rempli ---------- */
let lastSent = 0;
const OKMSG = "Thank you. Your request was received; we will write to you shortly to set up the meeting.";
const WAITMSG = "Your request was just sent. Please wait a few seconds before sending another.";

$("#dform").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, msg = $("#fmsg"), btn = f.querySelector("button[type=submit]"), url = f.dataset.endpoint.trim();
  const say = (t, ok) => { msg.style.color = ok ? "var(--ok)" : "var(--danger)"; msg.textContent = t; };
  if (!f.nom.value.trim() || !f.courriel.value || !f.courriel.checkValidity()) return say("Enter your name and a valid email address to continue.", false);
  // Pot de miel : un robot remplit ce champ invisible; on fait comme si l'envoi avait réussi, sans rien envoyer
  if (f._gotcha.value) { f.reset(); return say(OKMSG, true); }
  if (Date.now() - lastSent < 30000) return say(WAITMSG, false);
  if (!url) return say(`Thank you, ${f.nom.value.trim()}. This form is in demo mode: no data was sent.`, true);
  btn.disabled = true; say("Sending…", true);
  try {
    const r = await fetch(url, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(r.status);
    lastSent = Date.now(); f.reset(); say("Thank you. Your request was received; we will write to you shortly to set up the meeting.", true);
  } catch { say("Sending failed. Try again in a moment or write to us directly.", false); }
  finally { btn.disabled = false; }
});
})();
