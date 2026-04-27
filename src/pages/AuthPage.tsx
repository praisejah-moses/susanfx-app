import AuthForm from "../components/auth/AuthForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[var(--background-default)] flex items-center justify-center px-4 py-4">
      <div className="w-full max-w-md flex justify-center">
        <AuthForm />
      </div>
    </div>
  );
}
