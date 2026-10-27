"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Home, Search, Compass } from "lucide-react";

export default function NotFound() {
    const reduce = useReducedMotion();

    return (
        <section className="relative flex min-h-[75vh] w-full items-center justify-center overflow-hidden px-4 py-20">
            {/* Background Animated Glow Blobs */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
                <motion.div
                    animate={
                        reduce
                            ? undefined
                            : {
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }
                    }
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="h-[350px] w-[350px] rounded-full bg-gradient-to-tr from-lime-300/40 via-emerald-300/30 to-lime-500/20 blur-3xl"
                />
            </div>

            <div className="relative z-10 w-full max-w-xl text-center">
                {/* Animated Visual/SVG Container */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 12 }}
                    className="relative mx-auto flex items-center justify-center"
                >
                    {/* Main Floating Magnifying Glass Illustration */}
                    <motion.div
                        animate={
                            reduce
                                ? undefined
                                : {
                                    y: [0, -14, 0],
                                    rotate: [0, 3, -3, 0],
                                }
                        }
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-lime-300/50 bg-gradient-to-b from-lime-100 to-lime-200/50 p-6 shadow-2xl shadow-lime-500/10 backdrop-blur-md">
                            <svg
                                viewBox="0 0 200 160"
                                fill="none"
                                className="h-36 w-44 drop-shadow-md"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="88"
                                    cy="68"
                                    r="46"
                                    fill="#f7fee7"
                                    stroke="#18181b"
                                    strokeWidth="6"
                                />
                                <circle
                                    cx="88"
                                    cy="68"
                                    r="34"
                                    fill="#ffffff"
                                    stroke="#a3e635"
                                    strokeWidth="4"
                                />
                                <path
                                    d="M122 102l36 36"
                                    stroke="#18181b"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                />
                                {/* Question mark inside magnifier */}
                                <path
                                    d="M78 58a10 10 0 1 1 14 9c-4 2-4 5-4 8"
                                    stroke="#18181b"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle cx="88" cy="88" r="3.5" fill="#18181b" />
                            </svg>

                            {/* Orbiting dashed ring */}
                            <motion.div
                                animate={reduce ? undefined : { rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border border-dashed border-lime-500/40"
                            />

                            <div className="absolute -right-2 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-lime-400 shadow-lg">
                                <Search className="h-5 w-5" />
                            </div>
                        </div>

                        {/* Shadow beneath */}
                        <motion.div
                            animate={
                                reduce
                                    ? undefined
                                    : {
                                        scale: [1, 0.8, 1],
                                        opacity: [0.4, 0.2, 0.4],
                                    }
                            }
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="mx-auto mt-4 h-3 w-32 rounded-full bg-zinc-300/80 blur-sm"
                        />
                    </motion.div>
                </motion.div>

                {/* Text Details */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                    className="mt-6"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5 text-sm font-semibold text-lime-700 backdrop-blur-sm">
                        <Compass
                            className="h-4 w-4 animate-spin text-lime-600"
                            style={{ animationDuration: "6s" }}
                        />
                        Error Code 404
                    </div>

                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
                        Oops! Page not found.
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-zinc-600">
                        Sorry, we couldn&apos;t find the page you are looking for. It may
                        have been removed, renamed, or the link is incorrect.
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-7 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-lime-400/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-300 active:scale-95 sm:w-auto"
                        >
                            <Home className="h-4 w-4" />
                            Go home
                        </Link>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 sm:w-auto"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go back
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}