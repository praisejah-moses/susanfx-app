import LoginForm from "../components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="fixed inset-0 bg-[var(--background-default)] flex items-center justify-center px-4 overflow-hidden">
      <LoginForm />
    </div>
  );
}
