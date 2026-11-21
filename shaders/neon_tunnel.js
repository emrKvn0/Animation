window.SHADER_STYLES = window.SHADER_STYLES || {};
window.SHADER_STYLES.neon_tunnel = `
    void main() {
        vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        float brush = texture2D(u_brushTexture, vUv).r;
        float t = u_time * (0.9 + u_speed * 220.0);

        vec2 q = p - (u_mouse.xy - 0.5) * 0.35;
        float r = max(length(q), 0.002);
        float angle = atan(q.y, q.x);

        float z = (0.45 + u_scale * 0.04) / r + t * 1.4;
        float twist = angle + sin(z * 0.4 + t * 0.5) * (0.3 + u_complexity * 0.12) + brush * 1.5;

        float spokes = floor(6.0 + u_complexity * 1.5);
        float ringLine = smoothstep(0.08 + (1.0 - u_detail) * 0.12, 0.0, abs(fract(z) - 0.5));
        float spokeLine = smoothstep(0.06 + (1.0 - u_detail) * 0.1, 0.0, abs(fract(twist * spokes / 6.2831853) - 0.5));

        vec3 ringCol = mix(u_c2, u_c1, 0.5 + 0.5 * sin(z * 3.0 - t * 4.0));
        vec3 spokeCol = mix(u_c1, u_c2, 0.5 + 0.5 * cos(angle * 2.0 + t));

        float fog = smoothstep(0.02, 0.55, r);
        vec3 col = u_c3 * 0.25 + (ringCol * ringLine * 1.4 + spokeCol * spokeLine * 0.9) * fog + u_c1 * exp(-r * 7.0) * (1.1 + brush);

        gl_FragColor = vec4(col, 1.0);
    }
`;
