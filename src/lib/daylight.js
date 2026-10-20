import * as THREE from 'three'

const smooth = (a, b, x) => {
    const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)
}

/**
 * Рахує, яке зараз освітлення за часом доби (0–24 години).
 *  - sunDir : напрямок на сонце (одиничний вектор)
 *  - day    : 0..1  наскільки світло (день)
 *  - night  : 0..1  наскільки темно (ніч)
 *  - dusk   : 0..1  "золота година" (схід/захід)
 */
export function getDaylight(time) {
    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2   // 6:00 схід, 12:00 зеніт, 18:00 захід
    const sunDir = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0.35).normalize()
    const e = sunDir.y

    return {
        sunDir,
        elevation: e,
        day: smooth(-0.05, 0.25, e),
        night: 1 - smooth(-0.2, 0.05, e),
        dusk: THREE.MathUtils.clamp(1 - Math.abs(e) / 0.3, 0, 1)
    }
}

export function formatTime(time) {
    const h = Math.floor(time) % 24
    const m = Math.floor((time % 1) * 60)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
