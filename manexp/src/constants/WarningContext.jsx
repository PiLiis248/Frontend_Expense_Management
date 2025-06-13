"use client"
import { createContext, useContext, useState } from "react"

const WarningContext = createContext(undefined)

export const useWarning = () => {
  const context = useContext(WarningContext)
  if (context === undefined) {
    throw new Error("useWarning must be used within a WarningProvider")
  }
  return context
}

export const WarningProvider = ({ children }) => {
  const [warningCount, setWarningCount] = useState(0)

  return <WarningContext.Provider value={{ warningCount, setWarningCount }}>{children}</WarningContext.Provider>
}
