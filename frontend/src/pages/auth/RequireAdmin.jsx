import React from 'react'
import { useAppContext } from '../../context/AppContext'
import WarningPage from './WarningPage'

const RequireAdmin = ({ children }) => {
  const { user, isAdmin } = useAppContext()
  if (!user) {
    return <WarningPage message="You must be logged in to access the admin page." />
  }
  if (!isAdmin) {
    return <WarningPage message="You do not have permission to access the admin page." />
  }
  return children
}

export default RequireAdmin