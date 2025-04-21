import { Routes, Route } from "react-router-dom";
import Register from "../pages/Register";
import MyNavbar from "../components/MyNavbar";
import Administrator from "../pages/Administrator";
import Home from "../pages/Home";
import CreateProduct from "../pages/CreateProduct";
import { useAuth } from "../context/AuthContext";
import Details from "../pages/Details";
import SuccessPayment from "../pages/SuccessPayment";
import ProfileUser from "../pages/ProfileUser";
import OrderAdmin from "../pages/OrderAdmin";
import OrderUser from "../pages/OrderUser";



const AppRoutes = () => {
    const { userData  } = useAuth();
    const isAdmin = userData && userData.role === "Admin";
    const user = userData && userData._id;

    return (
        <>
         <MyNavbar />
        <Routes>
            <Route path="/success" element={<SuccessPayment />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Register />} />
            <Route path="/details/:id" element={<Details />} />
            {(user || isAdmin )&& (
                <>
                <Route path="/orders" element={<OrderUser />} />
                <Route path="/profile" element={<ProfileUser />} />
                </>
            )}
           
            {isAdmin && (
                <>
                <Route path="/OrderAdmin" element={<OrderAdmin />} />
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