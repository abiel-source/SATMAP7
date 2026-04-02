import { TrackerClient } from "./TrackerClient";

// This is a server component — data fetching happens in API routes
// The page itself is a thin shell
export default function TrackerPage() {
  return <TrackerClient />;
}
