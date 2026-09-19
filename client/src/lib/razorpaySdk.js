let loadingPromise;

// Loads Razorpay's official checkout script on demand, only when a real
// (non-mock) top-up actually needs it.
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
  return loadingPromise;
}
