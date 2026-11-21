window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.fireworks_bloom = `
    vec2 fw_hash2(float n) {
        return fract(sin(vec2(n, n + 1.234)) * vec2(43758.5453, 22578.1459));
    }

    void main() {
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.7 + u_speed * 160.0);

        vec3 col = u_c3 * 0.25;
        float sR = hash(floor(p * 70.0));
        if (sR > 0.988) {
            col += u_c2 * (0.4 + 0.4 * sin(t * 3.0 + sR * 50.0)) * 0.5;
        }

        for (int b = 0; b < 5; b++) {
            float fb = float(b);
            float cycle = floor(t * 0.55 + fb * 0.37);
            float localT = fract(t * 0.55 + fb * 0.37);
            vec2 rnd = fw_hash2(cycle * 17.3 + fb * 31.7);
            vec2 center = (rnd - 0.5) * vec2(1.1, 0.65);

            float ringR = localT * (0.32 + u_scale * 0.015);
            float ring = smoothstep(0.015, 0.0, abs(length(p - center) - ringR)) * (1.0 - localT);
            vec3 burstCol = mix(u_c1, u_c2, fract(fb * 0.31 + cycle * 0.17));
            col += burstCol * ring * 0.45;

            float fade = (1.0 - localT) * smoothstep(0.0, 0.08, localT);
            for (int s = 0; s < 16; s++) {
                float fs = float(s);
                float ang = (fs / 16.0) * 6.2831853 + rnd.x * 6.28 + sin(fs * 3.7) * 0.2;
                float spd = (0.18 + 0.25 * hash(vec2(fs, cycle + fb))) * (0.7 + u_detail * 0.7);
                vec2 pos = center + vec2(cos(ang), sin(ang)) * spd * localT + vec2(0.0, -0.18 * localT * localT);
                float d = length(p - pos);
                float sparkle = 0.6 + 0.4 * sin(t * 20.0 + fs * 12.0);
                col += burstCol * (0.0022 / (d + 0.0025)) * fade * sparkle;
            }
        }

        vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        col += u_c1 * (0.008 / (length(p - m) + 0.02)) * 0.35 + mix(u_c1, u_c2, 0.5) * brush * (0.9 + 0.4 * sin(t * 15.0));

        gl_FragColor = vec4(col, 1.0);
    }
`;
