
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import {createBrowserRouter} from "react-router";
import Layout from "./features/Components/Layout";
import Home from "./features/home/pages/home";
import Profile from "./features/profilePage/pages/profile";
import Protected from "./features/Components/Protected";
import CreatePost from "./features/createPost/createPost";
export const router = createBrowserRouter([
    {
        element: <Layout/>,
        children :[
            {path: "/" , element: <Home/>},
            {
                path: "/profile",
                element: (
                  <Protected>
                    <Profile />
                  </Protected>
                ),
              },
              {
                path: "/create-post",
                element: (
                  <Protected>
                    <CreatePost />
                  </Protected>
                ),
              },
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
