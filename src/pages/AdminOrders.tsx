/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useEffect, useState, useMemo, useRef, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
    FiSearch, FiFilter, FiCalendar, FiPackage, FiCheckCircle,
    FiClock, FiTrash2, FiArchive, FiDollarSign, FiBarChart2, FiLayers,
    FiShoppingBag, FiInfo, FiTag, FiArrowRight, FiRotateCw, FiX, FiBell,
    FiTruck
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { OrderService } from "../services/orderService";
import { FirebaseService } from "../services/firebaseService";
import { calculateStats } from "../utils/accountingUtils";
import AnalyticsSection from "../components/admin/AnalyticsSection";
import OrderDetailsDrawer from "../components/admin/OrderDetailsDrawer";
import DeleteConfirmationModal from "../components/admin/DeleteConfirmationModal";
import type { Order, OrderStatus } from "../types/order";
import {
    isWithinInterval,
    startOfWeek, endOfWeek, startOfMonth, endOfMonth,
    isSameDay
} from "date-fns";
import { playNewOrderSound } from "../utils/audioUtils";

type DateRangeFilter = "all" | "today" | "week" | "month";

export default function AdminOrdersPage() {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const navigate = useNavigate();

    const [authOk, setAuthOk] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit] = useState(1000); // Increased limit as architect suggest larger buffer

    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentFilter, setPaymentFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [sourceFilter, setSourceFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<DateRangeFilter>("all");

    const [showAnalytics, setShowAnalytics] = useState(false);
    const [viewMode, setViewMode] = useState<"active" | "history" | "whatsapp">("active");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const processedOrderIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        const auth = FirebaseService.auth();
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            setAuthOk(!!user);
            if (!user) setLoading(false);
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!authOk) return;
        const unsubscribe = OrderService.listenToOrders(limit, (ordersArray) => {
            setOrders(ordersArray);
            setLoading(false);

            const now = Date.now();

            ordersArray.forEach(order => {
                if (!processedOrderIds.current.has(order.id)) {
                    processedOrderIds.current.add(order.id);
                    // Check if the order was created within the last 5 seconds (5000ms)
                    if (now - order.createdAt < 5000) {
                        playNewOrderSound();

                        toast.custom((t) => (
                            <div className={`${t.visible ? 'animate-in fade-in slide-in-from-right-full' : 'animate-out fade-out slide-out-to-right-full'} max-w-md w-full bg-(--bg-card) shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 p-4 items-center gap-4 border-r-4 border-primary font-['Cairo']`} dir="rtl">
                                <div className="flex-1">
                                    <p className="text-sm font-black text-(--text-main) flex items-center gap-2">
                                        <span>طلب جديد! 🔔</span>
                                        <span className="text-primary font-mono tracking-tighter">{order.orderId}</span>
                                    </p>
                                    <div className="mt-1">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${order.orderType === 'in' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'}`}>
                                            {order.orderType === 'in' ? 'داخل المطعم 🍽️' : 'تيك أواي 🥡'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ), { duration: 5000, position: 'top-right' });
                    }
                }
            });
        });
        return () => unsubscribe();
    }, [authOk, limit, t]);

    const stats = useMemo(() => calculateStats(orders), [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                (order.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.orderId || "").toLowerCase().includes(searchTerm.toLowerCase());

            // Unified View Filtering
            let matchesView = true;
            if (viewMode === "active") matchesView = order.archived !== true && order.status !== "delivered" && order.status !== "cancelled" && order.status !== "archived";
            else if (viewMode === "history") matchesView = order.archived === true || order.status === "delivered" || order.status === "cancelled" || order.status === "archived";
            else if (viewMode === "whatsapp") matchesView = order.source === "whatsapp";

            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            const matchesType = typeFilter === "all" || order.orderType === typeFilter;

            const isPaid = order.paymentStatus === "paid" || order.status === "delivered";
            const matchesPayment = paymentFilter === "all" || (paymentFilter === "paid" ? isPaid : !isPaid);

            let matchesDate = true;
            const orderDate = new Date(order.createdAt);
            const now = new Date();
            if (dateRange === "today") matchesDate = isSameDay(orderDate, now);
            else if (dateRange === "week") matchesDate = isWithinInterval(orderDate, { start: startOfWeek(now), end: endOfWeek(now) });
            else if (dateRange === "month") matchesDate = isWithinInterval(orderDate, { start: startOfMonth(now), end: endOfMonth(now) });

            const matchesSource = sourceFilter === "all" || (order.source || "dashboard") === sourceFilter;

            return matchesSearch && matchesView && matchesStatus && matchesType && matchesPayment && matchesDate && matchesSource;
        });
    }, [orders, searchTerm, statusFilter, paymentFilter, typeFilter, dateRange, viewMode, sourceFilter]);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await OrderService.deleteOrder(deleteId);
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setDeleteId(null);
        }
    };

    if (!authOk && !loading) {
        return (
            <div className="min-h-screen bg-(--bg-main) flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-(--bg-card) p-10 rounded-[3rem] border border-(--border-color) shadow-2xl text-center max-w-sm">
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-2xl font-black text-(--text-main) mb-2">{t('admin.login_title')}</h2>
                    <button onClick={() => navigate("/admin")} className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl mt-8">
                        {t('admin.login_btn')}
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-(--bg-main) p-4 md:p-8 font-['Cairo']">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header & Main Toggle */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 flex items-center justify-center bg-(--bg-card) text-(--text-main) rounded-2xl border border-(--border-color) shadow-sm"
                        >
                            {isRtl ? "→" : "←"}
                        </motion.button>
                        <div>
                            <h1 className="text-3xl font-black text-(--text-main) tracking-tight">{t('admin.orders_board')}</h1>
                            <p className="text-(--text-muted) text-xs font-bold uppercase tracking-widest mt-1">
                                {viewMode === "history" ? t('admin.archived_orders') : viewMode === "whatsapp" ? t('admin.source_whatsapp') : t('admin.active_orders')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${showAnalytics ? 'bg-blue-500 text-white shadow-lg' : 'bg-(--bg-card) text-(--text-muted) border border-(--border-color)'}`}
                        >
                            <FiBarChart2 />
                            {t('admin.analytics') || "التحليلات"}
                        </button>

                        <div className="flex bg-(--bg-card) p-1 rounded-2xl border border-(--border-color)">
                            {[
                                { id: "active", icon: <FiClock />, label: t('admin.active_orders') },
                                { id: "history", icon: <FiArchive />, label: t('admin.history') || "الأرشيف" },
                                { id: "whatsapp", icon: <FiPackage />, label: t('admin.source_whatsapp') }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id as any)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${viewMode === mode.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-(--text-muted) hover:bg-(--bg-main)'}`}
                                >
                                    {mode.icon}
                                    <span className="hidden sm:inline">{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<FiDollarSign />} label={t('admin.total_revenue')} value={`${stats.overall.totalRevenue}₪`} color="blue" />
                    <StatCard icon={<FiShoppingBag />} label={t('admin.total_orders')} value={stats.overall.totalOrders} color="emerald" />
                    <StatCard icon={<FiCheckCircle />} label={t('admin.paid_orders')} value={stats.overall.paidCount} color="green" />
                    <StatCard icon={<FiClock />} label={t('admin.unpaid_orders')} value={stats.overall.unpaidCount} color="amber" />
                </div>

                {/* Analytics Panel (Toggleable) */}
                <AnimatePresence>
                    {showAnalytics && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <AnalyticsSection orders={orders} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Advanced Filter Management */}
                <div className="bg-(--bg-card) p-6 rounded-4xl border border-(--border-color) shadow-2xl space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FiFilter className="text-primary" />
                        <h3 className="text-sm font-black text-(--text-main) uppercase tracking-widest">{t('admin.filters') || "نظام الفلترة المتقدم"}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <SearchInput value={searchTerm} onChange={setSearchTerm} t={t} isRtl={isRtl} />
                        <FilterSelect
                            icon={<FiCalendar />}
                            value={dateRange}
                            onChange={(val: string) => setDateRange(val as DateRangeFilter)}
                            options={[
                                { val: "all", label: t('admin.all_dates') || "كل التواريخ" },
                                { val: "today", label: t('admin.today') },
                                { val: "week", label: t('admin.this_week') || "هذا الأسبوع" },
                                { val: "month", label: t('admin.this_month') || "هذا الشهر" }
                            ]}
                            isRtl={isRtl}
                        />
                        <FilterSelect icon={<FiLayers />} value={typeFilter} onChange={setTypeFilter} options={[
                            { val: "all", label: t('admin.all_types') || "كل الأنواع" },
                            { val: "in", label: t('common.dine_in') },
                            { val: "out", label: t('common.takeaway') }
                        ]} isRtl={isRtl} />
                        <FilterSelect icon={<FiPackage />} value={statusFilter} onChange={setStatusFilter} options={[
                            { val: "all", label: t('admin.all_status') },
                            { val: "pending", label: t('admin.pending') },
                            { val: "confirmed", label: t('admin.confirmed') },
                            { val: "preparing", label: t('admin.preparing') },
                            { val: "ready", label: t('admin.ready') },
                            { val: "delivered", label: t('admin.delivered') },
                            { val: "cancelled", label: t('admin.cancelled') }
                        ]} isRtl={isRtl} />
                        <FilterSelect icon={<FiTag />} value={sourceFilter} onChange={setSourceFilter} options={[
                            { val: "all", label: t('admin.source_filter') },
                            { val: "dashboard", label: t('admin.source_dashboard') },
                            { val: "whatsapp", label: t('admin.source_whatsapp') }
                        ]} isRtl={isRtl} />
                        <FilterSelect icon={<FiDollarSign />} value={paymentFilter} onChange={setPaymentFilter} options={[
                            { val: "all", label: t('admin.all_payments') || "كل المدفوعات" },
                            { val: "paid", label: t('admin.paid') },
                            { val: "unpaid", label: t('admin.unpaid') }
                        ]} isRtl={isRtl} />
                    </div>
                </div>

                {/* Professional Orders Table */}
                <div className="bg-(--bg-card) rounded-4xl border border-(--border-color) shadow-2xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-center border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-(--bg-main)/50 border-b border-(--border-color)">
                                    <th className="px-6 py-5 text-xs font-black uppercase text-(--text-muted) tracking-widest">{t('admin.order_id') || "رقم الطلب"}</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-(--text-muted) tracking-widest">{t('admin.customer')}</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-(--text-muted) tracking-widest">{t('admin.type') || "النوع"}</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-(--text-muted) tracking-widest">{t('admin.status_lifecycle') || "دورة حياة الطلب"}</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-(--text-muted) tracking-widest">{t('admin.payment') || "الدفع"}</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-(--text-muted) tracking-widest">{t('common.total')}</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-(--text-muted) tracking-widest">{t('admin.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--border-color)/40">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-10 h-10 rounded-full border-4 border-(--border-color) border-t-primary animate-spin opacity-80" />
                                                <p className="text-(--text-muted) font-black tracking-[0.2em] uppercase text-[10px]">
                                                    {t('common.loading') || "جاري التحميل..."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {filteredOrders.map((order) => (
                                            <motion.tr
                                                key={order.id}
                                                layout
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -6 }}
                                                transition={{ duration: 0.2 }}
                                                className="group hover:bg-primary/5/60 transition-all duration-300 cursor-pointer"
                                                onClick={() => setSelectedOrder(order)}
                                            >

                                                {/* ORDER ID */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-[11px] font-black text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 tracking-[0.2em] text-center shadow-sm">
                                                            {order.orderId}
                                                        </span>

                                                        {order.source === "whatsapp" && (
                                                            <span className="text-[9px] font-black bg-green-500/90 text-white px-2 py-1 rounded-md text-center uppercase tracking-wider shadow-sm">
                                                                {t('admin.source_whatsapp')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* CUSTOMER */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">


                                                        <div className="flex flex-col">
                                                            <p className="text-sm font-black text-(--text-main) leading-tight">
                                                                {order.customer?.name}
                                                            </p>
                                                            <p className="text-[10px] text-(--text-muted) font-bold">
                                                                {order.customer?.table
                                                                    ? `${t('admin.table_number')} ${order.customer.table}`
                                                                    : (order.customer?.phone || "")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* TYPE */}
                                                <td className="px-6 py-5">
                                                    <TypeBadge type={order.orderType} t={t} />
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-6 py-5">
                                                    <div className="min-w-[360px]">
                                                        <InlineStatusPills
                                                            order={order}
                                                            t={t}
                                                            viewMode={viewMode}
                                                        />
                                                    </div>
                                                </td>

                                                {/* PAYMENT */}
                                                <td className="px-2 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            OrderService.updatePaymentStatus(
                                                                order.id,
                                                                order.paymentStatus === "paid" ? "unpaid" : "paid"
                                                            );
                                                        }}
                                                        className="group w-full flex justify-center"
                                                    >
                                                        <div className="transition-transform duration-300 group-hover:scale-105 max-w-full">
                                                            <PaymentBadge
                                                                isPaid={
                                                                    order.paymentStatus === "paid" ||
                                                                    order.status === "delivered"
                                                                }
                                                                t={t}
                                                            />
                                                        </div>
                                                    </button>
                                                </td>

                                                {/* TOTAL */}
                                                <td className="px-6 py-5">
                                                    <span className="text-lg font-black text-primary tracking-wide">
                                                        {order.totalPrice}₪
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 justify-end">

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteId(order.id);
                                                            }}
                                                            className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-500/20"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrder(order);
                                                            }}
                                                            className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-primary/20"
                                                        >
                                                            <FiInfo size={16} />
                                                        </button>

                                                    </div>
                                                </td>

                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {!loading && filteredOrders.length === 0 && (
                    <div className="py-20 text-center bg-(--bg-card) rounded-4xl border border-dashed border-(--border-color)">
                        <div className="text-6xl mb-6 opacity-30">📂</div>
                        <h3 className="text-xl font-black text-(--text-main)">{t('admin.no_results_found')}</h3>
                        <p className="text-(--text-muted) font-bold mt-2">{t('admin.no_orders')}</p>
                    </div>
                )}
            </div>

            {/* Premium Detail Drawer */}
            <OrderDetailsDrawer order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} />

            {/* Safety Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title={t('admin.delete_order') || "حذف الطلب"}
                details={orders.find(o => o.id === deleteId)?.orderId}
            />
        </div>
    );
}

// Sub-components for cleaner structure
interface StatCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    color: "blue" | "emerald" | "green" | "amber";
}

function StatCard({ icon, label, value, color }: StatCardProps) {
    const styles = {
        blue: {
            bg: "from-blue-500/10 to-blue-600/5",
            border: "border-blue-500/20",
            text: "text-blue-700",
            iconBg: "bg-blue-500",
            label: "text-blue-600/60"
        },
        emerald: {
            bg: "from-emerald-500/10 to-emerald-600/5",
            border: "border-emerald-500/20",
            text: "text-emerald-700",
            iconBg: "bg-emerald-500",
            label: "text-emerald-600/60"
        },
        green: {
            bg: "from-green-500/10 to-green-600/5",
            border: "border-green-500/20",
            text: "text-green-700",
            iconBg: "bg-green-500",
            label: "text-green-600/60"
        },
        amber: {
            bg: "from-amber-500/10 to-orange-600/5",
            border: "border-amber-500/20",
            text: "text-amber-700",
            iconBg: "bg-amber-500",
            label: "text-amber-600/60"
        }
    };

    const s = styles[color];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-linear-to-br ${s.bg} backdrop-blur-xl border ${s.border} p-6 rounded-4xl shadow-xl`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${s.iconBg} text-white shadow-lg`}>
                    {icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${s.label}`}>{label}</span>
            </div>
            <div className={`text-3xl font-black ${s.text}`}>{value}</div>
        </motion.div>
    );
}

interface FilterProps {
    value: string;
    onChange: (val: string) => void;
    t: any;
    isRtl: boolean;
}

function SearchInput({ value, onChange, t, isRtl }: FilterProps) {
    return (
        <div className="relative group lg:col-span-1">
            <FiSearch className={`absolute top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary ${isRtl ? 'right-4' : 'left-4'}`} />
            <input
                type="text"
                placeholder={t('admin.search_placeholder')}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full py-3.5 bg-(--bg-main) border border-(--border-color) rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-xs ${isRtl ? 'pr-12' : 'pl-12'}`}
            />
        </div>
    );
}

interface SelectProps {
    icon: ReactNode;
    value: string;
    onChange: (val: string) => void;
    options: { val: string; label: string }[];
    isRtl: boolean;
}

function FilterSelect({ icon, value, onChange, options, isRtl }: SelectProps) {
    return (
        <div className="relative">
            <div className={`absolute top-1/2 -translate-y-1/2 text-(--text-muted) z-10 pointer-events-none ${isRtl ? 'right-4' : 'left-4'}`}>
                {icon}
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full py-3.5 bg-(--bg-main) border border-(--border-color) rounded-2xl outline-none focus:border-primary transition-all font-bold text-xs appearance-none relative ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
            >
                {options.map((opt) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
            </select>
        </div>
    );
}

function TypeBadge({ type, t }: { type: string; t: any }) {
    const isOut = type === "out";
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${isOut ? "bg-orange-500/10 text-orange-600 border-orange-200" : "bg-blue-500/10 text-blue-600 border-blue-200"
            }`}>
            <FiTag />
            {isOut ? t('common.takeaway') : t('common.dine_in')}
        </span>
    );
}

function StatusBadge({ status, t }: { status: OrderStatus; t: any }) {
    const config: Record<string, { bg: string, text: string, border: string }> = {
        pending: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
        confirmed: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
        preparing: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/20" },
        ready: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20" },
        delivered: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20" },
        cancelled: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20" },
        archived: { bg: "bg-gray-500/10", text: "text-gray-600", border: "border-gray-500/20" }
    };
    const c = config[status] || config.pending;
    return (
        <span className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${c.bg} ${c.text} ${c.border}`}>
            {t(`admin.${status}`)}
        </span>
    );
}

function PaymentBadge({ isPaid, t }: { isPaid: boolean; t: any }) {
    return (
        <span className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${isPaid ? "bg-green-500 text-white border-green-600 shadow-lg shadow-green-500/20" : "bg-red-500/10 text-red-600 border-red-200"
            }`}>
            {isPaid ? (t('admin.paid') || "مدفوع") : (t('admin.unpaid') || "غير مدفوع")}
        </span>
    );
}

function InlineStatusPills({ order, t, viewMode }: { order: Order, t: any, viewMode: string }) {
    const currentStatus = order.status;
    const orderId = order.id;

    const [updating, setUpdating] = useState(false);

    // Define the logical next steps in the POS flow
    const nextStepMap: Record<string, OrderStatus | null> = {
        pending: "confirmed",
        confirmed: "preparing",
        preparing: "ready",
        ready: "delivered",
        delivered: "archived",
        cancelled: null,
        archived: "pending" // Restore back to pending
    };

    // Define the backward steps for corrections
    const prevStepMap: Record<string, OrderStatus | null> = {
        confirmed: "pending",
        preparing: "confirmed",
        ready: "preparing"
    };

    const nextStatus = nextStepMap[currentStatus];
    const prevStatus = prevStepMap[currentStatus];

    const config: Record<OrderStatus, { color: string, icon: any, label: string }> = {
        pending: { color: "blue", icon: <FiCheckCircle />, label: t('admin.mark_confirmed') || "تأكيد" },
        confirmed: { color: "indigo", icon: <FiPackage />, label: t('admin.mark_preparing') || "تحضير" },
        preparing: { color: "purple", icon: <FiBell />, label: t('admin.mark_ready') || "جاهز" },
        ready: { color: "green", icon: <FiTruck />, label: t('admin.mark_delivered') || "توصيل" },
        delivered: { color: "gray", icon: <FiArchive />, label: t('admin.mark_archived') || "أرشفة" },
        cancelled: { color: "red", icon: <FiX />, label: t('admin.cancelled') },
        archived: { color: "blue", icon: <FiRotateCw />, label: t('admin.restore') || "استعادة" }
    };

    const handleUpdate = async (status: OrderStatus) => {
        if (updating) return;
        setUpdating(true);
        try {
            const extraUpdates: any = {};
            const now = Date.now();

            // ⏱️ Preparation Time Logic
            if (status === "preparing" && !order.preparationTime?.startedAt) {
                extraUpdates['preparationTime/startedAt'] = now;
            } else if (status === "ready") {
                extraUpdates['preparationTime/completedAt'] = now;
                if (order.preparationTime?.startedAt) {
                    const durationMs = now - order.preparationTime.startedAt;
                    const durationMinutes = parseFloat((durationMs / 60000).toFixed(1));
                    extraUpdates['preparationTime/durationMinutes'] = durationMinutes;
                } else {
                    extraUpdates['preparationTime/durationMinutes'] = null;
                }
            }

            await OrderService.updateStatus(orderId, status, extraUpdates);
            toast.success(t('common.success_message'), { duration: 1000 });
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setUpdating(false);
        }
    };

    // If History/WhatsApp mode and not "active", show a Restore button if archived
    if (viewMode !== "active" && currentStatus === "archived") {
        return (
            <button
                onClick={(e) => { e.stopPropagation(); handleUpdate("pending"); }}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
            >
                <FiRotateCw size={14} className={updating ? "animate-spin" : ""} />
                {t('admin.restore') || "استعادة الطلب"}
            </button>
        );
    }

    if (!nextStatus || currentStatus === "delivered" || currentStatus === "cancelled") {
        return <StatusBadge status={currentStatus} t={t} />;
    }

    const c = config[currentStatus];

    return (
        <div className="flex items-center gap-3">
            {prevStatus && (
                <button
                    onClick={(e) => { e.stopPropagation(); handleUpdate(prevStatus); }}
                    disabled={updating}
                    title={t('admin.revert_status') || "تراجع"}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                    <FiRotateCw className="-scale-x-100" />
                </button>
            )}

            <StatusBadge status={currentStatus} t={t} />

            <FiArrowRight className="text-(--text-muted) opacity-50 shrink-0" />

            <button
                onClick={(e) => { e.stopPropagation(); handleUpdate(nextStatus); }}
                disabled={updating}
                className={`
                    flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all relative overflow-hidden group
                    bg-${c.color}-500 text-white shadow-lg shadow-${c.color}-500/30 hover:scale-[1.02] active:scale-95
                    ${updating ? 'opacity-70 cursor-not-allowed' : ''}
                `}
            >
                {updating && (
                    <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{ opacity: [0, 0.4, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    />
                )}
                <span className="group-hover:rotate-12 transition-transform">{c.icon}</span>
                <span>{c.label}</span>
            </button>
        </div>
    );
}
