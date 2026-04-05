// app.js

/**
 * OSINT Orchestrator — Cyber-Elite v3.0
 * Futuristic Animated UI with Particle System,
 * Holographic FX, Decode Text, HUD Clock, and Progress Simulation.
 */

// ═══════════════════════════════════════════════════════════
// TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════

const TH3_TOOLS = [
    { id: 'lb-person', name: 'Person Lookup', category: 'Lookup', icon: 'person_search', desc: 'Reconnaissance on individuals across public records.', label: 'Firstname Name', placeholder: 'e.g., John Doe', secondaryLabel: 'City / Dept', secondaryPlaceholder: 'e.g., Paris', module: 'person' },
    { id: 'lb-address', name: 'Address Recon', category: 'Lookup', icon: 'home_pin', desc: 'Physical address reconnaissance and geospatial tracking.', label: 'Full Address', placeholder: 'e.g., 10 Downing St, London', module: 'address' },
    { id: 'lb-phone', name: 'Phone Lookup', category: 'Lookup', icon: 'call', desc: 'International operator and location reconnaissance.', label: 'Phone Number', placeholder: 'e.g., +911234567890', module: 'phone' },
    { id: 'lb-email-leak', name: 'Email Leak', category: 'Network', icon: 'vpn_lock', desc: 'Search for email leaks and plaintext passwords in dumps.', label: 'Email Address', placeholder: 'e.g., target@mail.com', module: 'email-leak' },
    { id: 'api-fast-ip', name: 'IP Core API', category: 'API Intel', icon: 'radar', desc: 'Ultra-fast Subnet, Geo, and ASN infrastructure mapping.', label: 'IP Address', placeholder: 'e.g., 8.8.8.8', module: 'fast_ip', endpoint: '/api/fast-ip' },
    { id: 'api-link', name: 'Link X-Ray API', category: 'API Intel', icon: 'open_in_new', desc: 'Unshorten links, track redirects, and evaluate safety.', label: 'Suspicious URL', placeholder: 'e.g., https://bit.ly/1234', module: 'fast_link', endpoint: '/api/link-xray' },
    { id: 'api-exif', name: 'Image Forensics', category: 'Extractor', icon: 'image_search', desc: 'Extract hidden EXIF metadata (geo-tags, device make) from an image URL.', label: 'Image URL', placeholder: 'e.g., http://target.com/img.jpg', module: 'fast_exif', endpoint: '/api/exif' },
    { id: 'api-spam', name: 'Phone Intel', category: 'Lookup', icon: 'perm_phone_msg', desc: 'Validate phone numbers and extract country, carrier type, and formatting intelligence.', label: 'Phone Number (with country code)', placeholder: 'e.g., +911234567890', module: 'fast_spam', endpoint: '/api/spam-phone' },
    { id: 'shadow-trace', name: 'Shadow-Trace', category: 'Advanced', icon: 'query_stats', desc: 'Deep horizontal reconnaissance across fragmented data nodes.', label: 'Target Keyword', placeholder: 'e.g., cryptic_identifier', module: 'google' }
];

// ═══════════════════════════════════════════════════════════
// APP STATE
// ═══════════════════════════════════════════════════════════

let currentTool = TH3_TOOLS[0];
let isTaskRunning = false;
let accumulatedOutput = "";
let progressInterval = null;

// ═══════════════════════════════════════════════════════════
// DOM REFERENCES
// ═══════════════════════════════════════════════════════════

const sidebar = document.getElementById('sidebar');
const menuOverlay = document.getElementById('menuOverlay');
const menuOpenBtn = document.getElementById('menuOpenBtn');
const menuCloseBtn = document.getElementById('menuCloseBtn');
const toolsNav = document.getElementById('toolsNav');
const loaderView = document.getElementById('loaderView');
const resultsView = document.getElementById('resultsView');
const inputCard = document.getElementById('inputCard');
const resultCardsGrid = document.getElementById('resultCardsGrid');
const inspectorForm = document.getElementById('inspectorForm');
const targetInput = document.getElementById('targetInput');
const secondaryInput = document.getElementById('secondaryInput');
const uploadImageBtn = document.getElementById('uploadImageBtn');
const fileUpload = document.getElementById('fileUpload');

