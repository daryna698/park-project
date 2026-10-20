import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMaterials } from './MaterialsContext'
import { useStore, useHud } from '../store'
import { sim } from '../lib/sim'
import { getDaylight } from '../lib/daylight'
import { obstacles, isPaved, WORLD } from '../lib/layout'

// Параметри руху
const MAX_SPEED = 16        // м/с (~58 км/год)
const MAX_REVERSE = 5
const ACCEL = 9
const BRAKE = 18
const DRAG = 2.2
const MAX_STEER = 0.6       // рад
const WHEELBASE = 2.6
const BODY_RADIUS = 1.0     // авто = два кола (спереду і ззаду) для простих зіткнень
const WHEEL_R = 0.36

const KEY_MAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    Space: 'brake'
}

function Wheel({ position, steerRef, spinRef, m }) {
    return (
        <group position={position} ref={steerRef}>
            <group ref={spinRef}>
                <mesh rotation-z={Math.PI / 2} castShadow>
                    <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.28, 20]} />
                    <meshStandardMaterial color="#141414" roughness={0.9} />
                </mesh>
                <mesh rotation-z={Math.PI / 2} position-x={Math.sign(position[0]) * 0.145}>
                    <cylinderGeometry args={[0.2, 0.2, 0.02, 12]} />
                    <primitive object={m.metal} attach="material" />
                </mesh>
            </group>
        </group>
    )
}

