import { Outlet } from "react-router-dom";
import Navbar from "../home/components/Navbar"; 


/**The core idea: Layout becomes a parent route,
 and every page that should have a navbar becomes its child.*/
export default function Layout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}