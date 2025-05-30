import React, { useState } from 'react';
import { Button, Container, Nav, Navbar, Form, InputGroup, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
// import Login from '../modal/Login.js';
import { useAuth } from '../context/AuthContext';
import Cart from '../modal/Cart.js';
import { useDesign } from '../context/DesignContext';
// import { useOrder } from '../context/OrderContext.js';

function MyNavbar() {
  const { logout, userData, currentUser, admin } = useAuth();
  const isAdmin = userData && userData.role === "Admin";
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { logo } = useDesign();
  // const { getUserOrders } = useOrder();

  // Recupera gli ordini dell'utente loggato
  // const fetchUserOrders = async () => {
  //   if (currentUser) {
  //     try {
  //       await getUserOrders();
  //     } catch (error) {
  //       // Gestione errore silenziosa
  //     }
  //   }
  // };

  // Gestisce l'invio della ricerca
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Funzioni di navigazione
  const goToProfile = () => {
    navigate('/profile');
  };

  // const goToOrders = () => {
  //   navigate('/ordersUser');
  //   fetchUserOrders();
  // };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Gestione errore silenziosa
    }
  };

  return (
    <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          {logo ? (
            <img 
              src={logo} 
              alt="Logo Itoko" 
              height="40" 
              className="d-inline-block align-top me-2"
            />
          ) : (
            <span>Itoko</span>
          )}
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbarScroll" />
        
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/who-we-are">Chi siamo</Nav.Link>
            <Nav.Link as={Link} to="/privacy-and-policy">Privacy&Policy</Nav.Link>
            {admin && (
              <Nav.Link as={Link} to="/administrator">Amministrazione</Nav.Link>
            )}
          </Nav>
          
          {/* Layout responsive per desktop/mobile */}
          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2">
            {/* Barra di ricerca */}
            <Form className="d-flex" onSubmit={handleSearch}>
              <InputGroup style={{ width: '180px' }}>
                <Form.Control
                  type="text"
                  placeholder="Cerca prodotti..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Cerca prodotti"
                  size="sm"
                />
                <Button variant="outline-primary" type="submit" size="sm">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Form>
            
            {/* Wrapper per Carrello e Profilo */}
            <div className="d-flex align-items-center gap-2">
              {/* Carrello */}
              {/* <Cart /> */}
              
              {/* Gestione login/profilo utente */}
              {!currentUser ? (
                <>
                  {/* <Login /> */}
                  {/* <Link to="/order" className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-box"></i> I miei ordini
                  </Link> */}
                </>
              ) : (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" id="dropdown-profile" className="d-flex align-items-center border-0 bg-transparent">
                    <img
                      src={userData?.profilePic || `https://ui-avatars.com/api/?background=8c00ff&color=fff&name=${userData?.firstName || 'U'}+${userData?.lastName || 'N'}`} 
                      alt="Profilo" 
                      className="rounded-circle me-1"
                      style={{height: "30px", width: "30px", objectFit: "cover"}}
                    /> 
                    <span className="ms-1">
                      {userData?.firstName || 'Profilo'}
                    </span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={goToProfile}>
                      <i className="bi bi-person me-2"></i>
                      Il mio profilo
                    </Dropdown.Item>
                    {/* <Dropdown.Item onClick={goToOrders}>
                      <i className="bi bi-box me-2"></i>
                      I miei ordini
                    </Dropdown.Item> */}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;