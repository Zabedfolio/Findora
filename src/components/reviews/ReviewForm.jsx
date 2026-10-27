"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle2, Send, LoaderCircle } from "lucide-react";
import StarRating from "./StarRating";

const MIN_COMMENT = 10;
const MAX_COMMENT = 500;
const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function getInitials(name) {
    if (!name) return "U";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

/**
 * Props:
 * - reviewee: { _id, name, avatar, role: "finder" | "owner" }
 * - reportId: id of the report the return belongs to
 * - onSubmit: async ({ reportId, revieweeId, rating, comment }) => void
 * - onSuccess: optional callback after a successful submit
 */
export default function ReviewForm({
    reviewee,
    reportId,
    handoverId,
    onSubmit,
    onSuccess,
    className = "",
}) {
    const reduce = useReducedMotion();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const name = reviewee?.name || "this user";
    const roleText =
        reviewee?.role === "finder"
            ? "who found your item"
            : reviewee?.role === "owner"
                ? "whose item you returned"
                : "";

    function validate() {
        const next = {};
        if (!rating) next.rating = "Please select a rating.";
        const text = comment.trim();
        if (text.length < MIN_COMMENT) {
            next.comment = `Please write at least ${MIN_COMMENT} characters.`;
        } else if (text.length > MAX_COMMENT) {
            next.comment = `Comment must be ${MAX_COMMENT} characters or less.`;
        }
        return next;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (submitting) return;

        const found = validate();
        setErrors(found);
        setSubmitError("");
        if (Object.keys(found).length > 0) return;

        try {
            setSubmitting(true);
            await onSubmit?.({
                reportId,
                handoverId,
                revieweeId: reviewee?._id,
                rating,
                comment: comment.trim(),
            });
            setSubmitted(true);
            onSuccess?.();
        } catch (err) {
            setSubmitError(err?.message || "Could not submit your review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className={`w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm ${className}`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {submitted ? (
                    <motion.div
                        key="done"
                        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 160, damping: 14 }}
                        className="flex flex-col items-center px-6 py-12 text-center"
                    >
                        <motion.div
                            initial={reduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                            className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 text-lime-600"
                        >
                            <CheckCircle2 className="h-9 w-9" />
                        </motion.div>
                        <h3 className="mt-4 text-xl font-bold text-zinc-900">Thank you!</h3>
                        <p className="mt-1 text-sm text-zinc-500">
                            Your feedback helps build trust in the Findora community.
                        </p>
                    </motion.div>
                ) : (
                    <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        noValidate
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="p-6"
                    >
                        {/* Header: who is being reviewed */}
                        <div className="flex items-center gap-4">
                            {reviewee?.avatar ? (
                                <img
                                    src={reviewee.avatar}
                                    alt={name}
                                    className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-lime-400 ring-offset-2"
                                />
                            ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-lime-400 ring-2 ring-lime-400 ring-offset-2">
                                    {getInitials(reviewee?.name)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h3 className="truncate text-lg font-bold text-zinc-900">
                                    Rate {name}
                                </h3>
                                {roleText && (
                                    <p className="text-sm text-zinc-500">The person {roleText}</p>
                                )}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="mt-6">
                            <label className="text-sm font-semibold text-zinc-800">
                                Your rating
                            </label>
                            <div className="mt-2 flex items-center gap-3">
                                <StarRating
                                    value={rating}
                                    onChange={(v) => {
                                        setRating(v);
                                        setErrors((prev) => ({ ...prev, rating: undefined }));
                                    }}
                                    size={34}
                                />
                                <AnimatePresence mode="wait">
                                    {rating > 0 && (
                                        <motion.span
                                            key={rating}
                                            initial={reduce ? false : { opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="text-sm font-semibold text-amber-600"
                                        >
                                            {RATING_LABELS[rating]}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            {errors.rating && (
                                <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                                    {errors.rating}
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div className="mt-5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="review-comment"
                                    className="text-sm font-semibold text-zinc-800"
                                >
                                    Your feedback
                                </label>
                                <span
                                    className={`text-xs ${comment.length > MAX_COMMENT ? "text-red-600" : "text-zinc-400"
                                        }`}
                                >
                                    {comment.length}/{MAX_COMMENT}
                                </span>
                            </div>
                            <textarea
                                id="review-comment"
                                rows={4}
                                value={comment}
                                onChange={(e) => {
                                    setComment(e.target.value);
                                    setErrors((prev) => ({ ...prev, comment: undefined }));
                                }}
                                placeholder="How was the handover? Was the person helpful and on time?"
                                className={`mt-2 w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-2 ${errors.comment
                                    ? "border-red-300 focus:ring-red-200"
                                    : "border-zinc-200 focus:border-lime-400 focus:ring-lime-200"
                                    }`}
                            />
                            {errors.comment && (
                                <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                                    {errors.comment}
                                </p>
                            )}
                        </div>

                        {/* Server error */}
                        <AnimatePresence>
                            {submitError && (
                                <motion.p
                                    initial={reduce ? false : { opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                                    role="alert"
                                >
                                    {submitError}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={submitting}
                            whileHover={reduce || submitting ? undefined : { y: -2 }}
                            whileTap={reduce || submitting ? undefined : { scale: 0.97 }}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-6 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-lime-400/25 transition-colors hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? (
                                <>
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Submit review
                                </>
                            )}
                        </motion.button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}