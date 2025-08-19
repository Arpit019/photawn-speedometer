import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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
  deliveryCutoff: MetricBucket[];
}

interface ChartsSectionProps {
  metrics: TimeMetrics;
}

const COLORS = {
  distribution: ['hsl(var(--metric-speed))', 'hsl(var(--metric-efficiency))', 'hsl(var(--metric-compliance))'],
  compliance: ['hsl(var(--success))', 'hsl(var(--error))']
};

export const ChartsSection = ({ metrics }: ChartsSectionProps) => {
  // Transform metrics data for charts - create flow data showing processing stages
  const processFlowData = [
    { 
      stage: 'Import', 
      fast: metrics.importCutoff[0]?.count || 0,
      medium: metrics.importCutoff[1]?.count || 0,
      slow: metrics.importCutoff[2]?.count || 0,
      total: (metrics.importCutoff[0]?.count || 0) + (metrics.importCutoff[1]?.count || 0) + (metrics.importCutoff[2]?.count || 0)
    },
    { 
      stage: 'Inventory', 
      fast: metrics.inventoryAssign[0]?.count || 0,
      medium: metrics.inventoryAssign[1]?.count || 0,
      slow: metrics.inventoryAssign[2]?.count || 0,
      total: (metrics.inventoryAssign[0]?.count || 0) + (metrics.inventoryAssign[1]?.count || 0) + (metrics.inventoryAssign[2]?.count || 0)
    },
    { 
      stage: 'Batch/Pick', 
      fast: metrics.batchPick[0]?.count || 0,
      medium: metrics.batchPick[1]?.count || 0,
      slow: metrics.batchPick[2]?.count || 0,
      total: (metrics.batchPick[0]?.count || 0) + (metrics.batchPick[1]?.count || 0) + (metrics.batchPick[2]?.count || 0)
    },
    { 
      stage: 'Label', 
      fast: metrics.labelPrint[0]?.count || 0,
      medium: metrics.labelPrint[1]?.count || 0,
      slow: metrics.labelPrint[2]?.count || 0,
      total: (metrics.labelPrint[0]?.count || 0) + (metrics.labelPrint[1]?.count || 0) + (metrics.labelPrint[2]?.count || 0)
    },
    { 
      stage: 'Pickup', 
      fast: metrics.pickupCutoff[0]?.count || 0,
      medium: metrics.pickupCutoff[1]?.count || 0,
      slow: metrics.pickupCutoff[2]?.count || 0,
      total: (metrics.pickupCutoff[0]?.count || 0) + (metrics.pickupCutoff[1]?.count || 0) + (metrics.pickupCutoff[2]?.count || 0)
    },
    { 
      stage: 'Delivery', 
      fast: metrics.deliveryCutoff[0]?.count || 0,
      medium: metrics.deliveryCutoff[1]?.count || 0,
      slow: metrics.deliveryCutoff[2]?.count || 0,
      total: (metrics.deliveryCutoff[0]?.count || 0) + (metrics.deliveryCutoff[1]?.count || 0) + (metrics.deliveryCutoff[2]?.count || 0)
    }
  ];

  const metricComparisonData = [
    { name: 'Import', fast: metrics.importCutoff[0]?.count || 0, medium: metrics.importCutoff[1]?.count || 0, slow: metrics.importCutoff[2]?.count || 0 },
    { name: 'Inventory', fast: metrics.inventoryAssign[0]?.count || 0, medium: metrics.inventoryAssign[1]?.count || 0, slow: metrics.inventoryAssign[2]?.count || 0 },
    { name: 'Batch/Pick', fast: metrics.batchPick[0]?.count || 0, medium: metrics.batchPick[1]?.count || 0, slow: metrics.batchPick[2]?.count || 0 },
    { name: 'Label', fast: metrics.labelPrint[0]?.count || 0, medium: metrics.labelPrint[1]?.count || 0, slow: metrics.labelPrint[2]?.count || 0 },
    { name: 'Pickup', fast: metrics.pickupCutoff[0]?.count || 0, medium: metrics.pickupCutoff[1]?.count || 0, slow: metrics.pickupCutoff[2]?.count || 0 },
    { name: 'Delivery', fast: metrics.deliveryCutoff[0]?.count || 0, medium: metrics.deliveryCutoff[1]?.count || 0, slow: metrics.deliveryCutoff[2]?.count || 0 }
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground gradient-text">Performance Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="chart-container">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Processing Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processFlowData}>
                <defs>
                  <linearGradient id="fastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="slowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--error))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--error))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="stage" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="fast" 
                  stackId="1" 
                  stroke="hsl(var(--success))" 
                  fill="url(#fastGradient)"
                  strokeWidth={2}
                  name="0-15 mins (Fast)"
                />
                <Area 
                  type="monotone" 
                  dataKey="medium" 
                  stackId="1" 
                  stroke="hsl(var(--warning))" 
                  fill="url(#mediumGradient)"
                  strokeWidth={2}
                  name="15-25 mins (Medium)"
                />
                <Area 
                  type="monotone" 
                  dataKey="slow" 
                  stackId="1" 
                  stroke="hsl(var(--error))" 
                  fill="url(#slowGradient)"
                  strokeWidth={2}
                  name="25+ mins (Slow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Metric Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Bar dataKey="fast" stackId="a" fill="hsl(var(--success))" name="0-15 mins" />
                <Bar dataKey="medium" stackId="a" fill="hsl(var(--warning))" name="15-25 mins" />
                <Bar dataKey="slow" stackId="a" fill="hsl(var(--error))" name="25+ mins" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};