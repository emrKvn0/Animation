window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.kaleidoscope_prism = `
    void main() {
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.5 + u_speed * 150.0);

        float r = length(p);
        float a = atan(p.y, p.x);

        float segments = floor(4.0 + u_complexity * 1.4);
        float sector = 6.2831853 / segments;
        a = abs(mod(a + t * 0.15, sector) - sector * 0.5);

        vec2 kp = (vec2(cos(a), sin(a)) * r + (u_mouse.xy - 0.5) * 0.25) * (1.5 + u_scale * 0.25);
        vec3 col = u_c3 * 0.2;
        float waveFreq = 5.0 + u_detail * 6.0;

        for (int i = 0; i < 4; i++) {
            float fi = float(i);
            kp = abs(kp) / max(dot(kp, kp), 0.15) - vec2(0.75 + 0.15 * sin(t * 0.6 + fi), 0.55 + 0.15 * cos(t * 0.5 - fi));
            float wave = sin(length(kp) * waveFreq - t * 2.0 + fi);
            float glow = 0.025 / (abs(wave) + 0.025);
            col += mix(u_c1, u_c2, 0.5 + 0.5 * sin(fi * 1.8 + t + r * 3.0)) * glow * 0.28;
        }

        col += u_c1 * brush * (0.6 + 0.4 * sin(r * 18.0 - t * 6.0));
        gl_FragColor = vec4(col * smoothstep(1.3, 0.15, r), 1.0);
    }
`;
