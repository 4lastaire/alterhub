import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { FronterCard } from "@/components/FronterCard";
import { useSystem } from "@/context/SystemContext";

export default function FrontersScreen() {
  const C = Colors.dark;
  const insets = useSafeAreaInsets();
  const { fronters, fetchFronters, stopFronting, updateFrontStatus, members } = useSystem();
  const [customFrontStatus, setCustomFrontStatus] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFronters();
    setRefreshing(false);
  }, [fetchFronters]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: C.text }]}>Fronting</Text>
        <View style={[styles.badge, { backgroundColor: fronters.length > 0 ? C.tint + "22" : C.surfaceElevated }]}>
          <Text style={[styles.badgeText, { color: fronters.length > 0 ? C.tint : C.textSecondary }]}>
            {fronters.length} active
          </Text>
        </View>
      </View>

      {fronters.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={48} color={C.textTertiary} />
          <Text style={[styles.emptyTitle, { color: C.text }]}>Nobody fronting</Text>
          <Text style={[styles.emptySubtitle, { color: C.textSecondary }]}>
            Use the Members tab to mark who is currently fronting
          </Text>
        </View>
      ) : (
        <FlatList
          data={fronters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FronterCard
              session={item}
              onStop={() => stopFronting(item.id)}
              onUpdateStatus={(status) => updateFrontStatus(item.id, status)}
            />
          )}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.tint} />
          }
        />
      )}

      <View style={[styles.customStatusBar, { backgroundColor: C.surface, borderTopColor: C.border, paddingBottom: bottomPad + 8 }]}>
        <TextInput
          value={customFrontStatus}
          onChangeText={setCustomFrontStatus}
          placeholder="Add Custom Front Status..."
          placeholderTextColor={C.textTertiary}
          style={[styles.customInput, { color: C.text, backgroundColor: C.surfaceElevated }]}
          returnKeyType="done"
        />
      </View>
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
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  list: {
    paddingVertical: 6,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
    paddingBottom: 80,
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
  customStatusBar: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  customInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
