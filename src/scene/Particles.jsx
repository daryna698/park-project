import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { sim } from '../lib/sim'
import { SEASONS } from '../lib/seasons'
import { createRandom } from '../lib/random'
import { makeSpriteTexture } from '../lib/canvasTextures'

const MAX = 900
const R = 30        // половина розміру "коробки" з частинками навколо камери
const TOP = 22

const wrap = (value, center) => ((((value - center + R) % (2 * R)) + 2 * R) % (2 * R)) - R + center

// Падаючі частинки: пелюстки навесні, листя восени, сніг взимку.
export default function Particles() {
    const season = useStore((s) => s.season)
    const geometry = useRef()
    const material = useRef()

    const data = useMemo(() => {
        const rnd = createRandom(33)
        const positions = new Float32Array(MAX * 3)
        const phase = new Float32Array(MAX)
        const fall = new Float32Array(MAX)
        for (let i = 0; i < MAX; i++) {
            positions[i * 3] = (rnd() - 0.5) * 2 * R
            positions[i * 3 + 1] = rnd() * TOP
            positions[i * 3 + 2] = (rnd() - 0.5) * 2 * R
            phase[i] = rnd()
            fall[i] = 0.6 + rnd() * 0.8
        }
        return { positions, phase, fall }
    }, [])

    const sprites = useMemo(() => ({
        snow: makeSpriteTexture('circle'),
        petal: makeSpriteTexture('petal'),
        leaf: makeSpriteTexture('leaf')
    }), [])

    // при зміні пори року міняємо вигляд частинок
    useEffect(() => {
        const cfg = SEASONS[season].particle
        geometry.current.setDrawRange(0, cfg ? cfg.count : 0)
        if (cfg) {
            material.current.map = sprites[cfg.type]
            material.current.color.set(cfg.color)
            material.current.size = cfg.size
            material.current.needsUpdate = true
        }
    }, [season, sprites])

    useFrame(({ clock }, delta) => {
        const s = useStore.getState()
        const cfg = SEASONS[s.season].particle
        if (!cfg) return

        const dt = Math.min(delta, 0.05)
        const t = clock.elapsedTime
        const f = sim.focus
        const { positions, phase, fall } = data

        for (let i = 0; i < cfg.count; i++) {
            const ph = phase[i]
            let x = positions[i * 3]
            let y = positions[i * 3 + 1]
            let z = positions[i * 3 + 2]

            x += (Math.sin(t * 0.9 + ph * 40) * cfg.sway + s.wind * 1.2) * dt
            z += Math.cos(t * 0.7 + ph * 30) * cfg.sway * dt
            y -= cfg.fall * fall[i] * dt
            if (y < 0) y += TOP

            positions[i * 3] = wrap(x, f.x)
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = wrap(z, f.z)
        }
        geometry.current.attributes.position.needsUpdate = true
    })

    return (
        <points frustumCulled={false}>
            <bufferGeometry ref={geometry}>
                <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
            </bufferGeometry>
            <pointsMaterial ref={material} size={0.2} transparent depthWrite={false} alphaTest={0.02} sizeAttenuation />
        </points>
    )
}
