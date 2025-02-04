import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Globe,
  Clock,
  Users,
  Bookmark,
  Trophy,
  Ticket,
  Award,
  BookCheck,
  QrCode,
  School
} from 'lucide-react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const PaymentBadge = ({ payment }) => {
  const getBadgeStyle = (status) => {
    const styles = {
      paid: 'bg-green-500/20 text-green-400',
      unpaid: 'bg-red-500/20 text-red-400',
      pending: 'bg-yellow-500/20 text-yellow-400'
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs flex items-center ${getBadgeStyle(payment.status)}`}>
      <span className="mr-1">•</span>
      {payment.status === 'paid' ? 
        `Paid on ${new Date(payment.paidOn).toLocaleDateString()}` : 
        payment.status.charAt(0).toUpperCase() + payment.status.slice(1)
      }
    </div>
  );
};

const EventCard = ({ event }) => {
  return (
    <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-white font-medium">{event.title}</h3>
          <p className="text-sky-400 text-sm">
            {event.type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            event.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
            event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
            event.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
          {event.payment && <PaymentBadge payment={event.payment} />}
        </div>
      </div>
      
      {event.description && (
        <p className="text-gray-400 text-sm mb-3">{event.description}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(event.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <Globe className="w-4 h-4 mr-2" />
          {event.location}
        </div>
        {event.instructor && (
          <div className="flex items-center text-gray-400 text-sm">
            <User className="w-4 h-4 mr-2" />
            Instructor: {event.instructor}
          </div>
        )}
        {event.coordinator && (
          <div className="flex items-center text-gray-400 text-sm">
            <User className="w-4 h-4 mr-2" />
            Coordinator: {event.coordinator}
          </div>
        )}
        {event.duration && (
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            Duration: {event.duration}
          </div>
        )}
        {event.payment?.teamSize && (
          <div className="flex items-center text-gray-400 text-sm">
            <Users className="w-4 h-4 mr-2" />
            Team Size: {event.payment.teamSize}
          </div>
        )}
        {event.result && (
          <div className="flex items-center text-emerald-400 text-sm font-medium">
            <Trophy className="w-4 h-4 mr-2" />
            {event.result} {event.prize && `- ${event.prize}`}
          </div>
        )}
        {event.certificate && (
          <div className="flex items-center text-sky-400 text-sm">
            <Award className="w-4 h-4 mr-2" />
            Certificate Available
          </div>
        )}
      </div>

      {event.payment && (
        <div className="mt-3 pt-3 border-t border-slate-600/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Registration Fee:</span>
            <span className="text-white font-medium">₹{event.payment.amount}</span>
          </div>
          {event.payment.method && (
            <div className="text-xs text-gray-400 mt-1">
              Payment Method: {event.payment.method.toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const UserProfile = () => {
  const { isLoading, isAuthenticated, user } = useKindeAuth();
  const [activeTab, setActiveTab] = useState('upcoming');

 // Sample data for TechniVerse user profile
const sampleRegistrations = {
  upcoming: [
    {
      id: 1,
      type: 'Technical',
      title: 'Code Quest 2025',
      date: '2025-02-15T10:00:00',
      location: 'CSE Lab Complex',
      status: 'confirmed',
      payment: {
        amount: 300,
        status: 'paid',
        method: 'upi',
        teamSize: '2-3 members',
        paidOn: '2025-01-20'
      },
      description: 'Competitive programming challenge with multiple rounds',
      coordinator: 'Dr. Sarah Johnson'
    },
    {
      id: 2,
      type: 'workshop',
      title: 'AI/ML with Python',
      date: '2025-02-18T09:00:00',
      location: 'Tech Hub - Room 201',
      status: 'confirmed',
      payment: {
        amount: 500,
        status: 'paid',
        method: 'card',
        paidOn: '2025-01-22'
      },
      instructor: 'Prof. Alex Kumar',
      duration: '6 hours',
      description: 'Hands-on workshop on machine learning fundamentals'
    },
    {
      id: 3,
      type: 'Cultural',
      title: 'Tech Beats',
      date: '2025-02-20T17:00:00',
      location: 'Main Auditorium',
      status: 'pending',
      payment: {
        amount: 400,
        status: 'pending',
        teamSize: '4-6 members'
      },
      description: 'Music competition with a tech twist'
    }
  ],
  past: [
    {
      id: 4,
      type: 'Technical',
      title: 'Hack Horizon',
      date: '2024-12-15T09:00:00',
      location: 'Innovation Center',
      status: 'completed',
      payment: {
        amount: 600,
        status: 'paid',
        method: 'upi',
        teamSize: '3-4 members',
        paidOn: '2024-12-01'
      },
      result: 'Second Place',
      prize: '₹5000'
    },
    {
      id: 5,
      type: 'workshop',
      title: 'Web3 Development',
      date: '2024-12-20T14:00:00',
      location: 'Virtual',
      status: 'completed',
      payment: {
        amount: 450,
        status: 'paid',
        method: 'card',
        paidOn: '2024-12-10'
      },
      instructor: 'Rahul Sharma',
      duration: '4 hours',
      certificate: true
    }
  ]
};

const userDetails = {
  // Personal & College Info
  collegeId: "20CS235",
  branch: "Computer Science",
  collegeName: "Government Engineering College",
  semester: 6,
  
  // Tech Fest Details
  techPassId: "TV2025-CS235",
  passType: "Premium",
  registeredOn: "2025-01-10",
  
  // Registration Stats
  eventsRegistered: 3,
  workshopsRegistered: 2,
  eventsCompleted: 2,
  certificatesEarned: 1,
  
  // Achievements
  loyaltyPoints: 750,
  achievements: [
    {
      title: "Second Place",
      event: "Hack Horizon",
      date: "2024-12-15",
      points: 300
    },
    {
      title: "Early Bird Registration",
      event: "Tech Pass Purchase",
      date: "2025-01-10",
      points: 150
    }
  ],
  
  // Payment History
  totalSpent: 2250,
  paymentHistory: [
    {
      id: "PAY001",
      event: "Code Quest 2025",
      amount: 300,
      date: "2025-01-20",
      method: "UPI"
    },
    {
      id: "PAY002",
      event: "AI/ML Workshop",
      amount: 500,
      date: "2025-01-22",
      method: "Card"
    }
  ],
  
  // Preferences
  notifications: {
    email: true,
    whatsapp: true,
    updates: true
  },
  
  // Team Info
  teams: [
    {
      eventId: 1,
      eventName: "Code Quest 2025",
      teamName: "Byte Busters",
      members: ["John Doe", "Jane Smith", "Alex Johnson"],
      role: "Team Leader"
    },
    {
      eventId: 3,
      eventName: "Tech Beats",
      teamName: "Digital Harmony",
      members: ["John Doe", "Sarah Wilson", "Mike Brown", "Lisa Anderson"],
      role: "Member"
    }
  ]
};

// Sample QR Code Data
const techPassQR = {
  id: "TV2025-CS235",
  validFrom: "2025-01-10",
  validUntil: "2025-02-25",
  access: ["All Events", "Premium Workshops", "Food Court Discount"],
  scanCount: 12,
  lastScanned: "2025-02-01T15:30:00"
};

// Workshop Certificates
const certificates = [
  {
    id: "CERT001",
    title: "Web3 Development",
    issueDate: "2024-12-21",
    instructor: "Rahul Sharma",
    duration: "4 hours",
    downloadUrl: "/certificates/web3-dev.pdf"
  }
];

  const TabButton = ({ label, value, active, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-slate-700/50'}`}
    >
      {label}
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-24">
          <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 rounded-2xl"></div>
          
          <div className="absolute -bottom-16 left-8 flex items-end">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.given_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-500">
                    <span className="text-4xl font-bold text-white">
                      {user?.given_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900"></div>
            </div>
            <div className="ml-6 mb-4">
              <h1 className="text-3xl font-bold text-white">{user?.given_name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sky-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {user?.email}
                </p>
                <p className="text-emerald-400 flex items-center">
                  <School className="w-4 h-4 mr-2" />
                  {userDetails.branch}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="absolute right-8 -bottom-16 flex gap-4">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Loyalty Points</p>
                  <p className="text-white font-bold text-xl">{userDetails.loyaltyPoints}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Ticket className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tech Pass ID</p>
                  <p className="text-white font-bold text-lg">{userDetails.techPassId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* College Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <School className="w-5 h-5" />
              College Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">College ID</p>
                <p className="text-white font-medium">{userDetails.collegeId}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Institution</p>
                <p className="text-white font-medium">{userDetails.collegeName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Branch</p>
                <p className="text-white font-medium">{userDetails.branch}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookCheck className="w-5 h-5" />
              Registrations
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Events Registered</p>
                <p className="text-white font-medium">{userDetails.eventsRegistered}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Workshops Registered</p>
                <p className="text-white font-medium">{userDetails.workshopsRegistered}</p>
              </div>
              <div className="pt-2">
                <button className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
                  View All Registrations
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Tech Pass
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Pass ID</p>
                <p className="text-white font-medium">{userDetails.techPassId}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-emerald-400 font-medium">Active</p>
              </div>
              <div className="pt-2">
                <button className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
                  View QR Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Events & Workshops Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Your Registrations</h2>
              <div className="flex gap-2">
                <TabButton 
                  label="Upcoming" 
                  value="upcoming" 
                  active={activeTab === 'upcoming'} 
                  onClick={setActiveTab} 
                />
                <TabButton 
                  label="Past" 
                  value="past" 
                  active={activeTab === 'past'} 
                  onClick={setActiveTab} 
                />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleRegistrations[activeTab].map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;