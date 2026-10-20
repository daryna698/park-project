import * as THREE from 'three'
import { carStart } from './layout'

/**
 * Змінні, що оновлюються КОЖЕН кадр (позиція авто, швидкість...).
 * Їх не кладемо в React-стан: інакше сторінка перемальовувалась би 60 разів на секунду.
 */
export const sim = {
    carPos: new THREE.Vector3(carStart.x, 0, carStart.z),
    carHeading: carStart.heading,
    speed: 0,
    steer: 0,
    braking: false,
    leafScale: 1,                 // плавна зміна густини листя на деревах
    focus: new THREE.Vector3()    // точка, навколо якої рахуємо тіні та частинки
}

export function resetCar() {
    sim.carPos.set(carStart.x, 0, carStart.z)
    sim.carHeading = carStart.heading
    sim.speed = 0
    sim.steer = 0
}
