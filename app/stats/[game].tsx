import { getImageForRank } from '@/constants/Images';
import { GameId, GameResult, fetchGame } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const STAT_FIELDS: Array<{ label: string; keys: string[] }> = [
  { label: 'Score / min',   keys: ['scorePerMinute', 'spm'] },
  { label: 'Kills / min',   keys: ['killsPerMinute', 'kpm'] },
  { label: 'K/D Ratio',     keys: ['kdr'] },
  { label: 'Kills',         keys: ['kills'] },
  { label: 'Deaths',        keys: ['deaths'] },
  { label: 'Wins',          keys: ['wins'] },
  { label: 'Losses',        keys: ['losses'] },
  { label: 'W/L Ratio',     keys: ['wlr'] },
  { label: 'Accuracy',      keys: ['accuracy'] },
  { label: 'Time Played',   keys: ['timePlayed'] },
  { label: 'Headshots',     keys: ['headshotsPerKill', 'headshots'] },
  { label: 'Skill',         keys: ['skill'] },
  { label: 'Assists',       keys: ['assists'] },
  { label: 'Revives',       keys: ['revives'] },
  { label: 'Repairs',       keys: ['repairs'] },
  { label: 'Longest HS',    keys: ['longestHeadshot'] },
];

function getValue(raw: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const val = raw[key];
    if (val !== undefined && val !== null && val !== '') return String(val);
  }
  return null;
}

export default function GameStats() {
  const { game, username, platform, nucleusId, personaId } = useLocalSearchParams<{
    game: GameId;
    username: string;
    platform: string;
    nucleusId?: string;
    personaId?: string;
  }>();

  const [result, setResult] = useState<GameResult | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (game && username && platform) {
      fetchGame(platform, username, game, nucleusId || undefined, personaId || undefined)
        .then(setResult)
        .catch(() => setResult({ game: game as GameId, data: null, rawData: null, error: 'Fetch error', loading: false }));
    } else if (game) {
      setResult({ game: game as GameId, data: null, rawData: null, error: 'Missing params', loading: false });
    }
  }, [game, username, platform, nucleusId, personaId]);

  const data = result?.data ?? null;
  const raw = result?.rawData ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#f1dfd2" />
        </TouchableOpacity>
        <Text style={styles.title}>{String(game ?? '').toUpperCase()}</Text>
        <View style={{ width: 38 }} />
      </View>

      {!result ? (
        <ActivityIndicator color="#fea85d" size="large" style={{ marginTop: 60 }} />
      ) : result.error || !data ? (
        <Text style={styles.errorText}>Player not found for this game.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.playerHeader}>
            {data.avatar && !avatarError ? (
              <Image
                source={{ uri: data.avatar }}
                style={styles.avatar}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person-outline" size={28} color="#f8d5b8" />
              </View>
            )}
            <View>
              <Text style={styles.playerName}>{data.userName}</Text>
              {data.rank && (
                <Text style={styles.rankText}>
                  {game === 'bf2042' ? 'Level' : 'Rank'} {data.rank}
                </Text>
              )}
            </View>
          </View>

          {data.rankImg || game === 'bfv' ? (
            <View style={styles.rankImgContainer}>
              <Image
                source={game === 'bfv'
                  ? getImageForRank(Number(data.rank))
                  : { uri: data.rankImg ?? '' }
                }
                style={styles.rankImg}
                resizeMode="contain"
              />
            </View>
          ) : null}

          {raw && game !== 'bf2042' && (
            <View style={styles.statsGrid}>
              {STAT_FIELDS.map(({ label, keys }) => {
                const value = getValue(raw, keys);
                if (!value) return null;
                return (
                  <View key={label} style={styles.statCard}>
                    <Text style={styles.statLabel}>{label}</Text>
                    <Text style={styles.statValue}>{value}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#46444e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3e3c45',
    borderWidth: 1,
    borderColor: '#5a5961',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fea85d',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3e3c45',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#f8d5b8',
  },
  avatarFallback: {
    backgroundColor: '#2e2d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerName: {
    color: '#f1dfd2',
    fontSize: 20,
    fontWeight: 'bold',
  },
  rankText: {
    color: '#fea85d',
    fontSize: 14,
    marginTop: 2,
  },
  rankImgContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rankImg: {
    width: 100,
    height: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 40,
  },
  statCard: {
    backgroundColor: '#3e3c45',
    borderRadius: 12,
    padding: 14,
    width: '48%',
    alignItems: 'center',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    color: '#f1dfd2',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: '#ff9999',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
