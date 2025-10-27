import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { Toaster } from './components/common/Toaster';
import { useEffect } from 'react';

function App() {
  // Inject basic CSS directly to ensure styles are applied
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
      .bg-gray-50 { background-color: #f9fafb; }
      .bg-white { background-color: #ffffff; }
      .rounded-lg { border-radius: 0.5rem; }
      .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
      .p-8 { padding: 2rem; }
      .mb-8 { margin-bottom: 2rem; }
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .text-center { text-align: center; }
      .space-y-6 > * + * { margin-top: 1.5rem; }
      .text-blue-600 { color: #2563eb; }
      .hover\\:text-blue-800:hover { color: #1e40af; }
      .transition-colors { transition-property: color, background-color, border-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
