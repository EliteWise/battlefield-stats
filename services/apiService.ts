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
  error?: string;
}

const playerNotFoundError = "Player not found!";

const battlefield_games = ['bf3', 'bf4', 'bfh', 'bfv', 'bf1', 'bf2042'];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchData = async (platform: string, username: string, game: string): Promise<FetchDataResponse> => {
    let apiPlatform = platform.toLowerCase();

    if (apiPlatform === "xbox") {
      apiPlatform = "xboxone";
    } else if (apiPlatform === "ps") {
      apiPlatform = "ps4";
    }

    try {
      const response = await fetch(`https://api.gametools.network/${game}/stats/?format_values=true&name=${username}&platform=${apiPlatform}&skip_battlelog=false&lang=en-us`, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        return { data: null, game, error: playerNotFoundError };
      }

      const jsonData = await response.json();
      return {data: jsonData, game: game};
    } catch (error) {
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