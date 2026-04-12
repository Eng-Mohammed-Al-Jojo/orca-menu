import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    visible: boolean;
    onExited?: () => void;
}

export default function LoadingScreen({ visible, onExited }: Props) {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === "ar";

    const [progress, setProgress] = useState(0);
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        if (!visible) {
            const finish = setInterval(() => {
                setProgress((p) => {
                    if (p >= 100) { clearInterval(finish); return 100; }
                    return p + 2.5;
                });
            }, 16);
            return () => clearInterval(finish);
        }
        const interval = setInterval(() => {
            setProgress((p) => (p >= 93 ? p : p + 0.4));
        }, 20);
        return () => clearInterval(interval);
    }, [visible]);

    const messages = isRtl
        ? ["نُحضّر التجربة...", "نصنع النكهة...", "لحظات قليلة...", "مرحباً بك"]
        : ["Crafting experience...", "Building flavors...", "Almost ready...", "Welcome"];

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((p) => (p + 1) % messages.length);
        }, 2200);
        return () => clearInterval(interval);
    }, [messages.length]);

    // Particles generated once — no re-render
    const particles = useMemo(() =>
        Array.from({ length: 14 }, (_, i) => ({
            left: `${10 + Math.random() * 80}%`,
            delay: Math.random() * 5,
            duration: 4 + Math.random() * 3,
            color: ["var(--color-primary)", "var(--color-secondary)"][i % 2],
        })), []
    );

    const dotColors = ["var(--color-primary)", "var(--color-secondary)", "var(--color-primary)"];

    return (
        <AnimatePresence onExitComplete={onExited}>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.6 } }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        direction: isRtl ? "rtl" : "ltr",
                    }}
                >
                    {/* Background */}
                    <div style={{ position: "absolute", inset: 0, background: "#fff" }} />

                    {/* Orb 1 */}
                    <motion.div
                        style={{
                            position: "absolute",
                            width: 500, height: 500,
                            borderRadius: "50%",
                            background: "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 70%)",
                            top: -80, left: -80,
                        }}
                        animate={{ x: [-30, 30, -30], y: [-20, 20, -20] }}
                        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Orb 2 */}
                    <motion.div
                        style={{
                            position: "absolute",
                            width: 450, height: 450,
                            borderRadius: "50%",
                            background: "radial-gradient(circle, color-mix(in srgb, var(--color-secondary) 14%, transparent) 0%, transparent 70%)",
                            bottom: -60, right: -60,
                        }}
                        animate={{ x: [25, -25, 25], y: [15, -15, 15] }}
                        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Particles */}
                    {particles.map((p, i) => (
                        <motion.div
                            key={i}
                            style={{
                                position: "absolute",
                                bottom: "15%",
                                left: p.left,
                                width: 3, height: 3,
                                borderRadius: "50%",
                                background: p.color,
                                pointerEvents: "none",
                            }}
                            animate={{ y: [0, -180], opacity: [0, 0.7, 0] }}
                            transition={{
                                duration: p.duration,
                                delay: p.delay,
                                repeat: Infinity,
                                ease: "easeOut",
                            }}
                        />
                    ))}

                    {/* Main content */}
                    <div style={{
                        position: "relative",
                        zIndex: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                    }}>

                        {/* Logo + 3 rings */}
                        <motion.div
                            style={{
                                position: "relative",
                                width: 128, height: 128,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 28,
                            }}
                            animate={{ scale: [0.95, 1.05, 0.95] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {/* Ring 1 */}
                            <motion.div
                                style={{
                                    position: "absolute", inset: 0,
                                    borderRadius: "50%",
                                    border: "1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)",
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                            />
                            {/* Ring 2 — dashed */}
                            <motion.div
                                style={{
                                    position: "absolute", inset: -12,
                                    borderRadius: "50%",
                                    border: "1px dashed color-mix(in srgb, var(--color-secondary) 25%, transparent)",
                                }}
                                animate={{ rotate: -360 }}
                                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                            />
                            {/* Ring 3 — slow */}
                            <motion.div
                                style={{
                                    position: "absolute", inset: -24,
                                    borderRadius: "50%",
                                    border: "1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)",
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                            />

                            <img
                                src="/logo.png"
                                style={{ width: 120, height: 120, objectFit: "contain" }}
                                alt="logo"
                            />
                        </motion.div>

                        {/* 3 bouncing dots */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 50, marginTop: 50 }}>
                            {dotColors.map((color, i) => (
                                <motion.div
                                    key={i}
                                    style={{ width: 5, height: 5, borderRadius: "50%", background: color }}
                                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                                    transition={{
                                        duration: 1.4, repeat: Infinity,
                                        delay: i * 0.2, ease: "easeInOut",
                                    }}
                                />
                            ))}
                        </div>

                        {/* Message */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={msgIndex}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.35 }}
                                style={{
                                    fontSize: 14,
                                    color: "rgba(0,0,0,0.45)",
                                    letterSpacing: "0.12em",
                                    marginBottom: 28,
                                    minHeight: 20,
                                }}
                            >
                                {messages[msgIndex]}
                            </motion.div>
                        </AnimatePresence>

                        {/* Progress bar */}
                        <div style={{
                            width: 200, height: 2,
                            background: "rgba(0,0,0,0.08)",
                            borderRadius: 99,
                            overflow: "hidden",
                            marginBottom: 10,
                        }}>
                            <motion.div
                                style={{
                                    height: "100%",
                                    width: `${progress}%`,
                                    background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-primary))",
                                    backgroundSize: "200% 100%",
                                    borderRadius: 99,
                                }}
                                animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            />
                        </div>

                        {/* Percentage */}
                        <div style={{
                            fontSize: 11,
                            letterSpacing: "0.35em",
                            color: "rgba(0,0,0,0.35)",
                        }}>
                            {Math.round(progress)}%
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}