import React, { useState, useEffect } from 'react';
import { Eye, Trash2, LogOut, Search, ShieldAlert, Filter, Calendar, Users, FileText, Database, Lock, X, ChevronDown, Bell, Download, CheckSquare, Square, ArrowLeft, Sheet, Plus, Edit, Camera, Shield, Radio, Home as HomeIcon, DoorOpen, AlertTriangle, Mail } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminPage.css';

// Format inquiry ID as INQ_XXXXX
const formatInqId = (id) => {
  if (!id) return 'INQ_00000';
  // For numeric IDs pad to 5 digits
  const raw = String(id).replace(/\D/g, '') || String(id).split('-').pop();
  const numeric = parseInt(raw, 10);
  if (!isNaN(numeric)) return `INQ_${String(numeric).padStart(5, '0')}`;
  return `INQ_${String(id).slice(-5).padStart(5, '0')}`;
};

// Status config
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#b45309', bg: '#fef3c7', border: '#fde68a' },
  accepted: { label: 'Accepted', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  progress: { label: 'In Progress', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  finished: { label: 'Finished', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
};

const AdminPage = ({ onNavigate }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  // Password Reset States
  const [loginView, setLoginView] = useState('login'); // 'login' | 'forgot' | 'verify'
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Inquiries data
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [adminTab, setAdminTab] = useState('inquiries');
  const [notificationAlert, setNotificationAlert] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'quote', 'contact'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'CCTV Systems', 'Alarm Systems', 'Other'
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Download / Export state
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportFormat, setExportFormat] = useState('excel'); // 'excel' | 'pdf'

  // Check login state on mount
  useEffect(() => {
    const token = localStorage.getItem('safehive_admin_token');
    const storedEmail = localStorage.getItem('safehive_admin_email');
    if (token) {
      setLoggedIn(true);
      if (storedEmail) {
        setAdminEmail(storedEmail);
      }
      fetchInquiries(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      localStorage.setItem('safehive_admin_token', data.token);
      localStorage.setItem('safehive_admin_email', email);
      setAdminEmail(email);
      setLoggedIn(true);
      fetchInquiries(data.token);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('safehive_admin_token');
    localStorage.removeItem('safehive_admin_email');
    setLoggedIn(false);
    setAdminEmail('');
    setInquiries([]);
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code.');
      }

      setResetSuccess(data.message);
      setLoginView('verify');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetCode = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setResetSuccess(data.message);
      setLoginView('login');
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setResetCode('');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async (token) => {
    const authToken = token || localStorage.getItem('safehive_admin_token');
    if (!authToken) return;

    setLoading(true);
    setFetchError('');

    try {
      const response = await fetch('/api/admin/inquiries', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch inquiries.');
      }

      setInquiries(data);
    } catch (err) {
      console.error(err);
      setFetchError(err.message);
      // If unauthorized, trigger logout
      if (err.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const authToken = localStorage.getItem('safehive_admin_token');
    // Optimistic update
    setInquiries(prev => prev.map(item =>
      String(item.id) === String(id) ? { ...item, status: newStatus } : item
    ));
    if (selectedInquiry && String(selectedInquiry.id) === String(id)) {
      setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
    }
    try {
      const response = await fetch(`/api/admin/inquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status.');
      }

      // Update with backend response notification logs
      if (data.notification) {
        setInquiries(prev => prev.map(item =>
          String(item.id) === String(id)
            ? {
              ...item,
              status: newStatus,
              notifications: item.notifications
                ? [...item.notifications, data.notification]
                : [data.notification]
            }
            : item
        ));

        if (selectedInquiry && String(selectedInquiry.id) === String(id)) {
          setSelectedInquiry(prev => ({
            ...prev,
            status: newStatus,
            notifications: prev.notifications
              ? [...prev.notifications, data.notification]
              : [data.notification]
          }));
        }

        // Show success alert toast
        setNotificationAlert({
          recipient: data.notification.recipient,
          subject: data.notification.subject,
          preview: data.notification.preview,
          method: data.notification.method,
          status: data.notification.status,
        });
      }
    } catch (err) {
      console.error('Status update error:', err);
      // Revert on failure
      fetchInquiries();
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry permanently?')) {
      return;
    }

    const authToken = localStorage.getItem('safehive_admin_token');
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete inquiry.');
      }

      // Update state directly or refetch
      setInquiries(prev => prev.filter(item => item.id !== id));
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Helper date formatter
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // ── Export Column Headers ────────────────────────────────────────────────────
  const EXPORT_HEADERS = [
    'Inquiry ID', 'Full Name', 'Company', 'Primary Contact', 'Secondary Contact',
    'Location', 'Budget', 'Source', 'Service Types', 'Custom Inquiry', 'Status',
    'Num Cameras', 'Footage Duration', 'CCTV Notes', 'Alarm Property Type',
    'Num Sensors', 'Alarm System Type', 'Alarm Timeframe', 'Alarm Previous System', 'Message', 'Request Date'
  ];

  const inquiryToRow = (item) => [
    formatInqId(item.id),
    item.full_name || '',
    item.company_name || '',
    item.initial_contact || '',
    item.alternative_contact || '',
    item.location || '',
    item.budget || '',
    item.source || '',
    Array.isArray(item.inquiry_type) ? item.inquiry_type.join(', ') : '',
    item.custom_inquiry || '',
    STATUS_CONFIG[item.status || 'pending']?.label || 'Pending',
    item.num_cameras || '',
    item.timeframe || '',
    item.cctv_other || '',
    item.alarm_property_type || '',
    item.num_sensors || '',
    item.alarm_system_type || '',
    item.alarm_timeframe || '',
    item.alarm_installed_system || '',
    item.message || '',
    formatDate(item.created_at),
  ];

  // ── Excel Export ─────────────────────────────────────────────────────────────
  const downloadExcel = (rows, filename) => {
    if (!rows || rows.length === 0) { alert('No records to export.'); return; }
    const wsData = [EXPORT_HEADERS, ...rows.map(inquiryToRow)];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // Column widths
    ws['!cols'] = [10, 18, 18, 22, 22, 16, 12, 10, 20, 20, 12, 12, 16, 18, 20, 12, 20, 16, 20, 30, 20].map(w => ({ wch: w }));
    // Bold header row
    EXPORT_HEADERS.forEach((_, ci) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: ci });
      if (ws[cellRef]) ws[cellRef].s = { font: { bold: true }, fill: { fgColor: { rgb: 'E25822' } } };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inquiries');
    XLSX.writeFile(wb, filename + '.xlsx');
  };

  // ── PDF Invoice Export ────────────────────────────────────────────────────────
  // Draws a single inquiry as an invoice page inside `doc` starting at `startY`
  const drawInvoicePage = (doc, item, isFirst) => {
    const PW = 210; // A4 portrait width mm
    const ML = 14;  // margin left
    const MR = 14;  // margin right
    const CW = PW - ML - MR; // content width
    const status = item.status || 'pending';
    const sc = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    if (!isFirst) doc.addPage();

    // ── Brand header bar ──
    doc.setFillColor(226, 88, 34);
    doc.rect(0, 0, PW, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SAFEHIVE', ML, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('SafeHive Security Systems', ML, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INQUIRY RECORD', PW - MR - 38, 13);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${formatInqId(item.id)}`, PW - MR - 38, 19);

    let y = 30;

    // ── Inquiry meta strip ──
    doc.setFillColor(248, 250, 252);
    doc.rect(ML, y, CW, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(ML, y, CW, 10, 'S');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(`Request Date:`, ML + 3, y + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${formatDate(item.created_at)}`, ML + 28, y + 6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Source:', ML + 85, y + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${(item.source || '').charAt(0).toUpperCase() + (item.source || '').slice(1)} Form`, ML + 100, y + 6.5);
    // Status badge
    const statusColors = {
      pending: [254, 243, 199],
      accepted: [239, 246, 255],
      progress: [245, 243, 255],
      finished: [240, 253, 244],
    };
    const statusTextColors = {
      pending: [180, 83, 9],
      accepted: [29, 78, 216],
      progress: [124, 58, 237],
      finished: [21, 128, 61],
    };
    const bgC = statusColors[status] || statusColors.pending;
    const txC = statusTextColors[status] || statusTextColors.pending;
    doc.setFillColor(bgC[0], bgC[1], bgC[2]);
    doc.roundedRect(PW - MR - 30, y + 2, 28, 7, 2, 2, 'F');
    doc.setTextColor(txC[0], txC[1], txC[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(sc.label.toUpperCase(), PW - MR - 16, y + 6.8, { align: 'center' });

    y += 15;

    // ── Section title helper ──
    const sectionTitle = (title, yPos) => {
      doc.setFillColor(226, 88, 34);
      doc.rect(ML, yPos, 3, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(10, 37, 64);
      doc.text(title, ML + 6, yPos + 5);
      doc.setDrawColor(241, 245, 249);
      doc.line(ML + 6 + doc.getTextWidth(title) + 3, yPos + 2.5, ML + CW, yPos + 2.5);
      return yPos + 10;
    };

    // ── CLIENT INFORMATION TABLE ──
    y = sectionTitle('CLIENT INFORMATION', y);
    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      tableWidth: CW,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold', textColor: [100, 116, 139], fillColor: [248, 250, 252] },
        1: { cellWidth: CW / 2 - 42, textColor: [15, 23, 42] },
        2: { cellWidth: 42, fontStyle: 'bold', textColor: [100, 116, 139], fillColor: [248, 250, 252] },
        3: { cellWidth: CW / 2 - 42, textColor: [15, 23, 42] },
      },
      body: [
        ['Full Name', item.full_name || '—', 'Company', item.company_name || '—'],
        ['Primary Contact', item.initial_contact || '—', 'Alt Contact', item.alternative_contact || '—'],
        ['Location', item.location || '—', 'Budget', item.budget || '—'],
        ['Service Types', Array.isArray(item.inquiry_type) ? item.inquiry_type.join(', ') : '—', 'Status', sc.label],
      ],
      didParseCell: (data) => {
        if (data.column.index === 0 || data.column.index === 2) {
          data.cell.styles.fillColor = [248, 250, 252];
        }
      },
    });

    y = doc.lastAutoTable.finalY + 8;

    // ── SERVICE SPECIFICATIONS ──
    const hasCctv = item.num_cameras || item.timeframe || item.cctv_other;
    const hasAlarm = item.alarm_property_type || item.num_sensors || item.alarm_system_type || item.alarm_timeframe || item.alarm_installed_system;
    const hasCustom = item.custom_inquiry;

    if (hasCctv || hasAlarm || hasCustom) {
      y = sectionTitle('SERVICE SPECIFICATIONS', y);

      const specRows = [];
      if (hasCctv) {
        specRows.push([{ content: 'CCTV Surveillance System', colSpan: 2, styles: { fontStyle: 'bold', textColor: [226, 88, 34], fillColor: [255, 248, 245], fontSize: 8.5, cellPadding: { top: 4, bottom: 4, left: 6, right: 4 } } }]);
        if (item.num_cameras) specRows.push(['Number of Cameras', item.num_cameras]);
        if (item.timeframe) specRows.push(['Your estimate timeframe to complete the project?', item.timeframe]);
        if (item.cctv_other) specRows.push(['Special Surveillance Needs', item.cctv_other]);
      }
      if (hasAlarm) {
        specRows.push([{ content: 'Alarm Intrusion System', colSpan: 2, styles: { fontStyle: 'bold', textColor: [124, 58, 237], fillColor: [250, 245, 255], fontSize: 8.5, cellPadding: { top: 4, bottom: 4, left: 6, right: 4 } } }]);
        if (item.alarm_property_type) specRows.push(['Property Profile', item.alarm_property_type]);
        if (item.num_sensors) specRows.push(['Number of Protection Sensors', item.num_sensors]);
        if (item.alarm_system_type) specRows.push(['Preferred System Brand/Type', item.alarm_system_type]);
        if (item.alarm_timeframe) specRows.push(['Estimated Timeframe', item.alarm_timeframe]);
        if (item.alarm_installed_system) specRows.push(['Previously Installed System', item.alarm_installed_system]);
      }
      if (hasCustom) {
        specRows.push([{ content: 'Custom Service Request', colSpan: 2, styles: { fontStyle: 'bold', textColor: [15, 118, 110], fillColor: [240, 253, 250], fontSize: 8.5, cellPadding: { top: 4, bottom: 4, left: 6, right: 4 } } }]);
        specRows.push(['Details', item.custom_inquiry]);
      }

      autoTable(doc, {
        startY: y,
        margin: { left: ML, right: MR },
        tableWidth: CW,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 }, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 65, fontStyle: 'bold', textColor: [100, 116, 139], fillColor: [248, 250, 252] },
          1: { textColor: [15, 23, 42] },
        },
        body: specRows,
      });

      y = doc.lastAutoTable.finalY + 8;
    }

    // ── CLIENT MESSAGE ──
    if (item.message) {
      y = sectionTitle('CLIENT MESSAGE', y);
      doc.setFillColor(255, 248, 245);
      doc.setDrawColor(226, 88, 34);
      doc.setLineWidth(0.8);
      const msgLines = doc.splitTextToSize(item.message, CW - 12);
      const msgH = msgLines.length * 5.5 + 10;
      doc.rect(ML, y, CW, msgH, 'F');
      doc.line(ML, y, ML, y + msgH);
      doc.setLineWidth(0.1);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(msgLines, ML + 5, y + 7);
    }

    // ── Watermark Background (Diagonal 45° faded text) ──
    doc.saveGraphicsState();
    let hasGState = false;
    try {
      if (typeof doc.GState === 'function') {
        doc.setGState(new doc.GState({ opacity: 0.07 }));
        hasGState = true;
      }
    } catch (e) {
      console.warn('GState is not supported', e);
    }

    if (hasGState) {
      doc.setTextColor(226, 88, 34); // SafeHive Orange
    } else {
      doc.setTextColor(245, 220, 210); // Fallback very light orange
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);

    // Draw three diagonal watermarks across the page to ensure complete coverage
    doc.text('SAFEHIVE GENERATED', 50, 95, { angle: 45, align: 'center' });
    doc.text('SAFEHIVE GENERATED', 105, 165, { angle: 45, align: 'center' });
    doc.text('SAFEHIVE GENERATED', 160, 235, { angle: 45, align: 'center' });

    doc.restoreGraphicsState();

    // ── Footer ──
    const FY = 287;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(ML, FY, PW - MR, FY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('SafeHive Security Systems  •  Confidential Inquiry Record', ML, FY + 4);
    doc.text(`Exported: ${new Date().toLocaleString()}`, PW - MR, FY + 4, { align: 'right' });
  };

  const downloadPDF = (rows, filename) => {
    if (!rows || rows.length === 0) { alert('No records to export.'); return; }
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    rows.forEach((item, idx) => drawInvoicePage(doc, item, idx === 0));
    doc.save(filename + '.pdf');
  };

  // ── Unified download dispatcher ───────────────────────────────────────────────
  const doExport = (rows, baseName) => {
    if (exportFormat === 'pdf') downloadPDF(rows, baseName);
    else downloadExcel(rows, baseName);
  };

  const handleDownloadSelected = () => {
    const rows = inquiries.filter(item => selectedRows.has(String(item.id)));
    doExport(rows, `safehive_selected_${Date.now()}`);
  };

  const handleDownloadFiltered = () => {
    doExport(filteredInquiries, `safehive_filtered_${Date.now()}`);
  };

  const handleDownloadAll = () => {
    doExport(inquiries, `safehive_all_inquiries_${Date.now()}`);
  };

  const handleDownloadDateRange = () => {
    if (!dateFrom && !dateTo) { alert('Please select at least a From or To date.'); return; }
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null;
    const rows = inquiries.filter(item => {
      const d = new Date(item.created_at);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
    const label = `${dateFrom || 'start'}_to_${dateTo || 'end'}`;
    doExport(rows, `safehive_${label}`);
  };

  // Row checkbox helpers
  const toggleRowSelect = (e, id) => {
    e.stopPropagation();
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(String(id))) next.delete(String(id));
      else next.add(String(id));
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredInquiries.length && filteredInquiries.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredInquiries.map(i => String(i.id))));
    }
  };

  const handleDownloadSingleRow = (e, item) => {
    e.stopPropagation();
    doExport([item], `safehive_${formatInqId(item.id)}`);
  };

  // Metrics calculation by status
  const pendingCount = inquiries.filter(item => (item.status || 'pending') === 'pending').length;
  const acceptedCount = inquiries.filter(item => item.status === 'accepted').length;
  const progressCount = inquiries.filter(item => item.status === 'progress').length;
  const finishedCount = inquiries.filter(item => item.status === 'finished').length;

  // Filtered inquiries
  const filteredInquiries = inquiries.filter(item => {
    // Search query matching
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      formatInqId(item.id).toLowerCase().includes(searchLower) ||
      (item.full_name && item.full_name.toLowerCase().includes(searchLower)) ||
      (item.company_name && item.company_name.toLowerCase().includes(searchLower)) ||
      (item.location && item.location.toLowerCase().includes(searchLower)) ||
      (item.budget && item.budget.toLowerCase().includes(searchLower)) ||
      (item.initial_contact && item.initial_contact.toLowerCase().includes(searchLower)) ||
      (item.alternative_contact && item.alternative_contact.toLowerCase().includes(searchLower)) ||
      (item.status && item.status.toLowerCase().includes(searchLower)) ||
      (item.custom_inquiry && item.custom_inquiry.toLowerCase().includes(searchLower)) ||
      (item.inquiry_type && Array.isArray(item.inquiry_type) && item.inquiry_type.some(t => t.toLowerCase().includes(searchLower))) ||
      formatDate(item.created_at).toLowerCase().includes(searchLower);

    // Source matching
    const matchesSource = sourceFilter === 'all' ? true : item.source === sourceFilter;

    // Category matching
    let matchesCategory = true;
    if (categoryFilter !== 'all') {
      const types = Array.isArray(item.inquiry_type) ? item.inquiry_type : [];
      if (categoryFilter === 'Other') {
        matchesCategory = types.includes('Other') || !!item.custom_inquiry || (types.length === 0);
      } else {
        matchesCategory = types.includes(categoryFilter);
      }
    }
    // Status matching
    const matchesStatus = statusFilter === 'all' ? true : (item.status || 'pending') === statusFilter;

    return matchesSearch && matchesSource && matchesCategory && matchesStatus;
  });

  // Reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sourceFilter, categoryFilter, statusFilter, itemsPerPage]);

  // Pagination calculations
  const totalItems = filteredInquiries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInquiries.slice(indexOfFirstItem, indexOfLastItem);

  // Dynamic pagination range generator with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // Number of pages to show before and after current page
    const left = currentPage - delta;
    const right = currentPage + delta + 1;
    let range = [];
    let rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="admin-container">

      <div className="container" style={{ paddingBottom: '60px' }}>
        {!loggedIn ? (
          /* --- LOGIN CARD VIEW --- */
          <div className="admin-login-wrapper">
            <div className="admin-login-card animate-fade-in">
              <div className="admin-login-logo">
                <img src="/assets/safehive.png" alt="Safehive Logo" className="admin-logo-img" />
              </div>

              {loginView === 'login' && (
                <>
                  <h2>SafeHive Admin</h2>
                  <p>Secure login area for safety operations management.</p>

                  {loginError && (
                    <div className="login-error-alert">
                      <ShieldAlert size={18} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} />
                      {loginError}
                    </div>
                  )}

                  {resetSuccess && (
                    <div className="login-success-alert" style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '24px',
                      textAlign: 'left'
                    }}>
                      {resetSuccess}
                    </div>
                  )}

                  <form onSubmit={handleLogin}>
                    <div className="login-form-group">
                      <label>Operator Email</label>
                      <input
                        type="email"
                        placeholder="name@safehive.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="login-form-group">
                      <label>Secret Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" disabled={loading} className="btn-login mt-4">
                      {loading ? 'Authenticating...' : 'Enter Operator Panel'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginView('forgot');
                          setResetError('');
                          setResetSuccess('');
                        }}
                        className="forgot-link"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e25822',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </>
              )}

              {loginView === 'forgot' && (
                <>
                  <h2>Reset Password</h2>
                  <p>Enter your Operator Email to receive a verification code.</p>

                  {resetError && (
                    <div className="login-error-alert">
                      <ShieldAlert size={18} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} />
                      {resetError}
                    </div>
                  )}

                  <form onSubmit={handleSendResetCode}>
                    <div className="login-form-group">
                      <label>Operator Email</label>
                      <input
                        type="email"
                        placeholder="name@safehive.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" disabled={loading} className="btn-login mt-4">
                      {loading ? 'Sending code...' : 'Send Reset Code'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => setLoginView('login')}
                        className="forgot-link"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ArrowLeft size={14} /> Back to Login
                      </button>
                    </div>
                  </form>
                </>
              )}

              {loginView === 'verify' && (
                <>
                  <h2>Confirm Reset</h2>
                  <p>We've sent a code to your email. Enter it below with your new password.</p>

                  {resetError && (
                    <div className="login-error-alert">
                      <ShieldAlert size={18} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} />
                      {resetError}
                    </div>
                  )}

                  {resetSuccess && (
                    <div className="login-success-alert" style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '24px',
                      textAlign: 'left'
                    }}>
                      {resetSuccess}
                    </div>
                  )}

                  <form onSubmit={handleVerifyResetCode}>
                    <div className="login-form-group">
                      <label>6-Digit Verification Code</label>
                      <input
                        type="text"
                        placeholder="123456"
                        maxLength="6"
                        pattern="\d{6}"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        required
                        style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '18px', fontWeight: '800' }}
                      />
                    </div>
                    <div className="login-form-group">
                      <label>New Secret Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="login-form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" disabled={loading} className="btn-login mt-4">
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => setLoginView('login')}
                        className="forgot-link"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ArrowLeft size={14} /> Back to Login
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        ) : selectedInquiry ? (
          /* --- INQUIRY DETAILS PAGE VIEW --- */
          <div className="animate-fade-in detail-page-wrapper">
            {/* Sticky back bar — always visible */}
            <div className="detail-back-bar">
              <button onClick={() => setSelectedInquiry(null)} className="btn-back-detail">
                <ArrowLeft size={17} />
                Back to Inquiries
              </button>
              <div className="detail-back-bar-meta">
                <span className="detail-back-id">{formatInqId(selectedInquiry.id)}</span>
                {(() => {
                  const s = selectedInquiry.status || 'pending';
                  const sc = STATUS_CONFIG[s] || STATUS_CONFIG.pending;
                  return (
                    <span className="status-badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {sc.label}
                    </span>
                  );
                })()}
                {/* Status changer in bar */}
                <select
                  className="status-select"
                  value={selectedInquiry.status || 'pending'}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                  title="Change status"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="progress">In Progress</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>

            {/* Detail card content */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>

              <div className="admin-modal-body" style={{ padding: 0, maxHeight: 'none', overflowY: 'visible' }}>
                {/* Client Base Information */}
                <div className="modal-section">
                  <div className="modal-section-title">Client Information</div>
                  <div className="modal-info-grid">
                    <div className="modal-info-item">
                      <span className="modal-info-label">Full Name</span>
                      <span className="modal-info-value">{selectedInquiry.full_name}</span>
                    </div>
                    <div className="modal-info-item">
                      <span className="modal-info-label">Company Name</span>
                      <span className="modal-info-value">{selectedInquiry.company_name || 'N/A'}</span>
                    </div>
                    <div className="modal-info-item">
                      <span className="modal-info-label">Primary Contact (Email/Phone)</span>
                      <span className="modal-info-value">{selectedInquiry.initial_contact}</span>
                    </div>
                    <div className="modal-info-item">
                      <span className="modal-info-label">Secondary Contact</span>
                      <span className="modal-info-value">{selectedInquiry.alternative_contact || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Project Meta Information */}
                <div className="modal-section">
                  <div className="modal-section-title">Scope & Details</div>
                  <div className="modal-info-grid">
                    <div className="modal-info-item">
                      <span className="modal-info-label">Project Location</span>
                      <span className="modal-info-value">{selectedInquiry.location || 'N/A'}</span>
                    </div>
                    <div className="modal-info-item">
                      <span className="modal-info-label">Estimated Budget</span>
                      <span className="modal-info-value">{selectedInquiry.budget || 'N/A'}</span>
                    </div>
                    <div className="modal-info-item">
                      <span className="modal-info-label">Inquiry Source</span>
                      <span className="modal-info-value" style={{ textTransform: 'capitalize' }}>
                        {selectedInquiry.source} Form
                      </span>
                    </div>
                    <div className="modal-info-item">
                      <span className="modal-info-label">Submit Date & Time</span>
                      <span className="modal-info-value">{formatDate(selectedInquiry.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Service Specifics specs */}
                <div className="modal-section">
                  <div className="modal-section-title">Technical Specifications</div>
                  <div className="modal-specs-list">
                    {/* CCTV cameras specifications */}
                    {(selectedInquiry.num_cameras || selectedInquiry.timeframe || selectedInquiry.cctv_other) ? (
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--primary)', marginBottom: '8px' }}>🎥 CCTV Surveillance System</div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Number of Cameras</span>
                          <span className="modal-spec-value">{selectedInquiry.num_cameras || 'Not specified'}</span>
                        </div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Your estimate timeframe to complete the project?</span>
                          <span className="modal-spec-value">{selectedInquiry.timeframe || 'Not specified'}</span>
                        </div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Previously installed system</span>
                          <span className="modal-spec-value">{selectedInquiry.installedsystem || 'None'}</span>
                        </div>
                      </div>
                    ) : null}

                    {/* Alarm system specifications */}
                    {(selectedInquiry.alarm_property_type || selectedInquiry.num_sensors || selectedInquiry.alarm_system_type || selectedInquiry.alarm_timeframe || selectedInquiry.alarm_installed_system) ? (
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--primary)', marginBottom: '8px', marginTop: (selectedInquiry.num_cameras) ? '15px' : '0' }}>🔔 Alarm Intrusion System</div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Property Profile</span>
                          <span className="modal-spec-value">{selectedInquiry.alarm_property_type || 'Not specified'}</span>
                        </div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Number of Protection Sensors</span>
                          <span className="modal-spec-value">{selectedInquiry.num_sensors || 'Not specified'}</span>
                        </div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Preferred System Brand/Type</span>
                          <span className="modal-spec-value">{selectedInquiry.alarm_system_type || 'Not specified'}</span>
                        </div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Estimated Timeframe</span>
                          <span className="modal-spec-value">{selectedInquiry.alarm_timeframe || 'Not specified'}</span>
                        </div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Previously Installed System</span>
                          <span className="modal-spec-value">{selectedInquiry.alarm_installed_system || 'None'}</span>
                        </div>
                      </div>
                    ) : null}

                    {/* Custom spec falls back */}
                    {selectedInquiry.custom_inquiry && (
                      <div className="modal-spec-row">
                        <span className="modal-spec-label">Custom Service Requested</span>
                        <span className="modal-spec-value" style={{ color: 'var(--primary)' }}>{selectedInquiry.custom_inquiry}</span>
                      </div>
                    )}

                    {/* General consult note */}
                    {!(selectedInquiry.num_cameras || selectedInquiry.timeframe || selectedInquiry.cctv_other || selectedInquiry.alarm_property_type || selectedInquiry.num_sensors || selectedInquiry.alarm_system_type || selectedInquiry.custom_inquiry) && (
                      <div className="text-muted text-center" style={{ fontSize: '13px' }}>
                        No technical specs provided. Client requested a general security consultation.
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Details */}
                {selectedInquiry.message && (
                  <div className="modal-section" style={{ marginBottom: '20px' }}>
                    <div className="modal-section-title">Client Message</div>
                    <div className="modal-message-box">
                      {selectedInquiry.message}
                    </div>
                  </div>
                )}

                {/* Notification Log History */}
                <div className="modal-section" style={{ marginBottom: 0 }}>
                  <div className="modal-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} /> Notification History
                  </div>
                  {(!selectedInquiry.notifications || selectedInquiry.notifications.length === 0) ? (
                    <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
                      No status change notifications have been sent to this client yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedInquiry.notifications.map((notify, idx) => (
                        <div key={idx} style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>
                              Status: <span style={{ textTransform: 'uppercase', color: '#635bff' }}>{notify.status}</span>
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {formatDate(notify.timestamp)}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                            <strong>Sent to:</strong> {notify.recipient} ({notify.method === 'simulation' ? 'Simulated' : 'Email'})
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                            <strong>Subject:</strong> {notify.subject}
                          </div>
                          <details style={{ fontSize: '11px', color: '#334155' }}>
                            <summary style={{ cursor: 'pointer', color: '#635bff', fontWeight: '700' }}>View Notification Text</summary>
                            <pre style={{
                              whiteSpace: 'pre-wrap',
                              background: 'white',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              marginTop: '6px',
                              fontFamily: 'monospace',
                              lineHeight: '1.4'
                            }}>{notify.preview}</pre>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- ADMIN DASHBOARD VIEW --- */
          <div className="animate-fade-in">
            {/* Header */}
            <div className="admin-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <img src="/assets/safehive.png" alt="Safehive Logo" style={{ height: '45px', display: 'block' }} />
                <div className="admin-header-title">
                  <h1>Admin Page Panel</h1>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                  Logged in as admin: <strong style={{ color: '#0f172a' }}>{adminEmail || 'admin@safehive.com'}</strong>
                </span>

                {/* Alarm/Notification Bell for pending inquiries */}
                <div
                  className="admin-bell-container"
                  title={`${pendingCount} pending inquiries`}
                  onClick={() => {
                    // Set status filter to pending to filter the list immediately
                    setStatusFilter('pending');
                  }}
                >
                  <Bell
                    size={20}
                    className={pendingCount > 0 ? "bell-active-ring" : "bell-inactive"}
                  />
                  {pendingCount > 0 && (
                    <span className="bell-badge">
                      {pendingCount}
                    </span>
                  )}
                </div>

                <button onClick={handleLogout} className="btn-logout">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="admin-tabs-nav" style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
              <button
                className={`admin-tab-btn ${adminTab === 'inquiries' ? 'active' : ''}`}
                onClick={() => setAdminTab('inquiries')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: adminTab === 'inquiries' ? '#635bff' : 'transparent',
                  color: adminTab === 'inquiries' ? 'white' : '#64748b',
                  transition: 'all 0.3s ease'
                }}
              >
                Inquiries
              </button>
              <button
                className={`admin-tab-btn ${adminTab === 'services' ? 'active' : ''}`}
                onClick={() => setAdminTab('services')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: adminTab === 'services' ? '#635bff' : 'transparent',
                  color: adminTab === 'services' ? 'white' : '#64748b',
                  transition: 'all 0.3s ease'
                }}
              >
                Services
              </button>
              <button
                className={`admin-tab-btn ${adminTab === 'projects' ? 'active' : ''}`}
                onClick={() => setAdminTab('projects')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: adminTab === 'projects' ? '#635bff' : 'transparent',
                  color: adminTab === 'projects' ? 'white' : '#64748b',
                  transition: 'all 0.3s ease'
                }}
              >
                Projects
              </button>
            </div>

            {adminTab === 'inquiries' && (
              <>
                {/* Status Metrics cards */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-card-info">
                      <h3>Pending</h3>
                      <p style={{ color: '#b45309' }}>{pendingCount}</p>
                    </div>
                    <div className="metric-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                      <Calendar size={16} />
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-card-info">
                      <h3>Accepted</h3>
                      <p style={{ color: '#1d4ed8' }}>{acceptedCount}</p>
                    </div>
                    <div className="metric-card-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                      <FileText size={16} />
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-card-info">
                      <h3>In Progress</h3>
                      <p style={{ color: '#7c3aed' }}>{progressCount}</p>
                    </div>
                    <div className="metric-card-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      <Database size={16} />
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-card-info">
                      <h3>Finished</h3>
                      <p style={{ color: '#15803d' }}>{finishedCount}</p>
                    </div>
                    <div className="metric-card-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                      <Users size={16} />
                    </div>
                  </div>
                </div>

                {/* Filters panel */}
                <div className="filters-panel">
                  <div className="filters-row">
                    {/* Search Bar */}
                    <div className="search-box-wrapper">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search by client name, email, phone, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Category selector filter */}
                    <select
                      className="filter-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">All Service Types</option>
                      <option value="CCTV Systems">CCTV Camera</option>
                      <option value="Alarm Systems">Alarm System</option>
                      <option value="Other">Other Services</option>
                    </select>

                    {/* Status selector filter */}
                    <select
                      className="filter-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="progress">In Progress</option>
                      <option value="finished">Finished</option>
                    </select>

                    {/* Reload data button */}
                    <button onClick={() => fetchInquiries()} className="btn-logout" style={{ padding: '8px 14px' }}>
                      Refresh List
                    </button>

                    {/* Clear Filters button */}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCategoryFilter('all');
                        setStatusFilter('all');
                      }}
                      className="btn-logout"
                      style={{ padding: '8px 14px', borderColor: '#cbd5e1', color: '#64748b' }}
                    >
                      Clear Filters
                    </button>

                    {/* Download / Export toggle */}
                    <button
                      onClick={() => setShowDownloadPanel(p => !p)}
                      className="btn-download-toggle"
                      title="Export / Download"
                    >
                      <Download size={15} />
                      Export
                    </button>
                  </div>

                  {/* ── Download Panel ── */}
                  {showDownloadPanel && (
                    <div className="download-panel animate-fade-in">
                      <div className="download-panel-title">
                        <Download size={14} /> Export Inquiries as {exportFormat === 'pdf' ? 'PDF' : 'Excel'}
                      </div>

                      {/* Format toggle */}
                      <div className="export-format-row">
                        <span className="download-date-label">Format:</span>
                        <div className="format-toggle-group">
                          <button
                            className={`btn-format ${exportFormat === 'excel' ? 'btn-format-active' : ''}`}
                            onClick={() => setExportFormat('excel')}
                          >
                            📊 Excel (.xlsx)
                          </button>
                          <button
                            className={`btn-format ${exportFormat === 'pdf' ? 'btn-format-active btn-format-pdf' : ''}`}
                            onClick={() => setExportFormat('pdf')}
                          >
                            📄 PDF (.pdf)
                          </button>
                        </div>
                      </div>

                      {/* Row 1 — quick download buttons */}
                      <div className="download-actions-row">
                        <button
                          className="btn-dl btn-dl-all"
                          onClick={handleDownloadAll}
                          title={`Download all ${inquiries.length} records`}
                        >
                          <Download size={14} />
                          Download All ({inquiries.length})
                        </button>

                        <button
                          className="btn-dl btn-dl-filtered"
                          onClick={handleDownloadFiltered}
                          title={`Download currently filtered ${filteredInquiries.length} records`}
                        >
                          <Filter size={14} />
                          Download Filtered ({filteredInquiries.length})
                        </button>

                        <button
                          className={`btn-dl btn-dl-selected ${selectedRows.size === 0 ? 'btn-dl-disabled' : ''}`}
                          onClick={handleDownloadSelected}
                          disabled={selectedRows.size === 0}
                          title={selectedRows.size === 0 ? 'Select rows using checkboxes first' : `Download ${selectedRows.size} selected records`}
                        >
                          <CheckSquare size={14} />
                          Download Selected ({selectedRows.size})
                        </button>
                      </div>

                      {/* Row 2 — date range download */}
                      <div className="download-date-row">
                        <span className="download-date-label">Date Range:</span>
                        <div className="date-range-inputs">
                          <div className="date-input-group">
                            <label>From</label>
                            <input
                              type="date"
                              value={dateFrom}
                              onChange={e => setDateFrom(e.target.value)}
                              className="date-input"
                            />
                          </div>
                          <span className="date-separator">→</span>
                          <div className="date-input-group">
                            <label>To</label>
                            <input
                              type="date"
                              value={dateTo}
                              onChange={e => setDateTo(e.target.value)}
                              className="date-input"
                            />
                          </div>
                          <button
                            className="btn-dl btn-dl-daterange"
                            onClick={handleDownloadDateRange}
                          >
                            <Download size={14} />
                            Download Range
                          </button>
                          <button
                            className="btn-dl btn-dl-clear-dates"
                            onClick={() => { setDateFrom(''); setDateTo(''); }}
                            title="Clear dates"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="download-hint">
                        💡 Tick checkboxes on rows to use "Download Selected". Click a row's <Download size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> icon to export just that one.
                      </div>
                    </div>
                  )}
                </div>

                {/* Inquiries list */}
                {fetchError && (
                  <div className="login-error-alert mb-4">
                    Failed to load database entries: {fetchError}
                  </div>
                )}

                <div className="inquiries-card">
                  <div className="table-responsive">
                    <table className="inquiries-table">
                      <thead>
                        <tr>
                          <th style={{ width: '36px', textAlign: 'center' }}>
                            <button
                              className="checkbox-btn"
                              onClick={toggleSelectAll}
                              title={selectedRows.size === filteredInquiries.length && filteredInquiries.length > 0 ? 'Deselect all' : 'Select all visible'}
                            >
                              {selectedRows.size === filteredInquiries.length && filteredInquiries.length > 0
                                ? <CheckSquare size={15} color="#635bff" />
                                : <Square size={15} color="#94a3b8" />}
                            </button>
                          </th>
                          <th>Inquiry ID</th>
                          <th>Client Name</th>
                          <th>Company</th>
                          <th>Location</th>
                          <th>Budget</th>
                          <th>Services</th>
                          <th>Request Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="no-records">
                              <Eye size={36} className="opacity-30 mb-2" />
                              <p>{loading ? 'Loading database items...' : 'No matching inquiries found in the system.'}</p>
                            </td>
                          </tr>
                        ) : (
                          currentItems.map((item) => {
                            const status = item.status || 'pending';
                            const sc = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                            const isChecked = selectedRows.has(String(item.id));
                            return (
                              <tr
                                key={item.id}
                                onClick={() => setSelectedInquiry(item)}
                                style={{ cursor: 'pointer', background: isChecked ? '#f5f3ff' : undefined }}
                              >
                                {/* Checkbox */}
                                <td style={{ textAlign: 'center', width: '36px' }} onClick={(e) => toggleRowSelect(e, item.id)}>
                                  <button className="checkbox-btn">
                                    {isChecked
                                      ? <CheckSquare size={15} color="#635bff" />
                                      : <Square size={15} color="#cbd5e1" />}
                                  </button>
                                </td>
                                <td style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '12px', color: '#635bff', letterSpacing: '0.5px' }}>
                                  {formatInqId(item.id)}
                                </td>
                                <td style={{ fontWeight: '700', color: '#0f172a' }}>{item.full_name}</td>
                                <td style={{ color: '#64748b', fontSize: '12px' }}>{item.company_name || '—'}</td>
                                <td style={{ fontWeight: '600' }}>{item.location || 'N/A'}</td>
                                <td style={{ color: '#097969', fontWeight: '700' }}>{item.budget || 'N/A'}</td>
                                <td>
                                  <div className="services-chips">
                                    {item.inquiry_type && item.inquiry_type.map((t, idx) => (
                                      <span key={idx} className="service-chip">{t}</span>
                                    ))}
                                    {item.custom_inquiry && (
                                      <span className="service-chip" style={{ background: '#fff3f0', color: 'var(--primary)' }}>
                                        * {item.custom_inquiry}
                                      </span>
                                    )}
                                    {(!item.inquiry_type || item.inquiry_type.length === 0) && !item.custom_inquiry && (
                                      <span className="text-muted" style={{ fontSize: '12px' }}>General Consultation</span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ color: '#64748b', fontSize: '13px' }}>
                                  {formatDate(item.created_at)}
                                </td>
                                <td>
                                  <span
                                    className="status-badge"
                                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                                  >
                                    {sc.label}
                                  </span>
                                </td>
                                <td>
                                  <div className="action-btns">
                                    <select
                                      className="actions-status-select"
                                      value={status}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="accepted">Accepted</option>
                                      <option value="progress">In Progress</option>
                                      <option value="finished">Finished</option>
                                    </select>

                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSelectedInquiry(item); }}
                                      className="btn-icon-action view"
                                      title="View details"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    <button
                                      onClick={(e) => handleDownloadSingleRow(e, item)}
                                      className="btn-icon-action download"
                                      title={`Download this record as ${exportFormat.toUpperCase()}`}
                                    >
                                      <Download size={14} />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                      className="btn-icon-action delete"
                                      title="Delete record"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination Controls */}
                  {filteredInquiries.length > 0 && (
                    <div className="pagination-bar">
                      <div className="pagination-info">
                        Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-semibold">
                          {Math.min(indexOfLastItem, totalItems)}
                        </span>{' '}
                        of <span className="font-semibold">{totalItems}</span> entries
                      </div>
                      <div className="pagination-actions">
                        <div className="items-per-page-selector">
                          <span>Show</span>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(parseInt(e.target.value, 10));
                            }}
                            className="items-per-page-select"
                            title="Entries per page"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <span>entries</span>
                        </div>
                        <div className="pagination-buttons">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn prev"
                          >
                            Previous
                          </button>
                          {getPageNumbers().map((num, idx) => (
                            <button
                              key={idx}
                              onClick={() => typeof num === 'number' && setCurrentPage(num)}
                              disabled={num === '...'}
                              className={`pagination-btn num ${currentPage === num ? 'active' : ''} ${num === '...' ? 'ellipsis' : ''}`}
                            >
                              {num}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn next"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {adminTab === 'services' && (
              <ServicesTab />
            )}

            {adminTab === 'projects' && (
              <ProjectsTab />
            )}
          </div>
        )}

        {/* Client Notified Toast Overlay */}
        {notificationAlert && (
          <div className="notification-alert-toast animate-fade-in" style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            width: '380px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            padding: '20px',
            color: '#1e293b'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#ecfdf5', color: '#059669', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={18} />
                </div>
                <span style={{ fontWeight: '800', fontSize: '15px' }}>Client Notified</span>
              </div>
              <button
                onClick={() => setNotificationAlert(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px', padding: 0 }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: '1.4' }}>
              A status update notification was dispatched to <strong>{notificationAlert.recipient}</strong>.
              {notificationAlert.method === 'simulation' && (
                <span style={{ display: 'block', marginTop: '6px', fontStyle: 'italic', color: '#d97706', fontWeight: '600' }}>
                  * Simulated Mode (written to notifications_log.txt)
                </span>
              )}
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: '700', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                Subject: {notificationAlert.subject}
              </div>
              <div style={{
                whiteSpace: 'pre-wrap',
                fontSize: '11px',
                color: '#334155',
                maxHeight: '120px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                lineHeight: '1.4'
              }}>{notificationAlert.preview}</div>
            </div>
            <button
              onClick={() => setNotificationAlert(null)}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '8px',
                background: '#635bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

      </div>

    </div >

  );
};

const iconMap = {
  Camera: <Camera size={20} />,
  Bell: <Bell size={20} />,
  Shield: <Shield size={20} />,
  Radio: <Radio size={20} />,
  Home: <HomeIcon size={20} />,
  Eye: <Eye size={20} />,
  DoorOpen: <DoorOpen size={20} />,
  AlertTriangle: <AlertTriangle size={20} />
};

const ServicesTab = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('safehive_admin_token');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch services');
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setServices(prev => prev.filter(s => s.id !== id));
      sessionStorage.removeItem('safehive_services_cache');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (serviceData) => {
    const isEdit = !!serviceData.id;
    // Strip client-side temporary simulated IDs
    const finalId = isEdit && String(serviceData.id).startsWith('simulated') ? null : serviceData.id;
    const url = finalId ? `/api/admin/services/${finalId}` : '/api/admin/services';
    const method = finalId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...serviceData,
          id: finalId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save service');

      if (isEdit) {
        setServices(prev => prev.map(s => String(s.id) === String(serviceData.id) ? data : s));
      } else {
        setServices(prev => [...prev, data]);
      }
      sessionStorage.removeItem('safehive_services_cache');
      setEditingService(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (editingService) {
    return (
      <ServiceForm
        service={editingService}
        onSave={handleSave}
        onCancel={() => setEditingService(null)}
      />
    );
  }

  return (
    <div className="admin-tab-content animate-fade-in" style={{ marginTop: '20px' }}>
      <div className="tab-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Services Management</h2>
        <button
          className="btn-add-new"
          onClick={() => setEditingService({ category: '', icon: 'Camera', tagline: '', cards: [] })}
          style={{
            padding: '10px 20px',
            backgroundColor: '#635bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99,91,255,0.2)'
          }}
        >
          + Add New Service
        </button>
      </div>

      {error && <div className="login-error-alert">{error}</div>}

      {loading && <div className="text-center" style={{ padding: '40px', color: '#64748b' }}>Loading services...</div>}
      {!loading && services.length === 0 && <div className="text-center text-muted" style={{ padding: '40px' }}>No services found. Add one above!</div>}

      <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {services.map(s => (
          <div key={s.id} className="admin-item-card bg-white" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className="card-badge" style={{ background: '#f5f3ff', color: '#635bff', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {iconMap[s.icon] || <Camera size={20} />}
              </div>
              <div className="card-main-content">
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0a2540', margin: 0 }}>{s.category}</h3>
                <p className="card-tagline" style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0', fontStyle: 'italic' }}>"{s.tagline}"</p>
              </div>
            </div>
            <div className="card-sub-stats" style={{ fontSize: '13px', fontWeight: '600', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', width: 'fit-content', marginBottom: '16px' }}>
              📁 {s.cards ? s.cards.length : 0} feature card(s)
            </div>
            <div className="card-action-bar" style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                className="btn-card-edit"
                onClick={() => setEditingService(s)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                Edit
              </button>
              <button
                className="btn-card-delete"
                onClick={() => handleDelete(s.id)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  color: '#be123c'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ServiceForm = ({ service, onSave, onCancel }) => {
  const [category, setCategory] = useState(service.category || '');
  const [icon, setIcon] = useState(service.icon || 'Camera');
  const [tagline, setTagline] = useState(service.tagline || '');
  const [cards, setCards] = useState(service.cards || []);

  const handleAddCard = () => {
    setCards([...cards, { title: '', description: '', image: '' }]);
  };

  const handleRemoveCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index, field, value) => {
    const updated = cards.map((c, i) => i === index ? { ...c, [field]: value } : c);
    setCards(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category.trim()) {
      alert('Category name is required');
      return;
    }
    onSave({
      ...service,
      category,
      icon,
      tagline,
      cards
    });
  };

  return (
    <div className="admin-form-container animate-fade-in" style={{ marginTop: '20px', background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
      <div className="form-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{service.id ? 'Edit Service' : 'New Service'}</h2>
        <button
          className="btn-back-link"
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: '#635bff', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}
        >
          ← Cancel & Go Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-two-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Service Category Name *</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. CCTV Installation, Smart Locks"
              required
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Lucide Icon Representative</label>
            <select
              value={icon}
              onChange={e => setIcon(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: 'white' }}
            >
              <option value="Camera">Camera (CCTV)</option>
              <option value="Bell">Bell (Alarm)</option>
              <option value="Shield">Shield (Protection)</option>
              <option value="Radio">Radio (Wireless)</option>
              <option value="Home">Home (Residential)</option>
              <option value="Eye">Eye (Monitoring)</option>
              <option value="DoorOpen">DoorOpen (Access Control)</option>
              <option value="AlertTriangle">AlertTriangle (Siren)</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Service Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            placeholder="e.g. Alert before intrusion happens"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
          />
        </div>

        <div className="cards-sub-section" style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
          <div className="sub-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Sub-feature Cards</h3>
            <button
              type="button"
              className="btn-add-sub"
              onClick={handleAddCard}
              style={{
                padding: '6px 14px',
                background: '#eef2ff',
                color: '#635bff',
                border: '1px solid #c7d2fe',
                borderRadius: '6px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              + Add Feature Card
            </button>
          </div>

          {cards.length === 0 && (
            <p className="no-sub-items" style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '14px', margin: 0 }}>No feature cards added yet. Click "Add Feature Card" above.</p>
          )}

          {cards.map((c, idx) => (
            <div key={idx} className="sub-card-editor" style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div className="sub-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#475569' }}>Card #{idx + 1}</h4>
                <button
                  type="button"
                  className="btn-remove-sub"
                  onClick={() => handleRemoveCard(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Remove Card
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '12px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Card Title</label>
                  <input
                    type="text"
                    value={c.title}
                    onChange={e => handleCardChange(idx, 'title', e.target.value)}
                    placeholder="e.g. Outdoor Cameras"
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Card Image Path</label>
                  <input
                    type="text"
                    value={c.image}
                    onChange={e => handleCardChange(idx, 'image', e.target.value)}
                    placeholder="e.g. /assets/service/outdoor.webp"
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Card Description</label>
                <textarea
                  rows={2}
                  value={c.description}
                  onChange={e => handleCardChange(idx, 'description', e.target.value)}
                  placeholder="Describe the card capability..."
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions-row" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            style={{
              padding: '10px 24px',
              background: '#635bff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 4px 12px rgba(99,91,255,0.2)'
            }}
          >
            Save Service
          </button>
        </div>
      </form>
    </div>
  );
};

const ProjectsTab = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('safehive_admin_token');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch projects');

      const formatted = data.map(p => ({
        id: p.id,
        title: p.title,
        clientName: p.client_name || p.clientName || '',
        location: p.location || '',
        description: p.description || '',
        fullDetail: p.full_detail || p.fullDetail || '',
        benefit: p.benefit || p.benefits || [],
        category: p.category || '',
        image: p.image || '',
        showOnHome: p.show_on_home ?? p.showOnHome ?? false
      }));

      setProjects(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setProjects(prev => prev.filter(p => p.id !== id));
      sessionStorage.removeItem('safehive_all_projects_cache');
      sessionStorage.removeItem('safehive_featured_projects_cache');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleShowOnHome = async (project) => {
    const updatedStatus = !project.showOnHome;

    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, showOnHome: updatedStatus } : p));
    sessionStorage.removeItem('safehive_all_projects_cache');
    sessionStorage.removeItem('safehive_featured_projects_cache');

    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...project,
          showOnHome: updatedStatus
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }
    } catch (err) {
      alert(err.message);
      fetchProjects();
    }
  };

  const handleSave = async (projectData) => {
    const isEdit = !!projectData.id;
    const finalId = isEdit && String(projectData.id).startsWith('simulated') ? null : projectData.id;
    const url = finalId ? `/api/admin/projects/${finalId}` : '/api/admin/projects';
    const method = finalId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...projectData,
          id: finalId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project');

      const formatted = {
        id: data.id,
        title: data.title,
        clientName: data.client_name || data.clientName || '',
        location: data.location || '',
        description: data.description || '',
        fullDetail: data.full_detail || data.fullDetail || '',
        benefit: data.benefit || data.benefits || [],
        category: data.category || '',
        image: data.image || '',
        showOnHome: data.show_on_home ?? data.showOnHome ?? false
      };

      if (isEdit) {
        setProjects(prev => prev.map(p => String(p.id) === String(projectData.id) ? formatted : p));
      } else {
        setProjects(prev => [...prev, formatted]);
      }
      sessionStorage.removeItem('safehive_all_projects_cache');
      sessionStorage.removeItem('safehive_featured_projects_cache');
      setEditingProject(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (editingProject) {
    return (
      <ProjectForm
        project={editingProject}
        onSave={handleSave}
        onCancel={() => setEditingProject(null)}
      />
    );
  }

  return (
    <div className="admin-tab-content animate-fade-in" style={{ marginTop: '20px' }}>
      <div className="tab-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Projects Management</h2>
        <button
          className="btn-add-new"
          onClick={() => setEditingProject({ title: '', clientName: '', location: '', description: '', fullDetail: '', benefit: [], category: 'CCTV Camera', image: '', showOnHome: false })}
          style={{
            padding: '10px 20px',
            backgroundColor: '#635bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99,91,255,0.2)'
          }}
        >
          + Add New Project
        </button>
      </div>

      {error && <div className="login-error-alert">{error}</div>}

      <div className="inquiries-card">
        <div className="table-responsive">
          <table className="inquiries-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Client</th>
                <th>Location</th>
                <th>Category</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Show on Home</th>
                <th style={{ textAlign: 'center', width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: '40px', color: '#64748b' }}>Loading projects...</td>
                </tr>
              )}
              {!loading && projects.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '40px' }}>No projects found. Add one above!</td>
                </tr>
              )}
              {projects.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{p.title}</td>
                  <td style={{ color: '#475569' }}>{p.clientName}</td>
                  <td style={{ fontWeight: '500' }}>{p.location}</td>
                  <td>
                    <span className="service-chip">{p.category}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={p.showOnHome}
                      onChange={() => handleToggleShowOnHome(p)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <div className="action-btns" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        className="btn-card-edit"
                        onClick={() => setEditingProject(p)}
                        style={{
                          padding: '6px 12px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-card-delete"
                        onClick={() => handleDelete(p.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          borderRadius: '6px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          color: '#be123c'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProjectForm = ({ project, onSave, onCancel }) => {
  const [title, setTitle] = useState(project.title || '');
  const [clientName, setClientName] = useState(project.clientName || '');
  const [location, setLocation] = useState(project.location || '');
  const [description, setDescription] = useState(project.description || '');
  const [fullDetail, setFullDetail] = useState(project.fullDetail || '');
  const [benefitInput, setBenefitInput] = useState('');
  const [benefit, setBenefit] = useState(project.benefit || []);
  const [category, setCategory] = useState(project.category || 'CCTV Camera');
  const [image, setImage] = useState(project.image || '');
  const [showOnHome, setShowOnHome] = useState(project.showOnHome || false);

  const handleAddBenefit = (e) => {
    e.preventDefault();
    if (benefitInput.trim()) {
      setBenefit([...benefit, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (idx) => {
    setBenefit(benefit.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Project title is required');
      return;
    }
    onSave({
      ...project,
      title,
      clientName,
      location,
      description,
      fullDetail,
      benefit,
      category,
      image,
      showOnHome
    });
  };

  return (
    <div className="admin-form-container animate-fade-in" style={{ marginTop: '20px', background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
      <div className="form-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{project.id ? 'Edit Project' : 'New Project'}</h2>
        <button
          className="btn-back-link"
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: '#635bff', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}
        >
          ← Go Back

        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Project Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Oasis Hotel Apartment CCTV Installation"
            required
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
          />
        </div>

        <div className="form-three-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g. Amibara properties"
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder=" "
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', backgroundColor: 'white' }}
            >
              <option value="CCTV Camera">CCTV Camera</option>
              <option value="Alarm system">Alarm system</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Brief Description (For grid card view)</label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief overview of client problem and solution"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', resize: 'vertical' }}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Full Detail Description (For project details page)</label>
          <textarea
            rows={4}
            value={fullDetail}
            onChange={e => setFullDetail(e.target.value)}
            placeholder="Detailed write-up of engineering, equipment used, coverage..."
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', resize: 'vertical' }}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>Image Path / URL</label>
          <input
            type="text"
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder="e.g. /assets/service/oasis_hotel.png"
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
          />
        </div>

        <div className="benefits-form-section" style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
          <label style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', display: 'block', marginBottom: '12px' }}>Project Benefits & Key Deliverables</label>
          <div className="benefits-input-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={benefitInput}
              onChange={e => setBenefitInput(e.target.value)}
              placeholder="Add a benefit (e.g. 24/7 continuous recording)"
              style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
            <button
              type="button"
              onClick={handleAddBenefit}
              style={{
                padding: '0 20px',
                background: '#635bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px'
              }}
            >
              Add
            </button>
          </div>

          {benefit.length === 0 && <p className="no-sub-items" style={{ fontSize: '13px', color: '#64748b', margin: '10px 0 0 0' }}>No benefits added yet.</p>}

          <div className="benefits-tags-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
            {benefit.map((b, idx) => (
              <span key={idx} className="benefit-tag" style={{ background: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '600' }}>
                {b}
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(idx)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <input
            type="checkbox"
            id="showOnHomeInput"
            checked={showOnHome}
            onChange={e => setShowOnHome(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}

          />
          <label htmlFor="showOnHomeInput" style={{ cursor: 'pointer', fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
            Show this project on the Home page
          </label>
        </div>

        <div className="form-actions-row" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            style={{
              padding: '10px 24px',
              background: '#635bff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 4px 12px rgba(99,91,255,0.2)'
            }}
          >
            Save Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPage;
