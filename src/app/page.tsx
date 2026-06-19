import identity from "@/data/identity.json";
import SiteShell, { type Identity } from "./SiteShell";

export default function Home() {
  return <SiteShell identity={identity as Identity} />;
}
