import React, { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

type Props = {
  label: string;
  value: Date | null;
  onChange: (d: Date | null) => void;
  hint?: string;
  clearable?: boolean;
};

export function TimePickerField({ label, value, onChange, hint, clearable = true }: Props) {
  const C = Colors.dark;
  const [showPicker, setShowPicker] = useState(false);
  const pickerValue = value ?? new Date();

  const displayStr = value
    ? value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Tap to set";

  if (Platform.OS === "android") {
    return (
      <View style={styles.wrapper}>
        <View style={styles.labelCol}>
          <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
          {hint ? <Text style={[styles.hint, { color: C.textTertiary }]}>{hint}</Text> : null}
        </View>
        <View style={styles.valueRow}>
          <Pressable
            onPress={() => setShowPicker(true)}
            style={[styles.valueBtn, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}
          >
            <Ionicons name="time-outline" size={14} color={C.tint} />
            <Text style={[styles.valueText, { color: value ? C.text : C.textTertiary }]}>{displayStr}</Text>
          </Pressable>
          {clearable && value ? (
            <Pressable onPress={() => onChange(null)} style={styles.clearBtn} hitSlop={8}>
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
    <View style={styles.wrapper}>
      <View style={styles.labelCol}>
        <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: C.textTertiary }]}>{hint}</Text> : null}
      </View>
      <View style={styles.valueRow}>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[styles.valueBtn, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}
        >
          <Ionicons name="time-outline" size={14} color={C.tint} />
          <Text style={[styles.valueText, { color: value ? C.text : C.textTertiary }]}>{displayStr}</Text>
        </Pressable>
        {clearable && value ? (
          <Pressable onPress={() => onChange(null)} style={styles.clearBtn} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={C.textTertiary} />
          </Pressable>
        ) : null}
      </View>
      {showPicker && (
        <Modal transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
          <Pressable style={styles.iosBackdrop} onPress={() => setShowPicker(false)} />
          <View style={[styles.iosSheet, { backgroundColor: C.surfaceElevated }]}>
            <Text style={[styles.iosTitle, { color: C.text }]}>{label}</Text>
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
              style={[styles.iosDone, { backgroundColor: C.tint }]}
            >
              <Text style={styles.iosDoneText}>Done</Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
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
