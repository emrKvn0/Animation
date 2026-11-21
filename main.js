/**
 * COSMIC DUST STUDIO - CORE ENGINE v4.2
 * Logic, Shader Catalog & Controller
 */

/* --- SHADER CATALOG METADATA --- */
const SHADER_CATEGORIES = ['All', 'Retro', 'Cosmic', 'Organic', 'Cyber', 'Fractal'];

const SHADER_CATALOG = [
    // NEW (Nov 2026)
    {
        id: 'synthwave_sunset', name: 'Synthwave Outrun Sunset', category: 'Retro', badge: 'NEW', added: 'Nov 2026',
        tags: ['80s', 'Neon Grid', 'Mouse', 'CRT'],
        desc: 'Retro sliced sunset, glowing neon mountain ridge, perspective laser grid & twinkling stars.',
        labels: { p1: 'Cruise Speed', p2: 'Grid Scale', p3: 'Sun Stripes', p4: 'Sun Size' }
    },
    {
        id: 'matrix_rain', name: 'Digital Matrix Rain', category: 'Cyber', badge: 'NEW', added: 'Nov 2026',
        tags: ['Code Rain', 'Glyphs', 'Mouse', 'Terminal'],
        desc: 'Cascading luminous digital glyph columns with bright leading heads and cursor pulse waves.',
        labels: { p1: 'Fall Speed', p2: 'Column Density', p3: 'Trail Decay', p4: 'Drop Length' }
    },
    {
        id: 'lava_lamp', name: 'Psychedelic Lava Lamp', category: 'Organic', badge: 'NEW', added: 'Nov 2026',
        tags: ['Metaballs', 'Glossy', 'Mouse', 'Relaxing'],
        desc: 'Floating glossy lava blobs that smoothly merge with an interactive cursor sphere.',
        labels: { p1: 'Buoyancy', p2: 'Blob Size', p3: 'Color Wave', p4: 'Blend Softness' }
    },
    {
        id: 'kaleidoscope_prism', name: 'Kaleidoscope Prism', category: 'Fractal', badge: 'NEW', added: 'Nov 2026',
        tags: ['Symmetry', 'Mirrors', 'Psychedelic', 'Brush'],
        desc: 'Hypnotic N-fold mirrored kaleidoscope with rotating chromatic ribbons and energy ripples.',
        labels: { p1: 'Spin Speed', p2: 'Prism Zoom', p3: 'Mirror Slices', p4: 'Wave Density' }
    },
    {
        id: 'neon_tunnel', name: 'Infinite Neon Wormhole', category: 'Cosmic', badge: 'NEW', added: 'Nov 2026',
        tags: ['3D Tunnel', 'Warp', 'Mouse Steer', 'Portal'],
        desc: 'Endless twisting neon wormhole flying through 3D space with mouse-steered vanishing point.',
        labels: { p1: 'Warp Speed', p2: 'Tunnel Depth', p3: 'Twist & Spokes', p4: 'Line Sharpness' }
    },
    {
        id: 'fireworks_bloom', name: 'Neon Fireworks Bloom', category: 'Retro', badge: 'NEW', added: 'Nov 2026',
        tags: ['Particles', 'Sparks', 'Shockwave', 'Brush'],
        desc: 'Looping firework bursts with sparkling trails, shockwave rings, and brush-triggered sparks.',
        labels: { p1: 'Launch Rate', p2: 'Burst Radius', p3: 'Chaos', p4: 'Spark Spread' }
    },

    // REMASTERED (Feb 2026)
    {
        id: 'divine_mandala', name: 'Divine Lotus Mandala', category: 'Fractal', badge: 'NEW', added: 'Nov 2026',
        tags: ['Sacred Geometry', 'Lotus SDF', 'Polar', 'Brush'],
        desc: 'Authentic polar SDF sacred mandala with Seed of Life core, counter-rotating Vesica Piscis lotus petals, pearl beads & scalloped filigree.',
        labels: { p1: 'Rotation Speed', p2: 'Mandala Zoom', p3: 'Petal Symmetry', p4: 'Filigree Glow' }
    },
    {
        id: 'hyperspace_jump', name: 'Hyperspace Jump', category: 'Cosmic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Starfield', 'Warp', 'Sci-Fi'],
        desc: 'High-velocity starfield light-speed streaks pulling toward the center.',
        labels: { p1: 'Warp Speed', p2: 'Star Density', p3: 'Complexity', p4: 'Streak Length' }
    },
    {
        id: 'gravity_well', name: 'Gravity Well / Black Hole', category: 'Cosmic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Lensing', 'Space', 'Event Horizon'],
        desc: 'Gravitational lensing distortion around a dark cosmic singularity.',
        labels: { p1: 'Warp Speed', p2: 'Field Scale', p3: 'Chaos', p4: 'Lensing Strength' }
    },
    {
        id: 'aurora_borealis', name: 'Aurora Borealis', category: 'Cosmic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Northern Lights', 'Atmosphere', 'Smooth'],
        desc: 'Flowing polar light curtains drifting smoothly across the night sky.',
        labels: { p1: 'Drift Speed', p2: 'Light Scale', p3: 'Ray Complexity', p4: 'Glow Strength' }
    },
    {
        id: 'crystal_nebula', name: 'Crystal Nebula', category: 'Cosmic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Crystalline', 'Nebula', 'Fractal'],
        desc: 'Faceted crystalline nebula clouds with sharp luminous ridges.',
        labels: { p1: 'Growth Speed', p2: 'Fractal Scale', p3: 'Complexity', p4: 'Sharpness' }
    },
    {
        id: 'plasma_leak', name: 'Plasma Leak', category: 'Cosmic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Plasma', 'Glow', 'Abstract'],
        desc: 'Radiant plasma energy ribbons leaking across dark cosmic space.',
        labels: { p1: 'Flow Speed', p2: 'Plasma Density', p3: 'Chaos Level', p4: 'Leak Intensity' }
    },
    {
        id: 'fractal_mandelbulb', name: 'Fractal Mandelbulb (2D)', category: 'Fractal', badge: 'PRO', added: 'Feb 2026',
        tags: ['Fractal', 'Math', 'Recursive'],
        desc: 'Recursive 2D fractal escape-time field with pulsing harmonic glow.',
        labels: { p1: 'Pulse Speed', p2: 'Zoom Level', p3: 'Iteration Depth', p4: 'Edge Sharpness' }
    },
    {
        id: 'topographic_lines', name: 'Topographic Isolines', category: 'Organic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Terrain', 'Contour', 'Domain Warp', 'Brush'],
        desc: 'Domain-warped elevation contour map with pseudo-normal lighting and shadows.',
        labels: { p1: 'Flow Velocity', p2: 'Map Scale', p3: 'Line Density', p4: 'Line Thickness' }
    },
    {
        id: 'metaballs_goo', name: 'Metaballs / Liquid Metal', category: 'Organic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Slime', 'Specular', 'Fluid'],
        desc: 'Viscous liquid metal droplets with specular rim lighting and smooth fusion.',
        labels: { p1: 'Viscosity', p2: 'Goo Scale', p3: 'Fusion Power', p4: 'Surface Tension' }
    },
    {
        id: 'aqueous_caustics', name: 'Aqueous Caustics', category: 'Organic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Water', 'Refraction', 'Light'],
        desc: 'Shimmering underwater caustic light rays refracting through waves.',
        labels: { p1: 'Wave Speed', p2: 'Refraction Scale', p3: 'Ray Complexity', p4: 'Light Depth' }
    },
    {
        id: 'voronoi_cells', name: 'Organic Cell Structure', category: 'Organic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Voronoi', 'Bio', 'Cellular'],
        desc: 'Living Voronoi cellular membrane network with pulsing walls.',
        labels: { p1: 'Cell Vitality', p2: 'Cell Density', p3: 'Warp Factor', p4: 'Wall Thickness' }
    },
    {
        id: 'neon_flow', name: 'Hyper Neon Fluid', category: 'Organic', badge: 'PRO', added: 'Feb 2026',
        tags: ['Fluid', 'Neon', 'Vapor'],
        desc: 'Silk-smooth hyper-saturated neon fluid waves.',
        labels: { p1: 'Fluid Speed', p2: 'Neon Thickness', p3: 'Vapor Complexity', p4: 'Glow Strength' }
    },
    {
        id: 'cyber_grid', name: 'Glitch Cyber Grid', category: 'Cyber', badge: 'PRO', added: 'Feb 2026',
        tags: ['Cyberpunk', 'Grid', 'Electric'],
        desc: 'Electrified cybernetic data grid with glitch pulses.',
        labels: { p1: 'Grid Speed', p2: 'Tile Scale', p3: 'Data Chaos', p4: 'Electric Detail' }
    },
    {
        id: 'electric_storm', name: 'Electric Storm', category: 'Cyber', badge: 'PRO', added: 'Feb 2026',
        tags: ['Lightning', 'Arcs', 'Energy'],
        desc: 'Crackling high-voltage plasma arcs and lightning bolts.',
        labels: { p1: 'Storm Intensity', p2: 'Frequency', p3: 'Bolt Count', p4: 'Bolt Thickness' }
    },
    {
        id: 'chromatic_glitch', name: 'Chromatic Glitch', category: 'Cyber', badge: 'PRO', added: 'Feb 2026',
        tags: ['RGB Split', 'Glitch', 'VHS'],
        desc: 'RGB chromatic aberration tear and digital signal distortion.',
        labels: { p1: 'Distort Speed', p2: 'Aberration Scale', p3: 'Noise Amount', p4: 'Color Separation' }
    },
    {
        id: 'pixel_sorter', name: 'Pixel Sorter / Melt', category: 'Retro', badge: 'PRO', added: 'Feb 2026',
        tags: ['Glitch Art', 'Melting', 'Stripes'],
        desc: 'Vertical melting pixel-sort streaks with dynamic glitch rate.',
        labels: { p1: 'Melt Speed', p2: 'Stripe Scale', p3: 'Glitch Rate', p4: 'Melt Intensity' }
    },
    {
        id: 'retro_dither', name: 'Retro Dither (Ordered)', category: 'Retro', badge: 'PRO', added: 'Feb 2026',
        tags: ['Bayer', '1-Bit', 'Pixel Art'],
        desc: 'Classic ordered Bayer matrix dithering with retro pulse waves.',
        labels: { p1: 'Pulse Speed', p2: 'Resolution', p3: 'Dither Pattern', p4: 'Intensity' }
    },

    // ORIGINALS (Jan 2026)
    {
        id: 'ancient_sand', name: 'Ancient Sand', category: 'Organic', badge: 'CLASSIC', added: 'Jan 2026',
        tags: ['Original', 'Grain', 'Fog'],
        desc: 'Original v2 procedural desert sand grain and drifting atmospheric fog.',
        labels: { p1: 'Erosion Speed', p2: 'Grain Density', p3: 'Complexity', p4: 'Sharpness' }
    },
    {
        id: 'cosmic_dust', name: 'Cosmic Dust v2', category: 'Cosmic', badge: 'CLASSIC', added: 'Jan 2026',
        tags: ['Original', 'Stardust', 'Shimmer'],
        desc: 'Original v2 shimmering stardust clouds flowing through deep space.',
        labels: { p1: 'Drift Speed', p2: 'Stardust Scale', p3: 'Chaos Level', p4: 'Brightness' }
    }
];

