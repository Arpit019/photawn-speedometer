import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Calendar, Clock, Store, Package } from "lucide-react";
import { format } from "date-fns";

interface OrderData {
  id: string;
  darkstoreName: string;
  brandName: string;
  createdAt: Date;
  importAt: Date;
  assignedAt: Date;
  confirmedAt: Date;
  printedAt: Date;
  manifestAt: Date;
  importCutoff: number;
  inventoryAssignCutoff: number;
  batchPickCutoff: number;
  labelCutoff: number;
  pickupCutoff: number;
}

interface OrderDetailsViewProps {
  orders: OrderData[];
  metricType: string;
  bucketRange: string;
  onBack: () => void;
  showBackButton?: boolean;
}

export const OrderDetailsView = ({ orders, metricType, bucketRange, onBack, showBackButton = true }: OrderDetailsViewProps) => {
  const getMetricTitle = (type: string): string => {
    const titles = {
      importCutoff: 'Import Cutoff Time',
      inventoryAssign: 'Inventory Assign Cutoff',
      batchPick: 'Batch & Pick Cutoff',
      labelPrint: 'Label Cutoff Time',
      pickupCutoff: 'Pickup Cutoff Time'
    };
    return titles[type as keyof typeof titles] || type;
  };

  const getMetricValue = (order: OrderData, type: string): number => {
    const values = {
      importCutoff: order.importCutoff,
      inventoryAssign: order.inventoryAssignCutoff,
      batchPick: order.batchPickCutoff,
      labelPrint: order.labelCutoff,
      pickupCutoff: order.pickupCutoff
    };
    return values[type as keyof typeof values] || 0;
  };

  const getBucketColor = (range: string): string => {
    switch (range) {
      case '0-15 mins': return 'bg-success text-success-foreground';
      case '15-25 mins': return 'bg-warning text-warning-foreground';
      case '25+ mins': return 'bg-error text-error-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Darkstore', 'Brand', 'Created At', 'Import At', 'Assigned At', 'Confirmed At', 'Printed At', 'Manifest At', 'Metric Value (mins)'];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.id,
        order.darkstoreName,
        order.brandName,
        format(order.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        format(order.importAt, 'yyyy-MM-dd HH:mm:ss'),
        format(order.assignedAt, 'yyyy-MM-dd HH:mm:ss'),
        format(order.confirmedAt, 'yyyy-MM-dd HH:mm:ss'),
        format(order.printedAt, 'yyyy-MM-dd HH:mm:ss'),
        format(order.manifestAt, 'yyyy-MM-dd HH:mm:ss'),
        getMetricValue(order, metricType)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metricType}_${bucketRange.replace(/\s+/g, '_')}_orders.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="hover:bg-accent/50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {metricType === 'all' ? 'All Orders' : `${getMetricTitle(metricType)} - ${bucketRange}`}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {metricType === 'all' 
                    ? `Showing ${orders.length} total orders` 
                    : `Showing ${orders.length} orders in this time bucket`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {bucketRange !== 'all' && (
                <Badge className={`${getBucketColor(bucketRange)} px-3 py-1`}>
                  {bucketRange}
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                className="hover:bg-accent/50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold text-foreground">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Time</p>
                <p className="text-xl font-bold text-foreground">
                  {orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + getMetricValue(o, metricType), 0) / orders.length) : 0}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Store className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Darkstores</p>
                <p className="text-xl font-bold text-foreground">
                  {new Set(orders.map(o => o.darkstoreName)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-error" />
              <div>
                <p className="text-sm text-muted-foreground">Brands</p>
                <p className="text-xl font-bold text-foreground">
                  {new Set(orders.map(o => o.brandName)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="metric-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Darkstore</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Import At</TableHead>
                  <TableHead>Time ({metricType})</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>{order.darkstoreName}</TableCell>
                    <TableCell>{order.brandName}</TableCell>
                    <TableCell className="text-sm">
                      {format(order.createdAt, 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(order.importAt, 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {getMetricValue(order, metricType)}m
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBucketColor(bucketRange)}>
                        {bucketRange}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found in this time bucket</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};