import { useState } from 'react'
import { useStore } from '../store'
import { SEASONS, CAR_COLORS } from '../lib/seasons'
import { formatTime } from '../lib/daylight'

const LIGHTS_LABEL = { auto: 'Авто', on: 'Увімкнені', off: 'Вимкнені' }

// Скидає фокус з елемента після кліку, щоб стрілки/пробіл керували авто, а не повзунком
const blurOnRelease = (e) => e.currentTarget.blur()

function Slider({ label, value, min, max, step, onChange, format }) {
    return (
        <label className="row">
            <span>{label}</span>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))} onPointerUp={blurOnRelease} />
            <em>{format ? format(value) : value}</em>
        </label>
    )
}

export default function Panel() {
    const [open, setOpen] = useState(true)

    const season = useStore((s) => s.season)
    const time = useStore((s) => s.time)
    const autoTime = useStore((s) => s.autoTime)
    const wind = useStore((s) => s.wind)
    const fogAmount = useStore((s) => s.fogAmount)
    const carColor = useStore((s) => s.carColor)
    const cameraMode = useStore((s) => s.cameraMode)
    const lightsMode = useStore((s) => s.lightsMode)
    const lampsOn = useStore((s) => s.lampsOn)
    const fountainOn = useStore((s) => s.fountainOn)
    const set = useStore((s) => s.set)
    const toggle = useStore((s) => s.toggle)

    return (
        <aside className={`panel ${open ? '' : 'closed'}`}>
            <button className="panel-toggle" onClick={() => setOpen(!open)} onPointerUp={blurOnRelease}>
                {open ? '✕ Сховати' : '⚙ Налаштування'}
            </button>

            {open && (
                <div className="panel-body">
                    <h3>Пора року</h3>
                    <div className="seasons">
                        {Object.entries(SEASONS).map(([key, cfg]) => (
                            <button key={key} className={season === key ? 'active' : ''}
                                onClick={() => set({ season: key })} onPointerUp={blurOnRelease}>
                                {cfg.emoji}<span>{cfg.label}</span>
                            </button>
                        ))}
                    </div>

                    <h3>Час і погода</h3>
                    <Slider label="Час доби" value={time} min={0} max={24} step={0.05}
                        onChange={(v) => set({ time: v >= 24 ? 0 : v })} format={formatTime} />
                    <label className="check">
                        <input type="checkbox" checked={autoTime} onChange={() => toggle('autoTime')} onPointerUp={blurOnRelease} />
                        Автоматична зміна дня і ночі
                    </label>
                    <Slider label="Вітер" value={wind} min={0} max={4} step={0.05} onChange={(v) => set({ wind: v })} format={(v) => v.toFixed(1)} />
                    <Slider label="Туман" value={fogAmount} min={0} max={1} step={0.01} onChange={(v) => set({ fogAmount: v })} format={(v) => Math.round(v * 100) + '%'} />

                    <h3>Автомобіль</h3>
                    <div className="swatches">
                        {CAR_COLORS.map((c) => (
                            <button key={c} className={carColor === c ? 'active' : ''} style={{ background: c }}
                                onClick={() => set({ carColor: c })} onPointerUp={blurOnRelease} aria-label={`Колір ${c}`} />
                        ))}
                    </div>
                    <div className="buttons">
                        <button onClick={() => useStore.getState().cycleLights()} onPointerUp={blurOnRelease}>💡 Фари: {LIGHTS_LABEL[lightsMode]}</button>
                        <button onClick={() => useStore.getState().cycleCamera()} onPointerUp={blurOnRelease}>🎥 Камера: {cameraMode === 'orbit' ? 'вільна' : 'за авто'}</button>
                        <button onClick={() => useStore.getState().resetCar()} onPointerUp={blurOnRelease}>↩ На старт</button>
                    </div>

                    <h3>Парк</h3>
                    <label className="check">
                        <input type="checkbox" checked={lampsOn} onChange={() => toggle('lampsOn')} onPointerUp={blurOnRelease} />
                        Ліхтарі вночі
                    </label>
                    <label className="check">
                        <input type="checkbox" checked={fountainOn} onChange={() => toggle('fountainOn')} onPointerUp={blurOnRelease} />
                        Фонтан (також клік по ньому)
                    </label>
                </div>
            )}
        </aside>
    )
}
