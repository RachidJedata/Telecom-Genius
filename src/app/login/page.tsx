
export default function LoginPage() {

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your email to sign in to your account
        </p>
      </div>
      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            placeholder="m@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
        >
          Sign In
        </button>
      </form>
      <div className="text-center">
        <button
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
};
