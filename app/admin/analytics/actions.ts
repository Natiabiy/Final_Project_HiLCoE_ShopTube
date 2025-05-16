"use server"

// This is a placeholder function that would normally fetch real analytics data
// For now, we'll return mock data
export async function getAnalyticsData(timeframe: string) {
  try {
    // In a real implementation, we would fetch data from Hasura based on the timeframe
    // For now, we'll return mock data

    // Mock data with different values based on timeframe
    const mockData = {
      revenue: {
        total:
          timeframe === "7days"
            ? 12500
            : timeframe === "30days"
              ? 48000
              : timeframe === "90days"
                ? 125000
                : timeframe === "year"
                  ? 580000
                  : 1200000,
        growth:
          timeframe === "7days"
            ? 12
            : timeframe === "30days"
              ? 8
              : timeframe === "90days"
                ? 15
                : timeframe === "year"
                  ? 22
                  : 35,
      },
      users: {
        new:
          timeframe === "7days"
            ? 120
            : timeframe === "30days"
              ? 450
              : timeframe === "90days"
                ? 1200
                : timeframe === "year"
                  ? 5800
                  : 12000,
        growth:
          timeframe === "7days"
            ? 5
            : timeframe === "30days"
              ? 8
              : timeframe === "90days"
                ? 12
                : timeframe === "year"
                  ? 18
                  : 25,
      },
      products: {
        new:
          timeframe === "7days"
            ? 35
            : timeframe === "30days"
              ? 120
              : timeframe === "90days"
                ? 350
                : timeframe === "year"
                  ? 1200
                  : 3500,
        growth:
          timeframe === "7days"
            ? 8
            : timeframe === "30days"
              ? 12
              : timeframe === "90days"
                ? 15
                : timeframe === "year"
                  ? 20
                  : 30,
      },
      sellers: {
        active:
          timeframe === "7days"
            ? 45
            : timeframe === "30days"
              ? 85
              : timeframe === "90days"
                ? 110
                : timeframe === "year"
                  ? 150
                  : 200,
        total: 200,
      },
    }

    return {
      success: true,
      data: mockData,
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return {
      success: false,
      error: "Failed to fetch analytics data",
    }
  }
}
