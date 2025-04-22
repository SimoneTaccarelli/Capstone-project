import express from 'express';
import Order from '../models/Order.js';
import Stripe from 'stripe';
import e from 'express';
import User from '../models/Users.js';  // Aggiungi questa importazione

export async function PaymentRequest(request, response) {
  try {
    console.log("Received checkout request", request.body);
    const stripe = new Stripe(process.env.STRIPE_API_SECRET);
    
    const { items, shippingInfo, userId } = request.body;
    
    // Aggiungi validazione
    if (!items || !Array.isArray(items) || items.length === 0) {
      return response.status(400).json({ error: 'Cart is empty or invalid' });
    }
    
    console.log("Items:", items);
    
    // Prepara gli items per lo schema Order
    const orderItems = items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        // Usa solo il primo URL se imageUrl è un array
        imageUrl: Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl,
        // Aggiungi il product field (usando l'_id originale come riferimento)
        product: item._id || item.product
    }));

    // IMPORTANTE: Trova l'utente MongoDB corrispondente all'UID Firebase
    let mongoUserId = null;
    if (userId) {
      const user = await User.findOne({ firebaseUid: userId });
      if (user) {
        mongoUserId = user._id;
      }
    }
    
    // Crea un ordine preliminare con l'ID MongoDB
    const order = new Order({
        user: mongoUserId,  // Usa l'ObjectId di MongoDB invece dell'UID Firebase
        items: orderItems,
        shippingAddress: shippingInfo,
        status: 'pending',
        paymentInfo: { paymentStatus: 'pending' },
        totalAmount: items.reduce((total, item) => total + (item.price * item.quantity), 0)
    });
    
    await order.save();
    
    const line_items = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          images: item.imageUrl ? [item.imageUrl] : [], // Passa un array semplice
        },
        unit_amount: Math.round(item.price * 100), // Usa Math.round per evitare problemi di precisione
      },
      quantity: item.quantity,
    }));
    
    // Crea la configurazione della sessione
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      metadata: { orderId: order._id.toString() },
      // Rimuovi client_reference_id dall'oggetto di base
      success_url: `${request.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${request.headers.origin}/cancel?order_id=${order._id}`,
    };

    // Aggiungi client_reference_id solo se userId esiste
    if (userId) {
      sessionConfig.client_reference_id = userId;
    }

    // Crea la sessione
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    response.status(200).json({ id: session.id, orderId: order._id });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}

// Middleware per il webhook di Stripe
export const stripeWebhookMiddleware = express.raw({ type: 'application/json' });

// Controller per il webhook di Stripe
export async function handleStripeWebhook(request, response) {
    try {
        const stripe = new Stripe(process.env.STRIPE_API_SECRET);
        const sig = request.headers['stripe-signature'];
        
        if (!sig) {
            return response.status(400).json({ error: 'Missing stripe-signature header' });
        }
        
        // Verifica la firma del webhook
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                request.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error(`Webhook signature verification failed:`, err.message);
            return response.status(400).json({ error: `Webhook Error: ${err.message}` });
        }
        
        // Gestisci diversi tipi di eventi
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                try {
                    const order = await createOrder(session);
                    console.log('Order created successfully:', order._id);
                } catch (error) {
                    console.error('Failed to create order:', error);
                }
                break;
            // Puoi aggiungere altri casi per diversi tipi di eventi
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        
        response.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        response.status(500).json({ error: 'Internal server error processing webhook' });
    }
}

// Controller per verificare lo stato del pagamento
export async function checkPaymentStatus(request, response) {
    try {
        const stripe = new Stripe(process.env.STRIPE_API_SECRET);
        const { sessionId } = request.params;
        
        if (!sessionId) {
            return response.status(400).json({ error: 'Session ID is required' });
        }
        
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        response.status(200).json({ 
            status: session.payment_status,
            customer: session.customer,
            amount: session.amount_total / 100, // Convert from cents to euros
            currency: session.currency
        });
    } catch (error) {
        console.error('Error checking payment status:', error);
        response.status(500).json({ error: 'Error checking payment status' });
    }
}

async function createOrder(session) {
  try {
    const stripe = new Stripe(process.env.STRIPE_API_SECRET);
    
    // 1. Recupera i metadati dalla sessione (se hai inviato l'ordineId come metadata)
    const orderId = session.metadata.orderId;
    
    if (orderId) {
      // 2a. Se l'ordine esiste già (creato durante il checkout), aggiornalo
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentInfo.stripeSessionId = session.id;
        order.paymentInfo.paymentStatus = 'completed';
        order.paymentInfo.paymentDate = new Date();
        order.status = 'processing';
        await order.save();
        return order;
      }
    }
    
    // 2b. Altrimenti, crea un nuovo ordine
    // Nota: in questo caso avrai meno informazioni disponibili
    let mongoUserId = null;
    if (session.client_reference_id) {
      const user = await User.findOne({ firebaseUid: session.client_reference_id });
      if (user) {
        mongoUserId = user._id;
      }
    }
    
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    
    const order = new Order({
      user: mongoUserId,  // Usa l'ID MongoDB
      email : session.customer_email, // Se hai passato l'email
      items: lineItems.data.map(item => ({
        name: item.description,
        price: item.price.unit_amount / 100,
        quantity: item.quantity
      })),
      shippingAddress: {
        // Puoi recuperare l'indirizzo da session.shipping se configurato in Stripe
        
        fullName: session.shipping?.name || 'Cliente',
        email: session.customer_email || '',
        address: session.shipping?.address?.line1 || '',
        city: session.shipping?.address?.city || '',
        postalCode: session.shipping?.address?.postal_code || '',
        country: session.shipping?.address?.country || ''
      },
      paymentInfo: {
        stripeSessionId: session.id,
        paymentStatus: 'completed',
        paymentDate: new Date()
      },
      totalAmount: session.amount_total / 100,
      status: 'processing'
    });
    
    await order.save();
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}


