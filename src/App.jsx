import { Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import World from './scene/World'
import Panel from './ui/Panel'
import { Speedometer, Help, BenchCard } from './ui/Hud'
import { useStore } from './store'
import { startView } from './lib/layout'

// Автоматична зміна часу доби (оновлюємо стан ~10 разів на секунду, не кожен кадр)
function DayCycle() {
    useFrame((_, delta) => {
        const s = useStore.getState()
        if (!s.autoTime) return
        const next = (s.time + Math.min(delta, 0.1) * 0.6) % 24   // 0.6 години за секунду
        if (Math.abs(next - s.time) > 0.02 || next < s.time) useStore.setState({ time: next })
    })
    return null
}

export default function App() {
    // Esc — закрити картку лавки
    useEffect(() => {
        const onKey = (e) => { if (e.code === 'Escape') useStore.getState().selectBench(null) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    return (
        <>
            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: startView.position, fov: 55, near: 0.3, far: 1600 }}
                onPointerMissed={() => useStore.getState().selectBench(null)}
            >
                <Suspense fallback={null}>
                    <World />
                    <DayCycle />
                </Suspense>
            </Canvas>

            <Loader />
            <Help />
            <Panel />
            <Speedometer />
            <BenchCard />
        </>
    )
}
