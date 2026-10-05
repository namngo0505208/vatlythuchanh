// --- GLOBAL STATE ---
let scene, camera, renderer, controls;
let isPlaying = false;
let timeScale = 1.0;
let animationFrameId = null;
let energyChart = null;

let activeCategory = 'mechanics';
let activePhenomenon = 'projectile';

let simObjects = {};
let trailLines = [];
let vectorHelpers = [];

// --- 17 PHENOMENA DATABASE ---
const DATABASE = {
    mechanics: {
        title: "Cơ Học",
        icon: "fa-volleyball",
        items: {
            projectile: {
                name: "1. Ném Xiên Trong Không Trung",
                camera: [20, 15, 30],
                controls: [
                    { id: 'v0', name: 'Vận tốc đầu (v₀)', min: 5, max: 50, val: 25, unit: 'm/s' },
                    { id: 'angle', name: 'Góc ném (α)', min: 0, max: 90, val: 45, unit: '°' },
                    { id: 'mass', name: 'Khối lượng (m)', min: 0.1, max: 10, val: 1, unit: 'kg' },
                    { id: 'gravity', name: 'Trọng lực (g)', min: 1, max: 25, val: 9.8, unit: 'm/s²' },
                    { id: 'drag', name: 'Lực cản không khí', min: 0, max: 0.2, val: 0.02, unit: '', step: 0.005 }
                ]
            },
            pendulum: {
                name: "2. Con Lắc Đơn 3D",
                camera: [0, 8, 25],
                controls: [
                    { id: 'length', name: 'Chiều dài dây (L)', min: 2, max: 20, val: 10, unit: 'm' },
                    { id: 'initAngle', name: 'Góc lệch ban đầu', min: 10, max: 90, val: 45, unit: '°' },
                    { id: 'mass', name: 'Khối lượng quả cầu', min: 0.5, max: 10, val: 2, unit: 'kg' },
                    { id: 'gravity', name: 'Trọng lực (g)', min: 1, max: 25, val: 9.8, unit: 'm/s²' },
                    { id: 'damping', name: 'Lực cản ma sát', min: 0, max: 0.1, val: 0.005, unit: '', step: 0.001 }
                ]
            },
            doublePendulum: {
                name: "3. Con Lắc Đôi Khỗn Độn",
                camera: [0, 5, 25],
                controls: [
                    { id: 'l1', name: 'Chiều dài Dây 1', min: 2, max: 10, val: 5, unit: 'm' },
                    { id: 'l2', name: 'Chiều dài Dây 2', min: 2, max: 10, val: 5, unit: 'm' },
                    { id: 'm1', name: 'Khối lượng Quả 1', min: 1, max: 10, val: 3, unit: 'kg' },
                    { id: 'm2', name: 'Khối lượng Quả 2', min: 1, max: 10, val: 2, unit: 'kg' }
                ]
            },
            spring: {
                name: "4. Dao Động Con Lắc Lò Xo",
                camera: [0, 5, 20],
                controls: [
                    { id: 'k', name: 'Độ cứng lò xo (k)', min: 5, max: 100, val: 35, unit: 'N/m' },
                    { id: 'mass', name: 'Khối lượng (m)', min: 0.5, max: 10, val: 2, unit: 'kg' },
                    { id: 'amplitude', name: 'Biên độ ban đầu (A)', min: 1, max: 8, val: 4, unit: 'm' },
                    { id: 'damping', name: 'Ma sát môi trường', min: 0, max: 0.2, val: 0.015, unit: '', step: 0.005 }
                ]
            },
            collision: {
                name: "5. Va Chạm Đàn Hồi 3D",
                camera: [0, 10, 25],
                controls: [
                    { id: 'm1', name: 'Khối lượng Cầu 1', min: 1, max: 10, val: 5, unit: 'kg' },
                    { id: 'v1', name: 'Vận tốc Cầu 1', min: 2, max: 20, val: 12, unit: 'm/s' },
                    { id: 'm2', name: 'Khối lượng Cầu 2', min: 1, max: 10, val: 2, unit: 'kg' },
                    { id: 'v2', name: 'Vận tốc Cầu 2', min: -20, max: 0, val: -6, unit: 'm/s' }
                ]
            },
            centripetal: {
                name: "6. Chuyển Động Tròn Giúp Tâm",
                camera: [0, 15, 20],
                controls: [
                    { id: 'radius', name: 'Bán kính quay (R)', min: 2, max: 12, val: 6, unit: 'm' },
                    { id: 'omega', name: 'Tốc độ góc (ω)', min: 0.5, max: 10, val: 3, unit: 'rad/s' },
                    { id: 'mass', name: 'Khối lượng (m)', min: 0.5, max: 10, val: 2, unit: 'kg' }
                ]
            }
        }
    },
    em: {
        title: "Điện Từ",
        icon: "fa-bolt",
        items: {
            lorentz: {
                name: "1. Lực Lorentz Trong Từ Trường",
                camera: [0, 15, 30],
                controls: [
                    { id: 'charge', name: 'Điện tích hạt (q)', min: -5, max: 5, val: 2, unit: 'C' },
                    { id: 'bField', name: 'Từ trường (B)', min: 0.5, max: 10, val: 3, unit: 'Tesla' },
                    { id: 'v0', name: 'Vận tốc đầu (v₀)', min: 2, max: 20, val: 8, unit: 'm/s' },
                    { id: 'mass', name: 'Khối lượng hạt', min: 0.1, max: 5, val: 1, unit: 'kg' }
                ]
            },
            coulomb: {
                name: "2. Tương Tác Điện Trường Coulomb",
                camera: [0, 10, 25],
                controls: [
                    { id: 'q1', name: 'Điện tích Q1', min: -10, max: 10, val: 5, unit: 'μC' },
                    { id: 'q2', name: 'Điện tích Q2', min: -10, max: 10, val: -5, unit: 'μC' },
                    { id: 'dist', name: 'Khoảng cách ban đầu', min: 3, max: 15, val: 8, unit: 'm' }
                ]
            },
            emWave: {
                name: "3. Sóng Điện Từ Lượng Tử (E & B)",
                camera: [15, 10, 25],
                controls: [
                    { id: 'freq', name: 'Tần số sóng (f)', min: 0.5, max: 5, val: 1.5, unit: 'Hz' },
                    { id: 'amp', name: 'Biên độ sóng (A)', min: 1, max: 6, val: 3, unit: 'm' }
                ]
            }
        }
    },
    optics: {
        title: "Quang & Sóng",
        icon: "fa-wave-square",
        items: {
            waveInterference: {
                name: "1. Giao Thoa Sóng Nước 3D",
                camera: [0, 25, 30],
                controls: [
                    { id: 'freq', name: 'Tần số nguồn dao động', min: 1, max: 10, val: 4, unit: 'Hz' },
                    { id: 'dist', name: 'Khoảng cách 2 nguồn S1S2', min: 2, max: 12, val: 6, unit: 'm' }
                ]
            },
            refraction: {
                name: "2. Khúc Xạ Ánh Sáng Qua Lăng Kính",
                camera: [0, 10, 20],
                controls: [
                    { id: 'n1', name: 'Chiết suất Môi trường 1', min: 1, max: 2, val: 1, unit: 'n' },
                    { id: 'n2', name: 'Chiết suất Lăng kính', min: 1, max: 2.5, val: 1.5, unit: 'n', step: 0.05 },
                    { id: 'incAngle', name: 'Góc tới (i)', min: 5, max: 80, val: 45, unit: '°' }
                ]
            }
        }
    },
    thermo: {
        title: "Nhiệt & Chất Lưu",
        icon: "fa-temperature-high",
        items: {
            brownian: {
                name: "1. Chuyển Động Nhiệt Brown",
                camera: [0, 20, 35],
                controls: [
                    { id: 'temp', name: 'Nhiệt độ T (Vận tốc)', min: 1, max: 10, val: 4, unit: 'K' },
                    { id: 'count', name: 'Số lượng Phân tử', min: 10, max: 60, val: 35, unit: 'hạt', step: 5 }
                ]
            },
            buoyancy: {
                name: "2. Lực Đẩy Archimedes",
                camera: [0, 10, 25],
                controls: [
                    { id: 'fluidDensity', name: 'Khối lượng riêng chất lưu', min: 500, max: 1500, val: 1000, unit: 'kg/m³', step: 50 },
                    { id: 'objectDensity', name: 'Khối lượng riêng vật thể', min: 200, max: 2000, val: 700, unit: 'kg/m³', step: 50 }
                ]
            }
        }
    },
    astro: {
        title: "Thiên Văn",
        icon: "fa-globe",
        items: {
            gravity: {
                name: "1. Tương Tác Hấp Dẫn 3 Thiên Thể",
                camera: [0, 35, 35],
                controls: [
                    { id: 'gConst', name: 'Hằng số Hấp dẫn G', min: 1, max: 20, val: 6, unit: 'N m²/kg²' },
                    { id: 'm1', name: 'Khối lượng Sao Trung Tâm', min: 200, max: 2000, val: 1000, unit: 'kg' },
                    { id: 'm2', name: 'Khối lượng Hành tinh A', min: 1, max: 50, val: 10, unit: 'kg' },
                    { id: 'm3', name: 'Khối lượng Hành tinh B', min: 1, max: 50, val: 5, unit: 'kg' }
                ]
            },
            blackHole: {
                name: "2. Bẻ Cong Không-Thời Gian Lỗ Đen",
                camera: [0, 20, 30],
                controls: [
                    { id: 'mass', name: 'Khối lượng Lỗ Đen (M)', min: 100, max: 1000, val: 500, unit: 'M☉' },
                    { id: 'lightDist', name: 'Khoảng cách Tia Sáng', min: 5, max: 20, val: 12, unit: 'm' }
                ]
            }
        }
    },
    quantum: {
        title: "Lượng Tử",
        icon: "fa-atom",
        items: {
            bohrAtom: {
                name: "1. Mô Hình Nguyên Tử Bohr",
                camera: [0, 15, 25],
                controls: [
                    { id: 'zNum', name: 'Số hiệu Nguyên tử (Z)', min: 1, max: 6, val: 2, unit: 'protons' },
                    { id: 'nOrbit', name: 'Mức năng lượng (n)', min: 1, max: 4, val: 2, unit: 'quỹ đạo' }
                ]
            },
            doubleSlit: {
                name: "2. Thí Nghiệm 2 Khe Khe Young Lượng Tử",
                camera: [0, 15, 25],
                controls: [
                    { id: 'slitDist', name: 'Khoảng cách 2 khe (d)', min: 1, max: 5, val: 2, unit: 'mm' },
                    { id: 'wavelength', name: 'Bước sóng ánh sáng (λ)', min: 400, max: 700, val: 550, unit: 'nm', step: 10 }
                ]
            }
        }
    }
};

