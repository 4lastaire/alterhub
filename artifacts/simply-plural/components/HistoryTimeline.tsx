import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { MemberAvatar } from "./MemberAvatar";
import type { FrontSession } from "@/context/SystemContext";
import { formatTime } from "@/utils/time";

type Props = {
  sessions: FrontSession[];
  startDate: string;
  endDate: string;
};

type DayGroup = {
  dateLabel: string;
  dateStr: string;
  sessions: FrontSession[];
};

export function HistoryTimeline({ sessions, startDate, endDate }: Props) {
  const C = Colors.dark;

  const grouped = useMemo<DayGroup[]>(() => {
    const map: Record<string, FrontSession[]> = {};
    for (const s of sessions) {
      const dateKey = new Date(s.startTime).toISOString().split("T")[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(s);
    }
    const now = new Date();
    const result: DayGroup[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let cur = new Date(end);
    while (cur >= start) {
      const key = cur.toISOString().split("T")[0];
      const isToday = key === now.toISOString().split("T")[0];
      const label = isToday
        ? "Today"
        : cur.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
      if (map[key] && map[key].length > 0) {
        result.push({ dateLabel: label, dateStr: key, sessions: map[key] });
      }
      cur.setDate(cur.getDate() - 1);
    }
    return result;
  }, [sessions, startDate, endDate]);

  if (grouped.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: C.textSecondary }]}>No front history in this range</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {grouped.map((day) => (
        <View key={day.dateStr} style={styles.dayGroup}>
          <View style={styles.dayHeader}>
            <View style={[styles.dateLine, { backgroundColor: C.border }]} />
            <Text style={[styles.dateLabel, { color: C.textSecondary }]}>{day.dateLabel}</Text>
            <View style={[styles.dateLine, { backgroundColor: C.border }]} />
          </View>

          <View style={styles.barContainer}>
            {day.sessions.map((s) => (
              <SessionBar key={s.id} session={s} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function SessionBar({ session }: { session: FrontSession }) {
  const C = Colors.dark;
  const start = new Date(session.startTime);
  const end = session.endTime ? new Date(session.endTime) : new Date();
  const totalMinutesInDay = 24 * 60;

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const durationMinutes = endMinutes - startMinutes;
  const heightPercent = Math.max((durationMinutes / totalMinutesInDay) * 100, 2);

  const durationLabel = formatTime(session.startTime);

  return (
    <View style={styles.sessionRow}>
      <MemberAvatar
        name={session.memberName}
        color={session.memberColor}
        avatarUrl={session.memberAvatarUrl}
        size={36}
        isFronting={session.isActive}
      />

      <View style={styles.barColumn}>
        <View
          style={[
            styles.bar,
            {
              backgroundColor: session.memberColor,
              height: Math.max(durationMinutes / 2, 40),
              opacity: session.isActive ? 1 : 0.75,
            },
          ]}
        >
          {session.isActive && (
            <View style={[styles.activeIndicator, { backgroundColor: "#fff" }]} />
          )}
        </View>
        <Text style={[styles.timeLabel, { color: C.textTertiary }]}>{durationLabel}</Text>
      </View>

      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionName, { color: C.text }]}>{session.memberName}</Text>
        <Text style={[styles.sessionTime, { color: C.textSecondary }]}>
          {formatTime(session.startTime)}{session.endTime ? ` → ${formatTime(session.endTime)}` : " → now"}
        </Text>
        {session.customStatus ? (
          <Text style={[styles.sessionStatus, { color: C.textTertiary }]}>{session.customStatus}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  dayGroup: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  barContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#161B22",
    borderRadius: 14,
    padding: 12,
  },
  barColumn: {
    alignItems: "center",
    gap: 4,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.8,
  },
  timeLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  sessionName: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  sessionTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  sessionStatus: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
});
