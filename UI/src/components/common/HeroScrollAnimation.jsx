import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useScroll, useTransform, motion, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';

// ─── Exact PNG file list present in UI/public/Images/Animation ───────────────
const FRAME_FILES = Array.from({ length: 54 }, (_, i) => `frame_${String(i + 1).padStart(3, '0')}.png`).concat(['frame_056.png']);
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
    stiffness: 130,
    damping:   26,
    restDelta: 0.0005,
  });

  // ── Frame sequence maps over [0, 0.65] scroll so animation finishes early and stays completed
  const frameIndex   = useTransform(smooth, [0, 0.65], [0, TOTAL_FRAMES - 1]);

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

  // ── Aspect-ratio contain canvas draw (With Black Line Cropping & Seamless Feathering)
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[Math.round(index)];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const bgTone = backgroundColor || '#fad5d9';

    // 1. Fill canvas with exact background tone #fad5d9
    ctx.fillStyle = bgTone;
    ctx.fillRect(0, 0, w, h);

    // 2. Crop out 6px black letterbox lines from top and bottom of source frame
    const sx = 0;
    const sy = 6;
    const imgW = img.naturalWidth || 1920;
    const imgH = Math.max(100, (img.naturalHeight || 1080) - 12);

    const imgRatio = imgW / imgH;
    const canvasRatio = w / h;
    let drawW = w;
    let drawH = h;
    let drawX = 0;
    let drawY = 0;

    if (canvasRatio > imgRatio) {
      drawH = h;
      drawW = h * imgRatio;
      drawX = (w - drawW) / 2 - (drawW * 0.16); // Lean over to the left
    } else {
      drawW = w;
      drawH = w / imgRatio;
      drawY = (h - drawH) / 2;
      drawX = - (drawW * 0.16); // Lean over to the left
    }

    // Draw cropped image cleanly with optical centering
    ctx.drawImage(img, sx, sy, imgW, imgH, drawX, drawY, drawW, drawH);

    // 3. Radial edge-feathering centered on the gift box position
    const centerX = drawX + drawW * 0.61; // Center feathering on the 3D gift box location
    const centerY = drawY + drawH / 2;
    const innerRadius = Math.min(drawW, drawH) * 0.26;
    const outerRadius = Math.max(drawW, drawH) * 0.48;

    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
    gradient.addColorStop(0, 'rgba(250, 213, 217, 0)');
    gradient.addColorStop(0.50, 'rgba(250, 213, 217, 0.35)');
    gradient.addColorStop(0.80, 'rgba(250, 213, 217, 0.85)');
    gradient.addColorStop(1, 'rgba(250, 213, 217, 1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }, [backgroundColor]);

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

  // Responsive blending color matching studio backdrop #fad5d9
  const blendedBg = backgroundColor || '#fad5d9';

  return (
    <div
      ref={containerRef}
      style={{ height: '105vh', position: 'relative' }}
    >
      {/* ── STICKY VIEWPORT — Seamless Blending with Studio Backdrop Tone ─── */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        background: blendedBg || '#fad5d9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
        transition: 'background 0.3s ease',
      }}>

        {/* ── Loading overlay ───────────────────────────────────────────── */}
        {!isLoaded && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 50,
            background: `linear-gradient(135deg, ${blendedBg} 0%, #ffdadf 100%)`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '20px',
          }}>
            <div style={{ fontSize: '72px', animation: 'hs-spin 2s linear infinite' }}>🎁</div>
            <div style={{ width: '240px', height: '6px', background: '#ffffff80', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.round(loadProgress * 100)}%`,
                background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
                borderRadius: '6px',
                transition: 'width 0.15s ease',
              }} />
            </div>
            <p style={{ color: '#475569', fontWeight: 700, fontSize: '13px', margin: 0 }}>
              Unwrapping 3D Magic… {Math.round(loadProgress * 100)}%
            </p>
            <style>{`@keyframes hs-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
          </div>
        )}

        {/* ── MAIN SHOWCASE CONTAINER (Grid & Flex for 3D Video & Side Text) ─ */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1280px',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

          {/* ── LEFT SIDE TEXT ────────────────────────────────────── */}
          <motion.div
            className="hs-side-text-left"
            initial="hidden"
            animate={leftOpacity.get() > 0.05 ? 'visible' : 'hidden'}
            style={{
              position: 'absolute',
              left: '3%',
              top: '28%',
              maxWidth: '300px',
              zIndex: 10,
              opacity: leftOpacity,
              x: leftX,
              textAlign: 'left',
              pointerEvents: 'none',
            }}
          >
            <motion.span
              variants={wordVariants}
              custom={0}
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(12px)',
                color: primaryColor,
                border: `1px solid ${primaryColor}35`,
                borderRadius: '20px',
                padding: '4px 14px',
                fontWeight: 700,
                fontSize: '10px',
                marginBottom: '12px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                fontFamily: "'Outfit', sans-serif",
                boxShadow: `0 2px 12px ${primaryColor}18`,
              }}
            >
              🌸 Kawaii Unboxing
            </motion.span>

            <h2 style={{
              fontSize: 'clamp(20px, 2.2vw, 32px)',
              fontWeight: 700,
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              color: '#1e293b',
              marginBottom: '10px',
              lineHeight: 1.22,
              letterSpacing: '0.2px'
            }}>
              <AnimatedWords text="Magical Plushies" />
              <br />
              <AnimatedWords text="& Gift Boxes" />
            </h2>

            <motion.p
              variants={wordVariants}
              custom={6}
              style={{
                color: '#64748b',
                fontSize: '13px',
                lineHeight: 1.65,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 500,
                margin: 0,
                letterSpacing: '0.1px'
              }}
            >
              Handcrafted with love to bring pure joy, comfort &amp; endless smiles.
            </motion.p>
          </motion.div>

          {/* ── CENTER 3D CANVAS (Optically Centered, Larger Size & 100% Borderless Masking) ── */}
          <div style={{
            position: 'relative',
            width: 'clamp(360px, 68vw, 920px)',
            height: 'clamp(360px, 72vh, 700px)',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, #000 35%, rgba(0,0,0,0.85) 60%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 65% 65% at 50% 50%, #000 35%, rgba(0,0,0,0.85) 60%, transparent 85%)',
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

          {/* ── RIGHT SIDE TEXT ────────────────────────────────────── */}
          <motion.div
            className="hs-side-text-right"
            initial="hidden"
            animate={rightOpacity.get() > 0.05 ? 'visible' : 'hidden'}
            style={{
              position: 'absolute',
              right: '3%',
              top: '28%',
              maxWidth: '300px',
              zIndex: 10,
              opacity: rightOpacity,
              x: rightX,
              textAlign: 'right',
              pointerEvents: 'none',
            }}
          >
            <motion.span
              variants={wordVariants}
              custom={0}
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(12px)',
                color: accentColor,
                border: `1px solid ${accentColor}35`,
                borderRadius: '20px',
                padding: '4px 14px',
                fontWeight: 700,
                fontSize: '10px',
                marginBottom: '12px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                fontFamily: "'Outfit', sans-serif",
                boxShadow: `0 2px 12px ${accentColor}18`,
              }}
            >
              ✨ Exclusive Surprises
            </motion.span>

            <h2 style={{
              fontSize: 'clamp(20px, 2.2vw, 32px)',
              fontWeight: 700,
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              color: '#1e293b',
              marginBottom: '10px',
              lineHeight: 1.22,
              letterSpacing: '0.2px'
            }}>
              <AnimatedWords text="Every Box Holds" />
              <br />
              <AnimatedWords text="Magic Inside" />
            </h2>

            <motion.p
              variants={wordVariants}
              custom={6}
              style={{
                color: '#64748b',
                fontSize: '13px',
                lineHeight: 1.65,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 500,
                margin: 0,
                letterSpacing: '0.1px'
              }}
            >
              Discover cute plush toys, kawaii accessories &amp; mystery sets.
            </motion.p>
          </motion.div>

          {/* ── CTA BUTTON BELOW VIDEO CANVAS (Emerged & Stays) ─────────── */}
          <motion.div style={{
            position: 'absolute',
            bottom: '40px',
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
                padding: '16px 46px',
                fontSize: '16px',
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

          {/* ── Scroll hint ───────────────────────────────────────────── */}
          <motion.div style={{
            position: 'absolute',
            bottom: '14px',
            opacity: hintOpacity,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}>
            <div style={{
              width: '1px',
              height: '24px',
              background: `linear-gradient(to bottom, transparent, ${primaryColor}90)`,
              animation: 'hs-scroll-line 1.6s ease-in-out infinite',
            }} />
            <p style={{
              color: '#94a3b8', fontSize: '9px',
              fontWeight: 700, letterSpacing: '2.5px',
              textTransform: 'uppercase', margin: 0,
              fontFamily: "'Outfit', sans-serif",
            }}>
              Scroll to Unwrap
            </p>
          </motion.div>
        </div>

      </div>

      {/* Responsive adjustments for mobile screens */}
      <style>{`
        @media (max-width: 900px) {
          .hs-side-text-left { top: 12% !important; left: 5% !important; max-width: 90% !important; text-align: center !important; }
          .hs-side-text-right { top: 70% !important; right: 5% !important; max-width: 90% !important; text-align: center !important; }
        }
      `}</style>
    </div>
  );
}