// --- INIT THREE.JS SCENE ---
function initScene() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.012);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Ambient & Directional Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Cyber Floor Grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x38bdf8, 0x1e293b);
    scene.add(gridHelper);

    window.addEventListener('resize', onWindowResize);

    initChart();
    renderCategoryTabs();
    setupEventListeners();
    loadCategory('mechanics');
    animate();
}

// --- CHART.JS SETUP ---
function initChart() {
    const ctx = document.getElementById('energyChart').getContext('2d');
    energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(30).fill(''),
            datasets: [
                { label: 'Thông số 1 (Ek)', data: Array(30).fill(0), borderColor: '#38bdf8', borderWidth: 1.5, pointRadius: 0 },
                { label: 'Thông số 2 (Ep)', data: Array(30).fill(0), borderColor: '#f43f5e', borderWidth: 1.5, pointRadius: 0 },
                { label: 'Tổng (E)', data: Array(30).fill(0), borderColor: '#10b981', borderWidth: 1.5, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            scales: { x: { display: false }, y: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } } },
            plugins: { legend: { labels: { color: '#94a3b8', font: { size: 9 }, boxWidth: 8 } } }
        }
    });
}

function updateChart(val1, val2) {
    if (!energyChart) return;
    const d1 = energyChart.data.datasets[0].data;
    const d2 = energyChart.data.datasets[1].data;
    const d3 = energyChart.data.datasets[2].data;

    d1.shift(); d1.push(val1);
    d2.shift(); d2.push(val2);
    d3.shift(); d3.push(val1 + val2);
    energyChart.update('none');
}

