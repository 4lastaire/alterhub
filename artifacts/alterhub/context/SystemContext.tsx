import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getApiUrl } from "@/utils/api";
import { Platform } from "react-native";

export type Group = {
  id: string;
  name: string;
  color?: string | null;
};

export type Member = {
  id: string;
  name: string;
  pronouns?: string | null;
  description?: string | null;
  color: string;
  avatarUrl?: string | null;
  isFronting: boolean;
  createdAt: string;
  updatedAt: string;
  groups: Group[];
};

export type FrontSession = {
  id: string;
  memberId: string;
  memberName: string;
  memberColor: string;
  memberAvatarUrl?: string | null;
  customStatus?: string | null;
  startTime: string;
  endTime?: string | null;
  isActive: boolean;
};

type SystemContextType = {
  members: Member[];
  groups: Group[];
  fronters: FrontSession[];
  frontHistory: FrontSession[];
  isLoading: boolean;
  historyLoading: boolean;
  fetchMembers: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchFronters: () => Promise<void>;
  fetchFrontHistory: (startDate?: string, endDate?: string) => Promise<void>;
  createMember: (data: {
    name: string;
    pronouns?: string | null;
    description?: string | null;
    color: string;
    avatarUrl?: string | null;
    groupIds?: string[];
  }) => Promise<Member>;
  updateMember: (
    id: string,
    data: {
      name?: string;
      pronouns?: string | null;
      description?: string | null;
      color?: string;
      avatarUrl?: string | null;
      groupIds?: string[];
    },
  ) => Promise<Member>;
  deleteMember: (id: string) => Promise<void>;
  startFronting: (memberId: string, customStatus?: string) => Promise<void>;
  stopFronting: (sessionId: string) => Promise<void>;
  updateFrontStatus: (sessionId: string, customStatus: string) => Promise<void>;
  updateHistorySession: (session: FrontSession) => void;
  deleteHistorySession: (sessionId: string) => void;
  historyRange: { start: string; end: string };
  setHistoryRange: (range: { start: string; end: string }) => void;
};

const SystemContext = createContext<SystemContextType | null>(null);

const STORAGE_KEYS = {
  members: "alterhub:members",
  fronters: "alterhub:fronters",
  frontHistory: "alterhub:frontHistory",
};

