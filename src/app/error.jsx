"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";

export default function Error({ error, reset }) {
    const reduce = useReducedMotion();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <section className="relative flex min-h-[75vh] w-full items-center justify-center overflow-hidden px-4 py-20">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
                <motion.div
                    animate={reduce ? undefined : { scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="h-[350px] w-[350px] rounded-full bg-gradient-to-tr from-red-300/40 via-orange-300/30 to-lime-300/20 blur-3xl"
                />
            </div>

            <div className="relative z-10 w-full max-w-xl text-center">
                {/* Illustration */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 12 }}
                    className="relative mx-auto flex items-center justify-center"
                >
                    <motion.div
                        animate={reduce ? undefined : { y: [0, -14, 0], rotate: [0, 3, -3, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-red-200/60 bg-gradient-to-b from-red-50 to-orange-100/50 p-6 shadow-2xl shadow-red-500/10 backdrop-blur-md">
                            <svg
                                viewBox="0 0 200 160"
                                fill="none"
                                className="h-36 w-44 drop-shadow-md"
                                aria-hidden="true"
                            >
                                <path
                                    d="M100 20L176 138H24L100 20Z"
                                    fill="#fff7ed"
                                    stroke="#18181b"
                                    strokeWidth="6"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M100 62v36"
                                    stroke="#18181b"
                                    strokeWidth="9"
                                    strokeLinecap="round"
                                />
                                <circle cx="100" cy="117" r="6" fill="#a3e635" stroke="#18181b" strokeWidth="3" />
                            </svg>

                            <motion.div
                                animate={reduce ? undefined : { rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border border-dashed border-red-300/50"
                            />

                            <div className="absolute -right-2 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-lime-400 shadow-lg">
                                <TriangleAlert className="h-5 w-5" />
                            </div>
                        </div>

                        <motion.div
                            animate={reduce ? undefined : { scale: [1, 0.8, 1], opacity: [0.4, 0.2, 0.4] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="mx-auto mt-4 h-3 w-32 rounded-full bg-zinc-300/80 blur-sm"
                        />
                    </motion.div>
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                    className="mt-6"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-red-300/40 bg-red-400/10 px-4 py-1.5 text-sm font-semibold text-red-700 backdrop-blur-sm">
                        <TriangleAlert className="h-4 w-4" />
                        Unexpected Error
                    </div>

                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
                        Something went wrong
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-zinc-600">
                        An unexpected error occurred while loading this page. Please try
                        again, or go back to the home page.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-7 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-lime-400/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-300 active:scale-95 sm:w-auto"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try again
                        </button>

                        <Link
                            href="/"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 sm:w-auto"
                        >
                            <Home className="h-4 w-4" />
                            Go home
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}