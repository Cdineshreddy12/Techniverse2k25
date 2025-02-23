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
      phone: '9000254442',
      role: 'Web Team Lead',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'S.Lakshmi sri ',
      id: '',
      phone: '',
      branch: '',
      year: '',
      role: 'WEB TEAM',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'C. Dinesh Reddy ',
      id: 'S211119',
      phone: '8074683901',
      branch: 'CSE-2A',
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
      },
      {
        name: 'T. Naga Vyshnavi',
        id: 'S210631',
        phone: '8008608569',
        branch: 'CSE',
        year: 'E2',
        role: 'Photography,Social media,print Media'
      },
      {
        name: 'S.Sudheer',
        id: 'S211009',
        phone: '8919105462',
        branch: 'ECE',
        year: 'E2',
        role: 'Marketing, Hospitality, Registrations'
      },
      {
        name: 'Ch.Sahithi',
        id: 'S210555',
        phone: '8688698799',
        branch: 'ECE',
        year: 'E2',
        role: 'Infrastructure,Decoration'
      },
      {
        name: 'G.Prasanth',
        id: 'S210549',
        phone: '9392803034',
        branch: 'MECH',
        year: 'E2',
        role: 'Photography,Social media,print Media'
      },
      {
        name: 'P.Swathi',
        id: 'S210046',
        phone: '7569967353',
        branch: 'MECH',
        year: 'E2',
        role: 'Marketing, Hospitality, Registrations'
      },
      {
        name: 'Ch.John Babu',
        id: 'S210310',
        phone: '8340881985',
        branch: 'CSE ',
        year: 'E2',
        role: 'Lecture Series, Tech Expo, Workshop,Weapon Expo'
      },
      {
        name: 'Veera Bala Sai Manikanta',
        id: 'S210368',
        phone: '8143928266',
        branch: 'ECE',
        year: 'E2',
        role: 'Lecture Series, Tech Expo, Workshop,Weapon Expo'
      },
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing And Publicity Team',
    members: [
      {
        name: "A. Jeevan Jyothikar",
        id: "S210513",
        phone: "79959 05539",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "S. Yaswanth Sai",
        id: "S210257",
        phone: "8688673166",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "V. Sriram Kumar",
        id: "S210632",
        phone: "6301050585",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "K. Vyshnavi (POC)",
        id: "S210809",
        phone: "8247004083",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "P. Bala Keerthi",
        id: "S220463",
        phone: "6281434693",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "K. Nagalakshmi",
        id: "S210883",
        phone: "8309202747",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "M. Manasa",
        id: "S210571",
        phone: "7396154215",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Veligatla Durga Sowmya Sree",
        id: "S210516",
        phone: "7989124725",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "K. P. Deepak (POC)",
        id: "S200972",
        phone: "7075898604",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Kondaveti Venu (POC)",
        id: "S210575",
        phone: "6300076650",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "A. N. D. Kranthi",
        id: "S220685",
        phone: "9391800058",
        branch: "CSE",
        year: "E1"
      },
      {
        name: "J. Kalyani",
        id: "S211014",
        phone: "7981447481",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Shiva (POC)",
        id: "S211062",
        phone: "9660345996",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Manoj",
        id: "S210739",
        phone: "9581386830",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Chandini Sri",
        id: "S210249",
        phone: "6303775804",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Lasya",
        id: "S210148",
        phone: "7207293728",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Roshini",
        id: "S220124",
        phone: "9063266358",
        branch: "ECE",
        year: "E1"
      },
      {
        name: "Manasa",
        id: "S220340",
        phone: "9391668753",
        branch: "ECE",
        year: "E1"
      },
      {
        name: "K. Manikanta (POC)",
        id: "S210232",
        phone: "8008738963",
        branch: "MECH",
        year: "E2"
      },
      {
        name: "D. Mohan Kishore",
        id: "S210207",
        phone: "9182621898",
        branch: "MECH",
        year: "E2"
      },
      {
        name: "Jaswanth",
        id: "S220749",
        phone: "7330699264",
        branch: "ECE",
        year: "E1"
      },
      {
        name: "K. Sowmya",
        id: "S210928",
        phone: "7036944084",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "Sreeja (POC)",
        id: "S220241",
        phone: "9515220116",
        branch: "ECE",
        year: "E1"
      }
    ]
  },
  {
    id: 'hospitality',
    name: 'Hospitality Team',
    members: [
      {
        name: "Bhuvanesh",
        id: "S210333",
        phone: "7330971969",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Naga Satish",
        id: "S210613",
        phone: "8019258669",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Srinivas Babu",
        id: "S211090",
        phone: "9492665228",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Bharadwaj",
        id: "S220341",
        phone: "9000275878",
        branch: "ECE",
        year: "E1"
      },
      {
        name: "Abhinash",
        id: "S220012",
        phone: "8309947898",
        branch: "ECE",
        year: "E1"
      },
      {
        name: "Uma Maheswari (POC)",
        id: "S210110",
        phone: "8247480798",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Lakshmi Prasanna",
        id: "S210761",
        phone: "9398029622",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "B. Leena Rani (POC)",
        id: "S210360",
        phone: "9573116139",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Bhanu Teja",
        id: "S210504",
        phone: "7981525395",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Vasantha",
        id: "S210120",
        phone: "9347353245",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "S. Nandini",
        id: "S210465",
        phone: "9948866906",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "P. Kalpana",
        id: "S220454",
        phone: "9701797563",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "Sk. Jameer",
        id: "S210839",
        phone: "6300413002",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "A. Monika",
        id: "S220993",
        phone: "9381345507",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "G. Prasanth",
        id: "S210533",
        phone: "89262 16681",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "Y. Pujitha",
        id: "S210218",
        phone: "8985504311",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "N. Charishma",
        id: "S220771",
        phone: "63034 22194",
        branch: "EEE",
        year: "E1"
      },
      {
        name: "U. Radhika",
        id: "S210658",
        phone: "96525 32703",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "Varagani Kavyanjali",
        id: "S211103",
        phone: "6281501452",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Chandini",
        id: "S210233",
        phone: "7075630513",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "K.Vijay",
        id: "S220973",
        phone: "8688001665",
        branch: "CSE",
        year: "E1"
      },
      {
        name: "Sunkara Mahesh (POC)",
        id: "S210308",
        phone: "7993762936",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Adduri Bhuvaneswari",
        id: "S210083",
        phone: "9390457209",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Tabitha",
        id: "S210965",
        phone: "9493689987",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "M. Bhavani Sankar",
        id: "S210040",
        phone: "7569165675",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Mahammad Nazaneen",
        id: "S220577",
        phone: "9985482301",
        branch: "CSE",
        year: "E1"
      },
      {
        name: "L. Kartikeya",
        id: "S210152",
        phone: "7780386175",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "M. Deepak",
        id: "S210520",
        phone: "7997652281",
        branch: "MECH",
        year: "E2"
      }
    ]
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Team',
    members: [
      {
        name: "P. Karthik (POC)",
        id: "S200858",
        phone: "9515079090",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "N. Bhaskarao",
        id: "S210521",
        phone: "63093 86115",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "D. Kalyan",
        id: "S210189",
        phone: "8309595254",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "Shaik Bansi Basha (POC)",
        id: "S210957",
        phone: "7989943237",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "M. Uday Shankar",
        id: "S210318",
        phone: "8522924589",
        branch: "MECH",
        year: "E2"
      }
    ]
  },
  {
    id: 'print-media',
    name: 'Print And Media Team',
    members: [
      {
        name: "S. Aparna (POC)",
        id: "S210358",
        phone: "9381860873",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "B. Nikitha",
        id: "S220323",
        phone: "7386219915",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "B. Pranay",
        id: "S210615",
        phone: "9014774626",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "Ch. Sai Krishna",
        id: "S201073",
        phone: "8519862538",
        branch: "MECH",
        year: "E2"
      }
    ]
  },
  {
    id: 'tech-expo',
    name: 'Tech Expo Team',
    members: [
      {
        name: "Mahalaxmi",
        id: "S200760",
        phone: "9949463084",
        branch: "ECE",
        year: "E1"
      },
      {
        name: "Mushkran",
        id: "S210959",
        phone: "7207434370",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "K. Akash Varma (POC)",
        id: "S210684",
        phone: "6305412224",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Manoj Kumar Sahu",
        id: "S220076",
        phone: "7396361593",
        branch: "CIVIL",
        year: "E1"
      },
      {
        name: "L. Pooja (POC)",
        id: "S190620",
        phone: "8919630287",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "K. Siva (POC)",
        id: "S210577",
        phone: "9390425069",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "Gireesh",
        id: "S210215",
        phone: "6302655754",
        branch: "EEE",
        year: "E1"
      },
      {
        name: "Paila Karthik",
        id: "S210492",
        phone: "8639867277",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Aditya Batchu (POC)",
        id: "S210639",
        phone: "6300993370",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "K. Harish (POC)",
        id: "S210638",
        phone: "8008295068",
        branch: "MECH",
        year: "E2"
      },
      {
        name: "Y. Raju",
        id: "S210525",
        phone: "7416281399",
        branch: "MECH",
        year: "E2"
      }
    ]
  },
  {
    id: 'disciplinary',
    name: 'Disciplinary Team',
    members: [

      {
        name: "M. Sandeep",
      id: "S220602",
      phone: "7093694136",
      branch: "CIVIL",
      year: "E2"
    },
    {
      name: "R.Venkat(POC)",
      id: "S200814",
      phone: "7680831165",
      branch: "EEE",
      year: "E2"
    },
    {
      name: "K. N. Durga Rao",
      id: "S210220",
      phone: "9963982259",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "Allada Prasanth (POC)",
      id: "S210386",
      phone: "8639453028",
      branch: "CSE",
      year: "E2"
    }
    ]
  },
  {
    id: 'registration-desk',
    name: 'Registration And Help Desk Team',
    members: [

      {
        name: "E. Bharath Kumar",
        id: "S220041",
        phone: "6304079353",
        branch: "ECE",
        year: "E1"
      },
      {
        name: "M. Yasaswiny",
        id: "S210747",
        phone: "8008184682",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "M. Harsha Vardini Devi (POC)",
        id: "S210116",
        phone: "8919675247",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "J. Elisha",
        id: "S200983",
        phone: "7075298359",
        branch: "CIVIL",
        year: "E1"
      },
      {
        name: "K. V. D. Sudeep (POC)",
        id: "S210398",
        phone: "85550 50425",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "D. Rushitha",
        id: "S210767",
        phone: "91218 53189",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "Yadidya Abburi",
        id: "S210784",
        phone: "8688919055",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "B. Pooja (POC)",
        id: "S210441",
        phone: "8688354170",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "T. Jayavardhan",
        id: "S210689",
        phone: "7075413557",
        branch: "MECH",
        year: "E2"
      }
    ]
  },
  {
    id: 'cultural',
    name: 'Cultural  Team',
    members: [
      {
        name: "Lokesh (POC)",
        id: "S210566",
        phone: "9505740689",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "M. Narasimhachalam",
        id: "S210089",
        phone: "9014270401",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "K. Prasanth (POC)",
        id: "S210512",
        phone: "9515058469",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "Sk. Asma (POC)",
        id: "S210828",
        phone: "8639451807",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "T. Nithin Kumar",
        id: "S210838",
        phone: "8341550041",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "G. Bharath",
        id: "S210180",
        phone: "8688478032",
        branch: "MECH",
        year: "E2"
      }
    ]
  },
  {
    id: 'stage management',
    name: 'Stage ManagementTeam',
    members: [

      {
        name: "Sk. Mastan (POC)",
        id: "S200840",
        phone: "6301741274",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Prasanna (POC)",
        id: "S210341",
        phone: "9391486830",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "R. Meghana",
        id: "S210480",
        phone: "9182961348",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "K. Sravanth",
        id: "S210774",
        phone: "7386518823",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "S. Yerri Babu",
        id: "S210994",
        phone: "9963401651",
        branch: "MECH",
        year: "E2"
      }
    ]
  },
  {
    id: 'decoration',
    name: 'Decoration Team',
    members: [

      {
        name: "Viswanadh",
        id: "S210077",
        phone: "8106316656",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "B. Shanmukha Sharanyeswari (POC)",
        id: "S200685",
        phone: "9390142936",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "P. Sai Teja (POC)",
        id: "S210572",
        phone: "9515752375",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "G. Appala Naidu",
        id: "S210297",
        phone: "9346495288",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "B. Sundar (POC)",
        id: "S210203",
        phone: "6305999203",
        branch: "MECH",
        year: "E2"
      },
      {
        name: "A. Karthik",
        id: "S210505",
        phone: "7569949059",
        branch: "MECH",
        year: "E2"
      }
    ]
  },
  {
    id: 'finance',
    name: 'Finance Team',
    members: [

      {
        name: "Shaik Mahaboob Razikh (POC)",
        id: "S210406",
        phone: "9346243176",
        branch: "CSE (Puc)",
        year: "E2"
      },
      {
        name: "Sk. Mansur",
        id: "S210963",
        phone: "7780128882",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "R.Sridhar(POC)",
        id: "S210214",
        phone: "6303185086",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "M. Kamal",
        id: "S210609",
        phone: "9014531655",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "Katnam Rajesh",
        id: "S210132",
        phone: "7032479565",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "T. Harika(POC)",
        id: "S210099",
        phone: "6300238122",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "S. Hyma",
        id: "S220497",
        phone: "9885767526",
        branch: "MECH",
        year: "E1"
      }
    ]
  },
  {
    id: 'alumni-engagement',
    name: 'Alumni EngagementTeam',
    members: [

      {
        name: "N. Anil Kumar (POC)",
        id: "S210410",
        phone: "9959186032",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "S. Dinesh",
        id: "S210263",
        phone: "9346225808",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "S. Nava Deepika",
        id: "S211016",
        phone: "9357510859",
        branch: "CIVIL",
        year: "E2"
      }
    ]
  },
  {
    id: 'design-editing',
    name: 'Design And Editing Team',
    members: [

      {
        name: "R. Venkata Srinadh (POC)",
        id: "S210621",
        phone: "9618994704",
        branch: "CIVIL",
        year: "E2"
      },
      {
        name: "P. Srujan (POC)",
        id: "S210858",
        phone: "7780741078",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "K. Pavan Kumar",
        id: "S221181",
        phone: "9392464904",
        branch: "ECE",
        year: "E1"
      }
    ]
  },
  {
    id: 'photography',
    name: 'Photography Team',
    members: [

      {
        name: "Madiki Sujeev Kumar (POC)",
        id: "S210799",
        phone: "7075464424",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Alex Valle (POC)",
        id: "S210508",
        phone: "9415803637",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "Y. S. Rajasekhar Reddy",
        id: "S210772",
        phone: "8555052036",
        branch: "MECH",
        year: "E2"
      },
      {
        name: "B. Pranay",
        id: "S210645",
        phone: "9014774626",
        branch: "EEE",
        year: "E2"
      },
      {
        name: "S. Pavithra",
        id: "S210496",
        phone: "8978089662",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "A. John Babu",
        id: "S210070",
        phone: "8688604749",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "K. Sampath Kumar (POC)",
        id: "S210244",
        phone: "6300038360",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "J. Lokesh",
        id: "S210383",
        phone: "8309201596",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "K. Harshavardhan",
        id: "S210611",
        phone: "7671915558",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "P. Bhashitha",
        id: "S211052",
        phone: "null",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "D. Urmila",
        id: "S210195",
        phone: "8106406194",
        branch: "CSE",
        year: "E2"
      }
    ]
  },
  {
    id: 'social media',
    name: 'Social Media Team',
    members: [

      {
        name: "Pavan Kalyan",
        id: "S210980",
        phone: "6302168100",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Chappidi Uday Kiran (POC)",
        id: "S210540",
        phone: "8106115118",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "G. Swathi",
        id: "S210740",
        phone: "6281018370",
        branch: "ECE",
        year: "E2"
      },
      {
        name: "A. Gowtham",
        id: "S210614",
        phone: "null",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "Amara Lohith",
        id: "S210379",
        phone: "9491740691",
        branch: "CSE",
        year: "E2"
      },
      {
        name: "M.D Moien",
        id: "S210523",
        phone: "8919489814",
        branch: "CSE",
        year: "E2"
      }
    ]
  },
  {
    id: 'wepon-expo',
    name: 'Weapon Expo Team',
    members: [

      {
        name: "K.Jai Sheel (POC)",
        id: "S220015",
        phone: "9618906525",
        branch: "CSE",
        year: "E1"
      },
      {
        name: "P. Divya",
        id: "S221048",
        phone: "9494521368",
        branch: "ECE",
        year: "E1"
      }
    ]
  },
  {
    id: 'cse-dept.coordinators',
    name: "Computer Science & Engineering Department Coordinators",
    members: [
      {
        role: "Coordinators",
        name: "Kola Mohan Vignesh Kumar",
        id: "S210574",
        phone: "9133637279",
        branch:"CSE"
      },
      {
        role: "Coordinators",
        name: "Marada Sai Mahalakshmi",
        id: "S210135",
        phone: "9398720495",
         branch:"CSE"
      },
      {
        role: "Department Events Coordinators",
        name: "Muthupandiyan Ravi Kiran",
        id: "S210025",
        phone: "7569446112",
         branch:"CSE"
      },
      {
        role: "Department Events Coordinators",
        name: "Tipparthi Divya Sri",
        id: "S210179",
        phone: "9052246041",
         branch:"CSE"
      },
      {
        role: "Department Events Coordinators",
        name: "Ponnada Hema Latha",
        id: "S210585",
        phone: "8919787441",
         branch:"CSE"
      },
      {
        role: "Department Events Coordinators",
        name: "U. Ram Charan",
        id: "S210150",
        phone: "8639814688",
         branch:"CSE"
      },
      {
        role: "Guest Lecture Coordinators",
        name: "Shaik Chintakrindi Khathija",
        id: "S210856",
        phone: "9381600525",
         branch:"CSE"
      },
      {
        role: "Guest Lecture Coordinators",
        name: "Singirapu Pravalika",
        id: "S210837",
        phone: "8688429427",
         branch:"CSE"
      },
      {
        role: "Guest Lecture Coordinators",
        name: "Bharagava Harish",
        id: "S210196",
        phone: "7013122440",
         branch:"CSE"
      },
      {
        role: "Workshop Coordinators",
        name: "Nalla Mokshitha Madabathula Maha",
        id: "S210411",
        phone: "9160614112",
         branch:"CSE"
      },
      {
        role: "Workshop Coordinators",
        name: "Lakshmi",
        id: "S210007",
        phone: "7794098230",
         branch:"CSE"
      },
      {
        role: "Workshop Coordinators",
        name: "Naga Mathyalu",
        id: "S210017",
        phone: "9553895738",
         branch:"CSE"
      },
      {
        role: "Technical Quiz Coordinators",
        name: "Yalakala Pravalika",
        id: "S210043",
        phone: "8106348757",
         branch:"CSE"
      },
      {
        role:"Technical Quiz Coordinators",
        name: "J. Anusha",
        id: "S210100",
        phone: "6300392824",
         branch:"CSE"
      },
      {
        role: "Technical Quiz Coordinators",
        name: "M. P. N. Santosh",
        id: "S210676",
        phone: "8688568544",
         branch:"CSE"
      },
      {
        role: "Design And Social media",
        name: "Pulagala Keerthi Latha",
        id: "S210919",
        phone: "7794042325",
         branch:"CSE"
      },
      {
        role: "Design And Social media",
        name: "Peddada Jaswanth",
        id: "S210301",
        phone: "8121123357",
         branch:"CSE"
      },
      {
        role: "PPT & Paper Presentation Coordinators",
        name: "Nadiminti Thanmai",
        id: "S210108",
        phone: "8328680565",
         branch:"CSE"
      },
	 {
    role: "PPT & Paper Presentation Coordinators",
        name: "Akkupalli Sasi",
        id: "S210815",
        phone: "7981113061",
         branch:"CSE"
      },
      {
        role: "PPT & Paper Presentation Coordinators",
        name: "Gara Bhandhavi",
        id: "S210021",
        phone: "8919216819",
         branch:"CSE"
      },
      {
        role: "PPT & Paper Presentation Coordinators",
        name: "Banki Pranathi",
        id: "S210015",
        phone: "8317663139",
         branch:"CSE"
      },
      {
        role: "Block Decoration Coordinators",
        name: "K. Bhuvana Sai",
        id: "S210323",
        phone: "9346230587",
         branch:"CSE"
      },
      {
        role: "Block Decoration Coordinators",
        name: "Prudhvi Pasila",
        id: "S210503",
        phone: "9866638020",
         branch:"CSE"
      },
      {
        role: "Block Decoration Coordinators",
        name: "Gorja Vanitha",
        id: "S210486",
        phone: "7989151171",
         branch:"CSE"
      }
    ]
  },
{
  id: 'ece-dept.coordinators',
  name: "Electronics And Communication Engineering Department Coordinators",
  members: [
    {
      role: "Department Coordinators",
      name: "G. Lahari",
      id: "S210250",
      phone: "9059637543",
      branch:"ECE"
    },
    {
      role: "Department Coordinators",
      name: "Ch. Pavan Surya",
      id: "S210434",
      phone: "9014404898",
       branch:"ECE"
    },
    {
      role: "Block Decoration",
      name: "K. Vidya Devi",
      id: "S210317",
      phone: "8498907754",
       branch:"ECE"
    },
    {
      role: "Block Decoration",
      name: "R. Vinay",
      id: "S210579",
      phone: "9652105688",
       branch:"ECE"
    },
    {
      role: "Block Decoration",
      name: "D. Mukesh Raju",
      id: "S210126",
      phone: "7780366768",
       branch:"ECE"
    },
    {
      role: "Design & social media",
      name: "M. Sashank",
      id: "S210542",
      phone: "7997254505",
       branch:"ECE"
    },
    {
      role: "Design & social media",
      name: "M. Sravanthi",
      id: "S210130",
      phone: "8919431057",
       branch:"ECE"
    },
    {
      role: "Finance",
      name: "Shama Taslim Baig",
      id: "S210462",
      phone: "7569456877",
       branch:"ECE"
    },
    {
      role: "Finance",
      name: "Swarna Raju",
      id: "S210371",
      phone: "6300271636",
       branch:"ECE"
    },
    {
      role: "Workshop",
      name: "K. Gunasekhar",
      id: "S210453",
      phone: "8008195191",
       branch:"ECE"
    },
    {
      role: "Workshop",
      name: "M. Mouli",
      id: "S210154",
      phone: "8688436170",
       branch:"ECE"
    },
    {
      role: "Guest Lectures",
      name: "M. Jyothsna",
      id: "S210107",
      phone: "9553385887",
       branch:"ECE"
    },
    {
      role: "Guest Lectures",
      name: "Padmini Mariserla",
      id: "S210090",
      phone: "9542531446",
       branch:"ECE"
    },
    {
      role: "Guest Lectures",
      name: "K. Lakshmi Naga Raju",
      id: "S211026",
      phone: "6281509809",
       branch:"ECE"
    },
    {
      role: "Guest Lectures",
      name: "R. Karthik",
      id: "S210515",
      phone: "8919352390",
       branch:"ECE"
    },
    {
      role: "Guest Lectures",
      name: "P. Divya",
      id: "S210185",
      phone: "7989541605",
       branch:"ECE"
    },
    {
      role: "PPT & Paper Presentation",
      name: "K. Amrutha Sai",
      id: "S210663",
      phone: "7842484833",
       branch:"ECE"
    },
    {
      role: "PPT & Paper Presentation",
      name: "L. Vishnu Vardhan",
      id: "S210156",
      phone: "8247711869",
       branch:"ECE"
    },
    {
      role: "PPT & Paper Presentation",
      name: "P. Lahari Bhavani",
      id: "S210278",
      phone: "7981033109",
       branch:"ECE"
    },
    {
      role: "Tech Quiz",
      name: "M. Govindamma Bai",
      id: "S211022",
      phone: "9392562877",
       branch:"ECE"
    },
    {
      role: "Tech Quiz",
      name: "K. Akhil",
      id: "S210982",
      phone: "7569691934",
       branch:"ECE"
    },
    {
      role: "Branch Events",
      name: "B. Sharmila Sri",
      id: "S210198",
      phone: "7993965294",
       branch:"ECE"
    },
    {
      role: "Branch Events",
      name: "P. Kyathi Charitha",
      id: "S210035",
      phone: "8919102487",
       branch:"ECE"
    }
  ]
},
{
  id: 'eee-dept.coordinators',
  name: "Electrical Engineering Department Coordinators List",
  members: [
    {
      role: "Department Coordinators",
      name: "Y. Narendra",
      id: "S210093",
      phone: "63004 18411",
      branch: "EEE"
    },
    {
      role: "Department Coordinators",
      name: "U. Swarupa",
      id: "S210485",
      phone: "6281070051",
      branch: "EEE"
    },
    {
      role: "Paper Presentation",
      name: "G. Nishanth Reddy",
      id: "S210742",
      phone: "63630 98986",
      branch: "EEE"
    },
    {
      role: "Guest Lecture",
      name: "Lahari",
      id: "S221097",
      phone: "78158 69027",
      branch: "EEE"
    },
    {
      role: "Quiz",
      name: "Meghana",
      id: "S210743",
      phone: "9392297205",
      branch: "EEE"
    },
    {
      role: "Quiz",
      name: "M. Joshnavi",
      id: "S210725",
      phone: "8712129242",
      branch: "EEE"
    },
    {
      role: "Workshop",
      name: "Sri Lekha",
      id: "S211131",
      phone: "6281650135",
      branch: "EEE"
    },
    {
      role: "Workshop",
      name: "K. Navya",
      id: "S210724",
      phone: "9398536648",
      branch: "EEE"
    },
    {
      role: "Tech Expo",
      name: "Tejaswini",
      id: "S210680",
      phone: "9346938341",
      branch: "EEE"
    },
    {
      role: "Electrek king",
      name: "K. Manisha",
      id: "S220286",
      phone: "7671030458",
      branch: "EEE"
    },
    {
      role: "Electro Pyramid",
      name: "I. Sai Lakshmi",
      id: "S220700",
      phone: "9154127491",
      branch: "EEE"
    }
  ]
},
{  
  id: 'civil-dept.coordinators',
  name: "CIVIL Engineering Department Coordinators List",
  members: [
    {
      role: "Department Coordinators",
      name: "A. Chaitanya",
      id: "S210487",
      phone: "9347627074",
      branch:"CIVIL"
    },
    {
      role: "Department Coordinators",
      name: "V.V. Durga Neelima",
      id: "S210294",
      phone: "8328671397",
      branch:"CIVIL"
    },
    {
      role: "Decoration",
      name: "M. Sudheeshna",
      id: "S210728",
      phone: "7569788859",
      branch:"CIVIL"
    },
    {
      role: "Workshop & Guest Lecture",
      name: "T. Bhavani",
      id: "S210821",
      phone: "9394507920",
      branch:"CIVIL"
    },
    {
      role: "Workshop & Guest Lecture",
      name: "Chandhana Priya",
      id: "S210113",
      phone: "8555093781",
      branch:"CIVIL"
    },
    {
      role: "Infra & Hospitality",
      name: "M. Omkar",
      id: "S210298",
      phone: "8341421569",
      branch:"CIVIL"
    },
    {
      role: "Infra & Hospitality",
      name: "P. Sailesh Babu",
      id: "S201093",
      phone: "9014944938",
      branch:"CIVIL"
    },
    {
      role: "Structure",
      name: "K. Roja",
      id: "S210898",
      phone: "6301993205",
      branch:"CIVIL"
    },
    {
      role: "Event -1(PPT Presentation)",
      name: "G. Srikar",
      id: "S210200",
      phone: "8328284718",
      branch:"CIVIL"
    },
    {
      role: "Event -2(Tech Quiz)",
      name: "G. Rohith",
      id: "S210473",
      phone: "9652109916",
      branch:"CIVIL"
    },
    {
      role: "Event -3(Escape Room)",
      name: "S. Munna",
      id: "S211120",
      phone: "7416534183",
      branch:"CIVIL"
    },
    {
      role: "Event -4(Concreate Concave)",
      name: "B. Yaswanth",
      id: "S210380",
      phone: "9391464134",
      branch:"CIVIL"
    }
  ]
},

  {   
    id:'mech-dept.coordinators',
    name: "Mechanical Engineering Department Coordinators List",
    members: [
      {
        role: "Department Coordinators",
        name: "J. Jeevan",
        id: "S211002",
        phone: "8328060854",
       branch:"MECH"
      },
      {
        role: "Department Coordinators",
        name: "P. Priyanka",
        id: "S210338",
        phone: "7981023056",
         branch:"MECH"
      },
      {
        role: "Technical Event-1 (Tech Quiz)",
        name: "G. Kiran",
        id: "S210176",
        phone: "9392405280",
         branch:"MECH"
      },
      {
        role: "Technical Event-1 (Tech Quiz)",
        name: "D. Eswar",
        id: "S200649",
        phone: "8074083970",
         branch:"MECH"
      },
      {
        role: "Technical Event-2",
        name: "Y. Vishnuvardhan",
        id: "S200729",
        phone: "8919367431",
         branch:"MECH"
      },
      {
        role: "Technical Event-2",
        name: "B. Hemanth",
        id: "S200920",
        phone: "7075548942",
         branch:"MECH"
      },
      {
        role: "Technical Event-3",
        name: "B. Vasu",
        id: "S210467",
        phone: "9392503258",
         branch:"MECH"
      },
      {
        role: "Technical Event-3",
        name: "K. Srivardhan",
        id: "S221223",
        phone: "6303577302",
         branch:"MECH"
      },
      {
        role: "Technical Event-4",
        name: "J. Mohan",
        id: "S211047",
        phone: "7207347224",
         branch:"MECH"
      },
      {
        role: "Technical Event-4",
        name: "Sk. Nadeem",
        id: "S210781",
        phone: "7731029148",
         branch:"MECH"
      },
      {
        role: "Technical Event-5 (Paper Presentation)",
        name: "S. Yethendra",
        id: "S200304",
        phone: "7093395255",
         branch:"MECH"
      },
      {
        role: "Technical Event-5 (Paper Presentation)",
        name: "G. Rakesh",
        id: "S221164",
        phone: "7780365958",
         branch:"MECH"
      }
    ]
  },
{
  id: 'puc-ppt presentation',
  name: 'PUC PPT Presentation Team',
  members: [

    {
      name: "Kommoju Chinnu (POC)",
      id: "S210455",
      phone: "9381664472",
      branch: "CSE",
      year: "E2"
    },
    {
      name: "Kommala Smily Grace",
      id: "S221094",
      phone: "8121813359",
      branch: "CSE",
      year: "E1"
    },
    {
      name: "Borigi Madhurima",
      id: "S210436",
      phone: "6305889385",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "Malla Santosh",
      id: "S211054",
      phone: "6305889385",
      branch: "CSE",
      year: "E2"
    },
    {
      name: "K. Mohan Kartheek",
      id: "S210016",
      phone: "9391678130",
      branch: "CSE",
      year: "E2"
    },
    {
      name: "K. Pavani (POC)",
      id: "S210506",
      phone: "8309595228",
      branch: "CSE",
      year: "E2"
    }
  ]
},

