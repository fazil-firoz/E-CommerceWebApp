import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useScroll, useTransform, motion, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';

// ─── Exact PNG file list present in UI/public/Images/Animation ───────────────
const FRAME_FILES = Array.from({ length: 79 }, (_, i) => `frame_${String(i + 1).padStart(3, '0')}.png`).concat(['frame_081.png']);
const TOTAL_FRAMES = FRAME_FILES.length;
const framePaths   = FRAME_FILES.map(f => `/Images/Animation/${f}`);

// ─── Preload PNG frames at 100% Original HD Quality ──────────────────────────
function preloadFrames(onProgress) {
  const images = new Array(TOTAL_FRAMES);
  let loaded = 0;
  return new Promise((resolve) => {
    framePaths.forEach((src, i) => {
      const img = new window.Image();
      img.src = src;
      img.onload = img.onerror = () => {
        images[i] = img;
        loaded++;
        onProgress(loaded / TOTAL_FRAMES);
        if (loaded === TOTAL_FRAMES) resolve(images);
      };
    });
  });
}

// ─── Main 3D Scroll Showcase Component ────────────────────────────────────────
export default function HeroScrollAnimation({
  primaryColor = '#ff6584',
  accentColor  = '#ff2a6d',
  backgroundColor = '#fad5d9',
  onNavigateToProducts,
}) {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const imagesRef    = useRef([]);
  const rafRef       = useRef(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded]         = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  // ── Scroll Progress ──────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target:  containerRef,
    offset:  ['start start', 'end end'],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 85,
    damping:   22,
    restDelta: 0.0005,
  });

  // ── Multi-stage frame mapping: Gentle opening start -> main explosion -> smooth final completion
  const frameIndex = useTransform(
    smooth,
    [0, 0.12, 0.52, 0.72],
    [0, 10, 64, TOTAL_FRAMES - 1]
  );

  // ── Side text emerging transforms (animate out from behind video and stay)
  const leftOpacity  = useTransform(smooth, [0.10, 0.38], [0, 1]);
  const leftX        = useTransform(smooth, [0.10, 0.38], [-60, 0]);

  const rightOpacity = useTransform(smooth, [0.10, 0.38], [0, 1]);
  const rightX       = useTransform(smooth, [0.10, 0.38], [60, 0]);

  // ── CTA button emerging below and staying
  const ctaOpacity   = useTransform(smooth, [0.28, 0.52], [0, 1]);
  const ctaY         = useTransform(smooth, [0.28, 0.52], [30, 0]);

  const progressWidth = useTransform(smooth, [0, 1], ['0%', '100%']);
  const hintOpacity   = useTransform(smooth, [0, 0.05], [1, 0]);

  // Word stagger animation variants for left/right side text
  const wordVariants = {
    hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.13,
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  // Helper to split text into per-word animated spans
  const AnimatedWords = ({ text, style }) => (
    <span style={{ display: 'inline', ...style }}>
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={wordVariants}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );

  // ── Aspect-ratio contain canvas draw (Clean Raw Image Draw with Border Cropping) ─
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[Math.round(index)];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Clear canvas completely — NO background color splash or box
    ctx.clearRect(0, 0, w, h);

    // Crop 14px off top and bottom to completely remove dark letterbox lines
    const sx = 0;
    const sy = 14;
    const imgW = img.naturalWidth;
    const imgH = Math.max(10, img.naturalHeight - 28);

    const imgRatio = imgW / imgH;
    const canvasRatio = w / h;
    let drawW = w;
    let drawH = h;
    let drawX = 0;
    let drawY = 0;

    if (canvasRatio > imgRatio) {
      drawH = h;
      drawW = h * imgRatio;
      drawX = (w - drawW) / 2;
    } else {
      drawW = w;
      drawH = w / imgRatio;
      drawY = (h - drawH) / 2;
      drawX = (w - drawW) / 2;
    }

    // Draw raw image frame cleanly without dark borders
    ctx.drawImage(img, sx, sy, imgW, imgH, drawX, drawY, drawW, drawH);
  }, []);

  useMotionValueEvent(frameIndex, 'change', (latest) => {
    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(latest)));
    setCurrentFrame(idx);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => drawFrame(idx));
  });

  // ── Preload PNG images ────────────────────────────────────────────────────
  useEffect(() => {
    preloadFrames((p) => setLoadProgress(p)).then((imgs) => {
      imagesRef.current = imgs;
      setIsLoaded(true);
      drawFrame(0);
    });
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [drawFrame]);

  // ── Canvas DPR setup ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth  || 1920;
    const h = canvas.offsetHeight || 1080;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }, [isLoaded]);

  return (
    <div
      ref={containerRef}
      style={{ height: '105vh', position: 'relative' }}
    >
      {/* ── STICKY VIEWPORT — Raw Animated Image Display ─── */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 10px',
      }}>
        {/* ── Loading overlay ───────────────────────────────────────────── */}
        {!isLoaded && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 50,
            background: 'transparent',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
          }}>
            <div style={{ fontSize: '48px', animation: 'hs-spin 2s linear infinite' }}>🎁</div>
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '13px', margin: 0 }}>
              Loading Animation… {Math.round(loadProgress * 100)}%
            </p>
          </div>
        )}

        {/* ── RAW ANIMATED CANVAS DISPLAY (No Dark Borders, No Color Splash) ────── */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '960px',
          height: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
        </div>

        {/* ── CTA BUTTON BELOW ANIMATION (Emerged smoothly & stays) ─────────── */}
        <motion.div style={{
          position: 'absolute',
          bottom: '36px',
          zIndex: 30,
          opacity: ctaOpacity,
          y: ctaY,
          pointerEvents: 'auto',
        }}>
          <button
            onClick={onNavigateToProducts}
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
              color: '#ffffff',
              border: 'none',
              borderRadius: '50px',
              padding: '14px 42px',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '0.4px',
              cursor: 'pointer',
              boxShadow: `0 10px 32px ${primaryColor}55, 0 0 0 4px rgba(255,255,255,0.70)`,
              transition: 'transform 0.22s ease, box-shadow 0.22s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 16px 44px ${primaryColor}75, 0 0 0 5px rgba(255,255,255,0.85)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = `0 10px 32px ${primaryColor}55, 0 0 0 4px rgba(255,255,255,0.70)`;
            }}
          >
            🎁 Explore Products &nbsp;→
          </button>
        </motion.div>

        {/* ── Scroll Progress Line Separator (Loads left-to-right on scroll) ── */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3.5px',
          background: 'rgba(0,0,0,0.06)',
          zIndex: 40,
        }}>
          <motion.div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
            width: progressWidth,
            boxShadow: `0 0 10px ${primaryColor}90`,
            borderRadius: '0 4px 4px 0',
          }} />
        </div>
      </div>
      <style>{`@keyframes hs-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
