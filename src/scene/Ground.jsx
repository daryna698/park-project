import { useMaterials } from './MaterialsContext'

export default function Ground() {
    const m = useMaterials()
    return (
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[800, 800]} />
            <primitive object={m.ground} attach="material" />
        </mesh>
    )
}
