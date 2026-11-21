window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.divine_mandala = `
    #define DM_PI 3.14159265359
    #define DM_TAU 6.28318530718

    float dm_hash(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
    }

    float dm_noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = dm_hash(i);
        float b = dm_hash(i + vec2(1.0, 0.0));
        float c = dm_hash(i + vec2(0.0, 1.0));
        float d = dm_hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float dm_ridgedFbm(vec2 p, float detailBoost) {
        float sum = 0.0;
        float amp = 0.55;
        mat2 m = mat2(1.62, 1.22, -1.22, 1.62);
        float decay = mix(0.46, 0.56, detailBoost);
        for (int i = 0; i < 5; i++) {
            float ridge = 1.0 - abs(dm_noise(p) * 2.0 - 1.0);
            sum += ridge * ridge * amp;
            p = m * p + vec2(1.7, 9.2);
            amp *= decay;
        }
        return sum;
    }

    float dm_softFbm(vec2 p) {
        float sum = 0.0;
        float amp = 0.5;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 3; i++) {
            sum += dm_noise(p) * amp;
            p = m * p;
            amp *= 0.5;
        }
        return sum;
    }

    vec3 dm_cosinePalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
        return a + b * cos(DM_TAU * (c * t + d));
    }

    vec3 dm_evalField(vec2 uv, float t, float sector, float folds, float scaleVal, float detailVal, float brush) {
        float r = length(uv);
        float theta = atan(uv.y, uv.x) + t * 0.14 + sin(t * 0.6 - r * 2.2) * 0.06;

        float a = abs(mod(theta, sector) - sector * 0.5);
        float flowR = log(max(r, 0.008)) * (1.1 + scaleVal * 0.06) - t * 0.42;

        vec2 kp = vec2(cos(a), sin(a)) * (0.45 + r * (1.8 + scaleVal * 0.14));
        vec2 flowCoord = vec2(flowR, a * folds * 0.45);
        vec2 loopDrift = vec2(cos(t * 0.5), sin(t * 0.5)) * 0.65;

        vec2 q = vec2(
            dm_softFbm(kp * 1.4 + flowCoord * 0.55 + loopDrift),
            dm_softFbm(kp * 1.4 + flowCoord * 0.55 - loopDrift + vec2(5.2, 1.3))
        );

        vec2 warped = kp * 2.1 + flowCoord * 0.7 + q * (1.45 + brush * 0.9);
        float ridged = dm_ridgedFbm(warped, detailVal);
        float soft = dm_softFbm(warped * 0.75 - q * 0.8);
        float micro = dm_ridgedFbm(warped * 3.1 + q * 1.4, detailVal);

        return vec3(ridged, soft, micro);
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        float brush = texture2D(u_brushTexture, vUv).r;
        float r = length(uv);

        float t = u_time * (0.45 + u_speed * 150.0);
        float folds = floor(3.0 + u_complexity * 0.65) * 2.0;
        float sector = DM_TAU / folds;

        vec2 mShift = (u_mouse.xy - 0.5) * 0.12;
        vec2 p = uv - mShift * smoothstep(0.0, 0.9, r);

        float ca = 0.016 * (0.4 + u_detail * 0.6);
        vec3 fG = dm_evalField(p, t, sector, folds, u_scale, u_detail, brush);
        vec3 fR = dm_evalField(p, t + ca, sector, folds, u_scale, u_detail, brush);
        vec3 fB = dm_evalField(p, t - ca, sector, folds, u_scale, u_detail, brush);

        // Fast screen-space relief using RGB phase gradient (avoids 2 extra full FBM evaluations)
        float hC = fG.x * 0.65 + fG.z * 0.35;
        vec3 normal = normalize(vec3((fR.x - fB.x) * 8.0, (fG.y - fG.x) * 4.5, 0.35));
        float light = 0.58 + 0.52 * max(dot(normal, normalize(vec3(0.4, 0.7, 1.0))), 0.0);
        float ao = smoothstep(0.18, 0.95, hC);

        float hueT = r * 0.55 - t * 0.06 + fG.y * 0.65;
        vec3 iqCol = dm_cosinePalette(
            hueT,
            vec3(0.52, 0.48, 0.46),
            vec3(0.46, 0.44, 0.42),
            vec3(1.0, 1.0, 1.0),
            vec3(0.05, 0.28, 0.58)
        );

        vec3 userGrad = mix(u_c3, mix(u_c2, u_c1, smoothstep(0.25, 0.85, fG.x)), smoothstep(0.15, 0.9, fG.y));
        vec3 baseCol = mix(iqCol, userGrad, 0.42);

        vec3 ridgeGlow = vec3(fR.z, fG.z, fB.z);
        vec3 col = baseCol * (0.45 + 0.75 * ao) * light;
        col += mix(iqCol, u_c1, 0.5) * pow(ridgeGlow, vec3(2.2)) * (0.45 + u_detail * 0.55);

        float bindu = exp(-r * 6.5) * (0.45 + 0.25 * sin(t * 2.0));
        col += mix(u_c1, vec3(1.0, 0.92, 0.75), 0.5) * bindu;

        if (brush > 0.01) {
            float wave = 0.5 + 0.5 * sin(r * 22.0 - t * 6.0);
            col += mix(u_c1, iqCol, 0.5) * brush * (0.6 + 0.4 * wave);
        }

        col *= smoothstep(1.55, 0.55, r);
        col = col / (1.0 + col * 0.35);
        col = pow(max(col, 0.0), vec3(0.92));

        gl_FragColor = vec4(col, 1.0);
    }
`;