// ═══════════════════════════════════════════════════════════
// PARTICLE SYSTEM — Floating Cyber Nodes
// ═══════════════════════════════════════════════════════════

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.maxParticles = 60;
        this.connectionDistance = 150;
        this.running = true;

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                hue: Math.random() > 0.7 ? 265 : 190, // cyan or purple
            });
        }
    }

    animate() {
        if (!this.running || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.opacity})`;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDistance) {
                    const alpha = (1 - dist / this.connectionDistance) * 0.12;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `hsla(190, 100%, 60%, ${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }

            // Mouse interaction
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 200) {
                    const alpha = (1 - dist / 200) * 0.2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.strokeStyle = `hsla(190, 100%, 70%, ${alpha})`;
                    this.ctx.lineWidth = 0.4;
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ═══════════════════════════════════════════════════════════
// HUD CLOCK
// ═══════════════════════════════════════════════════════════

function startHUDClock() {
    const clockEl = document.getElementById('hudClock');
    if (!clockEl) return;

    function update() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        clockEl.textContent = `${h}:${m}:${s}`;
    }

    update();
    setInterval(update, 1000);
}

// ═══════════════════════════════════════════════════════════
// LATENCY SIMULATION
// ═══════════════════════════════════════════════════════════

function startLatencyMonitor() {
    const latencyEl = document.getElementById('latencyValue');
    if (!latencyEl) return;

    function update() {
        const base = 12 + Math.floor(Math.random() * 18);
        latencyEl.textContent = `${base}ms`;
    }

    update();
    setInterval(update, 3000);
}

// ═══════════════════════════════════════════════════════════
// DECODE TEXT ANIMATION
// ═══════════════════════════════════════════════════════════

const DECODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>?/|';

function decodeTextAnimate(element, finalText, speed = 30) {
    let iteration = 0;
    const totalIterations = finalText.length;

    const interval = setInterval(() => {
        element.textContent = finalText
            .split('')
            .map((char, idx) => {
                if (idx < iteration) return char;
                return DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
            })
            .join('');

        iteration += 1;
        if (iteration > totalIterations) {
            clearInterval(interval);
            element.textContent = finalText;
        }
    }, speed);
}

// ═══════════════════════════════════════════════════════════
// PROGRESS BAR SIMULATION
// ═══════════════════════════════════════════════════════════

const PROGRESS_STAGES = [
    { pct: 15, text: 'HANDSHAKING...' },
    { pct: 30, text: 'QUERYING SOURCES...' },
    { pct: 50, text: 'PARSING DATA...' },
    { pct: 65, text: 'CROSS-REFERENCING...' },
    { pct: 80, text: 'DECRYPTING INTEL...' },
    { pct: 92, text: 'FINALIZING...' },
];

function startProgressSimulation() {
    const fillEl = document.getElementById('progressFill');
    const textEl = document.getElementById('progressText');
    if (!fillEl || !textEl) return;

    fillEl.style.width = '0%';
    textEl.textContent = 'INITIALIZING...';
    let stageIndex = 0;

    progressInterval = setInterval(() => {
        if (stageIndex < PROGRESS_STAGES.length) {
            const stage = PROGRESS_STAGES[stageIndex];
            fillEl.style.width = stage.pct + '%';
            textEl.textContent = stage.text;
            stageIndex++;
        }
    }, 2500);
}

function stopProgressSimulation() {
    const fillEl = document.getElementById('progressFill');
    const textEl = document.getElementById('progressText');
    if (fillEl) fillEl.style.width = '100%';
    if (textEl) textEl.textContent = 'COMPLETE';
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = null;
}

// ═══════════════════════════════════════════════════════════
// INIT APPLICATION
// ═══════════════════════════════════════════════════════════

function initApp() {
    new ParticleSystem('particleCanvas');
    startHUDClock();
    startLatencyMonitor();
    renderSidebar();
    setActiveTool(currentTool);
    setupEventListeners();
    setupRippleEffect();
}

// ═══════════════════════════════════════════════════════════
// RIPPLE EFFECT (Global Click Feedback)
// ═══════════════════════════════════════════════════════════

