import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ProfilePage from './ProfilePage.jsx';
import "./Auth.css";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if(isLoggedIn){
    return <ProfilePage />
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">{isLogin ? "Sign in" : "Create your account"}</h1>
        <p className="auth-subtitle">
          {isLogin ? "Welcome back, please enter your details" : "Get started in seconds"}
        </p>

        {isLogin ? (<LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />) : (<RegisterForm />)}

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;