// --- UI CATEGORIES & NAVIGATION ---
function renderCategoryTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    tabsContainer.innerHTML = '';

    Object.keys(DATABASE).forEach(catKey => {
        const cat = DATABASE[catKey];
        const btn = document.createElement('button');
        btn.className = `cat-tab-btn flex flex-col items-center justify-center p-2 rounded-lg text-[10px] font-semibold transition ${catKey === activeCategory ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`;
        btn.dataset.category = catKey;
        btn.innerHTML = `<i class="fa-solid ${cat.icon} text-sm mb-1"></i>${cat.title}`;
        btn.addEventListener('click', () => loadCategory(catKey));
        tabsContainer.appendChild(btn);
    });
}

function loadCategory(catKey) {
    activeCategory = catKey;
    document.querySelectorAll('.cat-tab-btn').forEach(btn => {
        const isActive = btn.dataset.category === catKey;
        btn.className = `cat-tab-btn flex flex-col items-center justify-center p-2 rounded-lg text-[10px] font-semibold transition ${isActive ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`;
    });

    const categoryData = DATABASE[catKey];
    const phenoSelect = document.getElementById('select-phenomenon');
    phenoSelect.innerHTML = '';

    Object.keys(categoryData.items).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = categoryData.items[key].name;
        phenoSelect.appendChild(opt);
    });

    activePhenomenon = Object.keys(categoryData.items)[0];
    loadPhenomenonControls();
    resetSimulation();
}

