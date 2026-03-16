import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { MemberAvatar } from "./MemberAvatar";
import type { FrontSession } from "@/context/SystemContext";
import { formatTime } from "@/utils/time";
import { getApiUrl } from "@/utils/api";

type Props = {
  sessions: FrontSession[];
  startDate: string;
  endDate: string;
  onSessionUpdated: (session: FrontSession) => void;
  onSessionDeleted: (sessionId: string) => void;
};

type DayGroup = {
  dateLabel: string;
  dateStr: string;
  sessions: FrontSession[];
};

export function HistoryTimeline({ sessions, startDate, endDate, onSessionUpdated, onSessionDeleted }: Props) {
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
        <Ionicons name="time-outline" size={40} color={C.textTertiary} />
        <Text style={[styles.emptyText, { color: C.textSecondary }]}>No front history in this range</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="automatic">
      {grouped.map((day) => (
        <View key={day.dateStr} style={styles.dayGroup}>
          <View style={styles.dayHeader}>
            <View style={[styles.dateLine, { backgroundColor: C.border }]} />
            <Text style={[styles.dateLabel, { color: C.textSecondary }]}>{day.dateLabel}</Text>
            <View style={[styles.dateLine, { backgroundColor: C.border }]} />
          </View>

          <View style={styles.sessionContainer}>
            {day.sessions.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                onSessionUpdated={onSessionUpdated}
                onSessionDeleted={onSessionDeleted}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function TimePickerField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
  hint?: string;
}) {
  const C = Colors.dark;
  const [showPicker, setShowPicker] = useState(false);

  const displayStr = value
    ? value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Not set";

  const pickerValue = value ?? new Date();

  const handlePress = () => setShowPicker(true);

  const handleClear = () => onChange(null);

  if (Platform.OS === "android") {
    return (
      <View style={tfStyles.row}>
        <View style={tfStyles.labelCol}>
          <Text style={[tfStyles.label, { color: C.textSecondary }]}>{label}</Text>
          {hint ? <Text style={[tfStyles.hint, { color: C.textTertiary }]}>{hint}</Text> : null}
        </View>
        <View style={tfStyles.valueRow}>
          <Pressable
            onPress={handlePress}
            style={[tfStyles.valueBtn, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}
          >
            <Ionicons name="time-outline" size={14} color={C.tint} />
            <Text style={[tfStyles.valueText, { color: value ? C.text : C.textTertiary }]}>{displayStr}</Text>
          </Pressable>
          {value ? (
            <Pressable onPress={handleClear} style={tfStyles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={C.textTertiary} />
            </Pressable>
          ) : null}
        </View>
        {showPicker && (
          <DateTimePicker
            value={pickerValue}
            mode="time"
            is24Hour={false}
            display="clock"
            onChange={(event, date) => {
              setShowPicker(false);
              if (event.type === "set" && date) onChange(date);
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={tfStyles.row}>
      <View style={tfStyles.labelCol}>
        <Text style={[tfStyles.label, { color: C.textSecondary }]}>{label}</Text>
        {hint ? <Text style={[tfStyles.hint, { color: C.textTertiary }]}>{hint}</Text> : null}
      </View>
      <View style={tfStyles.valueRow}>
        <Pressable
          onPress={handlePress}
          style={[tfStyles.valueBtn, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}
        >
          <Ionicons name="time-outline" size={14} color={C.tint} />
          <Text style={[tfStyles.valueText, { color: value ? C.text : C.textTertiary }]}>{displayStr}</Text>
        </Pressable>
        {value ? (
          <Pressable onPress={handleClear} style={tfStyles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={C.textTertiary} />
          </Pressable>
        ) : null}
      </View>
      {showPicker && (
        <Modal transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
          <Pressable style={tfStyles.iosBackdrop} onPress={() => setShowPicker(false)} />
          <View style={[tfStyles.iosSheet, { backgroundColor: C.surfaceElevated }]}>
            <Text style={[tfStyles.iosTitle, { color: C.text }]}>{label}</Text>
            <DateTimePicker
              value={pickerValue}
              mode="time"
              display="spinner"
              themeVariant="dark"
              textColor={C.text}
              onChange={(_event, date) => {
                if (date) onChange(date);
              }}
              style={{ width: "100%" }}
            />
            <Pressable
              onPress={() => setShowPicker(false)}
              style={[tfStyles.iosDone, { backgroundColor: C.tint }]}
            >
              <Text style={tfStyles.iosDoneText}>Done</Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </View>
  );
}

const tfStyles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  labelCol: {
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  hint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  valueBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  valueText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  clearBtn: {
    padding: 2,
  },
  iosBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  iosSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    alignItems: "center",
    gap: 12,
  },
  iosTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    alignSelf: "flex-start",
  },
  iosDone: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  iosDoneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});

function SessionRow({
  session,
  onSessionUpdated,
  onSessionDeleted,
}: {
  session: FrontSession;
  onSessionUpdated: (s: FrontSession) => void;
  onSessionDeleted: (id: string) => void;
}) {
  const C = Colors.dark;
  const [editing, setEditing] = useState(false);
  const [customStatus, setCustomStatus] = useState(session.customStatus || "");
  const [startTime, setStartTime] = useState<Date>(new Date(session.startTime));
  const [endTime, setEndTime] = useState<Date | null>(session.endTime ? new Date(session.endTime) : null);
  const [saving, setSaving] = useState(false);

  const handleOpen = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomStatus(session.customStatus || "");
    setStartTime(new Date(session.startTime));
    setEndTime(session.endTime ? new Date(session.endTime) : null);
    setEditing(true);
  };

  const applyTime = (base: Date, picked: Date): Date => {
    const result = new Date(base);
    result.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    return result;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newStart = applyTime(new Date(session.startTime), startTime);
      const newEnd = endTime ? applyTime(new Date(session.endTime ?? session.startTime), endTime) : null;

      const res = await fetch(`${getApiUrl()}/api/front-history/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customStatus: customStatus || null,
          startTime: newStart.toISOString(),
          endTime: newEnd ? newEnd.toISOString() : null,
        }),
      });
      const updated = await res.json();
      onSessionUpdated(updated);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditing(false);
    } catch {
      Alert.alert("Error", "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Entry", "Remove this front history entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await fetch(`${getApiUrl()}/api/front-history/${session.id}`, { method: "DELETE" });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onSessionDeleted(session.id);
          setEditing(false);
        },
      },
    ]);
  };

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={({ pressed }) => [styles.sessionRow, { backgroundColor: C.surface, opacity: pressed ? 0.8 : 1 }]}
      >
        <MemberAvatar
          name={session.memberName}
          color={session.memberColor}
          avatarUrl={session.memberAvatarUrl}
          size={38}
          isFronting={session.isActive}
        />
        <View style={styles.sessionInfo}>
          <Text style={[styles.sessionName, { color: C.text }]}>{session.memberName}</Text>
          <Text style={[styles.sessionTime, { color: C.textSecondary }]}>
            {formatTime(session.startTime)}
            {session.endTime ? ` → ${formatTime(session.endTime)}` : " → now"}
          </Text>
          {session.customStatus ? (
            <Text style={[styles.sessionStatus, { color: C.textTertiary }]}>{session.customStatus}</Text>
          ) : null}
        </View>
        <Ionicons name="pencil" size={14} color={C.textTertiary} />
      </Pressable>

      <Modal visible={editing} transparent animationType="slide" onRequestClose={() => setEditing(false)}>
        <Pressable style={styles.backdrop} onPress={() => setEditing(false)} />
        <ScrollView
          style={[styles.sheet, { backgroundColor: C.surfaceElevated }]}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <MemberAvatar
                name={session.memberName}
                color={session.memberColor}
                avatarUrl={session.memberAvatarUrl}
                size={32}
                isFronting={session.isActive}
              />
              <Text style={[styles.sheetTitle, { color: C.text }]}>{session.memberName}</Text>
            </View>
            <Pressable onPress={handleDelete} hitSlop={12}>
              <Ionicons name="trash-outline" size={18} color={C.destructive} />
            </Pressable>
          </View>

          <View style={[styles.fieldGroup, { backgroundColor: C.surface, borderColor: C.border }]}>
            <TimePickerField
              label="Start time"
              value={startTime}
              onChange={(d) => d && setStartTime(d)}
            />
            <View style={[styles.inlineDivider, { backgroundColor: C.border }]} />
            <TimePickerField
              label="End time"
              value={endTime}
              onChange={setEndTime}
              hint={session.isActive ? "Leave blank to keep this session ongoing" : undefined}
            />
            <View style={[styles.inlineDivider, { backgroundColor: C.border }]} />
            <View style={styles.statusRow}>
              <View style={styles.statusLabelCol}>
                <Text style={[styles.statusLabel, { color: C.textSecondary }]}>Status</Text>
              </View>
              <TextInput
                value={customStatus}
                onChangeText={setCustomStatus}
                style={[styles.statusInput, { color: C.text }]}
                placeholder="Co-fronting, co-conscious…"
                placeholderTextColor={C.textTertiary}
              />
            </View>
          </View>

          <Pressable onPress={handleSave} disabled={saving} style={[styles.saveBtn, { backgroundColor: C.tint }]}>
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Changes"}</Text>
          </Pressable>

          <Pressable onPress={() => setEditing(false)} style={styles.cancelBtn}>
            <Text style={[styles.cancelBtnText, { color: C.textSecondary }]}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40, paddingTop: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  dayGroup: { marginBottom: 16 },
  dayHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 10, gap: 10 },
  dateLine: { flex: 1, height: 1 },
  dateLabel: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  sessionContainer: { paddingHorizontal: 16, gap: 8 },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 12 },
  sessionInfo: { flex: 1, gap: 2 },
  sessionName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  sessionTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sessionStatus: { fontSize: 11, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetContent: { padding: 20, paddingBottom: 48, gap: 16 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#444", alignSelf: "center", marginBottom: 4 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sheetTitle: { fontSize: 17, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  fieldGroup: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  inlineDivider: { height: 1, marginHorizontal: 16 },
  statusRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  statusLabelCol: {},
  statusLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  statusInput: { fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 4 },
  saveBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
