window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.neon_flow = `
    float nf_fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p = m * p;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.35 + u_speed * 110.0);

        vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        float mDist = length(uv - m);
        vec2 swirl = vec2(-uv.y + m.y, uv.x - m.x) * exp(-mDist * 3.2) * 0.45;

        vec2 p = (uv + swirl) * (1.2 + u_scale * 0.12);
        vec2 q = vec2(
            nf_fbm(p + vec2(t * 0.3, -t * 0.2)),
            nf_fbm(p + vec2(4.3 - t * 0.2, 1.7 + t * 0.25))
        );
        vec2 r = vec2(
            nf_fbm(p + 2.6 * q + vec2(1.7, 9.2) + brush * 1.2),
            nf_fbm(p + 2.6 * q + vec2(8.3, 2.8) - brush * 1.2)
        );
        float f = nf_fbm(p + 2.2 * r);

        // Glowing silk filament ridges
        float filament = exp(-abs(f - 0.52) * (14.0 + u_detail * 18.0));
        vec3 col = mix(u_c3 * 0.4, u_c2, smoothstep(0.15, 0.85, length(q) * 0.7));
        col = mix(col, u_c1, smoothstep(0.25, 0.9, f));
        col += mix(u_c1, vec3(1.0), 0.35) * filament * (0.65 + u_complexity * 0.08);
        col += u_c1 * brush * 0.6;

        gl_FragColor = vec4(col * smoothstep(1.5, 0.3, length(uv)), 1.0);
    }
`;
