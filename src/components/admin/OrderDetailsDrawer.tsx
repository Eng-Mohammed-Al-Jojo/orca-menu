import { motion, AnimatePresence } from "framer-motion";
import {
    FiX, FiUser, FiPhone, FiMapPin, FiClock,
    FiDollarSign, FiMessageSquare,
    FiPackage, FiTruck, FiChevronRight, FiCheck, FiRotateCw
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { OrderService } from "../../services/orderService";
import { toast } from "react-hot-toast";
import type { Order, OrderStatus, PaymentStatus } from "../../types/order";

interface Props {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function OrderDetailsDrawer({ order, isOpen, onClose }: Props) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    if (!order) return null;

    const updatePayment = async () => {
        const newStatus: PaymentStatus = order.paymentStatus === "paid" ? "unpaid" : "paid";
        try {
            await OrderService.updatePaymentStatus(order.id, newStatus);
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const updateStatus = async (status: OrderStatus) => {
        try {
            await OrderService.updateStatus(order.id, status);
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleConfirmNotify = async () => {
        try {
            await OrderService.updateStatus(order.id, "confirmed");
            OrderService.notifyCustomer(order, 'confirm');
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleReadyNotify = async () => {
        try {
            await OrderService.updateStatus(order.id, "ready");
            OrderService.notifyCustomer(order, 'ready');
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const steps: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered", "archived"];
    const currentStepIndex = steps.indexOf(order.status as OrderStatus);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"
                    />

                    <motion.div
                        initial={{ x: isRtl ? "-100%" : "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: isRtl ? "-100%" : "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className={`relative w-full max-w-lg bg-(--bg-card) h-full shadow-2xl z-10 flex flex-col ${isRtl ? 'border-r' : 'border-l'} border-white/10`}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-(--border-color) flex items-center justify-between bg-(--bg-main)/30">
                            <div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                    {order.orderId}
                                </span>
                                <h2 className="text-xl font-black text-(--text-main)">{t('admin.order_details') || "تفاصيل الطلب"}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-xl bg-(--bg-card) text-(--text-muted) flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-(--border-color)"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                            {/* Order Progress Control Center */}
                            <section className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-(--text-muted)">{t('admin.status_progress') || "تتبع وتحديث الحالة"}</h3>
                                    {order.archived && (
                                        <span className="bg-gray-100 text-gray-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">{t('admin.archived')}</span>
                                    )}
                                </div>

                                {/* Simplified Status Visualization */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-(--bg-main)/50 rounded-2xl border border-(--border-color)/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <FiClock size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-(--text-muted) font-black uppercase tracking-widest">{t('admin.order_status')}</p>
                                                <p className="text-sm font-black text-(--text-main)">{t(`admin.${order.status}`)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {steps.map((st, idx) => (
                                                <div
                                                    key={st}
                                                    className={`w-4 h-1 rounded-full transition-all duration-500 ${idx <= currentStepIndex ? "bg-primary" : "bg-(--border-color)"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Smart Actions Contextual */}
                                <div className="grid grid-cols-1 gap-3 mt-4">
                                    {order.status === "pending" && (
                                        <button
                                            onClick={handleConfirmNotify}
                                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <FiCheck size={18} />
                                            {t('admin.mark_confirmed') || "تأكيد الطلب وإبلاغ العميل"}
                                            <FaWhatsapp size={16} className="opacity-70" />
                                        </button>
                                    )}
                                    {order.status === "confirmed" && (
                                        <button
                                            onClick={() => updateStatus("preparing")}
                                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <FiPackage size={18} />
                                            {t('admin.mark_preparing') || "بدء تحضير الطلب"}
                                        </button>
                                    )}
                                    {order.status === "preparing" && (
                                        <button
                                            onClick={handleReadyNotify}
                                            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <FiBell size={18} />
                                            {t('admin.mark_ready') || "إخطار العميل بجاهزية الطلب"}
                                            <FaWhatsapp size={16} className="opacity-70" />
                                        </button>
                                    )}
                                    {(order.status === "ready" || order.status === "confirmed" || order.status === "preparing") && (
                                        <button
                                            onClick={() => updateStatus("delivered")}
                                            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <FiTruck size={18} />
                                            {t('admin.mark_delivered') || "تم التسليم بنجاح (إغلاق الطلب)"}
                                        </button>
                                    )}
                                    {order.status === "archived" && (
                                        <button
                                            onClick={() => updateStatus("pending")}
                                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <FiRotateCw size={18} />
                                            {t('admin.restore') || "استعادة الطلب ونقله للنشطة"}
                                        </button>
                                    )}
                                </div>
                            </section>

                            <hr className="border-(--border-color)/30" />

                            {/* Customer Info */}
                            <section className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-(--text-muted)">{t('admin.customer_details')}</h3>
                                <div className="grid gap-4 bg-(--bg-main)/50 p-5 rounded-3xl border border-(--border-color)/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                                            <FiUser size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-(--text-muted) font-bold">{t('admin.customer')}</p>
                                            <p className="text-sm font-black text-(--text-main)">{order.customer?.name}</p>
                                        </div>
                                    </div>
                                    {order.customer?.phone && (
                                        <div className="flex items-center gap-4 transition-transform hover:scale-102 cursor-pointer" onClick={() => OrderService.notifyCustomer(order, 'confirm')}>
                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 shadow-sm flex items-center justify-center text-green-600 border border-green-500/10">
                                                <FiPhone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-(--text-muted) font-bold">{t('admin.phone')}</p>
                                                <p className="text-sm font-black text-(--text-main) flex items-center gap-2">
                                                    {order.customer.phone}
                                                    <FaWhatsapp size={12} className="text-green-500" />
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {order.customer?.address && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-500">
                                                <FiMapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-(--text-muted) font-bold">{t('whatsapp.address')}</p>
                                                <p className="text-sm font-black text-(--text-main)">{order.customer.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Items List */}
                            <section className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-(--text-muted)">{t('admin.ordered_items')}</h3>
                                    <span className="px-3 py-1 rounded-lg bg-(--bg-main) text-(--text-muted) text-[10px] font-black uppercase tracking-widest">
                                        {order.items?.length} {t('common.items')}
                                    </span>
                                </div>
                                <div className="bg-(--bg-main)/50 rounded-3xl border border-(--border-color)/30 overflow-hidden divide-y divide-(--border-color)/30 shadow-inner">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="p-4 flex justify-between items-center group hover:bg-(--bg-card) transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                                    {item.qty}×
                                                </div>
                                                <span className="text-sm font-bold text-(--text-main)">
                                                    {isRtl ? item.nameAr : item.nameEn || item.nameAr}
                                                </span>
                                            </div>
                                            <span className="text-sm font-mono font-bold text-(--text-muted)">
                                                {item.total}₪
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Financial Summary */}
                            <section className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent rounded-[2.5rem] p-6 border border-primary/20 space-y-5 shadow-inner">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-xs font-black uppercase tracking-widest text-primary/60">{t('common.total')}</span>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-primary leading-none">{order.totalPrice}₪</div>
                                        <div className={`text-[9px] font-black uppercase mt-1 tracking-widest ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                            {order.paymentStatus === 'paid' ? t('admin.paid') : t('admin.unpaid')}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={updatePayment}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm transition-all border ${order.paymentStatus === "paid"
                                        ? "bg-green-500 text-white border-green-400 shadow-xl shadow-green-500/20"
                                        : "bg-white text-amber-600 border-amber-200 hover:bg-amber-50 shadow-sm"
                                        }`}
                                >
                                    <FiDollarSign size={16} />
                                    {order.paymentStatus === "paid" ? (t('admin.paid') || "دُفعت التكلفة ✅") : (t('admin.mark_as_paid') || "تحديد كمدفوع الآن")}
                                </button>
                            </section>

                            {order.customer?.notes && (
                                <section className="p-5 rounded-4xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-black text-amber-600 uppercase tracking-widest">
                                        <FiMessageSquare />
                                        <span>{t('whatsapp.notes')}</span>
                                    </div>
                                    <p className="text-sm font-bold text-amber-700 italic leading-relaxed">
                                        {order.customer.notes}
                                    </p>
                                </section>
                            )}

                        </div>

                        {/* Sticky Bottom Actions */}
                        <div className="p-6 border-t border-(--border-color) bg-(--bg-card) flex gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-(--bg-main) text-(--text-main) border border-(--border-color) rounded-2xl font-black text-sm hover:bg-(--bg-main)/50 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <FiChevronRight className={isRtl ? "rotate-180" : ""} />
                                {t('common.close')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Internal icons helper
function FiBell({ size }: { size: number }) {
    return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} xmlns="http://www.w3.org/2000/svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
}
