window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.metaballs_goo = `
    float mg_smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
    }

    float mg_field(vec2 p, float t, vec2 m, float brush, float k, float scaleF, float count) {
        float d = 10.0;
        for (int i = 0; i < 9; i++) {
            if (float(i) >= count) break;
            float fi = float(i);
            vec2 c = vec2(
                sin(t * (0.55 + fi * 0.09) + fi * 2.1) * (0.42 + 0.1 * cos(t * 0.4 + fi)),
                cos(t * (0.45 + fi * 0.11) + fi * 1.4) * (0.34 + 0.08 * sin(t * 0.5 + fi))
            );
            float r = (0.085 + 0.035 * sin(fi * 2.7 + t)) * scaleF;
            d = mg_smin(d, length(p - c) - r, k);
        }
        d = mg_smin(d, length(p - m) - (0.09 + brush * 0.12), k);
        return d - brush * 0.12;
    }

    void main() {
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.5 + u_speed * 150.0);
        vec2 m = (u_mouse.xy - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

        float k = 0.12 + u_detail * 0.18;
        float scaleF = 0.75 + u_scale * 0.035;
        float count = clamp(4.0 + u_complexity * 0.5, 4.0, 9.0);

        float d = mg_field(p, t, m, brush, k, scaleF, count);
        float eps = 0.005;
        float dx = mg_field(p + vec2(eps, 0.0), t, m, brush, k, scaleF, count) - d;
        float dy = mg_field(p + vec2(0.0, eps), t, m, brush, k, scaleF, count) - d;
        vec3 n = normalize(vec3(-dx, -dy, eps * 2.4));

        vec3 lightDir = normalize(vec3(m.x + 0.4, m.y + 0.6, 0.9));
        float diff = max(dot(n, lightDir), 0.0);
        float spec = pow(max(dot(reflect(-lightDir, n), vec3(0.0, 0.0, 1.0)), 0.0), 28.0);
        float fresnel = pow(1.0 - max(n.z, 0.0), 3.0);

        // Chrome liquid mercury reflection
        vec3 env = mix(u_c3, mix(u_c2, u_c1, n.y * 0.5 + 0.5), 0.5 + 0.5 * sin(n.x * 4.0 + t));
        vec3 metal = env * (0.35 + 0.75 * diff) + u_c1 * fresnel * 1.15 + vec3(1.0) * spec * 0.85;

        vec3 bg = u_c3 * 0.35 + u_c2 * exp(-max(d, 0.0) * 10.0) * 0.38;
        float mask = smoothstep(0.008, -0.008, d);
        vec3 col = mix(bg, metal, mask);

        gl_FragColor = vec4(col, 1.0);
    }
`;
