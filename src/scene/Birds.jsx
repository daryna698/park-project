import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { getDaylight } from '../lib/daylight'
import { createRandom } from '../lib/random'
import { plazaCenter } from '../lib/layout'

const COUNT = 8

function Bird({ wingRef }) {
    return (
        <group scale={1.6}>
            <mesh rotation-x={Math.PI / 2}>
                <coneGeometry args={[0.1, 0.5, 6]} />
                <meshStandardMaterial color="#2d2d33" />
            </mesh>
            {[-1, 1].map((side, i) => (
                <group key={side} ref={(el) => { wingRef.current[i] = el }}>
                    <mesh position-x={side * 0.4}>
                        <boxGeometry args={[0.8, 0.02, 0.3]} />
                        <meshStandardMaterial color="#2d2d33" />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

// Птахи кружляють над парком і махають крилами (вночі ховаються).
export default function Birds() {
    const groups = useRef([])
    const wings = useRef(Array.from({ length: COUNT }, () => ({ current: [] })))

    const flock = useMemo(() => {
        const rnd = createRandom(55)
        return Array.from({ length: COUNT }, () => ({
            cx: plazaCenter.x + (rnd() - 0.5) * 40,
            cz: plazaCenter.z + 20 + (rnd() - 0.5) * 50,
            radius: 14 + rnd() * 22,
            speed: (0.12 + rnd() * 0.12) * (rnd() < 0.5 ? 1 : -1),
            height: 12 + rnd() * 8,
            phase: rnd() * 10
        }))
    }, [])

    useFrame(({ clock }) => {
        const t = clock.elapsedTime
        const day = getDaylight(useStore.getState().time).day

        flock.forEach((b, i) => {
            const g = groups.current[i]
            if (!g) return
            g.visible = day > 0.25
            const a = b.phase + t * b.speed
            g.position.set(b.cx + Math.cos(a) * b.radius, b.height + Math.sin(t * 0.7 + b.phase) * 1.2, b.cz + Math.sin(a) * b.radius)
            const dir = Math.sign(b.speed)
            g.rotation.y = Math.atan2(-Math.sin(a) * dir, Math.cos(a) * dir)

            const flap = Math.sin(t * 9 + b.phase * 3) * 0.6
            const w = wings.current[i].current
            if (w[0]) w[0].rotation.z = -flap
            if (w[1]) w[1].rotation.z = flap
        })
    })

    return (
        <group>
            {flock.map((_, i) => (
                <group key={i} ref={(el) => { groups.current[i] = el }}>
                    <Bird wingRef={wings.current[i]} />
                </group>
            ))}
        </group>
    )
}
