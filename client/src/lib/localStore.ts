import type { Committee, Member, Interest, Assignment } from "@shared/schema";
import { createInitialDashboardState, normalizeDashboardState, type DashboardState } from "@shared/committee-data";

const initial = createInitialDashboardState();

class LocalStore {
  committees: Committee[] = [...initial.committees];
  members: Member[] = [...initial.members];
  interests: Interest[] = [...initial.interests];
  assignments: Assignment[] = [];

  private nextCommitteeId = initial.nextIds.committee;
  private nextMemberId = initial.nextIds.member;
  private nextInterestId = initial.nextIds.interest;
  private nextAssignmentId = initial.nextIds.assignment;

  getState(): DashboardState {
    return {
      committees: [...this.committees],
      members: [...this.members],
      interests: [...this.interests],
      assignments: [...this.assignments],
      nextIds: {
        committee: this.nextCommitteeId,
        member: this.nextMemberId,
        interest: this.nextInterestId,
        assignment: this.nextAssignmentId,
      },
    };
  }

  replaceState(state: Partial<DashboardState>) {
    const normalized = normalizeDashboardState(state);
    this.committees = [...normalized.committees];
    this.members = [...normalized.members];
    this.interests = [...normalized.interests];
    this.assignments = [...normalized.assignments];
    this.nextCommitteeId = normalized.nextIds.committee;
    this.nextMemberId = normalized.nextIds.member;
    this.nextInterestId = normalized.nextIds.interest;
    this.nextAssignmentId = normalized.nextIds.assignment;
  }

  getCommittees() { return [...this.committees]; }
  getMembers() { return [...this.members]; }
  getInterests() { return [...this.interests]; }
  getAssignments() { return [...this.assignments]; }

  createCommittee(name: string, color: string): Committee {
    const c: Committee = { id: this.nextCommitteeId++, name, color };
    this.committees.push(c);
    return c;
  }

  updateCommittee(id: number, data: Partial<{ name: string; color: string }>) {
    const idx = this.committees.findIndex((c) => c.id === id);
    if (idx >= 0) {
      if (data.name) this.committees[idx].name = data.name;
      if (data.color) this.committees[idx].color = data.color;
    }
  }

  deleteCommittee(id: number) {
    this.committees = this.committees.filter((c) => c.id !== id);
    this.interests = this.interests.filter((i) => i.committeeId !== id);
    this.assignments = this.assignments.filter((a) => a.committeeId !== id);
  }

  createMember(name: string, email: string, timeRating = 5, comments = ""): Member {
    const m: Member = { id: this.nextMemberId++, name, email, timeRating, comments };
    this.members.push(m);
    return m;
  }

  deleteMember(id: number) {
    this.members = this.members.filter((m) => m.id !== id);
    this.interests = this.interests.filter((i) => i.memberId !== id);
    this.assignments = this.assignments.filter((a) => a.memberId !== id);
  }

  createInterest(memberId: number, committeeId: number): Interest {
    const existing = this.interests.find((i) => i.memberId === memberId && i.committeeId === committeeId);
    if (existing) return existing;
    const i: Interest = { id: this.nextInterestId++, memberId, committeeId };
    this.interests.push(i);
    return i;
  }

  deleteInterest(memberId: number, committeeId: number) {
    this.interests = this.interests.filter((i) => !(i.memberId === memberId && i.committeeId === committeeId));
  }

  createAssignment(memberId: number, committeeId: number): Assignment {
    const existing = this.assignments.find((a) => a.memberId === memberId && a.committeeId === committeeId);
    if (existing) return existing;
    const a: Assignment = { id: this.nextAssignmentId++, memberId, committeeId };
    this.assignments.push(a);
    return a;
  }

  deleteAssignment(memberId: number, committeeId: number) {
    this.assignments = this.assignments.filter((a) => !(a.memberId === memberId && a.committeeId === committeeId));
  }
}

export const localStore = new LocalStore();
