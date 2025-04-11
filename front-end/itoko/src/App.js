import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';

function App() {
  return (
    <>
      <AuthProvider>
        <ProductProvider>
        <Router>
          <AppRoutes />
        </Router>
        </ProductProvider>
      </AuthProvider>
    </>
  );
}

export default App;