function loadPhenomenonControls() {
    const container = document.getElementById('controls-container');
    container.innerHTML = '';

    const item = DATABASE[activeCategory].items[activePhenomenon];
    camera.position.set(...item.camera);

    item.controls.forEach(ctrl => {
        const step = ctrl.step || 0.1;
        container.innerHTML += `
            <div class="flex flex-col gap-1.5 glass-card p-2.5 rounded-xl border border-slate-800">
                <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-300 font-medium">${ctrl.name}</span>
                    <span class="text-cyan-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/50"><span id="val-${ctrl.id}">${ctrl.val}</span> ${ctrl.unit}</span>
                </div>
                <input type="range" id="${ctrl.id}" min="${ctrl.min}" max="${ctrl.max}" value="${ctrl.val}" step="${step}" 
                       class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400">
            </div>
        `;
    });

    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const valSpan = document.getElementById(`val-${e.target.id}`);
            if (valSpan) valSpan.innerText = e.target.value;
            resetSimulation();
        });
    });
}

function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) : 0;
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.getElementById('select-phenomenon').addEventListener('change', (e) => {
        activePhenomenon = e.target.value;
        loadPhenomenonControls();
        resetSimulation();
    });

    document.getElementById('btn-play').addEventListener('click', () => {
        isPlaying = !isPlaying;
        document.getElementById('icon-play').className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        isPlaying = false;
        document.getElementById('icon-play').className = 'fa-solid fa-play';
        resetSimulation();
    });

    document.getElementById('select-speed').addEventListener('change', (e) => {
        timeScale = parseFloat(e.target.value);
    });

    document.getElementById('btn-default-params').addEventListener('click', () => {
        loadPhenomenonControls();
        resetSimulation();
    });

    // Live Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) return;

        for (const catKey in DATABASE) {
            for (const phenoKey in DATABASE[catKey].items) {
                if (DATABASE[catKey].items[phenoKey].name.toLowerCase().includes(query)) {
                    loadCategory(catKey);
                    document.getElementById('select-phenomenon').value = phenoKey;
                    activePhenomenon = phenoKey;
                    loadPhenomenonControls();
                    resetSimulation();
                    return;
                }
            }
        }
    });
}

// --- CLEAR SCENE ---
function clearSimObjects() {
    Object.values(simObjects).forEach(obj => {
        if (obj.isMesh || obj.isLine || obj.isGroup || obj.isPoints) scene.remove(obj);
    });
    simObjects = {};

    trailLines.forEach(line => scene.remove(line));
    trailLines = [];

    vectorHelpers.forEach(v => scene.remove(v));
    vectorHelpers = [];
}

function appendTrailPoint(position, color = 0x38bdf8) {
    if (!document.getElementById('toggle-trail').checked) return;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.6 }));
    dot.position.copy(position);
    scene.add(dot);
    trailLines.push(dot);
    if (trailLines.length > 100) scene.remove(trailLines.shift());
}

