import { Routes, Route } from "react-router-dom";
import Register from "../pages/Register";
import MyNavbar from "../components/MyNavbar";
import Administrator from "../pages/Administrator";
import Home from "../pages/Home";
import CreateProduct from "../pages/CreateProduct";
import { useAuth } from "../context/AuthContext";

const AppRoutes = () => {
    const { userData  } = useAuth();
    const isAdmin = userData && userData.role === "Admin";
    return (
        <>
         <MyNavbar />
        <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Register />} />
            {isAdmin && (
                <>
                <Route path="/Administrator" element={<Administrator />} /> 
                <Route path="/CreateProduct" element={<CreateProduct />} />
                </>
            )}
            <Route path="/" element={<Home />} />
        </Routes>
        </>
    );
}

export default AppRoutes;