function setupRippleEffect() {
    document.addEventListener('mousedown', (e) => {
        const target = e.target.closest('.btn-primary, .btn-ghost, .nav-item, .menu-toggle-btn, .card-dismiss-btn, .btn-icon');
        if (!target) return;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        target.appendChild(ripple);

        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        setTimeout(() => ripple.remove(), 600);
    });
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════

function setupEventListeners() {
    if (menuOpenBtn) menuOpenBtn.onclick = () => toggleMobileMenu(true);
    if (menuCloseBtn) menuCloseBtn.onclick = () => toggleMobileMenu(false);
    if (menuOverlay) menuOverlay.onclick = () => toggleMobileMenu(false);
}

function toggleMobileMenu(isOpen) {
    if (isOpen) {
        sidebar.classList.add('open');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.classList.remove('open');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR RENDER
// ═══════════════════════════════════════════════════════════

function renderSidebar() {
    toolsNav.innerHTML = '';
    const categories = [...new Set(TH3_TOOLS.map(t => t.category))];

    categories.forEach(cat => {
        const catHeader = document.createElement('div');
        catHeader.className = 'nav-category';
        catHeader.textContent = cat;
        toolsNav.appendChild(catHeader);

        TH3_TOOLS.filter(t => t.category === cat).forEach((tool, index) => {
            const btn = document.createElement('button');
            btn.className = `nav-item ${tool.id === currentTool.id ? 'active' : ''}`;
            btn.style.animationDelay = `${index * 0.05}s`;
            btn.onclick = () => {
                if (isTaskRunning) return;
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');

                // Trigger glitch transition
                const workspace = document.querySelector('.workspace-area');
                workspace.classList.add('glitch-transition');
                setTimeout(() => workspace.classList.remove('glitch-transition'), 400);

                setActiveTool(tool);
                if (window.innerWidth <= 768) toggleMobileMenu(false);
            };
            btn.innerHTML = `<span class="material-symbols-outlined">${tool.icon}</span><span class="nav-label">${tool.name}</span>`;
            toolsNav.appendChild(btn);
        });
    });
}

// ═══════════════════════════════════════════════════════════
// SET ACTIVE TOOL (with Decode Text Animation)
// ═══════════════════════════════════════════════════════════

function setActiveTool(tool) {
    currentTool = tool;

    resultCardsGrid.innerHTML = '';
    resultsView.style.display = 'none';
    inputCard.style.display = 'block';
    inputCard.style.opacity = '1';

    // Animated text decode
    const nameEl = document.getElementById('currentToolName');
    const descEl = document.getElementById('currentToolDesc');
    const iconEl = document.getElementById('currentToolIcon');

    iconEl.textContent = tool.icon;
    decodeTextAnimate(nameEl, tool.name, 25);
    if (descEl) descEl.textContent = tool.desc;

    document.getElementById('targetLabel').textContent = tool.label;
    targetInput.placeholder = tool.placeholder;
    targetInput.value = '';

    if (uploadImageBtn && fileUpload) {
        if (tool.id === 'api-exif') {
            uploadImageBtn.style.display = 'flex';
            targetInput.removeAttribute('required');
            uploadImageBtn.onclick = (e) => {
                e.preventDefault();
                fileUpload.click();
            };
            fileUpload.onchange = () => {
                if (fileUpload.files.length > 0) {
                    targetInput.value = fileUpload.files[0].name;
                }
            };
        } else {
            uploadImageBtn.style.display = 'none';
            targetInput.setAttribute('required', 'true');
            fileUpload.value = '';
        }
    }

    const secContainer = document.getElementById('secondaryInputContainer');
    if (tool.secondaryLabel) {
        secContainer.style.display = 'block';
        document.getElementById('secondaryLabel').textContent = tool.secondaryLabel;
        secondaryInput.placeholder = tool.secondaryPlaceholder || '...';
    } else {
        secContainer.style.display = 'none';
    }
}

// ═══════════════════════════════════════════════════════════
// LOADER
// ═══════════════════════════════════════════════════════════

function showLoader(title, message) {
    loaderView.style.display = 'flex';
    resultsView.style.display = 'none';
    inputCard.style.opacity = '0.3';
    inputCard.style.pointerEvents = 'none';

    const titleEl = document.getElementById('loaderTitle');
    const msgEl = document.getElementById('loaderMessage');
    decodeTextAnimate(titleEl, title, 30);
    msgEl.textContent = message;

    resultCardsGrid.innerHTML = '';
    startProgressSimulation();
}

function hideLoader() {
    stopProgressSimulation();
    loaderView.style.display = 'none';
    resultsView.style.display = 'flex';
    inputCard.style.opacity = '1';
    inputCard.style.pointerEvents = 'auto';
}

// ═══════════════════════════════════════════════════════════
// TERMINAL LOG (Silent / Console-Only)
// ═══════════════════════════════════════════════════════════

function logToTerminal(message, level = 'info') {
    console.log(`[${level.toUpperCase()}] ${message}`);
}

// ═══════════════════════════════════════════════════════════
// ANSI STRIPPER
// ═══════════════════════════════════════════════════════════

function stripAnsi(text) {
    const pattern = [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><]))'
    ].join('|');
    return text.replace(new RegExp(pattern, 'g'), '');
}

