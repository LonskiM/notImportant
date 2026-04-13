import { LoginForm } from "@/features/auth/ui/LoginForm";

const LoginPage = () => {
    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1 className="auth-title">Sign in</h1>
                <LoginForm />
            </section>
        </main>
    );
};

export default LoginPage;