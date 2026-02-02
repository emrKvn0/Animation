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
            
            float dh = t_fbm((st + vec2(0.01)) * u_scale * 0.2 + 2.0*r) - height;
            float light = smoothstep(-0.02, 0.05, dh);
            
            vec3 baseCol = mix(u_c3, u_c2 * 0.3, light * 0.5); 
            baseCol = mix(baseCol, u_c2, height * 0.4);
            vec3 finalCol = mix(baseCol, u_c1, lineMask);
            finalCol -= (t_random(st*100.0) - 0.5) * 0.05;

            gl_FragColor = vec4(finalCol, 1.0);
        }
    `,

    // --- 2. METABALLS / SLIME (Fixed & High-End) ---
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
            bg += 0.05 * sin(st.x * 20.0) * sin(st.y * 20.0);

            float d = 100.0; 
            int numBalls = int(u_complexity) * 3 + 4;
            float scale = u_scale * 0.5;
            
            for(int i=0; i<20; i++) {
                if(i >= numBalls) break;
                float t = u_time * u_speed * 10.0 + float(i)*10.0;
                vec2 vel = 2.0 * hash2(vec2(float(i))) - 1.0; 
                vec2 pos = vec2(0.5 * u_resolution.x/u_resolution.y, 0.5); 
                pos += vec2(
                    cos(t * 0.5 + float(i)) * 0.4 * scale,
                    sin(t * 0.7 + float(i)*0.8) * 0.4 * scale
                );
                
                float distBrush = distance(st, u_mouse.xy * vec2(u_resolution.x/u_resolution.y, 1.0));
                
                float radius = 0.05 + hash2(vec2(float(i)*1.1)).x * 0.1; 
                radius += brush * 0.2; 

                float dist = sdCircle(st - pos, radius);
                float k = 0.15 * (u_detail + 0.1) * 3.0; 
                d = smin(d, dist, k);
            }
            
            float shape = smoothstep(0.005, -0.005, d);
            float inner = smoothstep(-0.1, -0.2, d);
            
            vec3 col = bg;
            vec3 objCol = mix(u_c2, u_c1, inner); 
            
            col = mix(col, objCol, shape);
            
            if(d < 0.0) {
                 float s = noise(st * 10.0 + vec2(1.0)); 
                 if(s > 0.8) col += vec3(0.4);
            }
            
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

    // --- 5. PIXEL SORTER (High-End & Restored) ---
    pixel_sorter: `
        float pattern_s(vec2 p) { return fbm(p * u_scale + u_offset + vec2(0.0, u_time*0.1)); }
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float brush = texture2D(u_brushTexture, vUv).r;
            float sortTrigger = noise(vec2(st.x * 20.0, u_time * 0.2)); 
            float thresh = 0.8 - (u_complexity * 0.07);
            float drop = 0.0;
            if(sortTrigger > thresh || brush > 0.1) {
                float intensity = (sortTrigger - thresh) * 5.0 + brush * 3.0;
                drop = intensity * (u_detail * 1.5 + 0.1);
            }
            vec2 sortedUV = st; sortedUV.y += drop; 
            float val = pattern_s(sortedUV);
            vec3 col = mix(u_c3, u_c1, val);
            if(drop > 0.01) {
                col = mix(col, u_c2, 0.6);
                float columns = step(0.5, sin(gl_FragCoord.x * 0.5));
                col *= 0.8 + 0.2 * columns;
            }
            col += u_c2 * brush;
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 6. CHROMATIC GLITCH (High-End & Restored) ---
    chromatic_glitch: `
        float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float brush = texture2D(u_brushTexture, vUv).r;
            float t = u_time * u_speed * 30.0;
            float pulse = step(0.8, sin(t)); 
            vec2 grid = floor(st * (5.0 + u_scale));
            float blockRnd = rand(grid + floor(t));
            float glitchChance = (u_complexity * 0.1) + (pulse * 0.3) + (brush * 0.8);
            
            vec2 displace = vec2(0.0);
            float isGlitched = 0.0;
            if(blockRnd < glitchChance) {
                isGlitched = 1.0;
                displace = vec2((rand(grid + 1.0) - 0.5) * 0.2 * u_detail, (rand(grid + 2.0) - 0.5) * 0.02 * u_detail);
            }
            
            float splitAmt = 0.002 + isGlitched * 0.02 * u_detail;
            vec2 pR = st + displace + vec2(splitAmt, 0.0);
            vec2 pG = st + displace;
            vec2 pB = st + displace - vec2(splitAmt, 0.0);
            
            float nR = fbm(pR * 3.0 + u_offset + vec2(0.0, u_time*0.05));
            float nG = fbm(pG * 3.0 + u_offset + vec2(0.0, u_time*0.05));
            float nB = fbm(pB * 3.0 + u_offset + vec2(0.0, u_time*0.05));
            
            vec3 finalCol = u_c1 * smoothstep(0.4, 0.6, nR) * vec3(1.0, 0.0, 0.0)
                          + u_c1 * smoothstep(0.4, 0.6, nG) * vec3(0.0, 1.0, 0.0)
                          + u_c1 * smoothstep(0.4, 0.6, nB) * vec3(0.0, 0.0, 1.0);
                          
            float lum = length(finalCol);
            finalCol = mix(u_c3, finalCol, smoothstep(0.1, 0.4, lum));
            finalCol = mix(finalCol, u_c2, smoothstep(0.7, 1.0, nG));
            
            if(isGlitched > 0.5) {
                if(rand(grid + 3.0) > 0.5) finalCol = 1.0 - finalCol;
                else finalCol *= 1.5;
                if(mod(gl_FragCoord.y, 3.0) < 1.0) finalCol *= 0.0;
            }
            if(brush > 0.0) finalCol = mix(finalCol, vec3(rand(st * 100.0 + t)), brush * 0.5);
            gl_FragColor = vec4(finalCol, 1.0);
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

    // --- 9. CYBER GRID (High-End: Synthwave Pseudo-3D) ---
    cyber_grid: `
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            vec2 uv = st * 2.0 - 1.0;
            float brush = texture2D(u_brushTexture, vUv).r;

            float horizon = 0.2; 
            float fov = 1.0;
            float z = fov / (abs(uv.y - horizon) + 0.001); 
            float x = uv.x * z;
            
            float speed = u_time * u_speed * 20.0;
            vec2 gridUV = vec2(x, z + speed);
            gridUV *= u_scale * 0.5;
            gridUV += brush * sin(z) * 0.5;

            vec2 grid = fract(gridUV);
            float thickness = 0.05 + u_detail * 0.1;
            float lineX = smoothstep(thickness, 0.0, abs(grid.x - 0.5));
            float lineY = smoothstep(thickness, 0.0, abs(grid.y - 0.5));
            float gridPattern = max(lineX, lineY);
            
            float fog = smoothstep(20.0, 0.0, z); 
            if(uv.y > horizon + 0.01) fog = 0.0; 
            
            float sky = 0.0;
            if(uv.y > horizon) {
                float starNoise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
                if(starNoise > 0.98) sky = starNoise * (sin(u_time * 5.0 + starNoise*100.0)*0.5 + 0.5);
            }
            
            vec3 col = u_c3; 
            col = mix(col, u_c2, gridPattern * fog); 
            
            float horizonGlow = 1.0 - smoothstep(0.0, 0.5, abs(uv.y - horizon));
            col += u_c1 * horizonGlow * 0.5;
            col += sky * u_c1;
            
            float glitch = step(0.98, sin(z * 10.0 + u_time * 20.0));
            col += glitch * u_c1 * 0.3 * fog;

            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 10. PLASMA LEAK / NEBULA (New High-End) ---
    plasma_leak: `
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;
            float brush = texture2D(u_brushTexture, vUv).r;
            
            vec2 p = st * u_scale;
            float t = u_time * u_speed * 10.0;
            
            float v1 = sin(p.x + t);
            float v2 = sin(p.y + t);
            float v3 = sin(p.x + p.y + t);
            float v4 = sin(length(p) + t);
            
            float p_val = (v1 + v2 + v3 + v4) * u_complexity * 0.2;
            p_val += brush * 5.0;
            
            vec3 col = mix(u_c3, u_c2, sin(p_val));
            col = mix(col, u_c1, cos(p_val * 0.5));
            
            col *= 1.0 + brush * u_detail * 2.0;
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 11. AURORA BOREALIS (New High-End) ---
    aurora_borealis: `
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float brush = texture2D(u_brushTexture, vUv).r;
            
            float t = u_time * u_speed * 5.0;
            vec2 p = st * u_scale * 0.1;
            
            float n = fbm(p + t + fbm(p - t));
            float r = smoothstep(0.4, 0.5, n);
            float g = smoothstep(0.5, 0.6, n);
            float b = smoothstep(0.6, 0.7, n);
            
            vec3 aurora = (u_c1 * r + u_c2 * g + vec3(0.1, 0.2, 0.5) * b) * (1.0 - st.y);
            aurora *= u_detail * 2.0;
            aurora += brush * u_c1;
            
            vec3 finalCol = mix(u_c3, aurora, n);
            gl_FragColor = vec4(finalCol, 1.0);
        }
    `,

    // --- 12. FRACTAL MANDELBULB 2D (New High-End) ---
    fractal_mandelbulb: `
        void main() {
            vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
            float brush = texture2D(u_brushTexture, vUv).r;
            
            vec2 c = st * (3.0 / u_scale) + (u_mouse.xy * 2.0 - 1.0);
            vec2 z = vec2(0.0);
            float iter = 0.0;
            float max_iter = 20.0 + u_complexity * 10.0;
            
            for(float i=0.0; i<100.0; i++) {
                if(i >= max_iter) break;
                z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
                if(length(z) > 2.0) break;
                iter++;
            }
            
            float f = iter / max_iter;
            vec3 col = mix(u_c3, u_c2, f);
            col = mix(col, u_c1, pow(f, 3.0));
            
            if(brush > 0.1) col += u_c1 * brush * u_detail;
            
            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 13. STELLAR RIBBONS (New) ---
    stellar_ribbons: `
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float aspect = u_resolution.x / u_resolution.y;
            st.x *= aspect;
            float brush = texture2D(u_brushTexture, vUv).r;

            vec2 center = vec2(0.5 * aspect, 0.5);
            vec2 uv = st - center;
            float r = length(uv);
            float angle = atan(uv.y, uv.x);

            float t = u_time * (0.4 + u_speed * 20.0);
            float warp = fbm(st * u_scale * 0.35 + u_offset + vec2(t * 0.2, -t * 0.15));
            float waves = sin((angle + warp * 2.0 + r * (6.0 + u_complexity)) * 2.5);
            float ribbon = smoothstep(-0.2, 0.6, waves);

            float glow = pow(1.0 - r, 2.2) + brush * u_detail;
            float mask = ribbon * glow;

            float spark = noise(st * 40.0 + vec2(t)) * 0.2;
            vec3 col = mix(u_c3, u_c2, mask);
            col = mix(col, u_c1, pow(mask, 2.0) + spark);
            col += u_c1 * brush * 0.8;

            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- 14. PRISMATIC VORTEX (New) ---
    prismatic_vortex: `
        mat2 rotate2d(float a) {
            return mat2(cos(a), -sin(a), sin(a), cos(a));
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float aspect = u_resolution.x / u_resolution.y;
            st.x *= aspect;
            float brush = texture2D(u_brushTexture, vUv).r;

            vec2 center = vec2(0.5 * aspect, 0.5);
            vec2 uv = st - center;
            float t = u_time * (0.6 + u_speed * 18.0);
            uv = rotate2d(t * 0.2) * uv;

            float dist = length(uv);
            float swirl = fbm(uv * (u_scale * 1.2) + u_offset * 0.2);
            float rings = sin(dist * (10.0 + u_complexity * 2.0) - t * 3.0 + swirl * 4.0);
            float band = smoothstep(-0.3, 0.5, rings);

            float prism = sin((dist * 6.0 + t) + swirl * 3.0);
            vec3 prismCol = mix(u_c1, u_c2, 0.5 + 0.5 * prism);

            float core = smoothstep(0.5, 0.0, dist);
            vec3 col = mix(u_c3, prismCol, band);
            col = mix(col, u_c1, core * u_detail + brush * 0.7);

            gl_FragColor = vec4(col, 1.0);
        }
    `,

    // --- ORIGINALS (Standard V2 - Kept for Legacy) ---
    ancient_sand: `
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;
            float b = texture2D(u_brushTexture, vUv).r;
            vec2 q = vec2(fbm(st * u_scale * 0.1 + u_offset + b), fbm(st * u_scale * 0.1 - u_offset - b));
            vec2 r = vec2(fbm(st + q + u_time * 0.1), fbm(st - q - u_time * 0.1));
            float mask = smoothstep(u_detail, u_detail + 0.1, noise((st + r + b*0.2) * (u_scale * 50.0)));
            float fog = fbm(st * 2.0 + r);
            vec3 finalCol = mix(u_c3 * fog, u_c1, mask * smoothstep(0.2, 0.8, fog));
            finalCol += (hash(st + u_time) - 0.5) * 0.15; 
            gl_FragColor = vec4(finalCol * smoothstep(1.2, 0.3, length(vUv - 0.5) * 1.5), 1.0);
        }
    `,
    cosmic_dust: `
        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            st.x *= u_resolution.x / u_resolution.y;
            float b = texture2D(u_brushTexture, vUv).r;
            vec2 flow = vec2(fbm(st * u_scale * 0.2 + u_offset), fbm(st * u_scale * 0.2 + vec2(7.1, 2.3) + u_offset));
            vec2 p = st + flow * 0.5 + b * 0.3;
            float mask = smoothstep(u_detail, u_detail + 0.3, noise(p * 300.0));
            vec3 col = mix(u_c3, u_c1 * (0.5 + 0.5*sin(u_time * 3.0 + hash(p)*30.0)), mask);
            col += u_c2 * b * 0.5;
            gl_FragColor = vec4(col * smoothstep(1.0, 0.2, length(vUv - 0.5) * 1.2), 1.0);
        }
    `
};
