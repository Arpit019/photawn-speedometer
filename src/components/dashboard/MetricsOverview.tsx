import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, Target, Zap } from "lucide-react";

interface MetricsOverviewProps {
  summary: {
    totalOrders: number;
    avgImportTime: number;
    avgTotalTime: number;
    onTimeRate: number;
  };
}

export const MetricsOverview = ({ summary }: MetricsOverviewProps) => {
  const summaryCards = [
    {
      title: "Total Orders",
      value: summary.totalOrders.toLocaleString(),
      icon: TrendingUp,
      colorClass: "text-metric-speed",
      bgClass: "bg-metric-speed/10",
      trend: "+12% from last week"
    },
    {
      title: "Avg Import Time",
      value: `${summary.avgImportTime}m`,
      icon: Clock,
      colorClass: "text-metric-efficiency",
      bgClass: "bg-metric-efficiency/10",
      trend: "-3m from target"
    },
    {
      title: "Avg Total Time",
      value: `${summary.avgTotalTime}m`,
      icon: Zap,
      colorClass: "text-metric-performance",
      bgClass: "bg-metric-performance/10",
      trend: "Within SLA"
    },
    {
      title: "On-Time Rate",
      value: `${summary.onTimeRate}%`,
      icon: Target,
      colorClass: "text-metric-compliance",
      bgClass: "bg-metric-compliance/10",
      trend: "+5% improvement"
    }
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground gradient-text">Performance Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.title}
              className="metric-card hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgClass}`}>
                  <Icon className={`w-4 h-4 ${card.colorClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {card.value}
                </div>
                <div className="text-xs text-muted-foreground flex items-center mt-2">
                  <span>{card.trend}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};