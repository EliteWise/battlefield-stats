import { GAME_IDS, GameResult, PlayerInfo, fetchAllBFStats } from '@/services/apiService';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

const makeInitialResults = (): GameResult[] =>
  GAME_IDS.map(game => ({ game, data: null, rawData: null, error: null, loading: false }));

export const useFetchAllBFStats = (platform: string, username: string) => {
  const [results, setResults] = useState<GameResult[]>(makeInitialResults());
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trigger, setTrigger] = useState(false);

  const resetResults = () => {
    setResults(makeInitialResults());
    setPlayerInfo(null);
    setHasSearched(false);
  };

  useEffect(() => {
    if (!trigger) return;

    setIsLoading(true);
    setHasSearched(true);
    setPlayerInfo(null);
    setResults(GAME_IDS.map(game => ({ game, data: null, rawData: null, error: null, loading: true })));

    fetchAllBFStats(
      platform,
      username,
      (player) => setPlayerInfo(player),
      (batchResults) => {
        setResults(prev => {
          const next = [...prev];
          batchResults.forEach(r => {
            const idx = next.findIndex(x => x.game === r.game);
            if (idx !== -1) next[idx] = r;
          });
          return next;
        });
      },
    ).finally(() => {
      setIsLoading(false);
      setTrigger(false);
      setResults(prev => prev.map(r => r.loading ? { ...r, loading: false } : r));
    });
  }, [trigger]);

  return { results, playerInfo, isLoading, hasSearched, setTrigger, resetResults };
};

const AnimatedImage = Animated.Image;

export const LoadingImageAnimation = () => {
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnimation, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  return (
    <AnimatedImage
      source={require('../assets/images/bfv/BF5_Loading.png')}
      style={{
        width: 200,
        height: 200,
        opacity: fadeAnimation,
        alignSelf: 'center',
        marginTop: 40,
        borderWidth: 0,
        borderColor: 'transparent',
      }}
      resizeMode="contain"
    />
  );
};
