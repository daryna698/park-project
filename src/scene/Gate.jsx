import { useMemo } from 'react'
import { useMaterials } from './MaterialsContext'
import { gate } from '../lib/layout'
import { makeSignTexture } from '../lib/canvasTextures'

// Вхідна арка парку: дві цегляні колони, балка та вивіска (видно з обох боків)
export default function Gate() {
    const m = useMaterials()
    const sign = useMemo(() => makeSignTexture('ПАРК «ЗЕЛЕНА АЛЕЯ»', 'Ласкаво просимо'), [])
    const w = gate.halfWidth

    return (
        <group position={[gate.x, 0, gate.z]} rotation-y={gate.angle}>
            {[-1, 1].map((side) => (
                <group key={side} position-x={side * w}>
                    <mesh position-y={3.5} castShadow receiveShadow>
                        <boxGeometry args={[1.2, 7, 1.2]} />
                        <primitive object={m.brick} attach="material" />
                    </mesh>
                    <mesh position-y={7.1} castShadow>
                        <boxGeometry args={[1.5, 0.25, 1.5]} />
                        <primitive object={m.concrete} attach="material" />
                    </mesh>
                    <mesh position-y={7.5}>
                        <sphereGeometry args={[0.28, 16, 16]} />
                        <primitive object={m.lampGlow} attach="material" />
                    </mesh>
                </group>
            ))}

            {/* балка */}
            <mesh position-y={5.95} castShadow>
                <boxGeometry args={[w * 2, 1.7, 0.7]} />
                <primitive object={m.concrete} attach="material" />
            </mesh>

            {/* вивіска з двох боків */}
            <mesh position={[0, 5.95, 0.36]}>
                <planeGeometry args={[w * 1.5, 0.3 * w * 1.5 / 1.6]} />
                <meshStandardMaterial map={sign} roughness={0.7} />
            </mesh>
            <mesh position={[0, 5.95, -0.36]} rotation-y={Math.PI}>
                <planeGeometry args={[w * 1.5, 0.3 * w * 1.5 / 1.6]} />
                <meshStandardMaterial map={sign} roughness={0.7} />
            </mesh>
        </group>
    )
}
