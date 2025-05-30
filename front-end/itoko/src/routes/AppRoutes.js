import { Routes, Route, Navigate } from "react-router-dom";
// import Register from "../pages/Register";
import MyNavbar from "../components/MyNavbar";
import Administrator from "../pages/Administrator";
import Home from "../pages/Home";
import CreateProduct from "../pages/CreateProduct";
import { useAuth } from "../context/AuthContext";
import Details from "../pages/Details";
import LoginAdmin from "../pages/LoginAdmin";
// import SuccessPayment from "../pages/SuccessPayment";
import ProfileUser from "../pages/ProfileUser";
import WhoWeAre from "../pages/WhoWeAre";
import PrivacyAndPolicy from "../pages/PrivacyAndPolicy";
// import OrderAdmin from "../pages/OrderAdmin";
// import OrderUser from "../pages/OrderUser";
// import Order from "../pages/Order";

const AppRoutes = () => {
    const { userData, loading, admin } = useAuth();
    const user = userData && userData._id;

    // Se stiamo ancora caricando i dati di autenticazione, mostra un indicatore di caricamento
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <MyNavbar />
            <Routes>
                {/* Route pubbliche */}
                {/* <Route path="/success" element={<SuccessPayment />} /> */}
                {/* <Route path="/register" element={<Register />} /> */}
                <Route path="/details/:id" element={<Details />} />
                <Route path="/who-we-are" element={<WhoWeAre />} />
                <Route path="/login-admin" element={<LoginAdmin />} />
                <Route path="/privacy-and-policy" element={<PrivacyAndPolicy />} />
                {/* <Route path="/order" element={<Order />} /> */}
                <Route path="/" element={<Home />} />
                
                {/* Route che richiedono autenticazione */}
                {/* <Route path="/ordersUser" element={user ? <OrderUser /> : <Navigate to="/" />} /> */}
                <Route path="/profile" element={user ? <ProfileUser /> : <Navigate to="/" />} />
                
                {/* Route admin */}
                {/* <Route path="/order-admin" element={isAdmin ? <OrderAdmin /> : <Navigate to="/" />} /> */}
                <Route path="/Administrator" element={admin ? <Administrator /> : <Navigate to="/" />} />
                <Route path="/CreateProduct" element={admin ? <CreateProduct /> : <Navigate to="/" />} />
                
                {/* Aggiungi queste route per gestire eventuali variazioni del percorso */}
                {/* <Route path="/orderadmin" element={<Navigate to="/order-admin" replace />} />
                <Route path="/OrderAdmin" element={<Navigate to="/order-admin" replace />} /> */}

                {/* Route di fallback per gestire URL non trovati */}
                <Route path="*" element={
                    <div className="container mt-5">
                        <div className="alert alert-warning">
                            <h4>Pagina non trovata</h4>
                            <p>URL: {window.location.pathname}</p>
                            <p>Stato admin: {admin ? "Sì" : "No"}</p>
                            <p>Utente: {user ? "Autenticato" : "Non autenticato"}</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => window.history.back()}>
                            Torna indietro
                        </button>
                    </div>
                } />
            </Routes>
        </>
    );
};

export default AppRoutes;