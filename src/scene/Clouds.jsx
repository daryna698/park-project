import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { getDaylight } from '../lib/daylight'
import { createRandom } from '../lib/random'

const COUNT = 14
const RANGE = 260
const DAY = new THREE.Color('#ffffff')
const NIGHT = new THREE.Color('#1b2438')

// Хмари з білих куль: пливуть за вітром, вночі темніють.
export default function Clouds() {
    const groups = useRef([])
    const material = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, fog: false, depthWrite: false }), [])

    const clouds = useMemo(() => {
        const rnd = createRandom(99)
        return Array.from({ length: COUNT }, () => ({
            x: (rnd() - 0.5) * RANGE * 2,
            y: 55 + rnd() * 40,
            z: (rnd() - 0.5) * RANGE * 2,
            scale: 0.8 + rnd() * 1.2,
            speed: 0.6 + rnd() * 0.8,
            puffs: Array.from({ length: 5 }, (_, k) => ({
                x: (k - 2) * (7 + rnd() * 3), y: (rnd() - 0.5) * 3, z: (rnd() - 0.5) * 8, r: 7 + rnd() * 6
            }))
        }))
    }, [])

    useFrame((_, delta) => {
        const s = useStore.getState()
        const night = getDaylight(s.time).night
        material.color.lerpColors(DAY, NIGHT, night)
        material.opacity = s.season === 'winter' ? 0.95 : 0.85

        clouds.forEach((c, i) => {
            c.x += (1.5 + s.wind * 3) * c.speed * Math.min(delta, 0.05)
            if (c.x > RANGE) c.x = -RANGE
            const g = groups.current[i]
            if (g) g.position.set(c.x, c.y, c.z)
        })
    })

    return (
        <group>
            {clouds.map((c, i) => (
                <group key={i} ref={(el) => { groups.current[i] = el }} position={[c.x, c.y, c.z]} scale={c.scale}>
                    {c.puffs.map((p, k) => (
                        <mesh key={k} position={[p.x, p.y, p.z]} scale={[1, 0.55, 1]}>
                            <sphereGeometry args={[p.r, 12, 10]} />
                            <primitive object={material} attach="material" />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    )
}
