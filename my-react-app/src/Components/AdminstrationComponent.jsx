import React, { useState ,useEffect} from 'react';
import { 
  Users2, Brain, Cpu,
  ChevronDown, ChevronUp, Search,Megaphone,Laptop2,Building ,Sparkles
} from 'lucide-react';

const AdministrationPage = () => {
  const [expandedSection, setExpandedSection] = useState('Administrative Body');
  const [searchTerm, setSearchTerm] = useState('');
  const [animateHeader, setAnimateHeader] = useState(false);

  useEffect(() => {
    // Trigger header animation after component mount
    setAnimateHeader(true);
  }, []);

  
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
        { name: "Mr. Ch Teja Kiran", role: "Co-convener, HOD, CE" },
        { name: "Mr. Ch Vasu", role: "Treasurer, Asst. Professor, ME" },
        { name: "Dr. M P Suri Ganesh", role: "Treasurer, Asst. Professor, Management" },
        { name: "Mr. Ch T S Prakash", role: "Organizing Secretary, Asst. Professor, ME" },
        { name: "Mr. K.Ramana", role: "Joint Organizing Secretary, Asst. Professor, CSE" },
        { name: "Mr. B. Ganesh", role: "Joint Organizing Secretary, Asst. Professor, ECE" }
      ]
    },
    {
      title: "Organizing Committee",
      icon: Cpu,
      members: [
        {name:"Dr. P.Govardhana Rao" ,role:"COE"},
        { name: "Mr. Y Ramesh", role: "HOD, CSE" },
        { name: "Mrs. M V Tirupatamma", role: "HOD, ECE" },
        { name: "Mr. Ch T S Prakash", role: "HOD, ME" },
        { name: "Mr. Ch Teja Kiran", role: "HOD, CE" },
        { name: "Ms. P Gowthami", role: "HOD, EE" },
        { name: "Dr. M P Suri Ganesh", role: "HOD, Management" },
        { name: "Mr.T. Raghavendra Rao", role: "HOD, Physics" },
        { name: "Dr. L. Chandrasekhara Rao", role: "HOD, Chemistry" },
        { name: "Dr. B.Neela rao", role: "HOD, Mathematics" },
        { name: "Dr. G. SivaPraveena", role: "HOD, Bio Sciences" },
        { name: "Mr. Y.V.G Nukeswara Rao", role: "HOD, English" },
        { name: "Dr. P.Chiranjeevi", role: "HOD, Telugu" },
        { name: "Mr. S.Sreenuvasa Rao", role: "HOD, IT" },
        { name: "Dr. G.Eswara Rao", role: "HOD, Yoga" },
        { name: "Mrs. D. SriLakshmi", role: "HOD, Music" }
      ]
    },
    {
      title: "Department Coordinators Engineering",
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
      title: "Department Coordinators PUC",
      icon: Cpu,
      members: [
        { name: "Mr.T. Raghavendra Rao", role: "HOD, Physics" },
        { name: "Mr. S.Sreenuvasa Rao", role: "HOD, IT" },
        { name: "Dr. D. Apparao", role: "Asst. Professor, Mathematics" },
        { name: "Mrs. P. Suneetha Rani", role: "Lecturer, Physics" },
        { name: "Mr. V.Ganesh", role: "Mentor, English" }
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
        ],
    },
    {
      title: "Web & Social Media",
        icon: Laptop2,
        members: [
            { name: "Mr. K Dileep Kumar", role: "Asst. Professor, CSE" },
            { name: "Mrs. S Lakshmisri", role: "Asst. Professor, CSE" }
        ],
    },
    {
      title: "Infrastructure Team",
      icon: Building,
      members: [
           { name: "Mr.R Ganesh Coordinator(Electrical Works)", role: "Asst. Professor, EEE" },
      ],
    },
    {
      title: "Hospitality Team",
      icon: Building,
      members: [
           { name: "Mr. V Sagar", role: "Mentor, IT" },
      { name: "Mr.K Rammohan Rao", role: " Asst. Professor, ECE" },
      ],
    },
    {
      title: "Disciplinary Team",
      icon: Building,
      members: [
           { name: "Mr. T Narasimhappadu", role: "Asst.Professor,CSE" },
      { name: "Mr.E Raju", role: " Asst. Professor, English" },
      { name: "Mr.T Dilecp Kumar", role: " Trainee,Physical Education" },
      { name: "Mr.Ch Krishnam Raju", role: " Trainee,Physical Education" },
      ],
    },
    {
      title: "Alumni EngagemeTeam",
      icon: Building,
      members: [
           { name: "Mr. T Gangandeep", role: "Asst.Professor, ECE" },
           { name: "Mr. V S Naidu", role: " Asst. Professor, ME" },
      ],
    },
    {
      title: "Print &Media Team", 
      icon: Building,
      members: [
           { name: "Mr.Ch. Poli raju", role: "Asst.Professor, English" },
           { name: "Mr. M. Shanmukh", role: " PRO RGUKT-Srikakulam" },
      ],
    },
    {
      title: "Website & Social Media Team", 
      icon: Building,
      members: [
           { name: "Mr. K. DileepKumar", role: "Asst.Professor, CSE" },
          { name: "Mrs. D. Lakshmisri", role: " Asst.Professor, CSE" },
      ],
    },
    {
      title: "IT Infra Team", 
      icon: Building,
      members: [
           { name: "Mr. G. Siva Rama Sastry", role: "Asst.Professor, CSE" },
      ],
    },
    {
      title: "Lecture Series Team", 
      icon: Building,
      members: [
      { name: "Dr. P. Govardhan Rao", role: "Asst.Professor, Physics" },
      { name: "Dr. R. Ramesh ", role: " Asst.Professor, Library Sciences" },
      { name: "Mrs. K. Revathi", role: " Asst.Professor, EEE" },
      { name: "Ms. P. Tirumala ", role: " Asst.Professor, ECE" },
      ],
    },
    {
      title: "Weapon Xplore Team", 
      icon: Building,
      members: [
          { name: "Mr. B. Viswanath", role: "Mentor, English" },
          { name: "Mr. S. Someswara Rao ", role: " Mentor IT" },
     ],
    },
    {
      title: "Fun & Game stall Team", 
      icon: Building,
      members: [
      { name: "Mr. V.Somi Babu", role: "Asst.Professor, Physics" },
      { name: "Ms. J. Vishnu Priyanka ", role: " Asst.Professor, CSE" },
      { name: "Mrs. D. Nirmala kumari ", role: " Asst.Professor, Library Sciences" },
      ],
    },
    {
      title: " Tech Exhibition Team", 
      icon: Building,
      members: [
      { name: "Mr. N. Satish", role: "Asst. Professor, Physics" },
      { name: "Dr. B. Swathi ", role: " Asst.Professor, Chemistry" },
      { name: "Mr. T. Asiri Naidu", role: " Asst.Professor, Chemistry" },
      { name: "Dr. L. Dasaradha Rao ", role: " Lecturer,  Physics" },
      { name: "Mrs. K. Jayanthi", role: " Asst.Professor, ECE" },
      { name: "Mr. P. Kutti ", role: " Mentor, IT" },
      ],
    },
    {
      title: " Registration & Help Desk Team", 
      icon: Building,
      members: [
       { name: "Dr. V. Simhachalam", role: "Asst. Professor, Library Sciences" },
      { name: "Dr. P. Mukunda Rao", role: " Asst.Professor, Telugu" },
       {name: "Mr. D. Srikanth ", role: " Mentor, IT" },
      ]
    },
    {
      title: " Cultural Team", 
      icon: Building,
      members: [
      { name: "Mrs. R. Deepa", role: "Mentor, IT " },
      { name: "Dr. G. Eswara Rao", role: " Asst.Professor, Yoga" },
      { name: "Mrs. D. Srilakshmi", role: " Instructor, Music" },
      ]
    },
    {
      title: " Stage Management Team", 
      icon: Building,
      members: [
           { name: "Dr. R. Srinivasa Rao", role: "Mentor, English"},
      { name: "Dr. M. Yogeswari", role: " Asst.Professor, English" },
      { name: "Mrs. K.Yamini Krishna", role: " Instructor, Music" },
      ],
    }
  ];

  const filteredCommittees = committees.map(committee => ({
    ...committee,
    members: committee.members.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(committee => committee.members.length > 0);

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="relative py-24 px-4 md:px-6">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
        <div className="absolute top-0 inset-0 bg-slate-900 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_0%,black_100%)] pointer-events-none" />

        {/* Header */}
        <div className={`text-center mb-16 space-y-6 transition-all duration-1000 ${animateHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 leading-loose mx-4">
              Technical Fest Committee
            </h1>
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-blue-200/80 font-medium">
              March 7th - 9th, 2025
            </p>
            <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search members or roles..."
              className="w-full pl-10 pr-4 py-4 bg-slate-800/50 border border-blue-500/20 rounded-xl 
                       text-blue-100 placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       backdrop-blur-xl transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Committees Grid */}
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredCommittees.map((committee) => (
            <div 
              key={committee.title} 
              className="group backdrop-blur-xl transition-all duration-300"
            >
              {/* Committee Header */}
              <button
                onClick={() => setExpandedSection(expandedSection === committee.title ? '' : committee.title)}
                className="w-full flex items-center justify-between p-6 bg-slate-800/50 border border-blue-500/20 
                         rounded-xl hover:bg-slate-800/70 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${committee.color} bg-opacity-10 transition-transform duration-300 group-hover:scale-110`}>
                    <committee.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-lg font-semibold text-blue-100">{committee.title}</span>
                    <span className="text-sm text-blue-400/80 px-2 py-1 rounded-full bg-blue-500/10">
                      {committee.members.length} members
                    </span>
                  </div>
                </div>
                
                <div className={`transform transition-transform duration-300 ${expandedSection === committee.title ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-blue-400" />
                </div>
              </button>

              {/* Members Table */}
              {expandedSection === committee.title && (
                <div className="mt-2 border border-blue-500/20 rounded-xl overflow-hidden bg-slate-800/30 backdrop-blur-xl">
                  <table className="w-full">
                    <thead className="bg-slate-800/70">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-blue-200">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {committee.members.map((member, idx) => (
                        <tr 
                          key={idx}
                          className="border-t border-blue-500/10 hover:bg-slate-800/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-blue-100">{member.name}</td>
                          <td className="px-6 py-4 text-sm text-blue-300">{member.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdministrationPage;