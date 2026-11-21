window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.voronoi_cells = `
    vec2 vc_hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453);
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.6 + u_speed * 160.0);

        vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        float mPull = exp(-length(uv - m) * 3.5);
        vec2 p = uv * (2.8 + u_scale * 0.32) + (uv - m) * mPull * 0.45;

        vec2 n = floor(p);
        vec2 f = fract(p);

        float md1 = 8.0;
        float md2 = 8.0;
        vec2 bestCell = vec2(0.0);

        for (int j = -1; j <= 1; j++) {
            for (int i = -1; i <= 1; i++) {
                vec2 g = vec2(float(i), float(j));
                vec2 o = vc_hash2(n + g);
                o = 0.5 + 0.45 * sin(t + 6.2831 * o);
                vec2 r = g + o - f;
                float d = dot(r, r);
                if (d < md1) {
                    md2 = md1;
                    md1 = d;
                    bestCell = n + g;
                } else if (d < md2) {
                    md2 = d;
                }
            }
        }

        float d1 = sqrt(md1);
        float edge = sqrt(md2) - d1;
        float wallW = mix(0.08, 0.025, u_detail);
        float membrane = smoothstep(wallW, 0.0, edge) + exp(-edge * (18.0 + u_complexity * 2.0)) * 0.55;

        float nucleus = smoothstep(0.22, 0.04, d1) * (0.5 + 0.5 * sin(t * 2.0 + vc_hash2(bestCell).x * 12.0));
        vec3 col = mix(u_c3 * 0.4, u_c2 * 0.55, 1.0 - d1);
        col += u_c1 * membrane * 1.15;
        col += mix(u_c2, u_c1, 0.6) * nucleus * 0.65;
        col += u_c1 * (mPull * 0.35 + brush * 0.7);

        gl_FragColor = vec4(col, 1.0);
    }
`;
