import { RouterProvider } from "react-router-dom"
import {router} from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/AuthContext"
import { SocketProvider } from "./features/chat/SocketContext"

function App(){
  return(
    <AuthProvider>
      <SocketProvider>
        <RouterProvider router={router}/>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
