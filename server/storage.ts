import {
  type Committee, type InsertCommittee, committees,
  type Member, type InsertMember, members,
  type Interest, type InsertInterest, interests,
  type Assignment, type InsertAssignment, assignments,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // Committees
  getCommittees(): Committee[];
  getCommittee(id: number): Committee | undefined;
  createCommittee(data: InsertCommittee): Committee;
  updateCommittee(id: number, data: Partial<InsertCommittee>): Committee | undefined;
  deleteCommittee(id: number): void;
  // Members
  getMembers(): Member[];
  getMember(id: number): Member | undefined;
  createMember(data: InsertMember): Member;
  updateMember(id: number, data: Partial<InsertMember>): Member | undefined;
  deleteMember(id: number): void;
  // Interests
  getInterests(): Interest[];
  getInterestsByCommittee(committeeId: number): Interest[];
  createInterest(data: InsertInterest): Interest;
  deleteInterest(memberId: number, committeeId: number): void;
  // Assignments
  getAssignments(): Assignment[];
  getAssignmentsByCommittee(committeeId: number): Assignment[];
  createAssignment(data: InsertAssignment): Assignment;
  deleteAssignment(memberId: number, committeeId: number): void;
  deleteAssignmentsByMemberAndCommittee(memberId: number, committeeId: number): void;
}

export class DatabaseStorage implements IStorage {
  getCommittees(): Committee[] {
    return db.select().from(committees).all();
  }
  getCommittee(id: number): Committee | undefined {
    return db.select().from(committees).where(eq(committees.id, id)).get();
  }
  createCommittee(data: InsertCommittee): Committee {
    return db.insert(committees).values(data).returning().get();
  }
  updateCommittee(id: number, data: Partial<InsertCommittee>): Committee | undefined {
    return db.update(committees).set(data).where(eq(committees.id, id)).returning().get();
  }
  deleteCommittee(id: number): void {
    db.delete(interests).where(eq(interests.committeeId, id)).run();
    db.delete(assignments).where(eq(assignments.committeeId, id)).run();
    db.delete(committees).where(eq(committees.id, id)).run();
  }

  getMembers(): Member[] {
    return db.select().from(members).all();
  }
  getMember(id: number): Member | undefined {
    return db.select().from(members).where(eq(members.id, id)).get();
  }
  createMember(data: InsertMember): Member {
    return db.insert(members).values(data).returning().get();
  }
  updateMember(id: number, data: Partial<InsertMember>): Member | undefined {
    return db.update(members).set(data).where(eq(members.id, id)).returning().get();
  }
  deleteMember(id: number): void {
    db.delete(interests).where(eq(interests.memberId, id)).run();
    db.delete(assignments).where(eq(assignments.memberId, id)).run();
    db.delete(members).where(eq(members.id, id)).run();
  }

  getInterests(): Interest[] {
    return db.select().from(interests).all();
  }
  getInterestsByCommittee(committeeId: number): Interest[] {
    return db.select().from(interests).where(eq(interests.committeeId, committeeId)).all();
  }
  createInterest(data: InsertInterest): Interest {
    return db.insert(interests).values(data).returning().get();
  }
  deleteInterest(memberId: number, committeeId: number): void {
    db.delete(interests).where(
      and(eq(interests.memberId, memberId), eq(interests.committeeId, committeeId))
    ).run();
  }

  getAssignments(): Assignment[] {
    return db.select().from(assignments).all();
  }
  getAssignmentsByCommittee(committeeId: number): Assignment[] {
    return db.select().from(assignments).where(eq(assignments.committeeId, committeeId)).all();
  }
  createAssignment(data: InsertAssignment): Assignment {
    return db.insert(assignments).values(data).returning().get();
  }
  deleteAssignment(memberId: number, committeeId: number): void {
    db.delete(assignments).where(
      and(eq(assignments.memberId, memberId), eq(assignments.committeeId, committeeId))
    ).run();
  }
  deleteAssignmentsByMemberAndCommittee(memberId: number, committeeId: number): void {
    db.delete(assignments).where(
      and(eq(assignments.memberId, memberId), eq(assignments.committeeId, committeeId))
    ).run();
  }
}

export const storage = new DatabaseStorage();
