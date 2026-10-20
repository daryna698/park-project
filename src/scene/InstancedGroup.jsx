import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Малює багато однакових об'єктів за ОДИН виклик відмальовування (InstancedMesh).
 * items: [{ x, y, z, rx, ry, rz, sx, sy, sz, color }]
 * Геометрію та матеріал передаємо як children.
 */
export default function InstancedGroup({ items, children, castShadow = true, receiveShadow = true }) {
    const ref = useRef()

    useLayoutEffect(() => {
        const mesh = ref.current
        const dummy = new THREE.Object3D()
        const color = new THREE.Color()

        items.forEach((item, i) => {
            dummy.position.set(item.x, item.y ?? 0, item.z)
            dummy.rotation.set(item.rx ?? 0, item.ry ?? 0, item.rz ?? 0)
            dummy.scale.set(item.sx ?? item.s ?? 1, item.sy ?? item.s ?? 1, item.sz ?? item.s ?? 1)
            dummy.updateMatrix()
            mesh.setMatrixAt(i, dummy.matrix)
            if (item.color) mesh.setColorAt(i, color.set(item.color))
        })

        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }, [items])

    return (
        <instancedMesh
            ref={ref}
            args={[null, null, items.length]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
            frustumCulled={false}
        >
            {children}
        </instancedMesh>
    )
}
