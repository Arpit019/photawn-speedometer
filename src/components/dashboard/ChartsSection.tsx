import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface ChartsSectionProps {
  metrics: TimeMetrics;
}

const COLORS = {
  distribution: ['hsl(var(--metric-speed))', 'hsl(var(--metric-efficiency))', 'hsl(var(--metric-compliance))'],
  compliance: ['hsl(var(--success))', 'hsl(var(--error))']
};

export const ChartsSection = ({ metrics }: ChartsSectionProps) => {
  // Transform metrics data for charts
  const timeDistributionData = [
    { name: '0-15 mins', value: Object.values(metrics).reduce((sum, metric) => sum + (metric[0]?.count || 0), 0) },
    { name: '15-25 mins', value: Object.values(metrics).reduce((sum, metric) => sum + (metric[1]?.count || 0), 0) },
    { name: '25+ mins', value: Object.values(metrics).reduce((sum, metric) => sum + (metric[2]?.count || 0), 0) }
  ];

  const metricComparisonData = [
    { name: 'Import', fast: metrics.importCutoff[0]?.count || 0, medium: metrics.importCutoff[1]?.count || 0, slow: metrics.importCutoff[2]?.count || 0 },
    { name: 'Inventory', fast: metrics.inventoryAssign[0]?.count || 0, medium: metrics.inventoryAssign[1]?.count || 0, slow: metrics.inventoryAssign[2]?.count || 0 },
    { name: 'Batch/Pick', fast: metrics.batchPick[0]?.count || 0, medium: metrics.batchPick[1]?.count || 0, slow: metrics.batchPick[2]?.count || 0 },
    { name: 'Label', fast: metrics.labelPrint[0]?.count || 0, medium: metrics.labelPrint[1]?.count || 0, slow: metrics.labelPrint[2]?.count || 0 },
    { name: 'Pickup', fast: metrics.pickupCutoff[0]?.count || 0, medium: metrics.pickupCutoff[1]?.count || 0, slow: metrics.pickupCutoff[2]?.count || 0 }
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground gradient-text">Performance Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="chart-container">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Overall Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={timeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {timeDistributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS.distribution[index % COLORS.distribution.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--card-border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
              </PieChart>
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