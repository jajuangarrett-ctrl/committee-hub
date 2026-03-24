import { useState, useCallback } from "react";
import { localStore } from "@/lib/localStore";
import type { Committee, Member, Interest, Assignment } from "@shared/schema";

// A hook that provides reactive access to the local store
// Every mutation triggers a version bump which causes re-renders

export function useLocalData() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

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

    createCommittee: (name: string, color: string) => { localStore.createCommittee(name, color); bump(); },
    updateCommittee: (id: number, data: Partial<{ name: string; color: string }>) => { localStore.updateCommittee(id, data); bump(); },
    deleteCommittee: (id: number) => { localStore.deleteCommittee(id); bump(); },

    createMember: (name: string, email: string, timeRating?: number, comments?: string) => { localStore.createMember(name, email, timeRating, comments); bump(); },
    deleteMember: (id: number) => { localStore.deleteMember(id); bump(); },

    createInterest: (memberId: number, committeeId: number) => { localStore.createInterest(memberId, committeeId); bump(); },
    deleteInterest: (memberId: number, committeeId: number) => { localStore.deleteInterest(memberId, committeeId); bump(); },

    createAssignment: (memberId: number, committeeId: number) => { localStore.createAssignment(memberId, committeeId); bump(); },
    deleteAssignment: (memberId: number, committeeId: number) => { localStore.deleteAssignment(memberId, committeeId); bump(); },
  };
}
