import express from 'express';
import Order from '../models/Order.js';
import Stripe from 'stripe';
import User from '../models/Users.js';
import mailer from '../helper/mailer.js';

// Funzione di utilità per inviare email di conferma ordine
async function sendOrderEmail(email, orderId) {
  if (!email) return false;
  
  try {
    await mailer.sendMail({
      from: 'Itokonolab@hotmail.com',
      to: email,
      subject: `Conferma Ordine - ItokoNolab`,
      html: `
        <html>
          <head>
            <title>Conferma del tuo ordine su ItokoNolab</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
            <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: #333; margin-top: 0;">Grazie per il tuo ordine!</h2>
                
                <p style="margin-top: 20px; font-size: 16px;">
                  Il tuo ordine è stato ricevuto e verrà elaborato al più presto.
                </p>
                
                <div style="margin: 25px 0; padding: 15px; background-color: #fff; border-radius: 5px; border: 2px solid #28a745;">
                  <p style="margin: 0; font-size: 18px;">ID Ordine:</p>
                  <p style="margin: 10px 0; font-weight: bold; font-size: 24px; color: #28a745;">${orderId}</p>
                  <p style="margin: 5px 0 0; font-size: 14px;">Usa questo ID per tracciare il tuo ordine</p>
                </div>
                
                <p style="margin-top: 20px; font-size: 14px;">
                  Per qualsiasi domanda, contattaci all'indirizzo email:<br>
                  <a href="mailto:support@itokonolab.com" style="color: #28a745;">support@itokonolab.com</a>
                </p>
              </div>
              
              <div style="text-align: center; color: #777; font-size: 12px;">
                <p>&copy; ${new Date().getFullYear()} ItokoNolab. Tutti i diritti riservati.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function PaymentRequest(request, response) {
  try {
    const stripe = new Stripe(process.env.STRIPE_API_SECRET);
    const { items, shippingInfo, userId } = request.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return response.status(400).json({ error: 'Cart is empty or invalid' });
    }
    
    // Trova utente MongoDB da UID Firebase
    let mongoUserId = null;
    if (userId) {
      const user = await User.findOne({ firebaseUid: userId });
      if (user) mongoUserId = user._id;
    }
    
    // Crea ordine nel database
    const order = new Order({
      user: mongoUserId,
      items: items.map(item => ({
        name: item.name,
        price: item.price.toFixed(2),
        quantity: item.quantity,
        imageUrl: Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl,
        product: item._id || item.product
      })),
      shippingAddress: shippingInfo,
      status: 'pending',
      paymentInfo: { paymentStatus: 'pending' },
      totalAmount: items.reduce((total, item) => total + (item.price * item.quantity), 0)
    });
    
    await order.save();
    
    // Invia email di conferma
    await sendOrderEmail(shippingInfo.email || 'simone-taccarelli@hotmail.it', order._id);
    
    // Configurazione Stripe Checkout
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      metadata: { orderId: order._id.toString() },
      success_url: `${request.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${request.headers.origin}/cancel?order_id=${order._id}`,
    };

    if (userId) sessionConfig.client_reference_id = userId;

    const session = await stripe.checkout.sessions.create(sessionConfig);
    response.status(200).json({ id: session.id, orderId: order._id });
  } catch (error) {
    response.status(500).json({ error: 'Internal server error' });
  }
}

// Middleware per il webhook
export const stripeWebhookMiddleware = express.raw({ type: 'application/json' });

// Gestore webhook Stripe
export async function handleStripeWebhook(request, response) {
  try {
    const stripe = new Stripe(process.env.STRIPE_API_SECRET);
    const sig = request.headers['stripe-signature'];
    
    if (!sig) {
      return response.status(400).json({ error: 'Missing stripe-signature header' });
    }
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return response.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
    
    if (event.type === 'checkout.session.completed') {
      try {
        await createOrder(event.data.object);
      } catch (error) {
        return response.status(500).json({ error: 'Failed to process order' });
      }
    }
    
    response.status(200).json({ received: true });
  } catch (error) {
    response.status(500).json({ error: 'Internal server error' });
  }
}

// Verifica stato pagamento
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
      amount: session.amount_total / 100,
      currency: session.currency
    });
  } catch (error) {
    response.status(500).json({ error: 'Error checking payment status' });
  }
}

// Gestione creazione ordine dopo pagamento completato
async function createOrder(session) {
  try {
    const stripe = new Stripe(process.env.STRIPE_API_SECRET);
    const orderId = session.metadata.orderId;
    let order;
    
    // Aggiorna ordine esistente
    if (orderId) {
      order = await Order.findById(orderId);
      if (order) {
        order.paymentInfo = {
          stripeSessionId: session.id,
          paymentStatus: 'completed',
          paymentDate: new Date()
        };
        order.status = 'processing';
        await order.save();
        
        // Invia email di conferma
        const customerEmail = order.email || order.shippingAddress?.email;
        await sendOrderEmail(customerEmail, order._id);
        
        return order;
      }
    }
    
    // Crea nuovo ordine in caso di fallback
    let mongoUserId = null;
    if (session.client_reference_id) {
      const user = await User.findOne({ firebaseUid: session.client_reference_id });
      if (user) mongoUserId = user._id;
    }
    
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    
    order = new Order({
      user: mongoUserId,
      email: session.customer_email,
      items: lineItems.data.map(item => ({
        name: item.description,
        price: item.price.unit_amount / 100,
        quantity: item.quantity
      })),
      shippingAddress: {
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
    
    // Invia email di conferma
    const customerEmail = order.email || order.shippingAddress?.email;
    if (customerEmail) {
      await sendOrderEmail(customerEmail, order._id);
    }
    
    return order;
  } catch (error) {
    throw error;
  }
}


