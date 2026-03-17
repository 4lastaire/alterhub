import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { MemberCard } from "@/components/MemberCard";
import { useSystem } from "@/context/SystemContext";
import type { Member } from "@/context/SystemContext";

export default function MembersScreen() {
  const C = Colors.dark;
  const insets = useSafeAreaInsets();
  const { members, isLoading, fetchMembers, startFronting, stopFronting, fronters } = useSystem();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  }, [fetchMembers]);

  const handleToggleFront = useCallback(async (member: Member) => {
    if (member.isFronting) {
      const session = fronters.find((s) => s.memberId === member.id);
      if (session) await stopFronting(session.id);
    } else {
      await startFronting(member.id);
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [fronters, startFronting, stopFronting]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: C.text }]}>Members</Text>
        <Pressable
          onPress={() => router.push("/member/new")}
          style={[styles.addBtn, { backgroundColor: C.tint }]}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {isLoading && members.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={C.tint} />
        </View>
      ) : members.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={C.textTertiary} />
          <Text style={[styles.emptyTitle, { color: C.text }]}>No members yet</Text>
          <Text style={[styles.emptySubtitle, { color: C.textSecondary }]}>
            Tap the + button to add your first system member
          </Text>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MemberCard
              member={item}
              onPress={() => router.push(`/member/${item.id}`)}
              onToggleFront={() => handleToggleFront(item)}
            />
          )}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.tint}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 110,
  },
});
