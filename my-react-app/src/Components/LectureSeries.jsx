import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

const speakers = [
    {
        name: "Prof. Ch. Subrahmanyam",
        title: "FRSC",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020572/9_hcn52n.png",
        department: "Dept of Chemistry",
        institution: "IIT Hyderabad",
        topic: "Catalysis, Nanomaterials and Energy Systems",
        description: "Catalysis, Nanomaterials and Energy Systems",
        date: "March 8, 2025",
        time: "09:00 AM - 10:00 AM",
        venue: "Seminar Hall"
    },
    {
        name: "Prof. V. Vijaya Saradhi",
        title: "Professor",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020569/10_vcekwc.png",
        department: "Dept of CSE",
        institution: "IIT Guwahati",
        topic: "Machine Learning, Kernel Methods, Data Mining and their applications",
        description: "Machine Learning, Kernel Methods, Data Mining and their applications",
        date: "March 8, 2025",
        time: "10:00 AM - 11:00 AM",
        venue: "Workshop Building"
    },
    
    {
        name: "Dr. Vivek Vijay",
        title: "Associate Professor",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020571/11_onbonf.png",
        department: "Dept of Mathematics",
        institution: "IIT Jodhpur",
        topic: "Financial Risk Analysis, Categorical Data Analysis and Regression",
        description: "Financial Risk Analysis, Categorical Data Analysis and Regression",
        date: "March 7, 2025",
        time: "11:30 AM - 12:30 PM",
        venue: "Workshop Building"
    },
    {
        name: "Dr. Valbhaneni Keerthi",
        title: "Scientist-SF",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020568/12_xjyvkz.png",
        department: "National Remote Sensing Center",
        institution: "ISRO-Dept of Space, Hyderabad",
        topic: "Data Processing Area",
        description: "Data Processing Area",
        date: "March 7, 2025",
        time: "03:00 PM - 04:00 PM",
        venue: "Workshop Building"
    },
    {
        name: "Prof. Atul R Ballal",
        title: "Professor",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020567/1_e31qrp.png",
        department: "Dept of Metallurgical & Material Engineering",
        institution: "VNIT Nagpur",
        topic: "Mechanical Metallurgy, Ceramic Engineering and Fuel Cells",
        description: "Mechanical Metallurgy, Ceramic Engineering and Fuel Cells",
        date: "March 8, 2025",
        time: "10:00 AM - 11:00 AM",
        venue: "Seminar Hall"
    },
    {
        name: "Dr. Subrahmanyam",
        title: "Associate Professor",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020566/3_xq9vxd.png",
        department: "Dept of Electrical Engineering",
        institution: "IIT Tirupati",
        topic: "Medical Imaging, Machine Learning / Deep Learning, Computer Vision and Signal Processing",
        description: "Medical Imaging, Machine Learning / Deep Learning, Computer Vision and Signal Processing",
        date: "March 8, 2025",
        time: "11:30 AM - 12:30 PM",
        venue: "Seminar Hall"
    },
    {
        name: "Dr. V. Venkata Rao",
        title: "Assistant Professor",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020567/4_rhwaay.png",
        department: "Harvard Medical School",
        institution: "Massachusetts General Hospital, Boston, USA",
        topic: "Cancer Metabolism",
        description: "Cancer Metabolism",
        date: "March 8, 2025",
        time: "09:00 AM - 10:00 AM",
        venue: "Workshop Building"
    },
    {
        name: "Dr. K. Srinivas Bhaskar",
        title: "Associate Professor",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020570/5_ecgil6.png",
        department: "School of Electrical & Computer Science",
        institution: "IIT Bhubaneswar",
        topic: "Power quality, Power Electronics and applications in Power Systems",
        description: "Power quality, Power Electronics and applications in Power Systems",
        date: "March 8, 2025",
        time: "11:30 AM - 12:30 PM",
        venue: "Workshop Building"
    },
     
    {
        name: "Dr. SubbaRao Pichuka",
        title: "Assistant Professor",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020566/2_c3jhbn.png",
        department: "Dept of Civil Engineering",
        institution: "IIT Madras",
        topic: "Hydroclimatology and Hydrological Extreme Climate Change",
        description: "Hydroclimatology and Hydrological Extreme Climate Change",
        date: "March 8, 2025",
        time: "03:00 PM - 04:00 PM",
        venue: "Seminar Hall"
    },
    {
        name: "Dr. Satish Makena",
        title: "Chief Business Development Director",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020568/8_zgi1zk.png",
        department: "Leo Global Overseas",
        institution: "London",
        topic: "Overseas Education consultants",
        description: "Overseas Education consultants",
        date: "March 9, 2025",
        time: "02:00 PM - 03:00 PM",
        venue: "Workshop Building"
    },
  

    {
        name: "Mr. Sudheer Reddy",
        title: "Founder & CEO",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020567/7_exdmx9.png",
        department: "Sense Semi Conductor & IT Solutions PVT LTD",
        institution: "Amaravathi",
        topic: "Entrepreneurship",
        description: "Entrepreneurship",
        date: "March 9, 2025",
        time: "11:30 AM - 12:30 PM",
        venue: "Workshop Building"
    },
    {
        name: "Mr. Paritala Sivaji",
        title: "Product Manager",
        department: "MBA, EDPM-IIM Lucknow",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740020570/6_vc1wzd.png",
        institution: "Ivy-Emami Group",
        topic: "Entrepreneurship in the AI world",
        description: "Entrepreneurship in the AI world",
        date: "March 7, 2025",
        time: "10:00 AM - 11:00 AM",
        venue: "Workshop Building"
    }
  
    
 
  
];

const SpeakerCard = ({ speaker, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="p-4"
        animate={{ backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center">
          <motion.div 
            className="w-32 h-32 mb-4 rounded-xl overflow-hidden ring-2 ring-blue-400 shadow-lg"
            animate={{ 
              boxShadow: isHovered 
                ? '0 0 25px rgba(59, 130, 246, 0.4)' 
                : '0 0 15px rgba(59, 130, 246, 0.2)'
            }}
          >
            <motion.img
              src={speaker.image}
              alt={speaker.name}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          <motion.div 
            className="text-center"
            animate={{ y: isHovered ? -5 : 0 }}
          >
            <h3 className="text-xl font-bold text-blue-400 mb-1">{speaker.name}</h3>
            <p className="text-emerald-400 text-sm mb-1">{speaker.title}</p>
            <p className="text-gray-300 text-xs">{speaker.department}</p>
            <p className="text-gray-400 text-xs mb-3">{speaker.institution}</p>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
              className="bg-gray-800/50 rounded-lg p-3 mt-2"
            >
              <div className="flex items-center gap-2 text-blue-300 mb-2">
                <BookOpen size={16} />
                <p className="text-sm font-semibold">{speaker.topic}</p>
              </div>
              
              <p className="text-gray-400 text-xs mb-3">{speaker.description}</p>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar size={14} className="text-emerald-400" />
                  <span>{speaker.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={14} className="text-emerald-400" />
                  <span>{speaker.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={14} className="text-emerald-400" />
                  <span>{speaker.venue}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const LectureSeries = () => {
  return (
    <div className="bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
            KeyNote and TechTalk Speakers
          </h1>
          <p className="text-gray-400 mb-2">
            Learn from the best in the industry
            </p>
          <motion.div 
            className="w-24 h-1 bg-blue-500 mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
        </motion.div>
        <p className="text-center text-gray-400 mb-12">
                 Click on you favourite speaker to know more
            </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {speakers.map((speaker, index) => (
            <SpeakerCard key={index} speaker={speaker} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LectureSeries;