import React, { useState, useEffect } from 'react';
import { Car, Plus, Edit, Calendar, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface Vehicle {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vehicleType: string;
  engineNumber: string;
  chassisNumber: string;
  insurance: {
    company: string;
    policyNumber: string;
    expiryDate: string;
    isActive: boolean;
  };
  license: {
    expiryDate: string;
    isValid: boolean;
  };
  createdAt: string;
}

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vehicleType: 'car',
    engineNumber: '',
    chassisNumber: '',
    insurance: {
      company: '',
      policyNumber: '',
      expiryDate: '',
      isActive: true
    },
    license: {
      expiryDate: '',
      isValid: true
    }
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles/my-vehicles');
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await axios.put(`/api/vehicles/${editingVehicle._id}`, formData);
      } else {
        await axios.post('/api/vehicles', formData);
      }
      
      fetchVehicles();
      setShowModal(false);
      setEditingVehicle(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      registrationNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      vehicleType: 'car',
      engineNumber: '',
      chassisNumber: '',
      insurance: {
        company: '',
        policyNumber: '',
        expiryDate: '',
        isActive: true
      },
      license: {
        expiryDate: '',
        isValid: true
      }
    });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      vehicleType: vehicle.vehicleType,
      engineNumber: vehicle.engineNumber,
      chassisNumber: vehicle.chassisNumber,
      insurance: vehicle.insurance,
      license: vehicle.license
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('insurance.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        insurance: {
          ...formData.insurance,
          [field]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      });
    } else if (name.startsWith('license.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        license: {
          ...formData.license,
          [field]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseInt(value) : value
      });
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    return <Car className="h-5 w-5" />;
  };

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow && expiry >= today;
  };

  const getExpiryStatus = (expiryDate: string, isActive: boolean) => {
    if (!expiryDate) return { status: 'unknown', color: 'bg-gray-100 text-gray-800' };
    
    if (isExpired(expiryDate)) {
      return { status: 'expired', color: 'bg-red-100 text-red-800' };
    } else if (isExpiringSoon(expiryDate)) {
      return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800' };
    } else if (isActive) {
      return { status: 'active', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'inactive', color: 'bg-gray-100 text-gray-800' };
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
            <p className="text-gray-600 mt-2">
              Manage your registered vehicles and their information.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Vehicle
          </button>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const insuranceStatus = getExpiryStatus(vehicle.insurance?.expiryDate, vehicle.insurance?.isActive);
            const licenseStatus = getExpiryStatus(vehicle.license?.expiryDate, vehicle.license?.isValid);
            
            return (
              <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      {getVehicleTypeIcon(vehicle.vehicleType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {vehicle.registrationNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{vehicle.vehicleType}</span>
                  </div>
                  
                  {/* Insurance Status */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Insurance
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${insuranceStatus.color}`}>
                        {insuranceStatus.status === 'expired' && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                        {insuranceStatus.status === 'active' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                        {insuranceStatus.status.charAt(0).toUpperCase() + insuranceStatus.status.slice(1)}
                      </span>
                    </div>
                    {vehicle.insurance?.company && (
                      <p className="text-xs text-gray-600">
                        {vehicle.insurance.company}
                      </p>
                    )}
                    {vehicle.insurance?.expiryDate && (
                      <p className="text-xs text-gray-600">
                        Expires: {new Date(vehicle.insurance.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* License Status */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        License
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${licenseStatus.color}`}>
                        {licenseStatus.status === 'expired' && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                        {licenseStatus.status === 'active' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                        {licenseStatus.status.charAt(0).toUpperCase() + licenseStatus.status.slice(1)}
                      </span>
                    </div>
                    {vehicle.license?.expiryDate && (
                      <p className="text-xs text-gray-600">
                        Expires: {new Date(vehicle.license.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Alerts for expired items */}
                  {(insuranceStatus.status === 'expired' || licenseStatus.status === 'expired') && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center text-red-800">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Action Required</span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">
                          {insuranceStatus.status === 'expired' && licenseStatus.status === 'expired' 
                            ? 'Insurance and license have expired'
                            : insuranceStatus.status === 'expired' 
                            ? 'Insurance has expired'
                            : 'License has expired'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {vehicles.length === 0 && (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles registered</h3>
              <p className="text-gray-600 mb-4">
                Add your first vehicle to start managing your traffic fines.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Add Vehicle
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Vehicle Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="ABC-1234"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type *
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="car">Car</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="truck">Truck</option>
                      <option value="bus">Bus</option>
                      <option value="van">Van</option>
                      <option value="three-wheeler">Three Wheeler</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Make *
                    </label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Toyota"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Corolla"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color *
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="White"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine Number *
                    </label>
                    <input
                      type="text"
                      name="engineNumber"
                      value={formData.engineNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chassis Number *
                    </label>
                    <input
                      type="text"
                      name="chassisNumber"
                      value={formData.chassisNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Company
                      </label>
                      <input
                        type="text"
                        name="insurance.company"
                        value={formData.insurance.company}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Insurance Company Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Policy Number
                      </label>
                      <input
                        type="text"
                        name="insurance.policyNumber"
                        value={formData.insurance.policyNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Policy Number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Expiry Date
                      </label>
                      <input
                        type="date"
                        name="insurance.expiryDate"
                        value={formData.insurance.expiryDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Expiry Date
                      </label>
                      <input
                        type="date"
                        name="license.expiryDate"
                        value={formData.license.expiryDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingVehicle(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
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

export default Vehicles;