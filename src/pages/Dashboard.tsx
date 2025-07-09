import React, { useState, useEffect } from 'react';
import { 
  Car, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  TrendingUp,
  Calendar,
  Award,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface DashboardStats {
  activeFines: number;
  totalAmount: number;
  paidThisYear: number;
  pendingDisputes: number;
  recentFines: any[];
  vehicles: number;
  drivingPoints: {
    current: number;
    status: string;
    message: string;
    color: string;
  };
  licenseStatus: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeFines: 0,
    totalAmount: 0,
    paidThisYear: 0,
    pendingDisputes: 0,
    recentFines: [],
    vehicles: 0,
    drivingPoints: {
      current: 100,
      status: 'good',
      message: 'Your driving record is in good standing',
      color: 'green'
    },
    licenseStatus: 'active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [finesResponse, vehiclesResponse, disputesResponse, pointsResponse] = await Promise.all([
        axios.get('/api/fines/my-fines'),
        axios.get('/api/vehicles/my-vehicles'),
        axios.get('/api/disputes/my-disputes'),
        axios.get('/api/points/my-points')
      ]);

      const fines = finesResponse.data.fines || [];
      const vehicles = vehiclesResponse.data.vehicles || [];
      const disputes = disputesResponse.data.disputes || [];
      const pointsData = pointsResponse.data;

      const activeFines = fines.filter((fine: any) => fine.status === 'pending').length;
      const totalAmount = fines
        .filter((fine: any) => fine.status === 'pending')
        .reduce((sum: number, fine: any) => sum + fine.amount, 0);
      
      const currentYear = new Date().getFullYear();
      const paidThisYear = fines
        .filter((fine: any) => 
          fine.status === 'paid' && 
          new Date(fine.paidDate).getFullYear() === currentYear
        )
        .reduce((sum: number, fine: any) => sum + fine.amount, 0);

      const pendingDisputes = disputes.filter((dispute: any) => 
        dispute.status === 'pending' || dispute.status === 'under_review'
      ).length;

      setStats({
        activeFines,
        totalAmount,
        paidThisYear,
        pendingDisputes,
        recentFines: fines.slice(0, 5),
        vehicles: vehicles.length,
        drivingPoints: pointsData.status || {
          current: 100,
          status: 'good',
          message: 'Your driving record is in good standing',
          color: 'green'
        },
        licenseStatus: pointsData.licenseStatus || 'active'
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'disputed': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPointsColor = (points: number) => {
    if (points === 0) return 'text-red-600';
    if (points <= 20) return 'text-red-500';
    if (points <= 40) return 'text-orange-500';
    if (points <= 60) return 'text-yellow-500';
    return 'text-green-600';
  };

  const getPointsIcon = (status: string) => {
    switch (status) {
      case 'suspended': return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'critical': return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case 'caution': return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'good': return <CheckCircle className="h-6 w-6 text-green-600" />;
      default: return <Award className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your traffic fine status and recent activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Fines</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeFines}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Total Amount: Rs. {stats.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Driving Points</p>
                <p className={`text-2xl font-bold ${getPointsColor(stats.drivingPoints.current)}`}>
                  {stats.drivingPoints.current}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                {getPointsIcon(stats.drivingPoints.status)}
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/points"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View Details →
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid This Year</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {stats.paidThisYear.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-green-600">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                All payments up to date
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Disputes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDisputes}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Under review by authorities
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Registered Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{stats.vehicles}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <Car className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                All vehicles registered
              </p>
            </div>
          </div>
        </div>

        {/* License Status Alert */}
        {stats.licenseStatus === 'suspended' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">License Suspended</h3>
                <p className="text-red-700">
                  Your driving license has been suspended due to zero points. You cannot legally drive until your license is restored.
                </p>
                <Link 
                  to="/points" 
                  className="text-red-600 hover:text-red-800 font-medium mt-2 inline-block"
                >
                  View Points Details →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Points Status Alert */}
        {stats.drivingPoints.current <= 20 && stats.drivingPoints.current > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-orange-800">Low Points Warning</h3>
                <p className="text-orange-700">
                  You have {stats.drivingPoints.current} driving points remaining. Drive carefully to avoid license suspension.
                </p>
                <Link 
                  to="/points" 
                  className="text-orange-600 hover:text-orange-800 font-medium mt-2 inline-block"
                >
                  View Points History →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                Recent Fines
              </h2>
            </div>
            <div className="p-6">
              {stats.recentFines.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentFines.map((fine: any) => (
                    <div key={fine._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {fine.violation.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {fine.vehicle?.registrationNumber} • {fine.violation.location}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(fine.issuedDate).toLocaleDateString()}
                          {fine.pointsDeducted && (
                            <span className="ml-2 text-red-600 font-medium">
                              -{fine.pointsDeducted} points
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          Rs. {fine.amount.toLocaleString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fine.status)}`}>
                          {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No recent fines. Keep up the good driving!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                Quick Actions
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Link 
                  to="/fines"
                  className="w-full bg-emerald-500 text-white p-4 rounded-lg hover:bg-emerald-600 transition-colors text-left block"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Pay Outstanding Fines</p>
                      <p className="text-sm text-emerald-100">
                        {stats.activeFines} fines pending payment
                      </p>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/points"
                  className="w-full bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors text-left block"
                >
                  <div className="flex items-center">
                    <Award className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">View Driving Points</p>
                      <p className="text-sm text-blue-100">
                        Current: {stats.drivingPoints.current}/100 points
                      </p>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/vehicles"
                  className="w-full bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors text-left block"
                >
                  <div className="flex items-center">
                    <Car className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">Manage Vehicles</p>
                      <p className="text-sm text-purple-100">
                        {stats.vehicles} vehicles registered
                      </p>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/disputes"
                  className="w-full bg-gray-500 text-white p-4 rounded-lg hover:bg-gray-600 transition-colors text-left block"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">File a Dispute</p>
                      <p className="text-sm text-gray-100">
                        Contest a traffic fine
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;