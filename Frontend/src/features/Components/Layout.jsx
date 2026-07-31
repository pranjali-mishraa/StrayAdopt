import { Outlet } from "react-router-dom";
import Navbar from "../home/components/Navbar"; 
import Footer from "../footer/Footer";

export default function Layout() {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer/>
    </div>
  );
}