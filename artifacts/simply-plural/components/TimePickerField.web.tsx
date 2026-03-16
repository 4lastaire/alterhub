import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const toTimeStr = (d: Date) => {
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const displayStr = value
    ? value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Tap to set";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) { onChange(null); return; }
    const [h, m] = val.split(":").map(Number);
    const base = value ?? new Date();
    const result = new Date(base);
    result.setHours(h, m, 0, 0);
    onChange(result);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelCol}>
        <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: C.textTertiary }]}>{hint}</Text> : null}
      </View>
      <View style={styles.valueRow}>
        <Pressable
          onPress={() => inputRef.current?.showPicker?.()}
          style={[styles.valueBtn, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}
        >
          <Ionicons name="time-outline" size={14} color={C.tint} />
          <Text style={[styles.valueText, { color: value ? C.text : C.textTertiary }]}>{displayStr}</Text>
          <input
            ref={inputRef}
            type="time"
            value={value ? toTimeStr(value) : ""}
            onChange={handleChange}
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              width: 1,
              height: 1,
            }}
          />
        </Pressable>
        {clearable && value ? (
          <Pressable onPress={() => onChange(null)} style={styles.clearBtn} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={C.textTertiary} />
          </Pressable>
        ) : null}
      </View>
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
    overflow: "hidden",
  },
  valueText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  clearBtn: {
    padding: 2,
  },
});