// --- LAZY LOAD & BUILD SCENE PER PHENOMENON ---
function resetSimulation() {
    clearSimObjects();
    isPlaying = false;
    document.getElementById('icon-play').className = 'fa-solid fa-play';

    // CƠ HỌC
    if (activePhenomenon === 'projectile') {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 }));
        ball.castShadow = true; scene.add(ball);
        const v0 = getInputValue('v0');
        const angleRad = (getInputValue('angle') * Math.PI) / 180;
        simObjects.ball = ball;
        simObjects.state = { pos: new THREE.Vector3(0, 0.6, 0), vel: new THREE.Vector3(v0 * Math.cos(angleRad), v0 * Math.sin(angleRad), 0), time: 0 };

    } else if (activePhenomenon === 'pendulum') {
        const length = getInputValue('length');
        const initAngle = (getInputValue('initAngle') * Math.PI) / 180;
        const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        pivot.position.set(0, length + 2, 0); scene.add(pivot);
        const bob = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
        bob.castShadow = true; scene.add(bob);
        const rod = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xc1d5e0 }));
        scene.add(rod);
        simObjects.pivot = pivot; simObjects.bob = bob; simObjects.rod = rod;
        simObjects.state = { angle: initAngle, angularVel: 0, length: length };

    } else if (activePhenomenon === 'doublePendulum') {
        const l1 = getInputValue('l1'), l2 = getInputValue('l2');
        const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        pivot.position.set(0, 10, 0); scene.add(pivot);
        const bob1 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
        const bob2 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
        scene.add(bob1); scene.add(bob2);
        const rod1 = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
        const rod2 = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
        scene.add(rod1); scene.add(rod2);
        simObjects.pivot = pivot; simObjects.bob1 = bob1; simObjects.bob2 = bob2; simObjects.rod1 = rod1; simObjects.rod2 = rod2;
        simObjects.state = { a1: Math.PI / 2, a2: Math.PI / 2, a1_v: 0, a2_v: 0, l1: l1, l2: l2 };

    } else if (activePhenomenon === 'spring') {
        const mass = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        scene.add(mass);
        const springLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfcb316, linewidth: 2 }));
        scene.add(springLine);
        simObjects.mass = mass; simObjects.springLine = springLine;
        simObjects.state = { x: getInputValue('amplitude'), v: 0 };

    } else if (activePhenomenon === 'collision') {
        const ball1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
        const ball2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
        scene.add(ball1); scene.add(ball2);
        simObjects.ball1 = ball1; simObjects.ball2 = ball2;
        simObjects.state = { x1: -10, v1: getInputValue('v1'), m1: getInputValue('m1'), x2: 10, v2: getInputValue('v2'), m2: getInputValue('m2') };

    } else if (activePhenomenon === 'centripetal') {
        const center = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4), new THREE.MeshStandardMaterial({ color: 0x64748b }));
        scene.add(center);
        const bob = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), new THREE.MeshStandardMaterial({ color: 0x06b6d4 }));
        scene.add(bob);
        const rod = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x38bdf8 }));
        scene.add(rod);
        simObjects.bob = bob; simObjects.rod = rod;
        simObjects.state = { angle: 0 };

    // ĐIỆN TỪ
    } else if (activePhenomenon === 'lorentz') {
        const particle = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 }));
        scene.add(particle);
        simObjects.particle = particle;
        simObjects.state = { pos: new THREE.Vector3(0, 5, 0), vel: new THREE.Vector3(getInputValue('v0'), 0, 2) };

    } else if (activePhenomenon === 'coulomb') {
        const q1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: getInputValue('q1') >= 0 ? 0xf43f5e : 0x38bdf8 }));
        const q2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), new THREE.MeshStandardMaterial({ color: getInputValue('q2') >= 0 ? 0xf43f5e : 0x38bdf8 }));
        scene.add(q1); scene.add(q2);
        simObjects.q1 = q1; simObjects.q2 = q2;
        simObjects.state = { pos1: new THREE.Vector3(-getInputValue('dist')/2, 3, 0), pos2: new THREE.Vector3(getInputValue('dist')/2, 3, 0) };

    } else if (activePhenomenon === 'emWave') {
        const pointsE = [], pointsB = [];
        for (let x = -15; x <= 15; x += 0.3) {
            pointsE.push(new THREE.Vector3(x, 0, 0));
            pointsB.push(new THREE.Vector3(x, 0, 0));
        }
        const lineE = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsE), new THREE.LineBasicMaterial({ color: 0xf43f5e }));
        const lineB = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsB), new THREE.LineBasicMaterial({ color: 0x38bdf8 }));
        scene.add(lineE); scene.add(lineB);
        simObjects.lineE = lineE; simObjects.lineB = lineB;
        simObjects.state = { t: 0 };

    // QUANG & SÓNG
    } else if (activePhenomenon === 'waveInterference') {
        const gridGeo = new THREE.PlaneGeometry(30, 30, 40, 40);
        const gridMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, wireframe: true });
        const plane = new THREE.Mesh(gridGeo, gridMat);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);
        simObjects.plane = plane;
        simObjects.state = { t: 0 };

    } else if (activePhenomenon === 'refraction') {
        const prism = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 6, 3), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.9, opacity: 1, transparent: true, roughness: 0 }));
        prism.position.set(0, 3, 0); scene.add(prism);
        const rayLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xfcb316, linewidth: 3 }));
        scene.add(rayLine);
        simObjects.prism = prism; simObjects.rayLine = rayLine;

    // NHIỆT & CHẤT LƯU
    } else if (activePhenomenon === 'brownian') {
        const count = getInputValue('count'), speed = getInputValue('temp');
        const particles = [];
        for (let i = 0; i < count; i++) {
            const p = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }));
            p.position.set((Math.random() - 0.5) * 14, Math.random() * 10 + 1, (Math.random() - 0.5) * 14);
            scene.add(p);
            particles.push({ mesh: p, vel: new THREE.Vector3((Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed, (Math.random() - 0.5) * speed) });
        }
        simObjects.particles = particles;

    } else if (activePhenomenon === 'buoyancy') {
        const water = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4 }));
        water.position.set(0, 4, 0); scene.add(water);
        const block = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
        scene.add(block);
        simObjects.water = water; simObjects.block = block;
        simObjects.state = { y: 10, v: 0 };

    // THIÊN VĂN
    } else if (activePhenomenon === 'gravity') {
        const sun = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfcb316 }));
        const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
        scene.add(sun); scene.add(p1); scene.add(p2);
        simObjects.sun = sun; simObjects.p1 = p1; simObjects.p2 = p2;
        simObjects.state = {
            sun: { pos: new THREE.Vector3(0, 5, 0), vel: new THREE.Vector3(0, 0, 0), mass: getInputValue('m1') },
            p1: { pos: new THREE.Vector3(12, 5, 0), vel: new THREE.Vector3(0, 0, 6), mass: getInputValue('m2') },
            p2: { pos: new THREE.Vector3(-18, 5, 0), vel: new THREE.Vector3(0, 0, -4.5), mass: getInputValue('m3') }
        };

    } else if (activePhenomenon === 'blackHole') {
        const bh = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        const ring = new THREE.Mesh(new THREE.RingGeometry(3, 6, 32), new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide }));
        ring.rotation.x = Math.PI / 3; scene.add(bh); scene.add(ring);
        simObjects.bh = bh; simObjects.ring = ring;

    // LƯỢNG TỬ
    } else if (activePhenomenon === 'bohrAtom') {
        const nucleus = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        scene.add(nucleus);
        const electron = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 }));
        scene.add(electron);
        simObjects.nucleus = nucleus; simObjects.electron = electron;
        simObjects.state = { angle: 0 };

    } else if (activePhenomenon === 'doubleSlit') {
        const barrier = new THREE.Mesh(new THREE.BoxGeometry(0.2, 10, 15), new THREE.MeshStandardMaterial({ color: 0x475569 }));
        barrier.position.set(-5, 5, 0); scene.add(barrier);
        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.2, 12, 18), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        screen.position.set(10, 5, 0); scene.add(screen);
        simObjects.barrier = barrier; simObjects.screen = screen;
    }

    updatePhysics(0);
}

