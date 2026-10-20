import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { sim } from '../lib/sim'
import { startView } from '../lib/layout'

// Камера: вільна (OrbitControls), "за авто" та плавний переліт до лавки.
export default function CameraRig() {
    const controls = useRef()
    const mode = useStore((s) => s.cameraMode)
    const desired = useMemo(() => new THREE.Vector3(), [])
    const look = useMemo(() => new THREE.Vector3(), [])
    const flyPos = useMemo(() => new THREE.Vector3(), [])
    const flyTarget = useMemo(() => new THREE.Vector3(), [])

    useFrame(({ camera }, delta) => {
        const ctrl = controls.current
        if (!ctrl) return
        const dt = Math.min(delta, 0.05)
        const s = useStore.getState()

        if (s.cameraMode === 'follow') {
            const h = sim.carHeading
            desired.set(
                sim.carPos.x - Math.sin(h) * 9,
                4.2 + Math.abs(sim.speed) * 0.06,
                sim.carPos.z - Math.cos(h) * 9
            )
            camera.position.lerp(desired, 1 - Math.exp(-4 * dt))
            look.set(sim.carPos.x + Math.sin(h) * 4, 1.2, sim.carPos.z + Math.cos(h) * 4)
            ctrl.target.lerp(look, 1 - Math.exp(-8 * dt))
        } else if (s.flyTo) {
            const k = 1 - Math.exp(-3.5 * dt)
            flyPos.set(...s.flyTo.position)
            flyTarget.set(...s.flyTo.target)
            camera.position.lerp(flyPos, k)
            ctrl.target.lerp(flyTarget, k)
            if (camera.position.distanceTo(flyPos) < 0.1 && ctrl.target.distanceTo(flyTarget) < 0.1) {
                useStore.setState({ flyTo: null })
            }
        }

        sim.focus.copy(ctrl.target)
    })

    return (
        <OrbitControls
            ref={controls}
            makeDefault
            enabled={mode === 'orbit'}
            target={startView.target}
            enableDamping
            minDistance={2}
            maxDistance={70}
            maxPolarAngle={Math.PI / 2.05}
        />
    )
}
