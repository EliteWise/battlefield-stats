import { fetchAllBFStats, PlayerStats } from '@/services/apiService';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

export const useFetchAllBFStats = (platform: string, username: string) => {
    const [data, setData] = useState<Array<{data: PlayerStats | null, game: string}> | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [trigger, setTrigger] = useState<boolean>(false);
    
    useEffect(() => {
        if (!trigger) return;

        const getData = async () => {
            try {
                const result = await fetchAllBFStats(platform, username);
                setData(result)
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                }
            } finally {
                setTrigger(false);
            }
        };
        getData();
    }, [trigger]);

    return { data, error, setTrigger, setData };
};

const AnimatedImage = Animated.Image;

export const LoadingImageAnimation = () => {
    const fadeAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence(
                [
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
                    })
                ]
            )
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
}