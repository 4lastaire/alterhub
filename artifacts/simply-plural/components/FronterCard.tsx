import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { MemberAvatar } from "./MemberAvatar";
import { formatDuration, formatDate, formatTime } from "@/utils/time";
import type { FrontSession } from "@/context/SystemContext";

type Props = {
  session: FrontSession;
  onStop: () => void;
  onUpdateStatus: (status: string) => void;
};

export function FronterCard({ session, onStop, onUpdateStatus }: Props) {
  const C = Colors.dark;
  const [elapsed, setElapsed] = useState(formatDuration(session.startTime));
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusText, setStatusText] = useState(session.customStatus || "");

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(formatDuration(session.startTime));
    }, 30000);
    return () => clearInterval(timer);
  }, [session.startTime]);

  const handleStop = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onStop();
  };

  const handleStatusSubmit = () => {
    setEditingStatus(false);
    if (statusText !== session.customStatus) {
      onUpdateStatus(statusText);
    }
  };

  const startDate = formatDate(session.startTime);
  const startTime = formatTime(session.startTime);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: C.surface,
          borderColor: session.memberColor + "50",
        },
      ]}
    >
      <View style={[styles.topRow]}>
        <MemberAvatar
          name={session.memberName}
          color={session.memberColor}
          avatarUrl={session.memberAvatarUrl}
          size={52}
          isFronting
        />
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: C.text }]}>{session.memberName}</Text>
          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={12} color={C.textSecondary} />
            <Text style={[styles.timer, { color: C.textSecondary }]}> {elapsed}</Text>
          </View>
        </View>
        <Pressable
          onPress={handleStop}
          style={[styles.stopBtn, { backgroundColor: C.destructive + "22", borderColor: C.destructive + "44" }]}
        >
          <Ionicons name="arrow-down" size={18} color={C.destructive} />
        </Pressable>
      </View>

      <View style={[styles.divider, { backgroundColor: session.memberColor + "30" }]} />

      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={13} color={C.textTertiary} />
        <Text style={[styles.meta, { color: C.textTertiary }]}> {startDate} {startTime}</Text>
      </View>

      <View style={styles.statusRow}>
        <TextInput
          value={statusText}
          onChangeText={setStatusText}
          onFocus={() => setEditingStatus(true)}
          onBlur={handleStatusSubmit}
          onSubmitEditing={handleStatusSubmit}
          placeholder="Co-fronting, co-conscious..."
          placeholderTextColor={C.textTertiary}
          style={[styles.statusInput, { color: C.textSecondary, borderBottomColor: editingStatus ? session.memberColor : C.border }]}
          returnKeyType="done"
        />
        {editingStatus && (
          <Pressable onPress={handleStatusSubmit}>
            <Ionicons name="checkmark-circle" size={20} color={session.memberColor} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nameBlock: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timer: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  stopBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    width: "100%",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
});
