import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  BarChart3,
  TrendingDown,
  RotateCcw
} from "lucide-react";

interface QualityMetric {
  range: string;
  count: number;
  orders: any[];
}

interface QualityDashboardProps {
  onMetricClick: (metricType: string, bucketRange: string) => void;
}

export const QualityDashboard = ({ onMetricClick }: QualityDashboardProps) => {
  // Sample quality metrics data - will be replaced with real data from Quality_Metric sheet
  const qualityMetrics = {
    // Total inward SKU metrics
    inwardSku: {
      totalSku: 1245,
      qcPass: 1089,
      qcFail: 156,
      failBreakdown: {
        colorMismatch: 45,
        sizeMismatch: 32,
        damaged: 28,
        missingData: 31,
        expiry: 20
      }
    },
    
    // Inbound FIFO metrics (GRN time to putaway time)
    inboundFifo: [
      { range: '0-30 mins', count: 425, orders: [] },
      { range: '30-50 mins', count: 189, orders: [] },
      { range: '50+ mins', count: 86, orders: [] }
    ],
    
    // Cycle count variation
    cycleCountVariation: [
      { range: 'Excess', count: 67, orders: [] },
      { range: 'Deficient', count: 43, orders: [] },
      { range: 'Short Stock', count: 25, orders: [] }
    ],
    
    // Inventory ageing
    inventoryAgeing: [
      { range: '0-15 days', count: 892, orders: [] },
      { range: '15-25 days', count: 234, orders: [] },
      { range: '25+ days', count: 119, orders: [] }
    ],
    
    // RTO metrics
    rtoMetrics: {
      totalRto: 178,
      breakdown: {
        cancelled: 89,
        rejected: 52,
        defected: 37
      }
    }
  };

  const getMetricColor = (metricType: string, range: string) => {
    const colorMap: any = {
      inboundFifo: {
        '0-30 mins': { bg: 'bg-metric-compliance/20', text: 'text-metric-compliance', border: 'border-metric-compliance/30' },
        '30-50 mins': { bg: 'bg-metric-performance/20', text: 'text-metric-performance', border: 'border-metric-performance/30' },
        '50+ mins': { bg: 'bg-metric-speed/20', text: 'text-metric-speed', border: 'border-metric-speed/30' }
      },
      cycleCountVariation: {
        'Excess': { bg: 'bg-metric-performance/20', text: 'text-metric-performance', border: 'border-metric-performance/30' },
        'Deficient': { bg: 'bg-metric-speed/20', text: 'text-metric-speed', border: 'border-metric-speed/30' },
        'Short Stock': { bg: 'bg-error/20', text: 'text-error', border: 'border-error/30' }
      },
      inventoryAgeing: {
        '0-15 days': { bg: 'bg-metric-compliance/20', text: 'text-metric-compliance', border: 'border-metric-compliance/30' },
        '15-25 days': { bg: 'bg-metric-performance/20', text: 'text-metric-performance', border: 'border-metric-performance/30' },
        '25+ days': { bg: 'bg-metric-speed/20', text: 'text-metric-speed', border: 'border-metric-speed/30' }
      }
    };
    
    return colorMap[metricType]?.[range] || { bg: 'bg-muted/20', text: 'text-muted-foreground', border: 'border-muted/30' };
  };

  return (
    <div className="space-y-8">
      {/* QC Overview Cards */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold gradient-text">Quality Control Overview</h2>
          <p className="text-muted-foreground mt-1">Inward SKU quality metrics and QC pass/fail rates</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-metric-compliance/10">
                  <Package className="w-5 h-5 text-metric-compliance" />
                </div>
                <div>
                  <CardTitle className="text-lg">Total Inward SKU</CardTitle>
                  <p className="text-2xl font-bold text-foreground">{qualityMetrics.inwardSku.totalSku}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-metric-speed/10">
                  <CheckCircle className="w-5 h-5 text-metric-speed" />
                </div>
                <div>
                  <CardTitle className="text-lg">QC Pass</CardTitle>
                  <p className="text-2xl font-bold text-metric-speed">{qualityMetrics.inwardSku.qcPass}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-error/10">
                  <XCircle className="w-5 h-5 text-error" />
                </div>
                <div>
                  <CardTitle className="text-lg">QC Fail</CardTitle>
                  <p className="text-2xl font-bold text-error">{qualityMetrics.inwardSku.qcFail}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-metric-performance/10">
                  <BarChart3 className="w-5 h-5 text-metric-performance" />
                </div>
                <div>
                  <CardTitle className="text-lg">Pass Rate</CardTitle>
                  <p className="text-2xl font-bold text-metric-performance">
                    {Math.round((qualityMetrics.inwardSku.qcPass / qualityMetrics.inwardSku.totalSku) * 100)}%
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* QC Fail Breakdown */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">QC Fail Subcategories</h3>
          <p className="text-muted-foreground mt-1">Breakdown of quality control failures by category</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(qualityMetrics.inwardSku.failBreakdown).map(([category, count]) => (
            <Card key={category} className="metric-card">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground capitalize">
                    {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">{count}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((count / qualityMetrics.inwardSku.qcFail) * 100)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quality Metrics Grid */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Quality Performance Metrics</h3>
          <p className="text-muted-foreground mt-1">FIFO, cycle count, inventory ageing, and RTO metrics</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inbound FIFO */}
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-metric-efficiency/10">
                  <Clock className="w-5 h-5 text-metric-efficiency" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Inbound FIFO</CardTitle>
                  <p className="text-sm text-muted-foreground">GRN time to putaway time</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {qualityMetrics.inboundFifo.map((bucket) => {
                const colors = getMetricColor('inboundFifo', bucket.range);
                const total = qualityMetrics.inboundFifo.reduce((sum, b) => sum + b.count, 0);
                const percentage = total > 0 ? (bucket.count / total) * 100 : 0;
                
                return (
                  <div key={bucket.range} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{bucket.range}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{bucket.count}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-6 px-2 text-xs ${colors.text} ${colors.border}`}
                          onClick={() => onMetricClick('inboundFifo', bucket.range)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                    <div className={`rounded-full p-1 ${colors.bg}`}>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Cycle Count Variation */}
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-metric-performance/10">
                  <AlertTriangle className="w-5 h-5 text-metric-performance" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Cycle Count Variation</CardTitle>
                  <p className="text-sm text-muted-foreground">Stock variance tracking</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {qualityMetrics.cycleCountVariation.map((bucket) => {
                const colors = getMetricColor('cycleCountVariation', bucket.range);
                const total = qualityMetrics.cycleCountVariation.reduce((sum, b) => sum + b.count, 0);
                const percentage = total > 0 ? (bucket.count / total) * 100 : 0;
                
                return (
                  <div key={bucket.range} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{bucket.range}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{bucket.count}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-6 px-2 text-xs ${colors.text} ${colors.border}`}
                          onClick={() => onMetricClick('cycleCountVariation', bucket.range)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                    <div className={`rounded-full p-1 ${colors.bg}`}>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Inventory Ageing */}
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-metric-speed/10">
                  <TrendingDown className="w-5 h-5 text-metric-speed" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Inventory Ageing</CardTitle>
                  <p className="text-sm text-muted-foreground">SKU age distribution</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {qualityMetrics.inventoryAgeing.map((bucket) => {
                const colors = getMetricColor('inventoryAgeing', bucket.range);
                const total = qualityMetrics.inventoryAgeing.reduce((sum, b) => sum + b.count, 0);
                const percentage = total > 0 ? (bucket.count / total) * 100 : 0;
                
                return (
                  <div key={bucket.range} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{bucket.range}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{bucket.count}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-6 px-2 text-xs ${colors.text} ${colors.border}`}
                          onClick={() => onMetricClick('inventoryAgeing', bucket.range)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                    <div className={`rounded-full p-1 ${colors.bg}`}>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* RTO Metrics */}
          <Card className="metric-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-error/10">
                  <RotateCcw className="w-5 h-5 text-error" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">RTO Metrics</CardTitle>
                  <p className="text-sm text-muted-foreground">Return to origin tracking</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {qualityMetrics.rtoMetrics.totalRto} RTO
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {Object.entries(qualityMetrics.rtoMetrics.breakdown).map(([reason, count]) => {
                const total = qualityMetrics.rtoMetrics.totalRto;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={reason} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{reason}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{count}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs text-error border-error/30"
                          onClick={() => onMetricClick('rto', reason)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-full p-1 bg-error/20">
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};