import { useState, useCallback, useEffect } from "react";
import { localStore } from "@/lib/localStore";
import type { Committee, Member, Interest, Assignment } from "@shared/schema";
import type { DashboardState } from "@shared/committee-data";

const API_PATH = "/api/state";

export function useLocalData() {
  const [version, setVersion] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("loading");
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    fetch(API_PATH)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load shared dashboard state");
        return res.json() as Promise<DashboardState>;
      })
      .then((state) => {
        if (!active) return;
        localStore.replaceState(state);
        setSaveStatus("saved");
        bump();
      })
      .catch(() => {
        if (active) setSaveStatus("error");
      });

    return () => {
      active = false;
    };
  }, [bump]);

  const persist = useCallback(() => {
    setSaveStatus("saving");
    fetch(API_PATH, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(localStore.getState()),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to save shared dashboard state");
        setSaveStatus("saved");
      })
      .catch(() => setSaveStatus("error"));
  }, []);

  const mutate = useCallback((change: () => void) => {
    change();
    bump();
    persist();
  }, [bump, persist]);

  const committees: Committee[] = localStore.getCommittees();
  const members: Member[] = localStore.getMembers();
  const interests: Interest[] = localStore.getInterests();
  const assignments: Assignment[] = localStore.getAssignments();

  return {
    committees,
    members,
    interests,
    assignments,
    version,
    saveStatus,

    createCommittee: (name: string, color: string) => mutate(() => localStore.createCommittee(name, color)),
    updateCommittee: (id: number, data: Partial<{ name: string; color: string }>) => mutate(() => localStore.updateCommittee(id, data)),
    deleteCommittee: (id: number) => mutate(() => localStore.deleteCommittee(id)),

    createMember: (name: string, email: string, timeRating?: number, comments?: string) => mutate(() => localStore.createMember(name, email, timeRating, comments)),
    deleteMember: (id: number) => mutate(() => localStore.deleteMember(id)),

    createInterest: (memberId: number, committeeId: number) => mutate(() => localStore.createInterest(memberId, committeeId)),
    deleteInterest: (memberId: number, committeeId: number) => mutate(() => localStore.deleteInterest(memberId, committeeId)),

    createAssignment: (memberId: number, committeeId: number) => mutate(() => localStore.createAssignment(memberId, committeeId)),
    deleteAssignment: (memberId: number, committeeId: number) => mutate(() => localStore.deleteAssignment(memberId, committeeId)),
  };
}
