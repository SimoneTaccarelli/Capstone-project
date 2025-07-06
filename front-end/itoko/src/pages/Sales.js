import { Table, Button, Form, Pagination } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useProducts } from "../context/ProductContext";
import axios from "axios";
import { API_URL } from "../config/config.js";
import { useAuth } from "../context/AuthContext.js";

const Sales = () => {
  const { paginationProduct, fetchProducts } = useProducts();
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const [bulkDiscount, setBulkDiscount] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editingDiscounts, setEditingDiscounts] = useState({});

  useEffect(() => {
    fetchProducts({ search, page: currentPage, limit: productsPerPage });
  }, [search, currentPage]);

  const products = paginationProduct.products || [];

  // Gestione selezione multipla
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Modifica sconto singolo prodotto
  const handleDiscountChange = async (product, newDiscount) => {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      await axios.put(
        `${API_URL}/sales/${product._id}`,
        { ...product, discount: newDiscount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts({ search });
    } catch (error) {
      alert("Errore nell'aggiornamento del saldo");
    }
  };

  // Elimina prodotto
  const handleDelete = async (productId) => {
    try {
      const token = currentUser && (await currentUser.getIdToken());
      await axios.delete(
        `${API_URL}/sales/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts({ search });
    } catch (error) {
      alert("Errore nell'eliminazione");
    }
  };

  // Modifica di massa (esempio: imposta stesso sconto a tutti i selezionati)
  const handleBulkDiscount = async (discount) => {
    setBulkLoading(true);
    try {
      const token = currentUser && (await currentUser.getIdToken());
      await Promise.all(
        selectedProducts.map(id =>
          axios.put(
            `${API_URL}/sales/${id}`,
            { discount },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      fetchProducts({ search });
      setSelectedProducts([]);
      setBulkDiscount(""); // svuota solo dopo il successo
    } catch (error) {
      alert("Errore nell'applicazione dello sconto di massa");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div>
      <h2>Gestione Saldi Prodotti</h2>
      <Form.Control
        type="text"
        placeholder="Cerca prodotto..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="mb-3"
      />
      {selectedProducts.length > 0 && (
        <div className="mb-2 d-flex align-items-center gap-2">
          <Form.Label className="me-2 mb-0">Sconto per selezionati:</Form.Label>
          <Form.Control
            type="number"
            min={0}
            max={100}
            placeholder="Percentuale"
            value={bulkDiscount}
            onChange={e => setBulkDiscount(e.target.value)}
            style={{ width: "100px" }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleBulkDiscount(Number(bulkDiscount))}
            disabled={bulkDiscount === "" || bulkLoading}
          >
            {bulkLoading ? "Attendi..." : "Applica"}
          </Button>
        </div>
      )}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                checked={selectedProducts.length === products.length && products.length > 0}
                onChange={e =>
                  setSelectedProducts(
                    e.target.checked ? products.map(p => p._id) : []
                  )
                }
              />
            </th>
            <th>Nome</th>
            <th>Prezzo</th>
            <th>Sconto (%)</th>
            <th>Prezzo Scontato</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedProducts.includes(product._id)}
                  onChange={() => handleSelectProduct(product._id)}
                />
              </td>
              <td>{product.name}</td>
              <td>{product.price} €</td>
              <td className="d-flex align-items-center gap-2">
                <Form.Control
                  type="number"
                  min={0}
                  max={100}
                  value={
                    editingDiscounts[product._id] !== undefined
                      ? editingDiscounts[product._id]
                      : product.discount || 0
                  }
                  onChange={e =>
                    setEditingDiscounts(prev => ({
                      ...prev,
                      [product._id]: e.target.value
                    }))
                  }
                  style={{ width: "80px" }}
                />
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    const newDiscount = Number(editingDiscounts[product._id]);
                    if (
                      editingDiscounts[product._id] !== undefined &&
                      newDiscount !== product.discount
                    ) {
                      handleDiscountChange(product, newDiscount);
                      setEditingDiscounts(prev => {
                        const copy = { ...prev };
                        delete copy[product._id];
                        return copy;
                      });
                    }
                  }}
                  disabled={
                    editingDiscounts[product._id] === undefined ||
                    Number(editingDiscounts[product._id]) === product.discount
                  }
                >
                  Applica
                </Button>
              </td>
              <td>
                {product.salePrice
                  ? product.salePrice.toFixed(2)
                  : (product.price * (1 - (product.discount || 0) / 100)).toFixed(2)
                } €
              </td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(product._id)}
                >
                  Elimina
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        />
        {[...Array(paginationProduct.totalPages || 1)].map((_, idx) => (
          <Pagination.Item
            key={idx + 1}
            active={currentPage === idx + 1}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={currentPage === (paginationProduct.totalPages || 1)}
          onClick={() => setCurrentPage(currentPage + 1)}
        />
      </Pagination>
    </div>
  );
};

export default Sales;