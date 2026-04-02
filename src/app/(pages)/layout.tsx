import { PagesClient } from "./PagesClient";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PagesClient>{children}</PagesClient>;
}
