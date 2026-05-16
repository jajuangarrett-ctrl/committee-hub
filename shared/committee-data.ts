import type { Assignment, Committee, Interest, Member } from "./schema";

export interface DashboardState {
  committees: Committee[];
  members: Member[];
  interests: Interest[];
  assignments: Assignment[];
  nextIds: {
    committee: number;
    member: number;
    interest: number;
    assignment: number;
  };
}

export const COMMITTEE_COLORS = ["#f97316", "#111111", "#fb923c", "#2b2b2b", "#ea580c", "#525252"];

const INITIAL_COMMITTEES: Committee[] = [
  { id: 1, name: "CalWORKs Graduate Celebration Committee", color: "#f97316" },
  { id: 2, name: "Events Committee", color: "#111111" },
  { id: 3, name: "Social Media Committee", color: "#fb923c" },
  { id: 4, name: "Student of Concerns Committee", color: "#2b2b2b" },
  { id: 5, name: "Work Study Committee", color: "#ea580c" },
  { id: 6, name: "Inreach/Outreach Committee", color: "#525252" },
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

export function createInitialDashboardState(): DashboardState {
  const members: Member[] = [];
  const interests: Interest[] = [];
  let memberId = 1;
  let interestId = 1;

  CSV_DATA.forEach((row) => {
    members.push({ id: memberId, name: row.name, email: row.email, timeRating: row.rating, comments: row.comments });
    row.interests.forEach((committeeId) => {
      interests.push({ id: interestId++, memberId, committeeId });
    });
    memberId++;
  });

  return {
    committees: INITIAL_COMMITTEES.map((committee) => ({ ...committee })),
    members,
    interests,
    assignments: [],
    nextIds: {
      committee: 100,
      member: 100,
      interest: 1000,
      assignment: 1000,
    },
  };
}

export function normalizeDashboardState(state: Partial<DashboardState> | null | undefined): DashboardState {
  const fallback = createInitialDashboardState();
  if (!state) return fallback;

  return {
    committees: Array.isArray(state.committees) ? state.committees : fallback.committees,
    members: Array.isArray(state.members) ? state.members : fallback.members,
    interests: Array.isArray(state.interests) ? state.interests : fallback.interests,
    assignments: Array.isArray(state.assignments) ? state.assignments : fallback.assignments,
    nextIds: {
      committee: state.nextIds?.committee ?? nextIdFrom(state.committees, 100),
      member: state.nextIds?.member ?? nextIdFrom(state.members, 100),
      interest: state.nextIds?.interest ?? nextIdFrom(state.interests, 1000),
      assignment: state.nextIds?.assignment ?? nextIdFrom(state.assignments, 1000),
    },
  };
}

function nextIdFrom(records: Array<{ id: number }> | undefined, fallback: number) {
  if (!records?.length) return fallback;
  return Math.max(fallback, ...records.map((record) => record.id + 1));
}
