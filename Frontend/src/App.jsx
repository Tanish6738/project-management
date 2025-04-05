import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './Routes/AppRoutes'
import { ProjectProvider } from './App/Context/ProjectContext'
import { AuthProvider } from './App/Context/AuthContext'
import { TaskProvider } from './App/Context/TaskContext'
import { TeamProvider } from './App/Context/TeamContext'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectProvider>
          <TaskProvider>
            <TeamProvider>
              <AppRoutes />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: '#18181b',
                    color: '#fff',
                  },
                }}
              />
            </TeamProvider>
          </TaskProvider>
        </ProjectProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
