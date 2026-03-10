export interface GroupType { id: string; name: string; }
export interface ModelType {
  id: string; name: string; salesGoal: number; minLtvGoal: number; excellentLtvGoal: number;
  groupId: string | null; createdAt: string; updatedAt: string; group?: GroupType | null;
}
export interface EntryType {
  id: string; modelId: string; date: string; sales: number; newSubs: number; notes: string | null;
}
export interface TotalsDayType {
  date: string; totalSales: number; totalNewSubs: number; totalLtv: number; color: string; salesMet: boolean;
}
export interface TotalsResponse {
  totalsSalesGoal: number; totalsMinLtvGoal: number; totalsExcellentLtvGoal: number; days: TotalsDayType[];
}
export interface SettingsType {
  id: string; totalsSalesGoal: number; totalsMinLtvGoal: number; totalsExcellentLtvGoal: number;
}
export type DayColor = "green" | "orange" | "red" | "grey";
export interface DayData {
  date: string; sales: number; newSubs: number; ltv: number;
  color: DayColor; salesMet: boolean; notes?: string | null; entryId?: string;
}
export interface UserType {
  id: string; email: string; name: string; role: "admin" | "viewer"; createdAt: string;
  assignedModels?: { id: string; name: string }[];
}
