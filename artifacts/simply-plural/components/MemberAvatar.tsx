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
  const borderWidth = 2.5;
  const borderRadius = size * 0.22;
  const innerSize = isFronting ? size - borderWidth * 2 : size;
  const innerRadius = isFronting ? borderRadius - borderWidth : borderRadius;
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
          borderWidth: isFronting ? borderWidth : 0,
        },
      ]}
    >
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerRadius,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: innerSize, height: innerSize }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              {
                width: innerSize,
                height: innerSize,
                backgroundColor: color + "33",
              },
            ]}
          >
            <Ionicons name="person" size={iconSize} color={color} />
          </View>
        )}
      </View>

      {isFronting && (
        <View
          style={[
            styles.dot,
            { backgroundColor: "#56D364", right: -3, bottom: -3 },
          ]}
        />
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
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0D1117",
  },
});
