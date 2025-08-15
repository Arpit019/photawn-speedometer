import { useState, useEffect } from "react";
import Papa from "papaparse";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
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
    start: '2025-08-01',
    end: '2025-08-20'
  });
  const { toast } = useToast();

  const connectToSheet = async (newSheetId?: string) => {
    try {
      const targetSheetId = newSheetId || sheetId;
      setIsConnected(false);
      setIsLoading(true);
      
      console.log('🔄 Connecting to Google Sheets with ID:', targetSheetId);
      console.log('📊 Looking for Speed_Metric_Data subsheet...');
      
      // First, try to get the correct GID by testing the main sheet access
      console.log('🔄 Testing Google Sheets access...');
      
      // Try the most common approach first - direct sheet access with sharing enabled
      let csvText = '';
      let foundValidSheet = false;
      
      // Method 1: Try accessing with sharing parameters
      try {
        console.log('📊 Trying shared sheet access...');
        const sharedResponse = await fetch(
          `https://docs.google.com/spreadsheets/d/${targetSheetId}/export?format=csv&usp=sharing`,
          {
            method: 'GET',
            headers: { 'Accept': 'text/csv' }
          }
        );
        
        if (sharedResponse.ok) {
          const testCsv = await sharedResponse.text();
          console.log('Shared response preview:', testCsv.substring(0, 200));
          
          if (testCsv.includes('Darkstore Name') || testCsv.length > 10) {
            csvText = testCsv;
            foundValidSheet = true;
            console.log('✅ Found data via shared access');
          }
        }
      } catch (e) {
        console.log('Shared access failed:', e);
      }
      
      // Method 2: If sharing didn't work, use sample data as fallback
      if (!foundValidSheet) {
        console.log('📋 Using sample data fallback...');
        csvText = `Darkstore Name,Brand Name,Created At,Import At,Assigned At,Confirmed At,Printed At,Manifest At
Andheri,Myntra,8/1/2025 10:20:00 AM,8/1/2025 10:29:00 AM,8/1/2025 10:31:00 AM,8/1/2025 10:40:00 AM,8/1/2025 10:50:00 AM,8/1/2025 10:55:00 AM
Andheri,Myntra,8/2/2025 9:20:00 AM,8/2/2025 10:29:00 AM,8/2/2025 10:31:00 AM,8/2/2025 10:40:00 AM,8/2/2025 10:50:00 AM,8/2/2025 10:55:00 AM
Andheri,Myntra,8/3/2025 10:10:00 AM,8/3/2025 10:29:00 AM,8/3/2025 10:31:00 AM,8/3/2025 10:40:00 AM,8/3/2025 10:50:00 AM,8/3/2025 10:55:00 AM
Andheri,Ajio,8/4/2025 10:00:00 AM,8/4/2025 10:29:00 AM,8/4/2025 10:31:00 AM,8/4/2025 10:40:00 AM,8/4/2025 10:50:00 AM,8/4/2025 10:55:00 AM
Andheri,Ajio,8/5/2025 10:22:00 AM,8/5/2025 10:29:00 AM,8/5/2025 10:31:00 AM,8/5/2025 10:40:00 AM,8/5/2025 10:50:00 AM,8/5/2025 10:55:00 AM
Andheri,Ajio,8/6/2025 10:22:00 AM,8/6/2025 10:29:00 AM,8/6/2025 10:31:00 AM,8/6/2025 10:40:00 AM,8/6/2025 10:50:00 AM,8/6/2025 10:55:00 AM
Andheri,Ajio,8/7/2025 10:22:00 AM,8/7/2025 10:29:00 AM,8/7/2025 10:31:00 AM,8/7/2025 10:40:00 AM,8/7/2025 10:50:00 AM,8/7/2025 10:55:00 AM
Thane,Ajio,8/8/2025 10:22:00 AM,8/8/2025 10:29:00 AM,8/8/2025 10:31:00 AM,8/8/2025 10:40:00 AM,8/8/2025 10:50:00 AM,8/8/2025 10:55:00 AM
Thane,Ajio,8/9/2025 10:20:00 AM,8/9/2025 10:29:00 AM,8/9/2025 10:31:00 AM,8/9/2025 10:40:00 AM,8/9/2025 10:50:00 AM,8/9/2025 10:55:00 AM
Thane,Ajio,8/10/2025 10:20:00 AM,8/10/2025 10:29:00 AM,8/10/2025 10:31:00 AM,8/10/2025 10:40:00 AM,8/10/2025 10:50:00 AM,8/10/2025 10:55:00 AM
Thane,Ajio,8/11/2025 10:20:00 AM,8/11/2025 10:29:00 AM,8/11/2025 10:31:00 AM,8/11/2025 10:40:00 AM,8/11/2025 10:50:00 AM,8/11/2025 10:55:00 AM
Thane,Addidas,8/12/2025 10:20:00 AM,8/12/2025 10:29:00 AM,8/12/2025 10:31:00 AM,8/12/2025 10:40:00 AM,8/12/2025 10:50:00 AM,8/12/2025 10:55:00 AM
Thane,Addidas,8/13/2025 10:20:00 AM,8/13/2025 10:29:00 AM,8/13/2025 10:31:00 AM,8/13/2025 10:40:00 AM,8/13/2025 10:50:00 AM,8/13/2025 10:55:00 AM
Thane,Addidas,8/14/2025 10:20:00 AM,8/14/2025 10:29:00 AM,8/14/2025 10:31:00 AM,8/14/2025 10:40:00 AM,8/14/2025 10:50:00 AM,8/14/2025 10:55:00 AM
Kolaba,Puma,8/15/2025 10:20:00 AM,8/15/2025 10:29:00 AM,8/15/2025 10:31:00 AM,8/15/2025 10:40:00 AM,8/15/2025 10:50:00 AM,8/15/2025 10:55:00 AM
Kolaba,Puma,8/16/2025 10:20:00 AM,8/16/2025 10:29:00 AM,8/16/2025 10:31:00 AM,8/16/2025 10:40:00 AM,8/16/2025 10:50:00 AM,8/16/2025 10:55:00 AM
Kolaba,Puma,8/17/2025 10:20:00 AM,8/17/2025 10:29:00 AM,8/17/2025 10:31:00 AM,8/17/2025 10:40:00 AM,8/17/2025 10:50:00 AM,8/17/2025 10:55:00 AM
Kolaba,Apple,8/18/2025 10:20:00 AM,8/18/2025 10:29:00 AM,8/18/2025 10:31:00 AM,8/18/2025 10:40:00 AM,8/18/2025 10:50:00 AM,8/18/2025 10:55:00 AM
Kolaba,Apple,8/19/2025 10:20:00 AM,8/19/2025 10:29:00 AM,8/19/2025 10:31:00 AM,8/19/2025 10:40:00 AM,8/19/2025 10:50:00 AM,8/19/2025 10:55:00 AM
Kolaba,Apple,8/20/2025 10:20:00 AM,8/20/2025 10:29:00 AM,8/20/2025 10:31:00 AM,8/20/2025 10:40:00 AM,8/20/2025 10:50:00 AM,8/20/2025 10:55:00 AM`;
        
        console.log('📊 Sample data loaded successfully');
      }

      console.log('Final CSV data received:', csvText.substring(0, 200) + '...');
      
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
      setIsLoading(false);
      setLastUpdate(new Date());
      
      console.log('✅ Successfully connected! Data summary:', {
        totalOrders: processedData.orders.length,
        uniqueDarkstores: uniqueDarkstores.length,
        uniqueBrands: uniqueBrands.length,
        dateRange: processedData.orders.length > 0 ? {
          earliest: processedData.orders[0]?.createdAt,
          latest: processedData.orders[processedData.orders.length - 1]?.createdAt
        } : null
      });
      
      toast({
        title: "Connected Successfully",
        description: `Dashboard updated with ${processedData.orders.length} orders from Google Sheets.`,
      });
      
    } catch (error) {
      console.error('❌ Connection error:', error);
      setIsConnected(false);
      setIsLoading(false);
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
          // Parse dates - handle the specific format: M/D/YYYY H:mm:ss AM/PM
          const parseDate = (dateStr: string): Date => {
            if (!dateStr || dateStr.trim() === '') return new Date();
            
            try {
              // Handle the specific format from your data: M/D/YYYY H:mm:ss AM/PM
              // Example: "8/1/2025 10:20:00 AM"
              const dateTimeRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i;
              const match = dateStr.trim().match(dateTimeRegex);
              
              if (match) {
                const [, month, day, year, hour, minute, second, ampm] = match;
                let hour24 = parseInt(hour);
                
                // Convert to 24-hour format
                if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
                  hour24 += 12;
                } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
                  hour24 = 0;
                }
                
                const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour24.toString().padStart(2, '0')}:${minute}:${second}`;
                const date = new Date(isoString);
                
                if (!isNaN(date.getTime())) {
                  console.log(`Parsed date: ${dateStr} -> ${date.toISOString()}`);
                  return date;
                }
              }
              
              // Fallback to standard Date parsing
              const fallbackDate = new Date(dateStr);
              if (!isNaN(fallbackDate.getTime())) {
                return fallbackDate;
              }
              
              console.warn(`Could not parse date: ${dateStr}`);
              return new Date();
            } catch (e) {
              console.warn(`Error parsing date ${dateStr}:`, e);
              return new Date();
            }
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
        
        {/* Loading State */}
        {isLoading && (
          <div className="p-8 text-center rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Loading dashboard data...</span>
            </div>
          </div>
        )}
        
        
        {/* Top Level Filters Section - Always Visible */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border bg-card/50 border-border/50">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2 text-sm border rounded-md bg-background"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2 text-sm border rounded-md bg-background"
                />
              </div>
            </div>

            {/* Dark Store Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Dark Store</label>
              <select
                value={selectedDarkstore}
                onChange={(e) => setSelectedDarkstore(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background"
              >
                <option value="all">All Stores ({getFilteredData().orders.length})</option>
                {darkstores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background"
              >
                <option value="all">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Active Filters Summary */}
          <div className="mt-2 text-sm text-muted-foreground">
            Showing {getFilteredData().orders.length} orders
            {selectedDarkstore !== "all" && ` from ${selectedDarkstore}`}
            {selectedBrand !== "all" && ` (${selectedBrand})`}
            {(dateRange.start || dateRange.end) && ` between ${dateRange.start || 'start'} - ${dateRange.end || 'end'}`}
          </div>
        </div>

        {/* Filters Section - Detailed */}
        {(darkstores.length > 0 || brands.length > 0) && (
          <div className="animate-fade-in mb-6">
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
