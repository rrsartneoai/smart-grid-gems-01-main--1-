import { FloatingChatbot } from "../FloatingChatbot";
import { Card } from "@/components/ui/card";
import { useCompanyStore } from "@/components/CompanySidebar";
import { companiesData } from "@/data/companies";
import { ChartCard } from "./ChartCard";
import { useHiddenItems } from "@/hooks/useHiddenItems";
import { RestoreButton } from "@/components/ui/restore-button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
  Legend, Area, AreaChart, ComposedChart, Scatter,
} from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { UploadOptions } from "./UploadOptions";
import { ExportButtons } from "./ExportButtons";
import * as XLSX from 'xlsx';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const calculateForecast = (data: any[]) => {
  const forecast = data.map((item, index) => ({
    name: `Forecast ${index + 1}`,
    consumption: item.consumption * 1.1,
    production: item.production * 1.15,
    efficiency: Math.min(item.efficiency * 1.05, 100),
  }));
  return forecast;
};

export function CompanyAnalysis() {
  const { toast } = useToast();
  const { selectedCompanyId } = useCompanyStore();
  const selectedCompany = companiesData.find(
    (company) => company.id === selectedCompanyId
  );
  const [showForecast, setShowForecast] = useState(false);

  const handleExport = async (format: 'pdf' | 'jpg' | 'xlsx' | 'csv') => {
    try {
      const element = document.getElementById('company-analysis');
      if (!element) {
        throw new Error('Export element not found');
      }

      if (format === 'pdf' || format === 'jpg') {
        const canvas = await html2canvas(element, {
          useCORS: true,
          allowTaint: true,
          logging: false,
          scale: 2
        });
        
        if (format === 'jpg') {
          const link = document.createElement('a');
          link.download = `company-analysis-${Date.now()}.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 1.0);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const imgData = canvas.toDataURL('image/png', 1.0);
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm'
          });
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`company-analysis-${Date.now()}.pdf`);
        }
      } else {
        const data = selectedCompany?.energyData || [];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Analysis Data");
        
        if (format === 'csv') {
          XLSX.writeFile(wb, `company-analysis-${Date.now()}.csv`);
        } else {
          XLSX.writeFile(wb, `company-analysis-${Date.now()}.xlsx`);
        }
      }

      toast({
        title: "Export completed",
        description: `File exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred during export. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { hiddenItems, hideItem, restoreItems, isHidden } = useHiddenItems('hidden-analysis-charts');

  const charts = [
    {
      id: 'energy-trends',
      title: 'Trendy zużycia energii',
      component: (
        <LineChart data={showForecast ? [...(selectedCompany?.energyData || []), ...calculateForecast(selectedCompany?.energyData || [])] : selectedCompany?.energyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="consumption"
            name="Zużycie"
            stroke="#8884d8"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="production"
            name="Produkcja"
            stroke="#82ca9d"
            strokeWidth={2}
          />
        </LineChart>
      )
    },
    {
      id: 'efficiency-analysis',
      title: 'Analiza wydajności',
      component: (
        <AreaChart data={showForecast ? [...(selectedCompany?.energyData || []), ...calculateForecast(selectedCompany?.energyData || [])] : selectedCompany?.energyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="efficiency"
            name="Wydajność"
            stroke="#8884d8"
            fill="#8884d8"
          />
        </AreaChart>
      )
    },
    {
      id: 'energy-sources',
      title: 'Źródła energii',
      component: (
        <PieChart>
          <Pie
            data={[
              { name: "Energia słoneczna", value: 30 },
              { name: "Energia wiatrowa", value: 25 },
              { name: "Biomasa", value: 20 },
              { name: "Inne źródła", value: 25 },
            ]}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {[
              { name: "Energia słoneczna", value: 30 },
              { name: "Energia wiatrowa", value: 25 },
              { name: "Biomasa", value: 20 },
              { name: "Inne źródła", value: 25 },
            ].map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      )
    },
    {
      id: 'correlation-analysis',
      title: 'Analiza korelacji',
      component: (
        <ComposedChart data={showForecast ? [...(selectedCompany?.energyData || []), ...calculateForecast(selectedCompany?.energyData || [])] : selectedCompany?.energyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="consumption" name="Zużycie" fill="#8884d8" />
          <Scatter dataKey="efficiency" name="Wydajność" fill="#82ca9d" />
        </ComposedChart>
      )
    },
  ];

  const visibleCharts = charts.filter(chart => !isHidden(chart.id));

  return (
    <div className="relative">
      <div className="grid gap-6" id="company-analysis">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-2xl font-bold">
            Analiza - {selectedCompany?.name}
          </h2>
          <div className="flex gap-2">
            <RestoreButton
              onClick={restoreItems}
              hiddenCount={charts.length - visibleCharts.length}
            />
            <ExportButtons 
              onExport={handleExport}
              onGenerateForecast={() => setShowForecast(true)}
              showForecast={showForecast}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {visibleCharts.map(chart => (
            <ChartCard
              key={chart.id}
              title={chart.title}
              onHide={() => hideItem(chart.id)}
            >
              {chart.component}
            </ChartCard>
          ))}
        </div>

        <UploadOptions />
      </div>
      <FloatingChatbot />
    </div>
  );
}
