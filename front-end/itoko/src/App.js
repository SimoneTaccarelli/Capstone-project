import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
// import { CartProvider } from './context/CartContext';
import { DesignProvider } from './context/DesignContext';
// import { OrderProvider } from './context/OrderContext';

function App() {
  return (
    <>
      <AuthProvider>
        <ProductProvider>
          {/* <CartProvider> */}
            <DesignProvider>
              {/* <OrderProvider> */}
              <Router>
                <AppRoutes />
              </Router>
              {/* </OrderProvider> */}
            </DesignProvider>
          {/* </CartProvider> */}
        </ProductProvider>
      </AuthProvider>
    </>
  );
}

export default App;
