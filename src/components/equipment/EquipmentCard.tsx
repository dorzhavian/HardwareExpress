import { Equipment } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface EquipmentCardProps {
  equipment: Equipment;
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const { addItem, items } = useCart();
  const { toast } = useToast();

  const isInCart = items.some(item => item.equipmentId === equipment.id);

  const handleAddToCart = () => {
    addItem(equipment);
    toast({
      title: "Added to cart",
      description: `${equipment.name} has been added to your order.`,
    });
  };

  return (
    <Card className="group overflow-hidden shadow-card transition-all hover:shadow-lg animate-scale-in">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={equipment.imageUrl}
          alt={equipment.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="text-xs">
            {equipment.category}
          </Badge>
        </div>
        {!equipment.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1">{equipment.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{equipment.description}</p>
        <p className="mt-2 text-xs text-muted-foreground">{equipment.specifications}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ${equipment.unitPrice.toLocaleString()}
          </span>
          {equipment.inStock && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              {equipment.stockQuantity} in stock
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!equipment.inStock}
          variant={isInCart ? "secondary" : "default"}
          className="w-full"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isInCart ? 'Add Another' : 'Add to Order'}
        </Button>
      </CardFooter>
    </Card>
  );
}
