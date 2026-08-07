/* CHANGES TO FRONTEND — LandingPage with Smooth Framer Motion Scroll Animations & Interactive Neon Particle Canvas */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function LandingPage() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [activeTab, setActiveTab] = useState('trending');

    /* ── Organic 3D Flocking Particle Engine (Neon Cyan / Electric Blue / Emerald Green) ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        // Track Cursor Position
        const mouse = {
            x: width / 2,
            y: height / 2,
            targetX: width / 2,
            targetY: height / 2,
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.targetX = e.clientX - rect.left;
            mouse.targetY = e.clientY - rect.top;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Particle Palette: Neon Cyan, Electric Blue, Emerald Green
        const colorPalette = [
            '#06b6d4', // Neon Cyan
            '#3b82f6', // Electric Blue
            '#10b981', // Emerald Green
            '#38bdf8', // Light Cyan Glow
            '#34d399', // Mint Green Glow
        ];

        const count = 130;
        const particles = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z: Math.random() * 800 + 150,
                vx: (Math.random() - 0.5) * 2.2,
                vy: (Math.random() - 0.5) * 2.2,
                vz: (Math.random() - 0.5) * 1.2,
                radius: Math.random() * 2.8 + 1.6,
                color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                alpha: Math.random() * 0.5 + 0.3,
            });
        }

        // Main Physics & Render Loop
        const render = () => {
            mouse.x += (mouse.targetX - mouse.x) * 0.07;
            mouse.y += (mouse.targetY - mouse.y) * 0.07;

            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Organic Mouse Steering
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 260 && dist > 5) {
                    const force = (260 - dist) / 260;
                    p.vx += (dx / dist) * force * 0.3;
                    p.vy += (dy / dist) * force * 0.3;
                }

                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;

                p.vx *= 0.96;
                p.vy *= 0.96;
                p.vz *= 0.96;

                p.vx += (Math.random() - 0.5) * 0.25;
                p.vy += (Math.random() - 0.5) * 0.25;

                if (p.x < -50) p.x = width + 50;
                if (p.x > width + 50) p.x = -50;
                if (p.y < -50) p.y = height + 50;
                if (p.y > height + 50) p.y = -50;

                const scale = 480 / p.z;
                const projectedRadius = p.radius * scale;

                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(1.2, projectedRadius), 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.min(1, Math.max(0.25, p.alpha * scale));
                ctx.shadowBlur = projectedRadius > 2.2 ? 14 : 0;
                ctx.shadowColor = p.color;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const pdx = p.x - p2.x;
                    const pdy = p.y - p2.y;
                    const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

                    if (pdist < 115) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = p.color;
                        ctx.globalAlpha = (1 - pdist / 115) * 0.22 * scale;
                        ctx.lineWidth = scale * 0.7;
                        ctx.stroke();
                    }
                }
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Framer Motion Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    return (
        /* CHANGES TO FRONTEND — LandingPage with Smooth Scroll Motion & Neon Flocking Particle Background */
        <div style={{
            position: 'relative',
            minHeight: 'calc(100vh - 52px)',
            background: '#07192f',
            color: '#ffffff',
            fontFamily: 'var(--font)',
            overflow: 'hidden',
        }}>
            {/* 3D Flocking Particle Canvas in Neon Cyan/Blue/Green */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: 1,
                }}
            />

            {/* Main Content Container */}
            <div style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '50px 24px 120px' }}>

                {/* ── HERO BANNER ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-panel"
                    style={{
                        padding: '60px 48px',
                        borderRadius: '28px',
                        marginBottom: '40px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(10, 14, 26, 0.88) 60%)',
                        border: '1px solid rgba(6, 182, 212, 0.35)',
                        boxShadow: '0 24px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(6, 182, 212, 0.25)',
                    }}
                >
                    <span className="badge-cyan" style={{ marginBottom: '16px', padding: '6px 16px', fontSize: '12px' }}>
                        ❖ NEXT-GEN WEB3 DIGITAL ASSET MARKETPLACE
                    </span>
                    <h1 className="font-heading" style={{
                        fontSize: '44px', fontWeight: 800,
                        color: '#ffffff', margin: '0 auto 16px',
                        letterSpacing: '-0.03em', maxWidth: '840px', lineHeight: 1.18,
                    }}>
                        Trade, Mint & Monetize Verified <span className="text-gradient-neon">Developer Code Assets</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '680px', margin: '0 auto 36px', lineHeight: 1.6 }}>
                        The premier Web3 marketplace for React components, full-stack templates, and code deliverables backed by smart NFT ownership proof & perpetual creator royalties.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/marketplace')} className="btn-glow" style={{ padding: '14px 34px', fontSize: '15px' }}>
                            🚀 Explore Marketplace →
                        </button>
                        <button onClick={() => navigate('/upload')} className="btn-glass" style={{ padding: '14px 28px', fontSize: '15px' }}>
                            ⚡ Mint Your First Asset →
                        </button>
                    </div>
                </motion.div>

                {/* ── IDEA 2: LIVE PLATFORM STATISTICS COUNTER WITH SMOOTH SCROLL REVEAL ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-panel"
                    style={{
                        padding: '32px 40px',
                        borderRadius: '24px',
                        marginBottom: '60px',
                        background: 'rgba(10, 14, 26, 0.85)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(16, 185, 129, 0.2)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '24px',
                        textAlign: 'center',
                    }}
                >
                    <div>
                        <p style={{ color: '#10b981', fontSize: '32px', fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
                            ₹500K+
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Total Creator Volume
                        </p>
                    </div>
                    <div>
                        <p style={{ color: '#06b6d4', fontSize: '32px', fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
                            1,200+
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Verified NFT Code Assets
                        </p>
                    </div>
                    <div>
                        <p style={{ color: '#a855f7', fontSize: '32px', fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
                            100%
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Perpetual Royalty Protection
                        </p>
                    </div>
                    <div>
                        <p style={{ color: '#3b82f6', fontSize: '32px', fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
                            0%
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Fraud Software Guarantee
                        </p>
                    </div>
                </motion.div>

                {/* ── IDEA 4: INTERACTIVE TOKEN RESALE FLOW WALKTHROUGH WITH STAGGERED MOTION ── */}
                <div style={{ marginBottom: '70px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: '40px' }}
                    >
                        <span className="badge-neon" style={{ marginBottom: '10px' }}>
                            ❖ ASSET LIFECYCLE & RESALE WORKFLOW
                        </span>
                        <h2 className="font-heading" style={{ fontSize: '34px', fontWeight: 800, color: '#ffffff', margin: '0 0 10px' }}>
                            How Web3 Licensing <span className="text-gradient-neon">Empowers Developers</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '640px', margin: '0 auto' }}>
                            From primary creator minting to secondary marketplace resale and automated royalty distribution.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        {/* Step 1 */}
                        <motion.div variants={cardVariants} className="glass-card" style={{ padding: '28px', position: 'relative' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#06b6d4', background: 'rgba(6, 182, 212, 0.15)', padding: '4px 10px', borderRadius: '99px' }}>STEP 01</span>
                            <h3 className="font-heading" style={{ color: '#fff', fontSize: '18px', margin: '14px 0 8px' }}>1. Primary Mint</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                                Creators upload digital software assets with fixed token supply and set smart royalty percentages.
                            </p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div variants={cardVariants} className="glass-card" style={{ padding: '28px', position: 'relative' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)', padding: '4px 10px', borderRadius: '99px' }}>STEP 02</span>
                            <h3 className="font-heading" style={{ color: '#fff', fontSize: '18px', margin: '14px 0 8px' }}>2. Instant Vault Access</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                                Token buyers receive instant cryptographic ownership proof and high-speed ZIP cloud downloads.
                            </p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div variants={cardVariants} className="glass-card" style={{ padding: '28px', position: 'relative' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: '4px 10px', borderRadius: '99px' }}>STEP 03</span>
                            <h3 className="font-heading" style={{ color: '#fff', fontSize: '18px', margin: '14px 0 8px' }}>3. P2P Resale Listing</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                                Finished with a client build? Re-list your token on the peer-to-peer secondary market to recoup funds.
                            </p>
                        </motion.div>

                        {/* Step 4 */}
                        <motion.div variants={cardVariants} className="glass-card" style={{ padding: '28px', position: 'relative' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '99px' }}>STEP 04</span>
                            <h3 className="font-heading" style={{ color: '#fff', fontSize: '18px', margin: '14px 0 8px' }}>4. Royalty Split</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                                The original creator automatically receives their royalty percentage directly into their wallet on every resale.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>

                {/* ── IDEA 5: CREATOR SPOTLIGHT & TRENDING ASSETS WITH SCROLL REVEAL ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{ marginBottom: '70px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <span className="badge-cyan" style={{ marginBottom: '6px' }}>
                                ❖ CREATOR SPOTLIGHT & TOP ASSETS
                            </span>
                            <h2 className="font-heading" style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                                Trending Code & <span className="text-gradient-neon">Top Developers</span>
                            </h2>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <button
                                onClick={() => setActiveTab('trending')}
                                style={{
                                    padding: '8px 18px', borderRadius: '8px', border: 'none',
                                    background: activeTab === 'trending' ? 'var(--accent-gradient)' : 'transparent',
                                    color: activeTab === 'trending' ? '#fff' : 'var(--text-secondary)',
                                    fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                🔥 Trending Assets
                            </button>
                            <button
                                onClick={() => setActiveTab('creators')}
                                style={{
                                    padding: '8px 18px', borderRadius: '8px', border: 'none',
                                    background: activeTab === 'creators' ? 'var(--accent-gradient)' : 'transparent',
                                    color: activeTab === 'creators' ? '#fff' : 'var(--text-secondary)',
                                    fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                                }}
                            >
                                ⚡ Top Creators
                            </button>
                        </div>
                    </div>

                    {/* CHANGES TO FRONTEND — Smooth Animated Tab Transition for Trending Assets & Top Developers */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {activeTab === 'trending' ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.15 }}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}
                            >
                                {/* Top Card 1 */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{ y: -10, scale: 1.02, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.3), 0 0 25px rgba(6, 182, 212, 0.2)' }}
                                    className="glass-card"
                                    style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
                                >
                                    <div style={{ height: '140px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e1b4b, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '16px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)' }}>
                                        ⚡
                                    </div>
                                    <span className="badge-cyan" style={{ fontSize: '10px', marginBottom: '8px' }}>React + Vite Template</span>
                                    <h3 className="font-heading" style={{ color: '#fff', fontSize: '18px', margin: '0 0 6px' }}>Quantum Admin Dashboard UI</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 14px' }}>30+ dark mode components, Recharts integration & responsive grid.</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>₹399</span>
                                        <button onClick={() => navigate('/marketplace')} className="btn-glow" style={{ padding: '6px 14px', fontSize: '12px' }}>View Details</button>
                                    </div>
                                </motion.div>

                                {/* Top Card 2 */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{ y: -10, scale: 1.02, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3), 0 0 25px rgba(16, 185, 129, 0.2)' }}
                                    className="glass-card"
                                    style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
                                >
                                    <div style={{ height: '140px', borderRadius: '12px', background: 'linear-gradient(135deg, #064e3b, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '16px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)' }}>
                                        🐍
                                    </div>
                                    <span className="badge-cyan" style={{ fontSize: '10px', marginBottom: '8px' }}>Django REST Framework</span>
                                    <h3 className="font-heading" style={{ color: '#fff', fontSize: '18px', margin: '0 0 6px' }}>DRF Multi-Tenant SaaS Engine</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 14px' }}>JWT auth, payment webhooks, custom user roles & permission specs.</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>₹699</span>
                                        <button onClick={() => navigate('/marketplace')} className="btn-glow" style={{ padding: '6px 14px', fontSize: '12px' }}>View Details</button>
                                    </div>
                                </motion.div>

                                {/* Top Card 3 */}
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{ y: -10, scale: 1.02, boxShadow: '0 20px 40px rgba(124, 58, 237, 0.3), 0 0 25px rgba(124, 58, 237, 0.2)' }}
                                    className="glass-card"
                                    style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
                                >
                                    <div style={{ height: '140px', borderRadius: '12px', background: 'linear-gradient(135deg, #311b92, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', marginBottom: '16px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)' }}>
                                        ❖
                                    </div>
                                    <span className="badge-cyan" style={{ fontSize: '10px', marginBottom: '8px' }}>Web3 / NFT Smart Contract</span>
                                    <h3 className="font-heading" style={{ color: '#fff', fontSize: '18px', margin: '0 0 6px' }}>NFT Royalty Distribution Suite</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 14px' }}>ERC-721 token contract with built-in 10% secondary royalty split.</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>₹899</span>
                                        <button onClick={() => navigate('/marketplace')} className="btn-glow" style={{ padding: '6px 14px', fontSize: '12px' }}>View Details</button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.15 }}
                                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}
                            >
                                <motion.div
                                    variants={cardVariants}
                                    whileHover={{ y: -8, scale: 1.03, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.3)' }}
                                    className="glass-card"
                                    style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}
                                >
                                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)' }}>
                                        A1
                                    </div>
                                    <div>
                                        <h4 className="font-heading" style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px' }}>
                                            admin1 <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, marginLeft: '6px' }}>✓ Verified Superadmin</span>
                                        </h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>42 Collections Minted • ₹120K Creator Volume</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>

                {/* ── CALL TO ACTION FOOTER BANNER WITH SCROLL REVEAL ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-panel"
                    style={{
                        padding: '48px',
                        borderRadius: '24px',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                        border: '1px solid rgba(6, 182, 212, 0.35)',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.25)',
                    }}
                >
                    <h2 className="font-heading" style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                        Ready to Join the <span className="text-gradient-neon">Quantum Marketplace?</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '540px', margin: '0 auto 28px' }}>
                        Start acquiring verified developer components or minting your own code deliverables today.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/marketplace')} className="btn-glow" style={{ padding: '12px 30px' }}>
                            Browse Marketplace →
                        </button>
                        <button onClick={() => navigate('/login')} className="btn-glass" style={{ padding: '12px 28px' }}>
                            Sign In / Register →
                        </button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

export default LandingPage;
