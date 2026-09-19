import { createContext, useContext, useState, useCallback, useMemo } from "react";

const CartContext = createContext(null);

const emptyCart = { vendorId: null, vendorName: null, items: [] };

export function CartProvider({ children }) {
  const [cart, setCart] = useState(emptyCart);

  // An order can only contain items from one vendor (enforced again on
  // the backend), so adding from a different vendor replaces the cart
  // rather than mixing vendors.
  const addItem = useCallback((vendor, item) => {
    setCart((current) => {
      if (current.vendorId && current.vendorId !== vendor.id) {
        const confirmed = window.confirm(
          `Your cart has items from ${current.vendorName}. Clear it and start a new order from ${vendor.shopName}?`
        );
        if (!confirmed) return current;
        return {
          vendorId: vendor.id,
          vendorName: vendor.shopName,
          items: [{ menuItemId: item.id, name: item.name, price: item.price, quantity: 1, stock: item.stock }],
        };
      }

      const existing = current.items.find((i) => i.menuItemId === item.id);
      const items = existing
        ? current.items.map((i) =>
            i.menuItemId === item.id ? { ...i, quantity: Math.min(i.quantity + 1, item.stock) } : i
          )
        : [
            ...current.items,
            { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, stock: item.stock },
          ];

      return { vendorId: vendor.id, vendorName: vendor.shopName, items };
    });
  }, []);

  const updateQuantity = useCallback((menuItemId, quantity) => {
    setCart((current) => {
      if (quantity <= 0) {
        const items = current.items.filter((i) => i.menuItemId !== menuItemId);
        return items.length === 0 ? emptyCart : { ...current, items };
      }
      return {
        ...current,
        items: current.items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
        ),
      };
    });
  }, []);

  const clearCart = useCallback(() => setCart(emptyCart), []);

  const totalCount = useMemo(() => cart.items.reduce((sum, i) => sum + i.quantity, 0), [cart.items]);
  const totalPrice = useMemo(
    () => cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [cart.items]
  );

  return (
    <CartContext.Provider value={{ ...cart, addItem, updateQuantity, clearCart, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
