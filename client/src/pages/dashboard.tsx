import { useState, useMemo } from "react";
import type { Committee, Member, Interest, Assignment } from "@shared/schema";
import { useLocalData } from "@/hooks/use-local-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Tooltip as RechartsTooltip, Legend } from "recharts";
import {
  Users, Plus, Trash2, ArrowRight, UserPlus, Building2,
  Mail, Clock, MessageSquare, X, Edit2, Check, Search,
  ChevronDown, ChevronUp, LayoutDashboard, UserCheck
} from "lucide-react";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

export default function Dashboard() {
  const { toast } = useToast();
  const data = useLocalData();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [addCommitteeName, setAddCommitteeName] = useState("");
  const [addCommitteeColor, setAddCommitteeColor] = useState("#20808D");
  const [addCommitteeOpen, setAddCommitteeOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [editingCommittee, setEditingCommittee] = useState<number | null>(null);
  const [editingCommitteeName, setEditingCommitteeName] = useState("");
  const [memberDetailId, setMemberDetailId] = useState<number | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignMemberId, setAssignMemberId] = useState<number | null>(null);
  const [assignCommitteeId, setAssignCommitteeId] = useState<string>("");
  const [expandedCommittee, setExpandedCommittee] = useState<number | null>(null);

  const { committees, members, interests, assignments } = data;

  // Derived data
  const interestCountByCommittee = useMemo(() => {
    return committees.map((c) => ({
      name: c.name.replace(" Committee", "").replace("CalWORKs Graduate ", ""),
      fullName: c.name,
      count: interests.filter((i) => i.committeeId === c.id).length,
      color: c.color,
      id: c.id,
    }));
  }, [committees, interests]);

  const assignmentCountByCommittee = useMemo(() => {
    return committees.map((c) => ({
      name: c.name.replace(" Committee", "").replace("CalWORKs Graduate ", ""),
      fullName: c.name,
      assigned: assignments.filter((a) => a.committeeId === c.id).length,
      interested: interests.filter((i) => i.committeeId === c.id).length,
      color: c.color,
      id: c.id,
    }));
  }, [committees, interests, assignments]);

  const getMemberInterests = (memberId: number) => interests.filter((i) => i.memberId === memberId);
  const getMemberAssignments = (memberId: number) => assignments.filter((a) => a.memberId === memberId);
  const getCommitteeName = (id: number) => committees.find((c) => c.id === id)?.name || "";
  const getCommitteeColor = (id: number) => committees.find((c) => c.id === id)?.color || "#888";

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    const s = searchTerm.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s));
  }, [members, searchTerm]);

  const totalInterests = interests.length;
  const totalAssignments = assignments.length;
  const avgTimeRating = members.length ? (members.reduce((a, m) => a + m.timeRating, 0) / members.length).toFixed(1) : "0";

  const pieData = useMemo(() => {
    return committees.map((c) => ({
      name: c.name.replace(" Committee", "").replace("CalWORKs Graduate ", ""),
      value: interests.filter((i) => i.committeeId === c.id).length,
      color: c.color,
    })).filter((d) => d.value > 0);
  }, [committees, interests]);

  const memberDetail = memberDetailId ? members.find((m) => m.id === memberDetailId) : null;

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-root">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="Committee Hub logo">
              <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2"/>
              <circle cx="16" cy="12" r="4" fill="hsl(var(--primary))"/>
              <circle cx="9" cy="22" r="3" fill="hsl(var(--primary))" opacity="0.7"/>
              <circle cx="23" cy="22" r="3" fill="hsl(var(--primary))" opacity="0.7"/>
              <line x1="16" y1="16" x2="9" y2="19" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
              <line x1="16" y1="16" x2="23" y2="19" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
            </svg>
            <h1 className="text-base font-semibold tracking-tight" data-testid="text-app-title">Committee Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setAddMemberOpen(true)} data-testid="button-add-member">
              <UserPlus className="w-4 h-4 mr-1.5" /> Add Member
            </Button>
            <Button size="sm" onClick={() => setAddCommitteeOpen(true)} data-testid="button-add-committee">
              <Plus className="w-4 h-4 mr-1.5" /> Add Committee
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <Users className="w-3.5 h-3.5" /> Staff Members
              </div>
              <div className="text-2xl font-bold tabular-nums" data-testid="text-total-members">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <Building2 className="w-3.5 h-3.5" /> Committees
              </div>
              <div className="text-2xl font-bold tabular-nums" data-testid="text-total-committees">{committees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <UserCheck className="w-3.5 h-3.5" /> Assignments Made
              </div>
              <div className="text-2xl font-bold tabular-nums" data-testid="text-total-assignments">{totalAssignments}</div>
              <div className="text-xs text-muted-foreground">{totalInterests} total interests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
                <Clock className="w-3.5 h-3.5" /> Avg Availability
              </div>
              <div className="text-2xl font-bold tabular-nums" data-testid="text-avg-rating">{avgTimeRating}<span className="text-sm text-muted-foreground font-normal">/10</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">
              <LayoutDashboard className="w-4 h-4 mr-1.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="committees" data-testid="tab-committees">
              <Building2 className="w-4 h-4 mr-1.5" /> Committees
            </TabsTrigger>
            <TabsTrigger value="members" data-testid="tab-members">
              <Users className="w-4 h-4 mr-1.5" /> Members
            </TabsTrigger>
            <TabsTrigger value="assignments" data-testid="tab-assignments">
              <UserCheck className="w-4 h-4 mr-1.5" /> Assignments
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Interest by Committee</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={interestCountByCommittee} layout="vertical" margin={{ left: 10, right: 20, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                      <RechartsTooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                        formatter={(value: number, _name: string, props: any) => [`${value} interested`, props.payload.fullName]}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
                        {interestCountByCommittee.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Interest Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={2}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`pie-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Assigned vs Interested</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={assignmentCountByCommittee} margin={{ left: 10, right: 20, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <RechartsTooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                    />
                    <Bar dataKey="interested" name="Interested" fill="#BCE2E7" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="assigned" name="Assigned" fill="#20808D" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMMITTEES TAB */}
          <TabsContent value="committees" className="space-y-4">
            <div className="grid gap-4">
              {committees.map((committee) => {
                const interestedMembers = interests.filter((i) => i.committeeId === committee.id);
                const assignedMembers = assignments.filter((a) => a.committeeId === committee.id);
                const isExpanded = expandedCommittee === committee.id;

                return (
                  <Card key={committee.id} className="overflow-hidden" data-testid={`card-committee-${committee.id}`}>
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/40 transition-colors"
                      onClick={() => setExpandedCommittee(isExpanded ? null : committee.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: committee.color }} />
                        {editingCommittee === committee.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editingCommitteeName}
                              onChange={(e) => setEditingCommitteeName(e.target.value)}
                              className="h-8 w-64"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                data.updateCommittee(committee.id, { name: editingCommitteeName });
                                setEditingCommittee(null);
                                toast({ title: "Committee renamed" });
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingCommittee(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-medium text-sm">{committee.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs tabular-nums">{interestedMembers.length} interested</Badge>
                        <Badge variant="outline" className="text-xs tabular-nums">{assignedMembers.length} assigned</Badge>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingCommittee(committee.id); setEditingCommitteeName(committee.name); }}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Rename</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => { data.deleteCommittee(committee.id); toast({ title: "Committee deleted" }); }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete committee</TooltipContent>
                          </Tooltip>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t px-4 pb-4 pt-3 space-y-4">
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interested Members</h4>
                          {interestedMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No one has expressed interest yet.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {interestedMembers.map((interest) => {
                                const member = members.find((m) => m.id === interest.memberId);
                                if (!member) return null;
                                const isAssigned = assignedMembers.some((a) => a.memberId === member.id);
                                return (
                                  <div key={interest.id} className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm transition-colors ${isAssigned ? "bg-primary/10 border-primary/30" : "bg-card hover:bg-accent/50"}`}>
                                    <span className="font-medium">{member.name}</span>
                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">{member.timeRating}/10</Badge>
                                    {isAssigned ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive" onClick={() => { data.deleteAssignment(member.id, committee.id); toast({ title: "Assignment removed" }); }}>
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Remove assignment</TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-primary" onClick={() => { data.createAssignment(member.id, committee.id); toast({ title: "Member assigned" }); }}>
                                            <ArrowRight className="w-3 h-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Assign to committee</TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned Members</h4>
                          {assignedMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No one assigned yet. Click the arrow next to interested members to assign.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {assignedMembers.map((assignment) => {
                                const member = members.find((m) => m.id === assignment.memberId);
                                if (!member) return null;
                                return (
                                  <div key={assignment.id} className="flex items-center gap-2 border border-primary/30 bg-primary/10 rounded-lg px-3 py-1.5 text-sm">
                                    <UserCheck className="w-3.5 h-3.5 text-primary" />
                                    <span className="font-medium">{member.name}</span>
                                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive" onClick={() => { data.deleteAssignment(member.id, committee.id); toast({ title: "Assignment removed" }); }}>
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* MEMBERS TAB */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" data-testid="input-search-members" />
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left font-semibold px-4 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="text-left font-semibold px-4 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Email</th>
                    <th className="text-center font-semibold px-4 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Availability</th>
                    <th className="text-left font-semibold px-4 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Interests</th>
                    <th className="text-left font-semibold px-4 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Assigned</th>
                    <th className="text-center font-semibold px-4 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => {
                    const memberInterests = getMemberInterests(member.id);
                    const memberAssignments = getMemberAssignments(member.id);
                    return (
                      <tr key={member.id} className="border-b last:border-b-0 hover:bg-accent/30 transition-colors" data-testid={`row-member-${member.id}`}>
                        <td className="px-4 py-2.5">
                          <button className="font-medium text-foreground hover:text-primary transition-colors text-left" onClick={() => setMemberDetailId(member.id)}>
                            {member.name}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{member.email}</td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${member.timeRating * 10}%`, backgroundColor: member.timeRating >= 8 ? "#437A22" : member.timeRating >= 5 ? "#d19900" : "#A13544" }} />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{member.timeRating}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {memberInterests.map((interest) => (
                              <div key={interest.id} className="inline-flex items-center gap-1 bg-muted/60 rounded px-1.5 py-0.5 text-[10px]">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCommitteeColor(interest.committeeId) }} />
                                {getCommitteeName(interest.committeeId).replace(" Committee", "").slice(0, 18)}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {memberAssignments.map((assignment) => (
                              <div key={assignment.id} className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 text-[10px] font-medium">
                                <UserCheck className="w-2.5 h-2.5 text-primary" />
                                {getCommitteeName(assignment.committeeId).replace(" Committee", "").slice(0, 18)}
                                <button className="ml-0.5 text-destructive hover:text-destructive/80" onClick={() => { data.deleteAssignment(member.id, assignment.committeeId); toast({ title: "Assignment removed" }); }}>
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setAssignMemberId(member.id); setAssignCommitteeId(""); setAssignDialogOpen(true); }}>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Assign to committee</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => { data.deleteMember(member.id); toast({ title: "Member removed" }); }}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove member</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ASSIGNMENTS TAB */}
          <TabsContent value="assignments" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Assignment board. Click "Assign" next to any interested member to add them, or use the quick-assign dialog from the Members tab.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {committees.map((committee) => {
                const cInterests = interests.filter((i) => i.committeeId === committee.id);
                const cAssignments = assignments.filter((a) => a.committeeId === committee.id);
                const unassigned = cInterests.filter((i) => !cAssignments.some((a) => a.memberId === i.memberId));

                return (
                  <Card key={committee.id} className="overflow-hidden" data-testid={`assignment-card-${committee.id}`}>
                    <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderLeftWidth: 4, borderLeftColor: committee.color }}>
                      <span className="font-semibold text-sm flex-1">{committee.name.replace(" Committee", "")}</span>
                      <Badge className="text-[10px] h-5" style={{ backgroundColor: committee.color, color: "#fff" }}>
                        {cAssignments.length} / {cInterests.length}
                      </Badge>
                    </div>
                    <CardContent className="p-3 space-y-3">
                      {cAssignments.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Assigned</p>
                          <div className="space-y-1">
                            {cAssignments.map((a) => {
                              const m = members.find((m) => m.id === a.memberId);
                              if (!m) return null;
                              return (
                                <div key={a.id} className="flex items-center justify-between bg-primary/8 border border-primary/15 rounded-md px-2.5 py-1.5">
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-xs font-medium">{m.name}</span>
                                  </div>
                                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive" onClick={() => { data.deleteAssignment(m.id, committee.id); toast({ title: "Assignment removed" }); }}>
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {unassigned.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Interested (unassigned)</p>
                          <div className="space-y-1">
                            {unassigned.map((interest) => {
                              const m = members.find((m) => m.id === interest.memberId);
                              if (!m) return null;
                              return (
                                <div key={interest.id} className="flex items-center justify-between bg-card border rounded-md px-2.5 py-1.5 hover:bg-accent/40 transition-colors">
                                  <span className="text-xs">{m.name}</span>
                                  <Button size="sm" variant="ghost" className="h-5 px-1.5 text-primary text-[10px] font-medium" onClick={() => { data.createAssignment(m.id, committee.id); toast({ title: "Member assigned" }); }}>
                                    Assign <ArrowRight className="w-3 h-3 ml-0.5" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {cAssignments.length === 0 && unassigned.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">No interested members</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Committee Dialog */}
      <Dialog open={addCommitteeOpen} onOpenChange={setAddCommitteeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Committee</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Committee Name</label>
              <Input value={addCommitteeName} onChange={(e) => setAddCommitteeName(e.target.value)} placeholder="e.g., CalWORKs Policy Updates Committee" data-testid="input-new-committee-name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={addCommitteeColor} onChange={(e) => setAddCommitteeColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                <Input value={addCommitteeColor} onChange={(e) => setAddCommitteeColor(e.target.value)} className="w-28 font-mono text-xs" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { data.createCommittee(addCommitteeName, addCommitteeColor); setAddCommitteeOpen(false); setAddCommitteeName(""); toast({ title: "Committee created" }); }} disabled={!addCommitteeName.trim()} data-testid="button-submit-committee">
              Create Committee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <Input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Jane Doe" data-testid="input-new-member-name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="jdoe@sdccd.edu" data-testid="input-new-member-email" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { data.createMember(newMemberName, newMemberEmail, 5, ""); setAddMemberOpen(false); setNewMemberName(""); setNewMemberEmail(""); toast({ title: "Member added" }); }} disabled={!newMemberName.trim() || !newMemberEmail.trim()} data-testid="button-submit-member">
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Member Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {assignMemberId ? members.find((m) => m.id === assignMemberId)?.name : ""} to Committee</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Select value={assignCommitteeId} onValueChange={setAssignCommitteeId}>
              <SelectTrigger><SelectValue placeholder="Select a committee" /></SelectTrigger>
              <SelectContent>
                {committees.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              if (assignMemberId && assignCommitteeId) {
                data.createAssignment(assignMemberId, parseInt(assignCommitteeId));
                setAssignDialogOpen(false);
                toast({ title: "Member assigned" });
              }
            }} disabled={!assignCommitteeId}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Detail Dialog */}
      <Dialog open={!!memberDetailId} onOpenChange={(open) => { if (!open) setMemberDetailId(null); }}>
        <DialogContent className="max-w-lg">
          {memberDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> {memberDetail.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-4 h-4" /> {memberDetail.email}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Availability: <span className="font-semibold">{memberDetail.timeRating}/10</span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${memberDetail.timeRating * 10}%`, backgroundColor: memberDetail.timeRating >= 8 ? "#437A22" : memberDetail.timeRating >= 5 ? "#d19900" : "#A13544" }} />
                  </div>
                </div>
                {memberDetail.comments && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1"><MessageSquare className="w-3.5 h-3.5" /> Comments</div>
                    <p className="text-sm bg-muted/50 rounded-lg p-3">{memberDetail.comments}</p>
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Committee Interests</div>
                  <div className="flex flex-wrap gap-2">
                    {getMemberInterests(memberDetail.id).map((interest) => (
                      <div key={interest.id} className="flex items-center gap-1.5 bg-muted/60 rounded-md px-2.5 py-1 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCommitteeColor(interest.committeeId) }} />
                        {getCommitteeName(interest.committeeId)}
                        <button className="ml-1 text-destructive/60 hover:text-destructive" onClick={() => data.deleteInterest(memberDetail.id, interest.committeeId)}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <Select onValueChange={(val) => data.createInterest(memberDetail.id, parseInt(val))}>
                      <SelectTrigger className="h-7 w-auto text-xs border-dashed"><Plus className="w-3 h-3 mr-1" /> Add</SelectTrigger>
                      <SelectContent>
                        {committees.filter((c) => !getMemberInterests(memberDetail.id).some((i) => i.committeeId === c.id)).map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assignments</div>
                  <div className="flex flex-wrap gap-2">
                    {getMemberAssignments(memberDetail.id).map((assignment) => (
                      <div key={assignment.id} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-md px-2.5 py-1 text-xs font-medium">
                        <UserCheck className="w-3 h-3 text-primary" />
                        {getCommitteeName(assignment.committeeId)}
                        <button className="ml-1 text-destructive/60 hover:text-destructive" onClick={() => data.deleteAssignment(memberDetail.id, assignment.committeeId)}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <Select onValueChange={(val) => { data.createAssignment(memberDetail.id, parseInt(val)); toast({ title: "Member assigned" }); }}>
                      <SelectTrigger className="h-7 w-auto text-xs border-dashed"><Plus className="w-3 h-3 mr-1" /> Assign</SelectTrigger>
                      <SelectContent>
                        {committees.filter((c) => !getMemberAssignments(memberDetail.id).some((a) => a.committeeId === c.id)).map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <footer className="border-t mt-12 py-4 text-center">
        <PerplexityAttribution />
      </footer>
    </div>
  );
}
