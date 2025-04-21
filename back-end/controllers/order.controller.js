import Order from "../models/Order.js";
import User from "../models/Users.js";  // Usa Users (plurale)
import mongoose from "mongoose";

// Ottieni tutti gli ordini (Admin)
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
}

// Ottieni ordini dell'utente loggato - versione robusta
export async function getUserOrders(req, res) {
  try {
    console.log("req.user:", req.user);
    if (!req.user) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    // MODIFICA: Usa direttamente l'_id dell'utente già presente in req.user
    const mongoUserId = req.user._id;
    console.log("ID MongoDB dell'utente:", mongoUserId);
    
    // Cerca gli ordini direttamente con l'ID MongoDB
    const orders = await Order.find({ user: mongoUserId }).sort({ createdAt: -1 });
    console.log(`Trovati ${orders.length} ordini per l'utente`);
    return res.status(200).json(orders);
    
  } catch (error) {
    console.error("Errore completo:", error);
    res.status(500).json({ error: "Errore nel recupero degli ordini: " + error.message });
  }
}

// Ottieni un ordine specifico per ID
export async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Verifica che l'utente sia il proprietario o un admin
    if (order.user.toString() !== req.user.uid && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to access this order" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Error fetching order" });
  }
}

// Ottieni un ordine tramite link pubblico (ad es. per condividere)
export async function getPublicOrder(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Restituisci solo informazioni non sensibili
    const publicOrder = {
      items: order.items,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount
    };
    
    res.status(200).json(publicOrder);
  } catch (error) {
    console.error("Error fetching public order:", error);
    res.status(500).json({ error: "Error fetching order" });
  }
}

// Aggiorna lo stato di un ordine (Admin)
export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    // Verifica che lo stato sia valido
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Error updating order status" });
  }
}

// Elimina un ordine (Admin)
export async function deleteOrder(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Error deleting order" });
  }
}