const getShaderMeta = (id) => SHADER_CATALOG.find(s => s.id === id) || SHADER_CATALOG[0];

/* --- CONSTANTS --- */
const VERTEX_SHADER = `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const FRAGMENT_HEADER = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_offset;
    uniform sampler2D u_brushTexture;
    uniform vec3 u_mouse; 
    
    uniform vec3 u_c1; // Primary
    uniform vec3 u_c2; // Secondary
    uniform vec3 u_c3; // Background
    
    uniform float u_speed;
    uniform float u_scale;
    uniform float u_complexity;
    uniform float u_detail;
    
    varying vec2 vUv;

    // MATH UTILS
    float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }
    
    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 st) {
        float v = 0.0;
        float a = 0.5;
        for(int i=0; i<8; i++) {
            if(float(i) > u_complexity) break;
            v += a * noise(st);
            st *= 2.0;
            a *= 0.5;
        }
        return v;
    }
`;

/**
 * VisualEngine - Wrapper for Three.js Rendering per Canvas
 */
class VisualEngine {
    constructor(container, config, isPreview) {
        this.container = container;
        this.config = config;
        this.isPreview = isPreview;
        this._cleanupEvents = null;

        // Brush Buffer
        this.brushCanvas = document.createElement('canvas');
        this.brushCanvas.width = 512; this.brushCanvas.height = 512;
        this.brushCtx = this.brushCanvas.getContext('2d', { alpha: false });
        this.brushCtx.fillStyle = 'black'; this.brushCtx.fillRect(0, 0, 512, 512);
        this.brushTexture = new THREE.CanvasTexture(this.brushCanvas);

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: !isPreview, antialias: false, alpha: false });

        this.uniforms = {
            u_time: { value: Math.random() * 100 },
            u_resolution: { value: new THREE.Vector2() },
            u_offset: { value: new THREE.Vector2(Math.random() * 10, Math.random() * 10) },
            u_brushTexture: { value: this.brushTexture },
            u_mouse: { value: new THREE.Vector3(0.5, 0.5, 0) },
            u_c1: { value: new THREE.Color(config.c1) },
            u_c2: { value: new THREE.Color(config.c2) },
            u_c3: { value: new THREE.Color(config.c3) },
            u_speed: { value: config.speed },
            u_scale: { value: config.scale },
            u_complexity: { value: config.complexity },
            u_detail: { value: config.detail },
            u_seed: { value: Math.random() * 100 }
        };

        const shaderCode = (SHADER_STYLES[config.style] || SHADER_STYLES['ancient_sand']);

        this.material = new THREE.ShaderMaterial({
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_HEADER + shaderCode,
            uniforms: this.uniforms
        });

        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
        this.scene.add(this.mesh);

        container.appendChild(this.renderer.domElement);
        this.resize();

        if (!isPreview) this.setupEvents();
    }

    resize() {
        const w = this.container.offsetWidth;
        const h = this.container.offsetHeight;
        const r = this.isPreview ? 1 : Math.min(window.devicePixelRatio, 2);

        if (w && h) {
            this.renderer.setSize(w, h, false);
            this.renderer.setPixelRatio(r);
            this.uniforms.u_resolution.value.set(w * r, h * r);
        }
    }

    sync(cfg) {
        this.config = cfg;
        this.uniforms.u_c1.value.set(cfg.c1);
        this.uniforms.u_c2.value.set(cfg.c2);
        this.uniforms.u_c3.value.set(cfg.c3);
        this.uniforms.u_speed.value = cfg.speed;
        this.uniforms.u_scale.value = cfg.scale;
        this.uniforms.u_complexity.value = cfg.complexity;
        this.uniforms.u_detail.value = cfg.detail;

        if (!cfg.brushEnabled) {
            const guide = document.getElementById('brush-guide');
            if (guide) guide.style.display = 'none';
        }

        const newCode = FRAGMENT_HEADER + (SHADER_STYLES[cfg.style] || SHADER_STYLES['ancient_sand']);
        if (this.material.fragmentShader !== newCode) {
            this.material.fragmentShader = newCode;
            this.material.needsUpdate = true;
        }
    }

    clearBrush() {
        this.brushCtx.fillStyle = 'black';
        this.brushCtx.fillRect(0, 0, this.brushCanvas.width, this.brushCanvas.height);
        this.brushTexture.needsUpdate = true;
    }

    setupEvents() {
        let isDown = false;
        let altPressed = false;
        const guide = document.getElementById('brush-guide');

        const onKeyDown = (e) => { if (e.altKey) altPressed = true; };
        const onKeyUp = (e) => { if (e.key === 'Alt') altPressed = false; };
        const onDown = (e) => { if (e.button === 0) isDown = true; };
        const onUp = () => { isDown = false; };
        const onLeave = () => { guide.style.display = 'none'; isDown = false; };

        const onMove = (e) => {
            const rect = this.container.getBoundingClientRect();
            const inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                           e.clientY >= rect.top && e.clientY <= rect.bottom;
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            if (inside) {
                this.uniforms.u_mouse.value.set(x, 1.0 - y, isDown ? 1 : 0);
            }

            if (this.config.brushEnabled && inside && (isDown || altPressed)) {
                guide.style.display = 'block';
                guide.style.left = e.clientX + 'px';
                guide.style.top = e.clientY + 'px';
                guide.style.width = (this.config.brushR * 400) + 'px';
                guide.style.height = (this.config.brushR * 400) + 'px';

                if (isDown || e.buttons === 1 || altPressed) {
                    this.paint(x, y);
                }
            } else {
                guide.style.display = 'none';
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        this.container.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
        this.container.addEventListener('mouseleave', onLeave);

        this._cleanupEvents = () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            this.container.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mousemove', onMove);
            this.container.removeEventListener('mouseleave', onLeave);
            guide.style.display = 'none';
        };
    }

    paint(x, y) {
        if (!this.config.brushEnabled) return;
        const ctx = this.brushCtx;
        const w = this.brushCanvas.width;
        const h = this.brushCanvas.height;
        const r = this.config.brushR * w;

        const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r);
        g.addColorStop(0, `rgba(255,255,255,${this.config.brushI * 0.12})`);
        g.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x * w, y * h, r, 0, Math.PI * 2);
        ctx.fill();
        this.brushTexture.needsUpdate = true;
    }

    update() {
        if (this.brushCtx && Math.random() > 0.5) {
            this.brushCtx.fillStyle = 'rgba(0,0,0,0.015)';
            this.brushCtx.fillRect(0, 0, this.brushCanvas.width, this.brushCanvas.height);
            this.brushTexture.needsUpdate = true;
        }

        this.uniforms.u_time.value += 0.01;
        this.uniforms.u_offset.value.x += 1.0 * this.config.speed;
        this.uniforms.u_offset.value.y += 0.4 * this.config.speed;
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this._cleanupEvents) this._cleanupEvents();
        this.renderer.dispose();
        this.material.dispose();
        this.brushTexture.dispose();
    }
}

