import BF2042Rank from "@/components/BF2042Rank";
import { FOUNDER, SPECIAL } from "@/constants/Dev";
import { getImageForRank } from "@/constants/Images";
import { LoadingImageAnimation, useFetchAllBFStats } from "@/hooks/useFetchData";
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const [username, setUsername] = useState<string>("");
  const [submittedUsername, setSubmittedUsername] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [cooldown, setCooldown] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, error, setTrigger, setData } = useFetchAllBFStats("pc", submittedUsername);

  const handleSubmit = () => {
    if (cooldown > 0) return;

    const trimmedName = username.trim();

    if (trimmedName.length < 3) {
      setErrorMsg("Username must be at least 3 characters long.");
      return;
    }

    setErrorMsg(null);
    setSubmittedUsername(trimmedName);
    setTrigger(true);
    setShowSearch(false);

    setCooldown(15);
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNewSearch = () => {
    setShowSearch(true);
    setUsername("");
    setSubmittedUsername("");
    setData(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Battlefield Stats</Text>
        {!showSearch && (
          <TouchableOpacity style={styles.searchButton} onPress={handleNewSearch}>
            <Ionicons name="search" size={24} color="#00FFFF" />
          </TouchableOpacity>
        )}
      </View>

      {showSearch ? (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your player name"
            placeholderTextColor="#777"
            value={username}
            onChangeText={(name) => {
              setUsername(name);
              if (errorMsg) setErrorMsg(null);
            }}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={cooldown > 0}>
            <Text style={styles.buttonText}>Check stats</Text>
          </TouchableOpacity>

          {cooldown > 0 && (
            <Text style={styles.errorMsg}>
              Please wait {cooldown}s before next search
            </Text>
          )}

          {errorMsg && (
            <Text style={styles.errorMsg}>
              {errorMsg}
            </Text>
          )}
        </View>
      ) : (
        !showSearch && !error && (
          <>
          {data === null && submittedUsername && (
            <>
              <Text style={styles.loadingText}>Loading...</Text>
              <LoadingImageAnimation />
            </>
            )
          }

          {data && data.length === 0 && (
            <Text style={styles.errorMsg}>This player name doesn't exist.</Text>
          )}

          {data && data.length > 0 && (
            <View style={styles.playerHeader}>
              <Image source={{ uri: data[0]?.data?.avatar }} style={styles.headerAvatar} />
              <Text style={styles.playerName}>{data[0]?.data?.userName}</Text>
              <View style={styles.badgeContainer}>
                {data[0]?.data?.userName === FOUNDER && <Text style={styles.badge}>Founder</Text>}
                {data[0]?.data?.userName === SPECIAL && <Text style={styles.badge}>Elite Member</Text>}
              </View>
            </View>
          )}

          <ScrollView style={{ flex: 1 }}>
            <View style={styles.grid}>
              {data?.map(({ data: playerData, game }) => (
                <View key={game} style={styles.card}>
                  <Text style={styles.gameTitle}>{game.toUpperCase()}</Text>
                  {playerData && (
                    <>
                    {game === 'bf2042' ? (
                      <>
                      <BF2042Rank rank={Number(playerData.level)} image={require('../assets/images/bfv/bf2042/BF2042_Level.png')} />
                      <Text style={styles.rank}>Coming Soon</Text>
                      </>
                    ) : (
                      <>
                        <Image source={game === 'bfv' ? getImageForRank(Number(playerData.rank)) : { uri: playerData.rankImg }} style={styles.rankImg} />
                        {!['bf3', 'bf4', 'bfh'].includes(game) ? 
                          <Text style={styles.rank}>Rank: {game !== "bf2042" ? playerData.rank : playerData.level}</Text> 
                          : null}
                      </>
                    )}
                    </> 
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e0e",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    color: "#00FFFF",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  searchButton: {
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  searchContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#1c1c1c",
    color: "#fff",
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#00FFFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  buttonText: {
    color: "#0e0e0e",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingText: {
    color: "#00FFFF",
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginBottom: 20,
    backgroundColor: '#1a1a1b',
    borderRadius: 12,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  playerName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    alignItems: "center",
    backgroundColor: "#1a1a1b",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#00FFFF",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginBottom: 20,
    width: "48%"
  },
  gameTitle: {
    color: "#00FFFF",
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  rankImg: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },
  rank: {
    fontSize: 18,
    color: "#aaa",
  },
  badge: {
    fontSize: 12,
    color: 'gold',
    fontWeight: '600',
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    right: 10
  },
  errorMsg: {
    color: '#ff6666',
    textAlign: 'center',
    marginTop: 10
  }
});
