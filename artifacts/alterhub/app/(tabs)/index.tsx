import React, { useCallback, useMemo, useState } from "react";
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
import { Alert } from "react-native";
import type { Member } from "@/context/SystemContext";

export default function MembersScreen() {
  const C = Colors.dark;
  const insets = useSafeAreaInsets();
  const { members, groups, isLoading, fetchMembers, startFronting, stopFronting, fronters } =
      useSystem();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  }, [fetchMembers]);

  const handleToggleFront = useCallback(
      async (member: Member) => {
        try {
          if (member.isFronting) {
            const session = fronters.find((s) => s.memberId === member.id);
            if (session) await stopFronting(session.id);
          } else {
            await startFronting(member.id);
          }
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
          console.error("toggle front error", e);
          Alert.alert("Error", "Could not update fronting status. Please try again.");
        }
      },
      [fronters, startFronting, stopFronting],
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const visibleMembers = useMemo(
      () =>
          selectedGroupId == null
              ? members
              : members.filter((m) => m.groups?.some((g) => g.id === selectedGroupId)),
      [members, selectedGroupId],
  );

  const groupCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of members) {
      for (const g of m.groups ?? []) {
        map.set(g.id, (map.get(g.id) ?? 0) + 1);
      }
    }
    return map;
  }, [members]);

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

        {/* Groups row */}
        <View style={styles.groupsRow}>
          <Pressable
              onPress={() => setSelectedGroupId(null)}
              style={[
                styles.groupChip,
                selectedGroupId === null && [
                  styles.groupChipSelected,
                  { borderColor: C.tint, backgroundColor: C.tint + "22" },
                ],
              ]}
          >
            <Text
                style={[
                  styles.groupChipText,
                  { color: selectedGroupId === null ? C.tint : C.textSecondary },
                ]}
            >
              All
            </Text>
          </Pressable>

          {groups.map((g) => {
            const selected = selectedGroupId === g.id;
            const count = groupCounts.get(g.id) ?? 0;
            const color = g.color || C.tabIconDefault;
            return (
                <Pressable
                    key={g.id}
                    onPress={() => setSelectedGroupId(selected ? null : g.id)}
                    style={[
                      styles.groupChip,
                      selected && {
                        borderColor: color,
                        backgroundColor: color + "22",
                      },
                    ]}
                >
                  <Text
                      style={[
                        styles.groupChipText,
                        { color: selected ? color : C.textSecondary },
                      ]}
                  >
                    {g.name}
                  </Text>
                  <View
                      style={[
                        styles.groupCountPill,
                        {
                          backgroundColor: selected ? color : C.surfaceElevated,
                        },
                      ]}
                  >
                    <Text
                        style={[
                          styles.groupCountText,
                          { color: selected ? "#000" : C.textSecondary },
                        ]}
                    >
                      {count}
                    </Text>
                  </View>
                </Pressable>
            );
          })}
        </View>

        {isLoading && members.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={C.tint} />
            </View>
        ) : visibleMembers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={C.textTertiary} />
              <Text style={[styles.emptyTitle, { color: C.text }]}>No members yet</Text>
              <Text style={[styles.emptySubtitle, { color: C.textSecondary }]}>
                Tap the + button to add your first system member
              </Text>
            </View>
        ) : (
            <FlatList
                data={visibleMembers}
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
  groupsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  groupChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  groupChipSelected: {},
  groupChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  groupCountPill: {
    marginLeft: 6,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  groupCountText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
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