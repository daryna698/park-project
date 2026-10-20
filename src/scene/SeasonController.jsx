import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMaterials } from './MaterialsContext'
import { useStore } from '../store'
import { sim } from '../lib/sim'
import { SEASONS } from '../lib/seasons'

// Плавно перефарбовує землю та листя, коли змінюється пора року.
export default function SeasonController() {
    const m = useMaterials()
    const target = useMemo(() => new THREE.Color(), [])

    useFrame((_, delta) => {
        const cfg = SEASONS[useStore.getState().season]
        const k = 1 - Math.exp(-2.5 * Math.min(delta, 0.1))

        m.ground.color.lerp(target.set(cfg.ground), k)
        m.grassSmall.color.copy(m.ground.color)
        m.leaves.color.lerp(target.set(cfg.crown), k)
        sim.leafScale += (cfg.leafScale - sim.leafScale) * k
    })

    return null
}
