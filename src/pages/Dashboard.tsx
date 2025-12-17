import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { dashboardApi, ordersApi } from '@/services/api';
import { DashboardStats, Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp,
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentOrders(5),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const budgetPercentage = stats 
    ? Math.round((stats.totalSpent / stats.monthlyBudget) * 100) 
    : 0;

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-xl gradient-hero p-6 text-primary-foreground">
          <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p className="mt-1 text-primary-foreground/80">
            Here's an overview of your equipment ordering activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders ?? '-'}
            icon={<ClipboardList className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Pending Approval"
            value={stats?.pendingOrders ?? '-'}
            icon={<Clock className="h-6 w-6" />}
            description="Awaiting review"
          />
          <StatCard
            title="Approved Orders"
            value={stats?.approvedOrders ?? '-'}
            icon={<CheckCircle2 className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Spent"
            value={stats ? `$${stats.totalSpent.toLocaleString()}` : '-'}
            icon={<DollarSign className="h-6 w-6" />}
            description="This fiscal year"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Budget Progress */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Budget
              </CardTitle>
              <CardDescription>
                Department spending vs. allocated budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      ${stats?.totalSpent.toLocaleString() ?? '0'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      of ${stats?.monthlyBudget.toLocaleString() ?? '0'} budget
                    </p>
                  </div>
                  <span className={`text-2xl font-bold ${
                    budgetPercentage > 80 ? 'text-warning' : 'text-success'
                  }`}>
                    {budgetPercentage}%
                  </span>
                </div>
                <Progress 
                  value={budgetPercentage} 
                  className="h-3"
                />
                <p className="text-sm text-muted-foreground">
                  {budgetPercentage > 80 
                    ? '⚠️ Approaching budget limit' 
                    : '✓ Within budget allowance'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest equipment requests</CardDescription>
              </div>
              <Link to="/my-orders">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {order.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} item(s) • {format(new Date(order.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        ${order.totalAmount.toLocaleString()}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link to="/equipment">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                  <span className="font-semibold">Browse Equipment</span>
                  <span className="text-xs text-muted-foreground text-left">
                    Explore available computer equipment
                  </span>
                </Button>
              </Link>
              <Link to="/create-order">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                  <span className="font-semibold">Create New Order</span>
                  <span className="text-xs text-muted-foreground text-left">
                    Submit a new equipment request
                  </span>
                </Button>
              </Link>
              <Link to="/my-orders">
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-start gap-2">
                  <span className="font-semibold">Track Orders</span>
                  <span className="text-xs text-muted-foreground text-left">
                    View status of your requests
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
