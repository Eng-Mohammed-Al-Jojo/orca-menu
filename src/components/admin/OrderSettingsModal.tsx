import { useState, useEffect } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiSettings, FiInfo, FiSmartphone, FiLayout, FiTruck, FiCoffee } from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { useTranslation } from "react-i18next";

/* ================= Toast ================= */
function Toast({ type, message }: { type: "success" | "error"; message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 30, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-0 left-1/2 z-200 px-10 py-5 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] text-white font-black flex items-center gap-4 backdrop-blur-xl border border-white/20 transition-all ${type === "success" ? "bg-green-500/90" : "bg-red-500/90"}`}
        >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                {type === "success" ? <FiCheck /> : "×"}
            </div>
            <span className="text-sm tracking-wide">{message}</span>
        </motion.div>
    );
}

/* ================= Simple Components ================= */
const inputClass = "w-full bg-(--bg-main) border border-(--border-color) rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-(--text-muted)/50";

function ServiceCheckbox({ title, enabled, onToggle, value, setValue, disabled, icon: Icon, required, isWaMode }: any) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    // In Dashboard mode, phone fields are irrelevant
    const showPhoneInput = isWaMode && enabled;

    return (
        <motion.div
            whileHover={!disabled ? { y: -4 } : {}}
            className={`relative p-6 rounded-3xl border transition-all duration-500 group overflow-hidden ${enabled
                ? "bg-linear-to-br from-primary/10 to-primary/5 border-primary/30 shadow-[0_15px_30px_rgba(var(--primary-rgb),0.1)]"
                : "bg-(--bg-main)/40 border-(--border-color) opacity-70 hover:opacity-100"
                } ${disabled ? "opacity-40 grayscale pointer-events-none" : ""}`}
        >
            {/* Gloss Effect */}
            <div className={`absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

            <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${enabled
                        ? "bg-primary text-white shadow-[0_8px_20px_rgba(var(--primary-rgb),0.4)] rotate-6"
                        : "bg-(--bg-card) text-(--text-muted) grayscale"
                        }`}>
                        <Icon />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-sm sm:text-base text-(--text-main) tracking-tight">{title}</span>
                        {required && enabled && !value.trim() && (
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1 bg-red-500/10 px-2 py-0.5 rounded-md w-fit"
                            >
                                {t('admin.required') || "مطلوب"}
                            </motion.span>
                        )}
                        {!isWaMode && enabled && (
                            <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest mt-1">
                                {t('admin.dashboard_managed') || "تدار عبر اللوحة"}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={onToggle}
                    disabled={disabled}
                    className={`relative w-12 h-6 rounded-full transition-all duration-500 border overflow-hidden ${enabled ? "bg-green-500 border-green-500/20" : "bg-gray-300/30 border-gray-400/20"
                        }`}
                >
                    <motion.span
                        animate={{ x: enabled ? (isRtl ? 2 : 24) : (isRtl ? 24 : 2) }}
                        className="absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white shadow-lg z-10"
                    />
                </button>
            </div>

            <AnimatePresence>
                {showPhoneInput && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden relative z-10"
                    >
                        <div className="relative">
                            <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500`}>
                                <FaWhatsapp size={14} />
                            </div>
                            <input
                                type="tel"
                                value={value}
                                onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
                                placeholder={t('admin.whatsapp_placeholder')}
                                className={`${inputClass} ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'} rounded-2xl! bg-white/5! border-white/5 focus:border-green-500/50 focus:ring-green-500/5 backdrop-blur-md transition-all text-xs font-black ${required && !value.trim() ? 'border-red-500/50 bg-red-500/5' : ''}`}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ================= Modal ================= */
