import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCommitteeSchema, insertMemberSchema, insertAssignmentSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === COMMITTEES ===
  app.get("/api/committees", (_req, res) => {
    res.json(storage.getCommittees());
  });

  app.post("/api/committees", (req, res) => {
    const parsed = insertCommitteeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const committee = storage.createCommittee(parsed.data);
    res.status(201).json(committee);
  });

  app.patch("/api/committees/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const committee = storage.updateCommittee(id, req.body);
    if (!committee) return res.status(404).json({ error: "Not found" });
    res.json(committee);
  });

  app.delete("/api/committees/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteCommittee(id);
    res.status(204).send();
  });

  // === MEMBERS ===
  app.get("/api/members", (_req, res) => {
    res.json(storage.getMembers());
  });

  app.post("/api/members", (req, res) => {
    const parsed = insertMemberSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const member = storage.createMember(parsed.data);
    res.status(201).json(member);
  });

  app.patch("/api/members/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const member = storage.updateMember(id, req.body);
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  });

  app.delete("/api/members/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteMember(id);
    res.status(204).send();
  });

  // === INTERESTS ===
  app.get("/api/interests", (_req, res) => {
    res.json(storage.getInterests());
  });

  app.post("/api/interests", (req, res) => {
    const { memberId, committeeId } = req.body;
    if (!memberId || !committeeId) return res.status(400).json({ error: "memberId and committeeId required" });
    const interest = storage.createInterest({ memberId, committeeId });
    res.status(201).json(interest);
  });

  app.delete("/api/interests", (req, res) => {
    const { memberId, committeeId } = req.body;
    if (!memberId || !committeeId) return res.status(400).json({ error: "memberId and committeeId required" });
    storage.deleteInterest(memberId, committeeId);
    res.status(204).send();
  });

  // === ASSIGNMENTS ===
  app.get("/api/assignments", (_req, res) => {
    res.json(storage.getAssignments());
  });

  app.post("/api/assignments", (req, res) => {
    const { memberId, committeeId } = req.body;
    if (!memberId || !committeeId) return res.status(400).json({ error: "memberId and committeeId required" });
    const assignment = storage.createAssignment({ memberId, committeeId });
    res.status(201).json(assignment);
  });

  app.delete("/api/assignments", (req, res) => {
    const { memberId, committeeId } = req.body;
    if (!memberId || !committeeId) return res.status(400).json({ error: "memberId and committeeId required" });
    storage.deleteAssignment(memberId, committeeId);
    res.status(204).send();
  });

  // === SEED from CSV ===
  app.post("/api/seed", (_req, res) => {
    // Check if already seeded
    const existing = storage.getCommittees();
    if (existing.length > 0) {
      return res.json({ message: "Already seeded" });
    }

    const committeeNames = [
      "CalWORKs Graduate Celebration Committee",
      "Events Committee",
      "Social Media Committee",
      "Student of Concerns Committee",
      "Work Study Committee",
      "Inreach/Outreach Committee",
    ];

    const colors = ["#20808D", "#A84B2F", "#1B474D", "#944454", "#FFC553", "#848456"];

    const committeeMap: Record<string, number> = {};
    committeeNames.forEach((name, i) => {
      const c = storage.createCommittee({ name, color: colors[i] });
      committeeMap[name] = c.id;
    });

    // De-duplicated member data from CSV
    const csvData = [
      { name: "Carrie Vang", email: "cvang@sdccd.edu", rating: 7, comments: "", interests: ["Events Committee", "Social Media Committee", "Student of Concerns Committee", "Work Study Committee"] },
      { name: "Abdullahi Haybe", email: "ahaybe@sdccd.edu", rating: 9, comments: "", interests: ["CalWORKs Graduate Celebration Committee", "Student of Concerns Committee", "Work Study Committee", "Inreach/Outreach Committee"] },
      { name: "Aimee Serrano", email: "aserrano@sdccd.edu", rating: 8, comments: "Supportive role in these committees for now. Updated submission includes CalWORKs, Events, Social Media, Student of Concerns, and Inreach/Outreach.", interests: ["CalWORKs Graduate Celebration Committee", "Events Committee", "Social Media Committee", "Student of Concerns Committee", "Inreach/Outreach Committee"] },
      { name: "Zuri Williams", email: "zwilliams@sdccd.edu", rating: 8, comments: "I am open to supporting each committee in whatever capacity I can be useful. My heart is with Work Study, and I also especially look forward to supporting the CalWORKs Graduate Celebration Committee.", interests: ["CalWORKs Graduate Celebration Committee", "Work Study Committee"] },
      { name: "Jennifer Kennedy", email: "jkennedy@sdccd.edu", rating: 7, comments: "", interests: ["CalWORKs Graduate Celebration Committee", "Work Study Committee"] },
      { name: "Bojin Haji", email: "bhaji@sdccd.edu", rating: 6, comments: "Since I work two days a week (one day online), I would prefer to support the Social Media Committee and the CalWORKs Graduation Celebration Committee. I'm also happy to help other committees if needed.", interests: ["CalWORKs Graduate Celebration Committee", "Social Media Committee"] },
      { name: "Kristi Rodstrom", email: "krodstro@sdccd.edu", rating: 10, comments: "I am always hesitant to sign up for total commitment because I am only available M-W. But still I would like to support the above committees. I am fully dedicated M-W.", interests: ["CalWORKs Graduate Celebration Committee", "Student of Concerns Committee"] },
      { name: "Juan Serrano", email: "jserrano@sdccd.edu", rating: 7, comments: "I can prefer a supportive role in the work study and student concerns committee. I would like to add another committee related to CalWORKs legislative & policy updates.", interests: ["CalWORKs Graduate Celebration Committee", "Events Committee", "Inreach/Outreach Committee"] },
      { name: "Angie Sanchez-Castillo", email: "asanchez006@sdccd.edu", rating: 10, comments: "", interests: ["CalWORKs Graduate Celebration Committee", "Events Committee", "Social Media Committee"] },
      { name: "Diya Spellman", email: "dspellma@sdccd.edu", rating: 8, comments: "Events Committee - supportive role", interests: ["CalWORKs Graduate Celebration Committee", "Events Committee"] },
      { name: "Mitza Lindsey", email: "mlindsey@sdccd.edu", rating: 8, comments: "", interests: ["CalWORKs Graduate Celebration Committee", "Student of Concerns Committee", "Work Study Committee"] },
      { name: "Veronica Corral", email: "vcorral@sdccd.edu", rating: 10, comments: "", interests: ["Social Media Committee", "Work Study Committee", "Inreach/Outreach Committee"] },
      { name: "Ahdieh Konjedi", email: "akonjedi@sdccd.edu", rating: 10, comments: "I prefer a supportive role in Inreach/Outreach Committee", interests: ["CalWORKs Graduate Celebration Committee", "Events Committee", "Social Media Committee", "Student of Concerns Committee", "Work Study Committee", "Inreach/Outreach Committee"] },
      { name: "Lavette Arciga", email: "larciga@sdccd.edu", rating: 10, comments: "I would like to support the Social Media, Events Committee, and Work Study Committee", interests: ["Events Committee", "Social Media Committee", "Work Study Committee"] },
      { name: "Belle Ayala", email: "bayala@sdccd.edu", rating: 10, comments: "", interests: ["CalWORKs Graduate Celebration Committee", "Events Committee", "Social Media Committee", "Student of Concerns Committee", "Work Study Committee"] },
      { name: "Yasmine Mena", email: "ymena@sdccd.edu", rating: 8, comments: "I would like to join the CalWORKs program guide policy changes", interests: ["CalWORKs Graduate Celebration Committee", "Events Committee", "Social Media Committee", "Work Study Committee"] },
    ];

    csvData.forEach((row) => {
      const member = storage.createMember({ name: row.name, email: row.email, timeRating: row.rating, comments: row.comments });
      row.interests.forEach((committeeName) => {
        const cId = committeeMap[committeeName];
        if (cId) {
          storage.createInterest({ memberId: member.id, committeeId: cId });
        }
      });
    });

    res.json({ message: "Seeded successfully" });
  });

  return httpServer;
}
