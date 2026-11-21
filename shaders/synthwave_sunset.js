window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.synthwave_sunset = `
    void main() {
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.6 + u_speed * 180.0);

        float horizon = -0.06 + (u_mouse.y - 0.5) * 0.12;
        vec3 skyTop = u_c3;
        vec3 skyMid = mix(u_c3, u_c2, 0.55);
        vec3 skyBot = mix(u_c2, u_c1, 0.65);
        float skyT = clamp((p.y - horizon) / 0.6, 0.0, 1.0);
        vec3 col = mix(skyBot, mix(skyMid, skyTop, smoothstep(0.25, 1.0, skyT)), smoothstep(0.0, 0.55, skyT));

        if (p.y > horizon) {
            vec2 starGrid = floor((p + vec2(t * 0.01, 0.0)) * (45.0 + u_scale * 4.0));
            float starRnd = hash(starGrid);
            if (starRnd > 0.985) {
                float twinkle = 0.5 + 0.5 * sin(t * 4.0 + starRnd * 100.0);
                col += u_c1 * twinkle * smoothstep(horizon, horizon + 0.35, p.y) * 0.9;
            }

            vec2 sunPos = vec2((u_mouse.x - 0.5) * 0.15, horizon + 0.22);
            float sunR = 0.16 + u_detail * 0.1;
            float dSun = length(p - sunPos);
            if (dSun < sunR) {
                float sy = (p.y - (sunPos.y - sunR)) / (2.0 * sunR);
                float stripe = sin((p.y - t * 0.04) * (55.0 + u_complexity * 8.0));
                float cutMask = smoothstep(-0.1, 0.1, stripe + sy * 1.4 - 0.35);
                col = mix(col, mix(u_c2, u_c1, sy) * 1.35, cutMask);
            }
            col += mix(u_c2, u_c1, 0.5) * exp(-dSun * 6.5) * 0.65;

            float mX = p.x * (2.5 + u_scale * 0.15) + u_offset.x * 0.5;
            float mH = horizon + (fbm(vec2(mX, 1.7)) * 0.14 + 0.02) * (1.0 - smoothstep(0.0, 0.45, abs(p.x)));
            if (p.y < mH) {
                col = mix(u_c3 * 0.4, u_c2 * 0.35, smoothstep(horizon, mH, p.y));
                col += u_c1 * smoothstep(0.008, 0.0, abs(p.y - mH)) * 0.9;
            }
        } else {
            float depth = max(horizon - p.y, 0.003);
            float z = 0.35 / depth;
            float gridScale = 1.2 + u_scale * 0.15;
            float gx = abs(fract(p.x * z * gridScale) - 0.5);
            float gz = abs(fract(z * gridScale - t * 1.8) - 0.5);
            float lineW = 0.02 + (1.0 - u_detail) * 0.04;
            float grid = max(smoothstep(lineW, 0.0, gx), smoothstep(lineW, 0.0, gz));
            float fade = exp(-depth * 2.2);
            col = u_c3 * 0.35 + mix(u_c2, u_c1, clamp(1.0 - depth * 3.0, 0.0, 1.0)) * grid * (1.4 - fade * 0.4);
            col += u_c1 * exp(-depth * 28.0) * 0.9;
        }

        col += u_c1 * brush * (0.8 + 0.4 * sin(t * 8.0));
        col *= 0.92 + 0.08 * sin(gl_FragCoord.y * 1.5);
        gl_FragColor = vec4(col, 1.0);
    }
`;
