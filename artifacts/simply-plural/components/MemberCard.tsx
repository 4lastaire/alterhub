import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { MemberAvatar } from "./MemberAvatar";
import type { Member } from "@/context/SystemContext";

type Props = {
  member: Member;
  onPress: () => void;
  onToggleFront: () => void;
};

export function MemberCard({ member, onPress, onToggleFront }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = async () => {
    scale.value = withSpring(0.95, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFront();
  };

  const C = Colors.dark;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: C.surface,
            borderColor: member.isFronting ? member.color + "60" : C.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={[styles.colorBar, { backgroundColor: member.color }]} />

        <MemberAvatar
          name={member.name}
          color={member.color}
          avatarUrl={member.avatarUrl}
          size={52}
          isFronting={member.isFronting}
        />

        <View style={styles.info}>
          <Text style={[styles.name, { color: C.text }]} numberOfLines={1}>
            {member.name}
          </Text>
          {member.pronouns ? (
            <Text style={[styles.pronouns, { color: C.textSecondary }]} numberOfLines={1}>
              {member.pronouns}
            </Text>
          ) : null}
        </View>

        {member.isFronting ? (
          <View style={[styles.frontingBadge, { backgroundColor: C.success + "22", borderColor: C.success + "44" }]}>
            <View style={[styles.frontDot, { backgroundColor: C.success }]} />
            <Text style={[styles.frontingText, { color: C.success }]}>Fronting</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleToggle}
          style={[
            styles.toggleBtn,
            {
              backgroundColor: member.isFronting ? member.color + "22" : C.surfaceElevated,
              borderColor: member.isFronting ? member.color : C.border,
            },
          ]}
        >
          <Ionicons
            name={member.isFronting ? "arrow-down" : "add"}
            size={18}
            color={member.isFronting ? member.color : C.textSecondary}
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 0,
    gap: 12,
    overflow: "hidden",
  },
  colorBar: {
    width: 4,
    height: "100%",
    minHeight: 52,
    borderRadius: 2,
    marginLeft: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  pronouns: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  frontingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  frontDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  frontingText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  toggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
