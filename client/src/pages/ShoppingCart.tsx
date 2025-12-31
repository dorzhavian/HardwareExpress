import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ordersApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart as ShoppingCartIcon, Trash2, Plus, Minus, Send, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShoppingCart() {
  const { items, removeItem, updateQuantity, clearCart, totalAmount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your order before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!justification.trim()) {
      toast({
        title: "Justification required",
        description: "Please provide a justification for your order.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform cart items to API format
      const orderItems = items.map(item => ({
        equipmentId: item.equipmentId,
        quantity: item.quantity,
      }));

      await ordersApi.create({
        userId: user?.id || '',
        items: orderItems,
        justification,
      });

      toast({
        title: "Order submitted",
        description: "Your order has been submitted for approval.",
      });

      clearCart();
      navigate('/my-orders');
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout title="Shopping Cart">
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <ShoppingCartIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Your cart is empty</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Browse our equipment catalog and add items to create an order.
            </p>
            <Link to="/equipment">
              <Button className="mt-6">
                <Package className="mr-2 h-4 w-4" />
                Browse Equipment
              </Button>
            </Link>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Shopping Cart">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-5 w-5 text-primary" />
                  Order Items
                </CardTitle>
                <CardDescription>
                  Review and adjust quantities for your order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.equipmentId} className="flex gap-4 p-4 rounded-lg border bg-card">
                    <img
                      src={item.equipment.imageUrl}
                      alt={item.equipment.name}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {item.equipment.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.equipment.category}
                      </p>
                      <p className="text-sm font-medium text-primary mt-1">
                        ${item.unitPrice.toLocaleString()} each
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.equipmentId)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.equipmentId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.equipmentId, parseInt(e.target.value) || 1)}
                          className="h-8 w-16 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.equipmentId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        ${(item.unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to="/equipment">
                  <Button type="button" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add More Items
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive"
                >
                  Clear Cart
                </Button>
              </CardFooter>
            </Card>

            {/* Justification */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Order Justification</CardTitle>
                <CardDescription>
                  Explain why this equipment is needed for approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="justification">Business Justification *</Label>
                  <Textarea
                    id="justification"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Describe why this equipment is required, what project or purpose it will serve..."
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-card sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span className="text-foreground">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${totalAmount.toLocaleString()}</span>
                </div>

                <Separator />

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Requestor:</strong> {user?.name}</p>
                  <p><strong>Department:</strong> {user?.department || 'N/A'}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Order
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </MainLayout>
  );
}
