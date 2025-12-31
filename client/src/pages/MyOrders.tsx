import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/ui/status-badge';
import { ordersApi } from '@/services/api';
import { Order, OrderStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { 
  ChevronDown, 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'delivered', label: 'Delivered' },
];

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="h-5 w-5 text-warning" />,
  approved: <CheckCircle2 className="h-5 w-5 text-success" />,
  rejected: <XCircle className="h-5 w-5 text-destructive" />,
  ordered: <Package className="h-5 w-5 text-info" />,
  delivered: <Truck className="h-5 w-5 text-primary" />,
};

export default function MyOrders() {
  const { user, hasRole } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const isManager = hasRole(['admin', 'procurement_manager']);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id && !isManager) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Managers see all orders, employees see only their own
        const data = isManager 
          ? await ordersApi.getAll() 
          : await ordersApi.getByUserId(user?.id || '');
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, isManager]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const updated = await ordersApi.updateStatus(orderId, newStatus);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    }
  };

  return (
    <MainLayout title={isManager ? "All Orders" : "My Orders"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">
              {isManager 
                ? 'Manage and review all equipment orders' 
                : 'Track the status of your equipment requests'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {filteredOrders.length} order(s)
            </Badge>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No orders found</h3>
              <p className="text-muted-foreground mt-1">
                {statusFilter === 'all' 
                  ? "You haven't placed any orders yet"
                  : `No orders with status "${statusFilter}"`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Collapsible
                key={order.id}
                open={expandedOrder === order.id}
                onOpenChange={(open) => setExpandedOrder(open ? order.id : null)}
              >
                <Card className="shadow-card overflow-hidden transition-all">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {statusIcons[order.status]}
                          <div>
                            <CardTitle className="text-lg">{order.userName } • {order.department || 'N/A'}</CardTitle>
                            <CardDescription>
                              {isManager && `Order ID: ${order.id} • `}
                              {format(new Date(order.createdAt), 'MMM d, yyyy')}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-foreground">
                              ${order.totalAmount.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} item(s)
                            </p>
                          </div>
                          <StatusBadge status={order.status} />
                          <ChevronDown 
                            className={cn(
                              "h-5 w-5 text-muted-foreground transition-transform",
                              expandedOrder === order.id && "rotate-180"
                            )} 
                          />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="border-t pt-4">
                      <div className="grid gap-6 lg:grid-cols-3">
                        {/* Items */}
                        <div className="lg:col-span-2 space-y-3">
                          <h4 className="font-medium text-foreground">Order Items</h4>
                          {order.items.map((item) => (
                            <div 
                              key={item.equipmentId} 
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                            >
                              <img
                                src={item.equipment.imageUrl}
                                alt={item.equipment.name}
                                className="h-12 w-12 rounded-md object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {item.equipment.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity} × ${item.unitPrice.toLocaleString()}
                                </p>
                              </div>
                              <p className="font-medium text-foreground">
                                ${(item.quantity * item.unitPrice).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-foreground mb-2">Justification</h4>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                              {order.justification}
                            </p>
                          </div>

                          {isManager && order.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(order.id, 'approved')}
                              >
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusChange(order.id, 'rejected')}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
