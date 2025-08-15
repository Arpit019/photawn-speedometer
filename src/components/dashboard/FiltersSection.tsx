import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Filter } from "lucide-react";

interface FiltersSectionProps {
  darkstores: string[];
  brands: string[];
  selectedDarkstore: string;
  selectedBrand: string;
  dateRange: { start: string; end: string };
  totalOrders: number;
  onDarkstoreChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClearFilters: () => void;
}

export const FiltersSection = ({
  darkstores,
  brands,
  selectedDarkstore,
  selectedBrand,
  dateRange,
  totalOrders,
  onDarkstoreChange,
  onBrandChange,
  onDateRangeChange,
  onClearFilters
}: FiltersSectionProps) => {
  const hasActiveFilters = selectedDarkstore !== "all" || selectedBrand !== "all" || dateRange.start || dateRange.end;

  return (
    <Card className="p-6 bg-card/50 border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Date Range
          </Label>
          <div className="space-y-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="text-sm"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="text-sm"
            />
          </div>
        </div>

        {/* Dark Store Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Dark Store</Label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onDarkstoreChange("all")}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                selectedDarkstore === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({totalOrders})
            </button>
            {darkstores.map((darkstore) => (
              <button
                key={darkstore}
                onClick={() => onDarkstoreChange(darkstore)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  selectedDarkstore === darkstore 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {darkstore}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Brand</Label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => onBrandChange("all")}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                selectedBrand === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => onBrandChange(brand)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  selectedBrand === brand 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Active Filters</Label>
          <div className="text-sm text-muted-foreground">
            {hasActiveFilters ? (
              <div className="space-y-1">
                {selectedDarkstore !== "all" && (
                  <div>Store: {selectedDarkstore}</div>
                )}
                {selectedBrand !== "all" && (
                  <div>Brand: {selectedBrand}</div>
                )}
                {(dateRange.start || dateRange.end) && (
                  <div>
                    Date: {dateRange.start || 'Start'} to {dateRange.end || 'End'}
                  </div>
                )}
              </div>
            ) : (
              "No filters applied"
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};