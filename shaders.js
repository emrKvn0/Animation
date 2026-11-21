/**
 * COSMIC DUST STUDIO - SHADER LIBRARY v4.1 (High-End Edition)
 * All 11 Styles Remastered.
 */

const SHADER_STYLES = {
    // --- 1. TOPOGRAPHICAL / ISOLINES (Fixed & High-End) ---
    topographic_lines: `
        // Helper for snoise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

        // Simplex-ish noise
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                -0.577350269189626, // -1.0 + 2.0 * C.x
                                0.024390243902439); // 1.0 / 41.0
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }
        
        // Renamed to avoid overload
        float t_random (in vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
        }
        
        float t_noise (in vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = t_random(i);
            float b = t_random(i + vec2(1.0, 0.0));
            float c = t_random(i + vec2(0.0, 1.0));
            float d = t_random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float t_fbm (in vec2 st) {
            float value = 0.0;
            float amplitude = .5;
            float frequency = 0.;
            for (int i = 0; i < 6; i++) {
                value += amplitude * t_noise(st);
                st *= 2.;
                amplitude *= .5;
            }
            return value;
        }
        
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;
            
            // Domain Warping
            vec2 q = vec2(0.);
            q.x = t_fbm(st * u_scale * 0.1 + u_offset + u_time*0.05);
            q.y = t_fbm(st * u_scale * 0.1 + vec2(5.2,1.3) + u_offset + u_time*0.04);

            vec2 r = vec2(0.);
            r.x = t_fbm(st + 4.0*q + vec2(1.7,9.2) - brush);
            r.y = t_fbm(st + 4.0*q + vec2(8.3,2.8) + brush);

            float height = t_fbm(st * u_scale * 0.2 + 2.0*r);
            height += brush * 0.5;

            float linesFreq = 40.0 * u_complexity; 
            float lineVal = sin(height * linesFreq);
            float lineThickness = 0.05 + (1.0-u_detail) * 0.2; 
            float lineMask = smoothstep(lineThickness, lineThickness - 0.01, abs(lineVal));
            
            // Calculate pseudo-normal from height
            vec2 e = vec2(0.001, 0.0);
            float hX = t_fbm((st + e.xy) * u_scale * 0.2 + 2.0*r) - height;
            float hY = t_fbm((st + e.yx) * u_scale * 0.2 + 2.0*r) - height;
            vec3 normal = normalize(vec3(-hX, -hY, 0.01));
            
            float diff = max(dot(normal, normalize(vec3(1.0, 1.0, 1.0))), 0.0);
            float shadow = smoothstep(0.01, -0.01, hX + hY);
            
            vec3 baseCol = mix(u_c3, u_c2 * 0.4, diff); 
            baseCol = mix(baseCol, u_c2, height * 0.5);
            vec3 finalCol = mix(baseCol, u_c1, lineMask);
            
            // Add subtle ambient occlusion
            finalCol *= 0.8 + 0.2 * smoothstep(0.0, 0.1, height);
            finalCol -= shadow * 0.1;
            
            finalCol -= (t_random(st*100.0) - 0.5) * 0.05;

            gl_FragColor = vec4(finalCol, 1.0);
        }
    `,

    // --- 2. METABALLS / SLIME (Enhanced with Specular & Rim) ---
    metaballs_goo: `
        vec2 hash2( vec2 p ) {
            return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
        }
        float sdCircle(vec2 p, float r) { return length(p) - r; }
        float smin( float a, float b, float k ) {
            float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
            return mix( b, a, h ) - k*h*(1.0-h);
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;

            vec3 bg = u_c3;
            bg += 0.05 * sin(st.x * 20.0 + u_time) * sin(st.y * 20.0 - u_time);

            float d = 100.0; 
            int numBalls = int(u_complexity) * 3 + 4;
            float scale = u_scale * 0.5;
            
            for(int i=0; i<20; i++) {
                if(i >= numBalls) break;
                float t = u_time * u_speed * 10.0 + float(i)*10.0;
                vec2 pos = vec2(0.5 * u_resolution.x/u_resolution.y, 0.5); 
                pos += vec2(
                    cos(t * 0.5 + float(i)) * 0.4 * scale,
                    sin(t * 0.7 + float(i)*0.8) * 0.4 * scale
                );
                
                float radius = 0.05 + hash2(vec2(float(i)*1.1)).x * 0.1; 
                radius += brush * 0.2; 

                float dist = sdCircle(st - pos, radius);
                float k = 0.15 * (u_detail + 0.1) * 3.0; 
                d = smin(d, dist, k);
            }
            
            float shape = smoothstep(0.01, -0.01, d);
            float rim = smoothstep(-0.05, 0.0, d) * (1.0 - smoothstep(0.0, 0.05, d));
            
            vec3 objCol = mix(u_c2, u_c1, smoothstep(-0.1, -0.2, d)); 
            
            // Fake Lighting
            vec2 normal = normalize(vec2(dFdx(d), dFdy(d)));
            float diff = max(dot(normal, normalize(vec2(1.0, 1.0))), 0.0);
            float spec = pow(diff, 32.0) * u_detail;
            
            vec3 col = mix(bg, objCol, shape);
            col += rim * u_c1 * 0.5;
            col += spec * vec3(1.0);
            
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 3. AQUEOUS CAUSTICS (High-End & Restored) ---
    aqueous_caustics: `
        vec2 hash2( vec2 p ) { return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }

        float voronoi( in vec2 x ) {
            vec2 n = floor(x);
            vec2 f = fract(x);
            float m_dist = 1.0;
            for( int j=-1; j<=1; j++ ) {
                for( int i=-1; i<=1; i++ ) {
                    vec2 g = vec2(float(i),float(j));
                    vec2 o = hash2( n + g );
                    o = 0.5 + 0.5*sin( u_time*u_speed*20.0 + 6.2831*o );
                    vec2 r = g + o - f;
                    float d = length(r);
                    m_dist = min(m_dist, d);
                }
            }
            return m_dist;
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;

            vec3 bgCol = mix(u_c3, u_c2 * 0.5, st.y);
            vec2 p = st * u_scale;
            float w = 0.5;
            float t = u_time * u_speed * 10.0;
            vec2 shiftR = vec2(u_detail * 0.01, 0.0);
            vec2 shiftB = vec2(-u_detail * 0.01, 0.0);

            // Red Channel
            float cR = 0.0; vec2 pR = p + shiftR;
            for(int i=0; i<3; i++) { cR += w * voronoi(pR); pR = pR * 2.0 + vec2(t); w *= 0.5; }
            cR = pow(1.0 - cR, 3.0 + u_complexity);

            // Green Channel
            float cG = 0.0; w = 0.5; vec2 pG = p;
            for(int i=0; i<3; i++) { cG += w * voronoi(pG); pG = pG * 2.0 + vec2(t + 43.0); w *= 0.5; }
            cG = pow(1.0 - cG, 3.0 + u_complexity);

            // Blue Channel
            float cB = 0.0; w = 0.5; vec2 pB = p + shiftB;
            for(int i=0; i<3; i++) { cB += w * voronoi(pB); pB = pB * 2.0 + vec2(t + 91.0); w *= 0.5; }
            cB = pow(1.0 - cB, 3.0 + u_complexity);

            vec3 waterLight = vec3(cR, cG, cB);
            waterLight += brush * u_c2 * 2.0;

            vec3 finalCol = bgCol;
            finalCol += waterLight * u_c1 * 1.5; 
            
            float sun = smoothstep(0.02, 0.0, distance(st + vec2(sin(t)*0.1), vec2(0.8, 0.8)) - brush*0.1);
            finalCol += sun * u_c1 * 2.0;

            gl_FragColor = vec4(finalCol, 1.0);
        }
    `,

    // --- 4. RETRO DITHER (High-End & Restored) ---
    retro_dither: `
        float bayer8(vec2 p) {
            float m[64];
            m[0]=0.0;  m[1]=32.0; m[2]=8.0;  m[3]=40.0; m[4]=2.0;  m[5]=34.0; m[6]=10.0; m[7]=42.0;
            m[8]=48.0; m[9]=16.0; m[10]=56.0;m[11]=24.0;m[12]=50.0;m[13]=18.0;m[14]=58.0;m[15]=26.0;
            m[16]=12.0;m[17]=44.0;m[18]=4.0; m[19]=36.0;m[20]=14.0;m[21]=46.0;m[22]=6.0; m[23]=38.0;
            m[24]=60.0;m[25]=28.0;m[26]=52.0;m[27]=20.0;m[28]=62.0;m[29]=30.0;m[30]=54.0;m[31]=22.0;
            m[32]=3.0; m[33]=35.0;m[34]=11.0;m[35]=43.0;m[36]=1.0; m[37]=33.0;m[38]=9.0; m[39]=41.0;
            m[40]=51.0;m[41]=19.0;m[42]=59.0;m[43]=27.0;m[44]=49.0;m[45]=17.0;m[46]=57.0;m[47]=25.0;
            m[48]=15.0;m[49]=47.0;m[50]=7.0; m[51]=39.0;m[52]=13.0;m[53]=45.0;m[54]=5.0; m[55]=37.0;
            m[56]=63.0;m[57]=31.0;m[58]=55.0;m[59]=23.0;m[60]=61.0;m[61]=29.0;m[62]=53.0;m[63]=21.0;
            int x = int(mod(p.x, 8.0));
            int y = int(mod(p.y, 8.0));
            int idx = x + y * 8;
            for(int i=0; i<64; i++) { if(i==idx) return m[i]/64.0; }
            return 0.0;
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float brush = texture2D(u_brushTexture, vUv).r;
            float pixelSize = floor(8.0 + (10.0 - u_scale * 0.3) * 20.0); 
            if(pixelSize < 1.0) pixelSize = 1.0;
            
            vec2 p_st = floor(gl_FragCoord.xy / pixelSize) * pixelSize;
            vec2 uv_st = p_st / u_resolution.xy;
            float t = u_time * u_speed * 5.0;
            float v = 0.5 + 0.5 * sin(uv_st.x * 10.0 + t + sin(uv_st.y * 10.0 + t));
            v += brush;

            float threshold = bayer8(gl_FragCoord.xy);
            vec3 col;
            float ditheredVal = v + (threshold - 0.5) * (1.1 - u_detail); 

            if (ditheredVal < 0.33) col = u_c3;
            else if (ditheredVal < 0.66) col = u_c2;
            else col = u_c1;
            
            if (mod(gl_FragCoord.y, 4.0) < 2.0) col *= 0.9; // Scanline
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 7. NEON FLOW (High-End: Gaseous Fluid Dynamics) ---
    neon_flow: `
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;

            vec2 p = st * u_scale * 0.5;
            vec2 q = vec2(0.0);
            vec2 r = vec2(0.0);
            float t = u_time * u_speed * 0.2;

            q.x = fbm(p + vec2(0.0, 0.0) + t);
            q.y = fbm(p + vec2(5.2, 1.3) + t);

            r.x = fbm(p + 4.0*q + vec2(1.7, 9.2) + t + brush);
            r.y = fbm(p + 4.0*q + vec2(8.3, 2.8) + t - brush);

            float f = fbm(p + 4.0*r);

            vec3 col = mix(u_c3, u_c2, clamp(length(q), 0.0, 1.0));
            col = mix(col, u_c1, clamp(length(r), 0.0, 1.0));

            float flowStr = f*f*f + 0.6*f*f + 0.5*f;
            col += brush * u_c1 * 0.8;
            col *= 1.2;

            float v = smoothstep(1.5, 0.5, length(vUv - 0.5) * 1.5);
            gl_FragColor = vec4(col * v, 1.0);
        }
    `,

    // --- 8. VORONOI CELLS (High-End: Biological Tissue) ---
    voronoi_cells: `
        vec2 rand2_bio(vec2 p) { return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453); }
        
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;
            st *= u_scale;
            
            vec2 i_st = floor(st);
            vec2 f_st = fract(st);
            
            float m_dist = 1.0;
            for (int y= -1; y <= 1; y++) {
                for (int x= -1; x <= 1; x++) {
                    vec2 neighbor = vec2(float(x),float(y));
                    vec2 point = rand2_bio(i_st + neighbor);
                    point = 0.5 + 0.5*sin(u_time * u_speed * 20.0 + 6.2831*point);
                    float dist = length(neighbor + point - f_st);
                    m_dist = min(m_dist, dist);
                }
            }
            
            vec3 col = u_c3; 
            float cellBody = smoothstep(0.8 - u_detail*0.5, 0.0, m_dist); 
            if(brush > 0.0) cellBody = smoothstep(0.9, 0.0, m_dist - brush*0.3);
            
            col = mix(col, u_c2, cellBody * 0.6);
            
            float nucSize = 0.1 * u_complexity;
            float nuc = smoothstep(nucSize + 0.05, nucSize, m_dist);
            col = mix(col, u_c1, nuc);
            
            float texture = fbm(st * 5.0 + u_time*0.1);
            col += texture * 0.05 * cellBody;

            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 9. CYBER GRID (Enhanced: Reactive & Glitchy) ---
    cyber_grid: `
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            vec2 uv = st * 2.0 - 1.0;
            float brush = texture2D(u_brushTexture, vUv).r;

            float horizon = 0.15 + brush * 0.1; 
            float fov = 1.0;
            float z = fov / (abs(uv.y - horizon) + 0.001); 
            float x = uv.x * z;
            
            float speed = u_time * u_speed * 40.0;
            vec2 gridUV = vec2(x, z + speed);
            gridUV *= u_scale * 0.5;
            
            // Grid Distort
            gridUV.x += sin(z * 0.5 + u_time) * 0.2;
            gridUV += brush * 2.0;

            vec2 grid = fract(gridUV);
            float thickness = 0.03 + u_detail * 0.1;
            float lineX = smoothstep(thickness, 0.0, abs(grid.x - 0.5));
            float lineY = smoothstep(thickness, 0.0, abs(grid.y - 0.5));
            float gridPattern = max(lineX, lineY);
            
            float fog = smoothstep(25.0, 2.0, z); 
            if(uv.y > horizon) fog = 0.0; 
            
            vec3 col = u_c3; 
            
            // Add reactive pulses
            float pulse = step(0.95, fract(z * 0.1 - u_time * 2.0));
            col = mix(col, u_c2, gridPattern * fog); 
            col += u_c1 * pulse * gridPattern * fog * 0.5;
            
            float horizonGlow = pow(1.0 - smoothstep(0.0, 0.4, abs(uv.y - horizon)), 4.0);
            col += u_c1 * horizonGlow;
            
            // Random Glitch Blocks
            float glitch = step(0.99, sin(z * 2.0 + u_time * 10.0)) * step(0.7, hash(vec2(floor(z), u_time)));
            col = mix(col, vec3(1.0), glitch * fog * u_detail);

            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 10. ELECTRIC STORM (New: Procedural Lightning) ---
    electric_storm: `
        float line(vec2 p, vec2 a, vec2 b) {
            vec2 pa = p - a, ba = b - a;
            float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
            return length(pa - ba * h);
        }
        
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float brush = texture2D(u_brushTexture, vUv).r;
            vec2 p = vUv * 2.0 - 1.0;
            p.x *= u_resolution.x / u_resolution.y;
            
            float t = u_time * u_speed * 50.0;
            vec3 col = u_c3;
            
            for(int i=0; i<5; i++) {
                if(float(i) > u_complexity) break;
                float fi = float(i);
                float x = (hash(vec2(fi, floor(t * 0.1))) - 0.5) * 2.0;
                float brightness = fract(sin(t + fi) * 437.5);
                
                if(brightness > 0.8 || brush > 0.5) {
                    float noise_val = fbm(vec2(st.y * u_scale, t * 0.01 + fi));
                    float bolt = abs(p.x - x + noise_val * 0.5);
                    float thickness = 0.01 * u_detail;
                    col += u_c1 * (0.002 / (bolt + 0.001)) * brightness;
                    col += u_c2 * (0.005 / (bolt + 0.02)) * brightness;
                }
            }
            
            col += brush * u_c1 * 0.2;
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 16. HYPERSPACE JUMP (Classic Warp) ---
    hyperspace_jump: `
        void main() {
            vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
            float brush = texture2D(u_brushTexture, vUv).r;
            
            float t = u_time * u_speed * 100.0;
            float a = atan(st.y, st.x);
            float r = length(st);
            
            vec3 col = u_c3;
            float numStars = 50.0 + u_complexity * 20.0;
            
            for(float i=0.0; i<100.0; i++) {
                if(i > numStars) break;
                float seed = i * 123.456;
                float angle = hash(vec2(seed, 0.0)) * 6.28;
                float dist = fract(hash(vec2(seed, 1.0)) + t * 0.01);
                
                float size = 0.001 + u_detail * 0.01;
                float star = smoothstep(size, 0.0, length(st - vec2(cos(angle), sin(angle)) * dist * 2.0));
                
                // Motion blur effect
                float streak = smoothstep(0.05 * u_speed * 10.0, 0.0, length(st - vec2(cos(angle), sin(angle)) * dist * 2.0));
                
                col += mix(u_c2, u_c1, hash(vec2(seed, 2.0))) * star * (dist * 2.0);
                col += u_c1 * streak * dist * 0.5;
            }
            
            col += brush * u_c1;
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 17. DIVINE MANDALA (Organic Seamless Kaleidoscope & Ridged FBM Edition) ---
    divine_mandala: `
        #define DM_PI 3.14159265359
        #define DM_TAU 6.28318530718

        mat2 dm_rot(float a) {
            float c = cos(a), s = sin(a);
            return mat2(c, -s, s, c);
        }

        // Smooth value noise for organic botanical/fractal detail
        float dm_hash(vec2 p) {
            p = fract(p * vec2(234.34, 435.345));
            p += dot(p, p + 34.23);
            return fract(p.x * p.y);
        }

        float dm_noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            float a = dm_hash(i);
            float b = dm_hash(i + vec2(1.0, 0.0));
            float c = dm_hash(i + vec2(0.0, 1.0));
            float d = dm_hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        // Ridged multifractal FBM (creates organic foliage, coral & vein filigree)
        float dm_ridgedFbm(vec2 p, float detailBoost) {
            float sum = 0.0;
            float amp = 0.55;
            mat2 m = mat2(1.62, 1.22, -1.22, 1.62);
            for (int i = 0; i < 6; i++) {
                float n = dm_noise(p);
                float ridge = 1.0 - abs(n * 2.0 - 1.0);
                ridge = ridge * ridge;
                sum += ridge * amp;
                p = m * p + vec2(1.7, 9.2);
                amp *= mix(0.46, 0.56, detailBoost);
            }
            return sum;
        }

        float dm_softFbm(vec2 p) {
            float sum = 0.0;
            float amp = 0.5;
            mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
            for (int i = 0; i < 4; i++) {
                sum += dm_noise(p) * amp;
                p = m * p;
                amp *= 0.5;
            }
            return sum;
        }

        // Inigo Quilez Cosine Color Palette (seamless hue cycle)
        vec3 dm_cosinePalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
            return a + b * cos(DM_TAU * (c * t + d));
        }

        // Evaluate organic mandala field at a given phase offset (for chromatic aberration & normals)
        vec3 dm_evalField(vec2 uv, float t, float folds, float scaleVal, float detailVal, float brush) {
            // Polar coordinates (r, theta)
            float r = length(uv);
            float theta = atan(uv.y, uv.x);

            // Seamless rotational drift + radial wave breathing
            float sector = DM_TAU / folds;
            float rotAngle = t * 0.14 + sin(t * 0.6 - r * 2.2) * 0.06;
            theta += rotAngle;

            // Mirror kaleidoscope folding (zero overlap, seamless seams)
            float a = mod(theta, sector);
            a = abs(a - sector * 0.5);

            // Endless scaling loop via log-radial flow + cyclic 4D-like orbit
            float logR = log(max(r, 0.008));
            float flowR = logR * (1.1 + scaleVal * 0.06) - t * 0.42;

            // Reconstruct seamless folded Cartesian coordinates for texture sampling
            vec2 kp = vec2(cos(a), sin(a)) * (0.45 + r * (1.8 + scaleVal * 0.14));
            vec2 flowCoord = vec2(flowR, a * folds * 0.45);

            // Cyclic circular noise motion (cos(t), sin(t)) for organic seamless breathing
            vec2 loopDrift = vec2(cos(t * 0.5), sin(t * 0.5)) * 0.65;

            // 2-stage domain warping for rich botanical / coral symmetry
            vec2 q = vec2(
                dm_softFbm(kp * 1.4 + flowCoord * 0.55 + loopDrift),
                dm_softFbm(kp * 1.4 + flowCoord * 0.55 - loopDrift + vec2(5.2, 1.3))
            );

            vec2 warped = kp * 2.1 + flowCoord * 0.7 + q * (1.45 + brush * 0.9);
            float ridged = dm_ridgedFbm(warped, detailVal);
            float soft = dm_softFbm(warped * 0.75 - q * 0.8);

            // Fine crystalline/mossy micro-filigree
            float micro = dm_ridgedFbm(warped * 3.2 + q * 1.5, detailVal);

            return vec3(ridged, soft, micro);
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
            float brush = texture2D(u_brushTexture, vUv).r;
            float r = length(uv);

            // Cyclic time driven by u_speed
            float t = u_time * (0.45 + u_speed * 150.0);

            // Clean even symmetry (6, 8, 10, 12, 14, 16) from u_complexity
            float folds = floor(3.0 + u_complexity * 0.65) * 2.0;

            // Subtle mouse center shift
            vec2 mShift = (u_mouse.xy - 0.5) * 0.12;
            vec2 p = uv - mShift * smoothstep(0.0, 0.9, r);

            // Subtle chromatic aberration (RGB phase split)
            float ca = 0.018 * (0.4 + u_detail * 0.6);
            vec3 fR = dm_evalField(p, t + ca, folds, u_scale, u_detail, brush);
            vec3 fG = dm_evalField(p, t,      folds, u_scale, u_detail, brush);
            vec3 fB = dm_evalField(p, t - ca, folds, u_scale, u_detail, brush);

            // Pseudo-3D tactile relief shading via finite differences
            float eps = 0.004;
            float hC = fG.x * 0.65 + fG.z * 0.35;
            float hX = dm_evalField(p + vec2(eps, 0.0), t, folds, u_scale, u_detail, brush).x * 0.65;
            float hY = dm_evalField(p + vec2(0.0, eps), t, folds, u_scale, u_detail, brush).x * 0.65;
            vec3 normal = normalize(vec3((hC - hX) * 6.0, (hC - hY) * 6.0, 0.35));
            float light = 0.55 + 0.55 * max(dot(normal, normalize(vec3(0.4, 0.7, 1.0))), 0.0);
            float ao = smoothstep(0.18, 0.95, hC);

            // Rich cosine palette (warm center -> emerald/cyan/luminous outer) blended with user colors
            float hueT = r * 0.55 - t * 0.06 + fG.y * 0.65;
            vec3 iqCol = dm_cosinePalette(
                hueT,
                vec3(0.52, 0.48, 0.46),
                vec3(0.46, 0.44, 0.42),
                vec3(1.0, 1.0, 1.0),
                vec3(0.05, 0.28, 0.58)
            );

            // Blend user chromatics harmoniously with the iridescent cosine spectrum
            vec3 userGrad = mix(u_c3, mix(u_c2, u_c1, smoothstep(0.25, 0.85, fG.x)), smoothstep(0.15, 0.9, fG.y));
            vec3 baseCol = mix(iqCol, userGrad, 0.42);

            // Combine RGB channels with subtle chromatic shimmer on organic ridges
            vec3 ridgeGlow = vec3(fR.z, fG.z, fB.z);
            vec3 col = baseCol * (0.45 + 0.75 * ao) * light;
            col += mix(iqCol, u_c1, 0.5) * pow(ridgeGlow, vec3(2.2)) * (0.45 + u_detail * 0.55);

            // Luminous Bindu center star glow
            float bindu = exp(-r * 6.5) * (0.45 + 0.25 * sin(t * 2.0));
            col += mix(u_c1, vec3(1.0, 0.92, 0.75), 0.5) * bindu;

            // Interactive brush luminous ripple
            if (brush > 0.01) {
                float wave = 0.5 + 0.5 * sin(r * 22.0 - t * 6.0);
                col += mix(u_c1, iqCol, 0.5) * brush * (0.6 + 0.4 * wave);
            }

            // Clean filmic contrast & subtle vignette
            col *= smoothstep(1.55, 0.55, r);
            col = col / (1.0 + col * 0.35);
            col = pow(max(col, 0.0), vec3(0.92));

            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 20. SYNTHWAVE OUTRUN SUNSET ---
    synthwave_sunset: `
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;
            float t = u_time * (0.6 + u_speed * 180.0);

            // Mouse subtle horizon tilt
            float horizon = -0.06 + (u_mouse.y - 0.5) * 0.12;

            // Sky gradient
            vec3 skyTop = u_c3;
            vec3 skyMid = mix(u_c3, u_c2, 0.55);
            vec3 skyBot = mix(u_c2, u_c1, 0.65);
            float skyT = clamp((p.y - horizon) / 0.6, 0.0, 1.0);
            vec3 col = mix(skyBot, mix(skyMid, skyTop, smoothstep(0.25, 1.0, skyT)), smoothstep(0.0, 0.55, skyT));

            // Twinkling stars above horizon
            if (p.y > horizon) {
                vec2 starGrid = floor((p + vec2(t * 0.01, 0.0)) * (45.0 + u_scale * 4.0));
                float starRnd = hash(starGrid);
                if (starRnd > 0.985) {
                    float twinkle = 0.5 + 0.5 * sin(t * 4.0 + starRnd * 100.0);
                    col += u_c1 * twinkle * smoothstep(horizon, horizon + 0.35, p.y) * 0.9;
                }

                // Retro sliced sun
                vec2 sunPos = vec2((u_mouse.x - 0.5) * 0.15, horizon + 0.22);
                float sunR = 0.16 + u_detail * 0.1;
                float dSun = length(p - sunPos);
                if (dSun < sunR) {
                    float sy = (p.y - (sunPos.y - sunR)) / (2.0 * sunR);
                    float stripe = sin((p.y - t * 0.04) * (55.0 + u_complexity * 8.0));
                    float cutMask = smoothstep(-0.1, 0.1, stripe + sy * 1.4 - 0.35);
                    vec3 sunCol = mix(u_c2, u_c1, sy);
                    col = mix(col, sunCol * 1.35, cutMask);
                }
                // Sun outer glow
                col += mix(u_c2, u_c1, 0.5) * exp(-dSun * 6.5) * 0.65;

                // Mountain silhouette
                float mX = p.x * (2.5 + u_scale * 0.15) + u_offset.x * 0.5;
                float mH = horizon + (fbm(vec2(mX, 1.7)) * 0.14 + 0.02) * (1.0 - smoothstep(0.0, 0.45, abs(p.x)));
                if (p.y < mH) {
                    col = mix(u_c3 * 0.4, u_c2 * 0.35, smoothstep(horizon, mH, p.y));
                    // Neon rim on mountain ridge
                    col += u_c1 * smoothstep(0.008, 0.0, abs(p.y - mH)) * 0.9;
                }
            } else {
                // Perspective scrolling laser grid
                float depth = max(horizon - p.y, 0.003);
                float z = 0.35 / depth;
                float x = p.x * z;
                float gridScale = 1.2 + u_scale * 0.15;
                float gx = abs(fract(x * gridScale) - 0.5);
                float gz = abs(fract(z * gridScale - t * 1.8) - 0.5);
                float lineW = 0.02 + (1.0 - u_detail) * 0.04;
                float grid = max(smoothstep(lineW, 0.0, gx), smoothstep(lineW, 0.0, gz));
                float fade = exp(-depth * 2.2);
                vec3 floorCol = u_c3 * 0.35;
                vec3 gridCol = mix(u_c2, u_c1, clamp(1.0 - depth * 3.0, 0.0, 1.0));
                col = floorCol + gridCol * grid * (1.4 - fade * 0.4);
                col += u_c1 * exp(-depth * 28.0) * 0.9;
            }

            // Brush synth energy burst
            col += u_c1 * brush * (0.8 + 0.4 * sin(t * 8.0));
            // Subtle CRT scanlines
            col *= 0.92 + 0.08 * sin(gl_FragCoord.y * 1.5);
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 21. DIGITAL MATRIX RAIN ---
    matrix_rain: `
        float mr_glyph(vec2 uv, float seed) {
            vec2 g = floor(uv * 5.0);
            float h = hash(g + floor(seed * 20.0));
            float border = step(0.12, uv.x) * step(uv.x, 0.88) * step(0.12, uv.y) * step(uv.y, 0.88);
            return step(0.45, h) * border;
        }
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            uv.x *= u_resolution.x / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;
            float t = u_time * (1.2 + u_speed * 260.0);

            float cols = 18.0 + u_scale * 2.5;
            vec2 grid = uv * cols;
            vec2 cellId = floor(grid);
            vec2 cellUv = fract(grid);

            float colRand = hash(vec2(cellId.x, 13.7));
            float colSpeed = 0.8 + colRand * (1.4 + u_complexity * 0.2);
            float dropY = fract(uv.y * (1.2 + u_detail) + t * colSpeed * 0.18 + colRand * 10.0);

            // Bright leading head & decaying tail
            float trail = pow(1.0 - dropY, 2.2 + u_complexity * 0.5);
            float head = smoothstep(0.06, 0.0, dropY);

            // Animated glyph character
            float charSeed = hash(cellId + floor(t * (2.0 + colRand * 4.0)) * 0.01);
            float glyph = mr_glyph(cellUv, charSeed);

            // Mouse pulse wave
            vec2 mPos = u_mouse.xy;
            mPos.x *= u_resolution.x / u_resolution.y;
            float mGlow = exp(-length(uv - mPos) * 5.0) * 0.8;

            vec3 rainCol = mix(u_c2, u_c1, head + brush * 0.7);
            vec3 col = u_c3 * 0.25 + rainCol * glyph * (trail * 1.4 + head * 1.6 + brush + mGlow);
            col += u_c1 * head * 0.35;

            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 22. PSYCHEDELIC LAVA LAMP ---
    lava_lamp: `
        float ll_smin(float a, float b, float k) {
            float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
            return mix(b, a, h) - k * h * (1.0 - h);
        }
        void main() {
            vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;
            float t = u_time * (0.45 + u_speed * 140.0);

            float field = 10.0;
            float k = 0.18 + u_detail * 0.18;

            for (int i = 0; i < 8; i++) {
                float fi = float(i);
                float x = sin(t * (0.4 + fi * 0.11) + fi * 2.1) * (0.32 + 0.08 * sin(t + fi));
                float y = cos(t * (0.3 + fi * 0.09) + fi * 1.7) * 0.42;
                float r = (0.09 + 0.05 * sin(fi * 3.1 + t * 0.5)) * (0.7 + u_scale * 0.04);
                float d = length(p - vec2(x, y)) - r;
                field = ll_smin(field, d, k);
            }

            // Mouse interactive blob
            vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
            field = ll_smin(field, length(p - m) - (0.08 + brush * 0.15), k);
            field -= brush * 0.14;

            // Smooth glossy lava shading
            float body = smoothstep(0.015, -0.015, field);
            float core = smoothstep(0.0, -0.14, field);
            float rim = smoothstep(0.03, 0.0, abs(field));

            // Background ambient glow
            vec3 bg = mix(u_c3, u_c2 * 0.45, smoothstep(-0.6, 0.6, p.y));
            bg += u_c2 * exp(-max(field, 0.0) * 6.0) * 0.4;

            vec3 lava = mix(u_c2, u_c1, core * 0.85 + 0.15 * sin(p.y * (4.0 + u_complexity) - t));
            // Specular highlight illusion
            float spec = smoothstep(-0.04, -0.12, field + (p.x * 0.04 - p.y * 0.04));
            lava += vec3(1.0) * spec * 0.25;

            vec3 col = mix(bg, lava, body) + u_c1 * rim * 0.55;
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 23. KALEIDOSCOPE PRISM ---
    kaleidoscope_prism: `
        void main() {
            vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;
            float t = u_time * (0.5 + u_speed * 150.0);

            // Polar coordinates
            float r = length(p);
            float a = atan(p.y, p.x);

            // N-fold mirror symmetry controlled by complexity
            float segments = floor(4.0 + u_complexity * 1.4);
            float sector = 6.2831853 / segments;
            a = mod(a + t * 0.15, sector);
            a = abs(a - sector * 0.5);

            vec2 kp = vec2(cos(a), sin(a)) * r;

            // Mouse offset & brush warp
            kp += (u_mouse.xy - 0.5) * 0.25;
            kp *= (1.5 + u_scale * 0.25);

            vec3 col = u_c3 * 0.2;
            for (int i = 0; i < 4; i++) {
                float fi = float(i);
                kp = abs(kp) / max(dot(kp, kp), 0.15) - vec2(0.75 + 0.15 * sin(t * 0.6 + fi), 0.55 + 0.15 * cos(t * 0.5 - fi));
                float wave = sin(length(kp) * (5.0 + u_detail * 6.0) - t * 2.0 + fi);
                float glow = 0.025 / (abs(wave) + 0.025);
                vec3 layerCol = mix(u_c1, u_c2, 0.5 + 0.5 * sin(fi * 1.8 + t + r * 3.0));
                col += layerCol * glow * 0.28;
            }

            col += u_c1 * brush * (0.6 + 0.4 * sin(r * 18.0 - t * 6.0));
            col *= smoothstep(1.3, 0.15, r);
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 24. INFINITE NEON WORMHOLE ---
    neon_tunnel: `
        void main() {
            vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;
            float t = u_time * (0.9 + u_speed * 220.0);

            // Mouse steers the tunnel vanishing point
            vec2 center = (u_mouse.xy - 0.5) * 0.35;
            vec2 q = p - center;

            float r = max(length(q), 0.002);
            float angle = atan(q.y, q.x);

            // Polar tunnel mapping with twist
            float z = (0.45 + u_scale * 0.04) / r + t * 1.4;
            float twist = angle + sin(z * 0.4 + t * 0.5) * (0.3 + u_complexity * 0.12) + brush * 1.5;

            float spokes = floor(6.0 + u_complexity * 1.5);
            float ringLine = smoothstep(0.08 + (1.0 - u_detail) * 0.12, 0.0, abs(fract(z) - 0.5));
            float spokeLine = smoothstep(0.06 + (1.0 - u_detail) * 0.1, 0.0, abs(fract(twist * spokes / 6.2831853) - 0.5));

            float pulse = 0.5 + 0.5 * sin(z * 3.0 - t * 4.0);
            vec3 ringCol = mix(u_c2, u_c1, pulse);
            vec3 spokeCol = mix(u_c1, u_c2, 0.5 + 0.5 * cos(angle * 2.0 + t));

            float fog = smoothstep(0.02, 0.55, r);
            vec3 col = u_c3 * 0.25 + (ringCol * ringLine * 1.4 + spokeCol * spokeLine * 0.9) * fog;
            // Core portal glow at vanishing point
            col += u_c1 * exp(-r * 7.0) * (1.1 + brush);

            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 25. NEON FIREWORKS BLOOM ---
    fireworks_bloom: `
        vec2 fw_hash2(float n) {
            return fract(sin(vec2(n, n + 1.234)) * vec2(43758.5453, 22578.1459));
        }
        void main() {
            vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;
            float t = u_time * (0.7 + u_speed * 160.0);

            vec3 col = u_c3 * 0.25;

            // Subtle starry backdrop
            vec2 sId = floor(p * 70.0);
            float sR = hash(sId);
            if (sR > 0.988) {
                col += u_c2 * (0.4 + 0.4 * sin(t * 3.0 + sR * 50.0)) * 0.5;
            }

            // 5 looping firework shells
            for (int b = 0; b < 5; b++) {
                float fb = float(b);
                float cycle = floor(t * 0.55 + fb * 0.37);
                float localT = fract(t * 0.55 + fb * 0.37);
                vec2 rnd = fw_hash2(cycle * 17.3 + fb * 31.7);
                vec2 center = (rnd - 0.5) * vec2(1.1, 0.65);

                // Expanding shockwave ring
                float ringR = localT * (0.32 + u_scale * 0.015);
                float ring = smoothstep(0.015, 0.0, abs(length(p - center) - ringR)) * (1.0 - localT);
                vec3 burstCol = mix(u_c1, u_c2, fract(fb * 0.31 + cycle * 0.17));
                col += burstCol * ring * 0.45;

                // Spark particles
                int sparks = 18;
                for (int s = 0; s < 18; s++) {
                    float fs = float(s);
                    float ang = (fs / float(sparks)) * 6.2831853 + rnd.x * 6.28 + sin(fs * 3.7) * 0.2;
                    float spd = (0.18 + 0.25 * hash(vec2(fs, cycle + fb))) * (0.7 + u_detail * 0.7);
                    vec2 vel = vec2(cos(ang), sin(ang)) * spd;
                    vec2 pos = center + vel * localT + vec2(0.0, -0.18 * localT * localT);
                    float d = length(p - pos);
                    float fade = (1.0 - localT) * smoothstep(0.0, 0.08, localT);
                    float sparkle = 0.6 + 0.4 * sin(t * 20.0 + fs * 12.0);
                    col += burstCol * (0.0022 / (d + 0.0025)) * fade * sparkle;
                }
            }

            // Interactive brush & mouse spark glow
            vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
            col += u_c1 * (0.008 / (length(p - m) + 0.02)) * 0.35;
            col += mix(u_c1, u_c2, 0.5) * brush * (0.9 + 0.4 * sin(t * 15.0));

            gl_FragColor = vec4(col, 1.0);
        }
    `
};