// ═══════════════════════════════════════════════════════════
// RESULT PARSER & RENDERERS
// ═══════════════════════════════════════════════════════════

function parseAndRenderOutput(raw) {
    const cleanRaw = stripAnsi(raw);
    const lines = cleanRaw.split('\n');
    let currentTable = [];
    let isInsideTable = false;
    let foundAny = false;

    // 1. JSON blobs
    const jsonMatches = cleanRaw.match(/\{(?:[^{}]|(\{(?:[^{}]|(\{[^{}]*\}))*\}))*\}/g);
    if (jsonMatches) {
        jsonMatches.forEach(jsonStr => {
            try {
                const data = JSON.parse(jsonStr);
                renderDataCard(data);
                foundAny = true;
            } catch (e) { /* skip */ }
        });
    }

    // 2. ASCII Tables
    lines.forEach(line => {
        const isTableLine = /[\u2500-\u257F\u250c\u2500\u2502\u251c\u2524\u252c\u2534\u253c]/.test(line);
        
        if (isTableLine) {
            if (!isInsideTable) {
                isInsideTable = true;
                currentTable = [line];
            } else {
                currentTable.push(line);
            }
        } else if (isInsideTable && line.trim().length > 0) {
            if (line.includes('───')) {
                currentTable.push(line);
            } else {
                renderTableCard(currentTable.join('\n'));
                currentTable = [];
                isInsideTable = false;
                foundAny = true;
            }
        } else if (isInsideTable && line.trim().length === 0) {
            renderTableCard(currentTable.join('\n'));
            currentTable = [];
            isInsideTable = false;
            foundAny = true;
        }
    });

    if (isInsideTable && currentTable.length > 0) {
        renderTableCard(currentTable.join('\n'));
        foundAny = true;
    }

    // 3. Fallback [+] items
    if (!foundAny && cleanRaw.includes('[+]')) {
        const successes = lines.filter(l => l.includes('[+]')).join('\n');
        renderSimpleCard("Success Highlights", successes);
        foundAny = true;
    }

    // 4. Ultimate Fallback
    if (!foundAny && cleanRaw.trim().length > 30 && !cleanRaw.includes('[ERROR]')) {
        renderSimpleCard("Raw Output", cleanRaw);
    }
}

