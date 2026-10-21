// src/components/reports/PosterCard.jsx

function formatMemberSince(date) {
    if (!date) return "N/A";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name) {
    if (!name) return "U";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function PosterCardSkeleton() {
    return (
        <div className="w-full animate-pulse rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 h-3 w-20 rounded bg-zinc-200" />
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-zinc-200" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-zinc-200" />
                    <div className="h-3 w-24 rounded bg-zinc-200" />
                </div>
            </div>
            <div className="mt-4 h-12 rounded-xl bg-zinc-100" />
        </div>
    );
}

export default function PosterCard({ poster, loading = false }) {
    if (loading) return <PosterCardSkeleton />;

    // Backend field names may differ, so we accept common alternatives
    const name = poster?.name || poster?.fullName;
    const avatar = poster?.avatar || poster?.profileImage || poster?.photoURL;
    const createdAt = poster?.createdAt || poster?.memberSince;

    return (
        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Posted by
            </p>

            <div className="flex items-center gap-4">
                {/* Avatar */}
                {avatar ? (
                    <img
                        src={avatar}
                        alt={name || "User"}
                        className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-lime-400 ring-offset-2"
                    />
                ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-lime-400 ring-2 ring-lime-400 ring-offset-2">
                        {getInitials(name)}
                    </div>
                )}

                {/* Name + member since */}
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-zinc-900">
                        {name || "Anonymous"}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 shrink-0"
                        >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        Member since {formatMemberSince(createdAt)}
                    </p>
                </div>
            </div>

            {/* Phase 7: rating stars and returned-item count will go here */}
            {/* <PosterStats rating={poster?.rating} returnedCount={poster?.returnedCount} /> */}

            {/* Privacy note */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-zinc-900 px-3.5 py-3">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 h-4 w-4 shrink-0 text-lime-400"
                >
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <p className="text-xs leading-relaxed text-zinc-200">
                    Contact details are shared only after a claim is approved.
                </p>
            </div>
        </div>
    );
}