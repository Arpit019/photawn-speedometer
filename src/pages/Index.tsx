import { useState, useEffect } from "react";
import Papa from "papaparse";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { MetricsOverview } from "@/components/dashboard/MetricsOverview";
import { TimeMetricsGrid } from "@/components/dashboard/TimeMetricsGrid";
import { OrderDetailsView } from "@/components/dashboard/OrderDetailsView";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { SettingsModal } from "@/components/dashboard/SettingsModal";
import { FiltersSection } from "@/components/dashboard/FiltersSection";
import { useToast } from "@/hooks/use-toast";

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
  importCutoff: number; // minutes
  inventoryAssignCutoff: number; // minutes
  batchPickCutoff: number; // minutes
  labelCutoff: number; // minutes
  pickupCutoff: number; // minutes
}

interface MetricBucket {
  range: string;
  count: number;
  orders: OrderData[];
}

interface TimeMetrics {
  importCutoff: MetricBucket[];
  inventoryAssign: MetricBucket[];
  batchPick: MetricBucket[];
  labelPrint: MetricBucket[];
  pickupCutoff: MetricBucket[];
}

interface DashboardData {
  orders: OrderData[];
  metrics: TimeMetrics;
  summary: {
    totalOrders: number;
    avgImportTime: number;
    avgTotalTime: number;
    onTimeRate: number;
  };
}

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    orders: [],
    metrics: {
      importCutoff: [],
      inventoryAssign: [],
      batchPick: [],
      labelPrint: [],
      pickupCutoff: []
    },
    summary: {
      totalOrders: 0,
      avgImportTime: 0,
      avgTotalTime: 0,
      onTimeRate: 0
    }
  });
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sheetId, setSheetId] = useState("1oyCjFS754qAW88vpEcqWeR_avTgwv3FWvVV66GJNqI4");
  const [selectedDarkstore, setSelectedDarkstore] = useState<string>("all");
  const [darkstores, setDarkstores] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [brands, setBrands] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const { toast } = useToast();

  const connectToSheet = async (newSheetId?: string) => {
    try {
      const targetSheetId = newSheetId || sheetId;
      setIsConnected(false);
      
      console.log('Connecting to Google Sheets with ID:', targetSheetId);
      
      // Use the direct CSV export URL for Google Sheets
      const sheetName = 'speed_metric_data';
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${targetSheetId}/export?format=csv&gid=0`,
        {
          method: 'GET',
          headers: {
            'Accept': 'text/csv',
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch from Google Sheets:', response.status, response.statusText);
        throw new Error(`Failed to connect to Google Sheets. Status: ${response.status}. Please check the Sheet ID and ensure the sheet is publicly accessible.`);
      }

      const csvText = await response.text();
      console.log('CSV data received:', csvText.substring(0, 200) + '...');
      
      if (!csvText || csvText.trim().length === 0) {
        throw new Error('No data received from Google Sheets. Please check if the sheet contains data.');
      }
      
      const processedData = processSheetData(csvText);
      console.log('Processed data:', processedData);
      
      setDashboardData(processedData);
      
      // Extract unique darkstore names and brands for filtering
      const uniqueDarkstores = [...new Set(processedData.orders.map(order => order.darkstoreName))].sort();
      const uniqueBrands = [...new Set(processedData.orders.map(order => order.brandName))].sort();
      setDarkstores(uniqueDarkstores);
      setBrands(uniqueBrands);

      setIsConnected(true);
      setLastUpdate(new Date());
      
      toast({
        title: "Connected Successfully",
        description: `Dashboard updated with ${processedData.orders.length} orders from Google Sheets.`,
      });
      
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const processSheetData = (csvText: string): DashboardData => {
    try {
      // Parse CSV using Papa Parse
      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });

      if (parseResult.errors.length > 0) {
        console.warn('CSV parsing warnings:', parseResult.errors);
      }

      const rawData = parseResult.data as any[];
      
      // Process each row into OrderData format
      const processedOrders: OrderData[] = rawData
        .filter(row => row['Created At'] && row['Import At']) // Filter out incomplete rows
        .map((row, index) => {
          // Parse dates - handle multiple possible formats
          const parseDate = (dateStr: string): Date => {
            if (!dateStr || dateStr.trim() === '') return new Date();
            
            // Try multiple date formats
            const formats = [
              // ISO format
              () => new Date(dateStr),
              // MM/DD/YYYY HH:mm:ss
              () => new Date(dateStr.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, '$3-$1-$2')),
              // DD/MM/YYYY HH:mm:ss
              () => {
                const parts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(.*)/) || [];
                if (parts.length >= 4) {
                  const [, day, month, year, time] = parts;
                  return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${time || '00:00:00'}`);
                }
                return new Date(dateStr);
              }
            ];
            
            for (const format of formats) {
              try {
                const date = format();
                if (!isNaN(date.getTime())) return date;
              } catch (e) {
                continue;
              }
            }
            
            console.warn(`Could not parse date: ${dateStr}`);
            return new Date();
          };

          const createdAt = parseDate(row['Created At'] || '');
          const importAt = parseDate(row['Import At'] || '');
          const assignedAt = parseDate(row['Assigned At'] || '');
          const confirmedAt = parseDate(row['Confirmed At'] || '');
          const printedAt = parseDate(row['Printed At'] || '');
          const manifestAt = parseDate(row['Manifest At'] || '');

          // Calculate time differences in minutes
          const importCutoff = Math.max(0, Math.round((importAt.getTime() - createdAt.getTime()) / (1000 * 60)));
          const inventoryAssignCutoff = Math.max(0, Math.round((assignedAt.getTime() - importAt.getTime()) / (1000 * 60)));
          const batchPickCutoff = Math.max(0, Math.round((confirmedAt.getTime() - assignedAt.getTime()) / (1000 * 60)));
          const labelCutoff = Math.max(0, Math.round((printedAt.getTime() - confirmedAt.getTime()) / (1000 * 60)));
          const pickupCutoff = Math.max(0, Math.round((manifestAt.getTime() - printedAt.getTime()) / (1000 * 60)));

          return {
            id: row['Order ID'] || row['ID'] || `ORD-${String(index + 1).padStart(4, '0')}`,
            darkstoreName: row['Darkstore Name'] || 'Unknown Store',
            brandName: row['Brand Name'] || 'Unknown Brand',
            createdAt,
            importAt,
            assignedAt,
            confirmedAt,
            printedAt,
            manifestAt,
            importCutoff,
            inventoryAssignCutoff,
            batchPickCutoff,
            labelCutoff,
            pickupCutoff
          };
        });

    const categorizeBucket = (time: number): string => {
      if (time <= 15) return '0-15 mins';
      if (time <= 25) return '15-25 mins';
      return '25+ mins';
    };

    const createMetricBuckets = (orders: OrderData[], metricKey: keyof Pick<OrderData, 'importCutoff' | 'inventoryAssignCutoff' | 'batchPickCutoff' | 'labelCutoff' | 'pickupCutoff'>): MetricBucket[] => {
      const buckets = ['0-15 mins', '15-25 mins', '25+ mins'];
      return buckets.map(range => ({
        range,
        count: orders.filter(order => categorizeBucket(order[metricKey] as number) === range).length,
        orders: orders.filter(order => categorizeBucket(order[metricKey] as number) === range)
      }));
    };

      return {
        orders: processedOrders,
        metrics: {
          importCutoff: createMetricBuckets(processedOrders, 'importCutoff'),
          inventoryAssign: createMetricBuckets(processedOrders, 'inventoryAssignCutoff'),
          batchPick: createMetricBuckets(processedOrders, 'batchPickCutoff'),
          labelPrint: createMetricBuckets(processedOrders, 'labelCutoff'),
          pickupCutoff: createMetricBuckets(processedOrders, 'pickupCutoff')
        },
        summary: {
          totalOrders: processedOrders.length,
          avgImportTime: processedOrders.length > 0 ? Math.round(processedOrders.reduce((sum, o) => sum + o.importCutoff, 0) / processedOrders.length) : 0,
          avgTotalTime: processedOrders.length > 0 ? Math.round(processedOrders.reduce((sum, o) => sum + (o.manifestAt.getTime() - o.createdAt.getTime()) / (1000 * 60), 0) / processedOrders.length) : 0,
          onTimeRate: processedOrders.length > 0 ? Math.round((processedOrders.filter(o => o.importCutoff <= 15 && o.inventoryAssignCutoff <= 15).length / processedOrders.length) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Error processing sheet data:', error);
      toast({
        variant: "destructive",
        title: "Data Processing Error",
        description: "Failed to process Google Sheets data. Please check the data format.",
      });
      
      // Return empty data structure on error
      return {
        orders: [],
        metrics: {
          importCutoff: [{ range: '0-15 mins', count: 0, orders: [] }, { range: '15-25 mins', count: 0, orders: [] }, { range: '25+ mins', count: 0, orders: [] }],
          inventoryAssign: [{ range: '0-15 mins', count: 0, orders: [] }, { range: '15-25 mins', count: 0, orders: [] }, { range: '25+ mins', count: 0, orders: [] }],
          batchPick: [{ range: '0-15 mins', count: 0, orders: [] }, { range: '15-25 mins', count: 0, orders: [] }, { range: '25+ mins', count: 0, orders: [] }],
          labelPrint: [{ range: '0-15 mins', count: 0, orders: [] }, { range: '15-25 mins', count: 0, orders: [] }, { range: '25+ mins', count: 0, orders: [] }],
          pickupCutoff: [{ range: '0-15 mins', count: 0, orders: [] }, { range: '15-25 mins', count: 0, orders: [] }, { range: '25+ mins', count: 0, orders: [] }]
        },
        summary: {
          totalOrders: 0,
          avgImportTime: 0,
          avgTotalTime: 0,
          onTimeRate: 0
        }
      };
    }
  };

  const handleMetricClick = (metricType: string, bucketRange: string) => {
    setSelectedMetric(metricType);
    setSelectedBucket(bucketRange);
    setShowOrderDetails(true);
  };

  const getFilteredData = (): DashboardData => {
    let filteredOrders = dashboardData.orders;
    
    // Filter by darkstore
    if (selectedDarkstore !== "all") {
      filteredOrders = filteredOrders.filter(order => order.darkstoreName === selectedDarkstore);
    }
    
    // Filter by brand
    if (selectedBrand !== "all") {
      filteredOrders = filteredOrders.filter(order => order.brandName === selectedBrand);
    }
    
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    const createMetricBuckets = (orders: OrderData[], metricKey: keyof Pick<OrderData, 'importCutoff' | 'inventoryAssignCutoff' | 'batchPickCutoff' | 'labelCutoff' | 'pickupCutoff'>): MetricBucket[] => {
      const buckets = ['0-15 mins', '15-25 mins', '25+ mins'];
      const categorizeBucket = (time: number): string => {
        if (time <= 15) return '0-15 mins';
        if (time <= 25) return '15-25 mins';
        return '25+ mins';
      };
      
      return buckets.map(range => ({
        range,
        count: orders.filter(order => categorizeBucket(order[metricKey] as number) === range).length,
        orders: orders.filter(order => categorizeBucket(order[metricKey] as number) === range)
      }));
    };

    return {
      orders: filteredOrders,
      metrics: {
        importCutoff: createMetricBuckets(filteredOrders, 'importCutoff'),
        inventoryAssign: createMetricBuckets(filteredOrders, 'inventoryAssignCutoff'),
        batchPick: createMetricBuckets(filteredOrders, 'batchPickCutoff'),
        labelPrint: createMetricBuckets(filteredOrders, 'labelCutoff'),
        pickupCutoff: createMetricBuckets(filteredOrders, 'pickupCutoff')
      },
      summary: {
        totalOrders: filteredOrders.length,
        avgImportTime: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + o.importCutoff, 0) / filteredOrders.length) : 0,
        avgTotalTime: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + (o.manifestAt.getTime() - o.createdAt.getTime()) / (1000 * 60), 0) / filteredOrders.length) : 0,
        onTimeRate: filteredOrders.length > 0 ? Math.round((filteredOrders.filter(o => o.importCutoff <= 15 && o.inventoryAssignCutoff <= 15).length / filteredOrders.length) * 100) : 0
      }
    };
  };

  const getSelectedOrders = (): OrderData[] => {
    if (!selectedMetric || !selectedBucket) return getFilteredData().orders;
    const filteredData = getFilteredData();
    const metric = filteredData.metrics[selectedMetric as keyof TimeMetrics];
    const bucket = metric?.find(b => b.range === selectedBucket);
    return bucket?.orders || [];
  };

  useEffect(() => {
    // Auto-connect on load with a small delay to ensure component is mounted
    const timer = setTimeout(() => {
      console.log('Auto-connecting to Google Sheets...');
      connectToSheet();
    }, 1000);
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      if (isConnected) {
        console.log('Auto-refreshing data...');
        connectToSheet();
      }
    }, 5 * 60 * 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <DashboardHeader 
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
        
        <StatusBar 
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          onRefresh={() => connectToSheet()}
        />
        
        {/* Filters Section */}
        {(darkstores.length > 0 || brands.length > 0) && (
          <div className="animate-fade-in">
            <FiltersSection
              darkstores={darkstores}
              brands={brands}
              selectedDarkstore={selectedDarkstore}
              selectedBrand={selectedBrand}
              dateRange={dateRange}
              totalOrders={dashboardData.orders.length}
              onDarkstoreChange={setSelectedDarkstore}
              onBrandChange={setSelectedBrand}
              onDateRangeChange={setDateRange}
              onClearFilters={() => {
                setSelectedDarkstore("all");
                setSelectedBrand("all");
                setDateRange({ start: '', end: '' });
              }}
            />
          </div>
        )}

        <div className="animate-slide-in space-y-8">
          {!showOrderDetails ? (
            <>
              <MetricsOverview summary={getFilteredData().summary} />
              <TimeMetricsGrid 
                metrics={getFilteredData().metrics}
                onMetricClick={handleMetricClick}
              />
              <ChartsSection metrics={getFilteredData().metrics} />
              
              {/* All Orders Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-foreground gradient-text">All Orders Data</h2>
                  <div className="text-sm text-muted-foreground">
                    Showing {getFilteredData().orders.length} orders
                    {selectedDarkstore !== "all" && ` for ${selectedDarkstore}`}
                    {selectedBrand !== "all" && ` (${selectedBrand})`}
                    {(dateRange.start || dateRange.end) && ` in date range`}
                  </div>
                </div>
                <OrderDetailsView 
                  orders={getFilteredData().orders}
                  metricType="all"
                  bucketRange="all"
                  onBack={() => {}}
                  showBackButton={false}
                />
              </section>
            </>
          ) : (
            <OrderDetailsView 
              orders={getSelectedOrders()}
              metricType={selectedMetric!}
              bucketRange={selectedBucket!}
              onBack={() => setShowOrderDetails(false)}
            />
          )}
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sheetId={sheetId}
        onSheetIdChange={setSheetId}
        onConnect={connectToSheet}
      />
    </div>
  );
};

export default Index;
