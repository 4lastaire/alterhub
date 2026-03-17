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
  const gap = 3;
  const outerRadius = size * 0.24;
  const innerSize = size - gap * 2;
  const innerRadius = outerRadius - gap;
  const iconSize = size * 0.45;

  return (
    <View style={{ width: size, height: size }}>
      {isFronting && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            borderRadius: outerRadius,
            backgroundColor: color,
          }}
        />
      )}

      <View
        style={{
          position: "absolute",
          top: isFronting ? gap : 0,
          left: isFronting ? gap : 0,
          width: isFronting ? innerSize : size,
          height: isFronting ? innerSize : size,
          borderRadius: isFronting ? innerRadius : outerRadius,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: color + "33",
        }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="person" size={iconSize} color={color} />
        )}
      </View>

      {isFronting && (
        <View
          style={{
            position: "absolute",
            right: -3,
            bottom: -3,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: "#56D364",
            borderWidth: 2,
            borderColor: "#0D1117",
          }}
        />
      )}
    </View>
  );
}
