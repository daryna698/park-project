import { create } from 'zustand'
import { initialOccupied, startView } from './lib/layout'
import { resetCar as resetCarSim } from './lib/sim'

/** Стан, яким керує користувач (інтерфейс і сцена читають звідси). */
export const useStore = create((set, get) => ({
    season: 'summer',
    time: 15,
    autoTime: false,
    wind: 1,
    fogAmount: 0.25,
    carColor: '#d63a3a',
    cameraMode: 'orbit',        // 'orbit' | 'follow'
    lightsMode: 'auto',         // фари: 'auto' | 'on' | 'off'
    lampsOn: true,
    fountainOn: true,
    selectedBench: null,
    occupied: initialOccupied,
    flyTo: null,                // { position, target } — куди летить камера
    resetToken: 0,

    set: (patch) => set(patch),
    toggle: (key) => set((s) => ({ [key]: !s[key] })),

    cycleCamera: () => set((s) => ({ cameraMode: s.cameraMode === 'orbit' ? 'follow' : 'orbit', flyTo: null })),
    cycleLights: () => set((s) => ({ lightsMode: { auto: 'on', on: 'off', off: 'auto' }[s.lightsMode] })),

    selectBench: (id, view = null) => set({
        selectedBench: id,
        flyTo: view,
        cameraMode: view ? 'orbit' : get().cameraMode
    }),
    toggleSitter: (id) => set((s) => ({ occupied: { ...s.occupied, [id]: !s.occupied[id] } })),

    resetCar: () => {
        resetCarSim()
        set((s) => ({ resetToken: s.resetToken + 1, cameraMode: 'orbit', flyTo: { position: startView.position, target: startView.target } }))
    }
}))

// Окремий мінімальний стан для спідометра (оновлюється часто, не чіпає решту UI)
export const useHud = create(() => ({ speed: 0 }))
