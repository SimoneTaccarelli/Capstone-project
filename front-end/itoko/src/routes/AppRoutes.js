import { Routes, Route } from "react-router-dom";
import Register from "../pages/Register";
import MyNavbar from "../components/MyNavbar";
import Administrator from "../pages/Administrator";

const AppRoutes = () => {
    return (
        <>
         <MyNavbar />
        <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/administrator" element={<Administrator />} />
        </Routes>
        </>
    );
}

export default AppRoutes;