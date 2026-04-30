import { pool, query } from "./db.mjs";
import {
  generateLoginUsername,
  issuePasswordSetupToken,
  normalizeLoginEmail,
  normalizeLoginUsername,
  recordAuthEvent,
  revokeAllUserSessions,
} from "./auth.mjs";
import {
  assertRoleAtLeast,
  getUserAuthoritySummary,
  isKnownAppRole,
  normalizeAppRole,
} from "./authorization.mjs";

const STATUS_BY_SUPPLIER_INVOICE = {
  received: "pending_review",
  approved: "approved",
  paid: "paid",
  disputed: "disputed",
};

const STATUS_TO_SUPPLIER_INVOICE = {
  pending_review: "received",
  approved: "approved",
  paid: "paid",
  disputed: "disputed",
};

function currency(value) {
  return value == null ? null : Number(value);
}

function plainDate(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

function plainDateTime(value) {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 16).replace("T", " ");
}

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function titleize(value) {
  return value
    ? value
        .split("_")
        .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
        .join(" ")
    : "";
}

function deriveInitials(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function normalizeOptionalText(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function assertCanAssignRole(currentUser, targetRole, nextRole) {
  const actorAuthority = getUserAuthoritySummary(currentUser);
  const currentTargetRole = normalizeAppRole(targetRole);
  const requestedRole = normalizeAppRole(nextRole);

  if (!actorAuthority.isSuperUser) {
    if (currentTargetRole === "SuperUser") {
      const error = new Error("Only a SuperUser can manage another SuperUser.");
      error.statusCode = 403;
      throw error;
    }

    if (requestedRole === "SuperUser") {
      const error = new Error("Only a SuperUser can assign the SuperUser role.");
      error.statusCode = 403;
      throw error;
    }
  }

  return requestedRole;
}

function assertValidLoginEmail(email) {
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailPattern.test(email)) {
    const error = new Error("A valid email address is required.");
    error.statusCode = 400;
    throw error;
  }
}

function estimateTotal(estimate) {
  return estimate.sections.reduce(
    (sum, section) =>
      sum +
      section.items.reduce(
        (sectionSum, item) => sectionSum + (item.qty ?? 0) * (item.rate ?? 0),
        0,
      ),
    0,
  );
}

async function fetchRows() {
  const [
    usersResult,
    clientsResult,
    contactsResult,
    jobsResult,
    invoicesResult,
    estimatesResult,
    estimateSectionsResult,
    estimateItemsResult,
    timesheetsResult,
    timesheetDaysResult,
    timesheetEntriesResult,
    timesheetExpensesResult,
    suppliersResult,
    purchaseOrdersResult,
    supplierInvoicesResult,
    equipmentResult,
    inspectionsResult,
    plannerAssignmentsResult,
    leaveRequestsResult,
    hseSsspsResult,
    hseIncidentsResult,
  ] = await Promise.all([
    query(`
      select
        id,
        employee_code,
        full_name,
        initials,
        role_title,
        app_role,
        login_username,
        division,
        region,
        email,
        phone,
        metadata,
        auth_login_email,
        has_auth_account,
        auth_is_active,
        auth_last_login_at,
        auth_failed_login_count,
        auth_locked_until,
        pending_password_purpose,
        pending_password_expires_at
      from (
        select
          u.id,
          u.employee_code,
          u.full_name,
          u.initials,
          u.role_title,
          u.app_role,
          u.division,
          u.region,
          u.email,
          u.phone,
          u.metadata,
          a.login_email as auth_login_email,
          (a.id is not null) as has_auth_account,
          coalesce(a.is_active, false) as auth_is_active,
          a.last_login_at as auth_last_login_at,
          coalesce(a.failed_login_count, 0) as auth_failed_login_count,
          a.locked_until as auth_locked_until,
          pt.purpose as pending_password_purpose,
          pt.expires_at as pending_password_expires_at
        from app_users u
        left join app_auth_accounts a on a.user_id = u.id
        left join lateral (
          select
            purpose,
            expires_at
          from app_password_tokens
          where user_id = u.id
            and consumed_at is null
            and revoked_at is null
            and expires_at > now()
          order by created_at desc
          limit 1
        ) pt on true
        where u.is_active = true
      ) users
      order by full_name asc
    `),
    query(`
      select
        id,
        client_code,
        name,
        industry,
        region,
        billing_email,
        billing_phone,
        address_line_1,
        address_line_2,
        city,
        country,
        notes,
        metadata
      from clients
      order by name asc
    `),
    query(`
      select
        id,
        client_id,
        full_name,
        job_title,
        email,
        mobile,
        office_phone,
        is_primary
      from client_contacts
      order by is_primary desc, full_name asc
    `),
    query(`
      select
        j.id,
        j.job_number,
        j.title,
        j.client_id,
        c.name as client_name,
        j.client_code,
        j.division,
        j.region,
        j.status,
        j.job_type,
        manager.full_name as manager_name,
        supervisor.full_name as supervisor_name,
        j.contract_value,
        j.invoiced_value,
        j.hours_logged,
        j.start_date,
        j.end_date,
        coalesce(j.site_name, j.site_address) as site_name,
        j.site_address,
        j.scope_of_work,
        j.metadata
      from jobs j
      join clients c on c.id = j.client_id
      left join app_users manager on manager.id = j.manager_user_id
      left join app_users supervisor on supervisor.id = j.supervisor_user_id
      order by j.job_number desc
    `),
    query(`
      select
        i.id,
        i.invoice_number,
        j.job_number,
        c.name as client_name,
        i.amount,
        i.status,
        i.due_date,
        i.issue_date
      from invoices i
      join jobs j on j.id = i.job_id
      join clients c on c.id = i.client_id
      order by i.issue_date desc, i.invoice_number desc
    `),
    query(`
      select
        e.id,
        e.estimate_number,
        e.reference_number,
        e.revision,
        e.client_id,
        c.name as client_name,
        c.client_code,
        e.job_id,
        j.job_number,
        e.division,
        e.region,
        e.status,
        e.title,
        e.site_address,
        prep.full_name as prepared_by_name,
        e.prepared_at,
        e.valid_until,
        e.contact_name,
        e.contact_mobile,
        e.scope_of_work,
        e.notes,
        e.metadata
      from estimates e
      join clients c on c.id = e.client_id
      left join jobs j on j.id = e.job_id
      left join app_users prep on prep.id = e.prepared_by_user_id
      order by e.prepared_at desc, e.estimate_number desc
    `),
    query(`
      select
        id,
        estimate_id,
        sort_order,
        title
      from estimate_sections
      order by estimate_id asc, sort_order asc
    `),
    query(`
      select
        id,
        section_id,
        sort_order,
        description,
        quantity,
        unit,
        rate
      from estimate_items
      order by section_id asc, sort_order asc
    `),
    query(`
      select
        t.id,
        t.user_id,
        u.employee_code,
        u.full_name as user_name,
        t.week_start,
        t.status,
        t.submitted_at,
        sup.full_name as supervisor_approved_by_name,
        t.supervisor_approved_at,
        mgr.full_name as manager_approved_by_name,
        t.manager_approved_at,
        t.total_hours,
        t.total_overnights,
        t.notes
      from timesheets t
      join app_users u on u.id = t.user_id
      left join app_users sup on sup.id = t.supervisor_approved_by
      left join app_users mgr on mgr.id = t.manager_approved_by
      order by t.week_start desc, u.full_name asc
    `),
    query(`
      select
        id,
        timesheet_id,
        work_date,
        day_type,
        leave_type,
        overnight,
        notes
      from timesheet_days
      order by work_date desc
    `),
    query(`
      select
        te.id,
        te.timesheet_day_id,
        te.start_time,
        te.end_time,
        te.hours,
        te.rate_type,
        te.notes,
        te.crew_with,
        j.job_number
      from timesheet_entries te
      left join jobs j on j.id = te.job_id
      order by te.created_at asc
    `),
    query(`
      select
        id,
        timesheet_id,
        expense_type,
        description,
        amount,
        has_receipt
      from timesheet_expenses
      order by created_at asc
    `),
    query(`
      select
        id,
        supplier_code,
        name,
        category,
        division,
        region,
        contact_name,
        email,
        phone,
        payment_terms_days,
        status
      from suppliers
      order by name asc
    `),
    query(`
      select
        po.id,
        po.po_number,
        po.supplier_id,
        s.name as supplier_name,
        j.job_number,
        j.title as job_title,
        po.description,
        po.status,
        po.issue_date,
        po.amount
      from purchase_orders po
      join suppliers s on s.id = po.supplier_id
      left join jobs j on j.id = po.job_id
      order by po.issue_date desc, po.po_number desc
    `),
    query(`
      select
        si.id,
        si.supplier_id,
        s.name as supplier_name,
        si.purchase_order_id,
        po.po_number,
        j.job_number,
        j.title as job_title,
        si.supplier_invoice_number,
        si.issue_date,
        si.received_at,
        si.due_date,
        si.amount,
        si.status,
        approver.full_name as approved_by_name,
        si.approved_at,
        si.paid_at,
        si.notes,
        po.amount as po_amount
      from supplier_invoices si
      join suppliers s on s.id = si.supplier_id
      left join purchase_orders po on po.id = si.purchase_order_id
      left join jobs j on j.id = po.job_id
      left join app_users approver on approver.id = si.approved_by_user_id
      order by si.issue_date desc, si.supplier_invoice_number desc
    `),
    query(`
      select
        e.id,
        e.equipment_code,
        e.name,
        e.equipment_type,
        e.category,
        e.division,
        e.region,
        e.status,
        e.serial_number,
        e.metadata
      from equipment e
      order by e.name asc
    `),
    query(`
      select
        ei.id,
        e.equipment_code,
        ei.inspection_type,
        ei.inspection_date,
        ei.due_date,
        ei.status,
        u.full_name as inspector_name,
        ei.notes,
        ei.findings
      from equipment_inspections ei
      join equipment e on e.id = ei.equipment_id
      left join app_users u on u.id = ei.inspector_user_id
      order by ei.inspection_date desc
    `),
    query(`
      select
        pa.id,
        e.equipment_code,
        j.job_number,
        pa.assignment_type,
        pa.title,
        pa.client_name,
        pa.site_address,
        pa.start_date,
        pa.end_date,
        pa.color_hex,
        pa.personnel,
        pa.is_downtime
      from planner_assignments pa
      join equipment e on e.id = pa.equipment_id
      left join jobs j on j.id = pa.job_id
      order by pa.start_date asc
    `),
    query(`
      select
        lr.id,
        u.employee_code,
        u.full_name,
        lr.leave_type,
        lr.start_date,
        lr.end_date,
        lr.day_count,
        lr.status,
        lr.notes,
        lr.submitted_at,
        approver.full_name as approved_by_name,
        lr.approved_at
      from leave_requests lr
      join app_users u on u.id = lr.user_id
      left join app_users approver on approver.id = lr.approved_by_user_id
      order by lr.start_date desc
    `),
    query(`
      select
        sssp_number,
        status,
        next_review_date,
        hazards,
        actions
      from hse_sssps
      order by sssp_number asc
    `),
    query(`
      select
        incident_number,
        severity,
        occurred_at,
        summary,
        status
      from hse_incidents
      order by occurred_at desc
    `),
  ]);

  return {
    users: usersResult.rows,
    clients: clientsResult.rows,
    contacts: contactsResult.rows,
    jobs: jobsResult.rows,
    invoices: invoicesResult.rows,
    estimates: estimatesResult.rows,
    estimateSections: estimateSectionsResult.rows,
    estimateItems: estimateItemsResult.rows,
    timesheets: timesheetsResult.rows,
    timesheetDays: timesheetDaysResult.rows,
    timesheetEntries: timesheetEntriesResult.rows,
    timesheetExpenses: timesheetExpensesResult.rows,
    suppliers: suppliersResult.rows,
    purchaseOrders: purchaseOrdersResult.rows,
    supplierInvoices: supplierInvoicesResult.rows,
    equipment: equipmentResult.rows,
    inspections: inspectionsResult.rows,
    plannerAssignments: plannerAssignmentsResult.rows,
    leaveRequests: leaveRequestsResult.rows,
    hseSssps: hseSsspsResult.rows,
    hseIncidents: hseIncidentsResult.rows,
  };
}

export async function getBootstrapData(currentUserId) {
  const rows = await fetchRows();

  const usersById = new Map(rows.users.map((user) => [user.id, user]));
  const jobsByUuid = new Map(rows.jobs.map((job) => [job.id, job]));
  const supplierById = new Map(rows.suppliers.map((supplier) => [supplier.id, supplier]));
  const contactsByClientId = rows.contacts.reduce((map, contact) => {
    map.set(contact.client_id, [...(map.get(contact.client_id) ?? []), contact]);
    return map;
  }, new Map());
  const estimateItemsBySectionId = rows.estimateItems.reduce((map, item) => {
    map.set(item.section_id, [...(map.get(item.section_id) ?? []), item]);
    return map;
  }, new Map());
  const estimateSectionsByEstimateId = rows.estimateSections.reduce((map, section) => {
    map.set(section.estimate_id, [...(map.get(section.estimate_id) ?? []), section]);
    return map;
  }, new Map());
  const daysByTimesheetId = rows.timesheetDays.reduce((map, day) => {
    map.set(day.timesheet_id, [...(map.get(day.timesheet_id) ?? []), day]);
    return map;
  }, new Map());
  const entriesByDayId = rows.timesheetEntries.reduce((map, entry) => {
    map.set(entry.timesheet_day_id, [...(map.get(entry.timesheet_day_id) ?? []), entry]);
    return map;
  }, new Map());
  const expensesByTimesheetId = rows.timesheetExpenses.reduce((map, expense) => {
    map.set(expense.timesheet_id, [...(map.get(expense.timesheet_id) ?? []), expense]);
    return map;
  }, new Map());
  const purchaseOrdersBySupplierId = rows.purchaseOrders.reduce((map, po) => {
    map.set(po.supplier_id, [...(map.get(po.supplier_id) ?? []), po]);
    return map;
  }, new Map());
  const plannerAssignmentsByEquipmentCode = rows.plannerAssignments.reduce((map, assignment) => {
    map.set(assignment.equipment_code, [...(map.get(assignment.equipment_code) ?? []), assignment]);
    return map;
  }, new Map());

  const staff = rows.users.map((user) => ({
    id: user.employee_code,
    dbId: user.id,
    name: user.full_name,
    initials: user.initials,
    role: user.role_title,
    roleTitle: user.role_title,
    appRole: normalizeAppRole(user.app_role),
    appRoleRank: getUserAuthoritySummary({ appRole: user.app_role }).appRoleRank,
    username: user.login_username,
    division: user.division,
    region: user.region,
    email: user.email,
    loginEmail: user.auth_login_email ?? user.email,
    hasAuthAccount: Boolean(user.has_auth_account),
    loginAccountActive: Boolean(user.auth_is_active),
    lastLoginAt: user.auth_last_login_at,
    failedLoginCount: Number(user.auth_failed_login_count ?? 0),
    lockedUntil: user.auth_locked_until,
    pendingPasswordPurpose: user.pending_password_purpose ?? null,
    pendingPasswordExpiresAt: user.pending_password_expires_at ?? null,
    phone: user.phone,
    metadata: parseJson(user.metadata, {}),
  }));

  const jobs = rows.jobs.map((job) => ({
    id: job.job_number,
    dbId: job.id,
    title: job.title,
    client: job.client_name,
    clientCode: job.client_code,
    division: job.division,
    region: job.region,
    status: job.status,
    manager: job.manager_name,
    supervisor: job.supervisor_name,
    contractValue: currency(job.contract_value),
    invoiced: currency(job.invoiced_value) ?? 0,
    startDate: plainDate(job.start_date),
    endDate: plainDate(job.end_date),
    type: job.job_type,
    hoursLogged: currency(job.hours_logged) ?? 0,
    site: job.site_name,
    siteAddress: job.site_address,
    scope: job.scope_of_work,
    metadata: parseJson(job.metadata, {}),
  }));

  const clients = rows.clients.map((client) => {
    const contacts = (contactsByClientId.get(client.id) ?? []).map((contact) => ({
      id: contact.id,
      name: contact.full_name,
      role: contact.job_title,
      email: contact.email,
      phone: contact.office_phone,
      mobile: contact.mobile,
      isPrimary: contact.is_primary,
    }));
    const metadata = parseJson(client.metadata, {});
    return {
      id: client.id,
      code: client.client_code,
      name: client.name,
      industry: client.industry,
      region: client.region,
      phone: client.billing_phone,
      email: client.billing_email,
      billingAddress: [client.address_line_1, client.address_line_2, client.city, client.country]
        .filter(Boolean)
        .join(", "),
      paymentTerms: metadata.paymentTerms ?? null,
      creditLimit: metadata.creditLimit ?? null,
      isActive: metadata.isActive ?? true,
      since: metadata.since ?? null,
      contacts,
      activities: metadata.activities ?? [],
      notes: client.notes,
    };
  });

  const invoices = rows.invoices.map((invoice) => ({
    id: invoice.invoice_number,
    dbId: invoice.id,
    job: invoice.job_number,
    client: invoice.client_name,
    amount: currency(invoice.amount),
    status: invoice.status,
    dueDate: plainDate(invoice.due_date),
    issueDate: plainDate(invoice.issue_date),
  }));

  const estimates = rows.estimates.map((estimate) => {
    const sections = (estimateSectionsByEstimateId.get(estimate.id) ?? []).map((section) => ({
      id: section.id,
      title: section.title,
      items: (estimateItemsBySectionId.get(section.id) ?? []).map((item) => ({
        id: item.id,
        description: item.description,
        qty: item.quantity == null ? null : Number(item.quantity),
        unit: item.unit,
        rate: currency(item.rate) ?? 0,
      })),
    }));

    return {
      id: estimate.estimate_number,
      dbId: estimate.id,
      ref: estimate.reference_number ?? "",
      revision: estimate.revision,
      client: estimate.client_name,
      clientCode: estimate.client_code,
      contact: estimate.contact_name ?? "",
      contactMobile: estimate.contact_mobile ?? "",
      division: estimate.division,
      region: estimate.region,
      title: estimate.title,
      siteAddress: estimate.site_address ?? "",
      status: estimate.status,
      date: plainDate(estimate.prepared_at),
      validUntil: plainDate(estimate.valid_until),
      preparedBy: estimate.prepared_by_name ?? "",
      scope: estimate.scope_of_work ?? "",
      sections,
      notes: parseJson(estimate.notes, []),
      job: estimate.job_number,
    };
  });

  const timesheets = rows.timesheets.map((timesheet) => ({
    id: timesheet.id,
    userId: timesheet.employee_code,
    user: timesheet.user_name,
    weekStart: plainDate(timesheet.week_start),
    status: timesheet.status,
    supervisorApprovedBy: timesheet.supervisor_approved_by_name,
    supervisorApprovedAt: plainDateTime(timesheet.supervisor_approved_at),
    managerApprovedBy: timesheet.manager_approved_by_name,
    managerApprovedAt: plainDateTime(timesheet.manager_approved_at),
    submittedAt: plainDateTime(timesheet.submitted_at),
    days: (daysByTimesheetId.get(timesheet.id) ?? []).map((day) => ({
      id: day.id,
      date: plainDate(day.work_date),
      dayType: day.day_type,
      leaveType: day.leave_type,
      overnight: day.overnight,
      notes: day.notes,
      entries: (entriesByDayId.get(day.id) ?? []).map((entry) => ({
        id: entry.id,
        jobId: entry.job_number,
        startTime: entry.start_time ? String(entry.start_time).slice(0, 5) : null,
        endTime: entry.end_time ? String(entry.end_time).slice(0, 5) : null,
        hours: entry.hours == null ? null : Number(entry.hours),
        rateType: entry.rate_type,
        notes: entry.notes,
        crewWith: parseJson(entry.crew_with, []),
      })),
    })),
    expenses: (expensesByTimesheetId.get(timesheet.id) ?? []).map((expense) => ({
      id: expense.id,
      type: expense.expense_type,
      description: expense.description,
      amount: currency(expense.amount),
      receipt: expense.has_receipt,
    })),
    totalHours: currency(timesheet.total_hours) ?? 0,
    totalOvernights: timesheet.total_overnights ?? 0,
    notes: timesheet.notes,
  }));

  const suppliers = rows.suppliers.map((supplier) => ({
    id: supplier.id,
    code: supplier.supplier_code,
    name: supplier.name,
    category: supplier.category,
    specialty: supplier.category,
    contact: supplier.contact_name,
    email: supplier.email,
    phone: supplier.phone,
    paymentTerms: supplier.payment_terms_days,
    isActive: supplier.status === "active",
    division: supplier.division,
    region: supplier.region,
    pos: (purchaseOrdersBySupplierId.get(supplier.id) ?? []).map((po) => ({
      id: po.po_number,
      dbId: po.id,
      job: po.job_number,
      jobTitle: po.job_title,
      description: po.description,
      amount: currency(po.amount) ?? 0,
      status: po.status,
      date: plainDate(po.issue_date),
    })),
  }));

  const supplierInvoices = rows.supplierInvoices.map((invoice) => ({
    id: invoice.id,
    supplierId: invoice.supplier_id,
    supplierName: invoice.supplier_name,
    poId: invoice.po_number,
    poDbId: invoice.purchase_order_id,
    job: invoice.job_number,
    jobTitle: invoice.job_title,
    supplierRef: invoice.supplier_invoice_number,
    description: invoice.notes || invoice.job_title || invoice.supplier_invoice_number,
    invoiceDate: plainDate(invoice.issue_date),
    receivedDate: plainDate(invoice.received_at) ?? plainDate(invoice.issue_date),
    dueDate: plainDate(invoice.due_date),
    poAmount: currency(invoice.po_amount) ?? 0,
    invoiceAmount: currency(invoice.amount) ?? 0,
    status: STATUS_BY_SUPPLIER_INVOICE[invoice.status] ?? "pending_review",
    approvedBy: invoice.approved_by_name,
    approvedDate: plainDateTime(invoice.approved_at),
    paidDate: plainDateTime(invoice.paid_at),
    notes: invoice.notes ?? "",
  }));

  const equipment = rows.equipment.map((item) => {
    const metadata = parseJson(item.metadata, {});
    const today = plainDate(new Date());
    const relevantAssignments = (plannerAssignmentsByEquipmentCode.get(item.equipment_code) ?? [])
      .filter((assignment) => assignment.assignment_type === "job")
      .sort((left, right) => String(left.start_date).localeCompare(String(right.start_date)));
    const activeAssignment =
      relevantAssignments.find((assignment) => plainDate(assignment.end_date) >= today) ??
      relevantAssignments.at(-1) ??
      null;

    return {
      id: item.equipment_code,
      dbId: item.id,
      name: item.name,
      type: item.equipment_type,
      category: item.category,
      division: item.division,
      region: item.region,
      status: item.status,
      jobId: activeAssignment?.job_number ?? null,
      rego: metadata.rego ?? item.serial_number,
      year: metadata.year ?? null,
      notes: metadata.notes ?? "",
    };
  });

  const inspections = rows.inspections.map((inspection) => ({
    id: inspection.id,
    eqId: inspection.equipment_code,
    date: plainDate(inspection.inspection_date),
    dueDate: plainDate(inspection.due_date),
    tech: inspection.inspector_name,
    faults: parseJson(inspection.findings, []),
    status:
      inspection.status === "action_required"
        ? "open"
        : inspection.status === "open"
          ? "open"
          : "pass",
    priority: inspection.status === "action_required" ? "medium" : null,
    notes: inspection.notes ?? "",
  }));

  const plannerJobs = rows.plannerAssignments.map((assignment) => ({
    id: assignment.id,
    rigId: assignment.equipment_code,
    jobId: assignment.job_number,
    client: assignment.client_name,
    site: assignment.site_address,
    start: plainDate(assignment.start_date),
    end: plainDate(assignment.end_date),
    color: assignment.color_hex,
    personnel: parseJson(assignment.personnel, []),
    isDowntime: assignment.is_downtime,
    label: assignment.assignment_type === "job" ? null : assignment.title,
  }));

  const leaveApplications = rows.leaveRequests.map((leaveRequest) => ({
    id: leaveRequest.id,
    userId: leaveRequest.employee_code,
    staffName: leaveRequest.full_name,
    type: leaveRequest.leave_type,
    start: plainDate(leaveRequest.start_date),
    end: plainDate(leaveRequest.end_date),
    days: Number(leaveRequest.day_count),
    status: leaveRequest.status,
    notes: leaveRequest.notes,
    submittedAt: plainDateTime(leaveRequest.submitted_at),
    approvedBy: leaveRequest.approved_by_name,
    approvedAt: plainDateTime(leaveRequest.approved_at),
  }));

  const jobCosts = jobs.reduce((acc, job) => {
    const labourHours = timesheets.reduce(
      (sum, timesheet) =>
        sum +
        timesheet.days.reduce(
          (daySum, day) =>
            daySum +
            day.entries
              .filter((entry) => entry.jobId === job.id)
              .reduce(
                (entrySum, entry) =>
                  entrySum +
                  (entry.hours ??
                    (entry.startTime && entry.endTime
                      ? (() => {
                          const [sh, sm] = entry.startTime.split(":").map(Number);
                          const [eh, em] = entry.endTime.split(":").map(Number);
                          return Math.max(((eh * 60 + em) - (sh * 60 + sm)) / 60, 0);
                        })()
                      : 0)),
                0,
              ),
          0,
        ),
      0,
    );

    const subcontractorCosts = supplierInvoices
      .filter((invoice) => invoice.job === job.id)
      .reduce((sum, invoice) => sum + invoice.invoiceAmount, 0);

    acc[job.id] = {
      subcontractorCosts,
      labourCosts: labourHours * 85,
      otherCosts: 0,
    };
    return acc;
  }, {});

  const timesheetDetail = timesheets.flatMap((timesheet) => {
    const grouped = new Map();

    for (const day of timesheet.days) {
      for (const entry of day.entries) {
        if (!entry.jobId) continue;
        const hours =
          entry.hours ??
          (entry.startTime && entry.endTime
            ? (() => {
                const [sh, sm] = entry.startTime.split(":").map(Number);
                const [eh, em] = entry.endTime.split(":").map(Number);
                return Math.max(((eh * 60 + em) - (sh * 60 + sm)) / 60, 0);
              })()
            : 0);
        grouped.set(entry.jobId, (grouped.get(entry.jobId) ?? 0) + hours);
      }
    }

    return [...grouped.entries()].map(([jobId, hours]) => {
      const staffMember = staff.find((member) => member.id === timesheet.userId);
      return {
        week: timesheet.weekStart,
        user: timesheet.user,
        job: jobId,
        hours,
        role: staffMember?.role ?? "",
      };
    });
  });

  return {
    staff,
    clients,
    jobs,
    invoices,
    estimates,
    timesheets,
    suppliers,
    supplierInvoices,
    equipment,
    inspections,
    plannerJobs,
    leaveApplications,
    hse: {
      sssps: rows.hseSssps.map((item) => ({
        id: item.sssp_number,
        status: item.status,
        nextReviewDate: plainDate(item.next_review_date),
        hazards: parseJson(item.hazards, []),
        actions: parseJson(item.actions, []),
      })),
      incidents: rows.hseIncidents.map((item) => ({
        id: item.incident_number,
        severity: item.severity,
        occurredAt: plainDateTime(item.occurred_at),
        summary: item.summary,
        status: item.status,
      })),
    },
    reporting: {
      jobCosts,
      timesheetDetail,
    },
    currentUser:
      staff.find((user) => user.dbId === currentUserId) ??
      null,
  };
}

export async function createJob(input, currentUser) {
  const clientResult = await query(
    `select id, client_code from clients where name = $1 limit 1`,
    [input.client],
  );

  if (clientResult.rowCount === 0) {
    throw new Error(`Client "${input.client}" was not found in PostgreSQL.`);
  }

  const prefix = input.division === "Water" ? "100" : "200";
  const numberResult = await query(
    `
      select coalesce(max(cast(substring(job_number from 4) as integer)), 0) as max_sequence
      from jobs
      where job_number like $1
    `,
    [`${prefix}%`],
  );

  const nextSequence = Number(numberResult.rows[0].max_sequence) + 1;
  const jobNumber = `${prefix}${String(nextSequence).padStart(3, "0")}`;

  const inserted = await query(
    `
      insert into jobs (
        job_number,
        title,
        client_id,
        client_code,
        division,
        region,
        status,
        job_type,
        manager_user_id,
        created_by_user_id,
        site_name,
        site_address,
        scope_of_work,
        metadata
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb)
      returning id
    `,
    [
      jobNumber,
      input.title.trim(),
      clientResult.rows[0].id,
      clientResult.rows[0].client_code,
      input.division,
      input.region,
      input.status,
      input.type,
      currentUser?.dbId ?? null,
      currentUser?.dbId ?? null,
      input.site.trim(),
      input.site.trim(),
      input.scope?.trim() || null,
      JSON.stringify({
        createdByUserId: currentUser?.dbId ?? null,
        createdByUserName: currentUser?.name ?? null,
      }),
    ],
  );

  const bootstrap = await getBootstrapData(currentUser?.dbId ?? null);
  return bootstrap.jobs.find((job) => job.dbId === inserted.rows[0].id);
}

export async function createEstimate(input, currentUser) {
  const clientResult = await query(
    `select id, client_code from clients where name = $1 limit 1`,
    [input.client],
  );

  if (clientResult.rowCount === 0) {
    throw new Error(`Client "${input.client}" was not found in PostgreSQL.`);
  }

  const nextNumberResult = await query(
    `
      select coalesce(max(cast(regexp_replace(estimate_number, '^EST-[0-9]{4}-', '') as integer)), 0) as max_sequence
      from estimates
      where estimate_number like 'EST-%'
    `,
  );

  const nextSequence = Number(nextNumberResult.rows[0].max_sequence) + 1;
  const estimateNumber = `EST-${new Date().getFullYear()}-${String(nextSequence).padStart(4, "0")}`;
  const referenceNumber = String(23560 + nextSequence - 1);

  const insertedEstimate = await query(
    `
      insert into estimates (
        estimate_number,
        reference_number,
        revision,
        client_id,
        division,
        region,
        status,
        title,
        site_address,
        prepared_by_user_id,
        created_by_user_id,
        prepared_at,
        valid_until,
        contact_name,
        contact_mobile,
        scope_of_work,
        metadata,
        notes
      )
      values ($1, $2, 1, $3, $4, $5, 'draft', $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb)
      returning id
    `,
    [
      estimateNumber,
      referenceNumber,
      clientResult.rows[0].id,
      input.division,
      input.region,
      input.title.trim(),
      input.siteAddress?.trim() || null,
      currentUser?.dbId ?? null,
      currentUser?.dbId ?? null,
      input.date,
      input.validUntil || null,
      input.contact?.trim() || null,
      input.contactMobile?.trim() || null,
      input.scope?.trim() || null,
      JSON.stringify({
        createdByUserId: currentUser?.dbId ?? null,
        createdByUserName: currentUser?.name ?? null,
      }),
      JSON.stringify(input.notes ?? []),
    ],
  );

  for (let sectionIndex = 0; sectionIndex < input.sections.length; sectionIndex += 1) {
    const section = input.sections[sectionIndex];
    const insertedSection = await query(
      `
        insert into estimate_sections (estimate_id, sort_order, title)
        values ($1, $2, $3)
        returning id
      `,
      [insertedEstimate.rows[0].id, sectionIndex + 1, section.title],
    );

    for (let itemIndex = 0; itemIndex < section.items.length; itemIndex += 1) {
      const item = section.items[itemIndex];
      await query(
        `
          insert into estimate_items (section_id, sort_order, description, quantity, unit, rate)
          values ($1, $2, $3, $4, $5, $6)
        `,
        [
          insertedSection.rows[0].id,
          itemIndex + 1,
          item.description,
          item.qty === "" || item.qty == null ? null : Number(item.qty),
          item.unit || null,
          Number(item.rate) || 0,
        ],
      );
    }
  }

  const bootstrap = await getBootstrapData(currentUser?.dbId ?? null);
  return bootstrap.estimates.find((estimate) => estimate.dbId === insertedEstimate.rows[0].id);
}

export async function updateSupplierInvoiceStatus(id, status, currentUser) {
  assertRoleAtLeast(
    currentUser,
    "Supervisor",
    "Supervisor access is required to change supplier invoice status.",
  );

  const databaseStatus = STATUS_TO_SUPPLIER_INVOICE[status];
  if (!databaseStatus) {
    throw new Error(`Unsupported supplier invoice status "${status}".`);
  }

  await query(
    `
      update supplier_invoices
      set
        status = $2,
        approved_by_user_id = case when $2 in ('approved', 'paid') then $3 else approved_by_user_id end,
        approved_at = case when $2 in ('approved', 'paid') then now() else approved_at end,
        paid_at = case when $2 = 'paid' then now() else paid_at end,
        last_action_by_user_id = $3,
        last_action_at = now(),
        notes = coalesce(notes, '')
      where id = $1
    `,
    [id, databaseStatus, currentUser?.dbId ?? null],
  );

  const bootstrap = await getBootstrapData(currentUser?.dbId ?? null);
  return bootstrap.supplierInvoices.find((invoice) => invoice.id === id);
}

export async function updateTimesheetStatus(
  id,
  action,
  currentUser,
) {
  const supportedActions = new Set(["supervisor_approve", "manager_approve", "reject"]);
  if (!supportedActions.has(action)) {
    throw new Error(`Unsupported timesheet action "${action}".`);
  }

  const existingResult = await query(
    `
      select
        id,
        status
      from timesheets
      where id = $1
      limit 1
    `,
    [id],
  );

  if (existingResult.rowCount === 0) {
    throw new Error("Timesheet was not found.");
  }

  const currentStatus = existingResult.rows[0].status;

  if (action === "supervisor_approve" && currentStatus !== "submitted") {
    throw new Error("Only submitted timesheets can be supervisor approved.");
  }

  if (action === "manager_approve" && currentStatus !== "supervisor_approved") {
    throw new Error("Only supervisor-approved timesheets can receive final approval.");
  }

  if (action === "reject" && !["submitted", "supervisor_approved"].includes(currentStatus)) {
    throw new Error("Only submitted or supervisor-approved timesheets can be returned.");
  }

  if (action === "supervisor_approve" || action === "reject") {
    assertRoleAtLeast(
      currentUser,
      "Supervisor",
      "Supervisor access is required for this timesheet action.",
    );
  }

  if (action === "manager_approve") {
    assertRoleAtLeast(
      currentUser,
      "Administrator",
      "Administrator access is required for final timesheet approval.",
    );
  }

  const approverId = currentUser?.dbId ?? null;

  if (!approverId) {
    throw new Error("No active app user matched the current approver.");
  }

  if (action === "supervisor_approve") {
    await query(
      `
        update timesheets
        set
          status = 'supervisor_approved',
          supervisor_approved_by = $2,
          supervisor_approved_at = now(),
          manager_approved_by = null,
          manager_approved_at = null,
          last_action_by_user_id = $2,
          last_action_at = now(),
          updated_at = now()
        where id = $1
      `,
      [id, approverId],
    );
  }

  if (action === "manager_approve") {
    await query(
      `
        update timesheets
        set
          status = 'manager_approved',
          manager_approved_by = $2,
          manager_approved_at = now(),
          last_action_by_user_id = $2,
          last_action_at = now(),
          updated_at = now()
        where id = $1
      `,
      [id, approverId],
    );
  }

  if (action === "reject") {
    await query(
      `
        update timesheets
        set
          status = 'rejected',
          supervisor_approved_by = null,
          supervisor_approved_at = null,
          manager_approved_by = null,
          manager_approved_at = null,
          last_action_by_user_id = $2,
          last_action_at = now(),
          updated_at = now()
        where id = $1
      `,
      [id, approverId],
    );
  }

  const bootstrap = await getBootstrapData(currentUser?.dbId ?? null);
  return bootstrap.timesheets.find((timesheet) => timesheet.id === id) ?? null;
}

export async function updateUserAuthority(targetUserId, appRole, currentUser) {
  assertRoleAtLeast(
    currentUser,
    "Administrator",
    "Administrator access is required to update user roles.",
  );

  if (!isKnownAppRole(appRole)) {
    const error = new Error(`Unsupported app role "${appRole}".`);
    error.statusCode = 400;
    throw error;
  }

  const actorAuthority = getUserAuthoritySummary(currentUser);

  const existingUserResult = await query(
    `
      select
        id,
        employee_code,
        full_name,
        role_title,
        app_role
      from app_users
      where id = $1
      limit 1
    `,
    [targetUserId],
  );

  if (existingUserResult.rowCount === 0) {
    throw new Error("User was not found.");
  }

  const targetUser = existingUserResult.rows[0];
  const normalizedRole = assertCanAssignRole(currentUser, targetUser.app_role, appRole);

  if (
    currentUser?.dbId === targetUserId &&
    actorAuthority.appRole === "SuperUser" &&
    normalizedRole !== "SuperUser"
  ) {
    const error = new Error("The active SuperUser session cannot demote itself.");
    error.statusCode = 400;
    throw error;
  }

  await query(
    `
      update app_users
      set
        app_role = $2,
        updated_at = now()
      where id = $1
    `,
    [targetUserId, normalizedRole],
  );

  const bootstrap = await getBootstrapData(currentUser?.dbId ?? null);
  return bootstrap.staff.find((user) => user.dbId === targetUserId) ?? null;
}

export async function createUserAccount(input, currentUser, auditContext = null) {
  assertRoleAtLeast(
    currentUser,
    "Administrator",
    "Administrator access is required to create users.",
  );

  const employeeCode = String(input?.employeeCode ?? "").trim();
  const fullName = String(input?.fullName ?? "").trim();
  const roleTitle = String(input?.roleTitle ?? "").trim();
  const appRole = String(input?.appRole ?? "").trim();
  const usernameInput = String(input?.username ?? "").trim();
  const enableLogin = Boolean(input?.enableLogin);
  const email = normalizeLoginEmail(input?.email);
  const phone = normalizeOptionalText(input?.phone);
  const division = normalizeOptionalText(input?.division);
  const region = normalizeOptionalText(input?.region);
  const initials = String(input?.initials ?? "").trim().toUpperCase() || deriveInitials(fullName);
  const username = normalizeLoginUsername(usernameInput || generateLoginUsername(fullName, employeeCode));

  if (!employeeCode) {
    throw new Error("Employee code is required.");
  }

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  if (!roleTitle) {
    throw new Error("Role title is required.");
  }

  if (!initials) {
    throw new Error("Initials are required.");
  }

  if (!username) {
    throw new Error("Username is required and must be alphanumeric only.");
  }

  if (!isKnownAppRole(appRole)) {
    throw new Error(`Unsupported app role "${appRole}".`);
  }

  const normalizedRole = assertCanAssignRole(currentUser, null, appRole);

  if (enableLogin && !email) {
    throw new Error("Email is required when creating login access.");
  }

  if (email) {
    assertValidLoginEmail(email);
  }

  const duplicateResult = await query(
    `
      select employee_code as match_value
      from app_users
      where employee_code = $1
      union all
      select lower(login_username) as match_value
      from app_users
      where lower(login_username) = lower($2)
      union all
      select lower(email) as match_value
      from app_users
      where $3 <> ''
        and lower(email) = $3
      union all
      select lower(login_email) as match_value
      from app_auth_accounts
      where $3 <> ''
        and lower(login_email) = $3
      limit 1
    `,
    [employeeCode, username, email],
  );

  if (duplicateResult.rowCount > 0) {
    throw new Error("Employee code, username, or email already exists.");
  }

  const client = await pool.connect();

  try {
    await client.query("begin");

    const userInsert = await client.query(
      `
        insert into app_users (
          employee_code,
          full_name,
          initials,
          role_title,
          app_role,
          login_username,
          division,
          region,
          email,
          phone,
          is_active
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
        returning id
      `,
      [
        employeeCode,
        fullName,
        initials,
        roleTitle,
        normalizedRole,
        username,
        division,
        region,
        email || null,
        phone,
      ],
    );

    let passwordSetup = null;
    if (enableLogin) {
      passwordSetup = await issuePasswordSetupToken({
        userId: userInsert.rows[0].id,
        purpose: "invite",
        createdByUserId: currentUser?.dbId ?? null,
        client,
        auditContext,
      });

      await client.query(
        `
          update app_users
          set
            email = $2,
            updated_at = now()
          where id = $1
        `,
        [userInsert.rows[0].id, email],
      );
    }

    await client.query("commit");

    const bootstrap = await getBootstrapData(currentUser?.dbId ?? null);
    const user = bootstrap.staff.find((person) => person.dbId === userInsert.rows[0].id) ?? null;

    return {
      user,
      email: enableLogin ? email : null,
      username,
      setupLink: passwordSetup?.link ?? null,
      tokenExpiresAt: passwordSetup?.expiresAt ?? null,
      message: enableLogin
        ? `New user created and invite link generated for ${fullName}.`
        : `New user created for ${fullName}. Login access can be enabled later.`,
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateUserIdentity(targetUserId, input, currentUser) {
  assertRoleAtLeast(
    currentUser,
    "Administrator",
    "Administrator access is required to update user details.",
  );

  const normalizedEmail = normalizeLoginEmail(input?.email);
  const normalizedUsername = normalizeLoginUsername(input?.username);
  const actorAuthority = getUserAuthoritySummary(currentUser);

  if (!normalizedEmail) {
    const error = new Error("Email is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!normalizedUsername) {
    const error = new Error("Username is required and must be alphanumeric only.");
    error.statusCode = 400;
    throw error;
  }

  assertValidLoginEmail(normalizedEmail);

  const duplicateResult = await query(
    `
      select id
      from app_users
      where lower(email) = $1
        and id <> $2
      union all
      select id
      from app_users
      where lower(login_username) = lower($3)
        and id <> $2
      union all
      select user_id as id
      from app_auth_accounts
      where lower(login_email) = $1
        and user_id <> $2
      limit 1
    `,
    [normalizedEmail, targetUserId, normalizedUsername],
  );

  if (duplicateResult.rowCount > 0) {
    const error = new Error("Another user already has that email address or username.");
    error.statusCode = 400;
    throw error;
  }

  const targetUserResult = await query(
    `
      select app_role
      from app_users
      where id = $1
      limit 1
    `,
    [targetUserId],
  );

  if (targetUserResult.rowCount === 0) {
    const error = new Error("User was not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!actorAuthority.isSuperUser && normalizeAppRole(targetUserResult.rows[0].app_role) === "SuperUser") {
    const error = new Error("Only a SuperUser can update another SuperUser.");
    error.statusCode = 403;
    throw error;
  }

  const updatedUserResult = await query(
    `
      update app_users
      set
        email = $2,
        login_username = $3,
        updated_at = now()
      where id = $1
      returning id
    `,
    [targetUserId, normalizedEmail, normalizedUsername],
  );

  if (updatedUserResult.rowCount === 0) {
    const error = new Error("User was not found.");
    error.statusCode = 404;
    throw error;
  }

  await query(
    `
      update app_auth_accounts
      set
        login_email = $2,
        updated_at = now()
      where user_id = $1
    `,
    [targetUserId, normalizedEmail],
  );

  await revokeAllUserSessions(targetUserId);

  const bootstrap = await getBootstrapData(currentUser?.dbId ?? null);
  return bootstrap.staff.find((user) => user.dbId === targetUserId) ?? null;
}

export async function inviteUserLoginAccess(targetUserId, currentUser, auditContext = null) {
  assertRoleAtLeast(
    currentUser,
    "Administrator",
    "Administrator access is required to invite users.",
  );

  const userResult = await query(
    `
      select
        u.id,
        u.full_name,
        u.email,
        u.login_username,
        u.app_role,
        a.id as account_id,
        a.is_active as account_is_active
      from app_users u
      left join app_auth_accounts a on a.user_id = u.id
      where u.id = $1
      limit 1
    `,
    [targetUserId],
  );

  if (userResult.rowCount === 0) {
    const error = new Error("User was not found.");
    error.statusCode = 404;
    throw error;
  }

  const user = userResult.rows[0];
  const actorAuthority = getUserAuthoritySummary(currentUser);

  if (!actorAuthority.isSuperUser && normalizeAppRole(user.app_role) === "SuperUser") {
    const error = new Error("Only a SuperUser can invite another SuperUser.");
    error.statusCode = 403;
    throw error;
  }

  const loginEmail = normalizeLoginEmail(user.email);
  if (!loginEmail) {
    const error = new Error("Set an email address before sending an invite.");
    error.statusCode = 400;
    throw error;
  }
  assertValidLoginEmail(loginEmail);

  const loginUsername =
    normalizeLoginUsername(user.login_username) ||
    generateLoginUsername(user.full_name, loginEmail || targetUserId);

  if (!loginUsername) {
    const error = new Error("Set a valid username before sending an invite.");
    error.statusCode = 400;
    throw error;
  }

  const duplicateResult = await query(
    `
      select id
      from app_users
      where lower(login_username) = lower($1)
        and id <> $2
      union all
      select user_id as id
      from app_auth_accounts
      where lower(login_email) = $3
        and user_id <> $2
      limit 1
    `,
    [loginUsername, targetUserId, loginEmail],
  );

  if (duplicateResult.rowCount > 0) {
    const error = new Error("Another user already has that email address or username.");
    error.statusCode = 400;
    throw error;
  }

  await query(
    `
      update app_users
      set
        email = $2,
        login_username = $3,
        updated_at = now()
      where id = $1
    `,
    [targetUserId, loginEmail, loginUsername],
  );

  if (user.account_id) {
    await query(
      `
        update app_auth_accounts
        set
          login_email = $2,
          updated_at = now()
        where user_id = $1
      `,
      [targetUserId, loginEmail],
    );
  }

  await revokeAllUserSessions(targetUserId, auditContext);

  const passwordSetup = await issuePasswordSetupToken({
    userId: targetUserId,
    purpose: "invite",
    createdByUserId: currentUser?.dbId ?? null,
    auditContext,
  });

  const bootstrap = await getBootstrapData(currentUser?.dbId ?? null);
  const bootstrapUser = bootstrap.staff.find((person) => person.dbId === targetUserId) ?? null;

  return {
    user: bootstrapUser,
    email: loginEmail,
    username: loginUsername,
    setupLink: passwordSetup.link,
    tokenExpiresAt: passwordSetup.expiresAt,
    message: user.account_id
      ? `Fresh invite link generated for ${user.full_name}.`
      : `Login onboarding started for ${user.full_name}. Invite link generated.`,
  };
}

export async function resetUserPassword(targetUserId, currentUser, auditContext = null) {
  assertRoleAtLeast(
    currentUser,
    "Administrator",
    "Administrator access is required to reset passwords.",
  );

  const userResult = await query(
    `
      select
        id,
        full_name,
        email,
        login_username,
        app_role
      from app_users
      where id = $1
      limit 1
    `,
    [targetUserId],
  );

  if (userResult.rowCount === 0) {
    const error = new Error("User was not found.");
    error.statusCode = 404;
    throw error;
  }

  const user = userResult.rows[0];
  const actorAuthority = getUserAuthoritySummary(currentUser);

  if (!actorAuthority.isSuperUser && normalizeAppRole(user.app_role) === "SuperUser") {
    const error = new Error("Only a SuperUser can reset another SuperUser password.");
    error.statusCode = 403;
    throw error;
  }

  const loginEmail = normalizeLoginEmail(user.email);

  if (!loginEmail) {
    const error = new Error("Set an email address before generating a password.");
    error.statusCode = 400;
    throw error;
  }

  const loginUsername =
    normalizeLoginUsername(user.login_username) ||
    generateLoginUsername(user.full_name, loginEmail || targetUserId);

  await query(
    `
      update app_users
      set
        login_username = $2,
        updated_at = now()
      where id = $1
    `,
    [targetUserId, loginUsername],
  );

  await revokeAllUserSessions(targetUserId, auditContext);

  const passwordSetup = await issuePasswordSetupToken({
    userId: targetUserId,
    purpose: "reset",
    createdByUserId: currentUser?.dbId ?? null,
    auditContext,
  });

  return {
    userId: targetUserId,
    email: loginEmail,
    username: loginUsername,
    setupLink: passwordSetup.link,
    tokenExpiresAt: passwordSetup.expiresAt,
    message: `Password reset link generated for ${user.full_name}.`,
  };
}

export async function setUserLoginAccess(targetUserId, isActive, currentUser, auditContext = null) {
  assertRoleAtLeast(
    currentUser,
    "Administrator",
    "Administrator access is required to change login access.",
  );

  const existingUserResult = await query(
    `
      select
        u.id,
        u.full_name,
        u.email,
        u.app_role,
        a.id as account_id,
        a.is_active as account_is_active
      from app_users u
      left join app_auth_accounts a on a.user_id = u.id
      where u.id = $1
      limit 1
    `,
    [targetUserId],
  );

  if (existingUserResult.rowCount === 0) {
    const error = new Error("User was not found.");
    error.statusCode = 404;
    throw error;
  }

  const existingUser = existingUserResult.rows[0];
  const actorAuthority = getUserAuthoritySummary(currentUser);

  if (!actorAuthority.isSuperUser && normalizeAppRole(existingUser.app_role) === "SuperUser") {
    const error = new Error("Only a SuperUser can change another SuperUser login access.");
    error.statusCode = 403;
    throw error;
  }

  if (currentUser?.dbId === targetUserId && !Boolean(isActive)) {
    const error = new Error("You cannot disable the login account for your current session.");
    error.statusCode = 400;
    throw error;
  }

  if (!existingUser.account_id) {
    const error = new Error("No login account exists yet. Generate a password first.");
    error.statusCode = 400;
    throw error;
  }

  await query(
    `
      update app_auth_accounts
      set
        is_active = $2,
        updated_at = now()
      where user_id = $1
    `,
    [targetUserId, Boolean(isActive)],
  );

  await revokeAllUserSessions(targetUserId, auditContext);

  await recordAuthEvent({
    eventType: Boolean(isActive) ? "login_access_enabled" : "login_access_disabled",
    accountId: existingUser.account_id,
    userId: targetUserId,
    ipAddress: auditContext?.ipAddress,
    userAgent: auditContext?.userAgent,
    metadata: {
      changedByUserId: currentUser?.dbId ?? null,
    },
  });

  const bootstrap = await getBootstrapData(currentUser?.dbId ?? null);
  return {
    user: bootstrap.staff.find((person) => person.dbId === targetUserId) ?? null,
    message: Boolean(isActive)
      ? `Login access enabled for ${existingUser.full_name}.`
      : `Login access disabled for ${existingUser.full_name}.`,
  };
}
