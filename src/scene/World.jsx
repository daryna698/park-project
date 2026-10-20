import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { createMaterials } from './materials'
import { MaterialsContext } from './MaterialsContext'
import SeasonController from './SeasonController'
import Lighting from './Lighting'
import CameraRig from './CameraRig'
import Ground from './Ground'
import Road from './Road'
import Plaza from './Plaza'
import Gate from './Gate'
import Trees from './Trees'
import Benches from './Benches'
import Lamps from './Lamps'
import Rocks from './Rocks'
import Flowers from './Flowers'
import Car from './Car'
import Particles from './Particles'
import Fireflies from './Fireflies'
import Birds from './Birds'
import Clouds from './Clouds'

const url = (name) => `${import.meta.env.BASE_URL}textures/${name}`

// Імпорт текстур (завантажуються один раз, поки показується екран завантаження)
const TEXTURE_FILES = {
    groundDiff: url('ground_diff.webp'), groundNor: url('ground_nor.webp'), groundArm: url('ground_arm.webp'),
    rockDiff: url('rock_diff.webp'),
    leafDiff: url('leaf_diff.webp'), leafNor: url('leaf_nor.webp'), leafArm: url('leaf_arm.webp'),
    brickDiff: url('brick_diff.webp'), brickNor: url('brick_nor.webp'), brickArm: url('brick_arm.webp'),
    plasterDiff: url('plaster_diff.webp'), plasterNor: url('plaster_nor.webp'), plasterArm: url('plaster_arm.webp')
}

export default function World() {
    const textures = useTexture(TEXTURE_FILES)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const materials = useMemo(() => createMaterials(textures), [])

    return (
        <MaterialsContext.Provider value={materials}>
            <fogExp2 attach="fog" args={['#c7def0', 0.01]} />

            <SeasonController />
            <Lighting />
            <CameraRig />

            <Ground />
            <Road />
            <Plaza />
            <Gate />
            <Trees />
            <Benches />
            <Lamps />
            <Rocks />
            <Flowers />
            <Car />

            <Particles />
            <Fireflies />
            <Birds />
            <Clouds />
        </MaterialsContext.Provider>
    )
}
