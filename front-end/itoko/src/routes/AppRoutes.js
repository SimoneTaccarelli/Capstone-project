import { Routes, Route } from "react-router-dom";
import Register from "../pages/Register";
import MyNavbar from "../components/MyNavbar";
import Administrator from "../pages/Administrator";
import Home from "../pages/Home";

const AppRoutes = () => {
    return (
        <>
         <MyNavbar />
        <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/administrator" element={<Administrator />} />
            <Route path="/" element={<Home />} />
        </Routes>
        </>
    );
}

export default AppRoutes;