/**
 * StudioManager - Main Controller
 */
const StudioManager = (() => {

    let arts = [];
    let activeArt = null;
    let engines = [];
    let designerEngine = null;
    let activeCategory = 'All';

    const STORAGE_KEY = 'COSMIC_STUDIO_VAULT_V4';

    // --- CORE METHODS ---

    const init = () => {
        loadFromVault();
        renderCategoryPills();
        renderDashboard();
        animate();
        setupGlobalListeners();
    };

    const loadFromVault = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                arts = JSON.parse(saved).map(fixArtProperties);
            } catch (e) {
                console.error("Vault corrupted, resetting...", e);
                arts = defaultCollection();
            }
        } else {
            arts = defaultCollection();
            saveToVault();
        }
    };

    const defaultCollection = () => [
        createDefaultArt('Outrun Horizon', 'synthwave_sunset', '#00f5d4', '#ff006e', '#05010f'),
        createDefaultArt('Neon Wormhole', 'neon_tunnel', '#e0aaff', '#7b2cbf', '#05020d'),
        createDefaultArt('Matrix Pulse', 'matrix_rain', '#52ff9a', '#00a86b', '#010a05'),
        createDefaultArt('Lava Dreams', 'lava_lamp', '#ffb703', '#fb5607', '#0c0402')
    ];

    const saveToVault = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arts));
    };

    const fixArtProperties = (art) => ({
        id: art.id || Date.now() + Math.random(),
        name: art.name || 'Untitled Project',
        style: art.style || 'synthwave_sunset',
        aspect: art.aspect || 'cinema',
        speed: art.speed ?? 0.001,
        scale: art.scale ?? 5.0,
        complexity: art.complexity ?? 4.0,
        detail: art.detail ?? 0.5,
        c1: art.c1 || '#00f5d4',
        c2: art.c2 || '#6366f1',
        c3: art.c3 || '#050508',
        brushEnabled: art.brushEnabled ?? true,
        brushR: art.brushR ?? 0.1,
        brushI: art.brushI ?? 1.0
    });

    const createDefaultArt = (name, style = 'synthwave_sunset', c1, c2, c3) => {
        return fixArtProperties({ name, style, c1, c2, c3 });
    };

    const createNewArt = () => {
        const newArt = createDefaultArt('Masterpiece #' + (arts.length + 1), 'synthwave_sunset');
        arts.unshift(newArt);
        saveToVault();
        renderDashboard();
        openDesigner(newArt);
    };

    const duplicateCurrent = () => {
        if (!activeArt) return;
        const dup = { ...activeArt, id: Date.now() + Math.random(), name: activeArt.name + ' (Copy)' };
        arts.unshift(dup);
        saveToVault();
        renderDashboard();
        showToast("Duplicated!");
    };

    const getArtById = (id) => arts.find(a => a.id.toString() === id.toString());

    // --- DASHBOARD RENDERING ---

    const renderDashboard = () => {
        const grid = document.getElementById('art-grid');
        grid.innerHTML = '';

        engines.forEach(e => e.dispose());
        engines = [];

        arts.forEach((art) => {
            const meta = getShaderMeta(art.style);
            const badgeClass = meta.badge === 'NEW' ? 'badge-new' : meta.badge === 'PRO' ? 'badge-pro' : 'badge-classic';
            const card = document.createElement('div');
            card.className = 'art-card';
            card.innerHTML = `
                <div class="canvas-stub" id="stub-${art.id}"></div>
                <div class="card-actions">
                    <button class="btn-action" style="padding:5px 10px; font-size:11px; width:auto; background:var(--accent); border-color:var(--accent)" onclick="event.stopPropagation(); StudioManager.openDesigner(StudioManager.getArtById('${art.id}'))">Edit</button>
                    <button class="btn-action" style="padding:5px 10px; font-size:11px; width:auto; border-color:rgba(239,68,68,0.4)" onclick="event.stopPropagation(); StudioManager.deleteArt('${art.id}')">Delete</button>
                </div>
                <div class="art-info">
                    <h3>${art.name}</h3>
                    <div class="art-info-sub">
                        <span class="badge ${badgeClass}">${meta.category}</span>
                        <span>${meta.name}</span>
                        <span>• ${meta.added}</span>
                    </div>
                </div>
            `;

            card.onclick = () => openDesigner(art);
            grid.appendChild(card);

            const container = document.getElementById(`stub-${art.id}`);
            const engine = new VisualEngine(container, art, true);
            engines.push(engine);
        });
    };

    const deleteArt = (id) => {
        if (!confirm("Delete this project? This cannot be undone.")) return;
        arts = arts.filter(a => a.id.toString() !== id.toString());
        saveToVault();
        renderDashboard();
    };

    // --- SIDEBAR TABS & SHADER CATALOG ---

    const switchTab = (tabName) => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-${tabName}`);
        });
    };

    const renderCategoryPills = () => {
        const wrap = document.getElementById('category-pills');
        if (!wrap) return;
        wrap.innerHTML = SHADER_CATEGORIES.map(cat => {
            const count = cat === 'All'
                ? SHADER_CATALOG.length
                : SHADER_CATALOG.filter(s => s.category === cat).length;
            return `<button class="cat-pill ${cat === activeCategory ? 'active' : ''}" onclick="StudioManager.selectCategory('${cat}')">${cat} (${count})</button>`;
        }).join('');
    };

    const selectCategory = (cat) => {
        activeCategory = cat;
        renderCategoryPills();
        renderShaderCatalog();
    };

    const renderShaderCatalog = () => {
        const listEl = document.getElementById('shader-list');
        const activeMetaEl = document.getElementById('active-shader-meta');
        if (!listEl || !activeArt) return;

        const currentMeta = getShaderMeta(activeArt.style);
        const currentBadgeClass = currentMeta.badge === 'NEW' ? 'badge-new' : currentMeta.badge === 'PRO' ? 'badge-pro' : 'badge-classic';

        if (activeMetaEl) {
            activeMetaEl.innerHTML = `
                <div class="active-shader-top">
                    <span class="active-shader-title">${currentMeta.name}</span>
                    <div class="shader-badges">
                        <span class="badge ${currentBadgeClass}">${currentMeta.badge}</span>
                        <span class="badge badge-classic">${currentMeta.added}</span>
                    </div>
                </div>
                <p class="active-shader-desc">${currentMeta.desc}</p>
                <div class="tag-row">
                    <span class="tag-chip" style="color:#a5b4fc">${currentMeta.category}</span>
                    ${currentMeta.tags.map(t => `<span class="tag-chip">#${t}</span>`).join('')}
                </div>
            `;
        }

        const query = (document.getElementById('shader-search')?.value || '').trim().toLowerCase();
        const filtered = SHADER_CATALOG.filter(s => {
            const matchCat = activeCategory === 'All' || s.category === activeCategory;
            if (!matchCat) return false;
            if (!query) return true;
            return (
                s.name.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query) ||
                s.added.toLowerCase().includes(query) ||
                s.desc.toLowerCase().includes(query) ||
                s.tags.some(t => t.toLowerCase().includes(query))
            );
        });

        if (filtered.length === 0) {
            listEl.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-dim); font-size:0.8rem;">No shaders match "${query}"</div>`;
            return;
        }

        listEl.innerHTML = filtered.map(s => {
            const bClass = s.badge === 'NEW' ? 'badge-new' : s.badge === 'PRO' ? 'badge-pro' : 'badge-classic';
            const selected = activeArt.style === s.id ? 'selected' : '';
            return `
                <div class="shader-item ${selected}" onclick="StudioManager.selectShader('${s.id}')">
                    <div class="shader-item-head">
                        <span class="shader-item-name">${s.name}</span>
                        <div class="shader-badges">
                            <span class="badge ${bClass}">${s.badge}</span>
                        </div>
                    </div>
                    <div class="shader-item-meta">
                        <span class="shader-item-cat">${s.category}</span>
                        <span>Added ${s.added}</span>
                    </div>
                    <div class="tag-row">
                        ${s.tags.map(t => `<span class="tag-chip">#${t}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    };

    const selectShader = (styleId) => {
        if (!activeArt || !designerEngine) return;
        activeArt.style = styleId;
        designerEngine.sync(activeArt);
        updateLabels();
        renderShaderCatalog();
        saveToVault();
    };

    // --- DESIGNER LOGIC ---

    const openDesigner = (art) => {
        activeArt = fixArtProperties(art);
        const idx = arts.findIndex(a => a.id.toString() === activeArt.id.toString());
        if (idx >= 0) arts[idx] = activeArt;

        const designer = document.getElementById('designer');
        designer.classList.add('active');
        document.getElementById('active-art-name').innerText = activeArt.name;

        // Sync inputs
        document.getElementById('ui-speed').value = activeArt.speed;
        document.getElementById('ui-scale').value = activeArt.scale;
        document.getElementById('ui-complexity').value = activeArt.complexity;
        document.getElementById('ui-detail').value = activeArt.detail;
        document.getElementById('ui-c1').value = activeArt.c1;
        document.getElementById('ui-c2').value = activeArt.c2;
        document.getElementById('ui-c3').value = activeArt.c3;
        document.getElementById('ui-brush-r').value = activeArt.brushR;
        document.getElementById('ui-brush-i').value = activeArt.brushI;
        document.getElementById('ui-brush-enabled').checked = activeArt.brushEnabled;

        const container = document.getElementById('studio-canvas-container');
        container.innerHTML = '';
        designerEngine = new VisualEngine(container, activeArt, false);

        setAspect(activeArt.aspect || 'cinema');
        syncBrushUI();
        updateLabels();
        renderShaderCatalog();
        switchTab('shaders');
    };

    const closeDesigner = () => {
        document.getElementById('designer').classList.remove('active');
        if (designerEngine) {
            designerEngine.dispose();
            designerEngine = null;
        }
        activeArt = null;
        saveToVault();
        renderDashboard();
    };

    const updateActiveParams = () => {
        if (!activeArt || !designerEngine) return;

        activeArt.speed = parseFloat(document.getElementById('ui-speed').value);
        activeArt.scale = parseFloat(document.getElementById('ui-scale').value);
        activeArt.complexity = parseFloat(document.getElementById('ui-complexity').value);
        activeArt.detail = parseFloat(document.getElementById('ui-detail').value);
        activeArt.c1 = document.getElementById('ui-c1').value;
        activeArt.c2 = document.getElementById('ui-c2').value;
        activeArt.c3 = document.getElementById('ui-c3').value;
        activeArt.brushR = parseFloat(document.getElementById('ui-brush-r').value);
        activeArt.brushI = parseFloat(document.getElementById('ui-brush-i').value);

        designerEngine.sync(activeArt);
        updateLabels();
        saveToVault();
    };

    const applyPalette = (c1, c2, c3) => {
        if (!activeArt) return;
        document.getElementById('ui-c1').value = c1;
        document.getElementById('ui-c2').value = c2;
        document.getElementById('ui-c3').value = c3;
        updateActiveParams();
        showToast("Palette Applied!");
    };

    const toggleBrush = (enabled) => {
        if (!activeArt || !designerEngine) return;
        activeArt.brushEnabled = enabled;
        if (!enabled) designerEngine.clearBrush();
        designerEngine.sync(activeArt);
        syncBrushUI();
        saveToVault();
        showToast(enabled ? "Brush Enabled" : "Brush Disabled");
    };

    const clearBrush = () => {
        if (designerEngine) {
            designerEngine.clearBrush();
            showToast("Brush Cleared");
        }
    };

    const syncBrushUI = () => {
        if (!activeArt) return;
        const wrap = document.getElementById('brush-controls-wrap');
        const status = document.getElementById('status-brush');
        if (wrap) wrap.classList.toggle('disabled', !activeArt.brushEnabled);
        if (status) {
            status.textContent = activeArt.brushEnabled ? 'Brush: ON (Drag / ALT)' : 'Brush: OFF';
            status.className = `status-pill ${activeArt.brushEnabled ? 'on' : 'off'}`;
        }
    };

    const setAspect = (aspect) => {
        const container = document.getElementById('studio-canvas-container');
        if (activeArt) {
            activeArt.aspect = aspect;
            saveToVault();
        }

        document.querySelectorAll('.aspect-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.aspect === aspect);
        });

        container.className = `preview-aspect-${aspect}`;
        if (aspect === 'full') {
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.maxWidth = 'none';
            container.style.maxHeight = 'none';
        } else {
            container.style.width = '';
            container.style.height = '';
            container.style.maxWidth = '';
            container.style.maxHeight = '';
        }

        setTimeout(() => {
            if (designerEngine) designerEngine.resize();
        }, 80);
    };

    const updateLabels = () => {
        if (!activeArt) return;
        const meta = getShaderMeta(activeArt.style);
        const currentLabels = meta.labels;

        document.getElementById('studio-label-speed').innerText = currentLabels.p1;
        document.getElementById('studio-label-scale').innerText = currentLabels.p2;
        document.getElementById('studio-label-complexity').innerText = currentLabels.p3;
        document.getElementById('studio-label-detail').innerText = currentLabels.p4;

        document.getElementById('val-speed').innerText = activeArt.speed.toFixed(4);
        document.getElementById('val-scale').innerText = activeArt.scale.toFixed(1);
        document.getElementById('val-complexity').innerText = activeArt.complexity.toFixed(1);
        document.getElementById('val-detail').innerText = activeArt.detail.toFixed(2);
        document.getElementById('val-brush-r').innerText = activeArt.brushR.toFixed(2);
        document.getElementById('val-brush-i').innerText = activeArt.brushI.toFixed(1);
    };

    // --- EXPORT / IMPORT ---

    const exportProject = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arts));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `CosmicStudio_Suite_${Date.now()}.json`);
        dlAnchorElem.click();
        showToast("Library Exported!");
    };

    const importProject = (input) => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    arts = imported.map(fixArtProperties);
                    saveToVault();
                    renderDashboard();
                    showToast(`Imported ${arts.length} Projects`);
                }
            } catch (err) { alert("Invalid File Format"); }
        };
        reader.readAsText(file);
    };

    // --- RECORDING ---

    let recorder = null;
    let chunks = [];

    const toggleRecording = () => {
        if (!designerEngine) return;
        const btn = document.getElementById('btn-record');
        const dot = document.getElementById('rec-dot');

        if (recorder && recorder.state === 'recording') {
            recorder.stop();
            btn.textContent = 'Start Master Render';
            dot.classList.remove('active');
        } else {
            const settings = JSON.parse(document.getElementById('ui-format').value);
            const streamSettings = { w: settings.w, h: settings.h, bitrate: settings.b * 1000000, fps: settings.f };

            designerEngine.renderer.setPixelRatio(1);
            designerEngine.renderer.setSize(streamSettings.w, streamSettings.h, false);
            designerEngine.uniforms.u_resolution.value.set(streamSettings.w, streamSettings.h);

            const stream = designerEngine.renderer.domElement.captureStream(streamSettings.fps);
            recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: streamSettings.bitrate });
            chunks = [];

            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `CosmicMaster_${activeArt.name.replace(/\s+/g, '_')}_${Date.now()}.webm`;
                a.click();
                designerEngine.resize();
                showToast("Render Finished!");
            };

            recorder.start();
            btn.textContent = 'Stop Recording';
            dot.classList.add('active');
            showToast("Recording Master Stream...");
        }
    };

    const animate = () => {
        requestAnimationFrame(animate);
        if (designerEngine) {
            designerEngine.update();
        } else {
            engines.forEach(e => e.update());
        }
    };

    const setupGlobalListeners = () => {
        window.addEventListener('resize', () => {
            if (designerEngine) designerEngine.resize();
        });

        window.addEventListener('keydown', (e) => {
            if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
            if (e.key.toLowerCase() === 'z') document.getElementById('zoom-wrapper').classList.add('zoomed');
        });
        window.addEventListener('keyup', (e) => {
            if (e.key.toLowerCase() === 'z') document.getElementById('zoom-wrapper').classList.remove('zoomed');
        });
    };

    const showToast = (msg) => {
        const t = document.getElementById('toast');
        t.innerText = msg; t.classList.add('visible');
        setTimeout(() => t.classList.remove('visible'), 2500);
    };

    return {
        init, createNewArt, deleteArt, closeDesigner, updateActiveParams,
        setAspect, toggleRecording, exportProject, importProject, duplicateCurrent,
        getArtById, openDesigner, switchTab, selectCategory, renderShaderCatalog,
        selectShader, applyPalette, toggleBrush, clearBrush
    };
})();

// Launch
document.addEventListener('DOMContentLoaded', StudioManager.init);
