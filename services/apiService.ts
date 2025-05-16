export interface PlayerStats {
    userName: string;
    avatar: string;
    platform: string;
    rank?: string;
    level?: string;
    rankImg: string;
}

interface FetchDataResponse {
  data: PlayerStats | null;
  game: string;
}

const battlefield_games = ['bf3', 'bf4', 'bfh', 'bfv', 'bf1', 'bf2042'];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchData = async (platform: string, username: string, game: string): Promise<FetchDataResponse> => {
    try {
      const response = await fetch(`https://api.gametools.network/${game}/stats/?format_values=true&name=${username}&platform=${platform}&skip_battlelog=false&lang=en-us`, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      });
      if (!response.ok) {
        throw new Error(`Network response was not ok for ${game}`);
      }
      const jsonData = await response.json();
      return {data: jsonData, game: game};
    } catch (error) {
      console.error(error);
      return {data: null, game: game}
    }
  };

export const fetchAllBFStats = async (platform: string, username: string) => {
    const results = [];

    for (const bf of battlefield_games) {
        const result = await fetchData(platform, username, bf);
        results.push(result);
        await delay(500);
    }
    return results;
}