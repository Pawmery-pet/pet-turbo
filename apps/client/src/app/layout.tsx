import "./globals.css";

export const metadata = {
  title: "Pawmery - Forever Friends",
  description: "Continue the beautiful story with your beloved pet. Keep their memory alive and find comfort in your everlasting bond.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="fixed bottom-0 inset-x-0 text-center p-1 bg-white">{`@${new Date().getFullYear()} Pawmery Pet`}</footer>  
      </body>
    </html>
  );
}
