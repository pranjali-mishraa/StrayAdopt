
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import {createBrowserRouter} from "react-router";
import Layout from "./features/Components/Layout";
import Home from "./features/home/pages/home";
import Profile from "./features/profilePage/pages/profile";

export const router = createBrowserRouter([
    {
        element: <Layout/>,
        children :[
            {path: "/" , element: <Home/>},
            {path : "/profile" , element: <Profile/>}
        ]

    },
    {
        path:"/login",
       element: <Login/>
    },
    {
        path : "/register",
        element : <Register/>
    }
])
