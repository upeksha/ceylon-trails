import React from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { 
  Users, 
  MapPin, 
  FileText, 
  BarChart3,
  Calendar,
  Globe
} from 'lucide-react';

const AdminDashboard = () => {
  const { userData } = useAuth();

  // Mock data - replace with real data from Firestore
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Places',
      value: '156',
      change: '+5%',
      changeType: 'positive',
      icon: MapPin,
      color: 'bg-green-500'
    },
    {
      title: 'Total Itineraries',
      value: '892',
      change: '+23%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: 'Active Sessions',
      value: '45',
      change: '-3%',
      changeType: 'negative',
      icon: BarChart3,
      color: 'bg-orange-500'
    }
  ];

  const recentActivity = [
    {
      type: 'user',
      message: 'New user registered: john@example.com',
      time: '2 minutes ago'
    },
    {
      type: 'itinerary',
      message: 'New itinerary created: "Sri Lanka Adventure"',
      time: '5 minutes ago'
    },
    {
      type: 'place',
      message: 'Place updated: Galle Fort',
      time: '10 minutes ago'
    },
    {
      type: 'user',
      message: 'User logged in: admin@example.com',
      time: '15 minutes ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {userData?.displayName || 'Admin'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your Ceylon Trails application today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-600 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'itinerary' ? 'bg-green-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Manage Users</span>
              </div>
              <span className="text-xs text-gray-500">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Add New Place</span>
              </div>
              <span className="text-xs text-gray-500">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">View Itineraries</span>
              </div>
              <span className="text-xs text-gray-500">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">View Analytics</span>
              </div>
              <span className="text-xs text-gray-500">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-900">Firebase Auth</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-900">Firestore Database</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-900">Google Maps API</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 