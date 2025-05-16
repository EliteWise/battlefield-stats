import { fetchAllBFStats, PlayerStats } from '@/services/apiService';
import { useEffect, useState } from 'react';

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

