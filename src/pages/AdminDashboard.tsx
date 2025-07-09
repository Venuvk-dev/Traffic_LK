import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Shield, 
  BarChart3,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  Plus,
  Award,
  Bell,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

interface AdminStats {
  totalUsers: number;
  totalVehicles: number;
  totalFines: number;
  totalRevenue: number;
  pendingDisputes: number;
  activePoliceOfficers: number;
  monthlyGrowth: {
    users: number;
    revenue: number;
    fines: number;
  };
  recentActivity: any[];
  topViolations: any[];
  districtStats: any[];
  paymentStats: {
    totalPaid: number;
    totalPending: number;
    successRate: number;
  };
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  drivingPoints?: {
    current: number;
  };
  licenseStatus?: string;
}

interface Fine {
  _id: string;
  fineNumber: string;
  vehicle: {
    registrationNumber: string;
    make: string;
    model: string;
  };
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  violation: {
    type: string;
    description: string;
    location: string;
  };
  amount: number;
  status: string;
  issuedDate: string;
  issuedBy: {
    firstName: string;
    lastName: string;
  };
  pointsDeducted?: number;
}

interface Dispute {
  _id: string;
  fine: {
    fineNumber: string;
    amount: number;
  };
  disputant: {
    firstName: string;
    lastName: string;
  };
  status: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalVehicles: 0,
    totalFines: 0,
    totalRevenue: 0,
    pendingDisputes: 0,
    activePoliceOfficers: 0,
    monthlyGrowth: { users: 0, revenue: 0, fines: 0 },
    recentActivity: [],
    topViolations: [],
    districtStats: [],
    paymentStats: { totalPaid: 0, totalPending: 0, successRate: 0 }
  });
  const [users, setUsers] = useState<User[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [usersResponse, finesResponse, disputesResponse] = await Promise.all([
        axios.get('/api/users').catch(() => ({ data: { users: [] } })),
        axios.get('/api/fines').catch(() => ({ data: { fines: [] } })),
        axios.get('/api/disputes').catch(() => ({ data: { disputes: [] } }))
      ]);

      const usersData = usersResponse.data.users || [];
      const finesData = finesResponse.data.fines || [];
      const disputesData = disputesResponse.data.disputes || [];

      setUsers(usersData);
      setFines(finesData);
      setDisputes(disputesData);

      // Calculate comprehensive stats
      const totalRevenue = finesData
        .filter((fine: any) => fine.status === 'paid')
        .reduce((sum: number, fine: any) => sum + (fine.amount || 0), 0);

      const totalPending = finesData
        .filter((fine: any) => fine.status === 'pending')
        .reduce((sum: number, fine: any) => sum + (fine.amount || 0), 0);

      const pendingDisputes = disputesData.filter((dispute: any) => 
        dispute.status === 'pending' || dispute.status === 'under_review'
      ).length;

      const activePoliceOfficers = usersData.filter((user: any) => 
        user.role === 'police' && user.isActive
      ).length;

      // Calculate monthly growth (based on creation dates)
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisMonthUsers = usersData.filter((user: any) => 
        new Date(user.createdAt) >= thisMonth
      ).length;
      
      const lastMonthUsers = usersData.filter((user: any) => {
        const createdDate = new Date(user.createdAt);
        return createdDate >= lastMonth && createdDate < thisMonth;
      }).length;

      const thisMonthFines = finesData.filter((fine: any) => 
        new Date(fine.issuedDate) >= thisMonth
      ).length;
      
      const lastMonthFines = finesData.filter((fine: any) => {
        const issuedDate = new Date(fine.issuedDate);
        return issuedDate >= lastMonth && issuedDate < thisMonth;
      }).length;

      const thisMonthRevenue = finesData
        .filter((fine: any) => fine.paidDate && new Date(fine.paidDate) >= thisMonth)
        .reduce((sum: number, fine: any) => sum + (fine.amount || 0), 0);
      
      const lastMonthRevenue = finesData
        .filter((fine: any) => {
          if (!fine.paidDate) return false;
          const paidDate = new Date(fine.paidDate);
          return paidDate >= lastMonth && paidDate < thisMonth;
        })
        .reduce((sum: number, fine: any) => sum + (fine.amount || 0), 0);

      const monthlyGrowth = {
        users: lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers * 100) : 0,
        fines: lastMonthFines > 0 ? ((thisMonthFines - lastMonthFines) / lastMonthFines * 100) : 0,
        revenue: lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0
      };

      // Top violations analysis
      const violationCounts = finesData.reduce((acc: any, fine: any) => {
        const type = fine.violation?.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const topViolations = Object.entries(violationCounts)
        .map(([type, count]) => ({ 
          type: type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1), 
          count 
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      // District stats (based on violation locations)
      const locationCounts = finesData.reduce((acc: any, fine: any) => {
        const location = fine.violation?.location || 'Unknown';
        const district = location.split(',')[0]?.trim() || 'Unknown';
        if (!acc[district]) {
          acc[district] = { fines: 0, revenue: 0 };
        }
        acc[district].fines += 1;
        if (fine.status === 'paid') {
          acc[district].revenue += fine.amount || 0;
        }
        return acc;
      }, {});

      const districtStats = Object.entries(locationCounts)
        .map(([district, data]: [string, any]) => ({
          district,
          fines: data.fines,
          revenue: data.revenue
        }))
        .sort((a, b) => b.fines - a.fines)
        .slice(0, 5);

      // Recent activity (last 10 fines)
      const recentActivity = finesData
        .sort((a: any, b: any) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())
        .slice(0, 10);

      // Payment statistics
      const totalPaidFines = finesData.filter((fine: any) => fine.status === 'paid').length;
      const totalFinesCount = finesData.length;
      const successRate = totalFinesCount > 0 ? (totalPaidFines / totalFinesCount * 100) : 0;

      setStats({
        totalUsers: usersData.length,
        totalVehicles: 0, // Would need separate API call for vehicles
        totalFines: finesData.length,
        totalRevenue,
        pendingDisputes,
        activePoliceOfficers,
        monthlyGrowth,
        recentActivity,
        topViolations,
        districtStats,
        paymentStats: {
          totalPaid: totalRevenue,
          totalPending,
          successRate
        }
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/api/users/${userId}/status`, { isActive: !currentStatus });
      fetchAdminData();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleFineStatusUpdate = async (fineId: string, newStatus: string) => {
    try {
      await axios.patch(`/api/fines/${fineId}/status`, { status: newStatus });
      fetchAdminData();
    } catch (error) {
      console.error('Failed to update fine status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const filteredFines = fines.filter(fine => {
    const matchesSearch = 
      fine.fineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.owner.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || fine.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'disputed': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'police': return 'text-blue-600 bg-blue-100';
      case 'citizen': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 mr-3 text-emerald-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                System administration and data management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('fines')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'fines'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Fines ({fines.length})
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'disputes'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Disputes ({disputes.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats.monthlyGrowth.users.toFixed(1)}% this month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Fines</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalFines.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm ${stats.monthlyGrowth.fines >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.monthlyGrowth.fines >= 0 ? '+' : ''}{stats.monthlyGrowth.fines.toFixed(1)}% this month
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats.monthlyGrowth.revenue.toFixed(1)}% this month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Police</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activePoliceOfficers}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">Officers on duty</span>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Disputes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingDisputes}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">Awaiting review</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.paymentStats.successRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">Fines paid on time</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.paymentStats.totalPending)}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-gray-600">Awaiting payment</span>
                </div>
              </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Violations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Violations</h3>
                <div className="space-y-4">
                  {stats.topViolations.length > 0 ? (
                    stats.topViolations.map((violation: any, index) => (
                      <div key={violation.type} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-emerald-600">{index + 1}</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {violation.type}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{violation.count} cases</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No violation data available</p>
                  )}
                </div>
              </div>

              {/* District Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Locations by Fines</h3>
                <div className="space-y-4">
                  {stats.districtStats.length > 0 ? (
                    stats.districtStats.map((district: any) => (
                      <div key={district.district} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{district.district}</p>
                          <p className="text-sm text-gray-600">{district.fines} fines</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(district.revenue)}</p>
                          <p className="text-sm text-gray-600">Revenue</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No location data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((fine: any) => (
                    <div key={fine._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full mr-4">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Fine {fine.fineNumber} - {fine.vehicle?.registrationNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            {fine.violation?.description} • {formatCurrency(fine.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(fine.issuedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fine.status)}`}>
                        {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="citizen">Citizens</option>
                    <option value="police">Police</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUserStatusToggle(user._id, user.isActive)}
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                user.isActive
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fines Tab */}
        {activeTab === 'fines' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search fines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="disputed">Disputed</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fines Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fine Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issued By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFines.map((fine) => (
                      <tr key={fine._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {fine.fineNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {fine.vehicle.registrationNumber} - {fine.violation.description}
                            </div>
                            <div className="text-xs text-gray-400">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {fine.violation.location}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {fine.owner.firstName} {fine.owner.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{fine.owner.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(fine.amount)}
                          </div>
                          {fine.pointsDeducted && (
                            <div className="text-xs text-red-600">
                              -{fine.pointsDeducted} points
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fine.status)}`}>
                            {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {fine.issuedBy.firstName} {fine.issuedBy.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <select
                              value={fine.status}
                              onChange={(e) => handleFineStatusUpdate(fine._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="disputed">Disputed</option>
                              <option value="overdue">Overdue</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredFines.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No fines found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispute Management</h3>
              <div className="space-y-4">
                {disputes.length > 0 ? (
                  disputes.map((dispute) => (
                    <div key={dispute._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Fine {dispute.fine.fineNumber}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Disputed by: {dispute.disputant.firstName} {dispute.disputant.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Amount: {formatCurrency(dispute.fine.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Filed: {new Date(dispute.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dispute.status)}`}>
                          {dispute.status.replace('_', ' ').charAt(0).toUpperCase() + dispute.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No disputes found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Chart Placeholder */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Revenue Trend</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would go here</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Current Revenue: {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Violation Types Chart Placeholder */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Violation Distribution</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Pie chart would go here</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Total Violations: {stats.totalFines}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Database</h4>
                  <p className="text-sm text-green-600">Operational</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.totalUsers + stats.totalFines} records</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Payment Gateway</h4>
                  <p className="text-sm text-green-600">Operational</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.paymentStats.successRate.toFixed(1)}% success rate</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">API Services</h4>
                  <p className="text-sm text-green-600">Operational</p>
                  <p className="text-xs text-gray-500 mt-1">All endpoints active</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;