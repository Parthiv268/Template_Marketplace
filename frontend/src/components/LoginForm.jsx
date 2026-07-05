import { useState } from "react";
import { loginUser} from "../api.js";


//onLoginSucces is a prop passed from parent component to child ,so AuthPage can pass down what to do after successful login.
function LoginForm({onLoginSuccess}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    try {
        //await loginuser stores token for login in local storage and then we can use that token to get profile of user
      await loginUser(username, password);
      onLoginSuccess()
      
    } catch (error) {
       if (error.detail && error.detail.includes("throttled")) {
          setErrors({ general: ["Too many attempts. Please wait a minute and try again."] });
        } else {
        setErrors({ general: ["Invalid username or password."] });
        }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="auth-input"
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
      </div>

      {errors.general && <p className="auth-error">{errors.general[0]}</p>}

      <button type="submit" className="auth-button">
        Login
      </button>

    
    </form>
  );
}

export default LoginForm;