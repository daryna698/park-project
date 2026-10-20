import { useEffect, useRef } from 'react'
import InstancedGroup from './InstancedGroup'
import { useStore } from '../store'
import { SEASONS } from '../lib/seasons'
import { flowers } from '../lib/layout'

const FLOWER_ITEMS = flowers.map((f) => ({ ...f, s: 0.13 }))

// Квіти: навесні й улітку — всі, восени — частина, взимку — жодної.
export default function Flowers() {
    const group = useRef()
    const season = useStore((s) => s.season)

    useEffect(() => {
        const mesh = group.current?.children[0] ?? group.current
        if (mesh) mesh.count = Math.round(flowers.length * SEASONS[season].flowers)
    }, [season])

    return (
        <group ref={group}>
            <InstancedGroup items={FLOWER_ITEMS} castShadow={false}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial roughness={0.6} emissive="#331a22" emissiveIntensity={0.2} />
            </InstancedGroup>
        </group>
    )
}