function renderDataCard(data) {
    const card = document.createElement('div');
    card.className = 'result-card animate-in';
    
    let html = `
        <div class="card-header">
            <span class="material-symbols-outlined">data_object</span> 
            INTELLIGENCE RETRIEVED
            <button class="card-dismiss-btn" onclick="this.closest('.result-card').remove()">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
    `;
    
    Object.entries(data).forEach(([key, value]) => {
        let displayValue = "";
        
        if (Array.isArray(value)) {
            displayValue = `<div class="tag-group">`;
            const flatList = value.flat();
            flatList.forEach(v => {
                displayValue += `<span class="data-tag">${v}</span>`;
            });
            displayValue += `</div>`;
        } else if (typeof value === 'object' && value !== null) {
            displayValue = `<div class="nested-data" style="margin-top: 6px; padding: 8px; border-left: 2px solid rgba(0, 212, 255, 0.4); background: rgba(0,0,0,0.2); border-radius: 4px;">`;
            Object.entries(value).forEach(([subKey, subVal]) => {
                const subKeyClean = subKey.replace(/_/g, ' ');
                if (typeof subVal === 'object' && subVal !== null) {
                     displayValue += `<div style="font-size:0.85em; margin-bottom: 4px; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom: 2px;"><span style="color:var(--accent-cyan); font-weight:600;">${subKeyClean}</span><span style="color:#a9bdd9; text-align:right; max-width:60%; word-break:break-all;">[Nested Data]</span></div>`;
                } else {
                     displayValue += `<div style="font-size:0.85em; margin-bottom: 4px; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom: 2px;"><span style="color:var(--accent-cyan); font-weight:600;">${subKeyClean}</span><span style="color:#a9bdd9; text-align:right; max-width:60%; word-break:break-all;">${subVal}</span></div>`;
                }
            });
            displayValue += `</div>`;
        } else {
            const strVal = String(value);
            const isSuccess = strVal.toLowerCase().includes('success') || strVal.toLowerCase().includes('valid');
            
            // Image URL rendering logic
            if (strVal.startsWith('http') && (strVal.match(/\.(jpeg|jpg|gif|png)$/i) || key.toLowerCase().includes('picture') || key.toLowerCase().includes('avatar'))) {
                displayValue = `<div style="margin-top:8px;"><img src="${strVal}" alt="Extracted Image" style="max-height:100px; border-radius:8px; border:1px solid rgba(0,212,255,0.4);" /></div>
                                <span class="data-value ${isSuccess ? 'success-text' : ''}" style="display:block; font-size: 0.7em;">${strVal}</span>`;
            } else {
                displayValue = `<span class="data-value ${isSuccess ? 'success-text' : ''}">${strVal}</span>`;
            }
        }

        html += `
            <div class="data-item">
                <span class="data-label">${key.replace(/_/g, ' ')}</span>
                ${displayValue}
            </div>
        `;
    });

    card.innerHTML = html;
    resultCardsGrid.appendChild(card);
}

function renderTableCard(tableText) {
    const card = document.createElement('div');
    card.className = 'result-card animate-in';
    card.style.gridColumn = '1 / -1';
    
    card.innerHTML = `
        <div class="card-header">
            <span class="material-symbols-outlined">table_chart</span> 
            RECORD SET FOUND
            <button class="card-dismiss-btn" onclick="this.closest('.result-card').remove()">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <div class="result-table-container">
            <pre style="font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; padding:16px; color: var(--text-secondary);">${tableText}</pre>
        </div>
    `;
    resultCardsGrid.appendChild(card);
}

function renderSimpleCard(title, content) {
    const card = document.createElement('div');
    card.className = 'result-card animate-in';
    card.innerHTML = `
        <div class="card-header">
            <span class="material-symbols-outlined">verified</span> 
            ${title}
            <button class="card-dismiss-btn" onclick="this.closest('.result-card').remove()">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <div class="data-item"><span class="data-value">${content.replace(/\[\+\]/g, '✅ ')}</span></div>
    `;
    resultCardsGrid.appendChild(card);
}

// ═══════════════════════════════════════════════════════════
// FORM SUBMISSION
// ═══════════════════════════════════════════════════════════

