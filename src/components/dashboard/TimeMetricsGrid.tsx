import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Package, Tag, Truck } from "lucide-react";

interface MetricBucket {
  range: string;
  count: number;
  orders: any[];
}

interface TimeMetrics {
  importCutoff: MetricBucket[];
  inventoryAssign: MetricBucket[];
  batchPick: MetricBucket[];
  labelPrint: MetricBucket[];
  pickupCutoff: MetricBucket[];
}

interface TimeMetricsGridProps {
  metrics: TimeMetrics;
  onMetricClick: (metricType: string, bucketRange: string) => void;
}

export const TimeMetricsGrid = ({ metrics, onMetricClick }: TimeMetricsGridProps) => {
  const metricConfigs = [
    {
      key: 'importCutoff',
      title: 'Import Cutoff Time',
      description: 'Import Time - Created At',
      icon: Download,
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-500/10'
    },
    {
      key: 'inventoryAssign',
      title: 'Inventory Assign Cutoff',
      description: 'Assigned At - Import At',
      icon: Package,
      colorClass: 'text-green-500',
      bgClass: 'bg-green-500/10'
    },
    {
      key: 'batchPick',
      title: 'Batch & Pick Cutoff',
      description: 'Confirmed At - Assigned At',
      icon: Upload,
      colorClass: 'text-yellow-500',
      bgClass: 'bg-yellow-500/10'
    },
    {
      key: 'labelPrint',
      title: 'Label Cutoff Time',
      description: 'Printed At - Confirmed At',
      icon: Tag,
      colorClass: 'text-purple-500',
      bgClass: 'bg-purple-500/10'
    },
    {
      key: 'pickupCutoff',
      title: 'Pickup Cutoff Time',
      description: 'Manifest At - Printed At',
      icon: Truck,
      colorClass: 'text-red-500',
      bgClass: 'bg-red-500/10'
    }
  ];

  const getBucketColor = (range: string): string => {
    switch (range) {
      case '0-15 mins': return 'bg-success text-success-foreground';
      case '15-25 mins': return 'bg-warning text-warning-foreground';
      case '25+ mins': return 'bg-error text-error-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground gradient-text">Time-Based Metrics</h2>
        <Badge variant="outline" className="text-muted-foreground">
          Click any bucket to view detailed orders
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {metricConfigs.map((config, index) => {
          const Icon = config.icon;
          const metricData = metrics[config.key as keyof TimeMetrics];
          
          return (
            <Card 
              key={config.key}
              className="metric-card"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${config.bgClass}`}>
                    <Icon className={`w-5 h-5 ${config.colorClass}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {metricData.reduce((sum, bucket) => sum + bucket.count, 0)} orders
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {config.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {metricData.map((bucket) => (
                  <div 
                    key={bucket.range}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge 
                        className={`${getBucketColor(bucket.range)} px-2 py-1 text-xs font-medium`}
                      >
                        {bucket.range}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {bucket.count} orders
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMetricClick(config.key, bucket.range)}
                      className="text-xs hover:bg-accent/50"
                      disabled={bucket.count === 0}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
                
                {/* Visual progress bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Performance Distribution</span>
                    <span>{metricData.reduce((sum, bucket) => sum + bucket.count, 0)} total</span>
                  </div>
                  <div className="flex w-full h-2 bg-muted rounded-full overflow-hidden">
                    {metricData.map((bucket, i) => {
                      const total = metricData.reduce((sum, b) => sum + b.count, 0);
                      const percentage = total > 0 ? (bucket.count / total) * 100 : 0;
                      const colors = ['bg-success', 'bg-warning', 'bg-error'];
                      
                      return (
                        <div
                          key={i}
                          className={`${colors[i]} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};