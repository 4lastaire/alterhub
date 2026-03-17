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
  const { members, createMember, updateMember, deleteMember, fetchMembers } = useSystem();

  const existing = members.find((m) => m.id === id);

  const [mode, setMode] = useState<"view" | "edit">(isNew ? "edit" : "view");
  const [name, setName] = useState(existing?.name || "");
  const [pronouns, setPronouns] = useState(existing?.pronouns || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [color, setColor] = useState(existing?.color || "#4ECDC4");
  const [avatarUrl, setAvatarUrl] = useState(existing?.avatarUrl || "");
  const [saving, setSaving] = useState(false);
  const [descTab, setDescTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setPronouns(existing.pronouns || "");
      setDescription(existing.description || "");
      setColor(existing.color);
      setAvatarUrl(existing.avatarUrl || "");
    }
  }, [existing]);

  const handleEdit = () => {
    setMode("edit");
  };

  const handleCancel = () => {
    if (isNew) {
      router.back();
    } else {
      // reset to existing values
      if (existing) {
        setName(existing.name);
        setPronouns(existing.pronouns || "");
        setDescription(existing.description || "");
        setColor(existing.color);
        setAvatarUrl(existing.avatarUrl || "");
      }
      setMode("view");
    }
  };

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
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else {
        await updateMember(id, payload as any);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setMode("view");
      }
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
            try {
              await deleteMember(id);
              // Ensure upstream state is fresh (especially in online/API mode)
              await fetchMembers();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              router.back();
            } catch (e) {
              console.error("delete member error", e);
              Alert.alert("Error", "Failed to delete member. Please try again.");
            }
          },
        },
      ]
    );
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const markdownStyles = {
    body: { color: C.text, fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 24 },
    heading1: { color: C.text, fontFamily: "Inter_700Bold", fontSize: 22, marginBottom: 8, marginTop: 4 },
    heading2: { color: C.text, fontFamily: "Inter_600SemiBold", fontSize: 18, marginBottom: 6, marginTop: 4 },
    heading3: { color: C.text, fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 4 },
    strong: { color: C.text, fontFamily: "Inter_600SemiBold" },
    em: { fontStyle: "italic" as const },
    link: { color: C.tint },
    blockquote: { backgroundColor: C.surfaceElevated, borderLeftColor: C.tint, borderLeftWidth: 3, paddingLeft: 12, marginLeft: 0 },
    code_inline: { backgroundColor: C.surfaceElevated, color: C.tint, fontSize: 13 },
    fence: { backgroundColor: C.surfaceElevated, borderRadius: 8, padding: 12 },
    code_block: { backgroundColor: C.surfaceElevated, borderRadius: 8, padding: 12 },
    hr: { backgroundColor: C.border },
  };

  if (mode === "view" && existing) {
    return (
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.navSide}>
            <Ionicons name="chevron-back" size={22} color={C.tint} />
            <Text style={[styles.navSideText, { color: C.tint }]}>Back</Text>
          </Pressable>
          <View style={styles.navCenter} />
          <Pressable onPress={handleEdit} style={[styles.navSide, styles.navSideRight]}>
            <Text style={[styles.navSideText, { color: C.tint }]}>Edit</Text>
            <Ionicons name="create-outline" size={20} color={C.tint} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={[styles.viewContent, { paddingBottom: bottomPad + 40 }]}>
          {/* Hero section */}
          <View style={[styles.hero, { backgroundColor: color + "18", borderBottomColor: color + "30" }]}>
            <View style={[styles.heroColorBar, { backgroundColor: color }]} />
            <MemberAvatar
              name={existing.name}
              color={color}
              avatarUrl={existing.avatarUrl}
              size={90}
              isFronting={existing.isFronting}
            />
            <Text style={[styles.heroName, { color: C.text }]}>{existing.name}</Text>
            {existing.pronouns ? (
              <Text style={[styles.heroPronouns, { color: C.textSecondary }]}>{existing.pronouns}</Text>
            ) : null}
            {existing.isFronting ? (
              <View style={[styles.frontingBadge, { backgroundColor: C.success + "22", borderColor: C.success + "44" }]}>
                <View style={[styles.frontDot, { backgroundColor: C.success }]} />
                <Text style={[styles.frontingText, { color: C.success }]}>Currently Fronting</Text>
              </View>
            ) : null}
          </View>

          {/* Color swatch */}
          <View style={[styles.infoCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: C.textSecondary }]}>Color</Text>
              <View style={styles.colorDisplay}>
                <View style={[styles.colorSwatch, { backgroundColor: color }]} />
                <Text style={[styles.colorHex, { color: C.textSecondary }]}>{color.toUpperCase()}</Text>
              </View>
            </View>
            {existing.avatarUrl ? (
              <>
                <View style={[styles.infoDivider, { backgroundColor: C.border }]} />
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: C.textSecondary }]}>Avatar</Text>
                  <Text style={[styles.infoValue, { color: C.textTertiary }]} numberOfLines={1}>{existing.avatarUrl}</Text>
                </View>
              </>
            ) : null}
          </View>

          {/* Description */}
          {existing.description ? (
            <>
              <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>DESCRIPTION</Text>
              <View style={[styles.descCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Markdown style={markdownStyles as any}>{existing.description}</Markdown>
              </View>
            </>
          ) : (
            <Pressable
              onPress={handleEdit}
              style={[styles.addDescBtn, { backgroundColor: C.surface, borderColor: C.border }]}
            >
              <Ionicons name="document-text-outline" size={18} color={C.textTertiary} />
              <Text style={[styles.addDescText, { color: C.textTertiary }]}>Add a description…</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleDelete}
            style={[styles.deleteBtn, { backgroundColor: C.destructive + "18", borderColor: C.destructive + "40" }]}
          >
            <Ionicons name="trash-outline" size={16} color={C.destructive} />
            <Text style={[styles.deleteText, { color: C.destructive }]}>Delete Member</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Edit mode
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.navBar, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={handleCancel} style={styles.navSide}>
          <Ionicons name="chevron-back" size={22} color={C.tint} />
          <Text style={[styles.navSideText, { color: C.tint }]}>{isNew ? "Back" : "Cancel"}</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: C.text }]}>{isNew ? "New Member" : "Edit Member"}</Text>
        <Pressable onPress={handleSave} disabled={saving} style={[styles.navSide, styles.navSideRight]}>
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
          <View>
            <Text style={[styles.sectionLabel, { color: C.textSecondary, marginBottom: 0 }]}>DESCRIPTION</Text>
            <Text style={[styles.descHint, { color: C.textTertiary }]}>
              **bold**, *italic*, # heading, {">"} quote
            </Text>
          </View>
          <View style={[styles.toggleRow, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
            <Pressable
              onPress={() => setDescTab("edit")}
              style={[styles.toggleBtn, descTab === "edit" && { backgroundColor: C.tint }]}
            >
              <Text style={[styles.toggleText, { color: descTab === "edit" ? "#fff" : C.textSecondary }]}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => setDescTab("preview")}
              style={[styles.toggleBtn, descTab === "preview" && { backgroundColor: C.tint }]}
            >
              <Text style={[styles.toggleText, { color: descTab === "preview" ? "#fff" : C.textSecondary }]}>Preview</Text>
            </Pressable>
          </View>
        </View>
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          {descTab === "edit" ? (
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Write a description..."
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
              <Text style={[styles.emptyPreviewText, { color: C.textTertiary }]}>Nothing to preview yet</Text>
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
  navSide: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 2,
  },
  navSideRight: {
    justifyContent: "flex-end",
  },
  navSideText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  navCenter: {
    flex: 2,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    flex: 2,
    textAlign: "center",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },

  // View mode
  viewContent: {
    paddingBottom: 40,
    gap: 12,
  },
  hero: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 10,
    borderBottomWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  heroColorBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  heroName: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginTop: 4,
  },
  heroPronouns: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  frontingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  frontDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  frontingText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  infoCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    width: 72,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  colorDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  colorHex: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  infoDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  descCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    overflow: "hidden",
  },
  addDescBtn: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  addDescText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  // Edit mode
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
  descHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginLeft: 4,
    marginBottom: 6,
    marginTop: -2,
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
  descInput: {
    padding: 16,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 140,
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
    marginTop: 8,
    marginHorizontal: 16,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
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
});
