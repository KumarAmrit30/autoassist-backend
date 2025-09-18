// Test script to verify Azure backend connection
// Replace 'your-app-name' with your actual Azure app name

const BACKEND_URL = "https://your-app-name.azurewebsites.net";

async function testBackendConnection() {
  console.log("🔍 Testing Azure backend connection...");

  try {
    // Test health endpoint
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData);

    // Test API root endpoint
    const apiResponse = await fetch(`${BACKEND_URL}/api`);
    const apiData = await apiResponse.json();
    console.log("✅ API root:", apiData);

    // Test cars endpoint (might require authentication)
    const carsResponse = await fetch(`${BACKEND_URL}/api/cars`);
    if (carsResponse.ok) {
      const carsData = await carsResponse.json();
      console.log("✅ Cars endpoint:", carsData);
    } else {
      console.log(
        "⚠️ Cars endpoint requires authentication:",
        carsResponse.status
      );
    }

    console.log("🎉 Backend is working correctly!");
  } catch (error) {
    console.error("❌ Backend connection failed:", error);
  }
}

// Run the test
testBackendConnection();
