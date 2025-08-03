import React from 'react'
import { useAppContext } from '../../context/AppContext'
import WarningPage from './WarningPage'

const RequireAuth = ({ children }) => {
  const { user } = useAppContext()
  if (!user) {
    return <WarningPage message="You must be logged in to access this page." />
  }
  return children
}

export default RequireAuth