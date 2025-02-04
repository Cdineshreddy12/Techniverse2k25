import React from 'react';
import { 
  Users2, Brain, Cpu, Radio, 
  LayoutGrid, Laptop2, Waypoints,
  PartyPopper, PenTool, BookOpen,
  Shield, UsersRound, Megaphone,
  Building, Workflow, HelpCircle,
  Music, MonitorPlay
} from 'lucide-react';

const CommitteeCard = ({ title, icon: Icon, members }) => (
  <div className="group relative min-h-[400px]">
    {/* Glow Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-all duration-500" />
    
    <div className="relative h-full p-6 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-500/20">
        <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          {title}
        </h3>
      </div>

      {/* Members */}
      <div className="space-y-3">
        {members.map((member, idx) => (
          <div 
            key={idx} 
            className="p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 border border-blue-500/10 
                     hover:border-blue-500/30 transition-all duration-300 group/item"
          >
            <div className="flex flex-col gap-1">
              <span className="text-blue-100 font-medium group-hover/item:text-cyan-400 transition-colors">
                {member.name}
              </span>
              <span className="text-blue-300/60 text-sm">
                {member.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdministrationPage = () => {
  const committees = [
    {
      title: "Administrative Body",
      icon: Users2,
      members: [
        { name: "Prof. K.V. G.D. Balaji", role: "Director" },
        { name: "Mr. Muni Rama Krishna", role: "Administrative Officer" },
        { name: "Mr. K Mohana Krishna Chowdary", role: "Dean of Academics" },
        { name: "Mr. Ch Vasu", role: "Finance Officer" },
        { name: "Mr. Gedela Ravi", role: "Dean, Student Welfare" }
      ]
    },
    {
      title: "Core Committee",
      icon: Brain,
      members: [
        { name: "Mr. Gedela Ravi", role: "Convener, Asst. Professor, Biosciences" },
        { name: "Mr. Ch Teja Kiran", role: "Co-convener, Asst. Professor, CE" },
        { name: "Mr. Ch Vasu", role: "Treasurer, Asst. Professor, ME" },
        { name: "Dr. M P Suri Ganesh", role: "Treasurer, Asst. Professor, Management" },
        { name: "Mr. Ch T S Prakash", role: "Organizing Secretary, Asst. Professor, ME" }
      ]
    },
    {
      title: "Department Coordinators",
      icon: Cpu,
      members: [
        { name: "Mr. Y Ramesh", role: "HOD, CSE" },
        { name: "Mrs. M V Tirupatamma", role: "HOD, ECE" },
        { name: "Mrs. S Kiranmai", role: "Asst. Professor, ME" },
        { name: "Mr. N R N Prem Kumar", role: "Asst. Professor, CE" },
        { name: "Ms. P Gowthami", role: "HOD, EE" }
      ]
    },
    {
      title: "Marketing & Publicity",
      icon: Megaphone,
      members: [
        { name: "Mr. P Prasanth Kumar", role: "Asst. Professor, ECE" },
        { name: "Mr. M Jeevan", role: "Asst. Professor, CE" },
        { name: "Mr. K Lakshmi Narayana", role: "Asst. Professor, ECE" },
        { name: "Dr. Mohammad Ashik", role: "Asst. Professor, ECE" },
        { name: "Dr. P V Naidu", role: "Asst. Professor, Management" }
      ]
    },
    {
      title: "Web & Social Media",
      icon: Laptop2,
      members: [
        { name: "Mr. K Dileep Kumar", role: "Asst. Professor, CSE" },
        { name: "Mrs. S Lakshmisri", role: "Asst. Professor, CSE" }
      ]
    },
    {
      title: "Infrastructure Team",
      icon: Building,
      members: [
        { name: "Mr. R Ganesh", role: "Coordinator (Electrical Works)" },
        { name: "Institute Engineer & AE", role: "Civil Works" }
      ]
    },
    {
      title: "Tech Exhibition",
      icon: LayoutGrid,
      members: [
        { name: "Mr. N Satish", role: "Asst. Professor, Physics" },
        { name: "Dr. B Swathi", role: "Asst. Professor, Chemistry" },
        { name: "Mr. T. Asiri Naidu", role: "Asst. Professor, Chemistry" },
        { name: "Mrs. K Jayanthi", role: "Asst. Professor, ECE" },
        { name: "Mr. P Kutti", role: "Mentor, IT" }
      ]
    },
    {
      title: "Cultural Team",
      icon: Music,
      members: [
        { name: "Mrs. R Deepa", role: "Mentor, IT" },
        { name: "Dr. G Eswara rao", role: "Asst. Professor, Yoga" },
        { name: "Mrs. D Srilakshmi", role: "Instructor, Music" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="relative py-24 px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 leading-loose">
            Technical Fest Committee
          </h1>
          <p className="text-lg text-blue-200/80">March 7th - 9th, 2025</p>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full" />
        </div>

        {/* Grid Layout */}
        <div className="max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {committees.map((committee, idx) => (
            <CommitteeCard key={idx} {...committee} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdministrationPage;