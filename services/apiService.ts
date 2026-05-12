export type GameId = 'bf3' | 'bf4' | 'bfh' | 'bfv' | 'bf1' | 'bf2042' | 'bf6';

export const GAME_IDS: GameId[] = ['bf3', 'bf4', 'bfh', 'bfv', 'bf1', 'bf2042', 'bf6'];

export interface PlayerInfo {
  personaId: string;
  userId: string;
  userName: string;
  avatar: string;
}

export interface NormalizedPlayerStats {
  userName: string;
  avatar: string;
  platform: string;
  rank: string | null;
  rankImg: string | null;
}

export interface GameResult {
  game: GameId;
  data: NormalizedPlayerStats | null;
  rawData: Record<string, unknown> | null;
  error: string | null;
  loading: boolean;
}

const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0',
};

function toPlatform(platform: string): string {
  const p = platform.toLowerCase();
  if (p === 'xbox') return 'xboxone';
  if (p === 'ps') return 'ps4';
  return p;
}

export async function searchPlayer(username: string, platform: string): Promise<PlayerInfo | null> {
  try {
    const response = await fetch(
      `https://api.gametools.network/bfglobal/player/?name=${encodeURIComponent(username)}&platform=${toPlatform(platform)}`,
      { headers: HEADERS }
    );
    if (!response.ok) return null;
    const data: Record<string, unknown> = await response.json();
    if (!data?.personaId) return null;
    return {
      personaId: String(data.personaId ?? ''),
      userId: String(data.userId ?? ''),
      userName: String(data.name ?? data.userName ?? '') || username,
      avatar: String(data.avatar ?? ''),
    };
  } catch {
    return null;
  }
}

const BATTLELOG_GAMES: GameId[] = ['bf3', 'bf4', 'bfh', 'bf1'];

function buildApiUrl(game: GameId, platform: string, username: string, nucleusId?: string, personaId?: string): string {
  const apiPlatform = toPlatform(platform);
  const raw = game === 'bf2042' ? 'raw=true&' : '';
  const nucleus = game === 'bf2042' && nucleusId ? `&nucleus_id=${nucleusId}` : '';
  const playerId = BATTLELOG_GAMES.includes(game) && personaId ? `&playerid=${personaId}` : '';
  return `https://api.gametools.network/${game}/stats/?${raw}format_values=true&name=${encodeURIComponent(username)}&platform=${apiPlatform}&skip_battlelog=false&lang=en-us${nucleus}${playerId}`;
}

function buildBF6ApiUrl(personaId: string, platform: string): string {
  return `https://api.gametools.network/bf6/stats/?playerid=${personaId}&platform=${toPlatform(platform)}&format_values=false`;
}

function normalizeStats(game: GameId, raw: Record<string, unknown>): NormalizedPlayerStats {
  let rank: string;
  let userName: string;
  if (game === 'bf2042') {
    const loadouts = ((raw.result as Record<string, unknown>)?.inventory as Record<string, unknown>)?.loadouts as Array<Record<string, unknown>> | undefined;
    rank = String(loadouts?.[0]?.level ?? '');
    userName = String(loadouts?.[0]?.name ?? '');
  } else {
    rank = String(raw.rank ?? '');
    userName = String(raw.userName ?? '');
  }
  return {
    userName,
    avatar: String(raw.avatar ?? ''),
    platform: String(raw.platform ?? ''),
    rank: rank || null,
    rankImg: typeof raw.rankImg === 'string' ? raw.rankImg : null,
  };
}

function normalizeBF6Stats(raw: Record<string, unknown>): NormalizedPlayerStats {
  return {
    userName: String(raw.userName ?? ''),
    avatar: typeof raw.avatar === 'string' ? raw.avatar : '',
    platform: 'ea',
    rank: null,
    rankImg: null,
  };
}

async function fetchWithRetry(
  url: string,
  game: GameId,
  normalizer: (raw: Record<string, unknown>) => NormalizedPlayerStats,
  retries = 2,
): Promise<GameResult> {
  try {
    const response = await fetch(url, { headers: HEADERS });

    if (response.status === 404) {
      return { game, data: null, rawData: null, error: 'Player not found', loading: false };
    }

    if (!response.ok) {
      if (retries > 0) {
        await delay(800 * (3 - retries));
        return fetchWithRetry(url, game, normalizer, retries - 1);
      }
      return { game, data: null, rawData: null, error: 'Unavailable', loading: false };
    }

    const raw: Record<string, unknown> = await response.json();
    return { game, data: normalizer(raw), rawData: raw, error: null, loading: false };
  } catch {
    if (retries > 0) {
      await delay(800 * (3 - retries));
      return fetchWithRetry(url, game, normalizer, retries - 1);
    }
    return { game, data: null, rawData: null, error: 'Fetch error', loading: false };
  }
}

export async function fetchGame(platform: string, username: string, game: GameId, nucleusId?: string, personaId?: string): Promise<GameResult> {
  if (game === 'bf6') {
    if (!personaId) {
      return { game, data: null, rawData: null, error: 'Player not found', loading: false };
    }
    const statsResult = await fetchWithRetry(buildBF6ApiUrl(personaId, platform), 'bf6', normalizeBF6Stats);
    if (statsResult.rawData) {
      statsResult.rawData = {
        ...statsResult.rawData,
        kdr: statsResult.rawData.killDeath,
        losses: statsResult.rawData.loses,
      };
    }
    return statsResult;
  }
  return fetchWithRetry(buildApiUrl(game, platform, username, nucleusId, personaId), game, (raw) => normalizeStats(game, raw));
}

export async function fetchAllBFStats(
  platform: string,
  username: string,
  onPlayerFound: (player: PlayerInfo | null) => void,
  onBatchResult: (results: GameResult[]) => void,
): Promise<void> {
  const player = await searchPlayer(username, platform);
  onPlayerFound(player);
  if (!player) return;

  const batches: GameId[][] = [
    ['bf3', 'bf4'],
    ['bfh', 'bfv'],
    ['bf1', 'bf2042'],
    ['bf6'],
  ];
  for (let i = 0; i < batches.length; i++) {
    const results = await Promise.all(
      batches[i].map(g => fetchGame(platform, player.userName.toLowerCase(), g, player.userId, player.personaId))
    );
    onBatchResult(results);
    if (i < batches.length - 1) await delay(300);
  }
}
