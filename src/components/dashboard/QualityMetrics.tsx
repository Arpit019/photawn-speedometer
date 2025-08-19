import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

interface QualityMetric {
  range: string;
  count: number;
  orders: any[];
}

interface QualityMetricsProps {
  onMetricClick: (metricType: string, bucketRange: string) => void;
}

export const QualityMetrics = ({ onMetricClick }: QualityMetricsProps) => {
  // Sample quality metrics data - this will be replaced with real data from your sheets
  const qualityMetrics = {
    poToGrm: [
      { range: 'Within 2 hours', count: 45, orders: [] },
      { range: '2-4 hours', count: 28, orders: [] },
      { range: '4+ hours', count: 12, orders: [] }
    ],
    grmToInward: [
      { range: 'Same day', count: 52, orders: [] },
      { range: 'Next day', count: 23, orders: [] },
      { range: '2+ days', count: 10, orders: [] }
    ],
    inwardTracking: [
      { range: 'Real-time', count: 58, orders: [] },
      { range: 'Delayed', count: 18, orders: [] },
      { range: 'Missing', count: 9, orders: [] }
    ]
  };

  const metricConfigs = [
    {
      key: 'poToGrm',
      title: 'PO to GRN Processing',
      description: 'Time from Purchase Order to Goods Receipt Note',
      icon: CheckCircle,
      colorClass: 'text-metric-efficiency',
      bgClass: 'bg-metric-efficiency/10'
    },
    {
      key: 'grmToInward',
      title: 'GRN to Inward Processing',
      description: 'Time from Goods Receipt to Inward Processing',
      icon: AlertTriangle,
      colorClass: 'text-metric-performance',
      bgClass: 'bg-metric-performance/10'
    },
    {
      key: 'inwardTracking',
      title: 'Inward Tracking Status',
      description: 'Real-time tracking availability for inward shipments',
      icon: Clock,
      colorClass: 'text-metric-compliance',
      bgClass: 'bg-metric-compliance/10'
    }
  ];

  const getBucketColor = (range: string, metricKey: string) => {
    const isGoodPerformance = (
      (metricKey === 'poToGrm' && range === 'Within 2 hours') ||
      (metricKey === 'grmToInward' && range === 'Same day') ||
      (metricKey === 'inwardTracking' && range === 'Real-time')
    );
    
    const isMediumPerformance = (
      (metricKey === 'poToGrm' && range === '2-4 hours') ||
      (metricKey === 'grmToInward' && range === 'Next day') ||
      (metricKey === 'inwardTracking' && range === 'Delayed')
    );

    if (isGoodPerformance) {
      return { bg: 'bg-metric-compliance/20', text: 'text-metric-compliance', border: 'border-metric-compliance/30' };
    } else if (isMediumPerformance) {
      return { bg: 'bg-metric-performance/20', text: 'text-metric-performance', border: 'border-metric-performance/30' };
    } else {
      return { bg: 'bg-metric-speed/20', text: 'text-metric-speed', border: 'border-metric-speed/30' };
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground gradient-text">Quality Metrics</h2>
          <p className="text-muted-foreground mt-1">PO to GRN to Inward tracking performance</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {metricConfigs.map((config) => {
          const metric = qualityMetrics[config.key as keyof typeof qualityMetrics];
          const totalOrders = metric.reduce((sum, bucket) => sum + bucket.count, 0);
          const Icon = config.icon;

          return (
            <Card key={config.key} className="metric-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgClass}`}>
                    <Icon className={`w-5 h-5 ${config.colorClass}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {config.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {totalOrders} orders
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {metric.map((bucket, index) => {
                  const colors = getBucketColor(bucket.range, config.key);
                  const percentage = totalOrders > 0 ? (bucket.count / totalOrders) * 100 : 0;
                  
                  return (
                    <div key={bucket.range} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {bucket.range}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {bucket.count} orders
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-6 px-2 text-xs ${colors.text} ${colors.border}`}
                            onClick={() => onMetricClick(config.key, bucket.range)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                      <div className={`rounded-full p-1 ${colors.bg}`}>
                        <Progress
                          value={percentage}
                          className="h-2"
                        />
                      </div>
                    </div>
                  );
                })}
                
                {/* Quality Score Indicator */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Quality Score</span>
                    <span className={`text-sm font-semibold ${
                      totalOrders > 0 && metric[0].count / totalOrders > 0.6 
                        ? 'text-metric-compliance' 
                        : metric[0].count / totalOrders > 0.4 
                          ? 'text-metric-performance' 
                          : 'text-metric-speed'
                    }`}>
                      {totalOrders > 0 ? Math.round((metric[0].count / totalOrders) * 100) : 0}%
                    </span>
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