import * as THREE from 'three'
import { createRandom } from './random'

// Усі ці текстури малюються кодом на <canvas> — окремі файли не потрібні.

function makeCanvas(width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return [canvas, canvas.getContext('2d')]
}

function toTexture(canvas, { repeat = false, srgb = true } = {}) {
    const texture = new THREE.CanvasTexture(canvas)
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace
    if (repeat) {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
    }
    texture.anisotropy = 8
    return texture
}

// Асфальт. Якщо markings = true — додаємо розмітку (пунктир по центру та суцільні краї).
export function makeAsphaltTexture(markings) {
    const size = 256
    const [canvas, g] = makeCanvas(size, size)
    const rnd = createRandom(markings ? 3 : 4)

    g.fillStyle = '#4a4c50'
    g.fillRect(0, 0, size, size)

    for (let i = 0; i < 5000; i++) {
        const v = 55 + rnd() * 60
        g.fillStyle = `rgba(${v},${v},${v + 4},${0.25 + rnd() * 0.5})`
        g.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 1.6, 1 + rnd() * 1.6)
    }

    if (markings) {
        g.fillStyle = 'rgba(240, 240, 235, 0.92)'
        g.fillRect(size * 0.5 - 3, 0, 6, size * 0.5)       // пунктир по центру
        g.fillStyle = 'rgba(240, 240, 235, 0.8)'
        g.fillRect(size * 0.045, 0, 4, size)                // ліва крайова
        g.fillRect(size * 0.955 - 4, 0, 4, size)            // права крайова
    }

    const texture = toTexture(canvas, { repeat: true })
    if (markings) texture.wrapS = THREE.ClampToEdgeWrapping
    return texture
}

// Дерев'яні дошки (лавки)
export function makeWoodTexture() {
    const [canvas, g] = makeCanvas(256, 256)
    const rnd = createRandom(5)

    g.fillStyle = '#a97a4d'
    g.fillRect(0, 0, 256, 256)

    for (let i = 0; i < 90; i++) {
        const y = rnd() * 256
        g.strokeStyle = `rgba(70, 40, 15, ${0.06 + rnd() * 0.14})`
        g.lineWidth = 1 + rnd() * 2
        g.beginPath()
        g.moveTo(0, y)
        g.bezierCurveTo(80, y + rnd() * 8 - 4, 170, y + rnd() * 8 - 4, 256, y + rnd() * 6 - 3)
        g.stroke()
    }
    return toTexture(canvas, { repeat: true })
}

// Вивіска з текстом на арці
export function makeSignTexture(line1, line2) {
    const [canvas, g] = makeCanvas(1024, 192)
    g.fillStyle = '#1f5b3a'
    g.fillRect(0, 0, 1024, 192)
    g.strokeStyle = '#f3e9c6'
    g.lineWidth = 6
    g.strokeRect(10, 10, 1004, 172)

    g.fillStyle = '#f7f1dc'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = 'bold 74px Georgia, serif'
    g.fillText(line1, 512, 76)
    g.font = 'italic 40px Georgia, serif'
    g.fillText(line2, 512, 142)
    return toTexture(canvas)
}

// Вода: сині плями-відблиски, які безшовно повторюються
export function makeWaterTexture() {
    const size = 256
    const [canvas, g] = makeCanvas(size, size)
    const rnd = createRandom(7)

    g.fillStyle = '#2f7da8'
    g.fillRect(0, 0, size, size)

    for (let i = 0; i < 140; i++) {
        const x = rnd() * size
        const y = rnd() * size
        const r = 6 + rnd() * 18
        for (const dx of [-size, 0, size]) {
            for (const dy of [-size, 0, size]) {
                const gradient = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r)
                gradient.addColorStop(0, 'rgba(255,255,255,0.35)')
                gradient.addColorStop(1, 'rgba(255,255,255,0)')
                g.fillStyle = gradient
                g.beginPath()
                g.arc(x + dx, y + dy, r, 0, Math.PI * 2)
                g.fill()
            }
        }
    }
    return toTexture(canvas, { repeat: true })
}

// Спрайти для частинок: сніжинка/крапля, пелюстка, листок
export function makeSpriteTexture(kind) {
    const [canvas, g] = makeCanvas(64, 64)
    g.fillStyle = '#ffffff'

    if (kind === 'circle') {
        const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 30)
        gradient.addColorStop(0, 'rgba(255,255,255,1)')
        gradient.addColorStop(0.6, 'rgba(255,255,255,0.9)')
        gradient.addColorStop(1, 'rgba(255,255,255,0)')
        g.fillStyle = gradient
        g.fillRect(0, 0, 64, 64)
    } else if (kind === 'petal') {
        g.beginPath()
        g.ellipse(32, 32, 12, 24, 0.6, 0, Math.PI * 2)
        g.fill()
    } else {
        g.beginPath()
        g.moveTo(32, 5)
        g.bezierCurveTo(62, 22, 54, 52, 32, 59)
        g.bezierCurveTo(10, 52, 2, 22, 32, 5)
        g.fill()
        g.strokeStyle = 'rgba(0,0,0,0.35)'
        g.lineWidth = 2
        g.beginPath()
        g.moveTo(32, 12)
        g.lineTo(32, 56)
        g.stroke()
    }
    return toTexture(canvas)
}
