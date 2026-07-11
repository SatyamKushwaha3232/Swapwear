import { supabase } from "../lib/supabase";

export async function getAdminDashboardData() {
  try {
    const { data, error } = await supabase.rpc("get_admin_dashboard_data");
    if (error) throw error;

    return {
      success: true,
      data: {
        stats: data?.stats || {},
        users: data?.users || [],
        reports: data?.reports || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Unable to load admin dashboard",
      data: { stats: {}, users: [], reports: [] },
    };
  }
}

export async function resolveMarketplaceReport(reportId, status = "resolved", note = "") {
  try {
    const { data, error } = await supabase.rpc("resolve_marketplace_report", {
      p_report_id: reportId,
      p_status: status,
      p_note: note || null,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Unable to resolve report" };
  }
}
