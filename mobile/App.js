import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { View, ActivityIndicator, Text } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import ArtworkDetailScreen from './src/screens/ArtworkDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import ArtworkUploadScreen from './src/screens/ArtworkUploadScreen';
import EditArtworkScreen from './src/screens/EditArtworkScreen';
import OfferManagementScreen from './src/screens/OfferManagementScreen';
import MyOffersScreen from './src/screens/MyOffersScreen';
import InteriorVisualizerScreen from './src/screens/InteriorVisualizerScreen';

import colors from './src/theme/colors';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

const AppTheme = { 
  ...DefaultTheme, 
  dark: true, 
  colors: { 
    ...DefaultTheme.colors, 
    background: colors.dark, 
    card: colors.card, 
    text: colors.textPrimary, 
    border: colors.border, 
    primary: colors.primary 
  } 
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = { 
  headerStyle: { backgroundColor: colors.card }, 
  headerTintColor: colors.textPrimary, 
  headerTitleStyle: { fontWeight: '700' }, 
  contentStyle: { backgroundColor: colors.dark } 
};

function HomeStack() {
  return (<Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="InteriorVisualizer" component={InteriorVisualizerScreen} options={{ title: 'Room View' }} />
  </Stack.Navigator>);
}

function CatalogStack() {
  return (<Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="CatalogMain" component={CatalogScreen} options={{ title: 'Catalog' }} />
    <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="InteriorVisualizer" component={InteriorVisualizerScreen} options={{ title: 'Room View' }} />
  </Stack.Navigator>);
}

function CartStack() {
  return (<Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="CartMain" component={CartScreen} options={{ title: 'Cart' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
  </Stack.Navigator>);
}

function ProfileStack() {
  return (<Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'Orders' }} />
    <Stack.Screen name="MyOffers" component={MyOffersScreen} options={{ title: 'My Offers' }} />
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
    <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory' }} />
    <Stack.Screen name="ArtworkUpload" component={ArtworkUploadScreen} options={{ title: 'Upload' }} />
    <Stack.Screen name="EditArtwork" component={EditArtworkScreen} options={{ title: 'Edit Artwork' }} />
    <Stack.Screen name="OfferManagement" component={OfferManagementScreen} options={{ title: 'Offers' }} />
  </Stack.Navigator>);
}

function MainTabs() {
  const { cartCount } = useCart();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 60, paddingBottom: 8 },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarIcon: ({ color, size }) => {
        const icons = { HomeTab: 'home', CatalogTab: 'search', CartTab: 'cart', WishlistTab: 'heart', ProfileTab: 'person' };
        return (<View>
          <Ionicons name={icons[route.name]} size={size} color={color} />
          {route.name === 'CartTab' && cartCount > 0 && (
            <View style={{ position: 'absolute', top: -4, right: -10, backgroundColor: colors.secondary, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{cartCount}</Text>
            </View>
          )}
        </View>);
      },
    })}>
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="CatalogTab" component={CatalogStack} options={{ title: 'Catalog' }} />
      <Tab.Screen name="CartTab" component={CartStack} options={{ title: 'Cart' }} />
      <Tab.Screen name="WishlistTab" component={WishlistScreen} options={{ title: 'Wishlist' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (<Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>);
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, height: 60, paddingBottom: 8 },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarIcon: ({ color, size }) => {
        const icons = { DashboardTab: 'stats-chart', CatalogTab: 'search', InventoryTab: 'list', ProfileTab: 'person' };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="DashboardTab" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="CatalogTab" component={CatalogStack} options={{ title: 'Catalog' }} />
      <Tab.Screen name="InventoryTab" component={InventoryScreen} options={{ title: 'Inventory' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textSecondary, marginTop: 10, fontWeight: '600' }}>Loading Artify...</Text>
    </View>
  );
  return user ? (isAdmin ? <AdminTabs /> : <MainTabs />) : <AuthStack />;
}

import { StripeProvider } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = "pk_test_51TDbUz22ZCvOON3CI146C9CZGl4MM3G2t1m9eKc8pU7JTM3z3etUwrXCMM0wpAa2OAym8n9bHtblwR6yTgg3v3sN00hgLtOI6c";

function App() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  React.useEffect(() => {
    async function hideSplash() {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    }
    hideSplash();
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' }}>
        <Text style={{ color: '#fff' }}>Failed to load fonts: {fontError.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <NavigationContainer theme={AppTheme}>
                  <StatusBar style="dark" />
                  <RootNavigator />
                </NavigationContainer>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </StripeProvider>
      </View>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);

