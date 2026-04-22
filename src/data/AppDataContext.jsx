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
    credentials: "same-origin",
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
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.status === 204 ? null : response.json();
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await apiRequest("/api/bootstrap");
      setIsAuthenticated(true);
      setData({ ...EMPTY_DATA, ...payload });
    } catch (fetchError) {
      if (fetchError.status === 401) {
        setIsAuthenticated(false);
        setData(EMPTY_DATA);
        setError(null);
      } else {
        setError(fetchError.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadInitialState() {
      setLoading(true);
      setError(null);
      setAuthError(null);

      try {
        await apiRequest("/api/session");
        setIsAuthenticated(true);
        const payload = await apiRequest("/api/bootstrap");
        setData({ ...EMPTY_DATA, ...payload });
      } catch (fetchError) {
        if (fetchError.status === 401) {
          setIsAuthenticated(false);
          setData(EMPTY_DATA);
        } else {
          setError(fetchError.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadInitialState();
  }, []);

  const login = useCallback(
    async (email, password) => {
      setAuthError(null);

      try {
        await apiRequest("/api/session/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setIsAuthenticated(true);
        await refresh();
      } catch (loginFailure) {
        setAuthError(loginFailure.message);
        throw loginFailure;
      }
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest("/api/session/logout", {
        method: "DELETE",
      });
    } catch {
      // Ignore logout failures when the session has already expired.
    }

    setIsAuthenticated(false);
    setAuthError(null);
    setError(null);
    setData(EMPTY_DATA);
  }, []);

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
    async (invoiceId, status) => {
      const updatedInvoice = await apiRequest(`/api/supplier-invoices/${invoiceId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await refresh();
      return updatedInvoice;
    },
    [refresh],
  );

  const updateTimesheetStatus = useCallback(
    async (timesheetId, action) => {
      const updatedTimesheet = await apiRequest(`/api/timesheets/${timesheetId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      await refresh();
      return updatedTimesheet;
    },
    [refresh],
  );

  const updateUserRole = useCallback(
    async (userId, appRole) => {
      const updatedUser = await apiRequest(`/api/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ appRole }),
      });
      await refresh();
      return updatedUser;
    },
    [refresh],
  );

  const updateUserIdentity = useCallback(
    async (userId, payload) => {
      const updatedUser = await apiRequest(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await refresh();
      return updatedUser;
    },
    [refresh],
  );

  const resetUserPassword = useCallback(
    async (userId) => {
      const result = await apiRequest(`/api/users/${userId}/reset-password`, {
        method: "POST",
      });
      await refresh();
      return result;
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      ...data,
      loading,
      error,
      authError,
      isAuthenticated,
      refresh,
      login,
      logout,
      createJob,
      createEstimate,
      updateTimesheetStatus,
      updateSupplierInvoiceStatus,
      updateUserRole,
      updateUserIdentity,
      resetUserPassword,
    }),
    [
      createEstimate,
      createJob,
      data,
      error,
      authError,
      isAuthenticated,
      login,
      loading,
      logout,
      refresh,
      updateSupplierInvoiceStatus,
      updateTimesheetStatus,
      resetUserPassword,
      updateUserIdentity,
      updateUserRole,
    ],
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
