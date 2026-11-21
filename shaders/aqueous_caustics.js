window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.aqueous_caustics = `
    float ac_causticLayer(vec2 uv, float t) {
        vec2 p = mod(uv * 6.2831853, 6.2831853) - 250.0;
        vec2 i = p;
        float c = 1.0;
        float inten = 0.0055;
        for (int n = 0; n < 4; n++) {
            float nt = t * (1.0 - (3.2 / float(n + 1)));
            i = p + vec2(cos(nt - i.x) + sin(nt + i.y), sin(nt - i.y) + cos(nt + i.x));
            c += 1.0 / max(length(vec2(p.x / (sin(i.x + nt) / inten), p.y / (cos(i.y + nt) / inten))), 0.001);
        }
        c /= 4.0;
        c = 1.17 - pow(c, 1.4);
        return pow(abs(c), 7.0);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.4 + u_speed * 120.0);

        vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        float mDist = length(p - m);
        float ripple = sin(mDist * 28.0 - t * 5.0) * exp(-mDist * 3.5) * 0.025;

        vec2 st = p * (0.35 + u_scale * 0.03) + normalize(p - m + 0.0001) * ripple + brush * 0.06;

        // Chromatic RGB caustic dispersion
        float disp = 0.006 * (0.4 + u_detail);
        float cR = ac_causticLayer(st + vec2(disp, 0.0), t);
        float cG = ac_causticLayer(st, t + 0.04);
        float cB = ac_causticLayer(st - vec2(disp, 0.0), t + 0.08);

        float depthGrad = smoothstep(0.95, -0.5, p.y);
        vec3 water = mix(u_c3 * 0.45, u_c2 * 0.75, depthGrad);
        vec3 causticCol = vec3(cR, cG, cB) * mix(u_c2, u_c1, 0.75) * (0.85 + u_complexity * 0.14);

        vec3 col = water + causticCol + u_c1 * brush * 0.5;
        gl_FragColor = vec4(col, 1.0);
    }
`;
