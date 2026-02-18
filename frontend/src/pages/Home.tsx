import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import Card from "../components/Card";
import Player from "../components/Player";
import { searchYouTube } from "../api/youtube";

const Home: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);

  const handleSearch = async (query: string) => {
    const data = await searchYouTube(query);
    setResults(data);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Welcome to StreamMe</h2>
      <SearchBar onSearch={handleSearch} />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {results.map(video => (
          <Card key={video.id} video={video} onPlay={() => setCurrentTrack(video)} />
        ))}
      </div>
      {currentTrack && <Player track={currentTrack} />}
    </div>
  );
};

export default Home;
