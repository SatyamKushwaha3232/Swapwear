import { supabase } from "../lib/supabase";
import { backendAuthEnabled, backendRequest } from "../lib/backendApi";

export async function getAdminDashboardData() {
  if (backendAuthEnabled) {
    try {
      const data = await backendRequest("/trust/admin/dashboard");
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
  if (backendAuthEnabled) {
    try {
      const data = await backendRequest(`/trust/admin/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message || "Unable to resolve report" };
    }
  }

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
