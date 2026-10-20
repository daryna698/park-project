// Налаштування кожної пори року: кольори, кількість листя на деревах, частинки.
export const SEASONS = {
    spring: {
        label: 'Весна', emoji: '🌸',
        crown: '#a6e57f', ground: '#86c765', leafScale: 0.95, flowers: 1,
        particle: { type: 'petal', color: '#ffc6dc', count: 260, fall: 0.9, sway: 0.7, size: 0.22 }
    },
    summer: {
        label: 'Літо', emoji: '☀️',
        crown: '#4aa23c', ground: '#66a84a', leafScale: 1.08, flowers: 1,
        particle: null
    },
    autumn: {
        label: 'Осінь', emoji: '🍂',
        crown: '#e0802a', ground: '#b5964f', leafScale: 0.9, flowers: 0.35,
        particle: { type: 'leaf', color: '#f08a2e', count: 420, fall: 1.2, sway: 1.1, size: 0.32 }
    },
    winter: {
        label: 'Зима', emoji: '❄️',
        crown: '#e9f0f5', ground: '#f2f6fa', leafScale: 0.5, flowers: 0,
        particle: { type: 'snow', color: '#ffffff', count: 900, fall: 1.6, sway: 0.35, size: 0.13 }
    }
}

export const CAR_COLORS = ['#d63a3a', '#2f6fd6', '#f0b429', '#2f9e5b', '#f5f5f5', '#222222', '#8a4fd6']
