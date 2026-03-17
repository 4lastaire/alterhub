import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { useSystem } from "@/context/SystemContext";
import { toDateString, formatDateShort } from "@/utils/time";

export default function HistoryScreen() {
  const C = Colors.dark;
  const insets = useSafeAreaInsets();
  const { frontHistory, historyLoading, fetchFrontHistory, historyRange, setHistoryRange, updateHistorySession, deleteHistorySession } = useSystem();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    fetchFrontHistory(historyRange.start, historyRange.end);
  }, [historyRange]);

  const shiftRange = (direction: number) => {
    const start = new Date(historyRange.start);
    const end = new Date(historyRange.end);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    start.setDate(start.getDate() + direction * (diffDays + 1));
    end.setDate(end.getDate() + direction * (diffDays + 1));
    setHistoryRange({ start: toDateString(start), end: toDateString(end) });
  };

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    setHistoryRange({ start: toDateString(start), end: toDateString(end) });
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: C.text }]}>History</Text>
      </View>

      <View style={[styles.rangeRow, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Pressable onPress={() => shiftRange(-1)} style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={20} color={C.textSecondary} />
        </Pressable>

        <View style={styles.rangeCenter}>
          <Ionicons name="calendar-outline" size={14} color={C.tint} />
          <Text style={[styles.rangeText, { color: C.text }]}>
            {formatDateShort(historyRange.start)}
          </Text>
          <Ionicons name="arrow-forward" size={12} color={C.textTertiary} />
          <Text style={[styles.rangeText, { color: C.text }]}>
            {formatDateShort(historyRange.end)}
          </Text>
        </View>

        <Pressable onPress={() => shiftRange(1)} style={styles.arrowBtn}>
          <Ionicons name="chevron-forward" size={20} color={C.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.presetRow}>
        {[
          { label: "7d", days: 7 },
          { label: "14d", days: 14 },
          { label: "30d", days: 30 },
        ].map((p) => (
          <Pressable
            key={p.label}
            onPress={() => setPreset(p.days)}
            style={[styles.preset, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}
          >
            <Text style={[styles.presetText, { color: C.textSecondary }]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      {historyLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={C.tint} />
        </View>
      ) : (
        <HistoryTimeline
          sessions={frontHistory}
          startDate={historyRange.start}
          endDate={historyRange.end}
          onSessionUpdated={updateHistorySession}
          onSessionDeleted={deleteHistorySession}
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
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  arrowBtn: {
    padding: 12,
  },
  rangeCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  rangeText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  presetRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
