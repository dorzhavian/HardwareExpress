import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { equipmentApi } from '@/services/api';
import { Equipment, ItemCategory } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Equipment categories
 * 
 * Decision: Hardcoded categories list matching backend enum
 * Reason: Backend doesn't have a categories endpoint (uses query params).
 *         Frontend needs this list for filter buttons.
 * 
 * Alternative: Fetch categories from backend
 * Rejected: Backend doesn't have this endpoint. Can be added later if needed.
 */
const equipmentCategories: string[] = [
  'All',
  'Laptops',
  'Monitors',
  'Peripherals',
  'Printers',
  'Components',
  'Storage',
];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setIsLoading(true);
        // Use API with filters instead of client-side filtering
        const category = selectedCategory !== 'All' ? selectedCategory : undefined;
        const search = searchQuery.trim() || undefined;
        const data = await equipmentApi.getAll(category, search);
        setEquipment(data);
        setFilteredEquipment(data);
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
        setEquipment([]);
        setFilteredEquipment([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchEquipment();
    }, searchQuery ? 300 : 0); // 300ms debounce for search

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

  return (
    <MainLayout title="Equipment Catalog">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">
              Browse and add equipment to your order
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Package className="h-3 w-3" />
              {filteredEquipment.length} items
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {equipmentCategories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "transition-all",
                    selectedCategory === category && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No equipment found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEquipment.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
