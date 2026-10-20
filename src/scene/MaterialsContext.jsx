import { createContext, useContext } from 'react'

export const MaterialsContext = createContext(null)
export const useMaterials = () => useContext(MaterialsContext)
