import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

type Props = {
  name: string;
  color: string;
  avatarUrl?: string | null;
  size?: number;
  isFronting?: boolean;
};

export function MemberAvatar({ name, color, avatarUrl, size = 52, isFronting = false }: Props) {
  const borderRadius = size * 0.22;
  const iconSize = size * 0.45;

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius,
          borderColor: color,
          borderWidth: isFronting ? 2.5 : 0,
        },
      ]}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.image, { width: size - (isFronting ? 5 : 0), height: size - (isFronting ? 5 : 0), borderRadius: borderRadius - 1 }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size - (isFronting ? 5 : 0),
              height: size - (isFronting ? 5 : 0),
              borderRadius: borderRadius - 1,
              backgroundColor: color + "33",
            },
          ]}
        >
          <Ionicons name="person" size={iconSize} color={color} />
        </View>
      )}
      {isFronting && (
        <View style={[styles.dot, { backgroundColor: "#56D364", borderRadius: 6, width: 12, height: 12, right: -3, bottom: -3 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  image: {
    backgroundColor: "#1E2530",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#0D1117",
  },
});
