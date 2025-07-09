import React, { useState } from 'react';
import { 
  Car, 
  Shield, 
  CreditCard, 
  Bell, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Scale,
  FileText,
  Clock,
  Globe,
  Phone,
  Mail,
  MapPin,
  Play,
  X,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-emerald-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Globe className="h-4 w-4 mr-2" />
                Government of Sri Lanka Initiative
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Modern Traffic Fine
                <span className="text-emerald-600 block">Management System</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Streamline traffic violations, reduce queues, and enhance transparency with our digital platform. 
                Pay fines online, track violations, and resolve disputes efficiently.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register"
                className="bg-emerald-500 text-white px-8 py-4 rounded-lg hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg inline-flex items-center"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button 
                onClick={() => setShowDemoModal(true)}
                className="text-emerald-600 px-8 py-4 rounded-lg border-2 border-emerald-500 hover:bg-emerald-50 transition-colors font-semibold inline-flex items-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our System?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern technology meets efficient governance for a better traffic management experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Processing</h3>
              <p className="text-gray-600">
                Instant fine processing and notifications. No more waiting in long queues or delayed updates.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <CreditCard className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Online Payments</h3>
              <p className="text-gray-600">
                Multiple payment options with bank-grade security. Pay fines from anywhere, anytime.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Bell className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Notifications</h3>
              <p className="text-gray-600">
                Get instant alerts for new fines, payment confirmations, and important updates via SMS and email.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Scale className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dispute Resolution</h3>
              <p className="text-gray-600">
                Fair and transparent dispute resolution process with online evidence submission and tracking.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Digital Records</h3>
              <p className="text-gray-600">
                Complete digital record keeping with easy access to violation history and payment receipts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Stakeholder Access</h3>
              <p className="text-gray-600">
                Dedicated portals for vehicle owners, traffic police, and government agencies with role-based access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive digital services for all your traffic-related needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Online Fine Payment</h3>
              <p className="text-gray-600 text-sm">
                Pay your traffic fines securely online with multiple payment options.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dispute Resolution</h3>
              <p className="text-gray-600 text-sm">
                Contest traffic fines with our fair and transparent dispute process.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vehicle Registration</h3>
              <p className="text-gray-600 text-sm">
                Register and manage your vehicles with digital documentation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Emission Test Payment</h3>
              <p className="text-gray-600 text-sm">
                Pay for vehicle emission tests and get digital certificates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Insurance Verification</h3>
              <p className="text-gray-600 text-sm">
                Verify vehicle insurance status and manage policy information.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Records</h3>
              <p className="text-gray-600 text-sm">
                Access complete history of violations, payments, and documents.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Notifications</h3>
              <p className="text-gray-600 text-sm">
                Receive real-time updates on fines, payments, and important notices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-User Support</h3>
              <p className="text-gray-600 text-sm">
                Dedicated portals for citizens, police officers, and administrators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, transparent, and efficient process for everyone involved
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Violation Recorded</h3>
              <p className="text-gray-600">
                Traffic police record violations digitally with photo evidence and automated data entry.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Notification</h3>
              <p className="text-gray-600">
                Vehicle owner receives immediate notification via SMS and email with fine details and payment options.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Payment</h3>
              <p className="text-gray-600">
                Secure online payment with multiple options or dispute submission with digital evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stakeholder Portals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored interfaces for different user types with role-based access and functionality
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-wrap justify-center mb-8 gap-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Vehicle Owner
              </button>
              <button
                onClick={() => setActiveTab('police')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'police'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Traffic Police
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Government Agency
              </button>
            </div>

            {activeTab === 'dashboard' && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Active Fines</h3>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">3</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">Rs. 15,000</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Paid This Year</h3>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">Rs. 8,500</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Pending Disputes</h3>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">1</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">Under Review</p>
                </div>
              </div>
            )}

            {activeTab === 'police' && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Today's Citations</h3>
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">24</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">This Month</h3>
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">432</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Collection Rate</h3>
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">87%</p>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Total Revenue</h3>
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">Rs. 2.4M</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Active Users</h3>
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">15,234</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">System Efficiency</h3>
                    <CheckCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">94%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto">
              Have questions about our traffic fine management system? We're here to help.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="bg-emerald-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                <p className="text-emerald-100">+94 11 123 4567</p>
              </div>
              
              <div>
                <div className="bg-emerald-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                <p className="text-emerald-100">support@trafficlk.gov.lk</p>
              </div>
              
              <div>
                <div className="bg-emerald-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Office Address</h3>
                <p className="text-emerald-100">Traffic Police HQ, Colombo 07</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-emerald-500 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">TrafficLK</h3>
                  <p className="text-sm text-gray-400">Digital Fine Management</p>
                </div>
              </div>
              <p className="text-gray-400">
                Modernizing Sri Lanka's traffic fine management system for better efficiency and transparency.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-emerald-400 transition-colors">Home</a></li>
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#services" className="hover:text-emerald-400 transition-colors">Services</a></li>
                <li><a href="#contact" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Online Fine Payment</li>
                <li>Dispute Resolution</li>
                <li>Vehicle Registration</li>
                <li>Emission Test Payment</li>
                <li>Insurance Verification</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Government Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a 
                    href="https://www.transport.gov.lk/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Ministry of Transport
                  </a>
                </li>
                <li>
                  <a 
                    href="https://dmt.gov.lk/index.php?lang=en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    DMT Sri Lanka
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.police.lk/?page_id=1867" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Traffic Police
                  </a>
                </li>
                <li>
                  <a 
                    href="https://gov.lk/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Gov.lk Portal
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Government of Sri Lanka. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">System Demo</h3>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Welcome to TrafficLK Demo</h4>
                <p className="text-gray-700 mb-4">
                  Experience the future of traffic fine management in Sri Lanka. Our comprehensive digital platform 
                  streamlines the entire process from violation recording to payment and dispute resolution.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">For Citizens</h5>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• View and pay fines online</li>
                    <li>• Register and manage vehicles</li>
                    <li>• File disputes with evidence</li>
                    <li>• Track payment history</li>
                    <li>• Receive instant notifications</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">For Traffic Police</h5>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Issue fines digitally</li>
                    <li>• Upload photo evidence</li>
                    <li>• Track violation statistics</li>
                    <li>• Manage dispute reviews</li>
                    <li>• Generate reports</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">Key Features</h5>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Real-time processing</li>
                    <li>• Secure payment gateway</li>
                    <li>• Mobile-responsive design</li>
                    <li>• Multi-language support</li>
                    <li>• 24/7 system availability</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h5>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Reduced processing time</li>
                    <li>• Increased transparency</li>
                    <li>• Better compliance rates</li>
                    <li>• Cost-effective operations</li>
                    <li>• Enhanced user experience</li>
                  </ul>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <h5 className="text-lg font-semibold text-emerald-900 mb-3">Ready to Get Started?</h5>
                <p className="text-emerald-800 mb-4">
                  Join thousands of Sri Lankan citizens who are already using our digital platform 
                  for hassle-free traffic fine management.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/register"
                    onClick={() => setShowDemoModal(false)}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-center"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setShowDemoModal(false)}
                    className="border border-emerald-600 text-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-center"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;