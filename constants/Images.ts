import { ImageSourcePropType } from "react-native";

type RankImage = {
    min: number;
    max: number;
    image: ImageSourcePropType;
};

export const rankImages: RankImage[] = [
    { min:   0, max:  10, image: require('../assets/images/bfv/BF5_Private_Badge.png') },
    { min:  11, max:  19, image: require('../assets/images/bfv/BF5_Private_First_Class_Badge.png') },
    { min:  20, max:  29, image: require('../assets/images/bfv/BF5_Lance_Corporal_Badge.png') },
    { min:  30, max:  39, image: require('../assets/images/bfv/BF5_Corporal_Badge.png') },
    { min:  40, max:  49, image: require('../assets/images/bfv/BF5_Sergeant_Badge.png') },
    { min:  50, max:  99, image: require('../assets/images/bfv/BF5_Sergeant_First_Class_Badge.png') },
    { min: 100, max: 149, image: require('../assets/images/bfv/BF5_Sergeant_Major_Badge.png') },
    { min: 150, max: 199, image: require('../assets/images/bfv/BF5_Second_Lieutenant_Badge.png') },
    { min: 200, max: 249, image: require('../assets/images/bfv/BF5_First_Lieutenant_Badge.png') },
    { min: 250, max: 299, image: require('../assets/images/bfv/BF5_Captain_Badge.png') },
    { min: 300, max: 349, image: require('../assets/images/bfv/BF5_Major_Badge.png') },
    { min: 350, max: 399, image: require('../assets/images/bfv/BF5_Lieutenant_Colonel_Badge.png') },
    { min: 400, max: 449, image: require('../assets/images/bfv/BF5_Colonel_Badge.png') },
    { min: 450, max: 499, image: require('../assets/images/bfv/BF5_Brigadier_Badge.png') },
    { min: 500, max: 500, image: require('../assets/images/bfv/BF5_General_Badge.png') },
  ];

export function getImageForRank(rank: number): ImageSourcePropType | undefined {
    const found = rankImages.find(item => rank >= item.min && rank <= item.max);
    return found ? found.image : undefined;
}