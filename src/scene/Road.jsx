import { useMemo } from 'react'
import { useMaterials } from './MaterialsContext'
import { buildStrip } from '../lib/geometry'
import { ROAD_WIDTH, PAVEMENT_WIDTH } from '../lib/layout'

export default function Road() {
    const m = useMaterials()
    const half = ROAD_WIDTH / 2

    const geometries = useMemo(() => ({
        road: buildStrip(-half, half, 0.02, 8),
        left: buildStrip(-half - PAVEMENT_WIDTH, -half, 0.035, PAVEMENT_WIDTH),
        right: buildStrip(half, half + PAVEMENT_WIDTH, 0.035, PAVEMENT_WIDTH)
    }), [half])

    return (
        <group>
            <mesh geometry={geometries.road} receiveShadow>
                <primitive object={m.asphaltRoad} attach="material" />
            </mesh>
            <mesh geometry={geometries.left} receiveShadow>
                <primitive object={m.concrete} attach="material" />
            </mesh>
            <mesh geometry={geometries.right} receiveShadow>
                <primitive object={m.concrete} attach="material" />
            </mesh>
        </group>
    )
}
