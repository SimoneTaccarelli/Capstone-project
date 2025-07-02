import axios from "axios";
import { useState, useEffect } from "react";
import { useProducts } from "../context/ProductContext";
import { API_URL } from "../config/config.js";
import { Pagination } from "react-bootstrap";
import { useAuth } from "../context/AuthContext.js";


const Sales = () => {
    const { paginationProduct, fetchProducts } = useProducts();
    const [selectedSale, setSelecteedSales] = useState(null); // Stato per la vendita selezionata
    const [Pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalSales: 0,
        salesPerPage: 8,
    });
    const [search, setSearch] = useState("");
    const {userData } = useAuth();


    useEffect(() => {
      fetchProducts({ search });
    }, [search]);

    const products = paginationProduct.products || [];

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    }
    
    const salesPrice = (e) => {
        setDiscount(e.target.value);
        newPrice = (product.price * (1 - discount / 100)).toFixed(2);
    }

    const handleSaleClick = (sale) => {
        setSelecteedSales(sale);
    };

    const createSale = axios.post(`${API_URL}/sales`, {
        Authorization: `Bearer ${userData.token}`,
        productId: selectedSale._id,
        discount: selectedSale.discount,
    })
    .then((response) => {
        console.log("Sale created successfully:", response.data);
        setSelecteedSales(null); // Reset the selected sale after creation
    })
}