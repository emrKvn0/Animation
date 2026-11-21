window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.electric_storm = `
    float es_fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.05;
            a *= 0.5;
        }
        return v;
    }

    float es_bolt(vec2 p, vec2 a, vec2 b, float t, float seed, float jagged) {
        vec2 pa = p - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
        vec2 perp = normalize(vec2(-ba.y, ba.x) + 0.0001);
        float offset = (es_fbm(vec2(h * jagged + seed, t * 4.5)) - 0.5) * 0.24 * sin(h * 3.14159);
        return length(pa - ba * h + perp * offset);
    }

    void main() {
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.7 + u_speed * 200.0);

        vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        float clouds = es_fbm(p * (1.8 + u_scale * 0.1) + vec2(t * 0.15, -t * 0.1));
        vec3 col = mix(u_c3 * 0.3, u_c2 * 0.35, clouds);

        float jagged = 4.0 + u_complexity * 0.9;
        float coreW = mix(0.012, 0.004, u_detail);
        int boltCount = int(clamp(2.0 + u_complexity * 0.4, 2.0, 5.0));

        for (int i = 0; i < 5; i++) {
            if (i >= boltCount) break;
            float fi = float(i);
            vec2 a = vec2(sin(t * 0.8 + fi * 2.1) * 0.55, 0.48);
            vec2 b = (i == 0) ? m : vec2(cos(t * 0.7 + fi * 1.7) * 0.55, -0.48);
            float d = es_bolt(p, a, b, t, fi * 13.7, jagged);
            float flash = 0.55 + 0.45 * sin(t * 9.0 + fi * 4.0);
            float arc = (coreW / (d + coreW * 0.6)) * flash;
            col += mix(u_c2, vec3(1.0), 0.45) * arc * 0.55;
            col += u_c1 * exp(-d * 18.0) * 0.45 * flash;
        }

        col += u_c1 * (exp(-length(p - m) * 7.0) * 0.5 + brush * 0.9);
        gl_FragColor = vec4(col, 1.0);
    }
`;
