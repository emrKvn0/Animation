window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.matrix_rain = `
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

        float trail = pow(1.0 - dropY, 2.2 + u_complexity * 0.5);
        float head = smoothstep(0.06, 0.0, dropY);
        float glyph = mr_glyph(cellUv, hash(cellId + floor(t * (2.0 + colRand * 4.0)) * 0.01));

        vec2 mPos = vec2(u_mouse.x * (u_resolution.x / u_resolution.y), u_mouse.y);
        float mGlow = exp(-length(uv - mPos) * 5.0) * 0.8;

        vec3 rainCol = mix(u_c2, u_c1, head + brush * 0.7);
        vec3 col = u_c3 * 0.25 + rainCol * glyph * (trail * 1.4 + head * 1.6 + brush + mGlow) + u_c1 * head * 0.35;

        gl_FragColor = vec4(col, 1.0);
    }
`;
