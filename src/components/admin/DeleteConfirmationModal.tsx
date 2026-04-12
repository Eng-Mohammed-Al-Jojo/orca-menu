import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    details?: string;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, details }: Props) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-(--bg-card) rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden z-10 p-8 text-center"
                    >
                        {/* Warning Icon */}
                        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-red-500/20">
                            <FiAlertTriangle />
                        </div>

                        {/* Text */}
                        <h3 className="text-2xl font-black text-(--text-main) mb-3">
                            {title}
                        </h3>
                        <p className="text-(--text-muted) text-sm font-bold leading-relaxed mb-2">
                            {t('ar.delete_item_confirm') || "هل أنت متأكد من رغبتك في حذف هذا العنصر؟"}
                        </p>
                        {details && (
                            <div className="bg-(--bg-main) p-3 rounded-2xl border border-(--border-color) mb-6">
                                <span className="text-xs font-black text-primary tracking-widest uppercase">{details}</span>
                            </div>
                        )}

                        <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 mb-8">
                            <p className="text-xs font-black text-red-600 uppercase tracking-widest leading-loose">
                                ⚠️ {t('common.confirm_delete_extra') || "هذا الإجراء لا يمكن التراجع عنه وسيتم حذفه من القاعدة نهائياً"}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-(--bg-main) text-(--text-main) border border-(--border-color) rounded-2xl font-black text-sm hover:bg-(--bg-main)/50 transition-all active:scale-95"
                            >
                                <FiX className={`inline ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                {t('common.cancel') || "إلغاء"}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-sm hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all active:scale-95"
                            >
                                <FiCheck className={`inline ${isRtl ? 'ml-2' : 'mr-2'}`} />
                                {t('common.delete') || "تأكيد الحذف"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
