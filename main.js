/**
 * COSMIC DUST STUDIO - CORE ENGINE v4.0
 * Logic & Controller
 */

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
    // Note: Advanced noises (simplex etc) are inside specific shader styles if needed
`;

/**
 * VisualEngine - Wrapper for Three.js Rendering per Canvas
 */
class VisualEngine {
    constructor(container, config, isPreview) {
        this.container = container;
        this.config = config;
        this.isPreview = isPreview;

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
            u_mouse: { value: new THREE.Vector3(0, 0, 0) },
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

        // Append first, then resize to ensure dimensions are read correctly
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

        // Recompile if style changed
        const newCode = FRAGMENT_HEADER + (SHADER_STYLES[cfg.style] || SHADER_STYLES['ancient_sand']);
        if (this.material.fragmentShader !== newCode) {
            this.material.fragmentShader = newCode;
            this.material.needsUpdate = true;
        }
    }

    setupEvents() {
        let isDown = false;
        let altPressed = false;
        const guide = document.getElementById('brush-guide');

        const onKeyDown = (e) => { if (e.altKey) altPressed = true; };
        const onKeyUp = (e) => { if (e.key === 'Alt') altPressed = false; };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        const onDown = () => isDown = true;
        const onUp = () => isDown = false;
        const onMove = (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            // Update Mouse Uniform
            this.uniforms.u_mouse.value.set(x, 1.0 - y, 0); // Normalized

            if (altPressed) {
                guide.style.display = 'block';
                guide.style.left = e.clientX + 'px';
                guide.style.top = e.clientY + 'px';
                guide.style.width = (this.config.brushR * 400) + 'px';
                guide.style.height = (this.config.brushR * 400) + 'px';

                if (isDown || e.buttons === 1) {
                    this.paint(x, y);
                }
            } else {
                guide.style.display = 'none';
            }
        };

        this.container.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
        this.container.addEventListener('mouseleave', () => { guide.style.display = 'none'; });
    }

    paint(x, y) {
        const ctx = this.brushCtx;
        const w = this.brushCanvas.width;
        const h = this.brushCanvas.height;
        const r = this.config.brushR * w; // Relative radius

        const g = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r);
        g.addColorStop(0, `rgba(255,255,255,${this.config.brushI * 0.1})`);
        g.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x * w, y * h, r, 0, Math.PI * 2);
        ctx.fill();
        this.brushTexture.needsUpdate = true;
    }

    update() {
        // Fade effect for brush
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

    const STORAGE_KEY = 'COSMIC_STUDIO_VAULT_V4';

    // --- CORE METHODS ---

    const init = () => {
        loadFromVault();
        renderDashboard();
        animate();
        setupGlobalListeners();
    };

    const loadFromVault = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                arts = JSON.parse(saved);
                arts = arts.map(fixArtProperties);
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
        createDefaultArt('The First Spark', 'ancient_sand'),
        createDefaultArt('Neon Dreams', 'neon_flow'),
        createDefaultArt('Liquid Metal', 'metaballs_goo'),
        createDefaultArt('Elevation Map', 'topographic_lines')
    ];

    const saveToVault = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arts));
    };

    const fixArtProperties = (art) => {
        return {
            id: art.id || Date.now() + Math.random(),
            name: art.name || 'Untitled Project',
            style: art.style || 'ancient_sand',
            speed: art.speed ?? 0.001,
            scale: art.scale ?? 5.0,
            complexity: art.complexity ?? 4.0,
            detail: art.detail ?? 0.5,
            c1: art.c1 || '#ffffff',
            c2: art.c2 || '#4f46e5',
            c3: art.c3 || '#000000',
            brushR: art.brushR ?? 0.1,
            brushI: art.brushI ?? 1.0
        };
    };

    const createDefaultArt = (name, style) => {
        const art = fixArtProperties({ name, style });
        return art;
    };

    const createNewArt = () => {
        const newArt = createDefaultArt('Untitled masterpiece #' + (arts.length + 1));
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

    // --- RENDERING ---

    const renderDashboard = () => {
        const grid = document.getElementById('art-grid');
        grid.innerHTML = '';

        engines.forEach(e => e.dispose());
        engines = [];

        arts.forEach((art) => {
            const card = document.createElement('div');
            card.className = 'art-card';
            card.innerHTML = `
                <div class="canvas-stub" id="stub-${art.id}"></div>
                <div class="card-actions">
                    <button class="btn-action" style="padding:6px 12px; font-size:10px; width:auto; background:var(--accent)" onclick="event.stopPropagation(); StudioManager.openDesigner(StudioManager.getArtById('${art.id}'))">Edit Master</button>
                    <button class="btn-action" style="padding:6px 12px; font-size:10px; width:auto; border-color:rgba(255,0,0,0.3)" onclick="event.stopPropagation(); StudioManager.deleteArt('${art.id}')">Delete</button>
                </div>
                <div class="art-info">
                    <h3>${art.name}</h3>
                    <p>${art.style.replace(/_/g, ' ')}</p>
                </div>
            `;

            card.onclick = () => openDesigner(art);
            grid.appendChild(card);

            const container = document.getElementById(`stub-${art.id}`);
            // Small Optimization: Use simple shader for thumbnails? No, Keep Full Quality for Premium feel.
            const engine = new VisualEngine(container, art, true);
            engines.push(engine);
        });
    };

    const deleteArt = (id) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        arts = arts.filter(a => a.id.toString() !== id.toString());
        saveToVault();
        renderDashboard();
    };

    // --- DESIGNER LOGIC ---

    const openDesigner = (art) => {
        activeArt = art;
        const designer = document.getElementById('designer');
        designer.classList.add('active');

        document.getElementById('active-art-name').innerText = art.name;

        // Sync UI
        document.getElementById('ui-style').value = art.style;
        document.getElementById('ui-speed').value = art.speed;
        document.getElementById('ui-scale').value = art.scale;
        document.getElementById('ui-complexity').value = art.complexity;
        document.getElementById('ui-detail').value = art.detail;
        document.getElementById('ui-c1').value = art.c1;
        document.getElementById('ui-c2').value = art.c2;
        document.getElementById('ui-c3').value = art.c3;
        document.getElementById('ui-brush-r').value = art.brushR;
        document.getElementById('ui-brush-i').value = art.brushI;
        document.getElementById('ui-aspect').value = 'story'; // Default aspect

        const container = document.getElementById('studio-canvas-container');
        container.innerHTML = '';
        designerEngine = new VisualEngine(container, art, false);

        updateAspect();
        updateLabels();
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

        activeArt.style = document.getElementById('ui-style').value;
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

    const updateAspect = () => {
        const aspect = document.getElementById('ui-aspect').value;
        const container = document.getElementById('studio-canvas-container');
        
        // Clear all previous classes and styles
        container.className = '';
        
        // Force a specific class based on aspect
        container.classList.add(`preview-aspect-${aspect}`);
        
        // Fullscreen specific logic
        if(aspect === 'full') {
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

        // Delay resize slightly to allow CSS transition/layout update
        setTimeout(() => {
            if(designerEngine) designerEngine.resize();
        }, 100);
    };

    const updateLabels = () => {
        if (!activeArt) return;

        const styleLabels = {
            ancient_sand: { p1: 'Erosion Speed', p2: 'Grain Density', p3: 'Complexity', p4: 'Sharpness' },
            cosmic_dust: { p1: 'Drift Speed', p2: 'Stardust Scale', p3: 'Chaos Level', p4: 'Brightness' },
            topographic_lines: { p1: 'Flow Velocity', p2: 'Map Scale', p3: 'Line Density', p4: 'Line Thickness' },
            metaballs_goo: { p1: 'Viscosity', p2: 'Goo Scale', p3: 'Fusion Power', p4: 'Surface Tension' },
            aqueous_caustics: { p1: 'Wave Speed', p2: 'Refraction Scale', p3: 'Ray Complexity', p4: 'Light depth' },
            retro_dither: { p1: 'Pulse Speed', p2: 'Resolution', p3: 'Dither Pattern', p4: 'Intensity' },
            pixel_sorter: { p1: 'Melt Speed', p2: 'Stripe Scale', p3: 'Glitch Rate', p4: 'Melt Intensity' },
            chromatic_glitch: { p1: 'Distort Speed', p2: 'Aberration Scale', p3: 'Noise amount', p4: 'Color Separation' },
            neon_flow: { p1: 'Fluid Speed', p2: 'Neon Thickness', p3: 'Vapor Complexity', p4: 'Glow Strength' },
            voronoi_cells: { p1: 'Cell Vitality', p2: 'Cell Density', p3: 'Warp Factor', p4: 'Wall Thickness' },
            cyber_grid: { p1: 'Grid Speed', p2: 'Tile Scale', p3: 'Data Chaos', p4: 'Electric Detail' },
            plasma_leak: { p1: 'Flow Speed', p2: 'Plasma Density', p3: 'Chaos Level', p4: 'Leak Intensity' },
            aurora_borealis: { p1: 'Drift Speed', p2: 'Light Scale', p3: 'Ray Complexity', p4: 'Glow Strength' },
            fractal_mandelbulb: { p1: 'Pulse Speed', p2: 'Zoom Level', p3: 'Iteration Depth', p4: 'Edge Sharpness' }
        };

        const currentLabels = styleLabels[activeArt.style] || styleLabels['ancient_sand'];

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
                a.download = `CosmicMaster_${activeArt.name.replace(/\s+/g, '_')}_${Date.now()}.mp4`;
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

    return { init, createNewArt, deleteArt, closeDesigner, updateActiveParams, updateAspect, toggleRecording, exportProject, importProject, duplicateCurrent, getArtById, openDesigner };
})();

// Launch
document.addEventListener('DOMContentLoaded', StudioManager.init);
