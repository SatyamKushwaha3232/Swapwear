import { backendRequest } from "../lib/backendApi";

export async function getAdminDashboardData() {
  try {
    const data = await backendRequest("/trust/admin/dashboard");
    return { success: true, data: { stats: data?.stats || {}, users: data?.users || [], reports: data?.reports || [] } };
  } catch (error) {
    return { success: false, error: error.message || "Unable to load admin dashboard", data: { stats: {}, users: [], reports: [] } };
  }
}

export async function resolveMarketplaceReport(reportId, status = "resolved", note = "") {
  try {
    const data = await backendRequest(`/trust/admin/reports/${reportId}`, { method: "PATCH", body: JSON.stringify({ status, note }) });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to resolve report" };
  }
}
