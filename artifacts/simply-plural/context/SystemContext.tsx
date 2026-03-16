import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getApiUrl } from "@/utils/api";

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
  fronters: FrontSession[];
  frontHistory: FrontSession[];
  isLoading: boolean;
  historyLoading: boolean;
  fetchMembers: () => Promise<void>;
  fetchFronters: () => Promise<void>;
  fetchFrontHistory: (startDate?: string, endDate?: string) => Promise<void>;
  createMember: (data: { name: string; pronouns?: string | null; description?: string | null; color: string; avatarUrl?: string | null }) => Promise<Member>;
  updateMember: (id: string, data: { name?: string; pronouns?: string | null; description?: string | null; color?: string; avatarUrl?: string | null }) => Promise<Member>;
  deleteMember: (id: string) => Promise<void>;
  startFronting: (memberId: string, customStatus?: string) => Promise<void>;
  stopFronting: (sessionId: string) => Promise<void>;
  updateFrontStatus: (sessionId: string, customStatus: string) => Promise<void>;
  historyRange: { start: string; end: string };
  setHistoryRange: (range: { start: string; end: string }) => void;
};

const SystemContext = createContext<SystemContextType | null>(null);

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
  const [fronters, setFronters] = useState<FrontSession[]>([]);
  const [frontHistory, setFrontHistory] = useState<FrontSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRange, setHistoryRange] = useState(getDefaultRange);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${getApiUrl()}/api/members`);
      const data = await res.json();
      setMembers(data);
    } catch (e) {
      console.error("fetchMembers error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFronters = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/fronters`);
      const data = await res.json();
      setFronters(data);
    } catch (e) {
      console.error("fetchFronters error:", e);
    }
  }, []);

  const fetchFrontHistory = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setHistoryLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await fetch(`${getApiUrl()}/api/front-history?${params.toString()}`);
      const data = await res.json();
      setFrontHistory(data);
    } catch (e) {
      console.error("fetchFrontHistory error:", e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const createMember = useCallback(async (data: { name: string; pronouns?: string | null; description?: string | null; color: string; avatarUrl?: string | null }) => {
    const res = await fetch(`${getApiUrl()}/api/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const member = await res.json();
    setMembers((prev) => [...prev, member]);
    return member;
  }, []);

  const updateMember = useCallback(async (id: string, data: { name?: string; pronouns?: string | null; description?: string | null; color?: string; avatarUrl?: string | null }) => {
    const res = await fetch(`${getApiUrl()}/api/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const member = await res.json();
    setMembers((prev) => prev.map((m) => (m.id === id ? member : m)));
    return member;
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    await fetch(`${getApiUrl()}/api/members/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const startFronting = useCallback(async (memberId: string, customStatus?: string) => {
    const res = await fetch(`${getApiUrl()}/api/fronters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, customStatus }),
    });
    const session = await res.json();
    setFronters((prev) => [...prev, session]);
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, isFronting: true } : m)));
  }, []);

  const stopFronting = useCallback(async (sessionId: string) => {
    const res = await fetch(`${getApiUrl()}/api/fronters/${sessionId}`, { method: "DELETE" });
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
    const res = await fetch(`${getApiUrl()}/api/fronters/${sessionId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customStatus }),
    });
    const session = await res.json();
    setFronters((prev) => prev.map((s) => (s.id === sessionId ? session : s)));
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchFronters();
  }, []);

  return (
    <SystemContext.Provider
      value={{
        members,
        fronters,
        frontHistory,
        isLoading,
        historyLoading,
        fetchMembers,
        fetchFronters,
        fetchFrontHistory,
        createMember,
        updateMember,
        deleteMember,
        startFronting,
        stopFronting,
        updateFrontStatus,
        historyRange,
        setHistoryRange,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}
