import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { Sky } from 'three/addons/objects/Sky.js'
import * as THREE from 'three'
import { useStore } from '../store'
import { sim } from '../lib/sim'
import { getDaylight } from '../lib/daylight'

const C = {
    sunDay: new THREE.Color('#fff4e0'),
    sunDusk: new THREE.Color('#ff9a55'),
    hemiSkyDay: new THREE.Color('#bcd7f5'),
    hemiSkyNight: new THREE.Color('#1a2a55'),
    fogDay: new THREE.Color('#c7def0'),
    fogNight: new THREE.Color('#070b14'),
    fogDusk: new THREE.Color('#e7a074')
}

// Небо (Sky), сонце/місяць, зірки, туман — усе залежить від часу доби.
export default function Lighting() {
    const sun = useRef()
    const hemi = useRef()
    const moonLight = useRef()
    const stars = useRef()
    const moon = useRef()
    const tmpFog = useMemo(() => new THREE.Color(), [])

    const sky = useMemo(() => {
        const s = new Sky()
        s.scale.setScalar(1000)
        return s
    }, [])

    useFrame((state) => {
        const s = useStore.getState()
        const d = getDaylight(s.time)
        const focus = sim.focus

        // небо
        const u = sky.material.uniforms
        u.sunPosition.value.copy(d.sunDir)
        u.turbidity.value = 4 + d.dusk * 5 + s.fogAmount * 10
        u.rayleigh.value = 1.2 + d.dusk * 1.6
        u.mieCoefficient.value = 0.005 + s.fogAmount * 0.01
        u.mieDirectionalG.value = 0.8

        // сонце (з тінями) — рухається разом з точкою, на яку дивиться камера
        sun.current.position.copy(focus).addScaledVector(d.sunDir, 80)
        sun.current.target.position.copy(focus)
        sun.current.target.updateMatrixWorld()
        sun.current.intensity = d.day * 2.8
        sun.current.color.lerpColors(C.sunDay, C.sunDusk, d.dusk)

        // місяць
        moonLight.current.position.copy(focus).addScaledVector(d.sunDir, -80)
        moonLight.current.intensity = d.night * 0.55

        // розсіяне світло неба
        hemi.current.intensity = 0.2 + d.day * 0.7
        hemi.current.color.lerpColors(C.hemiSkyNight, C.hemiSkyDay, d.day)

        // туман: колір залежить від часу доби, щільність — від повзунка
        tmpFog.lerpColors(C.fogNight, C.fogDay, d.day).lerp(C.fogDusk, d.dusk * 0.55)
        state.scene.fog.color.copy(tmpFog)
        state.scene.fog.density = 0.0025 + s.fogAmount * 0.03

        state.gl.toneMappingExposure = 0.7 + d.night * 0.3

        // зірки й місяць слідують за камерою (щоб були "нескінченно далеко")
        stars.current.position.copy(state.camera.position)
        stars.current.visible = d.night > 0.55
        const moonDir = d.sunDir.clone().multiplyScalar(-1)
        moon.current.position.copy(state.camera.position).addScaledVector(moonDir, 700)
        moon.current.visible = moonDir.y > 0.05
    })

    return (
        <>
            <primitive object={sky} />

            <hemisphereLight ref={hemi} args={['#bcd7f5', '#5d7a48', 0.7]} />

            <directionalLight
                ref={sun}
                castShadow
                intensity={2.5}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-40}
                shadow-camera-right={40}
                shadow-camera-top={40}
                shadow-camera-bottom={-40}
                shadow-camera-near={1}
                shadow-camera-far={220}
                shadow-bias={-0.0004}
                shadow-normalBias={0.05}
            />
            <directionalLight ref={moonLight} color="#9db4ff" intensity={0} />

            <group ref={stars}>
                <Stars radius={300} depth={60} count={2500} factor={6} fade speed={1} />
            </group>

            <mesh ref={moon} scale={22}>
                <sphereGeometry args={[1, 24, 24]} />
                <meshBasicMaterial color="#eef2ff" fog={false} toneMapped={false} />
            </mesh>
        </>
    )
}
