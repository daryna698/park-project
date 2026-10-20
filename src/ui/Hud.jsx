import { useHud, useStore } from '../store'

export function Speedometer() {
    const speed = useHud((s) => s.speed)
    return (
        <div className="speedo">
            <strong>{speed}</strong>
            <span>км/год</span>
        </div>
    )
}

export function Help() {
    return (
        <div className="help">
            <h1>Парк «Зелена алея»</h1>
            <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> або стрілки — їхати</p>
            <p><kbd>Пробіл</kbd> — гальмо · <kbd>H</kbd> — фари</p>
            <p><kbd>C</kbd> — камера · <kbd>R</kbd> — на старт</p>
            <p>Клік по лавці чи фонтану — взаємодія</p>
        </div>
    )
}

export function BenchCard() {
    const id = useStore((s) => s.selectedBench)
    const occupied = useStore((s) => (id === null ? false : !!s.occupied[id]))
    if (id === null) return null

    return (
        <div className="bench-card">
            <strong>Лавочка №{id + 1}</strong>
            <span>{occupied ? 'Тут хтось відпочиває' : 'Вільна'}</span>
            <div>
                <button onClick={() => useStore.getState().toggleSitter(id)}>
                    {occupied ? 'Звільнити лавку' : 'Посадити людину'}
                </button>
                <button className="ghost" onClick={() => useStore.getState().selectBench(null)}>Закрити</button>
            </div>
        </div>
    )
}
