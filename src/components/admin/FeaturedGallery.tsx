import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiImage, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (img: string) => void;
    galleryImages: string[];
    selectedImage?: string;
    title?: string;
    basePath?: string;
    returnFullPath?: boolean;
}

const FeaturedGallery: React.FC<Props> = ({
    visible,
    onClose,
    onSelect,
    galleryImages,
    selectedImage,
    title,
    basePath = "/images/",
    returnFullPath = false
}) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredImages = galleryImages.filter((img) =>
        img.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const getFullSrc = (img: string) => {
        if (img.startsWith("/")) return img;
        // Ensure basePath ends with / and img doesn't start with it
        const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
        return `${normalizedBase}${img}`;
    };

    const handleSelect = (img: string) => {
        if (returnFullPath) {
            onSelect(getFullSrc(img));
        } else {
            onSelect(img);
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-(--bg-card)/80 backdrop-blur-2xl w-full max-w-2xl rounded-[2.5rem] border border-(--border-color) shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-(--border-color) bg-(--bg-main)/30 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl shadow-inner">
                                        <FiImage />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-(--text-main)">{title || t('admin.gallery_title')}</h2>
                                        <p className="text-(--text-muted) text-[10px] uppercase tracking-widest font-bold">{t('admin.select_image_desc')}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-(--bg-main) text-(--text-muted) hover:text-red-500 transition-all border border-(--border-color)">
                                    <FiX />
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative group">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('common.search') || "Search images..."}
                                    className="w-full bg-(--bg-card) border border-(--border-color) rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-primary transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-red-500 transition-colors"
                                    >
                                        <FiX />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                            <motion.div
                                layout
                                className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredImages.map((img) => {
                                        const isSelected = selectedImage === img || selectedImage === getFullSrc(img);
                                        return (
                                            <motion.button
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                key={img}
                                                type="button"
                                                onClick={() => handleSelect(img)}
                                                className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 aspect-square
                                                    ${isSelected ? "border-primary shadow-lg shadow-primary/20 scale-95" : "border-(--border-color) hover:border-primary/50 hover:scale-105"}`}
                                            >
                                                <img
                                                    src={getFullSrc(img)}
                                                    alt={img}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => e.currentTarget.src = '/logo.png'}
                                                />

                                                <AnimatePresence>
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center shadow-lg">
                                                                <FiCheck strokeWidth={4} />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none">
                                                    <span className="text-[8px] text-white font-black truncate w-full uppercase tracking-tighter">{img.split('/').pop()}</span>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>

                            {/* Empty State */}
                            {filteredImages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-20 text-center space-y-4"
                                >
                                    <div className="w-16 h-16 bg-(--bg-main) text-(--text-muted) rounded-3xl flex items-center justify-center mx-auto text-2xl shadow-inner">
                                        <FiSearch />
                                    </div>
                                    <div>
                                        <p className="text-(--text-main) font-black">{t('common.no_results') || "No images found"}</p>
                                        <p className="text-(--text-muted) text-xs font-medium">{t('common.try_another_search') || "Try adjusting your search term"}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-(--border-color) bg-(--bg-main)/30">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl bg-(--bg-main) text-(--text-muted) font-black border border-(--border-color) hover:bg-(--bg-card) transition-all"
                            >
                                {t('admin.close_gallery')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeaturedGallery;
