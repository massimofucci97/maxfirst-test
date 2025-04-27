import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Auth: React.FC = () => {
  const { user, signIn, signUp, error, loading, canSignUp, timeUntilNextSignup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
      if (!canSignUp) {
        setFormError(`Please wait ${timeUntilNextSignup} seconds before trying again`);
        return;
      }
    }

    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Game Finance Tracker</h1>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="card">
          <div className="p-6">
            {(error || formError) && (
              <div className="mb-4 p-3 bg-error-900 text-error-100 rounded-md border border-error-700 flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{formError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input w-full"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                disabled={loading || (!isLogin && !canSignUp)}
              >
                {loading ? (
                  <span className="animate-spin">◌</span>
                ) : isLogin ? (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Create Account</span>
                  </>
                )}
              </button>

              {!isLogin && !canSignUp && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Clock size={16} />
                  <span>Wait {timeUntilNextSignup}s before trying again</span>
                </div>
              )}
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormError(null);
                }}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;