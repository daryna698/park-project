import * as THREE from 'three'
import { createRandom } from './random'

/**
 * ПЛАН ПАРКУ.  1 одиниця = 1 метр.  Вісь y — вгору.
 * Дорога входить у парк з півдня (+z), робить плавний S-поворот
 * і закінчується круглою площею з фонтаном.
 * Усі розстановки (дерева, лавки, ліхтарі...) обчислюються тут один раз,
 * а компоненти лише малюють готові дані.
 */

export const ROAD_WIDTH = 6
export const PAVEMENT_WIDTH = 1.8
export const PLAZA_INNER = 4.6      // радіус острівця з фонтаном
export const PLAZA_OUTER = 8.6      // зовнішній радіус кільцевої дороги
export const PLAZA_PAVEMENT = 10.4  // зовнішній радіус тротуару навколо площі
export const WORLD = { minX: -85, maxX: 85, minZ: -75, maxZ: 85 }

const rand = createRandom(11)
const rb = (a, b) => a + rand() * (b - a)
const v = (x, z) => new THREE.Vector3(x, 0, z)

/* ---------- Дорога ---------- */
export const roadCurve = new THREE.CatmullRomCurve3(
    [v(0, 48), v(0, 34), v(5, 20), v(3, 6), v(-5, -8), v(-4, -20)],
    false, 'catmullrom', 0.5
)
export const roadLength = roadCurve.getLength()
const roadSamples = roadCurve.getSpacedPoints(300)

const endPoint = roadCurve.getPointAt(1)
const endTangent = roadCurve.getTangentAt(1)
export const plazaCenter = endPoint.clone().addScaledVector(endTangent, PLAZA_OUTER - 0.6)

// Система координат вздовж дороги: точка, напрям, нормаль, кут повороту
export function frameAt(t, offset = 0) {
    const p = roadCurve.getPointAt(t)
    const tan = roadCurve.getTangentAt(t)
    const nx = -tan.z
    const nz = tan.x
    return {
        x: p.x + nx * offset, z: p.z + nz * offset,
        tx: tan.x, tz: tan.z, nx, nz,
        angle: Math.atan2(tan.x, tan.z)
    }
}

export function distanceToRoad(x, z) {
    let min = Infinity
    for (const p of roadSamples) {
        const d = Math.hypot(p.x - x, p.z - z)
        if (d < min) min = d
    }
    return min
}
const distanceToPlaza = (x, z) => Math.hypot(x - plazaCenter.x, z - plazaCenter.z)

// Чи стоїть точка на асфальті/тротуарі (там авто їде швидше, ніж по траві)
export function isPaved(x, z) {
    return distanceToRoad(x, z) <= ROAD_WIDTH / 2 + PAVEMENT_WIDTH || distanceToPlaza(x, z) <= PLAZA_PAVEMENT
}

/* ---------- Старт авто і камера ---------- */
const startFrame = frameAt(0)
export const carStart = { x: startFrame.x, z: startFrame.z, heading: startFrame.angle }
export const startView = {
    position: [startFrame.x - startFrame.tx * 9 + startFrame.nx * 5, 4.5, startFrame.z - startFrame.tz * 9 + startFrame.nz * 5],
    target: [startFrame.x + startFrame.tx * 4, 1.2, startFrame.z + startFrame.tz * 4]
}

/* ---------- Список перешкод для зіткнень авто (кола) ---------- */
export const obstacles = []
const addObstacle = (x, z, r) => obstacles.push({ x, z, r })
const isClear = (x, z, minDist) => obstacles.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + minDist)

// Острівець із фонтаном
addObstacle(plazaCenter.x, plazaCenter.z, PLAZA_INNER)

/* ---------- Арка входу ---------- */
const gateFrame = frameAt(0.1)
export const gate = { ...gateFrame, halfWidth: 5.6 }
for (const side of [-1, 1]) {
    addObstacle(gateFrame.x + gateFrame.nx * side * gate.halfWidth, gateFrame.z + gateFrame.nz * side * gate.halfWidth, 0.8)
}

/* ---------- Лавки ---------- */
export const benches = []
const benchView = (b) => ({
    position: [b.x + b.fx * 5.5, 2.4, b.z + b.fz * 5.5],
    target: [b.x, 0.7, b.z]
})

;[0.2, 0.32, 0.44, 0.56, 0.68, 0.8].forEach((t, i) => {
    const side = i % 2 === 0 ? 1 : -1
    const f = frameAt(t, side * 6.2)
    const fx = -f.nx * side   // лавка дивиться на дорогу
    const fz = -f.nz * side
    const bench = { id: benches.length, x: f.x, z: f.z, fx, fz, rot: Math.atan2(fx, fz) }
    bench.view = benchView(bench)
    benches.push(bench)
    addObstacle(bench.x, bench.z, 1.0)
})

