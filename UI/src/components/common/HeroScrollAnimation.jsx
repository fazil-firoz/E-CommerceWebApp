import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useScroll, useTransform, motion, useSpring, useMotionValueEvent } from 'framer-motion';

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

  // ── Aspect-ratio contain canvas draw (Seamless Color Blending) ─────────────
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    const img    = imagesRef.current[Math.round(index)];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    const imgW = img.naturalWidth || 1920;
    const imgH = img.naturalHeight || 1080;
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
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
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

  // Responsive blending color matching studio backdrop #fad5d9
  const blendedBg = backgroundColor || '#fad5d9';

  return (
    <div
      ref={containerRef}
      style={{ height: '135vh', position: 'relative' }}
    >
      {/* ── STICKY VIEWPORT — Seamless Blending with Studio Backdrop Tone ─── */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${blendedBg} 0%, #ffdadf 50%, #f7cad0 100%)`,
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

          {/* ── LEFT SIDE TEXT (Emerged from behind video & stays) ──────── */}
          <motion.div
            className="hs-side-text-left"
            style={{
              position: 'absolute',
              left: '3%',
              top: '30%',
              maxWidth: '320px',
              zIndex: 10,
              opacity: leftOpacity,
              x: leftX,
              textAlign: 'left',
              pointerEvents: 'none',
            }}
          >
            <span style={{
              display: 'inline-block',
              background: '#ffffff90',
              backdropFilter: 'blur(8px)',
              color: primaryColor,
              border: `1px solid ${primaryColor}40`,
              borderRadius: '20px',
              padding: '4px 14px',
              fontWeight: 800,
              fontSize: '11px',
              marginBottom: '10px',
              letterSpacing: '0.6px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}>
              🌸 KAWAII UNBOXING
            </span>
            <h2 style={{
              fontSize: 'clamp(22px, 2.6vw, 36px)',
              fontWeight: 900,
              color: '#1e293b',
              marginBottom: '8px',
              lineHeight: 1.18,
              letterSpacing: '-0.5px'
            }}>
              Magical Plushies &amp; Gift Boxes
            </h2>
            <p style={{
              color: '#475569',
              fontSize: '14px',
              lineHeight: 1.55,
              fontWeight: 600,
              margin: 0
            }}>
              Handcrafted with love to bring pure joy, comfort &amp; endless smiles.
            </p>
          </motion.div>

          {/* ── CENTER 3D CANVAS (Medium Screen Size & 100% Seamless Blend) ── */}
          <div style={{
            position: 'relative',
            width: 'clamp(280px, 46vw, 680px)',
            height: 'clamp(280px, 52vh, 560px)',
            zIndex: 20,
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
                filter: 'drop-shadow(0 16px 36px rgba(0,0,0,0.06))',
              }}
            />
          </div>

          {/* ── RIGHT SIDE TEXT (Emerged from behind video & stays) ─────── */}
          <motion.div
            className="hs-side-text-right"
            style={{
              position: 'absolute',
              right: '3%',
              top: '30%',
              maxWidth: '320px',
              zIndex: 10,
              opacity: rightOpacity,
              x: rightX,
              textAlign: 'right',
              pointerEvents: 'none',
            }}
          >
            <span style={{
              display: 'inline-block',
              background: '#ffffff90',
              backdropFilter: 'blur(8px)',
              color: accentColor,
              border: `1px solid ${accentColor}40`,
              borderRadius: '20px',
              padding: '4px 14px',
              fontWeight: 800,
              fontSize: '11px',
              marginBottom: '10px',
              letterSpacing: '0.6px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}>
              ✨ EXCLUSIVE SURPRISES
            </span>
            <h2 style={{
              fontSize: 'clamp(22px, 2.6vw, 36px)',
              fontWeight: 900,
              color: '#1e293b',
              marginBottom: '8px',
              lineHeight: 1.18,
              letterSpacing: '-0.5px'
            }}>
              Every Box Holds Magic Inside
            </h2>
            <p style={{
              color: '#475569',
              fontSize: '14px',
              lineHeight: 1.55,
              fontWeight: 600,
              margin: 0
            }}>
              Discover cute plush toys, kawaii accessories &amp; mystery sets.
            </p>
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
          }}>
            <p style={{
              color: '#64748b', fontSize: '11px',
              fontWeight: 800, letterSpacing: '2px',
              textTransform: 'uppercase', margin: 0,
            }}>
              Scroll to Unwrap
            </p>
          </motion.div>
        </div>

        {/* ── Progress bar ──────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '3px', background: 'rgba(0,0,0,0.06)',
        }}>
          <motion.div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
            width: progressWidth,
            boxShadow: `0 0 10px ${primaryColor}80`,
          }} />
        </div>

        {/* ── Frame counter ─────────────────────────────────────────────── */}
        {isLoaded && (
          <div style={{
            position: 'absolute', top: '14px', right: '18px',
            background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)',
            borderRadius: '8px', padding: '3px 10px',
            color: '#475569', fontSize: '11px',
            fontFamily: 'monospace', letterSpacing: '0.5px',
            pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.60)',
          }}>
            {String(currentFrame + 1).padStart(3, '0')} / {TOTAL_FRAMES}
          </div>
        )}
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
