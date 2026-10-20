import { useMemo } from 'react'
import * as THREE from 'three'
import { useMaterials } from './MaterialsContext'
import { scaleUV } from '../lib/geometry'
import { plazaCenter, PLAZA_INNER, PLAZA_OUTER, PLAZA_PAVEMENT } from '../lib/layout'
import Fountain from './Fountain'

// Кругова площа: асфальтове кільце, тротуар, острівець з газоном і фонтаном
export default function Plaza() {
    const m = useMaterials()

    const geometries = useMemo(() => ({
        ring: new THREE.RingGeometry(PLAZA_INNER, PLAZA_OUTER, 72, 1),
        pavement: scaleUV(new THREE.RingGeometry(PLAZA_OUTER, PLAZA_PAVEMENT, 72, 1), 8)
    }), [])

    return (
        <group position={[plazaCenter.x, 0, plazaCenter.z]}>
            <mesh geometry={geometries.ring} rotation-x={-Math.PI / 2} position-y={0.03} receiveShadow>
                <primitive object={m.asphaltPlaza} attach="material" />
            </mesh>

            <mesh geometry={geometries.pavement} rotation-x={-Math.PI / 2} position-y={0.035} receiveShadow>
                <primitive object={m.concrete} attach="material" />
            </mesh>

            {/* бордюр острівця */}
            <mesh position-y={0.125} castShadow receiveShadow>
                <cylinderGeometry args={[PLAZA_INNER, PLAZA_INNER, 0.25, 64]} />
                <primitive object={m.concrete} attach="material" />
            </mesh>

            {/* газон */}
            <mesh rotation-x={-Math.PI / 2} position-y={0.26} receiveShadow>
                <circleGeometry args={[PLAZA_INNER - 0.15, 64]} />
                <primitive object={m.grassSmall} attach="material" />
            </mesh>

            <group position-y={0.26}>
                <Fountain />
            </group>
        </group>
    )
}
