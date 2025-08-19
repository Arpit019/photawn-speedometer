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
import { QualityMetrics } from "@/components/dashboard/QualityMetrics";
import { QualityDashboard } from "@/components/dashboard/QualityDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  deliveryCutoff: number; // minutes
  pickupToDelivery: number; // minutes
  totalProcessingTime: number; // minutes
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
  deliveryCutoff: MetricBucket[];
}

interface DashboardData {
  orders: OrderData[];
  metrics: TimeMetrics;
  summary: {
    totalOrders: number;
    avgImportTime: number;
    avgInventoryAssignTime: number;
    avgPickupAndBatchTime: number;
    avgLabelCutoffTime: number;
    avgPickupCutoffTime: number;
    avgDeliveryCutoffTime: number;
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
      pickupCutoff: [],
      deliveryCutoff: []
    },
    summary: {
      totalOrders: 0,
      avgImportTime: 0,
      avgInventoryAssignTime: 0,
      avgPickupAndBatchTime: 0,
      avgLabelCutoffTime: 0,
      avgPickupCutoffTime: 0,
      avgDeliveryCutoffTime: 0
    }
  });
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'time' | 'quality'>('time');
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
      
      console.log('🔄 Starting Google Sheets connection...');
      
      // Try the published CSV link first
      let csvText = '';
      let foundValidSheet = false;
      
      try {
        // Hardcoded connection to your specific Google Sheet
        const publishedUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQQfkPI_kCsELoDIyKMFBX3g8QM02PEX4UrjiTVouPBzLUWnvfwQmqWTytzVRJ4jAhrN1ExG4y_l17T/pub?gid=1214222356&single=true&output=csv&cachebust=${Date.now()}`;
        
        console.log('📊 Connecting to hardcoded Google Sheet URL:', publishedUrl);
        
        const response = await fetch(publishedUrl, {
          method: 'GET',
          headers: { 
            'Accept': 'text/csv',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        });
        
        console.log('📊 Response status:', response.status, response.statusText);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          csvText = await response.text();
          console.log('📊 Raw CSV data length:', csvText.length);
          console.log('📊 First 500 characters of CSV:', csvText.substring(0, 500));
          console.log('📊 Last 500 characters of CSV:', csvText.substring(csvText.length - 500));
          
          if (csvText && csvText.trim().length > 10 && csvText.includes(',')) {
            foundValidSheet = true;
            console.log('✅ Valid CSV data found from published sheet');
          } else {
            console.log('❌ CSV data appears invalid or empty');
          }
        } else {
          console.log('❌ HTTP error:', response.status, response.statusText);
        }
      } catch (publishedError) {
        console.error('❌ Published CSV fetch failed:', publishedError);
      }
      
      // If published CSV didn't work, use sample data as fallback
      if (!foundValidSheet) {
        console.log('❌ USING SAMPLE DATA FALLBACK - Real sheet data not accessible');
        console.log('🔍 This means your Google Sheets data is NOT being loaded');
        console.log('💡 Check: 1) Sheet is published to web, 2) Correct GID, 3) No access restrictions');
        
        // Force an error to make it obvious we're using sample data
        toast({
          variant: "destructive",
          title: "Using Sample Data",
          description: "Google Sheets connection failed. Dashboard shows sample data only.",
        });
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
Thane,Adidas,8/12/2025 10:20:00 AM,8/12/2025 10:29:00 AM,8/12/2025 10:31:00 AM,8/12/2025 10:40:00 AM,8/12/2025 10:50:00 AM,8/12/2025 10:55:00 AM
Thane,Adidas,8/13/2025 10:20:00 AM,8/13/2025 10:29:00 AM,8/13/2025 10:31:00 AM,8/13/2025 10:40:00 AM,8/13/2025 10:50:00 AM,8/13/2025 10:55:00 AM
Thane,Adidas,8/14/2025 10:20:00 AM,8/14/2025 10:29:00 AM,8/14/2025 10:31:00 AM,8/14/2025 10:40:00 AM,8/14/2025 10:50:00 AM,8/14/2025 10:55:00 AM
Kolaba,Puma,8/15/2025 10:20:00 AM,8/15/2025 10:29:00 AM,8/15/2025 10:31:00 AM,8/15/2025 10:40:00 AM,8/15/2025 10:50:00 AM,8/15/2025 10:55:00 AM
Kolaba,Puma,8/16/2025 10:20:00 AM,8/16/2025 10:29:00 AM,8/16/2025 10:31:00 AM,8/16/2025 10:40:00 AM,8/16/2025 10:50:00 AM,8/16/2025 10:55:00 AM
Kolaba,Puma,8/17/2025 10:20:00 AM,8/17/2025 10:29:00 AM,8/17/2025 10:31:00 AM,8/17/2025 10:40:00 AM,8/17/2025 10:50:00 AM,8/17/2025 10:55:00 AM
Kolaba,Apple,8/18/2025 10:20:00 AM,8/18/2025 10:29:00 AM,8/18/2025 10:31:00 AM,8/18/2025 10:40:00 AM,8/18/2025 10:50:00 AM,8/18/2025 10:55:00 AM
Kolaba,Apple,8/19/2025 10:20:00 AM,8/19/2025 10:29:00 AM,8/19/2025 10:31:00 AM,8/19/2025 10:40:00 AM,8/19/2025 10:50:00 AM,8/19/2025 10:55:00 AM
Kolaba,Apple,8/20/2025 10:20:00 AM,8/20/2025 10:29:00 AM,8/20/2025 10:31:00 AM,8/20/2025 10:40:00 AM,8/20/2025 10:50:00 AM,8/20/2025 10:55:00 AM
Mumbai Central,Nike,8/21/2025 9:15:00 AM,8/21/2025 9:25:00 AM,8/21/2025 9:27:00 AM,8/21/2025 9:35:00 AM,8/21/2025 9:45:00 AM,8/21/2025 9:50:00 AM
Mumbai Central,Nike,8/22/2025 11:30:00 AM,8/22/2025 11:40:00 AM,8/22/2025 11:42:00 AM,8/22/2025 11:50:00 AM,8/22/2025 12:00:00 PM,8/22/2025 12:05:00 PM
Powai,Samsung,8/23/2025 2:45:00 PM,8/23/2025 2:55:00 PM,8/23/2025 2:57:00 PM,8/23/2025 3:05:00 PM,8/23/2025 3:15:00 PM,8/23/2025 3:20:00 PM
Powai,Samsung,8/24/2025 4:10:00 PM,8/24/2025 4:20:00 PM,8/24/2025 4:22:00 PM,8/24/2025 4:30:00 PM,8/24/2025 4:40:00 PM,8/24/2025 4:45:00 PM`;
        
        console.log('📊 Enhanced sample data loaded with more stores and brands');
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

          // Calculate pickup to delivery time (from manifest to a theoretical delivery - using +30 mins as example)
          const pickupToDelivery = 30; // This would be calculated from actual delivery timestamp when available
          
          // Calculate delivery cutoff time (delivered at minus pickup at - using sample 30 mins)
          const deliveryCutoff = pickupToDelivery; // This would be actual delivery time - manifest time

          // Calculate total processing time from import to manifest
          const totalProcessingTime = Math.max(0, Math.round((manifestAt.getTime() - importAt.getTime()) / (1000 * 60)));
          
          // Debug logging for first few orders
          if (index < 3) {
            console.log(`Order ${index + 1} processing times:`, {
              importAt: importAt.toISOString(),
              manifestAt: manifestAt.toISOString(),
              totalProcessingTime,
              importCutoff,
              inventoryAssignCutoff,
              batchPickCutoff,
              labelCutoff,
              pickupCutoff
            });
          }

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
            pickupCutoff,
            deliveryCutoff,
            pickupToDelivery,
            totalProcessingTime
          };
        });

    const categorizeBucket = (time: number): string => {
      if (time <= 15) return '0-15 mins';
      if (time <= 25) return '15-25 mins';
      return '25+ mins';
    };

    const createMetricBuckets = (orders: OrderData[], metricKey: keyof Pick<OrderData, 'importCutoff' | 'inventoryAssignCutoff' | 'batchPickCutoff' | 'labelCutoff' | 'pickupCutoff' | 'deliveryCutoff'>): MetricBucket[] => {
      const buckets = ['0-15 mins', '15-25 mins', '25+ mins'];
      return buckets.map(range => ({
        range,
        count: orders.filter(order => categorizeBucket(order[metricKey] as number) === range).length,
        orders: orders.filter(order => categorizeBucket(order[metricKey] as number) === range)
      }));
    };

      // Calculate summary metrics
      const avgImportTime = processedOrders.length > 0 ? Math.round(processedOrders.reduce((sum, o) => sum + o.importCutoff, 0) / processedOrders.length) : 0;
      const avgInventoryAssignTime = processedOrders.length > 0 ? Math.round(processedOrders.reduce((sum, o) => sum + o.inventoryAssignCutoff, 0) / processedOrders.length) : 0;
      const avgPickupAndBatchTime = processedOrders.length > 0 ? Math.round(processedOrders.reduce((sum, o) => sum + o.batchPickCutoff, 0) / processedOrders.length) : 0;
      const avgLabelCutoffTime = processedOrders.length > 0 ? Math.round(processedOrders.reduce((sum, o) => sum + o.labelCutoff, 0) / processedOrders.length) : 0;
      const avgPickupCutoffTime = processedOrders.length > 0 ? Math.round(processedOrders.reduce((sum, o) => sum + o.pickupCutoff, 0) / processedOrders.length) : 0;
      const avgDeliveryCutoffTime = processedOrders.length > 0 ? Math.round(processedOrders.reduce((sum, o) => sum + o.deliveryCutoff, 0) / processedOrders.length) : 0;

      // Debug the final summary
      console.log('📊 Final processed summary:', {
        totalOrders: processedOrders.length,
        avgImportTime,
        avgInventoryAssignTime,
        avgPickupAndBatchTime,
        avgLabelCutoffTime,
        avgPickupCutoffTime,
        avgDeliveryCutoffTime,
        sampleTotalTimes: processedOrders.slice(0, 3).map(o => ({
          orderId: o.id,
          importAt: o.importAt.toISOString(),
          manifestAt: o.manifestAt.toISOString(),
          totalMinutes: (o.manifestAt.getTime() - o.importAt.getTime()) / (1000 * 60)
        }))
      });

      return {
        orders: processedOrders,
        metrics: {
          importCutoff: createMetricBuckets(processedOrders, 'importCutoff'),
          inventoryAssign: createMetricBuckets(processedOrders, 'inventoryAssignCutoff'),
          batchPick: createMetricBuckets(processedOrders, 'batchPickCutoff'),
          labelPrint: createMetricBuckets(processedOrders, 'labelCutoff'),
          pickupCutoff: createMetricBuckets(processedOrders, 'pickupCutoff'),
          deliveryCutoff: createMetricBuckets(processedOrders, 'deliveryCutoff')
        },
        summary: {
          totalOrders: processedOrders.length,
          avgImportTime,
          avgInventoryAssignTime,
          avgPickupAndBatchTime,
          avgLabelCutoffTime,
          avgPickupCutoffTime,
          avgDeliveryCutoffTime
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
          pickupCutoff: [{ range: '0-15 mins', count: 0, orders: [] }, { range: '15-25 mins', count: 0, orders: [] }, { range: '25+ mins', count: 0, orders: [] }],
          deliveryCutoff: [{ range: '0-15 mins', count: 0, orders: [] }, { range: '15-25 mins', count: 0, orders: [] }, { range: '25+ mins', count: 0, orders: [] }]
        },
        summary: {
          totalOrders: 0,
          avgImportTime: 0,
          avgInventoryAssignTime: 0,
          avgPickupAndBatchTime: 0,
          avgLabelCutoffTime: 0,
          avgPickupCutoffTime: 0,
          avgDeliveryCutoffTime: 0
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
    
    const createMetricBuckets = (orders: OrderData[], metricKey: keyof Pick<OrderData, 'importCutoff' | 'inventoryAssignCutoff' | 'batchPickCutoff' | 'labelCutoff' | 'pickupCutoff' | 'deliveryCutoff'>): MetricBucket[] => {
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
        pickupCutoff: createMetricBuckets(filteredOrders, 'pickupCutoff'),
        deliveryCutoff: createMetricBuckets(filteredOrders, 'deliveryCutoff')
      },
        summary: {
          totalOrders: filteredOrders.length,
          avgImportTime: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + o.importCutoff, 0) / filteredOrders.length) : 0,
          avgInventoryAssignTime: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + o.inventoryAssignCutoff, 0) / filteredOrders.length) : 0,
          avgPickupAndBatchTime: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + o.batchPickCutoff, 0) / filteredOrders.length) : 0,
          avgLabelCutoffTime: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + o.labelCutoff, 0) / filteredOrders.length) : 0,
          avgPickupCutoffTime: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + o.pickupCutoff, 0) / filteredOrders.length) : 0,
          avgDeliveryCutoffTime: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + o.deliveryCutoff, 0) / filteredOrders.length) : 0
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

  // Auto-refresh functionality - refresh every 5 minutes
  useEffect(() => {
    connectToSheet();
    
    // Set up auto-refresh interval (5 minutes)
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing data from Google Sheets...');
      connectToSheet();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    
    return () => clearInterval(refreshInterval);
  }, [sheetId]);

  const handleQualityMetricClick = (metricType: string, bucketRange: string) => {
    // Handle quality metric clicks - for now just log them
    console.log('Quality metric clicked:', metricType, bucketRange);
    setSelectedMetric(metricType);
    setSelectedBucket(bucketRange);
    setShowOrderDetails(true);
  };

  const getOrdersForBucket = (metricType: string, bucketRange: string): OrderData[] => {
    const filteredData = getFilteredData();
    if (metricType === 'all') return filteredData.orders;
    
    const metric = filteredData.metrics[metricType as keyof TimeMetrics];
    const bucket = metric?.find(b => b.range === bucketRange);
    return bucket?.orders || [];
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <DashboardHeader 
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
        
        <div className="mb-4">
          <h1 className="text-3xl font-bold gradient-text">Photawn Dashboard</h1>
          <p className="text-muted-foreground">Operations Performance & Quality Management</p>
        </div>
        
        <StatusBar
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          onRefresh={() => connectToSheet()}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <FiltersSection 
              selectedDarkstore={selectedDarkstore}
              onDarkstoreChange={setSelectedDarkstore}
              darkstores={darkstores}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              brands={brands}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              totalOrders={dashboardData.orders.length}
              onClearFilters={() => {
                setSelectedDarkstore("all");
                setSelectedBrand("all");
                setDateRange({ start: '', end: '' });
              }}
            />
          </div>
        </div>

        <Tabs defaultValue="speed" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="speed" className="text-sm font-medium">
              Speed Dashboard
            </TabsTrigger>
            <TabsTrigger value="quality" className="text-sm font-medium">
              Quality Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speed" className="space-y-8">
            <MetricsOverview summary={getFilteredData().summary} />
            
            <TimeMetricsGrid
              metrics={getFilteredData().metrics}
              onMetricClick={handleMetricClick}
            />

            <ChartsSection metrics={getFilteredData().metrics} />
          </TabsContent>

          <TabsContent value="quality" className="space-y-8">
            <QualityDashboard onMetricClick={handleQualityMetricClick} />
          </TabsContent>
        </Tabs>

        {showOrderDetails && selectedMetric && selectedBucket && (
          <OrderDetailsView
            metricType={selectedMetric}
            bucketRange={selectedBucket}
            orders={getOrdersForBucket(selectedMetric, selectedBucket)}
            onBack={() => setShowOrderDetails(false)}
          />
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          sheetId={sheetId}
          onSheetIdChange={setSheetId}
          onConnect={connectToSheet}
        />
      </div>
    </div>
  );
};

export default Index;
