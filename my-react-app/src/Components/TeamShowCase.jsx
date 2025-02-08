import React, { useState } from 'react';
import { Users, Code2, Cpu, Wrench, Zap, Building2, ChevronDown, Mail, Phone, Github, Linkedin } from 'lucide-react';

const departments = [
    {
      id: 'cse',
      name: 'Computer Science',
      icon: Code2,
      webTeam: [
        {
          id: 'web-lead-1',
          name: 'Alex Johnson',
          role: 'Web Development Lead',
          imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
          email: 'alex@example.com',
          phone: '+1 234 567 8900',
          github: 'https://github.com',
          linkedin: 'https://linkedin.com'
        },
      ],
      coordinators: [
        {
          id: 'cse-head',
          name: 'Dr. Sarah Miller',
          designation: 'Department Head',
          role: 'Professor & HoD',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
          email: 'sarah.miller@example.com',
          phone: '+1 234 567 8902',
          linkedin: 'https://linkedin.com'
        },
        {
          id: 'cse-assoc-1',
          name: 'Dr. James Wilson',
          designation: 'Associate Head',
          role: 'Associate Professor',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          email: 'james.wilson@example.com',
          linkedin: 'https://linkedin.com'
        },
        {
          id: 'cse-senior-1',
          name: 'Dr. Emily Wang',
          designation: 'Senior Coordinator',
          role: 'Assistant Professor',
          imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
          email: 'emily.wang@example.com',
          phone: '+1 234 567 8903'
        },
        {
          id: 'cse-coord-1',
          name: 'Prof. Robert Brown',
          designation: 'Coordinator',
          role: 'Assistant Professor',
          imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
          email: 'robert.brown@example.com'
        }, {
            id: 'cse-senior-1',
            name: 'Dr. Emily Wang',
            designation: 'Senior Coordinator',
            role: 'Assistant Professor',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
            email: 'emily.wang@example.com',
            phone: '+1 234 567 8903'
          },
          {
            id: 'cse-coord-1',
            name: 'Prof. Robert Brown',
            designation: 'Coordinator',
            role: 'Assistant Professor',
            imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            email: 'robert.brown@example.com'
          }, {
            id: 'cse-senior-1',
            name: 'Dr. Emily Wang',
            designation: 'Senior Coordinator',
            role: 'Assistant Professor',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
            email: 'emily.wang@example.com',
            phone: '+1 234 567 8903'
          },
          {
            id: 'cse-coord-1',
            name: 'Prof. Robert Brown',
            designation: 'Coordinator',
            role: 'Assistant Professor',
            imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            email: 'robert.brown@example.com'
          }, {
            id: 'cse-senior-1',
            name: 'Dr. Emily Wang',
            designation: 'Senior Coordinator',
            role: 'Assistant Professor',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
            email: 'emily.wang@example.com',
            phone: '+1 234 567 8903'
          },
          {
            id: 'cse-coord-1',
            name: 'Prof. Robert Brown',
            designation: 'Coordinator',
            role: 'Assistant Professor',
            imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
            email: 'robert.brown@example.com'
          }
      ]
    },
    {
      id: 'ece',
      name: 'Electronics',
      icon: Cpu,
      coordinators: [
        {
          id: 'ece-head',
          name: 'Dr. David Lee',
          designation: 'Department Head',
          role: 'Professor & HoD',
          imageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop',
          email: 'david.lee@example.com',
          phone: '+1 234 567 8904',
          linkedin: 'https://linkedin.com'
        },
        {
          id: 'ece-senior-1',
          name: 'Dr. Maria Garcia',
          designation: 'Senior Coordinator',
          role: 'Associate Professor',
          imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
          email: 'maria.garcia@example.com',
          linkedin: 'https://linkedin.com'
        }
      ]
    },
    {
      id: 'mech',
      name: 'Mechanical',
      icon: Wrench,
      coordinators: [
        {
          id: 'mech-head',
          name: 'Dr. John Smith',
          designation: 'Department Head',
          role: 'Professor & HoD',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
          email: 'john.smith@example.com',
          phone: '+1 234 567 8905',
          linkedin: 'https://linkedin.com'
        },
        {
          id: 'mech-coord-1',
          name: 'Prof. Rachel Kim',
          designation: 'Coordinator',
          role: 'Assistant Professor',
          imageUrl: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=400&h=400&fit=crop',
          email: 'rachel.kim@example.com'
        }
      ]
    },
    {
      id: 'eee',
      name: 'Electrical',
      icon: Zap,
      coordinators: [
        {
          id: 'eee-head',
          name: 'Dr. Elizabeth Taylor',
          designation: 'Department Head',
          role: 'Professor & HoD',
          imageUrl: 'https://images.unsplash.com/photo-1553267751-1c148a7280a1?w=400&h=400&fit=crop',
          email: 'elizabeth.taylor@example.com',
          phone: '+1 234 567 8906'
        },
        {
          id: 'eee-assoc-1',
          name: 'Dr. William Jones',
          designation: 'Associate Head',
          role: 'Associate Professor',
          imageUrl: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=400&h=400&fit=crop',
          email: 'william.jones@example.com'
        }
      ]
    },
    {
      id: 'civil',
      name: 'Civil',
      icon: Building2,
      coordinators: [
        {
          id: 'civil-head',
          name: 'Dr. Andrew Clark',
          designation: 'Department Head',
          role: 'Professor & HoD',
          imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
          email: 'andrew.clark@example.com',
          phone: '+1 234 567 8907',
          linkedin: 'https://linkedin.com'
        },
        {
          id: 'civil-senior-1',
          name: 'Dr. Michelle Rodriguez',
          designation: 'Senior Coordinator',
          role: 'Associate Professor',
          imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
          email: 'michelle.r@example.com'
        }
      ]
    }
  ];

