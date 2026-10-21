"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getReports } from "@/services/reportService";

/**
 * Custom hook to fetch and filter reports based on parameters.
 *
 * @param {Object} params - Query parameters from URL or search controls
 * @returns {{
 *   reports: Array,
 *   totalReports: number,
 *   totalPages: number,
 *   currentPage: number,
 *   typeCounts: { all: number, lost: number, found: number },
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: Error | null,
 *   refetch: () => void
 * }}
 */
export function useReports(params = {}) {
  const [data, setData] = useState({
    reports: [],
    totalReports: 0,
    totalPages: 1,
    currentPage: 1,
    typeCounts: { all: 0, lost: 0, found: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  // Serialized params string to avoid unnecessary re-fetches
  const paramsKey = JSON.stringify(params);
  const isMountedRef = useRef(true);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // Simulate realistic network latency for smooth UI transitions
      await new Promise((resolve) => setTimeout(resolve, 180));
      
      const result = await getReports(params);
      
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setIsError(true);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [paramsKey]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchReports();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchReports]);

  return {
    reports: data.reports,
    totalReports: data.totalReports,
    totalPages: data.totalPages,
    currentPage: data.currentPage,
    typeCounts: data.typeCounts,
    isLoading,
    isError,
    error,
    refetch: fetchReports,
  };
}

export default useReports;
