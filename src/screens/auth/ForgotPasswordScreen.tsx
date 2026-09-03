import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@/components/common/Icon';

export function ForgotPasswordScreen() {
  const { forgotPassword, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-xl shadow-header px-4 pt-safe">
        <div className="h-16 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface">
            <Icon name="arrow_back" size={22} />
          </button>
          <span className="text-lg sm:text-xl font-bold text-on-surface">Reset Password</span>
        </div>
      </header>
      <main className="flex-1 px-4 flex flex-col items-center justify-center pb-12">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="mark_email_read" size={40} className="text-[#137333]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-3">Check Your Email</h1>
              <p className="text-sm sm:text-base text-on-surface-variant mb-8">
                A password reset link has been sent to <span className="font-bold text-on-surface">{email}</span>.
              </p>
              <Link to="/auth/login" className="w-full h-[52px] bg-primary text-on-primary rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:shadow-md transition-all">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="lock_reset" size={40} className="text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface text-center mb-2">Forgot Password?</h1>
              <p className="text-sm sm:text-base text-on-surface-variant text-center mb-10">Enter your email address and we'll send you a link to reset your password.</p>
              {(localError || error) && (
                <div className="mb-4 p-3.5 rounded-xl bg-error-container text-error text-sm font-semibold flex items-start gap-2 shadow-sm">
                  <Icon name="error" size={18} className="text-error flex-shrink-0 mt-0.5" />
                  <p>{localError || error}</p>
                </div>
              )}
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface" htmlFor="fpEmail">Email Address</label>
                  <div className="relative">
                    <Icon name="mail" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input id="fpEmail" type="email" required value={email} onChange={e => { setEmail(e.target.value); clearError(); setLocalError(''); }} placeholder="your@email.com" className="w-full h-[52px] pl-12 pr-4 bg-surface-container rounded-xl outline-none ring-1 ring-outline-variant focus:ring-2 focus:ring-primary text-on-surface text-sm sm:text-base font-medium transition-all" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full h-[52px] bg-primary text-on-primary rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:shadow-md transition-all disabled:opacity-60 cursor-pointer">
                  {submitting ? <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" /> : <>Send Reset Link <Icon name="send" size={18} /></>}
                </button>
                <p className="text-center text-xs sm:text-sm text-on-surface-variant">
                  Remembered it? <Link to="/auth/login" className="font-bold text-primary hover:underline">Login</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