export default function Car() {
    const m = useMaterials()
    const group = useRef()
    const keys = useRef({})
    const wheelSpin = useRef([])
    const frontSteer = useRef([])
    const spinAngle = useRef(0)
    const lastHudSpeed = useRef(-1)

    const carColor = useStore((s) => s.carColor)
    const resetToken = useStore((s) => s.resetToken)

    const lightTarget = useMemo(() => new THREE.Object3D(), [])

    useEffect(() => { m.paint.color.set(carColor) }, [carColor, m])

    // повернення на старт
    useEffect(() => {
        if (group.current) {
            group.current.position.copy(sim.carPos)
            group.current.rotation.y = sim.carHeading
        }
    }, [resetToken])

    // клавіатура
    useEffect(() => {
        const onDown = (e) => {
            const key = KEY_MAP[e.code]
            if (key) {
                keys.current[key] = true
                e.preventDefault()
            }
            if (e.repeat) return
            if (e.code === 'KeyH') useStore.getState().cycleLights()
            if (e.code === 'KeyC') useStore.getState().cycleCamera()
            if (e.code === 'KeyR') useStore.getState().resetCar()
        }
        const onUp = (e) => {
            const key = KEY_MAP[e.code]
            if (key) {
                keys.current[key] = false
                e.preventDefault()
            }
        }
        const onBlur = () => { keys.current = {} }

        window.addEventListener('keydown', onDown)
        window.addEventListener('keyup', onUp)
        window.addEventListener('blur', onBlur)
        return () => {
            window.removeEventListener('keydown', onDown)
            window.removeEventListener('keyup', onUp)
            window.removeEventListener('blur', onBlur)
        }
    }, [])

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05)
        const k = keys.current
        const throttle = (k.up ? 1 : 0) - (k.down ? 1 : 0)
        let speed = sim.speed
        sim.braking = false

        // газ / гальмо / зворотний хід
        if (throttle > 0) {
            speed += (speed < 0 ? BRAKE : ACCEL) * dt
            if (speed < 0) sim.braking = true
        } else if (throttle < 0) {
            if (speed > 0) { speed -= BRAKE * dt; sim.braking = true } else speed -= ACCEL * 0.6 * dt
        } else {
            const drag = DRAG * dt
            speed = Math.abs(speed) <= drag ? 0 : speed - Math.sign(speed) * drag
        }
        if (k.brake) {
            const d = BRAKE * 1.4 * dt
            speed = Math.abs(speed) <= d ? 0 : speed - Math.sign(speed) * d
            sim.braking = true
        }

        // по траві їдемо повільніше
        const paved = isPaved(sim.carPos.x, sim.carPos.z)
        const limit = paved ? MAX_SPEED : 7
        if (speed > limit) speed += (limit - speed) * Math.min(1, 3 * dt)
        speed = THREE.MathUtils.clamp(speed, -MAX_REVERSE, MAX_SPEED)

        // кермо: на великій швидкості повертає менше
        const steerInput = (k.left ? 1 : 0) - (k.right ? 1 : 0)
        const steerTarget = steerInput * MAX_STEER * (1 - 0.55 * Math.min(1, Math.abs(speed) / MAX_SPEED))
        sim.steer += (steerTarget - sim.steer) * Math.min(1, 6 * dt)

        // кінематична модель (велосипедна)
        sim.carHeading += (speed / WHEELBASE) * Math.tan(sim.steer) * dt
        let x = sim.carPos.x + Math.sin(sim.carHeading) * speed * dt
        let z = sim.carPos.z + Math.cos(sim.carHeading) * speed * dt

        // зіткнення: виштовхуємо два кола авто з перешкод (дерева, лавки, ліхтарі, арка, фонтан)
        let hit = false
        for (const offset of [1.2, -1.2]) {
            let cx = x + Math.sin(sim.carHeading) * offset
            let cz = z + Math.cos(sim.carHeading) * offset
            for (const o of obstacles) {
                const dx = cx - o.x
                const dz = cz - o.z
                const minDist = o.r + BODY_RADIUS
                const d2 = dx * dx + dz * dz
                if (d2 < minDist * minDist && d2 > 1e-6) {
                    const d = Math.sqrt(d2)
                    const push = minDist - d
                    x += (dx / d) * push
                    z += (dz / d) * push
                    cx += (dx / d) * push
                    cz += (dz / d) * push
                    hit = true
                }
            }
        }
        if (hit) speed *= 0.6

        x = THREE.MathUtils.clamp(x, WORLD.minX, WORLD.maxX)
        z = THREE.MathUtils.clamp(z, WORLD.minZ, WORLD.maxZ)

        sim.speed = speed
        sim.carPos.set(x, 0, z)

        // модель
        const g = group.current
        g.position.set(x, 0, z)
        g.rotation.y = sim.carHeading

        spinAngle.current += (speed * dt) / WHEEL_R
        wheelSpin.current.forEach((w) => { if (w) w.rotation.x = spinAngle.current })
        frontSteer.current.forEach((w) => { if (w) w.rotation.y = sim.steer })

        // фари й стоп-сигнали
        const s = useStore.getState()
        const night = getDaylight(s.time).night
        const lightsOn = s.lightsMode === 'on' || (s.lightsMode === 'auto' && (night > 0.3 || s.fogAmount > 0.7))
        m.headlight.emissiveIntensity = lightsOn ? 4 : 0.2
        m.taillight.emissiveIntensity = sim.braking ? 5 : lightsOn ? 1.5 : 0.4
        group.current.userData.lightsOn = lightsOn
        group.current.children.forEach((c) => { if (c.isSpotLight) c.intensity = lightsOn ? 250 : 0 })

        // спідометр (оновлюємо лише коли змінилось ціле число)
        const kmh = Math.round(Math.abs(speed) * 3.6)
        if (kmh !== lastHudSpeed.current) {
            lastHudSpeed.current = kmh
            useHud.setState({ speed: kmh })
        }
    })

    return (
        <group ref={group} position={[sim.carPos.x, 0, sim.carPos.z]} rotation-y={sim.carHeading}>
            {/* кузов */}
            <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.8, 0.5, 4.1]} />
                <primitive object={m.paint} attach="material" />
            </mesh>
            {/* салон (скло) */}
            <mesh position={[0, 1.05, -0.2]} castShadow>
                <boxGeometry args={[1.6, 0.52, 2.1]} />
                <primitive object={m.glass} attach="material" />
            </mesh>
            {/* дах */}
            <mesh position={[0, 1.33, -0.2]} castShadow>
                <boxGeometry args={[1.62, 0.07, 2.0]} />
                <primitive object={m.paint} attach="material" />
            </mesh>
            {/* бампери */}
            <mesh position={[0, 0.4, 2.08]}><boxGeometry args={[1.8, 0.2, 0.12]} /><primitive object={m.metal} attach="material" /></mesh>
            <mesh position={[0, 0.4, -2.08]}><boxGeometry args={[1.8, 0.2, 0.12]} /><primitive object={m.metal} attach="material" /></mesh>
            {/* фари та стоп-сигнали */}
            {[-0.6, 0.6].map((x) => (
                <group key={x}>
                    <mesh position={[x, 0.62, 2.07]}><boxGeometry args={[0.35, 0.16, 0.05]} /><primitive object={m.headlight} attach="material" /></mesh>
                    <mesh position={[x, 0.62, -2.07]}><boxGeometry args={[0.35, 0.14, 0.05]} /><primitive object={m.taillight} attach="material" /></mesh>
                </group>
            ))}

            {/* колеса */}
            <Wheel m={m} position={[-0.95, WHEEL_R, 1.3]} steerRef={(el) => { frontSteer.current[0] = el }} spinRef={(el) => { wheelSpin.current[0] = el }} />
            <Wheel m={m} position={[0.95, WHEEL_R, 1.3]} steerRef={(el) => { frontSteer.current[1] = el }} spinRef={(el) => { wheelSpin.current[1] = el }} />
            <Wheel m={m} position={[-0.95, WHEEL_R, -1.3]} steerRef={() => {}} spinRef={(el) => { wheelSpin.current[2] = el }} />
            <Wheel m={m} position={[0.95, WHEEL_R, -1.3]} steerRef={() => {}} spinRef={(el) => { wheelSpin.current[3] = el }} />

            {/* фари-прожектори (ціль світла їде разом з авто) */}
            <primitive object={lightTarget} position={[0, 0.2, 14]} />
            <spotLight position={[-0.6, 0.7, 2.0]} target={lightTarget} angle={0.5} penumbra={0.6} distance={45} decay={2} intensity={0} color="#fff4d6" />
            <spotLight position={[0.6, 0.7, 2.0]} target={lightTarget} angle={0.5} penumbra={0.6} distance={45} decay={2} intensity={0} color="#fff4d6" />
        </group>
    )
}
