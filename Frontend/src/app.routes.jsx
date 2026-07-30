
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
              }
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
