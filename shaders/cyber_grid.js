window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.cyber_grid = `
    void main() {
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.9 + u_speed * 220.0);

        float horizon = 0.05 + (u_mouse.y - 0.5) * 0.18;
        vec3 col = mix(u_c3 * 0.25, u_c2 * 0.35, smoothstep(0.6, horizon, p.y));

        if (p.y < horizon) {
            float depth = max(horizon - p.y, 0.004);
            float z = 0.42 / depth;
            float x = (p.x - (u_mouse.x - 0.5) * 0.25) * z;

            float gScale = 1.1 + u_scale * 0.14;
            vec2 gridUV = vec2(x, z - t * 2.2) * gScale;
            vec2 cell = floor(gridUV);
            vec2 f = abs(fract(gridUV) - 0.5);

            float lw = mix(0.055, 0.02, u_detail);
            float line = max(smoothstep(lw, 0.0, f.x), smoothstep(lw, 0.0, f.y));

            // Glowing data pulses racing along grid lines
            float packet = step(0.86 - u_complexity * 0.03, hash(vec2(cell.x, floor(gridUV.y * 0.25))))
                         * smoothstep(0.18, 0.0, f.x);

            float fade = exp(-depth * 2.0);
            col = u_c3 * 0.25 + mix(u_c2, u_c1, 0.45) * line * (1.2 - fade * 0.35);
            col += u_c1 * packet * 1.4;
            col += u_c1 * exp(-depth * 24.0) * 0.9;
        } else {
            // Digital skyline bars above horizon
            float bx = floor((p.x + (u_mouse.x - 0.5) * 0.15) * (18.0 + u_scale));
            float bh = horizon + hash(vec2(bx, 7.3)) * 0.22;
            if (p.y < bh) {
                col = u_c3 * 0.4 + u_c2 * smoothstep(0.008, 0.0, abs(p.y - bh)) * 0.9;
            }
        }

        col += u_c1 * brush * 0.85;
        col *= 0.94 + 0.06 * sin(gl_FragCoord.y * 1.6);
        gl_FragColor = vec4(col, 1.0);
    }
`;
