
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import {createBrowserRouter} from "react-router";

export const router = createBrowserRouter([
    // {
    //     path:"/",
    //     element:<Home/>
    // },
    {
        path:"/login",
       element: <Login/>
    },
    {
        path : "/register",
        element : <Register/>
    }
])
