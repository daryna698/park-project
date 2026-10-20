import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useMaterials } from './MaterialsContext'
import InstancedGroup from './InstancedGroup'
import { useStore } from '../store'
import { sim } from '../lib/sim'
import { getDaylight } from '../lib/daylight'
import { lamps } from '../lib/layout'

const POOL = 4          // скільки справжніх джерел світла одночасно
const POLE_H = 4

const baseItems = lamps.map((l) => ({ x: l.x, y: 0.15, z: l.z }))
const poleItems = lamps.map((l) => ({ x: l.x, y: POLE_H / 2, z: l.z }))
const globeItems = lamps.map((l) => ({ x: l.x, y: POLE_H + 0.2, z: l.z }))

/**
 * Ліхтарі. Світних кульок багато, але справжніх PointLight лише POOL штук:
 * вони щокадру "перестрибують" до найближчих до камери ліхтарів (оптимізація!).
 */
export default function Lamps() {
    const m = useMaterials()
    const pool = useRef([])
    const used = useRef(new Array(lamps.length).fill(false))

    useFrame(() => {
        const s = useStore.getState()
        const d = getDaylight(s.time)
        const lit = s.lampsOn ? 1 : 0

        m.lampGlow.emissiveIntensity = lit * (0.2 + d.night * 3)

        used.current.fill(false)
        for (let k = 0; k < POOL; k++) {
            let best = -1
            let bestDist = Infinity
            for (let i = 0; i < lamps.length; i++) {
                if (used.current[i]) continue
                const dist = Math.hypot(lamps[i].x - sim.focus.x, lamps[i].z - sim.focus.z)
                if (dist < bestDist) { bestDist = dist; best = i }
            }
            const light = pool.current[k]
            if (best >= 0 && light) {
                used.current[best] = true
                light.position.set(lamps[best].x, POLE_H + 0.1, lamps[best].z)
                light.intensity = lit * d.night * 70
            }
        }
    })

    return (
        <group>
            <InstancedGroup items={baseItems}>
                <cylinderGeometry args={[0.16, 0.2, 0.3, 12]} />
                <primitive object={m.concrete} attach="material" />
            </InstancedGroup>
            <InstancedGroup items={poleItems}>
                <cylinderGeometry args={[0.05, 0.07, POLE_H, 10]} />
                <primitive object={m.metal} attach="material" />
            </InstancedGroup>
            <InstancedGroup items={globeItems} castShadow={false}>
                <sphereGeometry args={[0.28, 16, 16]} />
                <primitive object={m.lampGlow} attach="material" />
            </InstancedGroup>

            {Array.from({ length: POOL }, (_, i) => (
                <pointLight key={i} ref={(el) => { pool.current[i] = el }} color="#ffd9a0" intensity={0} distance={18} decay={2} />
            ))}
        </group>
    )
}
