import { useEffect, useMemo, useState } from 'react'
import { useMaterials } from './MaterialsContext'
import { useStore } from '../store'
import { benches } from '../lib/layout'

const SHIRTS = ['#d9534f', '#4a90d9', '#f0ad4e', '#5cb85c', '#9b59b6', '#e67e22']

// Людина, що сидить на лавці (з простих форм)
function Sitter({ shirt }) {
    return (
        <group>
            <mesh position={[0, 0.85, -0.1]} castShadow><capsuleGeometry args={[0.16, 0.34, 4, 10]} /><meshStandardMaterial color={shirt} roughness={0.8} /></mesh>
            <mesh position={[0, 1.27, -0.08]} castShadow><sphereGeometry args={[0.13, 16, 16]} /><meshStandardMaterial color="#e0b08c" roughness={0.7} /></mesh>
            <mesh position={[0, 0.54, 0.14]} castShadow><boxGeometry args={[0.3, 0.12, 0.5]} /><meshStandardMaterial color="#2c3e50" roughness={0.9} /></mesh>
            <mesh position={[0, 0.28, 0.38]} castShadow><boxGeometry args={[0.28, 0.5, 0.13]} /><meshStandardMaterial color="#2c3e50" roughness={0.9} /></mesh>
        </group>
    )
}

function Bench({ data }) {
    const m = useMaterials()
    const woodMaterial = useMemo(() => m.wood.clone(), [m])
    const occupied = useStore((s) => !!s.occupied[data.id])
    const selected = useStore((s) => s.selectedBench === data.id)
    const [hovered, setHovered] = useState(false)

    // підсвічуємо лавку при наведенні та виборі
    useEffect(() => {
        woodMaterial.emissive.set(selected ? '#3f8f2a' : '#2a5a20')
        woodMaterial.emissiveIntensity = selected ? 0.8 : hovered ? 0.5 : 0
    }, [selected, hovered, woodMaterial])

    const onClick = (e) => {
        e.stopPropagation()
        useStore.getState().selectBench(data.id, data.view)
    }
    const onOver = (e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }
    const onOut = () => { setHovered(false); document.body.style.cursor = 'auto' }

    return (
        <group position={[data.x, 0, data.z]} rotation-y={data.rot} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
            {/* сидіння */}
            {[-0.17, 0, 0.17].map((z) => (
                <mesh key={z} position={[0, 0.45, z]} castShadow receiveShadow>
                    <boxGeometry args={[1.8, 0.05, 0.14]} />
                    <primitive object={woodMaterial} attach="material" />
                </mesh>
            ))}
            {/* спинка */}
            {[0.72, 0.9].map((y) => (
                <mesh key={y} position={[0, y, -0.27]} rotation-x={-0.12} castShadow>
                    <boxGeometry args={[1.8, 0.13, 0.04]} />
                    <primitive object={woodMaterial} attach="material" />
                </mesh>
            ))}
            {/* металевий каркас */}
            {[-0.8, 0.8].map((x) => (
                <group key={x}>
                    <mesh position={[x, 0.22, 0]} castShadow><boxGeometry args={[0.05, 0.44, 0.5]} /><primitive object={m.metal} attach="material" /></mesh>
                    <mesh position={[x, 0.7, -0.27]} castShadow><boxGeometry args={[0.05, 0.6, 0.05]} /><primitive object={m.metal} attach="material" /></mesh>
                    <mesh position={[x, 0.62, 0]} castShadow><boxGeometry args={[0.05, 0.05, 0.5]} /><primitive object={m.metal} attach="material" /></mesh>
                </group>
            ))}

            {occupied && <Sitter shirt={SHIRTS[data.id % SHIRTS.length]} />}
        </group>
    )
}

export default function Benches() {
    return <group>{benches.map((b) => <Bench key={b.id} data={b} />)}</group>
}
