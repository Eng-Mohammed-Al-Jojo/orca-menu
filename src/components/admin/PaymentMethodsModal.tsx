import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus, FiTrash2, FiSave, FiCheck, FiSettings, FiImage, FiList, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { PaymentService } from "../../services/paymentService";
import type { PaymentMethod, PaymentMethodField } from "../../types/payment";
import { toast } from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function PaymentMethodsModal({ isOpen, onClose }: Props) {
    const { t } = useTranslation();

    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethod> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        const unsubscribe = PaymentService.listenToPaymentMethods((data) => {
            setMethods(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [isOpen]);

    const handleSave = async () => {
        if (!editingMethod || !editingMethod.name) {
            toast.error(t('common.name_required'));
            return;
        }

        try {
            await PaymentService.savePaymentMethod(editingMethod);
            toast.success(t('common.success_message'));
            setEditingMethod(null);
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('common.confirm_delete_extra'))) return;
        try {
            await PaymentService.deletePaymentMethod(id);
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const addField = () => {
        if (!editingMethod) return;
        const newField: PaymentMethodField = {
            id: `f_${Date.now()}`,
            label: "",
            value: ""
        };
        setEditingMethod({
            ...editingMethod,
            fields: [...(editingMethod.fields || []), newField]
        });
    };

    const updateField = (fieldId: string, key: keyof PaymentMethodField, value: string) => {
        if (!editingMethod || !editingMethod.fields) return;
        setEditingMethod({
            ...editingMethod,
            fields: editingMethod.fields.map(f => f.id === fieldId ? { ...f, [key]: value } : f)
        });
    };

    const removeField = (fieldId: string) => {
        if (!editingMethod || !editingMethod.fields) return;
        setEditingMethod({
            ...editingMethod,
            fields: editingMethod.fields.filter(f => f.id !== fieldId)
        });
    };

    const toggleStatus = async (method: PaymentMethod) => {
        try {
            await PaymentService.savePaymentMethod({ ...method, isActive: !method.isActive });
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

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
                        className="relative w-full max-w-4xl bg-(--bg-card) rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-(--border-color) flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <FiSettings size={20} />
                                </div>
                                <h2 className="text-xl font-black text-(--text-main)">{t('admin.manage_payment_methods')}</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-(--bg-main) rounded-xl transition-all">
                                <FiX size={24} className="text-(--text-muted)" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Methods List */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-black text-(--text-muted) uppercase tracking-widest flex items-center gap-2">
                                            <FiList /> {t('admin.payment_methods_title')}
                                        </h3>
                                        <button
                                            onClick={() => setEditingMethod({ name: "", image: "", isActive: true, fields: [], order: methods.length + 1 })}
                                            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            <FiPlus /> {t('admin.add_payment_method')}
                                        </button>
                                    </div>

                                    {loading ? (
                                        <div className="py-10 text-center text-(--text-muted)">{t('common.loading')}</div>
                                    ) : methods.length === 0 ? (
                                        <div className="py-20 text-center bg-(--bg-main)/30 rounded-3xl border border-dashed border-(--border-color)">
                                            <p className="text-(--text-muted) font-bold">{t('admin.no_payment_methods')}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {methods.map((method) => (
                                                <div
                                                    key={method.id}
                                                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${editingMethod?.id === method.id ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-(--bg-main) border-(--border-color) hover:border-primary/30'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-white border border-(--border-color) flex items-center justify-center overflow-hidden shrink-0">
                                                            {method.image ? (
                                                                <img src={`/images/payment/${method.image}`} alt={method.name} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <FiImage className="text-(--text-muted)" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-(--text-main)">{method.name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${method.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                                                    {method.isActive ? t('admin.active_orders') : t('admin.archived')}
                                                                </span>
                                                                <span className="text-[10px] text-(--text-muted) font-bold">{method.fields.length} {t('common.details')}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleStatus(method)}
                                                            className={`p-2 rounded-xl transition-all ${method.isActive ? 'text-green-500 hover:bg-green-500/10' : 'text-red-500 hover:bg-red-500/10'}`}
                                                            title={t('admin.active_status')}
                                                        >
                                                            {method.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingMethod(method)}
                                                            className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                                                        >
                                                            <FiPlus size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(method.id)}
                                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Editor Form */}
                                <div className="bg-(--bg-main) p-8 rounded-4xl border border-(--border-color) h-fit sticky top-0">
                                    <AnimatePresence mode="wait">
                                        {editingMethod ? (
                                            <motion.div
                                                key="editor"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-black text-(--text-main)">
                                                        {editingMethod.id ? t('admin.edit_payment_method') : t('admin.add_payment_method')}
                                                    </h3>
                                                    <button onClick={() => setEditingMethod(null)} className="text-(--text-muted) hover:text-red-500 hover:rotate-90 transition-all">
                                                        <FiX />
                                                    </button>
                                                </div>

                                                {/* Basic Info */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest block mb-2">{t('admin.method_name')}</label>
                                                        <input
                                                            value={editingMethod.name || ""}
                                                            onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                                                            className="w-full bg-(--bg-card) border border-(--border-color) rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:border-primary transition-all"
                                                            placeholder={t('admin.method_name')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest block mb-2">{t('admin.image_name')}</label>
                                                        <input
                                                            value={editingMethod.image || ""}
                                                            onChange={(e) => setEditingMethod({ ...editingMethod, image: e.target.value })}
                                                            className="w-full bg-(--bg-card) border border-(--border-color) rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:border-primary transition-all"
                                                            placeholder="example.png"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3 py-2">
                                                        <button
                                                            onClick={() => setEditingMethod({ ...editingMethod, isActive: !editingMethod.isActive })}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editingMethod.isActive ? 'bg-green-500 text-white' : 'bg-red-500/10 text-red-500'}`}
                                                        >
                                                            {editingMethod.isActive ? <FiCheck /> : <FiX />}
                                                            {t('admin.active_status')}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Fields */}
                                                <div className="pt-6 border-t border-(--border-color)">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest">{t('admin.account_details')}</label>
                                                        <button onClick={addField} className="text-primary hover:bg-primary/5 px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all">
                                                            <FiPlus /> {t('admin.add_field')}
                                                        </button>
                                                    </div>

                                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                                        {editingMethod.fields?.map((field) => (
                                                            <div key={field.id} className="flex gap-2 p-3 bg-(--bg-card) rounded-2xl border border-(--border-color) relative group">
                                                                <div className="flex-1 space-y-2">
                                                                    <input
                                                                        value={field.label}
                                                                        onChange={(e) => updateField(field.id, "label", e.target.value)}
                                                                        placeholder={t('admin.field_label')}
                                                                        className="w-full bg-(--bg-main) border border-(--border-color) rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                                                    />
                                                                    <input
                                                                        value={field.value}
                                                                        onChange={(e) => updateField(field.id, "value", e.target.value)}
                                                                        placeholder={t('admin.field_value')}
                                                                        className="w-full bg-(--bg-main) border border-(--border-color) rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-primary transition-all"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={() => removeField(field.id)}
                                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all h-fit self-center"
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {(!editingMethod.fields || editingMethod.fields.length === 0) && (
                                                            <p className="text-center text-[10px] text-(--text-muted) py-4 italic">{t('admin.no_details_placeholder') || "لا يوجد حقول مضافة"}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleSave}
                                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                                                >
                                                    <FiSave /> {t('common.save')}
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="h-96 flex flex-col items-center justify-center text-center p-6 space-y-4"
                                            >
                                                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/30 text-3xl">
                                                    <FiList />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-(--text-main) mb-1">{t('admin.payment_editor_title') || "محرر طرق الدفع"}</h4>
                                                    <p className="text-xs text-(--text-muted) font-bold">{t('admin.payment_editor_desc') || "اختر طريقة دفع من القائمة لتعديلها أو أضف واحدة جديدة"}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
