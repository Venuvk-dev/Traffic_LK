import React, { useState, useEffect } from 'react';
import { 
  Award, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Shield, 
  Clock, 
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  RefreshCw,
  Eye,
  Plus,
  Minus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface PointsHistory {
  date: string;
  change: number;
  reason: string;
  relatedFine?: {
    fineNumber: string;
    violation: {
      description: string;
    };
    amount: number;
    issuedDate: string;
  };
  previousPoints: number;
  newPoints: number;
}

interface PointsData {
  current: number;
  history: PointsHistory[];
  suspensions: Array<{
    startDate: string;
    endDate: string;
    reason: string;
    isActive: boolean;
    restoredDate?: string;
  }>;
  lastRestoration?: string;
  nextEligibleRestoration?: string;
}

interface PointsStatus {
  status: string;
  message: string;
  color: string;
  points: number;
}

const Points: React.FC = () => {
  const { user } = useAuth();
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [pointsStatus, setPointsStatus] = useState<PointsStatus | null>(null);
  const [licenseStatus, setLicenseStatus] = useState('active');
  const [canRestorePoints, setCanRestorePoints] = useState(false);
  const [nextEligibleRestoration, setNextEligibleRestoration] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PointsHistory | null>(null);

  // Admin states
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [lowPointsUsers, setLowPointsUsers] = useState<any[]>([]);
  const [suspendedUsers, setSuspendedUsers] = useState<any[]>([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [restoreForm, setRestoreForm] = useState({
    points: 10,
    reason: ''
  });
  const [adjustForm, setAdjustForm] = useState({
    pointsChange: 0,
    reason: ''
  });

  useEffect(() => {
    fetchPointsData();
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchPointsData = async () => {
    try {
      const response = await axios.get('/api/points/my-points');
      const data = response.data;
      
      setPointsData(data.points);
      setPointsStatus(data.status);
      setLicenseStatus(data.licenseStatus);
      setCanRestorePoints(data.canRestorePoints);
      setNextEligibleRestoration(data.nextEligibleRestoration);
    } catch (error) {
      console.error('Failed to fetch points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [statsResponse, lowPointsResponse, suspendedResponse] = await Promise.all([
        axios.get('/api/points/statistics'),
        axios.get('/api/points/low-points'),
        axios.get('/api/points/suspended')
      ]);

      setStatistics(statsResponse.data.statistics);
      setLowPointsUsers(lowPointsResponse.data.users);
      setSuspendedUsers(suspendedResponse.data.users);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  };

  const handleRestorePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/points/restore', {
        userId: selectedUser._id,
        points: restoreForm.points,
        reason: restoreForm.reason
      });
      
      setShowRestoreModal(false);
      setSelectedUser(null);
      setRestoreForm({ points: 10, reason: '' });
      fetchAdminData();
    } catch (error: any) {
      console.error('Failed to restore points:', error);
      alert(error.response?.data?.message || 'Failed to restore points');
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/points/adjust', {
        userId: selectedUser._id,
        pointsChange: adjustForm.pointsChange,
        reason: adjustForm.reason
      });
      
      setShowAdjustModal(false);
      setSelectedUser(null);
      setAdjustForm({ pointsChange: 0, reason: '' });
      fetchAdminData();
    } catch (error: any) {
      console.error('Failed to adjust points:', error);
      alert(error.response?.data?.message || 'Failed to adjust points');
    }
  };

  const getPointsColor = (points: number) => {
    if (points === 0) return 'text-red-600';
    if (points <= 20) return 'text-red-500';
    if (points <= 40) return 'text-orange-500';
    if (points <= 60) return 'text-yellow-500';
    return 'text-green-600';
  };

  const getPointsBackground = (points: number) => {
    if (points === 0) return 'bg-red-100';
    if (points <= 20) return 'bg-red-50';
    if (points <= 40) return 'bg-orange-50';
    if (points <= 60) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'suspended': return <XCircle className="h-6 w-6 text-red-600" />;
      case 'critical': return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case 'caution': return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'good': return <CheckCircle className="h-6 w-6 text-green-600" />;
      default: return <Shield className="h-6 w-6 text-gray-500" />;
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Award className="h-8 w-8 mr-3 text-emerald-600" />
              Driving Points System
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor your driving record and maintain your license status.
            </p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Users className="h-5 w-5 mr-2" />
              {showAdminPanel ? 'Hide' : 'Show'} Admin Panel
            </button>
          )}
        </div>

        {/* Current Points Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 ${getPointsBackground(pointsData?.current || 0)}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {pointsStatus && getStatusIcon(pointsStatus.status)}
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-900">Current Points</h2>
                    <p className="text-gray-600">Your driving record status</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-6xl font-bold ${getPointsColor(pointsData?.current || 0)}`}>
                    {pointsData?.current || 0}
                  </div>
                  <div className="text-gray-500 text-sm">out of 100</div>
                </div>
              </div>

              {/* Points Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Points Level</span>
                  <span>{pointsData?.current || 0}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      (pointsData?.current || 0) === 0 ? 'bg-red-600' :
                      (pointsData?.current || 0) <= 20 ? 'bg-red-500' :
                      (pointsData?.current || 0) <= 40 ? 'bg-orange-500' :
                      (pointsData?.current || 0) <= 60 ? 'bg-yellow-500' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${pointsData?.current || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Message */}
              {pointsStatus && (
                <div className={`p-4 rounded-lg border-l-4 ${
                  pointsStatus.status === 'suspended' ? 'bg-red-50 border-red-500' :
                  pointsStatus.status === 'critical' ? 'bg-red-50 border-red-400' :
                  pointsStatus.status === 'warning' ? 'bg-orange-50 border-orange-400' :
                  pointsStatus.status === 'caution' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-green-50 border-green-400'
                }`}>
                  <h3 className={`font-semibold ${
                    pointsStatus.status === 'suspended' ? 'text-red-800' :
                    pointsStatus.status === 'critical' ? 'text-red-700' :
                    pointsStatus.status === 'warning' ? 'text-orange-700' :
                    pointsStatus.status === 'caution' ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    Status: {pointsStatus.status.charAt(0).toUpperCase() + pointsStatus.status.slice(1)}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    pointsStatus.status === 'suspended' ? 'text-red-700' :
                    pointsStatus.status === 'critical' ? 'text-red-600' :
                    pointsStatus.status === 'warning' ? 'text-orange-600' :
                    pointsStatus.status === 'caution' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {pointsStatus.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* License Status & Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-emerald-600" />
                License Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    licenseStatus === 'active' ? 'bg-green-100 text-green-800' :
                    licenseStatus === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {licenseStatus.charAt(0).toUpperCase() + licenseStatus.slice(1)}
                  </span>
                </div>
                
                {licenseStatus === 'suspended' && pointsData?.suspensions && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Active Suspension</h4>
                    {pointsData.suspensions
                      .filter(s => s.isActive)
                      .map((suspension, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <p><strong>Start:</strong> {new Date(suspension.startDate).toLocaleDateString()}</p>
                          <p><strong>End:</strong> {new Date(suspension.endDate).toLocaleDateString()}</p>
                          <p><strong>Reason:</strong> {suspension.reason}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2 text-emerald-600" />
                Points Restoration
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Eligible:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    canRestorePoints ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {canRestorePoints ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {!canRestorePoints && nextEligibleRestoration && (
                  <div className="text-sm text-gray-600">
                    <p><strong>Next Eligible:</strong></p>
                    <p>{new Date(nextEligibleRestoration).toLocaleDateString()}</p>
                  </div>
                )}
                
                {pointsData?.lastRestoration && (
                  <div className="text-sm text-gray-600">
                    <p><strong>Last Restoration:</strong></p>
                    <p>{new Date(pointsData.lastRestoration).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Points History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                Points History
              </h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {showHistory ? 'Hide' : 'Show'} Details
              </button>
            </div>
          </div>
          
          {showHistory && (
            <div className="p-6">
              {pointsData?.history && pointsData.history.length > 0 ? (
                <div className="space-y-4">
                  {pointsData.history
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-4 ${
                            item.change > 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {item.change > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.change > 0 ? '+' : ''}{item.change} points
                            </p>
                            <p className="text-sm text-gray-600">{item.reason}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.date).toLocaleDateString()} • 
                              {item.previousPoints} → {item.newPoints} points
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.relatedFine && (
                            <button
                              onClick={() => setSelectedHistoryItem(item)}
                              className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <span className={`text-lg font-bold ${
                            item.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.change > 0 ? '+' : ''}{item.change}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No points history yet. Keep driving safely!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Panel */}
        {user?.role === 'admin' && showAdminPanel && (
          <div className="space-y-8">
            {/* Statistics */}
            {statistics && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Points System Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{statistics.totalUsers || 0}</div>
                    <div className="text-sm text-gray-600">Total Citizens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">{Math.round(statistics.averagePoints || 0)}</div>
                    <div className="text-sm text-gray-600">Average Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{statistics.suspendedLicenses || 0}</div>
                    <div className="text-sm text-gray-600">Suspended Licenses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{statistics.goodStanding || 0}</div>
                    <div className="text-sm text-gray-600">Good Standing</div>
                  </div>
                </div>
              </div>
            )}

            {/* Low Points Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Users with Low Points (≤20)</h2>
              {lowPointsUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lowPointsUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-lg font-bold ${getPointsColor(user.drivingPoints.current)}`}>
                              {user.drivingPoints.current}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.licenseStatus === 'active' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {user.licenseStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowRestoreModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowAdjustModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No users with low points</p>
              )}
            </div>
          </div>
        )}

        {/* History Item Modal */}
        {selectedHistoryItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Points History Details</h3>
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Points Change</label>
                    <p className={`text-lg font-bold ${
                      selectedHistoryItem.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedHistoryItem.change > 0 ? '+' : ''}{selectedHistoryItem.change}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{new Date(selectedHistoryItem.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <p className="text-gray-900">{selectedHistoryItem.reason}</p>
                </div>
                
                {selectedHistoryItem.relatedFine && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Related Fine</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Fine Number:</strong> {selectedHistoryItem.relatedFine.fineNumber}</p>
                      <p><strong>Violation:</strong> {selectedHistoryItem.relatedFine.violation.description}</p>
                      <p><strong>Amount:</strong> Rs. {selectedHistoryItem.relatedFine.amount.toLocaleString()}</p>
                      <p><strong>Date:</strong> {new Date(selectedHistoryItem.relatedFine.issuedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Points Summary</h4>
                  <p className="text-blue-800 text-sm">
                    Points changed from <strong>{selectedHistoryItem.previousPoints}</strong> to <strong>{selectedHistoryItem.newPoints}</strong>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restore Points Modal */}
        {showRestoreModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Restore Points</h3>
              
              <form onSubmit={handleRestorePoints} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <p className="text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-sm text-gray-600">Current Points: {selectedUser.drivingPoints.current}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points to Restore</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={restoreForm.points}
                    onChange={(e) => setRestoreForm({...restoreForm, points: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={restoreForm.reason}
                    onChange={(e) => setRestoreForm({...restoreForm, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRestoreModal(false);
                      setSelectedUser(null);
                      setRestoreForm({ points: 10, reason: '' });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Restore Points
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Adjust Points Modal */}
        {showAdjustModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Adjust Points</h3>
              
              <form onSubmit={handleAdjustPoints} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <p className="text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-sm text-gray-600">Current Points: {selectedUser.drivingPoints.current}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points Change</label>
                  <input
                    type="number"
                    min="-100"
                    max="100"
                    value={adjustForm.pointsChange}
                    onChange={(e) => setAdjustForm({...adjustForm, pointsChange: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Positive to add, negative to deduct"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use positive numbers to add points, negative to deduct
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({...adjustForm, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustModal(false);
                      setSelectedUser(null);
                      setAdjustForm({ pointsChange: 0, reason: '' });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Adjust Points
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Points;