function WebTeamSection({ webTeam }) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Code2 className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Web Development Team</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {webTeam.map(member => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    );
  }

function TeamMemberCard({ member }) {
  return (
    <div className="flex gap-4 bg-gray-900 rounded-lg p-4 hover:bg-gray-800/50 transition-all">
      <img 
        src={member.imageUrl} 
        alt={member.name}
        className="h-20 w-20 rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white">{member.name}</h3>
        <p className="text-sm text-purple-300 mb-2">{member.role}</p>
        <div className="flex flex-wrap gap-3">
          {member.email && (
            <a 
              href={`mailto:${member.email}`}
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-sm"
            >
              <Mail className="h-4 w-4" />
              <span>{member.email}</span>
            </a>
          )}
          {member.phone && (
            <a 
              href={`tel:${member.phone}`}
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-sm"
            >
              <Phone className="h-4 w-4" />
              <span>{member.phone}</span>
            </a>
          )}
          {member.github && (
            <a 
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-sm"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          )}
          {member.linkedin && (
            <a 
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-sm"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function DepartmentAccordion({ department, isOpen, onToggle }) {
  const Icon = department.icon;

  const hierarchyLevels = {
    'Department Head': 'border-l-4 border-purple-500',
    'Associate Head': 'border-l-4 border-purple-400 ml-4',
    'Senior Coordinator': 'border-l-4 border-purple-300 ml-8',
    'Coordinator': 'border-l-4 border-purple-200 ml-12',
  };
  
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/20 rounded-lg">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{department.name}</h2>
        </div>
        <ChevronDown className={`h-5 w-5 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(hierarchyLevels).map(([level, className]) => {
              const membersAtLevel = department.coordinators?.filter(m => m.designation === level) || [];
              if (membersAtLevel.length === 0) return null;
              
              return (
                <div key={level} className={className + " pl-4"}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-purple-300">{level}</h3>
                    <div className="flex-1 h-px bg-purple-900/50"></div>
                  </div>
                  <div className="grid gap-4">
                    {membersAtLevel.map(member => (
                      <TeamMemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamShowcase() {
  const [openDepartment, setOpenDepartment] = useState('cse');

  const allWebTeamMembers = departments.reduce((acc, dept) => {
    return [...acc, ...(dept.webTeam || [])];
  }, []);

  return (
    <div className="min-h-screen mt-12 bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Our Teams
          </h1>
          <p className="text-purple-300">
            Meet our talented team members across different departments
          </p>
        </div>

        {/* Web Development Team Section */}
        <WebTeamSection webTeam={allWebTeamMembers} />
        
        {/* Department Coordinators Section */}
        <div className="grid gap-3">
          {departments.map(department => (
            <DepartmentAccordion 
              key={department.id} 
              department={department}
              isOpen={openDepartment === department.id}
              onToggle={() => setOpenDepartment(openDepartment === department.id ? null : department.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamShowcase;