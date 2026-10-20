import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useMaterials } from './MaterialsContext'
import { useStore } from '../store'
import { createRandom } from '../lib/random'
import { makeSpriteTexture } from '../lib/canvasTextures'

const DROPS = 220
const GRAVITY = 6
const SPRAY_Y = 1.75     // висота, з якої б'ють краплі
const WATER_Y = 0.42     // рівень води в чаші

// Фонтан: чаша, колона, вода, що тече, і струмені з крапель. Клік — вмикає/вимикає.
export default function Fountain() {
    const m = useMaterials()
    const points = useRef()

    const drops = useMemo(() => {
        const rnd = createRandom(21)
        const positions = new Float32Array(DROPS * 3)
        const params = Array.from({ length: DROPS }, () => {
            const vy = 3.2 + rnd() * 1.6
            return {
                angle: rnd() * Math.PI * 2,
                vy,
                vh: 0.6 + rnd() * 1.2,
                phase: rnd(),
                life: (vy + Math.sqrt(vy * vy + 2 * GRAVITY * (SPRAY_Y - WATER_Y))) / GRAVITY
            }
        })
        return { positions, params }
    }, [])
    const sprite = useMemo(() => makeSpriteTexture('circle'), [])

    useFrame(({ clock }, dt) => {
        const on = useStore.getState().fountainOn
        m.water.map.offset.y -= dt * 0.04
        if (!points.current) return
        points.current.visible = on
        if (!on) return

        const t = clock.elapsedTime
        const pos = drops.positions
        for (let i = 0; i < DROPS; i++) {
            const p = drops.params[i]
            const tt = ((t * 0.9 + p.phase * p.life) % p.life)
            const r = p.vh * tt
            pos[i * 3] = Math.cos(p.angle) * r
            pos[i * 3 + 1] = SPRAY_Y + p.vy * tt - 0.5 * GRAVITY * tt * tt
            pos[i * 3 + 2] = Math.sin(p.angle) * r
        }
        points.current.geometry.attributes.position.needsUpdate = true
    })

    const toggle = (e) => {
        e.stopPropagation()
        useStore.getState().toggle('fountainOn')
    }
    const over = (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }
    const out = () => { document.body.style.cursor = 'auto' }

    return (
        <group onClick={toggle} onPointerOver={over} onPointerOut={out}>
            {/* чаша */}
            <mesh position-y={0.3} castShadow receiveShadow>
                <cylinderGeometry args={[2.9, 2.9, 0.6, 48, 1, true]} />
                <meshStandardMaterial {...{ color: '#cfcfca', roughness: 0.8, side: 2 }} />
            </mesh>
            <mesh position-y={0.6} rotation-x={Math.PI / 2} castShadow>
                <torusGeometry args={[2.9, 0.16, 12, 48]} />
                <primitive object={m.concrete} attach="material" />
            </mesh>
            <mesh position-y={0.05} rotation-x={-Math.PI / 2}>
                <circleGeometry args={[2.9, 48]} />
                <primitive object={m.concrete} attach="material" />
            </mesh>

            {/* вода */}
            <mesh position-y={WATER_Y} rotation-x={-Math.PI / 2}>
                <circleGeometry args={[2.78, 48]} />
                <primitive object={m.water} attach="material" />
            </mesh>

            {/* колона і верхня чаша */}
            <mesh position-y={0.8} castShadow>
                <cylinderGeometry args={[0.28, 0.4, 1.4, 20]} />
                <primitive object={m.concrete} attach="material" />
            </mesh>
            <mesh position-y={1.55} castShadow>
                <cylinderGeometry args={[1.0, 0.4, 0.25, 32]} />
                <primitive object={m.concrete} attach="material" />
            </mesh>

            {/* краплі */}
            <points ref={points} frustumCulled={false}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[drops.positions, 3]} />
                </bufferGeometry>
                <pointsMaterial map={sprite} color="#d9f1ff" size={0.14} transparent opacity={0.85} depthWrite={false} />
            </points>
        </group>
    )
}
