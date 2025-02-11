import React, { useState } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import {  Code2, Mail, Phone, Github, Linkedin, UserCircle2 } from 'lucide-react';


const webTeam = {
  id: 'web-team',
  name: 'Web & Social Media Team',
  description: 'The creative minds behind our digital presence',
  members: [
    {
      name: 'K.Dileep Kumar',
      phone: '8074683901',
      role: 'Web Team Lead',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'C. Dinesh Reddy ',
      id: 'S211119',
      phone: '8074683901',
      branch: 'CSE',
      year: 'E2',
      role: 'MERN STACK DEVELOPER',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  ]
};

const otherTeams = [
  {
    id: 'student-coordinators',
    name: 'Student Coordinators (Overall Monitoring)',
    members: [
      {
        name: 'B. Yashwanth',
        id: 'S210770',
        phone: '8374095230',
        branch: 'EEE',
        year: 'E2',
        role: 'Cultural, Stage Management, Disciplinary'
      },
      {
        name: 'U. Nikhitha',
        id: 'S210369',
        phone: '79819 39943',
        branch: 'EEE',
        year: 'E2',
        role: 'Cultural, Stage Management, Disciplinary'
      },
      {
        name: 'H. Dilleswararao',
        id: 'S210490',
        phone: '6302647598',
        branch: 'CIVIL',
        year: 'E2',
        role: 'Design, Photography, Social Media, Print Media'
      },
      {
        name: 'T. Likitha',
        id: 'S210637',
        phone: '8688919136',
        branch: 'CIVIL',
        year: 'E2',
        role: 'Marketing, Hospitality, Registrations'
      },
      {
        name: 'P. Vishnu Vardhan',
        id: 'S211114',
        phone: '9121678776',
        branch: 'CSE',
        year: 'E2',
        role: 'Infrastructure, Decoration'
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing And Publicity Team',
    members: [
      {
        name: 'A. Jeevan Jyothikar',
        id: 'S210513',
        phone: '79959 05539',
        branch: 'EEE',
        year: 'E2'
      },
      {
        name: 'K. Vyshnavi (POC)',
        id: 'S210809',
        phone: '8247004083',
        branch: 'CIVIL',
        year: 'E2'
      },
      {
        name: 'K. Nagalakshmi',
        id: 'S210883',
        phone: '8309202747',
        branch: 'CSE',
        year: 'E2'
      },
      {
        name: 'K. P. Deepak (POC)',
        id: 'S200972',
        phone: '7075898604',
        branch: 'CSE',
        year: 'E2'
      }
    ]
  },
  {
    id: 'hospitality',
    name: 'Hospitality Team',
    members: [
      {
        name: 'Bhuvanesh',
        id: 'S210333',
        phone: '7330971969',
        branch: 'ECE',
        year: 'E2'
      },
      {
        name: 'Uma Maheswari (POC)',
        id: 'S210110',
        phone: '8247480798',
        branch: 'ECE',
        year: 'E2'
      },
      {
        name: 'B. Leena Rani (POC)',
        id: 'S210360',
        phone: '9573116139',
        branch: 'ECE',
        year: 'E2'
      }
    ]
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Team',
    members: [
      {
        name: 'P. Karthik (POC)',
        id: 'S200858',
        phone: '9515079090',
        branch: 'ECE',
        year: 'E2'
      },
      {
        name: 'Shaik Bansi Basha (POC)',
        id: 'S210957',
        phone: '7989943237',
        branch: 'CSE',
        year: 'E2'
      }
    ]
  },
  {
    id: 'print-media',
    name: 'Print And Media Team',
    members: [
      {
        name: 'S. Aparna (POC)',
        id: 'S210358',
        phone: '9381860873',
        branch: 'ECE',
        year: 'E2'
      },
      {
        name: 'B. Nikitha',
        id: 'S220323',
        phone: '7386219915',
        branch: 'CIVIL',
        year: 'E2'
      }
    ]
  },
  {
    id: 'tech-expo',
    name: 'Tech Expo Team',
    members: [
      {
        name: 'K. Akash Varma (POC)',
        id: 'S210684',
        phone: '6305412224',
        branch: 'ECE',
        year: 'E2'
      },
      {
        name: 'L. Pooja (POC)',
        id: 'S190620',
        phone: '8919630287',
        branch: 'CIVIL',
        year: 'E2'
      },
      {
        name: 'Aditya Batchu (POC)',
        id: 'S210639',
        phone: '6300993370',
        branch: 'CSE',
        year: 'E2'
      }
    ]
  }
];


function WebTeamCard({ member }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-100 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-gray-900 rounded-lg p-6 ring-1 ring-gray-500/50 hover:ring-purple-500/50 transition-all">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-0.5">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
              <UserCircle2 className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{member.name}</h3>
            <p className="text-sm text-purple-400">{member.role}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-400">{member.id} • {member.branch} {member.year}</p>
          <div className="flex flex-wrap gap-3">
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
    </div>
  );
}

function RegularTeamMemberCard({ member }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-all flex gap-4 ring-1 ring-gray-700/50">
      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
        <UserCircle2 className="w-8 h-8 text-gray-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white">{member.name}</h3>
        <p className="text-sm text-purple-300 mb-2">{member.id} - {member.branch} {member.year}</p>
        {member.role && (
          <p className="text-sm text-gray-400 mb-2">{member.role}</p>
        )}
        <div className="flex flex-wrap gap-3">
          {member.phone && (
            <a 
              href={`tel:${member.phone}`}
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-sm"
            >
              <Phone className="h-4 w-4" />
              <span>{member.phone}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamSection({ team, isOpen, onToggle }) {
  const Icon = team.icon || Users;
  
  return (
    <div className="bg-gray-900/50 rounded-lg overflow-hidden mb-4 ring-1 ring-gray-800/50">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/20 rounded-lg">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{team.name}</h2>
          <span className="text-sm text-purple-400">({team.members.length} members)</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {team.members.map((member) => (
              <RegularTeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamShowcase() {
  const [openTeam, setOpenTeam] = useState('student-coordinators');

  return (
    <div className="min-h-screen mt-12 bg-gradient-to-b from-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            TECHNIVERSE 2K25
          </h1>
          <p className="text-xl text-purple-300">
            Meet the talented teams behind the magic
          </p>
        </div>

        {/* Web Team Featured Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-900/20 rounded-lg">
              <Code2 className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{webTeam.name}</h2>
              <p className="text-purple-400">{webTeam.description}</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {webTeam.members.map((member) => (
              <WebTeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Other Teams */}
        <div className="space-y-4">
          {otherTeams.map((team) => (
            <TeamSection 
              key={team.id}
              team={team}
              isOpen={openTeam === team.id}
              onToggle={() => setOpenTeam(openTeam === team.id ? null : team.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamShowcase;