/* CHANGES TO FRONTEND — AuthPage with 100% Reliable Vanta.js BIRDS Background */

import { useState, useEffect, useRef } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "./Auth.css";

function AuthPage({ setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  /* CHANGES TO FRONTEND — Dynamic Script Loader for Vanta BIRDS Background */
  useEffect(() => {
    let effect = null;

    const initVanta = () => {
      if (window.VANTA && window.VANTA.BIRDS && vantaRef.current && !effect) {
        try {
          effect = window.VANTA.BIRDS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            backgroundColor: 0x07192f,
            backgroundAlpha: 1.0,
            color1: 0xff9500,
            color2: 0x00d1ff,
            colorMode: "varianceGradient",
            quantity: 5.00,
            birdSize: 1.00,
            wingSpan: 30.00,
            speedLimit: 5.00,
            separation: 20.00,
            alignment: 20.00,
            cohesion: 20.00,
          });
          setVantaEffect(effect);
        } catch (e) {
          console.log("Vanta BIRDS error:", e);
        }
      }
    };

    if (window.VANTA && window.VANTA.BIRDS) {
      initVanta();
    } else {
      // Inject Three.js
      const scriptThree = document.createElement("script");
      scriptThree.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js";
      scriptThree.async = true;
      scriptThree.onload = () => {
        // Inject Vanta Birds
        const scriptVanta = document.createElement("script");
        scriptVanta.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js";
        scriptVanta.async = true;
        scriptVanta.onload = () => {
          initVanta();
        };
        document.body.appendChild(scriptVanta);
      };
      document.body.appendChild(scriptThree);
    }

    return () => {
      if (effect && typeof effect.destroy === "function") {
        try {
          effect.destroy();
        } catch (e) {
          console.log("Vanta destroy error:", e);
        }
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden', background: '#07192f' }}>
      {/* CHANGES TO FRONTEND — Vanta BIRDS canvas container */}
      <div id="vanta-bg" ref={vantaRef} style={{ position: 'fixed', inset: 0, zIndex: 1, width: '100%', height: '100%' }} />

      {/* CHANGES TO FRONTEND — Centered Auth Form on top with higher z-index */}
      <div className="auth-wrapper" style={{ position: 'relative', zIndex: 10, background: 'transparent' }}>
        <div className="auth-card" style={{ position: 'relative', zIndex: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span className="badge-neon">❖ QUANTUM MARKETPLACE AUTH</span>
          </div>
          <h1 className="auth-title">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Enter your credentials to access your quantum asset vault"
              : "Join the next-gen digital developer marketplace"}
          </p>

          {isLogin ? (
            <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
          ) : (
            <RegisterForm onRegisterSuccess={() => setIsLogin(true)} />
          )}

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign up" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;