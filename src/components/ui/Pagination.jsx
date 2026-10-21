"use client";

import React from "react";
import {
  Pagination as HeroUIPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination component wrapping HeroUI Pagination.
 *
 * @param {Object} props
 * @param {number} props.page - Current active page (1-based index)
 * @param {number} props.totalPages - Total number of pages
 * @param {(newPage: number) => void} props.onChange - Callback fired when page changes
 * @param {string} [props.className] - Additional classes for the pagination container
 * @param {number} [props.siblings=1] - Number of siblings on each side of the active page
 * @param {boolean} [props.scrollToTop=true] - Whether to scroll to the top of the page on page change
 * @returns {React.ReactElement | null}
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  onChange,
  className = "",
  siblings = 1,
  scrollToTop = true,
}) {
  // Requirement: Return null when totalPages <= 1
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  // Ensure current page stays within valid boundaries
  const currentPage = Math.max(1, Math.min(Number(page) || 1, totalPages));

  // Requirement: Scroll to top of the page when page changes
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
      return;
    }

    onChange?.(newPage);

    if (scrollToTop && typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Generate page numbers with ellipsis
  const generatePagination = () => {
    const totalNumbers = siblings * 2 + 3; // current + 2 * siblings + 2 boundary pages
    const totalBlocks = totalNumbers + 2; // + 2 for potential ellipsis blocks

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblings, 1);
    const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblings;
      const leftRange = Array.from({ length: leftItemCount }, (_, index) => index + 1);
      return [...leftRange, "dots-right", lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblings;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, index) => totalPages - rightItemCount + index + 1
      );
      return [firstPageIndex, "dots-left", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, index) => leftSiblingIndex + index
      );
      return [firstPageIndex, "dots-left", ...middleRange, "dots-right", lastPageIndex];
    }

    return Array.from({ length: totalPages }, (_, index) => index + 1);
  };

  const pages = generatePagination();

  return (
    <HeroUIPagination
      className={`flex items-center justify-center my-8 ${className}`}
      aria-label="Pagination Navigation"
    >
      <PaginationContent className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous Page Button */}
        <PaginationItem>
          <PaginationPrevious
            aria-label="Go to previous page"
            isDisabled={currentPage <= 1}
            onPress={() => handlePageChange(currentPage - 1)}
            onClick={() => handlePageChange(currentPage - 1)}
            className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer ${
              currentPage <= 1
                ? "border-slate-200/60 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </PaginationPrevious>
        </PaginationItem>

        {/* Page Links & Ellipses */}
        {pages.map((item, index) => {
          if (item === "dots-left" || item === "dots-right") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis className="flex items-center justify-center w-9 h-9 text-slate-400 dark:text-slate-500 font-bold select-none">
                  •••
                </PaginationEllipsis>
              </PaginationItem>
            );
          }

          const pageNum = Number(item);
          const isActive = pageNum === currentPage;

          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                isActive={isActive}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
                onPress={() => handlePageChange(pageNum)}
                onClick={() => handlePageChange(pageNum)}
                className={`flex items-center justify-center min-w-[38px] h-9 px-3 text-sm font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-[#9ae600] dark:text-slate-950 dark:border-[#9ae600] shadow-sm scale-105"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                }`}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next Page Button */}
        <PaginationItem>
          <PaginationNext
            aria-label="Go to next page"
            isDisabled={currentPage >= totalPages}
            onPress={() => handlePageChange(currentPage + 1)}
            onClick={() => handlePageChange(currentPage + 1)}
            className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border transition-all duration-200 cursor-pointer ${
              currentPage >= totalPages
                ? "border-slate-200/60 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </HeroUIPagination>
  );
}
