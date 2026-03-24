// Local in-memory store that replaces the API for static deployments
// Data persists during the session but resets on page reload

import type { Committee, Member, Interest, Assignment } from "@shared/schema";

let nextId = 1000;
function genId() { return nextId++; }

const COMMITTEE_COLORS = ["#20808D", "#A84B2F", "#1B474D", "#944454", "#FFC553", "#848456"];

const INITIAL_COMMITTEES: Committee[] = [
  { id: 1, name: "CalWORKs Graduate Celebration Committee", color: "#20808D" },
  { id: 2, name: "Events Committee", color: "#A84B2F" },
  { id: 3, name: "Social Media Committee", color: "#1B474D" },
  { id: 4, name: "Student of Concerns Committee", color: "#944454" },
  { id: 5, name: "Work Study Committee", color: "#FFC553" },
  { id: 6, name: "Inreach/Outreach Committee", color: "#848456" },
];

const CSV_DATA = [
  { name: "Carrie Vang", email: "cvang@sdccd.edu", rating: 7, comments: "", interests: [2, 3, 4, 5] },
  { name: "Abdullahi Haybe", email: "ahaybe@sdccd.edu", rating: 9, comments: "", interests: [1, 4, 5, 6] },
  { name: "Aimee Serrano", email: "aserrano@sdccd.edu", rating: 8, comments: "Supportive role in these committees for now. Updated submission includes CalWORKs, Events, Social Media, Student of Concerns, and Inreach/Outreach.", interests: [1, 2, 3, 4, 6] },
  { name: "Zuri Williams", email: "zwilliams@sdccd.edu", rating: 8, comments: "I am open to supporting each committee in whatever capacity I can be useful. My heart is with Work Study, and I also especially look forward to supporting the CalWORKs Graduate Celebration Committee.", interests: [1, 5] },
  { name: "Jennifer Kennedy", email: "jkennedy@sdccd.edu", rating: 7, comments: "", interests: [1, 5] },
  { name: "Bojin Haji", email: "bhaji@sdccd.edu", rating: 6, comments: "Since I work two days a week (one day online), I would prefer to support the Social Media Committee and the CalWORKs Graduation Celebration Committee.", interests: [1, 3] },
  { name: "Kristi Rodstrom", email: "krodstro@sdccd.edu", rating: 10, comments: "I am always hesitant to sign up for total commitment because I am only available M-W. But still I would like to support the above committees. I am fully dedicated M-W.", interests: [1, 4] },
  { name: "Juan Serrano", email: "jserrano@sdccd.edu", rating: 7, comments: "I can prefer a supportive role in the work study and student concerns committee. I would like to add another committee related to CalWORKs legislative & policy updates.", interests: [1, 2, 6] },
  { name: "Angie Sanchez-Castillo", email: "asanchez006@sdccd.edu", rating: 10, comments: "", interests: [1, 2, 3] },
  { name: "Diya Spellman", email: "dspellma@sdccd.edu", rating: 8, comments: "Events Committee - supportive role", interests: [1, 2] },
  { name: "Mitza Lindsey", email: "mlindsey@sdccd.edu", rating: 8, comments: "", interests: [1, 4, 5] },
  { name: "Veronica Corral", email: "vcorral@sdccd.edu", rating: 10, comments: "", interests: [3, 5, 6] },
  { name: "Ahdieh Konjedi", email: "akonjedi@sdccd.edu", rating: 10, comments: "I prefer a supportive role in Inreach/Outreach Committee", interests: [1, 2, 3, 4, 5, 6] },
  { name: "Lavette Arciga", email: "larciga@sdccd.edu", rating: 10, comments: "I would like to support the Social Media, Events Committee, and Work Study Committee", interests: [2, 3, 5] },
  { name: "Belle Ayala", email: "bayala@sdccd.edu", rating: 10, comments: "", interests: [1, 2, 3, 4, 5] },
  { name: "Yasmine Mena", email: "ymena@sdccd.edu", rating: 8, comments: "I would like to join the CalWORKs program guide policy changes", interests: [1, 2, 3, 5] },
];

function buildInitialData() {
  const members: Member[] = [];
  const interests: Interest[] = [];
  let memberId = 1;
  let interestId = 1;

  CSV_DATA.forEach((row) => {
    members.push({ id: memberId, name: row.name, email: row.email, timeRating: row.rating, comments: row.comments });
    row.interests.forEach((cId) => {
      interests.push({ id: interestId++, memberId, committeeId: cId });
    });
    memberId++;
  });

  return { members, interests };
}

const initial = buildInitialData();

class LocalStore {
  committees: Committee[] = [...INITIAL_COMMITTEES];
  members: Member[] = [...initial.members];
  interests: Interest[] = [...initial.interests];
  assignments: Assignment[] = [];

  private nextCommitteeId = 100;
  private nextMemberId = 100;
  private nextInterestId = 1000;
  private nextAssignmentId = 1000;

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
