import Order from "../models/Order.js";
import User from "../models/Users.js";
import mongoose from "mongoose";

// Ottieni tutti gli ordini (Admin)
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
}

// Ottieni ordini dell'utente loggato
export async function getUserOrders(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }
    
    const mongoUserId = req.user._id;
    const orders = await Order.find({ user: mongoUserId }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
    
  } catch (error) {
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
    res.status(500).json({ error: "Error fetching order" });
  }
}

// Cerca un ordine tramite ID senza richiedere autenticazione
export async function findOrderById(req, res) {
  try {
    const { orderId } = req.params;
    
    // Verifica che l'ID sia valido
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "ID ordine non valido" });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: "Ordine non trovato" });
    }
    
    // Restituisci solo informazioni non sensibili
    const publicOrder = {
      _id: order._id,
      items: order.items,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount
    };
    
    res.status(200).json(publicOrder);
  } catch (error) {
    res.status(500).json({ error: "Errore durante la ricerca dell'ordine" });
  }
}

// Ottieni gli ultimi ordini pubblici (senza dati sensibili)
export async function getRecentOrders(req, res) {
  try {
    // Limita a 10 ordini recenti
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Restituisci solo informazioni non sensibili
    const publicOrders = orders.map(order => ({
      _id: order._id,
      items: order.items,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount
    }));
    
    res.status(200).json(publicOrders);
  } catch (error) {
    res.status(500).json({ error: "Errore nel recupero degli ordini" });
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
    res.status(500).json({ error: "Error deleting order" });
  }
}