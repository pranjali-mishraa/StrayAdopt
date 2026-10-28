import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import { createBrowserRouter } from "react-router-dom";
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
import Explore from "./features/Pages/ExploreAllPetsPage";
import AIAssistant from "./features/aiservice/pages/AIAssistant";
import { createNgoPost } from "./features/ngo/services/ngoService";
import ProtectedNgo from "./features/ngo/components/ProtectedNgo";
import NgoRegister from "./features/ngo/pages/NgoRegister";
import NgoLogin from "./features/ngo/pages/NgoLogin";
import NgoDashboard from "./features/ngo/pages/NgoDashboard";
import NgoProfile from "./features/ngo/pages/NgoProfile";
import AdminLayout from "./features/admin/components/AdminLayout";
import ProtectedAdmin from "./features/admin/components/ProtectedAdmin";
import AdminLogin from "./features/admin/pages/AdminLogin";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminNgoReview from "./features/admin/pages/AdminNgoReview";


export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/pets", element: <Explore /> },
      { path: "/pets/:id", element: <PostDetails /> },
      { path: "/about", element: <About /> },
      { path: "/ai-assistant", element: <AIAssistant /> },

      // User routes
      { path: "/profile", element: <Protected><Profile /></Protected> },
      { path: "/create-post", element: <Protected><CreatePost /></Protected> },
      { path: "/edit-post/:id", element: <Protected><EditPost /></Protected> },
      { path: "/chat", element: <Protected><ChatPage /></Protected> },
      { path: "/chats", element: <Protected><ChatPage /></Protected> },
      { path: "/chat/:conversationId", element: <Protected><ChatPage /></Protected> },

      // NGO routes
      { path: "/ngos/:id", element: <NgoProfile /> },
      { path: "/ngo/register", element: <NgoRegister /> },
      { path: "/ngo/login", element: <NgoLogin /> },
      { path: "/ngo/dashboard", element: <ProtectedNgo><NgoDashboard /></ProtectedNgo> },
      {
        path: "/ngo/create-post",
        element: (
          <ProtectedNgo>
            <CreatePost submitPost={createNgoPost} redirectTo="/ngo/dashboard" />
          </ProtectedNgo>
        ),
      },
    ],
  },

  // Auth pages, outside Layout (they use AuthShell, no navbar)
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/verify-otp", element: <VerifyOtp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "login", element: <AdminLogin /> },
      { index: true, element: <ProtectedAdmin><AdminDashboard /></ProtectedAdmin> },
      { path: "ngos/:id", element: <ProtectedAdmin><AdminNgoReview /></ProtectedAdmin> },
    ],
  },
]);