{
  id: 'puc-tech quiz',
  name: 'PUC Tech Quiz Team',
  members: [

    {
      name: "Dindi Yamini Priya Devi (POC)",
      id: "S210564",
      phone: "8688167198",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "Shaik Kashifa",
      id: "S221115",
      phone: "9014394475",
      branch: "ECE",
      year: "E1"
    },
    {
      name: "Yalla Abhiram",
      id: "S210840",
      phone: "8919117688",
      branch: "CSE",
      year: "E2"
    },
    {
      name: "Routhu Suresh",
      id: "S210027",
      phone: "9014575251",
      branch: "CSE",
      year: "E2"
    },
    {
      name: "Devid Vinayak",
      id: "S210118",
      phone: "8919117688",
      branch: "CSE",
      year: "E2"
    },
    {
      name: "Teja Sree Yadav",
      id: "S211139",
      phone: "6301661004",
      branch: "CIVIL",
      year: "E2"
    }
  ]
},
{
  id: 'puc-lecture series',
  name: 'PUC Lecture Series Team',
  members: [

    {
      name: "Praveen Kumar Inti (POC)",
      id: "S210894",
      phone: "8121142975",
      branch: "CSE",
      year: "E2"
    },
    {
      name: "Chinthada Venkata Siva Durga Rao",
      id: "S210204",
      phone: "8500893526",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "S. Sireesha",
      id: "S210264",
      phone: "7997909969",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "Raghumanda Pardha Saradhi",
      id: "S210305",
      phone: "9908812649",
      branch: "CSE",
      year: "E2"
    },
    {
      name: "Anusha Sanapathi (POC)",
      id: "S210122",
      phone: "9182166849",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "Brahmachaitanya Modepalli",
      id: "S210255",
      phone: "7842719360",
      branch: "ECE",
      year: "E2"
    }
  ]
},
{
  id: 'puc-tech expo',
  name: 'PUC Tech Expo Team',
  members: [

    {
      name: "B. V. Tej Mouli",
      id: "S210111",
      phone: "9392526682",
      branch: "MECH",
      year: "E2"
    },
    {
      name: "M. Tharun",
      id: "S210003",
      phone: "7093974858",
      branch: "MECH",
      year: "E2"
    },
    {
      name: "P. Praveena",
      id: "S210519",
      phone: "8919766908",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "Satya Sree",
      id: "S220974",
      phone: "7989101143",
      branch: "CIVIL",
      year: "E1"
    },
    {
      name: "K. Manoj Kumar (POC)",
      id: "S210293",
      phone: "8074052982",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "T. Harika (POC)",
      id: "S210009",
      phone: "9014694953",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "R. Parinitha",
      id: "S210114",
      phone: "8555864224",
      branch: "ECE",
      year: "E2"
    },
    {
      name: "T. Satyaveni",
      id: "S220490",
      phone: "9392537472",
      branch: "CSE",
      year: "E1"
    },
    {
      name: "Mounica Teketi (POC)",
      id: "S210472",
      phone: "8074188767",
      branch: "CSE",
      year: "E2"
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