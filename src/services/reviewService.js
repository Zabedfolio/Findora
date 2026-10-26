/**
 * Review API Service for submitting and fetching community feedback.
 */

export const submitReview = async (reviewData) => {
  // Replace this with your actual API endpoint or database client (e.g., fetch('/api/reviews', ...))
  console.log("Submitting review to server:", reviewData);

  // Simulate server latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return simulated response
  return {
    success: true,
    data: {
      _id: `review_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...reviewData,
    },
  };
};

export const fetchReviewsByUserId = async (userId) => {
  console.log("Fetching reviews for user:", userId);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true, reviews: [] };
};


