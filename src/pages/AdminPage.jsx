import React, { useState, useEffect } from 'react';
import { Eye, Trash2, LogOut, Search, ShieldAlert, Filter, Calendar, Users, FileText, Database, Lock, X, ChevronDown, Bell, Download, CheckSquare, Square, ArrowLeft, Sheet } from 'lucide-react';
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

  // Inquiries data
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [fetchError, setFetchError] = useState('');

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
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status.');
      }
    } catch (err) {
      console.error('Status update error:', err);
      // Revert on failure
      fetchInquiries();
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
    'Num Sensors', 'Alarm System Type', 'Message', 'Request Date'
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
    item.footage_duration || '',
    item.cctv_other || '',
    item.alarm_property_type || '',
    item.num_sensors || '',
    item.alarm_system_type || '',
    item.message || '',
    formatDate(item.created_at),
  ];

  // ── Excel Export ─────────────────────────────────────────────────────────────
  const downloadExcel = (rows, filename) => {
    if (!rows || rows.length === 0) { alert('No records to export.'); return; }
    const wsData = [EXPORT_HEADERS, ...rows.map(inquiryToRow)];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // Column widths
    ws['!cols'] = [10, 18, 18, 22, 22, 16, 12, 10, 20, 20, 12, 12, 16, 18, 20, 12, 20, 30, 20].map(w => ({ wch: w }));
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
    const hasCctv = item.num_cameras || item.footage_duration || item.cctv_other;
    const hasAlarm = item.alarm_property_type || item.num_sensors || item.alarm_system_type;
    const hasCustom = item.custom_inquiry;

    if (hasCctv || hasAlarm || hasCustom) {
      y = sectionTitle('SERVICE SPECIFICATIONS', y);

      const specRows = [];
      if (hasCctv) {
        specRows.push([{ content: 'CCTV Surveillance System', colSpan: 2, styles: { fontStyle: 'bold', textColor: [226, 88, 34], fillColor: [255, 248, 245], fontSize: 8.5, cellPadding: { top: 4, bottom: 4, left: 6, right: 4 } } }]);
        if (item.num_cameras) specRows.push(['Number of Cameras', item.num_cameras]);
        if (item.footage_duration) specRows.push(['Footage Retention Duration', item.footage_duration]);
        if (item.cctv_other) specRows.push(['Special Surveillance Needs', item.cctv_other]);
      }
      if (hasAlarm) {
        specRows.push([{ content: 'Alarm Intrusion System', colSpan: 2, styles: { fontStyle: 'bold', textColor: [124, 58, 237], fillColor: [250, 245, 255], fontSize: 8.5, cellPadding: { top: 4, bottom: 4, left: 6, right: 4 } } }]);
        if (item.alarm_property_type) specRows.push(['Property Profile', item.alarm_property_type]);
        if (item.num_sensors) specRows.push(['Number of Protection Sensors', item.num_sensors]);
        if (item.alarm_system_type) specRows.push(['Preferred System Brand/Type', item.alarm_system_type]);
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
                <Lock size={30} />
              </div>
              <h2>SafeHive Admin</h2>
              <p>Secure login area for safety operations management.</p>

              {loginError && (
                <div className="login-error-alert">
                  <ShieldAlert size={18} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} />
                  {loginError}
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
              </form>
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
                    {(selectedInquiry.num_cameras || selectedInquiry.footage_duration || selectedInquiry.cctv_other) ? (
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--primary)', marginBottom: '8px' }}>🎥 CCTV Surveillance System</div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Number of Cameras</span>
                          <span className="modal-spec-value">{selectedInquiry.num_cameras || 'Not specified'}</span>
                        </div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Footage Retention Duration</span>
                          <span className="modal-spec-value">{selectedInquiry.footage_duration || 'Not specified'}</span>
                        </div>
                        <div className="modal-spec-row">
                          <span className="modal-spec-label">Special surveillance needs</span>
                          <span className="modal-spec-value">{selectedInquiry.cctv_other || 'None'}</span>
                        </div>
                      </div>
                    ) : null}

                    {/* Alarm system specifications */}
                    {(selectedInquiry.alarm_property_type || selectedInquiry.num_sensors || selectedInquiry.alarm_system_type) ? (
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
                    {!(selectedInquiry.num_cameras || selectedInquiry.footage_duration || selectedInquiry.cctv_other || selectedInquiry.alarm_property_type || selectedInquiry.num_sensors || selectedInquiry.alarm_system_type || selectedInquiry.custom_inquiry) && (
                      <div className="text-muted text-center" style={{ fontSize: '13px' }}>
                        No technical specs provided. Client requested a general security consultation.
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Details */}
                {selectedInquiry.message && (
                  <div className="modal-section" style={{ marginBottom: 0 }}>
                    <div className="modal-section-title">Client Message</div>
                    <div className="modal-message-box">
                      {selectedInquiry.message}
                    </div>
                  </div>
                )}
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
          </div>

        )};

      </div>

    </div >

  )
}

export default AdminPage;
  