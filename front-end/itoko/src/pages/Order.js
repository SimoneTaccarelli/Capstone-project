import { Form, FormControl, Button, Table } from 'react-bootstrap';
import { useState } from 'react';
import { useOrder } from '../context/OrderContext';

const Order = () => {
  const { orders, getOrderById, loading, error } = useOrder();
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    getOrderById(orderId);
  };

  return (
    <div className="container mt-5">
      <h1>Ordini</h1>
      <Form className="d-flex align-items-center mb-3" onSubmit={handleSubmit}>
        <Form.Group className="me-3 d-flex align-items-center">
          <Form.Label className="me-2 mb-0">ID Ordine</Form.Label>
          <FormControl 
            value={orderId} 
            onChange={(e) => setOrderId(e.target.value)} 
            placeholder="Inserisci ID ordine" 
          />
        </Form.Group>
        <Button type="submit" variant="primary">Cerca</Button>
      </Form>

      {loading && <div className="text-center my-5"><div className="spinner-border"></div><p>Caricamento in corso...</p></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && orders && orders.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Totale</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/D'}</td>
                <td>{order.totalAmount ? `€${order.totalAmount}` : 'N/D'}</td>
                <td>{order.status || 'N/D'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        !loading && <div className="alert alert-info">Nessun ordine trovato. Inserisci un ID ordine valido.</div>
      )}
    </div>
  );
};

export default Order;