const entryAngle = Math.atan2(-endTangent.z, -endTangent.x) // напрям від центру площі до входу
const angleDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))

for (let k = 0; k < 8; k++) {
    const angle = k * (Math.PI / 4) + Math.PI / 8
    if (angleDiff(angle, entryAngle) < 0.6) continue
    const x = plazaCenter.x + Math.cos(angle) * 11.8
    const z = plazaCenter.z + Math.sin(angle) * 11.8
    const fx = -Math.cos(angle)
    const fz = -Math.sin(angle)
    const bench = { id: benches.length, x, z, fx, fz, rot: Math.atan2(fx, fz) }
    bench.view = benchView(bench)
    benches.push(bench)
    addObstacle(x, z, 1.0)
}

export const initialOccupied = { 1: true, 4: true, 7: true }

/* ---------- Ліхтарі ---------- */
export const lamps = []
for (let t = 0.06; t < 0.96; t += 0.085) {
    for (const side of [-1, 1]) {
        const f = frameAt(t, side * 4.4)
        lamps.push({ x: f.x, z: f.z })
        addObstacle(f.x, f.z, 0.25)
    }
}
for (let k = 0; k < 6; k++) {
    const angle = k * (Math.PI / 3)
    if (angleDiff(angle, entryAngle) < 0.5) continue
    const x = plazaCenter.x + Math.cos(angle) * 9.5
    const z = plazaCenter.z + Math.sin(angle) * 9.5
    lamps.push({ x, z })
    addObstacle(x, z, 0.25)
}

/* ---------- Дерева ---------- */
export const trees = []
function addTree(x, z) {
    if (!isClear(x, z, 1.8)) return false
    const s = rb(0.85, 1.4)
    trees.push({ x, z, s, rot: rb(0, Math.PI * 2), phase: rb(0, 10) })
    addObstacle(x, z, 0.45 * s)
    return true
}

// Алея вздовж дороги
const treeStep = 6.5 / roadLength
for (let t = 0.14; t < 0.97; t += treeStep) {
    for (const side of [-1, 1]) {
        const f = frameAt(Math.min(0.99, t + rb(-0.01, 0.01)), side * rb(9, 12))
        if (distanceToPlaza(f.x, f.z) < 13) continue
        addTree(f.x, f.z)
    }
}

// Ліс навколо
let forest = 0
let tries = 0
while (forest < 120 && tries < 6000) {
    tries++
    const x = rb(-75, 75)
    const z = rb(-70, 75)
    if (distanceToRoad(x, z) < 14) continue
    if (distanceToPlaza(x, z) < 17) continue
    if (z > 36 && Math.abs(x) < 9) continue       // не перекриваємо під'їзд до арки
    if (addTree(x, z)) forest++
}

/* ---------- Каміння ---------- */
export const rocks = []
tries = 0
while (rocks.length < 30 && tries < 2000) {
    tries++
    const x = rb(-45, 45)
    const z = rb(-55, 55)
    const d = distanceToRoad(x, z)
    if (d < 7 || d > 22) continue
    if (distanceToPlaza(x, z) < 13) continue
    if (!isClear(x, z, 0.8)) continue
    const s = rb(0.25, 0.8)
    rocks.push({ x, y: s * 0.35, z, sx: s, sy: s * rb(0.6, 0.9), sz: s * rb(0.8, 1.2), rx: rb(0, 3), ry: rb(0, 6), rz: rb(0, 3) })
    if (s > 0.55) addObstacle(x, z, s * 0.8)
}

/* ---------- Квіти ---------- */
export const flowers = []
const flowerColors = ['#ff5c8a', '#ffd23f', '#ffffff', '#b980ff', '#ff8a3d']

for (let i = 0; i < 20; i++) {
    const side = i % 2 === 0 ? 1 : -1
    const f = frameAt(rb(0.1, 0.95), side * rb(5.6, 7.5))
    if (!isClear(f.x, f.z, 1.2)) continue
    for (let j = 0; j < 9; j++) {
        flowers.push({ x: f.x + rb(-0.9, 0.9), y: 0.22, z: f.z + rb(-0.9, 0.9), color: flowerColors[Math.floor(rand() * flowerColors.length)] })
    }
}
for (let i = 0; i < 44; i++) {
    const a = rb(0, Math.PI * 2)
    const r = rb(3.4, 4.3)
    flowers.push({ x: plazaCenter.x + Math.cos(a) * r, y: 0.5, z: plazaCenter.z + Math.sin(a) * r, color: flowerColors[Math.floor(rand() * flowerColors.length)] })
}
