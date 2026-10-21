import { Link, useNavigate } from "react-router-dom";

import { APP_ROUTES } from "../../../app/routes/paths";
import ErrorState from "./ErrorState";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <ErrorState
      code="404"
      eyebrow="Page not found"
      title="This page isn’t here"
      description="The link may be outdated, or the address may have been typed incorrectly. Head back home and find your way from there."
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        disabled={window.history.length <= 1}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-45"
      >
        Go back
      </button>
      <Link
        to={APP_ROUTES.HOME}
        className="dp-btn-primary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-opacity hover:opacity-90"
      >
        Go to home
      </Link>
    </ErrorState>
  );
}
