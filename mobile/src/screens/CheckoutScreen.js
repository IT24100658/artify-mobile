import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import OrderService from '../services/order.service';
import api from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Dummy Card State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [reservationExpired, setReservationExpired] = useState(false);
  
  // Success state
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  // Keep original cart data for receipt since clearCart clears it
  const [receiptData, setReceiptData] = useState({ items: [], total: 0 });

  const deliveryFee = 500;

  useEffect(() => {
    if (cart.length === 0 && !paymentSuccess) return;
    let interval;
    const initReservation = async () => {
      try {
        const res = await api.post('/reservations/reserve', { items: cart.map(i => {
          let artId = i.id || i._id;
          if (typeof artId === 'object' && artId !== null) artId = artId.id || artId._id;
          if (typeof artId === 'object' && artId !== null) artId = Object.values(artId)[0];
          return { artwork: String(artId), quantity: i.quantity || 1 };
        }) });
        const expiresAt = new Date(res.data.expiresAt).getTime();
        interval = setInterval(() => {
          const now = new Date().getTime();
          const distance = expiresAt - now;
          if (distance <= 0) {
            clearInterval(interval);
            setTimeLeft('00:00');
            setReservationExpired(true);
            api.post('/reservations/cancel').catch(console.error);
            Alert.alert('Hold Expired', 'Your 10-minute hold has expired. Please try again.', [{ text: 'OK', onPress: () => navigation.navigate('CartTab') }]);
          } else {
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
          }
        }, 1000);
      } catch (err) {
        if (err.response?.data?.message) {
          Alert.alert('Reservation Error', err.response.data.message);
        } else {
          console.error(err);
        }
      }
    };
    if (!paymentSuccess) initReservation();
    return () => { if (interval) clearInterval(interval); };
  }, [cart, paymentSuccess]);

  const handlePlaceOrder = async () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) { Alert.alert('Error', 'Phone number must be exactly 10 digits.'); return; }
    if (!address) { Alert.alert('Error', 'Please enter delivery address'); return; }
    if (reservationExpired) { Alert.alert('Error', 'Reservation expired'); return; }
    if (!cardNumber || !expiry || !cvv) { Alert.alert('Error', 'Please enter demo card details.'); return; }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(i => {
          let artId = i.id || i._id;
          if (typeof artId === 'object' && artId !== null) artId = artId.id || artId._id;
          if (typeof artId === 'object' && artId !== null) artId = Object.values(artId)[0];
          return { artwork: String(artId), artworkId: String(artId), quantity: i.quantity || 1, price: i.price };
        }),
        shippingDetails: { address, phoneNumber: phone, paymentMethod: 'Card' },
        deliveryFee,
      };
      
      const res = await OrderService.placeOrder(orderData);
      
      setOrderId(res.data?._id || `ORD-${Date.now()}`);
      setReceiptData({ items: [...cart], total: cartTotal });
      await clearCart();
      
      setPaymentSuccess(true);
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed to place order'); }
    setLoading(false);
  };

  const handleDownloadReceipt = async () => {
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
          <h1 style="color: #6C63FF; text-align: center;">Artify</h1>
          <h2 style="text-align: center;">Payment Receipt</h2>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Customer Name:</strong> ${user?.username || 'Customer'}</p>
          <p><strong>Shipping Address:</strong> ${address}</p>
          <h3 style="margin-top: 30px;">Items Purchased:</h3>
          <ul style="line-height: 1.6;">
            ${receiptData.items.map(i => `<li>${i.title} - Qty: ${i.quantity} x Rs. ${i.price.toFixed(2)}</li>`).join('')}
          </ul>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Subtotal:</strong> Rs. ${receiptData.total.toFixed(2)}</p>
          <p><strong>Delivery Fee:</strong> Rs. ${deliveryFee.toFixed(2)}</p>
          <h3 style="color: #6C63FF; font-size: 24px;"><strong>Total Paid:</strong> Rs. ${(receiptData.total + deliveryFee).toFixed(2)}</h3>
          <p style="text-align: center; margin-top: 60px; color: #888;">Thank you for your purchase!</p>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert('Error', 'Could not generate receipt');
    }
  };

  if (paymentSuccess) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="checkmark-circle" size={100} color={colors.success} />
        <Text style={[s.heading, { marginTop: 20, textAlign: 'center' }]}>Payment Successful!</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: 10, fontSize: 16 }}>
          Thank you for your acquisition. Your order has been securely placed.
        </Text>
        
        <TouchableOpacity style={[s.placeBtn, { width: '100%', marginTop: 40 }]} onPress={handleDownloadReceipt}>
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={s.gradBtn}>
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text style={s.placeBtnText}>Download Receipt</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={[s.placeBtn, { width: '100%', marginTop: 15 }]} onPress={() => navigation.navigate('ProfileTab')}>
          <View style={[s.gradBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[s.placeBtnText, { color: colors.textPrimary }]}>View Orders</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={s.heading}>Finalize Checkout</Text>
        {timeLeft && !reservationExpired && (
          <View style={{ backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
            <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>⏳ {timeLeft}</Text>
          </View>
        )}
      </View>
      
      <View style={s.section}>
        <Text style={s.sectionTitle}><Ionicons name="car" size={18} color={colors.primary} /> Shipping Details</Text>
        <Text style={s.sLabel}>Delivery Address</Text>
        <TextInput style={s.input} value={address} onChangeText={setAddress} placeholder="Enter your address" placeholderTextColor={colors.textMuted} multiline />
        <Text style={s.sLabel}>Active Phone Number</Text>
        <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="10-digit number" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" maxLength={10} />
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}><Ionicons name="card" size={18} color={colors.primary} /> Demo Payment Info</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput style={[s.input, { flex: 1 }]} placeholder="Card Number (Demo)" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={cardNumber} onChangeText={setCardNumber} maxLength={16} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <TextInput style={[s.input, { flex: 1 }]} placeholder="MM/YY" placeholderTextColor={colors.textMuted} value={expiry} onChangeText={setExpiry} maxLength={5} />
          <TextInput style={[s.input, { flex: 1 }]} placeholder="CVV" placeholderTextColor={colors.textMuted} keyboardType="numeric" value={cvv} onChangeText={setCvv} maxLength={3} />
        </View>
      </View>

      <View style={s.summary}>
        <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Order Review</Text>
        {cart.map(i => (
          <View key={i.id} style={s.sumRowItem}>
            <View><Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{i.title}</Text><Text style={{ fontSize: 12, color: colors.textMuted }}>Qty: {i.quantity} × Rs.{i.price}</Text></View>
            <Text style={{ fontWeight: '800', color: colors.textPrimary }}>Rs. {(i.price * i.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={s.sumRow}><Text style={s.sumLabel}>Subtotal</Text><Text style={s.sumVal}>Rs. {cartTotal.toFixed(2)}</Text></View>
        <View style={s.sumRow}><Text style={s.sumLabel}>Delivery Fee</Text><Text style={s.sumVal}>Rs. {deliveryFee.toFixed(2)}</Text></View>
        <View style={[s.sumRow, s.sumTotal]}><Text style={s.sumTotalLabel}>Total</Text><Text style={s.sumTotalVal}>Rs. {(cartTotal + deliveryFee).toFixed(2)}</Text></View>
      </View>

      <TouchableOpacity onPress={handlePlaceOrder} disabled={loading || reservationExpired} style={s.placeBtn}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={s.gradBtn}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.placeBtnText}>{reservationExpired ? 'Hold Expired' : `Pay Rs. ${(cartTotal + deliveryFee).toFixed(2)}`}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark },
  heading: { color: colors.textPrimary, fontSize: 24, fontWeight: '900' },
  section: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  sLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  input: { backgroundColor: colors.inputBg, color: colors.textPrimary, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, fontSize: 15 },
  payOptActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(108,99,255,0.08)', padding: 14, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: colors.primary },
  summary: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  sumRowItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 8 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  sumLabel: { color: colors.textSecondary, fontSize: 14 },
  sumVal: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  sumTotal: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 6 },
  sumTotalLabel: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  sumTotalVal: { color: colors.primary, fontSize: 20, fontWeight: '900' },
  placeBtn: { borderRadius: 14, overflow: 'hidden' },
  gradBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8, borderRadius: 14 },
  placeBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
