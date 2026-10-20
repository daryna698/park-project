import * as THREE from 'three'
import { roadLength, roadCurve } from './layout'

/**
 * Будує пласку смугу (стрічку) вздовж кривої дороги між зміщеннями offsetA і offsetB.
 * uvUnit — скільки метрів дороги відповідає одній плитці текстури вздовж смуги.
 */
export function buildStrip(offsetA, offsetB, y, uvUnit, segments = 160) {
    const positions = []
    const uvs = []
    const indices = []

    for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const p = roadCurve.getPointAt(t)
        const tan = roadCurve.getTangentAt(t)
        const nx = -tan.z
        const nz = tan.x
        const v = (t * roadLength) / uvUnit

        positions.push(p.x + nx * offsetA, y, p.z + nz * offsetA)
        positions.push(p.x + nx * offsetB, y, p.z + nz * offsetB)
        uvs.push(0, v, 1, v)
    }

    for (let i = 0; i < segments; i++) {
        const a = i * 2
        // обидва трикутники дивляться вгору (+y)
        indices.push(a, a + 1, a + 3, a, a + 3, a + 2)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    return geometry
}

// Множить UV-координати (щоб текстура на кільці повторювалась частіше)
export function scaleUV(geometry, factor) {
    const uv = geometry.attributes.uv
    for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, uv.getX(i) * factor, uv.getY(i) * factor)
    }
    uv.needsUpdate = true
    return geometry
}
