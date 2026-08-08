import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">EchoMem</h1>
        <p className="mt-2 text-zinc-400">
          Your private on-device AI assistant. Setup in progress.
        </p>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
