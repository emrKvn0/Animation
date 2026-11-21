window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.lava_lamp = `
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
        float scaleF = 0.7 + u_scale * 0.04;

        for (int i = 0; i < 8; i++) {
            float fi = float(i);
            float x = sin(t * (0.4 + fi * 0.11) + fi * 2.1) * (0.32 + 0.08 * sin(t + fi));
            float y = cos(t * (0.3 + fi * 0.09) + fi * 1.7) * 0.42;
            float r = (0.09 + 0.05 * sin(fi * 3.1 + t * 0.5)) * scaleF;
            field = ll_smin(field, length(p - vec2(x, y)) - r, k);
        }

        vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        field = ll_smin(field, length(p - m) - (0.08 + brush * 0.15), k) - brush * 0.14;

        float body = smoothstep(0.015, -0.015, field);
        float core = smoothstep(0.0, -0.14, field);
        float rim = smoothstep(0.03, 0.0, abs(field));

        vec3 bg = mix(u_c3, u_c2 * 0.45, smoothstep(-0.6, 0.6, p.y)) + u_c2 * exp(-max(field, 0.0) * 6.0) * 0.4;
        vec3 lava = mix(u_c2, u_c1, core * 0.85 + 0.15 * sin(p.y * (4.0 + u_complexity) - t));
        float spec = smoothstep(-0.04, -0.12, field + (p.x * 0.04 - p.y * 0.04));
        lava += vec3(1.0) * spec * 0.25;

        gl_FragColor = vec4(mix(bg, lava, body) + u_c1 * rim * 0.55, 1.0);
    }
`;
