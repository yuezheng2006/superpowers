import catalog from "../data/catalog.json";
import { MusicExplorer, type Catalog } from "../components/music-explorer";

export default function Home() {
  return <MusicExplorer catalog={catalog as Catalog} />;
}
