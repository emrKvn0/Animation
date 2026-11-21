window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.retro_dither = `
    float rd_bayer4(vec2 pos) {
        int x = int(mod(pos.x, 4.0));
        int y = int(mod(pos.y, 4.0));
        int idx = x + y * 4;
        if (idx == 0)  return 0.0 / 16.0;
        if (idx == 1)  return 8.0 / 16.0;
        if (idx == 2)  return 2.0 / 16.0;
        if (idx == 3)  return 10.0 / 16.0;
        if (idx == 4)  return 12.0 / 16.0;
        if (idx == 5)  return 4.0 / 16.0;
        if (idx == 6)  return 14.0 / 16.0;
        if (idx == 7)  return 6.0 / 16.0;
        if (idx == 8)  return 3.0 / 16.0;
        if (idx == 9)  return 11.0 / 16.0;
        if (idx == 10) return 1.0 / 16.0;
        if (idx == 11) return 9.0 / 16.0;
        if (idx == 12) return 15.0 / 16.0;
        if (idx == 13) return 7.0 / 16.0;
        if (idx == 14) return 13.0 / 16.0;
        return 5.0 / 16.0;
    }

    void main() {
        float pxSize = max(1.0, floor(6.0 - u_scale * 0.15));
        vec2 pixelCoord = floor(gl_FragCoord.xy / pxSize);
        vec2 uv = (pixelCoord * pxSize - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.6 + u_speed * 150.0);

        vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        float d1 = length(uv - m);
        float d2 = length(uv);

        // 3D-like shaded interference sphere + ripples
        float sphere = smoothstep(0.55, 0.0, d2);
        float wave = 0.5 + 0.5 * sin(d1 * (12.0 + u_complexity * 2.0) - t * 3.5);
        float lum = clamp(sphere * 0.65 + wave * 0.42 + brush * 0.55, 0.0, 1.0);

        float threshold = rd_bayer4(pixelCoord);
        float levels = 2.0 + floor(u_detail * 3.0);
        float q = floor(lum * levels + threshold) / levels;

        vec3 col = mix(u_c3, mix(u_c2, u_c1, smoothstep(0.35, 0.9, q)), q);
        col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 1.4);
        gl_FragColor = vec4(col, 1.0);
    }
`;
