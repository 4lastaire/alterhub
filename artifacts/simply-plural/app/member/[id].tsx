import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";
import Colors from "@/constants/colors";
import { MemberAvatar } from "@/components/MemberAvatar";
import { ColorPicker } from "@/components/ColorPicker";
import { useSystem } from "@/context/SystemContext";

export default function MemberDetailScreen() {
  const C = Colors.dark;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const { members, createMember, updateMember, deleteMember } = useSystem();

  const existing = members.find((m) => m.id === id);

  const [name, setName] = useState(existing?.name || "");
  const [pronouns, setPronouns] = useState(existing?.pronouns || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [color, setColor] = useState(existing?.color || "#4ECDC4");
  const [avatarUrl, setAvatarUrl] = useState(existing?.avatarUrl || "");
  const [saving, setSaving] = useState(false);
  const [descMode, setDescMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setPronouns(existing.pronouns || "");
      setDescription(existing.description || "");
      setColor(existing.color);
      setAvatarUrl(existing.avatarUrl || "");
    }
  }, [existing]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a name for this member.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        pronouns: pronouns.trim() || null,
        description: description.trim() || null,
        color,
        avatarUrl: avatarUrl.trim() || null,
      };
      if (isNew) {
        await createMember(payload as any);
      } else {
        await updateMember(id, payload as any);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save member.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Member",
      `Are you sure you want to delete ${name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteMember(id);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ]
    );
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const markdownStyles = {
    body: { color: C.text, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
    heading1: { color: C.text, fontFamily: "Inter_700Bold", fontSize: 20, marginBottom: 8 },
    heading2: { color: C.text, fontFamily: "Inter_600SemiBold", fontSize: 17, marginBottom: 6 },
    heading3: { color: C.text, fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 4 },
    strong: { color: C.text, fontFamily: "Inter_600SemiBold" },
    em: { color: C.text, fontFamily: "Inter_400Regular", fontStyle: "italic" },
    link: { color: C.tint },
    blockquote: { backgroundColor: C.surfaceElevated, borderLeftColor: C.tint, borderLeftWidth: 3, paddingLeft: 12, marginLeft: 0 },
    code_inline: { backgroundColor: C.surfaceElevated, color: C.tint, fontFamily: "Inter_400Regular", fontSize: 13 },
    fence: { backgroundColor: C.surfaceElevated, borderRadius: 8, padding: 12 },
    code_block: { backgroundColor: C.surfaceElevated, borderRadius: 8, padding: 12 },
    bullet_list_icon: { color: C.tint },
    ordered_list_icon: { color: C.tint },
    hr: { backgroundColor: C.border },
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={C.tint} />
          <Text style={[styles.backText, { color: C.tint }]}>Back</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: C.text }]}>{isNew ? "New Member" : "Edit Member"}</Text>
        <Pressable onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? (
            <ActivityIndicator size="small" color={C.tint} />
          ) : (
            <Text style={[styles.saveText, { color: C.tint }]}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 40 }]}>
        <View style={styles.avatarSection}>
          <MemberAvatar
            name={name || "?"}
            color={color}
            avatarUrl={avatarUrl || null}
            size={88}
            isFronting={existing?.isFronting || false}
          />
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.fieldRow}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Member name"
              placeholderTextColor={C.textTertiary}
              style={[styles.input, { color: C.text }]}
              autoFocus={isNew}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: C.border }]} />
          <View style={styles.fieldRow}>
            <Text style={[styles.label, { color: C.textSecondary }]}>Pronouns</Text>
            <TextInput
              value={pronouns}
              onChangeText={setPronouns}
              placeholder="he/him, she/her, they/them..."
              placeholderTextColor={C.textTertiary}
              style={[styles.input, { color: C.text }]}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>COLOR</Text>
        <View style={[styles.colorSection, { backgroundColor: C.surface, borderColor: C.border }]}>
          <ColorPicker selected={color} onSelect={setColor} />
          <View style={[styles.hexDivider, { backgroundColor: C.border }]} />
          <View style={styles.hexRow}>
            <Text style={[styles.hexLabel, { color: C.textSecondary }]}>Custom Hex</Text>
            <View style={[styles.hexInputContainer, { borderColor: C.border }]}>
              <Text style={[styles.hexHash, { color: C.textTertiary }]}>#</Text>
              <TextInput
                value={color.startsWith("#") ? color.slice(1) : color}
                onChangeText={(val) => {
                  const hex = val.toUpperCase();
                  if (hex === "" || /^[0-9A-F]{0,6}$/.test(hex)) {
                    setColor(hex.length === 6 ? "#" + hex : hex);
                  }
                }}
                placeholder="4ECDC4"
                placeholderTextColor={C.textTertiary}
                style={[styles.hexInput, { color: C.text }]}
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>
            <View
              style={[
                styles.hexPreview,
                {
                  backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(color) ? color : C.textTertiary,
                  borderColor: /^#[0-9A-Fa-f]{6}$/.test(color) ? color : C.border,
                },
              ]}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>AVATAR URL</Text>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.fieldRow}>
            <TextInput
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              placeholder="https://..."
              placeholderTextColor={C.textTertiary}
              style={[styles.input, { color: C.text }]}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>

        <View style={styles.descHeader}>
          <Text style={[styles.sectionLabel, { color: C.textSecondary, marginBottom: 0 }]}>DESCRIPTION</Text>
          <View style={[styles.toggleRow, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
            <Pressable
              onPress={() => setDescMode("edit")}
              style={[styles.toggleBtn, descMode === "edit" && { backgroundColor: C.tint }]}
            >
              <Text style={[styles.toggleText, { color: descMode === "edit" ? "#fff" : C.textSecondary }]}>
                Edit
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDescMode("preview")}
              style={[styles.toggleBtn, descMode === "preview" && { backgroundColor: C.tint }]}
            >
              <Text style={[styles.toggleText, { color: descMode === "preview" ? "#fff" : C.textSecondary }]}>
                Preview
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          {descMode === "edit" ? (
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={"Write a description...\n\nSupports **bold**, *italic*, # headings, > quotes, and more."}
              placeholderTextColor={C.textTertiary}
              style={[styles.descInput, { color: C.text }]}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          ) : description.trim() ? (
            <View style={styles.markdownWrapper}>
              <Markdown style={markdownStyles as any}>{description}</Markdown>
            </View>
          ) : (
            <View style={styles.emptyPreview}>
              <Text style={[styles.emptyPreviewText, { color: C.textTertiary }]}>Nothing to preview</Text>
            </View>
          )}
        </View>

        {!isNew && (
          <Pressable
            onPress={handleDelete}
            style={[styles.deleteBtn, { backgroundColor: C.destructive + "18", borderColor: C.destructive + "40" }]}
          >
            <Ionicons name="trash-outline" size={16} color={C.destructive} />
            <Text style={[styles.deleteText, { color: C.destructive }]}>Delete Member</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    flex: 2,
    textAlign: "center",
  },
  saveBtn: {
    flex: 1,
    alignItems: "flex-end",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 28,
    paddingTop: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 4,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  colorSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    width: 80,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  descHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    marginLeft: 4,
    marginRight: 0,
  },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  descInput: {
    padding: 16,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 140,
  },
  markdownWrapper: {
    padding: 16,
    minHeight: 80,
  },
  emptyPreview: {
    padding: 16,
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPreviewText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  hexDivider: {
    height: 1,
    marginHorizontal: 14,
    marginVertical: 12,
  },
  hexRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  hexLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    width: 70,
  },
  hexInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  hexHash: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginRight: 2,
  },
  hexInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  hexPreview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
