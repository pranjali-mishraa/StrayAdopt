import { useAuthService } from "../../auth/hooks/useAuthService";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, handleLogout } = useAuthService();
  const navigate = useNavigate();

  async function onLogout() {
    await handleLogout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-cream px-6 py-16">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-border-brand p-8">
        <div className="w-20 h-20 rounded-full bg-rust text-white flex items-center justify-center text-3xl font-semibold mx-auto mb-4">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <h1 className="font-display text-2xl font-bold text-bark-dark text-center mb-1">
          {user?.username}
        </h1>
        <p className="text-text-light text-center text-sm mb-8">{user?.email}</p>

        <button
          onClick={onLogout}
          className="w-full h-12 border border-rust text-rust rounded-xl font-medium hover:bg-rust hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}