export default function OrderSettingsModal({ setShowOrderSettings, orderSettings: initialSettings, onSave }: any) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [orderSystem, setOrderSystem] = useState(true);
    const [inRestaurant, setInRestaurant] = useState(false);
    const [takeaway, setTakeaway] = useState(false);
    const [orderMode, setOrderMode] = useState<"dashboard" | "whatsapp">("dashboard");
    const [inPhone, setInPhone] = useState("");
    const [outPhone, setOutPhone] = useState("");
    const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");
    const [footer, setFooter] = useState({ address: "", phone: "", whatsapp: "", facebook: "", instagram: "", tiktok: "" });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<any>(null);

    useEffect(() => {
        if (!initialSettings) return;
        setOrderSystem(initialSettings.orderSystem ?? true);
        const s = initialSettings.orderSettings ?? {};
        setInRestaurant(!!s.inRestaurant);
        setTakeaway(!!s.takeaway);
        setOrderMode(initialSettings.orderMode || "dashboard");
        setInPhone(s.inPhone || "");
        setOutPhone(s.outPhone || "");
        setComplaintsWhatsapp(initialSettings.complaintsWhatsapp || "");
        setFooter(initialSettings.footerInfo || {});
        setLoading(false);
    }, [initialSettings]);

    if (loading) return null;

    const handleSave = async () => {
        // Strict Validation for WhatsApp Mode only
        if (orderMode === "whatsapp") {
            const enabledAnyService = inRestaurant || takeaway;
            if (!enabledAnyService) {
                setToast({ type: "error", message: t('admin.no_service_enabled') || "يجب تفعيل خدمة واحدة على الأقل" });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            if ((inRestaurant && inPhone.trim() === "") || (takeaway && outPhone.trim() === "")) {
                setToast({ type: "error", message: t('admin.whatsapp_required') });
                setTimeout(() => setToast(null), 3000);
                return;
            }
        }

        const newSettings = {
            orderSystem, // General kill-switch
            orderMode,   // Global Source of Truth (dashboard | whatsapp)
            orderSettings: {
                inRestaurant, // Availability only
                takeaway,     // Availability only
                inPhone,      // Required only for WA mode
                outPhone      // Required only for WA mode
            },
            complaintsWhatsapp,
            footerInfo: footer,
        };

        try {
            setSaving(true);
            await update(ref(db, "settings"), newSettings);
            console.log("✅ [OrderSettings] Saved successfully.");
            onSave?.(newSettings);
            setToast({ type: "success", message: t('admin.settings_saved_success') });
            setTimeout(() => setShowOrderSettings(false), 1500);
        } catch (error) {
            console.error("❌ [OrderSettings] Save failed:", error);
            setToast({ type: "error", message: t('admin.settings_save_error') });
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowOrderSettings(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-(--bg-card)/80 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] border border-(--border-color) shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-linear-to-b from-white/5 to-transparent relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10" />
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-primary to-primary/80 text-white flex items-center justify-center text-3xl shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] relative group">
                            <FiSettings className="group-hover:rotate-90 transition-transform duration-700" />
                            <motion.div
                                className="absolute inset-0 rounded-3xl border-2 border-white/20"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-(--text-main) tracking-tight">{t('admin.system_settings')}</h2>
                            <p className="text-(--text-muted) text-[10px] uppercase font-black tracking-[0.3em] mt-1 opacity-60">{t('admin.system_config_desc')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowOrderSettings(false)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-(--text-muted) hover:text-white hover:bg-red-500 transition-all border border-white/5 shadow-inner"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Order Module Toggle */}
                    <div className="p-6 rounded-3xl bg-linear-to-r from-primary/5 to-transparent border border-primary/10 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${orderSystem ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-(--bg-card) text-(--text-muted)"}`}>
                                <FiSmartphone />
                            </div>
                            <span className="font-black text-xs sm:text-sm text-(--text-main)">{t('admin.enable_web_ordering')}</span>
                        </div>
                        <button
                            onClick={() => setOrderSystem((p) => !p)}
                            className={`relative w-12 sm:w-14 h-6 sm:h-7 rounded-full transition-all duration-300 border ${orderSystem ? "bg-green-500 border-green-500/20" : "bg-gray-300 border-gray-400"}`}
                        >
                            <motion.span animate={{ x: orderSystem ? (window.innerWidth < 640 ? 24 : 30) : 2 }} className="absolute top-0.5 left-0 w-4.5 sm:w-5.5 h-4.5 sm:h-5.5 rounded-full bg-white shadow-md" />
                        </button>
                    </div>

                    {/* Order Mode Switch */}
                    <div className="relative grid grid-cols-2 p-1.5 bg-black/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">

                        {/* SLIDER BACKGROUND */}
                        <motion.div
                            className="absolute top-1.5 bottom-1.5 w-1/2 bg-linear-to-r from-primary to-primary/90 rounded-2xl shadow-lg shadow-primary/20"
                            animate={{
                                left: orderMode === "dashboard"
                                    ? (isRtl ? "50%" : "0%")
                                    : (isRtl ? "0%" : "50%")
                            }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />

                        {/* DASHBOARD */}
                        <button
                            onClick={() => setOrderMode("dashboard")}
                            className={`relative z-10 py-3 text-[11px] font-black tracking-widest transition-all duration-300
        ${orderMode === "dashboard" ? "text-white" : "text-(--text-muted) hover:text-white/60"}`}
                        >
                            {t('admin.mode_dashboard')}
                        </button>

                        {/* WHATSAPP */}
                        <button
                            onClick={() => setOrderMode("whatsapp")}
                            className={`relative z-10 py-3 text-[11px] font-black tracking-widest transition-all duration-300
        ${orderMode === "whatsapp" ? "text-white" : "text-(--text-muted) hover:text-white/60"}`}
                        >
                            {t('admin.mode_whatsapp')}
                        </button>

                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={orderMode}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                            <ServiceCheckbox
                                title={t('admin.local_ordering')}
                                icon={FiCoffee}
                                enabled={inRestaurant}
                                onToggle={() => setInRestaurant((p) => !p)}
                                value={inPhone}
                                setValue={setInPhone}
                                disabled={!orderSystem}
                                required={orderMode === "whatsapp"}
                                isWaMode={orderMode === "whatsapp"}
                            />
                            <ServiceCheckbox
                                title={t('admin.takeaway_delivery')}
                                icon={FiTruck}
                                enabled={takeaway}
                                onToggle={() => setTakeaway((p) => !p)}
                                value={outPhone}
                                setValue={setOutPhone}
                                disabled={!orderSystem}
                                required={orderMode === "whatsapp"}
                                isWaMode={orderMode === "whatsapp"}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Complaints */}
                    <div className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 space-y-5 relative group overflow-hidden">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-500/20 rotate-[-4deg] transition-transform group-hover:rotate-0">
                                <FiInfo size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-sm text-(--text-main) tracking-tight">{t('admin.complaints_whatsapp')}</h3>
                                <p className="text-[10px] text-(--text-muted) font-bold mt-0.5">{t('admin.feedback_channel') || "قناة التواصل للشكاوى والملاحظات"}</p>
                            </div>
                        </div>
                        <div className="relative">
                            <FaWhatsapp className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-red-500 z-10`} />
                            <input
                                value={complaintsWhatsapp}
                                onChange={(e) => setComplaintsWhatsapp(e.target.value.replace(/\D/g, ""))}
                                placeholder={t('admin.whatsapp_placeholder')}
                                className={`${inputClass} ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'} bg-white/5! border-white/5 focus:border-red-500/40 focus:ring-red-500/5 backdrop-blur-md transition-all text-xs font-black rounded-2xl!`}
                            />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-6 relative shadow-inner">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 text-primary flex items-center justify-center border border-white/10 shadow-inner">
                                <FiLayout size={20} />
                            </div>
                            <h3 className="font-black text-sm text-(--text-main) tracking-tight">{t('admin.footer_info')}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <FiLayout className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary`} />
                                <input placeholder={t('admin.address_detail')} value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'} bg-white/5! border-white/5 rounded-2xl! text-xs font-black`} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <FiSmartphone className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-primary`} />
                                    <input placeholder={t('admin.primary_phone')} value={footer.phone} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'} bg-white/5! border-white/5 rounded-2xl! text-xs font-black`} />
                                </div>
                                <div className="relative group">
                                    <FaWhatsapp className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-green-500`} />
                                    <input placeholder={t('admin.contact_whatsapp')} value={footer.whatsapp} onChange={(e) => setFooter({ ...footer, whatsapp: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'} bg-white/5! border-white/5 rounded-2xl! text-xs font-black`} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="relative group">
                                    <FaFacebook className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-blue-500`} />
                                    <input placeholder="FB" value={footer.facebook} onChange={(e) => setFooter({ ...footer, facebook: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-11 pl-2' : 'pl-11 pr-2'} bg-white/5! border-white/5 rounded-2xl! text-[10px] font-black`} />
                                </div>
                                <div className="relative group">
                                    <FaInstagram className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-pink-500`} />
                                    <input placeholder="IG" value={footer.instagram} onChange={(e) => setFooter({ ...footer, instagram: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-11 pl-2' : 'pl-11 pr-2'} bg-white/5! border-white/5 rounded-2xl! text-[10px] font-black`} />
                                </div>
                                <div className="relative group">
                                    <FaTiktok className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-blue-200`} />
                                    <input placeholder="TT" value={footer.tiktok} onChange={(e) => setFooter({ ...footer, tiktok: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-11 pl-2' : 'pl-11 pr-2'} bg-white/5! border-white/5 rounded-2xl! text-[10px] font-black`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Save */}
                <div className="p-8 border-t border-white/5 bg-linear-to-t from-white/5 to-transparent">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full py-5 rounded-3xl font-black text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex items-center justify-center gap-4 transition-all relative overflow-hidden group ${saving
                            ? "bg-green-500/50 cursor-not-allowed"
                            : "bg-linear-to-r from-green-500 to-emerald-600 hover:shadow-green-500/30"
                            }`}
                    >
                        <AnimatePresence mode="wait">
                            {saving ? (
                                <motion.div
                                    key="saving"
                                    initial={{ opacity: 0, rotate: -180 }}
                                    animate={{ opacity: 1, rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                    className="text-2xl"
                                >
                                    ⚙️
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="save"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"
                                >
                                    <FiCheck />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <span className="text-sm uppercase tracking-[0.2em]">{t('admin.save_changes')}</span>

                        {/* Shimmer Effect */}
                        {!saving && (
                            <motion.div
                                animate={{ x: ['100%', '-100%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-full"
                            />
                        )}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {toast && (
                        <Toast type={toast.type} message={toast.message} />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
