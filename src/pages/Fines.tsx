import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CreditCard, 
  FileText, 
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Car,
  Shield,
  Leaf,
  Plus
} from 'lucide-react';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';

interface Fine {
  _id: string;
  fineNumber: string;
  vehicle: {
    registrationNumber: string;
    make: string;
    model: string;
  };
  violation: {
    type: string;
    description: string;
    location: string;
  };
  amount: number;
  status: string;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
}

interface ExpiredItem {
  _id: string;
  type: 'insurance' | 'license' | 'emission';
  vehicle: {
    registrationNumber: string;
    make: string;
    model: string;
  };
  expiryDate: string;
  amount: number;
  description: string;
}

interface Violation {
  code: string;
  type: string;
  description: string;
  baseAmount: number;
  category: string;
}

const Fines: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [expiredItems, setExpiredItems] = useState<ExpiredItem[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [violationForm, setViolationForm] = useState({
    vehicleId: '',
    violationCode: '',
    location: '',
    description: '',
    amount: 0
  });

  useEffect(() => {
    fetchFines();
    fetchExpiredItems();
    fetchViolations();
    fetchVehicles();
  }, []);

  const fetchFines = async () => {
    try {
      const response = await axios.get('/api/fines/my-fines');
      setFines(response.data.fines || []);
    } catch (error) {
      console.error('Failed to fetch fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiredItems = async () => {
    try {
      const [vehiclesResponse, emissionResponse] = await Promise.all([
        axios.get('/api/vehicles/my-vehicles'),
        axios.get('/api/emissions/vehicles-needing-tests')
      ]);

      const vehicles = vehiclesResponse.data.vehicles || [];
      const vehiclesNeedingTests = emissionResponse.data.vehicles || [];
      const expired: ExpiredItem[] = [];

      // Check for expired insurance and licenses
      vehicles.forEach((vehicle: any) => {
        const now = new Date();
        
        // Check insurance expiry
        if (vehicle.insurance?.expiryDate) {
          const insuranceExpiry = new Date(vehicle.insurance.expiryDate);
          if (insuranceExpiry < now) {
            expired.push({
              _id: vehicle._id,
              type: 'insurance',
              vehicle: {
                registrationNumber: vehicle.registrationNumber,
                make: vehicle.make,
                model: vehicle.model
              },
              expiryDate: vehicle.insurance.expiryDate,
              amount: 15000, // Standard insurance renewal fee
              description: 'Vehicle insurance renewal required'
            });
          }
        }

        // Check license expiry
        if (vehicle.license?.expiryDate) {
          const licenseExpiry = new Date(vehicle.license.expiryDate);
          if (licenseExpiry < now) {
            expired.push({
              _id: vehicle._id,
              type: 'license',
              vehicle: {
                registrationNumber: vehicle.registrationNumber,
                make: vehicle.make,
                model: vehicle.model
              },
              expiryDate: vehicle.license.expiryDate,
              amount: 5000, // Standard license renewal fee
              description: 'Vehicle license renewal required'
            });
          }
        }
      });

      // Add vehicles needing emission tests
      vehiclesNeedingTests.forEach((vehicle: any) => {
        expired.push({
          _id: vehicle._id,
          type: 'emission',
          vehicle: {
            registrationNumber: vehicle.registrationNumber,
            make: vehicle.make,
            model: vehicle.model
          },
          expiryDate: vehicle.lastExpiryDate || new Date().toISOString(),
          amount: 2500, // Standard emission test fee
          description: 'Emission test required'
        });
      });

      setExpiredItems(expired);
    } catch (error) {
      console.error('Failed to fetch expired items:', error);
    }
  };

  const fetchViolations = async () => {
    try {
      const response = await axios.get('/api/violations/types');
      setViolations(response.data.violations || []);
    } catch (error) {
      console.error('Failed to fetch violations:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles/my-vehicles');
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const handlePayment = (item: Fine | ExpiredItem, type: string) => {
    setPaymentData({
      amount: item.amount,
      type,
      relatedId: item._id,
      description: 'description' in item ? item.description : item.violation.description,
      metadata: {
        vehicleRegistration: item.vehicle.registrationNumber,
        ...(type === 'fine' && { violationType: (item as Fine).violation.type })
      }
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchFines();
    fetchExpiredItems();
    setPaymentData(null);
  };

  const handleViolationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'violationCode') {
      const selectedViolation = violations.find(v => v.code === value);
      setViolationForm({
        ...violationForm,
        [name]: value,
        amount: selectedViolation?.baseAmount || 0,
        description: selectedViolation?.description || ''
      });
    } else {
      setViolationForm({
        ...violationForm,
        [name]: value
      });
    }
  };

  const handleSubmitViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/violations/self-report', violationForm);
      
      // Immediately proceed to payment
      const newFine = response.data.fine;
      setPaymentData({
        amount: newFine.amount,
        type: 'fine',
        relatedId: newFine._id,
        description: newFine.violation.description,
        metadata: {
          vehicleRegistration: newFine.vehicle.registrationNumber,
          violationType: newFine.violation.type
        }
      });
      
      setShowViolationModal(false);
      setShowPaymentModal(true);
      
      // Reset form
      setViolationForm({
        vehicleId: '',
        violationCode: '',
        location: '',
        description: '',
        amount: 0
      });
    } catch (error: any) {
      console.error('Failed to submit violation:', error);
      alert(error.response?.data?.message || 'Failed to submit violation');
    }
  };

  const allItems = [
    ...fines.map(fine => ({ ...fine, itemType: 'fine' })),
    ...expiredItems.map(item => ({ ...item, itemType: item.type }))
  ];

  const filteredItems = allItems.filter(item => {
    const matchesSearch = 
      item.vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ('violation' in item ? item.violation.description : item.description).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      ('status' in item ? item.status === statusFilter : statusFilter === 'pending');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'disputed': return <FileText className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'fine': return <AlertTriangle className="h-5 w-5" />;
      case 'insurance': return <Shield className="h-5 w-5" />;
      case 'license': return <Car className="h-5 w-5" />;
      case 'emission': return <Leaf className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'fine': return 'bg-red-100 text-red-600';
      case 'insurance': return 'bg-blue-100 text-blue-600';
      case 'license': return 'bg-purple-100 text-purple-600';
      case 'emission': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const groupedViolations = violations.reduce((acc, violation) => {
    if (!acc[violation.category]) {
      acc[violation.category] = [];
    }
    acc[violation.category].push(violation);
    return acc;
  }, {} as Record<string, Violation[]>);

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments & Fines</h1>
            <p className="text-gray-600 mt-2">
              Manage your traffic fines, insurance renewals, license renewals, and emission tests.
            </p>
          </div>
          <button
            onClick={() => setShowViolationModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Report Violation
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Fines</p>
                <p className="text-2xl font-bold text-red-600">
                  {fines.filter(f => f.status === 'pending').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired Insurance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {expiredItems.filter(i => i.type === 'insurance').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">License Renewals</p>
                <p className="text-2xl font-bold text-purple-600">
                  {expiredItems.filter(i => i.type === 'license').length}
                </p>
              </div>
              <Car className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emission Tests</p>
                <p className="text-2xl font-bold text-green-600">
                  {expiredItems.filter(i => i.type === 'emission').length}
                </p>
              </div>
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by vehicle number or description..."
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
                <option value="all">All Items</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="disputed">Disputed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item: any) => (
              <div key={`${item.itemType}-${item._id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${getItemTypeColor(item.itemType)}`}>
                        {getItemIcon(item.itemType)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.itemType === 'fine' ? item.fineNumber : `${item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)} Payment`}
                        </h3>
                        {'status' in item && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 mr-2">Vehicle:</span>
                        {item.vehicle.registrationNumber} ({item.vehicle.make} {item.vehicle.model})
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium text-gray-900 mr-2">
                          {item.itemType === 'fine' ? 'Issued:' : 'Expired:'}
                        </span>
                        {new Date(item.itemType === 'fine' ? item.issuedDate : item.expiryDate).toLocaleDateString()}
                      </div>
                      {item.itemType === 'fine' && (
                        <>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="font-medium text-gray-900 mr-2">Location:</span>
                            {item.violation.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="font-medium text-gray-900 mr-2">Due:</span>
                            {new Date(item.dueDate).toLocaleDateString()}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <p className="text-gray-700">
                      {item.itemType === 'fine' ? item.violation.description : item.description}
                    </p>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end">
                    <div className="text-right mb-4">
                      <p className="text-2xl font-bold text-gray-900">
                        Rs. {item.amount.toLocaleString()}
                      </p>
                      {item.paidDate && (
                        <p className="text-sm text-green-600">
                          Paid on {new Date(item.paidDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedFine(item)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      
                      {(!('status' in item) || item.status === 'pending') && (
                        <button
                          onClick={() => handlePayment(item, item.itemType)}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All payments up to date</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No items match your search criteria.' 
                  : 'You have no pending payments. Keep up the good work!'}
              </p>
            </div>
          )}
        </div>

        {/* Report Violation Modal */}
        {showViolationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Report Traffic Violation
              </h3>
              
              <form onSubmit={handleSubmitViolation} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Vehicle *
                  </label>
                  <select
                    name="vehicleId"
                    value={violationForm.vehicleId}
                    onChange={handleViolationFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Violation Type *
                  </label>
                  <select
                    name="violationCode"
                    value={violationForm.violationCode}
                    onChange={handleViolationFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select violation type</option>
                    {Object.entries(groupedViolations).map(([category, categoryViolations]) => (
                      <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                        {categoryViolations.map((violation) => (
                          <option key={violation.code} value={violation.code}>
                            {violation.description} - Rs. {violation.baseAmount.toLocaleString()}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={violationForm.location}
                    onChange={handleViolationFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter location where violation occurred"
                  />
                </div>

                {violationForm.amount > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-emerald-900">Fine Amount:</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        Rs. {violationForm.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-emerald-700 mt-1">
                      {violationForm.description}
                    </p>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Self-Reporting Notice</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        By self-reporting this violation, you acknowledge responsibility and agree to pay the fine immediately. 
                        This may help reduce potential penalties if the violation is later discovered through enforcement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowViolationModal(false);
                      setViolationForm({
                        vehicleId: '',
                        violationCode: '',
                        location: '',
                        description: '',
                        amount: 0
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Report & Pay Fine
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentData(null);
          }}
          onSuccess={handlePaymentSuccess}
          {...paymentData}
        />

        {/* Details Modal */}
        {selectedFine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Item Details
                </h3>
                <button
                  onClick={() => setSelectedFine(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Vehicle Information</h4>
                    <p className="text-gray-600">
                      {selectedFine.vehicle.registrationNumber}<br />
                      {selectedFine.vehicle.make} {selectedFine.vehicle.model}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Amount & Status</h4>
                    <p className="text-gray-600">
                      Rs. {selectedFine.amount.toLocaleString()}<br />
                      Status: <span className={`font-medium ${
                        'status' in selectedFine && selectedFine.status === 'paid' ? 'text-green-600' : 
                        'status' in selectedFine && selectedFine.status === 'pending' ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {'status' in selectedFine ? selectedFine.status.charAt(0).toUpperCase() + selectedFine.status.slice(1) : 'Pending'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">
                    {'violation' in selectedFine ? selectedFine.violation.description : selectedFine.description}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSelectedFine(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {(!('status' in selectedFine) || selectedFine.status === 'pending') && (
                  <button
                    onClick={() => {
                      handlePayment(selectedFine, 'itemType' in selectedFine ? selectedFine.itemType : 'fine');
                      setSelectedFine(null);
                    }}
                    className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fines;