inspectorForm.onsubmit = async (e) => {
    e.preventDefault();
    if (isTaskRunning || !targetInput.value.trim()) return;

    isTaskRunning = true;
    accumulatedOutput = "";
    showLoader(`Analyzing ${currentTool.name}...`, `Connecting to Specter Neural Bridge and querying intelligence sources.`);

    try {
        const query = new URLSearchParams({
            module: currentTool.module,
            target: targetInput.value.trim(),
            secondary: secondaryInput.value.trim()
        });

        if (currentTool.endpoint) {
            let response, data;
            
            // Handle local file uploads for EXIF analysis
            if (currentTool.id === 'api-exif' && fileUpload && fileUpload.files.length > 0) {
                const file = fileUpload.files[0];
                const reader = new FileReader();
                
                const base64Promise = new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result);
                });
                reader.readAsDataURL(file);
                
                const base64Data = await base64Promise;
                
                response = await fetch('/api/exif-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64: base64Data })
                });
                data = await response.json();
            } else {
                // High-Speed JSON API Handler (No streaming)
                response = await fetch(`${currentTool.endpoint}?${query.toString()}`);
                data = await response.json();
            }

            accumulatedOutput = JSON.stringify(data, null, 2);
            parseAndRenderOutput(accumulatedOutput);
            renderNetworkGraph(targetInput.value.trim(), data);
        } else {
             // Specter Neural Stream Handler
            const response = await fetch(`/api/scan?${query.toString()}`);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                accumulatedOutput += chunk;
                
                chunk.split('\n').forEach(line => {
                    if (line.trim()) {
                        if (line.includes('[ERROR]')) logToTerminal(line, 'error');
                        else if (line.includes('[+]')) logToTerminal(line, 'success');
                        else logToTerminal(line, 'info');
                    }
                });
            }
            parseAndRenderOutput(accumulatedOutput);
            renderNetworkGraph(targetInput.value.trim(), { raw_output: accumulatedOutput });
        }
    } catch (err) {
        logToTerminal(err.message, 'error');
        renderSimpleCard("CRITICAL ERROR", err.message);
    } finally {
        isTaskRunning = false;
        hideLoader();
    }
};

// ═══════════════════════════════════════════════════════════
// VISUAL LINK ANALYSIS (CYTOSCAPE/VIS NETWORK)
// ═══════════════════════════════════════════════════════════

function renderNetworkGraph(rootTarget, intelData) {
    const container = document.getElementById('osintNetworkGraph');
    if (!container || typeof vis === 'undefined') return;
    
    container.style.display = 'block';

    const nodes = [ { id: 1, label: rootTarget, group: 'target', font: { color: '#ffffff' }, size: 28 } ];
    const edges = [];
    let nodeId = 2;

    function addNode(label, group) {
        // Prevent duplicate labels intuitively 
        const existing = nodes.find(n => n.label === String(label));
        if (existing) {
            edges.push({ from: 1, to: existing.id, color: { color: 'rgba(0, 212, 255, 0.4)' } });
            return;
        }
        nodes.push({ id: nodeId, label: String(label).substring(0, 25), group: group, font: { color: '#8892a4' } });
        edges.push({ from: 1, to: nodeId, color: { color: 'rgba(0, 212, 255, 0.4)' } });
        nodeId++;
    }

    // Try to extract juicy details to draw nodes
    if (intelData.IP_Data) {
        if (intelData.IP_Data.isp) addNode(intelData.IP_Data.isp, 'isp');
        if (intelData.IP_Data.city) addNode(intelData.IP_Data.city, 'location');
        if (intelData.IP_Data.lat) addNode(`Geo: ${intelData.IP_Data.lat}, ${intelData.IP_Data.lon}`, 'geo');
    }
    
    if (intelData.Email_Reputation) {
        if (intelData.Email_Reputation.domain) addNode(intelData.Email_Reputation.domain, 'domain');
        addNode(`Deliverable: ${intelData.Email_Reputation.deliverable}`, 'status');
        addNode(`Spam: ${intelData.Email_Reputation.spam}`, 'status');
    }

    // Fallback parser for terminal streams
    if (intelData.raw_output) {
        const lines = intelData.raw_output.split('\\n');
        lines.forEach(l => {
            if (l.includes('[+]') && l.includes(':')) {
                const parts = l.replace('[+]', '').trim().split(':');
                if (parts.length >= 2 && parts[1].trim().length > 0) {
                    addNode(parts[1].trim(), 'intel');
                }
            }
        });
    }

    const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
    const options = {
        nodes: { shape: 'dot', size: 16, borderWidth: 2, color: { border: '#00d4ff', background: '#0a0d14' } },
        edges: { width: 1, smooth: { type: 'continuous' } },
        groups: {
            target: { color: { background: '#ff3d71', border: '#ffaa00' } },
            domain: { color: { background: '#7b61ff', border: '#00d4ff' } },
            location: { color: { background: '#00e676', border: '#00d4ff' } }
        },
        physics: { barnesHut: { gravitationalConstant: -2000, centralGravity: 0.3, springLength: 95 } }
    };

    new vis.Network(container, data, options);
}


// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════

initApp();
