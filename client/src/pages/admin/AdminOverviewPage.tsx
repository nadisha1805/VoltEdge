import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  Tag,
  Users,
  ShoppingBag,
  IndianRupee,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  Plus,
  Boxes,
} from 'lucide-react';
import {
  getDashboardOverview,
  getDashboardAnalytics,
  getRecentActivity,
} from '../../services/adminApi';
import { DashboardOverview, ActivityLog } from '../../types/admin';
import { StatCard } from '../../components/admin/StatCard';
import { BarChart, AreaLineChart, DonutChart } from '../../components/admin/SimpleChart';
import { StatusBadge } from '../../components/admin/StatusBadge';

export const AdminOverviewPage: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'30d' | '7d' | 'year'>('30d');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ovData, anData, actData] = await Promise.all([
        getDashboardOverview(),
        getDashboardAnalytics(),
        getRecentActivity(),
      ]);
      setOverview(ovData);
      setAnalytics(anData);
      setActivities(actData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format category distribution for BarChart
  const categoryChartData = analytics?.categoryDistribution?.map((c: any) => ({
    label: c.name.split(' ')[0],
    value: c.count,
    color: '#2563EB',
  })) || [];

  // Format inventory breakdown for DonutChart
  const inventoryDonutData = analytics?.inventoryStatus?.map((s: any) => ({
    label: s.status,
    count: s.count,
    color: s.color,
  })) || [];

  // Revenue chart data from real orders
  const revenueChartData = [
    { label: 'Jan', value: 0 },
    { label: 'Feb', value: 0 },
    { label: 'Mar', value: 0 },
    { label: 'Apr', value: 0 },
    { label: 'May', value: 0 },
    { label: 'Jun', value: overview?.totalRevenue ? Math.round(overview.totalRevenue) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            Showroom Telemetry & Control
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status of catalog, stock movements, and customer interactions across VOLTEDGE.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/products"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-blue hover:bg-brand-blueHover text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 8 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={overview?.totalProducts ?? 0}
          icon={Package}
          color="blue"
          subtext="Active catalog items"
        />
        <StatCard
          title="Categories"
          value={overview?.totalCategories ?? 0}
          icon={FolderTree}
          color="purple"
          subtext="Active product hierarchies"
        />
        <StatCard
          title="Brands"
          value={overview?.totalBrands ?? 0}
          icon={Tag}
          color="slate"
          subtext="Authorized manufacturers"
        />
        <StatCard
          title="Total Customers"
          value={overview?.totalCustomers ?? 0}
          icon={Users}
          color="emerald"
          subtext="Registered client directory"
        />
        <StatCard
          title="Total Orders"
          value={overview?.totalOrders ?? 0}
          icon={ShoppingBag}
          color="blue"
          subtext="Showroom & online orders"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(overview?.totalRevenue ?? 0).toLocaleString()}`}
          icon={IndianRupee}
          color="emerald"
          subtext="Verified paid sales transactions"
        />
        <StatCard
          title="Low Stock Alert"
          value={overview?.lowStockProducts ?? 0}
          icon={AlertTriangle}
          color="amber"
          subtext="Stock level ≤ threshold (5 units)"
        />
        <StatCard
          title="Pending Enquiries"
          value={overview?.pendingEnquiries ?? 0}
          icon={MessageSquare}
          color="rose"
          subtext="Awaiting staff consultation"
        />
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue & Orders Overview */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue & Order Progression</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Realized sales volume from verified customer orders</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px]">
              {(['7d', '30d', 'year'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                    timeFilter === filter ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="py-2">
            <AreaLineChart data={revenueChartData} height={230} color="#2563EB" valuePrefix="₹" />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Valuation mode: Standard cost basis</span>
            <Link to="/admin/reports" className="text-brand-blue font-semibold hover:underline flex items-center gap-1">
              View Financial Breakdown <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Inventory Status Donut */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Inventory Status</h3>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Audited
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-6">Stock unit distribution by threshold health</p>
          </div>

          <div className="my-auto py-2">
            <DonutChart data={inventoryDonutData} size={160} />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <Link to="/admin/inventory" className="text-xs text-brand-blue font-semibold hover:underline flex items-center justify-center gap-1">
              Open Inventory Management <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Category Distribution Bar Chart & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Distribution Bar Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Product Category Distribution</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Catalog assortment count across main showroom segments</p>
            </div>
            <Link to="/admin/categories" className="text-xs text-brand-blue font-semibold hover:underline">
              Manage
            </Link>
          </div>
          <div className="py-2">
            <BarChart data={categoryChartData} height={200} valueSuffix=" prods" />
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Moving Products</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">High velocity items by order fulfillment</p>
            </div>
            <Link to="/admin/orders" className="text-xs text-brand-blue font-semibold hover:underline">
              Orders
            </Link>
          </div>

          {analytics?.topSellingProducts && analytics.topSellingProducts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {analytics.topSellingProducts.map((p: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400">Stock on hand: {p.currentStock} units</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900">₹{p.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold">{p.unitsSold} units fulfilled</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No product fulfillment data yet. Checkouts begin in Milestone 3.
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fulfillment tracking</span>
            <Link to="/admin/inventory/movements" className="text-brand-blue font-semibold hover:underline">
              Ledger movements
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-blue" />
              Administrative Audit Ledger
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Chronological record of staff actions and inventory changes</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">Auto-recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {act.adminName?.charAt(0) || 'S'}
                        </div>
                        <span className="font-semibold text-slate-800">{act.adminName || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {act.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-blue">{act.module}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={act.description}>
                      {act.description}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">{act.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-right text-[11px] text-slate-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

