import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface StatCardProps {
  stat: any;
  index: number;
  expandedCard: number | null;
  setExpandedCard: (index: number | null) => void;
}

export const StatCard = ({ stat, index, expandedCard, setExpandedCard }: StatCardProps) => {
  const isExpanded = expandedCard === index;

  const getStatusColor = (value: string | number) => {
    if (typeof value === "string") return "bg-green-500";
    if (value > 80) return "bg-green-500";
    if (value > 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressValue = (value: string | number) => {
    if (typeof value === "string") return 100;
    return value;
  };

  // Generate mock trend data
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: typeof stat.value === "string" ? 100 : Number(stat.value) + Math.random() * 20 - 10
  }));

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardContent className="pt-6">
        <div 
          className="flex items-start justify-between mb-2 cursor-pointer"
          onClick={() => setExpandedCard(isExpanded ? null : index)}
        >
          <div className="flex items-center gap-2">
            <stat.icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{stat.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(stat.value)}>
              Good
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold">{stat.value}</span>
            {stat.unit && (
              <span className="text-sm text-muted-foreground">
                {stat.unit}
              </span>
            )}
          </div>
          <Progress 
            value={getProgressValue(stat.value)} 
            className="h-2"
          />
          <div className="h-[50px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stat.description}
          </p>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t space-y-4"
            >
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {stat.details.map((detail: any) => (
                <div
                  key={detail.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {detail.label}
                  </span>
                  <span className="font-medium">{detail.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};