import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Form, Button, InputGroup, Badge, Dropdown, Modal, Spinner, Alert } from 'react-bootstrap';
import { useOrder } from '../context/OrderContext';

function OrderAdmin() {
  // Stato e hooks
  const { orders, loading, error, getAllOrders, deleteOrder, updateOrderStatus } = useOrder();
  // Modifica la dichiarazione degli stati - rimuovi quelli non utilizzati
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  // Rimuovi statusLoading se non lo usi
  const [loadingTimeout, setLoadingTimeout] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Usa useCallback per evitare cicli infiniti
  const loadOrdersData = useCallback(async () => {
    try {
      console.log("Tentativo di caricamento ordini...");
      await getAllOrders();
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Errore nel caricamento ordini:", error);
      setLocalError("Errore nel caricamento degli ordini. Riprova o contatta l'assistenza.");
    }
  }, [getAllOrders]);

  // Primo caricamento con limite tentativi
  useEffect(() => {
    if (!initialLoadDone && retryCount < 3) {
      loadOrdersData();
      setRetryCount(prev => prev + 1);
    }
  }, [loadOrdersData, initialLoadDone, retryCount]);

  // Timeout di sicurezza - importante!
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.warn("Timeout di caricamento superato, mostrando i dati disponibili");
        setLoadingTimeout(false);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // Filtra gli ordini quando cambiano o quando cambia il termine di ricerca
  useEffect(() => {
    if (!orders) return;
    
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }
    
    const filtered = orders.filter(order => 
      order._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  // Gestisce la ricerca
  const handleSearch = (e) => {
    e.preventDefault();
    // La logica è già gestita nell'useEffect sopra
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestione Ordini</h2>
        
        <Form onSubmit={handleSearch} className="d-flex">
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Cerca per ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '200px' }}
            />
            <Button variant="outline-primary" type="submit">
              <i className="bi bi-search"></i>
            </Button>
          </InputGroup>
        </Form>
      </div>
      
      {error && (
        <Alert variant="danger">
          <p>{error}</p>
          <div className="mt-2 d-flex gap-2">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
            >
              Rieffettua Login
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => {
                setRetryCount(0);
                setInitialLoadDone(false);
              }}
            >
              Riprova
            </Button>
          </div>
        </Alert>
      )}
      
      {loading && loadingTimeout ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Caricamento ordini...</p>
          <Button 
            variant="link" 
            className="mt-2" 
            onClick={() => setLoadingTimeout(false)}
          >
            Il caricamento è troppo lungo? Clicca qui
          </Button>
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="table-container rounded shadow-sm">
          <Table striped  hover responsive>
            <thead className="bg-light">
              <tr>
                <th>ID Ordine</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Totale</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.substring(0, 8)}...</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.shippingAddress?.name || 'N/A'}</td>
                  <td>€{order.totalAmount?.toFixed(2) || 'N/A'}</td>
                  <td>
                    <Badge bg={
                      order.status === 'delivered' ? 'success' :
                      order.status === 'shipped' ? 'primary' :
                      order.status === 'processing' ? 'info' :
                      order.status === 'cancelled' ? 'danger' :
                      'warning'
                    }>
                      {order.status}
                    </Badge>
                  </td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="outline-secondary" size="sm">
                        Azioni
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => updateOrderStatus(order._id, 'processing')}>
                          In Elaborazione
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => updateOrderStatus(order._id, 'shipped')}>
                          Spedito
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => updateOrderStatus(order._id, 'delivered')}>
                          Consegnato
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          className="text-danger"
                          onClick={() => {
                            setOrderToDelete(order);
                            setShowDeleteModal(true);
                          }}
                        >
                          Cancella Ordine
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <Alert variant="info">
          {searchTerm ? "Nessun ordine trovato con questo ID." : "Non ci sono ordini al momento."}
        </Alert>
      )}
      
      {/* Modal di conferma eliminazione */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma Eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sei sicuro di voler eliminare questo ordine? Questa azione non può essere annullata.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              deleteOrder(orderToDelete._id);
              setShowDeleteModal(false);
            }}
          >
            Elimina
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderAdmin;