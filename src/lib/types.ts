export interface GroupType { id: string; name: string; }
export interface ModelType {
  id: string; name: string; minSalesGoal: number; excellentSalesGoal: number; ltvGoal: number;
  groupId: string | null; createdAt: string; updatedAt: string; group?: GroupType | null;
}
export interface EntryType {
  id: string; modelId: string; date: string; sales: number; newSubs: number; notes: string | null;
}
export interface TotalsDayType {
  date: string; totalSales: number; totalNewSubs: number; totalLtv: number; color: string; ltvMet: boolean;
}
export interface TotalsResponse {
  totalsMinSalesGoal: number; totalsExcellentSalesGoal: number; totalsLtvGoal: number; days: TotalsDayType[];
}
export interface SettingsType {
  id: string; totalsMinSalesGoal: number; totalsExcellentSalesGoal: number; totalsLtvGoal: number;
}
export type DayColor = "green" | "orange" | "red" | "grey";
export interface DayData {
  date: string; sales: number; newSubs: number; ltv: number;
  color: DayColor; ltvMet: boolean; notes?: string | null; entryId?: string;
}
export interface UserType {
  id: string; email: string; name: string; role: "admin" | "viewer"; createdAt: string;
  assignedModels?: { id: string; name: string }[];
}
