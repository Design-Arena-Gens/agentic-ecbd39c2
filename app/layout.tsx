import "./globals.css";

export const metadata = {
  title: "Agentic Sources",
  description: "Upload and manage source files for your AI assistant"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Agentic Sources</h1>
            <p className="subtitle">Upload videos, images, PDFs, and text for your assistant</p>
          </header>
          <main>{children}</main>
          <footer className="footer">Built with Next.js ? Local-first storage</footer>
        </div>
      </body>
    </html>
  );
}
