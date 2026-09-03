export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="font-headline-md text-headline-md text-on-surface">CivicConnect</p>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Verifying your session...</p>
      </div>
    </div>
  );
}
