
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import {createBrowserRouter} from "react-router";
import Layout from "./features/Components/Layout";
import Home from "./features/home/pages/home";
import Profile from "./features/profilePage/pages/profile";
import Protected from "./features/Components/Protected";
import CreatePost from "./features/createPost/createPost";
import PostDetails from "./features/postDetails/PostDetails";
import EditPost from "./features/createPost/editPosts";
import ChatPage from "./features/chat/pages/ChatPage";
import About from "./features/about/About";
import VerifyOtp from "./features/auth/pages/VerifyOtp";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";
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
              { path: "/pets/:id", element: <PostDetails /> },
              {
                path: "/edit-post/:id",
                element: (
                  <Protected>
                    <EditPost />
                  </Protected>
                ),
              },
              {
                path: "/chats",
                element: <Protected><ChatPage /></Protected>
              },
              {
                path: "/chat/:conversationId",
                element: <Protected><ChatPage /></Protected>
              },
              { path: "/about", 
                element: <About /> }
        ]

    },
    {
        path:"/login",
       element: <Login/>
    },
    {
        path : "/register",
        element : <Register/>
    },
    { path: "/verify-otp",
       element: <VerifyOtp />
     },
    { path: "/forgot-password",
       element: <ForgotPassword />
       },
    { path: "/reset-password", 
      element: <ResetPassword />
     },
])
