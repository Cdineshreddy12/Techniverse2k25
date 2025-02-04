import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return [elementRef, isVisible];
};

const WorkshopCard = ({ workshop, index }) => {
  const [cardRef, isVisible] = useScrollAnimation();
  const isEven = index % 2 === 0;
  
  return (
    <div 
      ref={cardRef}
      className="relative h-full w-[100%] overflow-hidden"
    >
      {/* Animation wrapper */}
      <div className={`absolute inset-0 transition-all duration-500 ease-out
                    ${isVisible ? 'translate-x-0 opacity-100' : 
                      isEven ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'}`}>
        <Link 
          to={`/departments/${workshop.department}/workshops/${workshop.id}`}
          className="block group relative w-full h-full"
        >
          {/* Mobile-visible, desktop-hover glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-cyan-500/5 
                        rounded-xl opacity-50 blur-[1px] transition-all duration-300
                        md:opacity-0 md:group-hover:opacity-0" />
          
          <div className="relative h-full bg-slate-900/95 rounded-xl overflow-hidden border 
                        border-slate-800/50 transition-all duration-300
                        md:hover:scale-[1.01] md:hover:border-slate-700/50">
            {/* Gradient line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-cyan-500/30
                          opacity-100 md:opacity-30 md:group-hover:opacity-100" />
            
            {/* Content container */}
            <div className="flex flex-col h-full">
              {/* Image Section */}
              <div className="w-full h-48 relative">
                <img
                  src={workshop.image}
                  alt={workshop.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 bg-indigo-500/20 rounded-md text-xs font-medium 
                               text-indigo-300 border border-indigo-500/20 backdrop-blur-sm">
                    {workshop.category}
                  </span>
                </div>
                <span className="absolute top-4 right-4 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm 
                             rounded-md text-xs text-slate-300 border border-slate-700/30">
                  {workshop.duration}
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-3 flex-grow">
                {/* Title */}
                <h3 className="text-lg font-semibold text-white">
                  {workshop.title}
                </h3>

                {/* Description with fixed height */}
                <div className="h-12">
                  <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                    {workshop.description}
                  </p>
                </div>

                {/* Time and Date */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <svg className="w-4 h-4 text-indigo-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{workshop.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <svg className="w-4 h-4 text-indigo-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{workshop.time}</span>
                  </div>
                </div>
              </div>

              {/* Register button */}
              <div className="h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
                           flex items-center justify-center transition-all duration-300 
                           opacity-100 md:opacity-80 md:group-hover:opacity-100">
                <span className="text-indigo-300 text-xs font-medium flex items-center gap-1.5">
                  Register Now
                  <svg className="w-3.5 h-3.5 transform translate-x-0 transition-transform group-hover:translate-x-0.5" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Placeholder to maintain layout */}
      <div className="invisible">
        <div className="h-full bg-transparent rounded-xl border border-transparent">
          <div className="h-48" />
          <div className="p-4 sm:p-5 space-y-3">
            <h3 className="text-lg">Title placeholder</h3>
            <div className="h-12">
              <p className="text-sm">Description placeholder</p>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between">
                <span>Date</span>
                <span>Time</span>
              </div>
            </div>
          </div>
          <div className="h-10" />
        </div>
      </div>
    </div>
  );
};

const Workshops = () => {
  const { deptId } = useParams();
  const [headerRef, isHeaderVisible] = useScrollAnimation();

  const workshops = [
    {
      id: 1,
      department: deptId,
      title: "Advanced Web Developments",
      category: "Development",
      date: "2025-02-15",
      time: "10:00 AM - 4:00 PM",
      duration: "6 Hours",
      description: "Master modern web Build scalable applications with industry best practices.",
      image: "	https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800",
      registrationDeadline: "2025-02-10",
    },
    {
      id: 2,
      department: deptId,
      title: "AI & Machine Learning in Production",
      category: "Artificial Intelligence",
      date: "2025-02-20",
      time: "9:00 AM - 5:00 PM",
      duration: "8 Hours",
      description: "Deep dive into practical ML model deployment, optimization, and real-world applications. Hands-on experience with PyTorch and TensorFlow.",
      image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800",
      registrationDeadline: "2025-02-15",
    },
    {
      id: 3,
      department: deptId,
      title: "Cloud Architecture & DevOps Excellence",
      category: "Infrastructure",
      date: "2025-03-05",
      time: "10:00 AM - 3:00 PM",
      duration: "5 Hours",
      description: "Master cloud infrastructure design and DevOps practices. Focus on AWS services, CI/CD pipelines, and microservices architecture.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-03-01",
    },
    {
      id: 1,
      department: deptId,
      title: "Advanced Web Development with Modern Technologies",
      category: "Development",
      date: "2025-02-15",
      time: "10:00 AM - 4:00 PM",
      duration: "6 Hours",
      description: "Master modern web development using React, Node.js, and cutting-edge tools. Build scalable applications with industry best practices.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-02-10",
    },
    {
      id: 2,
      department: deptId,
      title: "AI & Machine Learning in Production",
      category: "Artificial Intelligence",
      date: "2025-02-20",
      time: "9:00 AM - 5:00 PM",
      duration: "8 Hours",
      description: "Deep dive into practical ML model deployment, optimization, and real-world applications. Hands-on experience with PyTorch and TensorFlow.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-02-15",
    },
    {
      id: 3,
      department: deptId,
      title: "Cloud Architecture & DevOps Excellence",
      category: "Infrastructure",
      date: "2025-03-05",
      time: "10:00 AM - 3:00 PM",
      duration: "5 Hours",
      description: "Master cloud infrastructure design and DevOps practices. Focus on AWS services, CI/CD pipelines, and microservices architecture.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-03-01",
    },
    {
      id: 1,
      department: deptId,
      title: "Advanced Web Development with Modern Technologies",
      category: "Development",
      date: "2025-02-15",
      time: "10:00 AM - 4:00 PM",
      duration: "6 Hours",
      description: "Master modern web development using React, Node.js, and cutting-edge tools. Build scalable applications with industry best practices.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-02-10",
    },
    {
      id: 2,
      department: deptId,
      title: "AI & Machine Learning in Production",
      category: "Artificial Intelligence",
      date: "2025-02-20",
      time: "9:00 AM - 5:00 PM",
      duration: "8 Hours",
      description: "Deep dive into practical ML model deployment, optimization, and real-world applications. Hands-on experience with PyTorch and TensorFlow.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-02-15",
    },
    {
      id: 3,
      department: deptId,
      title: "Cloud Architecture & DevOps Excellence",
      category: "Infrastructure",
      date: "2025-03-05",
      time: "10:00 AM - 3:00 PM",
      duration: "5 Hours",
      description: "Master cloud infrastructure design and DevOps practices. Focus on AWS services, CI/CD pipelines, and microservices architecture.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-03-01",
    },
    {
      id: 1,
      department: deptId,
      title: "Advanced Web Development with Modern Technologies",
      category: "Development",
      date: "2025-02-15",
      time: "10:00 AM - 4:00 PM",
      duration: "6 Hours",
      description: "Master modern web development using React, Node.js, and cutting-edge tools. Build scalable applications with industry best practices.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-02-10",
    },
    {
      id: 2,
      department: deptId,
      title: "AI & Machine Learning in Production",
      category: "Artificial Intelligence",
      date: "2025-02-20",
      time: "9:00 AM - 5:00 PM",
      duration: "8 Hours",
      description: "Deep dive into practical ML model deployment, optimization, and real-world applications. Hands-on experience with PyTorch and TensorFlow.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-02-15",
    },
    {
      id: 3,
      department: deptId,
      title: "Cloud Architecture & DevOps Excellence",
      category: "Infrastructure",
      date: "2025-03-05",
      time: "10:00 AM - 3:00 PM",
      duration: "5 Hours",
      description: "Master cloud infrastructure design and DevOps practices. Focus on AWS services, CI/CD pipelines, and microservices architecture.",
      image: "/api/placeholder/400/300",
      registrationDeadline: "2025-03-01",
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Search Section with fixed position animation */}
      <div className="mb-8">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
      Technical Workshops
    </h2>
    <div className="relative w-full sm:w-auto">
      <input
        type="text"
        placeholder="Search workshops..."
        className="w-full sm:w-72 px-3 py-2 text-sm rounded-lg 
                  bg-slate-800 text-white 
                  placeholder:text-slate-400 
                  border border-slate-700 
                  focus:outline-none 
                  focus:border-indigo-500/30 
                  focus:ring-1 
                  focus:ring-indigo-500/20 
                  transition-colors"
      />
    </div>
  </div>
</div>
      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
        {workshops.map((workshop, index) => (
          <WorkshopCard key={`${workshop.id}-${index}`} workshop={workshop} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Workshops;