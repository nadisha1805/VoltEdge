import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Package,
  Boxes,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Users,
  Percent,
  Loader2,
  FileText,
  Table,
  Award,
  Wrench,
  RotateCcw,
} from 'lucide-react';
import { getReportsSummary, getReportData } from '../../services/adminApi';

type ReportType =
  | 'products'
  | 'inventory'
  | 'low-stock'
  | 'out-of-stock'
  | 'sales'
  | 'customers'
  | 'warranties'
  | 'services'
  | 'returns'
  | 'coupons';

export const AdminReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('products');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [summary, setSummary] = useState<any>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const loadReport = async () => {
    try {
      setIsLoading(true);

      const params: any = {
        range: dateRange,
        start: startDate || undefined,
        end: endDate || undefined,
      };

      const [sum, data] = await Promise.all([
        getReportsSummary(params),
        getReportData(activeReport === 'low-stock' ? 'inventory?type=low' : activeReport === 'out-of-stock' ? 'inventory?type=out' : activeReport, params),
      ]);

      setSummary(sum);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [activeReport, dateRange, startDate, endDate]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('voltedge_admin_token');

      let endpoint = `/api/admin/reports/${activeReport === 'low-stock' ? 'inventory?type=low&' : activeReport === 'out-of-stock' ? 'inventory?type=out&' : `${activeReport}?`}format=csv&range=${dateRange}`;
      if (startDate) endpoint += `&start=${startDate}`;
      if (endDate) endpoint += `&end=${endDate}`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voltedge-${activeReport}-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to export report CSV: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const reportTabs = [
    { id: 'products', name: 'Product Report', icon: Package },
    { id: 'inventory', name: 'Inventory Report', icon: Boxes },
    { id: 'low-stock', name: 'Low Stock Report', icon: AlertTriangle },
    { id: 'out-of-stock', name: 'Out of Stock Report', icon: AlertTriangle },
    { id: 'sales', name: 'Sales & Revenue Report', icon: TrendingUp },
    { id: 'customers', name: 'Customer Report', icon: Users },
    { id: 'warranties', name: 'Warranty Claims Report', icon: Award },
    { id: 'services', name: 'Service Tickets Report', icon: Wrench },
    { id: 'returns', name: 'Returns & Refunds Report', icon: RotateCcw },
    { id: 'coupons', name: 'Coupons Performance', icon: Percent },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Business Intelligence & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export operational audits, inventory health metrics, and revenue ledgers.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={isExporting || reportData.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blueHover text-white text-xs font-bold shadow-md shadow-brand-blue/20 transition-all shrink-0 disabled:opacity-40"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Export Current Report (CSV)</span>
        </button>
      </div>

      {/* Date Filters & Report Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as ReportType)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Date Filter Range Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue outline-none text-slate-700 font-semibold"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Strip for Current Window */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Orders Fulfilled
            </span>
            <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
              {summary.paidOrdersCount}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Period Gross Sales
            </span>
            <span className="text-xl font-black text-brand-blue font-mono mt-1 block">
              ₹{summary.grossSales.toLocaleString()}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Average Order Value
            </span>
            <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">
              ₹{summary.avgOrderValue.toLocaleString()}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Stock Models
            </span>
            <span className="text-xl font-black text-purple-600 font-mono mt-1 block">
              {summary.productsCount}
            </span>
          </div>
        </div>
      )}

      {/* Report Data Table Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-brand-blue" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {reportTabs.find((t) => t.id === activeReport)?.name} Data Grid
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{reportData.length} records</span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
              Compiling database analytics...
            </div>
          ) : reportData.length > 0 ? (
            <table className="w-full text-left text-xs">
              {/* Dynamic Headers & Rows based on activeReport */}
              {activeReport === 'products' && (
                <>
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Brand / Category</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Cost Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Inventory Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportData.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.sku}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{r.name}</td>
                        <td className="py-3 px-4 text-slate-500">{r.brand} • {r.category}</td>
                        <td className="py-3 px-4 font-bold">₹{r.sellingPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-600">₹{r.costPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold">{r.stockQuantity}</td>
                        <td className="py-3 px-4 font-black text-brand-blue">
                          ₹{r.inventoryCostValuation.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {(activeReport === 'inventory' || activeReport === 'low-stock' || activeReport === 'out-of-stock') && (
                <>
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Stock Units</th>
                      <th className="py-3 px-4">Cost Price</th>
                      <th className="py-3 px-4">Valuation (Cost)</th>
                      <th className="py-3 px-4">Health Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportData.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold">{r.sku}</td>
                        <td className="py-3 px-4 font-semibold">{r.name}</td>
                        <td className="py-3 px-4 font-black">{r.stockQuantity}</td>
                        <td className="py-3 px-4">₹{r.costPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 font-black text-brand-blue">₹{r.valuation.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'In Stock'
                                ? 'bg-emerald-50 text-emerald-700'
                                : r.status === 'Low Stock'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeReport === 'sales' && (
                <>
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order Number</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Subtotal</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportData.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.orderNumber}</td>
                        <td className="py-3 px-4 text-slate-500">{r.date}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{r.customer}</td>
                        <td className="py-3 px-4">₹{r.subtotal.toLocaleString()}</td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">
                          {r.discount > 0 ? `-₹${r.discount.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-4 font-black text-slate-900">₹{r.total.toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-brand-blue">{r.paymentStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeReport === 'customers' && (
                <>
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Total Orders</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4">Average Spend</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportData.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{r.name}</td>
                        <td className="py-3 px-4 text-slate-600">{r.email}</td>
                        <td className="py-3 px-4 text-slate-500">{r.phone}</td>
                        <td className="py-3 px-4 font-bold">{r.totalOrders}</td>
                        <td className="py-3 px-4 font-black text-slate-900">₹{r.totalSpent.toLocaleString()}</td>
                        <td className="py-3 px-4 text-brand-blue font-semibold">₹{r.avgOrderValue.toLocaleString()}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          ) : (
            <div className="py-16 text-center text-slate-400">
              No matching report records found for the chosen date range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

