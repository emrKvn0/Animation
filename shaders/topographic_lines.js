window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.topographic_lines = `
    float topo_fbm(vec2 p) {
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

    float topo_height(vec2 p, float t, vec2 mPos, float brush) {
        vec2 q = vec2(
            topo_fbm(p + vec2(t * 0.12, 0.0)),
            topo_fbm(p + vec2(5.2, 1.3 - t * 0.10))
        );
        float h = topo_fbm(p + 1.8 * q);
        float mDist = length(p - mPos);
        h += exp(-mDist * 2.5) * 0.22 + brush * 0.35;
        return h;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.35 + u_speed * 110.0);

        float sc = 1.6 + u_scale * 0.14;
        vec2 p = uv * sc + u_offset * 0.3;
        vec2 mPos = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0) * sc + u_offset * 0.3;

        float h = topo_height(p, t, mPos, brush);
        float eps = 0.012;
        float hx = topo_height(p + vec2(eps, 0.0), t, mPos, brush);
        float hy = topo_height(p + vec2(0.0, eps), t, mPos, brush);

        vec3 normal = normalize(vec3((h - hx) * 7.5, (h - hy) * 7.5, 0.4));
        float hillshade = 0.45 + 0.65 * max(dot(normal, normalize(vec3(0.5, 0.7, 0.8))), 0.0);

        float freq = 14.0 + u_complexity * 2.8;
        float phase = h * freq;
        float distToLine = abs(fract(phase) - 0.5);
        float lw = mix(0.09, 0.035, u_detail);
        float line = smoothstep(lw, lw * 0.2, distToLine);
        float majorLine = smoothstep(lw * 1.4, lw * 0.25, abs(fract(phase * 0.25) - 0.5));

        vec3 terrain = mix(u_c3 * 0.55, u_c2 * 0.7, smoothstep(0.2, 0.85, h)) * hillshade;
        vec3 col = mix(terrain, mix(u_c2, u_c1, 0.6), line * 0.75);
        col = mix(col, u_c1 * 1.25, majorLine * 0.9);
        col += u_c1 * brush * 0.45;

        gl_FragColor = vec4(col * smoothstep(1.4, 0.35, length(uv)), 1.0);
    }
`;
