import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMaterials } from './MaterialsContext'
import { useStore } from '../store'
import { sim } from '../lib/sim'
import { trees } from '../lib/layout'

const TRUNK_H = 3.4
const CROWNS = [
    { radius: 2.0, x: 0, y: 4.4, z: 0 },
    { radius: 1.5, x: 0.9, y: 5.5, z: 0.5 }
]

// Усі дерева — це 3 InstancedMesh (стовбури + дві крони). Кожен кадр вони гойдаються від вітру,
// а розмір крон залежить від пори року (взимку листя майже немає).
export default function Trees() {
    const m = useMaterials()
    const trunkRef = useRef()
    const crownARef = useRef()
    const crownBRef = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), [])

    useFrame(({ clock }) => {
        const t = clock.elapsedTime
        const wind = useStore.getState().wind
        const leaf = sim.leafScale
        const crownRefs = [crownARef.current, crownBRef.current]

        trees.forEach((tree, i) => {
            const swayZ = Math.sin(t * 0.8 + tree.phase) * 0.014 * wind
            const swayX = Math.sin(t * 0.6 + tree.phase * 1.7) * 0.01 * wind
            const s = tree.s

            // стовбур
            dummy.position.set(tree.x, TRUNK_H * 0.5 * s, tree.z)
            dummy.rotation.set(swayX * 0.5, tree.rot, swayZ * 0.5)
            dummy.scale.setScalar(s)
            dummy.updateMatrix()
            trunkRef.current.setMatrixAt(i, dummy.matrix)

            // крони: зсуваються разом з верхівкою, що гойдається
            CROWNS.forEach((crown, c) => {
                const h = crown.y * s
                dummy.position.set(
                    tree.x - Math.sin(swayZ) * h + crown.x * s,
                    Math.cos(swayZ) * h,
                    tree.z + Math.sin(swayX) * h + crown.z * s
                )
                dummy.rotation.set(swayX, tree.rot, swayZ)
                dummy.scale.setScalar(crown.radius * s * leaf)
                dummy.updateMatrix()
                crownRefs[c].setMatrixAt(i, dummy.matrix)
            })
        })

        trunkRef.current.instanceMatrix.needsUpdate = true
        crownARef.current.instanceMatrix.needsUpdate = true
        crownBRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <group>
            <instancedMesh ref={trunkRef} args={[null, null, trees.length]} castShadow receiveShadow frustumCulled={false}>
                <cylinderGeometry args={[0.2, 0.3, TRUNK_H, 10]} />
                <primitive object={m.trunk} attach="material" />
            </instancedMesh>

            <instancedMesh ref={crownARef} args={[null, null, trees.length]} castShadow receiveShadow frustumCulled={false}>
                <icosahedronGeometry args={[1, 2]} />
                <primitive object={m.leaves} attach="material" />
            </instancedMesh>

            <instancedMesh ref={crownBRef} args={[null, null, trees.length]} castShadow receiveShadow frustumCulled={false}>
                <icosahedronGeometry args={[1, 2]} />
                <primitive object={m.leaves} attach="material" />
            </instancedMesh>
        </group>
    )
}
