import './globals.css';

export const metadata = {
  title: 'Surf Forecast Alerts',
  description: 'Get notified when surf conditions are perfect for your favorite spots',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
