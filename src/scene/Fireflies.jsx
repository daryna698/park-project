import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { getDaylight } from '../lib/daylight'
import { createRandom } from '../lib/random'
import { makeSpriteTexture } from '../lib/canvasTextures'
import { frameAt, plazaCenter } from '../lib/layout'

const COUNT = 60

// Світлячки: з'являються вночі (крім зими) і плавають біля землі.
export default function Fireflies() {
    const geometry = useRef()
    const material = useRef()

    const data = useMemo(() => {
        const rnd = createRandom(77)
        const base = []
        for (let i = 0; i < COUNT; i++) {
            if (i < 40) {
                const f = frameAt(rnd() * 0.95, (rnd() < 0.5 ? -1 : 1) * (6 + rnd() * 7))
                base.push({ x: f.x, y: 0.6 + rnd() * 1.6, z: f.z, phase: rnd() * 10 })
            } else {
                const a = rnd() * Math.PI * 2
                const r = 3 + rnd() * 9
                base.push({ x: plazaCenter.x + Math.cos(a) * r, y: 0.6 + rnd() * 1.6, z: plazaCenter.z + Math.sin(a) * r, phase: rnd() * 10 })
            }
        }
        return { base, positions: new Float32Array(COUNT * 3) }
    }, [])
    const sprite = useMemo(() => makeSpriteTexture('circle'), [])

    useFrame(({ clock }) => {
        const s = useStore.getState()
        const night = getDaylight(s.time).night
        material.current.opacity = s.season === 'winter' ? 0 : night * 0.95

        const t = clock.elapsedTime
        data.base.forEach((b, i) => {
            data.positions[i * 3] = b.x + Math.sin(t * 0.5 + b.phase) * 0.9
            data.positions[i * 3 + 1] = b.y + Math.sin(t * 0.8 + b.phase * 2) * 0.4
            data.positions[i * 3 + 2] = b.z + Math.cos(t * 0.45 + b.phase) * 0.9
        })
        geometry.current.attributes.position.needsUpdate = true
    })

    return (
        <points frustumCulled={false}>
            <bufferGeometry ref={geometry}>
                <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
            </bufferGeometry>
            <pointsMaterial ref={material} map={sprite} color="#d8ff7a" size={0.3} transparent opacity={0}
                depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}
