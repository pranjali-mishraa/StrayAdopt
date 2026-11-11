
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { useAuthService } from "../../auth/hooks/useAuthService";
import { NgoAuthContext } from "../../ngo/context/NgoAuthContext";
import { PawPrint, ChevronDown, User, LogOut } from "lucide-react";

export default function Navbar() {
    const {
        user,
        loading: userLoading,
        handleLogout: handleUserLogout
    } = useAuthService();

    const {
        ngo,
        loading: ngoLoading,
        logout: handleNgoLogout
    } = useContext(NgoAuthContext);

    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const loading = userLoading || ngoLoading;

    // Determine the active account in this browser tab
    const storedAccount = sessionStorage.getItem("activeAccount");

    let activeType = null;

    if (!loading) {
        if (storedAccount === "User" && user) {
            activeType = "User";
        } else if (storedAccount === "Ngo" && ngo) {
            activeType = "Ngo";
        } else if (user && !ngo) {
            activeType = "User";
        } else if (ngo && !user) {
            activeType = "Ngo";
        }
    }

    const isNgo = activeType === "Ngo";

    const currentAccount =
        isNgo ? ngo : activeType === "User" ? user : null;

    function handleProfileDetails() {
        setDropdownOpen(false);

        if (isNgo) {
            navigate("/ngo/dashboard");
        } else if (activeType === "User") {
            navigate("/profile");
        } else {
            navigate("/login");
        }
    }

    async function handleLogout() {
        setDropdownOpen(false);

        if (activeType === "User") {
            await handleUserLogout();
            sessionStorage.removeItem("activeAccount");
        } else if (activeType === "Ngo") {
            await handleNgoLogout();
        }

        navigate("/");
    }

    return (
        <header className="bg-warm border-b border-border-brand sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-[36px] h-[36px] bg-rust rounded-[10px] flex items-center justify-center text-cream">
                        <PawPrint size={18} />
                    </div>

                    <span className="font-display text-[22px] font-semibold text-bark-dark tracking-tight">
                        Stray<em className="italic text-rust">Adopt</em>
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-10">
                    <Link
                        to="/"
                        className="text-[15px] font-medium text-text-mid hover:text-bark-dark transition-colors"
                    >
                        Home
                    </Link>

                    <Link
                        to="/about"
                        className="text-[15px] font-medium text-text-mid hover:text-bark-dark transition-colors"
                    >
                        About
                    </Link>
                </nav>

                {/* Right side */}
                <div className="flex items-center gap-5">

                    {!loading && activeType === "User" && (
                        <Link
                            to="/create-post"
                            className="text-[15px] font-medium text-text-mid hover:text-bark-dark transition-colors"
                        >
                            Create Post
                        </Link>
                    )}

                    {!loading && activeType && (
                        <Link
                            to="/chats"
                            className="text-[15px] font-medium text-text-mid hover:text-bark-dark transition-colors"
                        >
                            Chats
                        </Link>
                    )}

                    {/* Account dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            disabled={loading}
                            className="flex items-center gap-2"
                            aria-label="Account menu"
                            aria-expanded={dropdownOpen}
                        >
                            <div className="w-11 h-11 rounded-full border border-border-brand flex items-center justify-center text-text-mid hover:border-rust hover:text-rust transition-colors overflow-hidden">
                                {currentAccount ? (
                                    <span className="text-[15px] font-semibold text-bark-dark">
                                        {(isNgo
                                            ? currentAccount.name
                                            : currentAccount.username
                                        )?.[0]?.toUpperCase() || "A"}
                                    </span>
                                ) : (
                                    <User size={19} />
                                )}
                            </div>

                            <ChevronDown
                                size={16}
                                className={`transition-transform ${
                                    dropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 top-14 w-52 bg-white border border-border-brand rounded-xl shadow-lg py-2 z-50">

                                <button
                                    onClick={handleProfileDetails}
                                    className="w-full px-4 py-3 flex items-center gap-3 text-sm text-text-mid hover:bg-warm transition-colors"
                                >
                                    <User size={17} />
                                    Profile Details
                                </button>

                                {activeType && (
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={17} />
                                        Logout
                                    </button>
                                )}

                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}
