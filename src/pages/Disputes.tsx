import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Upload,
  Calendar,
  AlertTriangle,
  Image,
  X,
  Download
} from 'lucide-react';
import axios from 'axios';

interface Dispute {
  _id: string;
  fine: {
    _id: string;
    fineNumber: string;
    amount: number;
    violation: {
      description: string;
      location: string;
    };
    vehicle: {
      registrationNumber: string;
    };
  };
  reason: string;
  description: string;
  status: string;
  evidence: Array<{
    type: string;
    url: string;
    originalName: string;
    description: string;
  }>;
  createdAt: string;
  reviewDate?: string;
  reviewNotes?: string;
  resolution?: string;
}

const Disputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [formData, setFormData] = useState({
    fineId: '',
    reason: '',
    description: '',
    evidenceFiles: [] as File[],
    evidenceDescriptions: [] as string[]
  });
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDisputes();
    fetchPendingFines();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await axios.get('/api/disputes/my-disputes');
      setDisputes(response.data.disputes || []);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingFines = async () => {
    try {
      const response = await axios.get('/api/fines/my-fines?status=pending');
      // Filter out fines that already have disputes
      const finesWithoutDisputes = response.data.fines?.filter((fine: any) => {
        return !disputes.some(dispute => dispute.fine._id === fine._id);
      }) || [];
      setFines(finesWithoutDisputes);
    } catch (error) {
      console.error('Failed to fetch fines:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const submitFormData = new FormData();
      submitFormData.append('fineId', formData.fineId);
      submitFormData.append('reason', formData.reason);
      submitFormData.append('description', formData.description);
      
      // Append files
      formData.evidenceFiles.forEach((file, index) => {
        submitFormData.append('evidenceFiles', file);
      });
      
      // Append descriptions
      formData.evidenceDescriptions.forEach((desc, index) => {
        submitFormData.append('evidenceDescriptions', desc);
      });

      await axios.post('/api/disputes', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      fetchDisputes();
      fetchPendingFines();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to create dispute:', error);
      alert(error.response?.data?.message || 'Failed to create dispute');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fineId: '',
      reason: '',
      description: '',
      evidenceFiles: [],
      evidenceDescriptions: []
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      
      return true;
    });

    // Limit total files to 5
    const totalFiles = formData.evidenceFiles.length + newFiles.length;
    if (totalFiles > 5) {
      alert('Maximum 5 files allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...newFiles],
      evidenceDescriptions: [
        ...prev.evidenceDescriptions,
        ...newFiles.map((_, index) => `Evidence image ${prev.evidenceFiles.length + index + 1}`)
      ]
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index),
      evidenceDescriptions: prev.evidenceDescriptions.filter((_, i) => i !== index)
    }));
  };

  const updateFileDescription = (index: number, description: string) => {
    setFormData(prev => ({
      ...prev,
      evidenceDescriptions: prev.evidenceDescriptions.map((desc, i) => 
        i === index ? description : desc
      )
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'under_review': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const reasonOptions = [
    { value: 'not_owner', label: 'I was not the owner at the time' },
    { value: 'vehicle_stolen', label: 'Vehicle was stolen' },
    { value: 'incorrect_details', label: 'Incorrect violation details' },
    { value: 'evidence_dispute', label: 'Dispute the evidence' },
    { value: 'technical_error', label: 'Technical error in system' },
    { value: 'other', label: 'Other reason' }
  ];

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
            <h1 className="text-3xl font-bold text-gray-900">Dispute Management</h1>
            <p className="text-gray-600 mt-2">
              File and track disputes for your traffic fines.
            </p>
          </div>
          {fines.length > 0 && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              File Dispute
            </button>
          )}
        </div>

        {/* No Fines to Dispute Message */}
        {fines.length === 0 && disputes.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fines to dispute</h3>
            <p className="text-gray-600">
              You don't have any pending fines that can be disputed at this time.
            </p>
          </div>
        )}

        {/* Disputes List */}
        <div className="space-y-6">
          {disputes.length > 0 ? (
            disputes.map((dispute) => (
              <div key={dispute._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dispute for Fine {dispute.fine.fineNumber}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {getStatusIcon(dispute.status)}
                        <span className="ml-1">{dispute.status.replace('_', ' ').charAt(0).toUpperCase() + dispute.status.replace('_', ' ').slice(1)}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium text-gray-900">Vehicle:</span> {dispute.fine.vehicle.registrationNumber}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Amount:</span> Rs. {dispute.fine.amount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Violation:</span> {dispute.fine.violation.description}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Filed:</span> {new Date(dispute.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium text-gray-900">Reason:</span>
                      <p className="text-gray-700 mt-1">
                        {reasonOptions.find(option => option.value === dispute.reason)?.label || dispute.reason}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <span className="font-medium text-gray-900">Description:</span>
                      <p className="text-gray-700 mt-1">{dispute.description}</p>
                    </div>

                    {/* Evidence Images */}
                    {dispute.evidence && dispute.evidence.length > 0 && (
                      <div className="mb-4">
                        <span className="font-medium text-gray-900">Evidence ({dispute.evidence.length} files):</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {dispute.evidence.map((evidence, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={`/api${evidence.url}`}
                                alt={evidence.description}
                                className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() => window.open(`/api${evidence.url}`, '_blank')}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs text-gray-600 mt-1 truncate">{evidence.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dispute.reviewNotes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">Review Notes:</span>
                        <p className="text-gray-700 mt-1">{dispute.reviewNotes}</p>
                        {dispute.reviewDate && (
                          <p className="text-sm text-gray-500 mt-2">
                            Reviewed on {new Date(dispute.reviewDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {dispute.resolution && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <span className="font-medium text-gray-900">Resolution:</span>
                        <p className="text-gray-700 mt-1">{dispute.resolution}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <button
                      onClick={() => setSelectedDispute(dispute)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : fines.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes filed</h3>
              <p className="text-gray-600 mb-4">
                You haven't filed any disputes yet. If you believe a fine was issued in error, you can file a dispute.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                File Your First Dispute
              </button>
            </div>
          ) : null}
        </div>

        {/* File Dispute Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                File a Dispute
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Fine to Dispute *
                      </label>
                      <select
                        name="fineId"
                        value={formData.fineId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Select a fine</option>
                        {fines.map((fine) => (
                          <option key={fine._id} value={fine._id}>
                            {fine.fineNumber} - {fine.vehicle.registrationNumber} - Rs. {fine.amount.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Dispute *
                      </label>
                      <select
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Select a reason</option>
                        {reasonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detailed Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        maxLength={1000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Provide a detailed explanation of why you are disputing this fine..."
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.description.length}/1000 characters
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Supporting Evidence (Images)
                      </label>
                      
                      {/* File Upload Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          dragActive 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-gray-300 hover:border-emerald-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">
                          Drag and drop images here, or{' '}
                          <label className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                            browse files
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleFileSelect(e.target.files)}
                              className="hidden"
                            />
                          </label>
                        </p>
                        <p className="text-sm text-gray-500">
                          Maximum 5 files, 5MB each. JPG, PNG, GIF supported.
                        </p>
                      </div>

                      {/* Selected Files */}
                      {formData.evidenceFiles.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="font-medium text-gray-900">Selected Files ({formData.evidenceFiles.length}/5)</h4>
                          {formData.evidenceFiles.map((file, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <Image className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={formData.evidenceDescriptions[index] || ''}
                                onChange={(e) => updateFileDescription(index, e.target.value)}
                                placeholder="Describe this evidence..."
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Filing a false dispute may result in additional penalties. Please ensure all information provided is accurate and truthful.
                        Upload clear images that support your dispute claim.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      'File Dispute'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dispute Details Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Dispute Details - {selectedDispute.fine.fineNumber}
                </h3>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Fine Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fine Number:</span>
                        <span className="font-medium">{selectedDispute.fine.fineNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium">{selectedDispute.fine.vehicle.registrationNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">Rs. {selectedDispute.fine.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedDispute.fine.violation.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Dispute Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium px-2 py-1 rounded-full text-xs ${getStatusColor(selectedDispute.status)}`}>
                          {selectedDispute.status.replace('_', ' ').charAt(0).toUpperCase() + selectedDispute.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Filed:</span>
                        <span className="font-medium">{new Date(selectedDispute.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedDispute.reviewDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reviewed:</span>
                          <span className="font-medium">{new Date(selectedDispute.reviewDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Reason</h4>
                  <p className="text-gray-700">
                    {reasonOptions.find(option => option.value === selectedDispute.reason)?.label || selectedDispute.reason}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedDispute.description}</p>
                </div>
                
                {selectedDispute.evidence.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Evidence ({selectedDispute.evidence.length} files)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedDispute.evidence.map((evidence, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <img
                            src={`/api${evidence.url}`}
                            alt={evidence.description}
                            className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => window.open(`/api${evidence.url}`, '_blank')}
                          />
                          <p className="text-xs text-gray-600 mt-2">{evidence.description}</p>
                          <button
                            onClick={() => window.open(`/api${evidence.url}`, '_blank')}
                            className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 flex items-center"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            View Full Size
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedDispute.reviewNotes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Review Notes</h4>
                    <p className="text-gray-700">{selectedDispute.reviewNotes}</p>
                  </div>
                )}
                
                {selectedDispute.resolution && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resolution</h4>
                    <p className="text-gray-700">{selectedDispute.resolution}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Disputes;