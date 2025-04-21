import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, InputGroup, Badge, Dropdown, Modal, Spinner, Alert } from 'react-bootstrap';
import { useOrder } from '../context/OrderContext';
import { Link } from 'react-router-dom';

function OrderAdmin() {
  const { orders, loading, error, getAllOrders, deleteOrder, updateOrderStatus } = useOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);

  // Carica tutti gli ordini all'avvio
  useEffect(() => {
    getAllOrders();
  }, []);

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
    // Il filtro è già gestito dall'useEffect
  };

  // Apre il modal di conferma per l'eliminazione
  const confirmDelete = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  // Esegue l'eliminazione
  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    const success = await deleteOrder(orderToDelete._id);
    if (success) {
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  // Gestisce il cambiamento di stato
  const handleStatusChange = async (orderId, newStatus) => {
    setStatusLoading(orderId);
    await updateOrderStatus(orderId, newStatus);
    setStatusLoading(null);
  };

  // Helper per formattare la data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper per ottenere il badge dello stato ordine
  const getStatusBadge = (status) => {
    const variants = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  // Helper per troncare l'ID
  const truncateId = (id) => {
    return id.substring(0, 8) + '...';
  };

  // Calcola l'importo totale di un ordine
  const calculateTotal = (order) => {
    return order.totalAmount?.toFixed(2) || "N/A";
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

      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </Spinner>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          Errore: {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {filteredOrders.length === 0 ? (
            <Alert variant="info">
              {searchTerm ? "Nessun ordine trovato con questo ID." : "Non ci sono ordini al momento."}
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
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
                      <td>
                        <span className="text-monospace">{truncateId(order._id)}</span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        {order.shippingAddress?.fullName || 'N/D'}
                      </td>
                      <td>€{calculateTotal(order)}</td>
                      <td>
                        {statusLoading === order._id ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm" id={`status-${order._id}`}>
                              {getStatusBadge(order.status)}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleStatusChange(order._id, 'pending')}>
                                In attesa
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusChange(order._id, 'processing')}>
                                In lavorazione
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusChange(order._id, 'shipped')}>
                                Spedito
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleStatusChange(order._id, 'delivered')}>
                                Consegnato
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item onClick={() => handleStatusChange(order._id, 'cancelled')} className="text-danger">
                                Annullato
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/admin/orders/${order._id}`} className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => confirmDelete(order)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Modal di conferma eliminazione */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sei sicuro di voler eliminare l'ordine {orderToDelete?._id.substring(0, 8)}...?
          <p className="text-danger mt-2">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Questa azione è irreversibile.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Elimina
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderAdmin;