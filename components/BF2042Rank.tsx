import { Text } from "@react-navigation/elements";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";

type RankImage = {
    rank: number;
    image: ImageSourcePropType;
}

const BF2042Rank = ({ rank, image }: RankImage) => {
    return (
        <View style={styles.container}>
            <Image source={image} style={styles.image} resizeMode="contain" />
            <View style={styles.overlay}>
                <Text style={styles.rank}>{rank}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        borderRadius: 10,
        width: 90,
        height: 90,
        marginBottom: 10,
    },
    rank: {
        color: 'black',
        fontWeight: 'bold',
        transform: [{ translateX: -4 }, { translateY: -15 }]
    }
});

export default BF2042Rank;