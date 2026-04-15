import AuthForm from "../components/auth/AuthForm";

export default function AuthPage() {
  return (
    <div className="fixed inset-0 bg-[var(--background-default)] flex items-center justify-center px-4 py-4 overflow-y-auto">
      <div className="w-full flex justify-center">
        <AuthForm />
      </div>
    </div>
  );
}
