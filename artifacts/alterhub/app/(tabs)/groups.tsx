import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "@/constants/colors";
import { useSystem } from "@/context/SystemContext";

export default function GroupsScreen() {
    const C = Colors.dark;
    const { groups, fetchGroups } = useSystem();
    const [name, setName] = useState("");

    const handleCreate = useCallback(async () => {
        if (!name.trim()) return;
        try {
            const res = await fetch("/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });
            if (!res.ok) throw new Error();
            setName("");
            await fetchGroups();
        } catch {
            Alert.alert("Error", "Could not create group.");
        }
    }, [name, fetchGroups]);

    return (
        <View style={[styles.container, { backgroundColor: C.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: C.text }]}>Groups</Text>
            </View>

            <View style={[styles.form, { borderColor: C.border, backgroundColor: C.surface }]}>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="New group name"
                    placeholderTextColor={C.textTertiary}
                    style={[styles.input, { color: C.text }]}
                />
                <Pressable style={[styles.button, { backgroundColor: C.tint }]} onPress={handleCreate}>
                    <Text style={styles.buttonText}>Add</Text>
                </Pressable>
            </View>

            <FlatList
                data={groups}
                keyExtractor={(g) => g.id}
                renderItem={({ item }) => (
                    <View style={[styles.groupRow, { borderColor: C.border }]}>
                        <Text style={[styles.groupName, { color: C.text }]}>{item.name}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ActivityIndicator color={C.tint} />
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
    title: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
    form: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        padding: 10,
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
    button: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
    buttonText: { color: "#fff", fontFamily: "Inter_600SemiBold" },
    groupRow: {
        marginHorizontal: 16,
        marginVertical: 4,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    groupName: { fontSize: 15, fontFamily: "Inter_500Medium" },
    empty: { flex: 1, alignItems: "center", justifyContent: "center" },
});