function isWebWithoutApi(): boolean {
  return Platform.OS === "web" && getApiUrl() === "";
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(): string {
  const c = globalThis as any;
  if (c.crypto?.randomUUID) return c.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useSystem(): SystemContextType {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error("useSystem must be used within SystemProvider");
  return ctx;
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return { start: toDateString(start), end: toDateString(end) };
}

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [fronters, setFronters] = useState<FrontSession[]>([]);
  const [frontHistory, setFrontHistory] = useState<FrontSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRange, setHistoryRange] = useState(getDefaultRange);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      if (isWebWithoutApi()) {
        const stored = safeParseJson<Member[]>(
          globalThis.localStorage?.getItem(STORAGE_KEYS.members) ?? null,
          [],
        );
        setMembers(stored);
        return;
      }

      const res = await fetch(`${getApiUrl()}/api/members`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMembers(data);
    } catch (e) {
      console.error("fetchMembers error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    if (isWebWithoutApi()) {
      // no backend; can just skip or add localStorage later
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/api/groups`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGroups(data);
    } catch (e) {
      console.error("fetchGroups error:", e);
    }
  }, []);

  const fetchFronters = useCallback(async () => {
    try {
      if (isWebWithoutApi()) {
        const stored = safeParseJson<FrontSession[]>(
          globalThis.localStorage?.getItem(STORAGE_KEYS.fronters) ?? null,
          [],
        );
        setFronters(stored);
        return;
      }

      const res = await fetch(`${getApiUrl()}/api/fronters`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFronters(data);
    } catch (e) {
      console.error("fetchFronters error:", e);
    }
  }, []);

  const fetchFrontHistory = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setHistoryLoading(true);
      if (isWebWithoutApi()) {
        const stored = safeParseJson<FrontSession[]>(
          globalThis.localStorage?.getItem(STORAGE_KEYS.frontHistory) ?? null,
          [],
        );
        setFrontHistory(stored);
        return;
      }
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await fetch(`${getApiUrl()}/api/front-history?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFrontHistory(data);
    } catch (e) {
      console.error("fetchFrontHistory error:", e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const createMember = useCallback(async (data: {
    name: string;
    pronouns?: string | null;
    description?: string | null;
    color: string;
    avatarUrl?: string | null;
    groupIds?: string[];
  }) => {
    if (isWebWithoutApi()) {
      const created: Member = {
        id: makeId(),
        name: data.name,
        pronouns: data.pronouns ?? null,
        description: data.description ?? null,
        color: data.color,
        avatarUrl: data.avatarUrl ?? null,
        isFronting: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        groups: [],
      };
      setMembers((prev) => {
        const next = [...prev, created];
        globalThis.localStorage?.setItem(STORAGE_KEYS.members, JSON.stringify(next));
        return next;
      });
      return created;
    }

    const res = await fetch(`${getApiUrl()}/api/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const member = await res.json();
    setMembers((prev) => [...prev, member]);
    return member;
  }, []);

  const updateMember = useCallback(async (
    id: string,
    data: {
      name?: string;
      pronouns?: string | null;
      description?: string | null;
      color?: string;
      avatarUrl?: string | null;
      groupIds?: string[];
    },
  ) => {
    if (isWebWithoutApi()) {
      let updated!: Member;
      setMembers((prev) => {
        const next = prev.map((m) => {
          if (m.id !== id) return m;
          updated = {
            ...m,
            ...data,
            updatedAt: nowIso(),
          };
          return updated;
        });
        globalThis.localStorage?.setItem(STORAGE_KEYS.members, JSON.stringify(next));
        return next;
      });
      return updated;
    }

    const res = await fetch(`${getApiUrl()}/api/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const member = await res.json();
    setMembers((prev) => prev.map((m) => (m.id === id ? member : m)));
    return member;
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    if (isWebWithoutApi()) {
      setMembers((prev) => {
        const next = prev.filter((m) => m.id !== id);
        globalThis.localStorage?.setItem(STORAGE_KEYS.members, JSON.stringify(next));
        return next;
      });
      return;
    }

    const res = await fetch(`${getApiUrl()}/api/members/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const startFronting = useCallback(async (memberId: string, customStatus?: string) => {
    if (isWebWithoutApi()) {
      const member = members.find((m) => m.id === memberId);
      if (!member) throw new Error("Member not found");

      const session: FrontSession = {
        id: makeId(),
        memberId,
        memberName: member.name,
        memberColor: member.color,
        memberAvatarUrl: member.avatarUrl ?? null,
        customStatus: customStatus ?? null,
        startTime: nowIso(),
        endTime: null,
        isActive: true,
      };

      setFronters((prev) => {
        const next = [...prev, session];
        globalThis.localStorage?.setItem(STORAGE_KEYS.fronters, JSON.stringify(next));
        return next;
      });

      setMembers((prev) => {
        const next = prev.map((m) => (m.id === memberId ? { ...m, isFronting: true } : m));
        globalThis.localStorage?.setItem(STORAGE_KEYS.members, JSON.stringify(next));
        return next;
      });

      setFrontHistory((prev) => {
        const next = [session, ...prev];
        globalThis.localStorage?.setItem(STORAGE_KEYS.frontHistory, JSON.stringify(next));
        return next;
      });

      return;
    }

    const res = await fetch(`${getApiUrl()}/api/fronters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, customStatus }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const session = await res.json();
    setFronters((prev) => [...prev, session]);
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, isFronting: true } : m)));
  }, []);

  const stopFronting = useCallback(async (sessionId: string) => {
    if (isWebWithoutApi()) {
      const endedAt = nowIso();

      // Remove from active fronters.
      let memberIdToStop: string | null = null;
      setFronters((prev) => {
        const session = prev.find((s) => s.id === sessionId);
        memberIdToStop = session?.memberId ?? null;
        const next = prev.filter((s) => s.id !== sessionId);
        globalThis.localStorage?.setItem(STORAGE_KEYS.fronters, JSON.stringify(next));
        return next;
      });

      if (memberIdToStop) {
        // Mark member as not fronting if no other active session for them.
        setMembers((prev) => {
          const stillFronting = fronters
            .filter((s) => s.id !== sessionId)
            .some((s) => s.memberId === memberIdToStop);
          const next = prev.map((m) =>
            m.id === memberIdToStop ? { ...m, isFronting: stillFronting } : m,
          );
          globalThis.localStorage?.setItem(STORAGE_KEYS.members, JSON.stringify(next));
          return next;
        });

        // Update history entry.
        setFrontHistory((prev) => {
          const next = prev.map((s) =>
            s.id === sessionId ? { ...s, endTime: endedAt, isActive: false } : s,
          );
          globalThis.localStorage?.setItem(STORAGE_KEYS.frontHistory, JSON.stringify(next));
          return next;
        });
      }

      return;
    }

    const res = await fetch(`${getApiUrl()}/api/fronters/${sessionId}`, { method: "DELETE" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const session = await res.json();
    const memberId = session.memberId;
    setFronters((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      const stillFronting = remaining.some((s) => s.memberId === memberId);
      if (!stillFronting) {
        setMembers((m) => m.map((mem) => mem.id === memberId ? { ...mem, isFronting: false } : mem));
      }
      return remaining;
    });
  }, []);

  const updateFrontStatus = useCallback(async (sessionId: string, customStatus: string) => {
    if (isWebWithoutApi()) {
      setFronters((prev) => {
        const next = prev.map((s) => (s.id === sessionId ? { ...s, customStatus } : s));
        globalThis.localStorage?.setItem(STORAGE_KEYS.fronters, JSON.stringify(next));
        return next;
      });
      setFrontHistory((prev) => {
        const next = prev.map((s) => (s.id === sessionId ? { ...s, customStatus } : s));
        globalThis.localStorage?.setItem(STORAGE_KEYS.frontHistory, JSON.stringify(next));
        return next;
      });
      return;
    }

    const res = await fetch(`${getApiUrl()}/api/fronters/${sessionId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customStatus }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const session = await res.json();
    setFronters((prev) => prev.map((s) => (s.id === sessionId ? session : s)));
  }, []);

  const updateHistorySession = useCallback((session: FrontSession) => {
    setFrontHistory((prev) => {
      const next = prev.map((s) => (s.id === session.id ? session : s));
      if (isWebWithoutApi()) {
        globalThis.localStorage?.setItem(STORAGE_KEYS.frontHistory, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const deleteHistorySession = useCallback((sessionId: string) => {
    setFrontHistory((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      if (isWebWithoutApi()) {
        globalThis.localStorage?.setItem(STORAGE_KEYS.frontHistory, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchGroups();
    fetchFronters();
  }, []);

  return (
    <SystemContext.Provider
      value={{
        members,
        groups,
        fronters,
        frontHistory,
        isLoading,
        historyLoading,
        fetchMembers,
        fetchGroups,
        fetchFronters,
        fetchFrontHistory,
        createMember,
        updateMember,
        deleteMember,
        startFronting,
        stopFronting,
        updateFrontStatus,
        updateHistorySession,
        deleteHistorySession,
        historyRange,
        setHistoryRange,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}
