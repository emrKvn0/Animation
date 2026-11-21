window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.hyperspace_jump = `
    void main() {
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.9 + u_speed * 240.0);

        vec2 center = (u_mouse.xy - 0.5) * 0.35;
        vec2 q = p - center;
        float r = max(length(q), 0.002);
        float a = atan(q.y, q.x);

        vec3 col = u_c3 * 0.25;
        float layers = 3.0;
        float starSlices = floor(28.0 + u_scale * 2.5);

        for (float l = 0.0; l < 3.0; l++) {
            float sliceId = floor(a * starSlices / 6.2831853 + l * 7.13);
            float sliceFrac = fract(a * starSlices / 6.2831853 + l * 7.13) - 0.5;
            float rnd = hash(vec2(sliceId, l * 19.7));

            float z = fract(0.6 / (r + 0.04) - t * (1.1 + rnd * 0.8 + l * 0.35) + rnd * 10.0);
            float streakLen = 0.14 + u_detail * 0.35;
            float streak = smoothstep(streakLen, 0.0, abs(z - 0.5)) * smoothstep(0.28, 0.0, abs(sliceFrac));
            float fade = smoothstep(0.02, 0.38, r);

            vec3 starCol = mix(u_c2, u_c1, rnd);
            col += starCol * streak * fade * (0.75 + u_complexity * 0.08);
        }

        // Central warp singularity glow
        col += mix(u_c2, u_c1, 0.5) * exp(-r * 6.5) * (0.65 + brush);
        col += u_c1 * brush * 0.7;

        gl_FragColor = vec4(col, 1.0);
    }
`;
