import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/common/Toast";
import AuthSessionProvider from "@/providers/SessionProvider";
import QueryProvider from "@/providers/QueryProvider";
import GoogleProvider from "@/providers/GoogleProvider";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Employee Task Manager",
    template: "%s | Employee Task Manager",
  },
  description:
    "Enterprise SaaS workforce and task management dashboard — manage employees, tasks, projects, and teams at scale.",
  keywords: ["employee management", "task manager", "enterprise", "RBAC", "workforce"],
  robots: { index: false, follow: false }, // Private enterprise app — no indexing
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme detection script — inlined to prevent flash-of-wrong-theme (FOWT).
         * Security: This script only reads from localStorage and sets CSS classes.
         * It contains NO user data and no dynamic values — safe as a static inline script.
         * See eslint.config.mjs for no-sync-scripts override (dangerouslySetInnerHTML,
         * not a sync src= script).
         * */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('etm-theme-store');var t='system';if(s){var p=JSON.parse(s);if(p&&p.state&&p.state.theme)t=p.state.theme;}var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
        {/* Security Headers (also enforced at edge via next.config.ts) */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <GoogleProvider>
          <AuthSessionProvider>
            <QueryProvider>
              <ThemeProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </ThemeProvider>
            </QueryProvider>
          </AuthSessionProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
