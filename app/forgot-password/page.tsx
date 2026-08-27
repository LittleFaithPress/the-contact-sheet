import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="font-serif text-2xl italic text-cream">Reset your password</h1>
      <ForgotPasswordForm />
    </div>
  );
}
