import BF2042Rank from "@/components/BF2042Rank";
import { FOUNDER, SPECIAL } from "@/constants/Dev";
import { getImageForRank } from "@/constants/Images";
import { LoadingImageAnimation, useFetchAllBFStats } from "@/hooks/useFetchData";
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
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
  const [textWidth, setTextWidth] = useState(0);
  const [platform, setPlatform] = useState<"PC" | "Xbox" | "PS">("PC");
  const [showPlatformOptions, setShowPlatformOptions] = useState(false);

  Font.useFonts({
    ...Ionicons.font
  });

  const { data, error, setTrigger, setData } = useFetchAllBFStats(platform, submittedUsername);

  const handleSubmit = () => {
    if (cooldown > 0) return;

    const trimmedName = username.trim();

    if (trimmedName.length < 3) {
      setErrorMsg("Player name must be at least 3 characters long.");
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

  const firstValidData = data?.find(item => item.data !== null);
  const player = firstValidData?.data ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Battlefield Stats</Text>
        {!showSearch && (
          <TouchableOpacity style={styles.searchButton} onPress={handleNewSearch}>
            <Ionicons name="search" size={24} color="#f1dfd2" />
          </TouchableOpacity>
        )}
      </View>

      {showSearch ? (
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <View style={styles.platformDropdownContainer}>
              <TouchableOpacity
                onPress={() => setShowPlatformOptions((prev) => !prev)}
                style={styles.platformSelectorHeader}
              >
                <Text style={styles.platformSelectorHeaderText}>{platform.toUpperCase()}</Text>
              </TouchableOpacity>

              {showPlatformOptions && (
                <View style={styles.platformOptions}>
                  {["PC", "Xbox", "PS"].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => {
                        setPlatform(p as "PC" | "Xbox" | "PS");
                        setShowPlatformOptions(false);
                      }}
                      style={[
                        styles.platformOption,
                        platform === p && styles.platformOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.platformOptionText,
                          platform === p && styles.platformOptionTextActive,
                        ]}
                      >
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

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
          </View>
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
              <LoadingImageAnimation />
            </>
            )
          }

          {data && data.length === 0 && (
            <Text style={styles.errorMsg}>This player name doesn't exist.</Text>
          )}

          {data && data.length > 0 && player && (
            <View style={styles.playerHeader}>
              <Image source={{ uri: player.avatar }} style={styles.headerAvatar} />
              <Text style={styles.playerName}>{player.userName}</Text>
              <View style={styles.badgeContainer}>
                {player.userName === FOUNDER && <Text style={styles.badge}>Founder</Text>}
                {player.userName === SPECIAL && <Text style={styles.badge}>Elite Member</Text>}
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
      {(showSearch && 
      <View style={styles.vLinesContainer}>
        <Text onLayout={e => setTextWidth(e.nativeEvent.layout.width)} style={[styles.motto, { left: '50%', opacity: textWidth === 0 ? 0 : 0.6, transform: [{ translateX: -textWidth / 2 }, { translateY: 150 }] }]}>Only in Battlefield</Text>
        <View style={styles.vLineLeft} />
        <View style={styles.vLineRight} />
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#46444e",
    paddingTop: 60,
    paddingHorizontal: 20,
    position: 'relative'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    color: "#fea85d",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  searchButton: {
    flex: 1,
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3e3c45',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fea85d',
  },
  searchContainer: {
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#5a5961",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#3e3c45",
    color: "#f1dfd2",
    fontSize: 16,
    textAlignVertical: "center",
    paddingVertical: 0,
  },
  button: {
    backgroundColor: "#fea85d",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#fea85d",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    color: "#1a1a1b",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingText: {
    color: "#f8d5b8",
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
    backgroundColor: '#3e3c45',
    borderRadius: 12,
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#f8d5b8',
  },
  playerName: {
    fontSize: 24,
    color: '#f1dfd2',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    alignItems: "center",
    backgroundColor: "#3e3c45",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#fea85d",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
    width: "48%"
  },
  gameTitle: {
    color: "#fea85d",
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
    color: "#f1dfd2",
  },
  badge: {
    fontSize: 12,
    color: '#fea85d',
    fontWeight: '600',
    backgroundColor: '#2e2d32',
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
    color: '#ff9999',
    textAlign: 'center',
    marginTop: 10
  },
  vLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  vLineLeft: {
    position: 'absolute',
    width: 3,
    height: '107.2%',
    backgroundColor: '#fea85d',
    transform: [{ rotate: '-30deg' }],
    top: 0,
    left: '-10%',
    opacity: 0.1,
  },
  vLineRight: {
    position: 'absolute',
    width: 3,
    height: '107.2%',
    backgroundColor: '#fea85d',
    transform: [{ rotate: '30deg' }],
    right: '-10%',
    top: 0,
    opacity: 0.1,
  },
  motto: {
    position: 'absolute',
    top: '50%',
    textAlign: 'center',
    fontSize: 18,
    color: '#f1dfd2',
    fontStyle: 'italic',
    opacity: 0.1,
    letterSpacing: 1,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  platformDropdownContainer: {
    marginRight: 8,
    width: 70,
  },
  platformSelectorHeader: {
    backgroundColor: "#3e3c45",
    borderColor: "#5a5961",
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  platformSelectorHeaderText: {
    color: "#f1dfd2",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  platformOptions: {
    position: "absolute",
    top: 48,
    left: 0,
    width: "100%",
    backgroundColor: "#3e3c45",
    borderColor: "#5a5961",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 2
  },
  platformOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  platformOptionActive: {
    backgroundColor: "#fea85d",
  },
  platformOptionText: {
    color: "#f1dfd2",
    fontSize: 14,
    textAlign: "center",
  },
  platformOptionTextActive: {
    color: "#1a1a1b",
    fontWeight: "bold",
  },
});

