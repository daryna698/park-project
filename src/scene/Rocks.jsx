import { useMaterials } from './MaterialsContext'
import InstancedGroup from './InstancedGroup'
import { rocks } from '../lib/layout'

export default function Rocks() {
    const m = useMaterials()
    return (
        <InstancedGroup items={rocks}>
            <dodecahedronGeometry args={[1, 0]} />
            <primitive object={m.rock} attach="material" />
        </InstancedGroup>
    )
}
