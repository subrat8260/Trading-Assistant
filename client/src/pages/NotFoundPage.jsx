import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-md">
        The route you are trying to access does not exist in the Trading Assistant application.
      </p>
      <Link
        to="/"
        className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
      >
        <Home className="h-4 w-4" />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
