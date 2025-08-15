import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle, Zap } from "lucide-react";

interface MetricsData {
  totalOrders: number;
  avgProcessingTime: number;
  complianceRate: number;
  efficiencyScore: number;
}

interface MetricsGridProps {
  metrics: MetricsData;
}

export const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  const metricCards = [
    {
      title: "Total Orders",
      value: metrics.totalOrders.toLocaleString(),
      icon: TrendingUp,
      colorClass: "text-metric-speed",
      bgClass: "bg-metric-speed/10"
    },
    {
      title: "Avg Processing Time",
      value: `${metrics.avgProcessingTime}m`,
      icon: Clock,
      colorClass: "text-metric-efficiency",
      bgClass: "bg-metric-efficiency/10"
    },
    {
      title: "Compliance Rate",
      value: `${metrics.complianceRate}%`,
      icon: CheckCircle,
      colorClass: "text-metric-compliance",
      bgClass: "bg-metric-compliance/10"
    },
    {
      title: "Efficiency Score",
      value: `${metrics.efficiencyScore}%`,
      icon: Zap,
      colorClass: "text-metric-performance",
      bgClass: "bg-metric-performance/10"
    }
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">Speed Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card 
              key={metric.title}
              className="metric-card hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgClass}`}>
                  <Icon className={`w-4 h-4 ${metric.colorClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {metric.value}
                </div>
                <div className="text-xs text-muted-foreground flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 mr-1 text-success" />
                  <span>Real-time data</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};