import * as THREE from 'three'
import { makeAsphaltTexture, makeWoodTexture, makeWaterTexture } from '../lib/canvasTextures'

// Клонуємо текстуру, щоб кожен матеріал мав власне повторення (repeat)
function prep(texture, repeatX, repeatY, srgb = false) {
    const t = texture.clone()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeatX, repeatY)
    t.anisotropy = 8
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.needsUpdate = true
    return t
}

// PBR-матеріал із набору: diff (колір) + arm (AO/Roughness/Metalness) + nor (нормалі)
function pbr(T, name, repeatX, repeatY, extra = {}) {
    const arm = prep(T[`${name}Arm`], repeatX, repeatY)
    return new THREE.MeshStandardMaterial({
        map: prep(T[`${name}Diff`], repeatX, repeatY, true),
        aoMap: arm,
        roughnessMap: arm,
        metalnessMap: arm,
        normalMap: prep(T[`${name}Nor`], repeatX, repeatY),
        ...extra
    })
}

/** Створює всі матеріали сцени один раз. */
export function createMaterials(T) {
    const rockSet = { rockDiff: T.rockDiff, rockArm: T.groundArm, rockNor: T.groundNor }

    const wood = new THREE.MeshStandardMaterial({ map: makeWoodTexture(), roughness: 0.85 })

    const asphaltRoad = new THREE.MeshStandardMaterial({ map: makeAsphaltTexture(true), roughness: 0.95 })
    const asphaltPlaza = new THREE.MeshStandardMaterial({
        map: makeAsphaltTexture(false), roughness: 0.95,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
    })
    asphaltPlaza.map.repeat.set(4, 4)

    const water = new THREE.MeshStandardMaterial({
        map: makeWaterTexture(), roughness: 0.12, metalness: 0.1,
        transparent: true, opacity: 0.9, emissive: '#0d4a6e', emissiveIntensity: 0.3
    })

    return {
        // сезонні (колір змінюється разом із порою року)
        ground: pbr(T, 'ground', 140, 140, { color: '#66a84a' }),
        grassSmall: pbr(T, 'ground', 3, 3, { color: '#66a84a' }),
        leaves: pbr(T, 'leaf', 2, 2, { color: '#4aa23c' }),

        // постійні
        brick: pbr(T, 'brick', 1.5, 1.5, { color: '#d8c4b4' }),
        concrete: pbr(T, 'plaster', 1, 1, { color: '#cfcfca' }),
        rock: pbr(rockSet, 'rock', 1.5, 1.5, { color: '#c4c9bd' }),
        wood,
        metal: new THREE.MeshStandardMaterial({ color: '#1d1f22', roughness: 0.5, metalness: 0.6 }),
        trunk: new THREE.MeshStandardMaterial({ color: '#5b4636', roughness: 0.95 }),
        asphaltRoad,
        asphaltPlaza,
        water,
        lampGlow: new THREE.MeshStandardMaterial({ color: '#fff3e0', emissive: '#ffc77a', emissiveIntensity: 0.2 }),
        fence: new THREE.MeshStandardMaterial({ color: '#f1eee6', roughness: 0.7 }),

        // авто
        paint: new THREE.MeshStandardMaterial({ color: '#d63a3a', roughness: 0.3, metalness: 0.6 }),
        glass: new THREE.MeshStandardMaterial({ color: '#1b2733', roughness: 0.05, metalness: 0.8 }),
        headlight: new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: '#fff2c0', emissiveIntensity: 0.2 }),
        taillight: new THREE.MeshStandardMaterial({ color: '#661111', emissive: '#ff1a1a', emissiveIntensity: 0.4 })
    }
}
