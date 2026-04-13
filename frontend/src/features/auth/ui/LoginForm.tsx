import { useState } from "react";
import type { FormEvent } from "react";
import { login } from "../api/authApi";

export const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const data = await login(email.trim(), password);
            const token = data?.token;

            if (typeof token !== "string" || token.length === 0) {
                setError("Invalid server response");
                return;
            }

            localStorage.setItem("token", token);
        } catch {
            setError("Login failed. Check your credentials.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={onSubmit}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />
            {error ? <p className="auth-error">{error}</p> : null}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
        </form>
    );
};
