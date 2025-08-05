import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext.jsx'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NavBar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Admin from './pages/Admin/Admin.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import AddUsers from './pages/Admin/AddUsers.jsx'
import ManageTasks from './pages/Admin/ManageTasks.jsx'
import VerifyTask from './pages/Admin/VerifyTask.jsx'
import RequireAuth from './pages/auth/RequireAuth.jsx'
import RequireAdmin from './pages/auth/RequireAdmin.jsx'
import Footer from './components/Footer.jsx'

function App() {

  const isAdminPath = useLocation().pathname.includes('admin')
  const { isAdmin } = useAppContext();

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      <Toaster/>
      {!isAdmin && <NavBar/>}
      <div className={`${isAdminPath ? "": '' }`}>
        <Routes>
          {/* <Route path='/dashboard' element={user ? <Dashboard/> : null}/> */}
          <Route path='/dashboard' element={
            <RequireAuth>
              <Dashboard/>
            </RequireAuth>
          }/>
          <Route path='/profile' element={
            <RequireAuth>
              <Profile/>
            </RequireAuth>
          }/>
          <Route path='/' element={!isAdmin ? <Home/> : <Admin/>}/>
            <Route path='/admin' element={
              <RequireAdmin>
                <Admin/>
              </RequireAdmin>
            }>
              <Route index element={isAdmin ? <ManageTasks/> : null}/>
              <Route path='verify' element={isAdmin ? <VerifyTask/> : null}/>
              <Route path='add-users' element={isAdmin ? <AddUsers /> : null}/>
            </Route>
        </Routes>
      </div>
      {!isAdmin && <Footer/>}
      
    </div>
  )
}

export default App
