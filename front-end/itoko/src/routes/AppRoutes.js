import { Routes, Route } from "react-router-dom";
import Register from "../pages/Register";
import MyNavbar from "../components/MyNavbar";

const AppRoutes = () => {
    return (
        <>
         <MyNavbar />
        <Routes>
            <Route path="/register" element={<Register />} />
        </Routes>
        </>
    );
}

export default AppRoutes;