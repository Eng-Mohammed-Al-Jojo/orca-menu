import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  /** When true, screen is visible. When false, triggers fade-out. */
  visible: boolean;
  /** Called after fade-out animation completes */
  onExited?: () => void;
}

export default function LoadingScreen({ visible, onExited }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  // Smooth animated progress — crawls toward 90%, then jumps to 100% when data is ready
  useEffect(() => {
    if (!visible) {
      // Data is ready — snap to 100% before fading out
      setProgress(100);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const diff = 90 - prev;
        return prev + diff * 0.08 + Math.random() * 0.5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [visible]);

  const messages = isRtl
    ? ["نصنع لك يوم", "استمتع بتجربتك"]
    : ["We're making your day", "Enjoy your experience"];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  // SVG Circular Progress Constants
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence onExitComplete={onExited}>
      {visible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden bg-white"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* 1. The Deep Cinematic Canvas */}
          {/* <div className="absolute inset-0 z-0">
                        <motion.div
                            initial={{ scale: 1.2, filter: "brightness(0.5) blur(5px)" }}
                            animate={{ scale: 1, filter: "brightness(0.8) blur(0px)" }}
                            transition={{ duration: 8, ease: "easeOut" }}
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: "url('/image.jpg')" }}
                        />
                        <div className="absolute inset-0 bg-black/50" />
                        <div
                            className="absolute inset-0"
                            style={{ background: `radial-gradient(circle at center, transparent 0%, var(--bg-main) 85%)` }}
                        />
                    </div> */}

          {/* 2. Sweeping Light Flares */}
          {/* <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen overflow-hidden">
                        <motion.div
                            animate={{
                                x: ['-50vw', '150vw'],
                                opacity: [0, 0.5, 0]
                            }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[20%] w-[80vw] h-[30vh] bg-primary/20 blur-[100px] rotate-[-25deg]"
                        />
                        <motion.div
                            animate={{
                                x: ['150vw', '-50vw'],
                                opacity: [0, 0.3, 0]
                            }}
                            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute bottom-[20%] w-[80vw] h-[40vh] bg-secondary/20 blur-[120px] rotate-15"
                        />
                    </div> */}

          {/* 3. The Grand Centerpiece */}
          <div className="relative z-10 w-[300px] h-[300px] flex items-center justify-center -mt-8">

            {/* SVG Majestic Halo */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(var(--color-primary),0.4)]" viewBox="0 0 280 280">
              <defs>
                <linearGradient id="haloGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="50%" stopColor="var(--color-secondary, #fff)" />
                  <stop offset="100%" stopColor="var(--color-primary)" />
                </linearGradient>
              </defs>

              {/* Background faint track */}
              <circle
                cx="140" cy="140" r={radius}
                stroke="currentColor" strokeWidth="1" fill="none"
                className="text-primary"
              />

              {/* Animated progress arc */}
              <motion.circle
                cx="140" cy="140" r={radius}
                stroke="url(#haloGlow)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ strokeDasharray: circumference }}
              />

              {/* Inner Decorative Ring */}
              <circle
                cx="140" cy="140" r={radius - 12}
                stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 15"
                fill="none"
                className="text-primary opacity-20"
              />
              {/* Outer Decorative Ring */}
              <circle
                cx="140" cy="140" r={radius + 12}
                stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 20"
                fill="none"
                className="text-primary opacity-20"
              />
            </svg>

            {/* The Floating Glass Orb */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="
                relative w-40 h-40 rounded-full 
                bg-white
                border border-white/30
                shadow-xl
                flex items-center justify-center p-6 overflow-hidden
                transition-shadow duration-500
              "
            >
              {/* Inner Orb Shine */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                className="absolute inset-0 bg-linear-to-tr from-transparent via-primary to-transparent skew-x-12"
              />
              {/* Logo */}
              <motion.img
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ willChange: "transform" }}
                src="/logo.png"
                className="w-full h-full object-contain relative z-10 "
                alt="Logo"
              />
            </motion.div>

          </div>

          {/* 4. Typography & Percentage */}
          <div className="relative z-10 mt-16 w-full flex flex-col items-center">

            <AnimatePresence mode="wait">
              <motion.div
                key={msgIndex}
                initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-xl md:text-2xl font-bold text-(--text-main) tracking-widest text-center"
              >
                {messages[msgIndex]}
              </motion.div>
            </AnimatePresence>

            {/* Percentage Display */}
            <div className="mt-8 flex items-center gap-6 opacity-80">
              <div className="h-px w-16 bg-linear-to-r from-transparent to-primary" />
              <span className="text-sm font-bold text-primary tracking-[0.4em] drop-shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" dir="ltr">
                {Math.round(progress)}%
              </span>
              <div className="h-px w-16 bg-linear-to-l from-transparent to-primary" />
            </div>

          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}