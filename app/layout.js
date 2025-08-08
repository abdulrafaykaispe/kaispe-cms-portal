import "./globals.css";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./hooks/protectedRoute";

export const metadata = {
  title: "Kaispe CMS Portal",
  description: "Kaispe CMS Portal For All Landing Page",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`} suppressHydrationWarning>
        <ProtectedRoute>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#fff",
                color: "#333",
                border: "1px solid #e5e7eb",
              },
            }}
          />
        </ProtectedRoute>
      </body>
    </html>
  );
}
