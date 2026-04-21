import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AppDataContext = createContext(null);

const EMPTY_DATA = {
  currentUser: null,
  staff: [],
  clients: [],
  jobs: [],
  invoices: [],
  estimates: [],
  timesheets: [],
  suppliers: [],
  supplierInvoices: [],
  equipment: [],
  inspections: [],
  plannerJobs: [],
  leaveApplications: [],
  hse: { sssps: [], incidents: [] },
  reporting: { jobCosts: {}, timesheetDetail: [] },
};

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch {
      // ignore parse failures
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await apiRequest("/api/bootstrap");
      setData({ ...EMPTY_DATA, ...payload });
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createJob = useCallback(
    async (jobInput) => {
      const createdJob = await apiRequest("/api/jobs", {
        method: "POST",
        body: JSON.stringify(jobInput),
      });
      await refresh();
      return createdJob;
    },
    [refresh],
  );

  const createEstimate = useCallback(
    async (estimateInput) => {
      const createdEstimate = await apiRequest("/api/estimates", {
        method: "POST",
        body: JSON.stringify(estimateInput),
      });
      await refresh();
      return createdEstimate;
    },
    [refresh],
  );

  const updateSupplierInvoiceStatus = useCallback(
    async (invoiceId, status, currentUserName) => {
      const updatedInvoice = await apiRequest(`/api/supplier-invoices/${invoiceId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, currentUserName }),
      });
      await refresh();
      return updatedInvoice;
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      ...data,
      loading,
      error,
      refresh,
      createJob,
      createEstimate,
      updateSupplierInvoiceStatus,
    }),
    [createEstimate, createJob, data, error, loading, refresh, updateSupplierInvoiceStatus],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider.");
  }
  return context;
}
