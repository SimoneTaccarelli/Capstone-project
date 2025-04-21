import { Container,Card,Row,Col,Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrder } from "../context/OrderContext";

function OrderUser() {
const { userData , currentUser } = useAuth();
const { orders, loading, error } = useOrder();
console.log ('userData',userData)
console.log ('currentUser',currentUser)
if(loading) {
    return <div className="spinner"></div>;
}

if(error) {
    return <Alert variant="danger">{error}</Alert>;
}

console.log('orders', orders)
const useOrders = orders.filter((order) => order.user === userData._id);



return (
    <Container className="mt-4">
        <h1>I tuoi ordini</h1>
        {useOrders === 0 ? (
            <Alert variant="info">Non hai ancora effettuato ordini.</Alert>
        ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
                {orders.map((order) => (
                    <Col key={order._id}>
                        <Card className="order-card shadow-sm my-3">
                            <Card.Body>
                                <Card.Title>Ordine #{order._id}</Card.Title>
                                <Card.Text>
                                    Data: {new Date(order.createdAt).toLocaleDateString()}
                                    <br />
                                    Totale: €{order.totalAmount}
                                </Card.Text>
                                <Link to={`/details/${order._id}`} className="btn btn-primary">Dettagli</Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        )}
    </Container>
);

}

export default OrderUser;