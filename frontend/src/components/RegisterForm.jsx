import { useState } from "react";
import { registerUser } from "../api.js";

function RegisterForm() {

    //creates a piece of state const [currentValue,function]=useState(initialValue)
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});

   async function handleSubmit(e) {
        e.preventDefault();
        setErrors({});

         if (password !== confirmPassword) {
            setErrors({ confirmPassword: ["Passwords don't match."] });
            return;
        }

        try {
            const result = await registerUser(username, email, password);
            console.log("Success:", result);
        } catch (error) {
            setErrors(error);
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
  {errors.username && <p className="auth-error">{errors.username[0]}</p>}
</div>

<div>
  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="auth-input"
  />
  {errors.email && <p className="auth-error">{errors.email[0]}</p>}
</div>

<div>
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="auth-input"
  />
  {errors.password && <p className="auth-error">{errors.password[0]}</p>}
</div>

<div>
  <input
    type="password"
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="auth-input"
  />
  {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword[0]}</p>}
</div>
<button type="submit" className="auth-button">
  Register
</button>
    </form>
  );



}

export default RegisterForm;