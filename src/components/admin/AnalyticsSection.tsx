import { useMemo } from "react";
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getChartData } from "../../utils/accountingUtils";

interface Props {
    orders: any[];
}

export default function AnalyticsSection({ orders }: Props) {
    const { t } = useTranslation();
    const data = useMemo(() => getChartData(orders), [orders]);

    const COLORS = ['#2D8B4E', '#FAB008'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-10">
            
            {/* Sales Trend Line Chart */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-(--bg-card) p-6 rounded-4xl border border-(--border-color) shadow-xl flex flex-col gap-6"
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-(--text-main) uppercase tracking-widest">{t('admin.sales_trend') || "اتجاه المبيعات (7 أيام)"}</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.dailyTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748B' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748B' }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                                labelStyle={{ color: '#64748B', marginBottom: '4px' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#2D8B4E" 
                                strokeWidth={4} 
                                dot={{ fill: '#2D8B4E', strokeWidth: 2, r: 4 }} 
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                animationDuration={2000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Hourly Sales Bar Chart */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-(--bg-card) p-6 rounded-4xl border border-(--border-color) shadow-xl flex flex-col gap-6"
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-(--text-main) uppercase tracking-widest">{t('admin.peak_hours') || "ساعات الذروة اليوم"}</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.hourly}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748B' }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Order Distribution Pie Chart */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-(--bg-card) p-6 rounded-4xl border border-(--border-color) shadow-xl flex flex-col items-center gap-6"
            >
                <div className="w-full text-right">
                    <h3 className="text-sm font-black text-(--text-main) uppercase tracking-widest">{t('admin.order_distribution') || "توزيع الطلبات"}</h3>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.distribution.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-8">
                    {data.distribution.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-xs font-black text-(--text-muted) uppercase tracking-widest">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
