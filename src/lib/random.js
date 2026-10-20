// Генератор псевдовипадкових чисел із фіксованим seed:
// сцена щоразу виглядає однаково, а не "стрибає" при кожному запуску.
export function createRandom(seed) {
    return function () {
        seed |= 0
        seed = (seed + 0x6D2B79F5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}