// --- PHYSICS COMPUTATION ENGINE ---
function updatePhysics(dt) {
    const metrics = document.getElementById('metrics-container');

    if (activePhenomenon === 'projectile') {
        const s = simObjects.state, g = getInputValue('gravity'), m = getInputValue('mass'), drag = getInputValue('drag');
        if (isPlaying && s.pos.y >= 0.6) {
            const dragForce = s.vel.clone().multiplyScalar(-drag);
            const totalForce = new THREE.Vector3(0, -m * g, 0).add(dragForce);
            s.vel.add(totalForce.divideScalar(m).multiplyScalar(dt));
            s.pos.add(s.vel.clone().multiplyScalar(dt));
            s.time += dt;
            appendTrailPoint(s.pos);
        }
        if (s.pos.y < 0.6) { s.pos.y = 0.6; s.vel.set(0, 0, 0); }
        simObjects.ball.position.copy(s.pos);
        const v = s.vel.length(), h = Math.max(0, s.pos.y - 0.6);
        updateChart(0.5 * m * v * v, m * g * h);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Độ cao Y</span><span class="text-cyan-400 font-bold">${h.toFixed(2)} m</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Tầm xa X</span><span class="text-cyan-400 font-bold">${s.pos.x.toFixed(2)} m</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Vận tốc</span><span class="text-cyan-400 font-bold">${v.toFixed(2)} m/s</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Thời gian</span><span class="text-cyan-400 font-bold">${s.time.toFixed(2)} s</span></div>
        `;

    } else if (activePhenomenon === 'pendulum') {
        const s = simObjects.state, g = getInputValue('gravity'), m = getInputValue('mass');
        if (isPlaying) {
            const alpha = -(g / s.length) * Math.sin(s.angle) - getInputValue('damping') * s.angularVel;
            s.angularVel += alpha * dt;
            s.angle += s.angularVel * dt;
        }
        const pPos = simObjects.pivot.position;
        const bobPos = new THREE.Vector3(pPos.x + s.length * Math.sin(s.angle), pPos.y - s.length * Math.cos(s.angle), pPos.z);
        simObjects.bob.position.copy(bobPos);
        simObjects.rod.geometry.setFromPoints([pPos, bobPos]);
        if (isPlaying) appendTrailPoint(bobPos, 0xf43f5e);
        const v = Math.abs(s.angularVel * s.length), h = s.length * (1 - Math.cos(s.angle));
        updateChart(0.5 * m * v * v, m * g * h);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Góc lệch</span><span class="text-cyan-400 font-bold">${((s.angle * 180) / Math.PI).toFixed(1)}°</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Vận tốc góc</span><span class="text-cyan-400 font-bold">${s.angularVel.toFixed(2)} rad/s</span></div>
        `;

    } else if (activePhenomenon === 'doublePendulum') {
        const s = simObjects.state, g = 9.8, m1 = getInputValue('m1'), m2 = getInputValue('m2');
        if (isPlaying) {
            const num1 = -g * (2 * m1 + m2) * Math.sin(s.a1) - m2 * g * Math.sin(s.a1 - 2 * s.a2) - 2 * Math.sin(s.a1 - s.a2) * m2 * (s.a2_v * s.a2_v * s.l2 + s.a1_v * s.a1_v * s.l1 * Math.cos(s.a1 - s.a2));
            const den1 = s.l1 * (2 * m1 + m2 - m2 * Math.cos(2 * s.a1 - 2 * s.a2));
            const a1_a = num1 / den1;
            const num2 = 2 * Math.sin(s.a1 - s.a2) * (s.a1_v * s.a1_v * s.l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(s.a1) + s.a2_v * s.a2_v * s.l2 * m2 * Math.cos(s.a1 - s.a2));
            const den2 = s.l2 * (2 * m1 + m2 - m2 * Math.cos(2 * s.a1 - 2 * s.a2));
            const a2_a = num2 / den2;

            s.a1_v += a1_a * dt; s.a2_v += a2_a * dt;
            s.a1 += s.a1_v * dt; s.a2 += s.a2_v * dt;
        }
        const p = simObjects.pivot.position;
        const x1 = p.x + s.l1 * Math.sin(s.a1), y1 = p.y - s.l1 * Math.cos(s.a1);
        const x2 = x1 + s.l2 * Math.sin(s.a2), y2 = y1 - s.l2 * Math.cos(s.a2);
        simObjects.bob1.position.set(x1, y1, 0); simObjects.bob2.position.set(x2, y2, 0);
        simObjects.rod1.geometry.setFromPoints([p, new THREE.Vector3(x1, y1, 0)]);
        simObjects.rod2.geometry.setFromPoints([new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)]);
        if (isPlaying) appendTrailPoint(new THREE.Vector3(x2, y2, 0), 0xf43f5e);
        metrics.innerHTML = `<div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Trạng thái</span><span class="text-cyan-400 font-bold">Chuyển động Hỗn độn (Chaos)</span></div>`;

    } else if (activePhenomenon === 'spring') {
        const s = simObjects.state, k = getInputValue('k'), m = getInputValue('mass');
        if (isPlaying) {
            const accel = (-k * s.x - getInputValue('damping') * s.v) / m;
            s.v += accel * dt; s.x += s.v * dt;
        }
        simObjects.mass.position.set(s.x, 5, 0);
        const points = [];
        for (let i = 0; i <= 12; i++) {
            points.push(new THREE.Vector3(-10 + (s.x + 10) * (i / 12), 5 + (i % 2 === 0 ? 0.4 : -0.4), 0));
        }
        simObjects.springLine.geometry.setFromPoints(points);
        updateChart(0.5 * m * s.v * s.v, 0.5 * k * s.x * s.x);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Li độ (x)</span><span class="text-cyan-400 font-bold">${s.x.toFixed(2)} m</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Vận tốc (v)</span><span class="text-cyan-400 font-bold">${s.v.toFixed(2)} m/s</span></div>
        `;

    } else if (activePhenomenon === 'collision') {
        const s = simObjects.state;
        if (isPlaying) {
            s.x1 += s.v1 * dt; s.x2 += s.v2 * dt;
            if (s.x1 + 0.8 >= s.x2 - 0.8) {
                const v1New = ((s.m1 - s.m2) * s.v1 + 2 * s.m2 * s.v2) / (s.m1 + s.m2);
                const v2New = ((s.m2 - s.m1) * s.v2 + 2 * s.m1 * s.v1) / (s.m1 + s.m2);
                s.v1 = v1New; s.v2 = v2New;
            }
        }
        simObjects.ball1.position.set(s.x1, 1, 0); simObjects.ball2.position.set(s.x2, 1, 0);
        updateChart(0.5 * s.m1 * s.v1 * s.v1, 0.5 * s.m2 * s.v2 * s.v2);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">V1 Quả Cầu 1</span><span class="text-cyan-400 font-bold">${s.v1.toFixed(2)} m/s</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">V2 Quả Cầu 2</span><span class="text-cyan-400 font-bold">${s.v2.toFixed(2)} m/s</span></div>
        `;

    } else if (activePhenomenon === 'centripetal') {
        const s = simObjects.state, r = getInputValue('radius'), w = getInputValue('omega');
        if (isPlaying) s.angle += w * dt;
        const x = r * Math.cos(s.angle), z = r * Math.sin(s.angle);
        simObjects.bob.position.set(x, 2, z);
        simObjects.rod.geometry.setFromPoints([new THREE.Vector3(0, 2, 0), new THREE.Vector3(x, 2, z)]);
        if (isPlaying) appendTrailPoint(new THREE.Vector3(x, 2, z), 0x06b6d4);
        const F_centripetal = getInputValue('mass') * w * w * r;
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Vận tốc dài</span><span class="text-cyan-400 font-bold">${(w * r).toFixed(2)} m/s</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Lực hướng tâm</span><span class="text-cyan-400 font-bold">${F_centripetal.toFixed(2)} N</span></div>
        `;

    } else if (activePhenomenon === 'lorentz') {
        const s = simObjects.state, q = getInputValue('charge'), B = getInputValue('bField'), m = getInputValue('mass');
        if (isPlaying) {
            const bVec = new THREE.Vector3(0, B, 0);
            const force = new THREE.Vector3().crossVectors(s.vel, bVec).multiplyScalar(q);
            s.vel.add(force.divideScalar(m).multiplyScalar(dt));
            s.pos.add(s.vel.clone().multiplyScalar(dt));
            appendTrailPoint(s.pos, 0x00ffff);
        }
        simObjects.particle.position.copy(s.pos);
        metrics.innerHTML = `<div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Vận tốc hạt</span><span class="text-cyan-400 font-bold">${s.vel.length().toFixed(2)} m/s</span></div>`;

    } else if (activePhenomenon === 'brownian') {
        if (isPlaying) {
            simObjects.particles.forEach(p => {
                p.mesh.position.add(p.vel.clone().multiplyScalar(dt));
                if (Math.abs(p.mesh.position.x) > 10) p.vel.x *= -1;
                if (p.mesh.position.y < 0.5 || p.mesh.position.y > 12) p.vel.y *= -1;
                if (Math.abs(p.mesh.position.z) > 10) p.vel.z *= -1;
            });
        }
        metrics.innerHTML = `<div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Trạng thái</span><span class="text-cyan-400 font-bold">Chuyển động Va chạm Nhiệt</span></div>`;

    } else if (activePhenomenon === 'gravity') {
        const st = simObjects.state, G = getInputValue('gConst'), bodies = ['sun', 'p1', 'p2'];
        if (isPlaying) {
            bodies.forEach(b1Key => {
                bodies.forEach(b2Key => {
                    if (b1Key !== b2Key) {
                        const b1 = st[b1Key], b2 = st[b2Key];
                        const dir = new THREE.Vector3().subVectors(b2.pos, b1.pos);
                        const dist = Math.max(dir.length(), 2);
                        const force = dir.normalize().multiplyScalar((G * b1.mass * b2.mass) / (dist * dist));
                        b1.vel.add(force.divideScalar(b1.mass).multiplyScalar(dt));
                    }
                });
            });
            bodies.forEach(k => st[k].pos.add(st[k].vel.clone().multiplyScalar(dt)));
            appendTrailPoint(st.p1.pos, 0x10b981);
            appendTrailPoint(st.p2.pos, 0xa855f7);
        }
        simObjects.sun.position.copy(st.sun.pos);
        simObjects.p1.position.copy(st.p1.pos);
        simObjects.p2.position.copy(st.p2.pos);
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl col-span-2"><span class="text-slate-400 block text-[10px]">Khoảng cách Sun - P1</span><span class="text-cyan-400 font-bold">${st.sun.pos.distanceTo(st.p1.pos).toFixed(2)} m</span></div>
        `;

    } else if (activePhenomenon === 'bohrAtom') {
        const s = simObjects.state, n = getInputValue('nOrbit'), r = n * n * 3;
        if (isPlaying) s.angle += (4 / n) * dt;
        simObjects.electron.position.set(r * Math.cos(s.angle), 0, r * Math.sin(s.angle));
        metrics.innerHTML = `
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Bán kính quỹ đạo</span><span class="text-cyan-400 font-bold">${r.toFixed(1)} r₀</span></div>
            <div class="glass-card p-2 rounded-xl"><span class="text-slate-400 block text-[10px]">Mức năng lượng</span><span class="text-cyan-400 font-bold">-${(13.6 / (n*n)).toFixed(2)} eV</span></div>
        `;
    }
}

// --- ANIMATION LOOP ---
let lastTime = performance.now();
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1) * timeScale;
    lastTime = now;

    controls.update();
    updatePhysics(dt);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = initScene;
