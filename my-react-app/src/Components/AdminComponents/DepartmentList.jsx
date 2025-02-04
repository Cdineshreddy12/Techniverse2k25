import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import * as Icons from 'lucide-react';

export const DepartmentList = ({ onEdit, availableIcons, onUpdate }) => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  
  const renderIcon = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon className="w-6 h-6" /> : null;
  };
  
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/departments`);
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments || []);
      } else {
        throw new Error(data.error || 'Failed to fetch departments');
      }
    } catch (error) {
      toast.error('Failed to fetch departments');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (department) => {
    onEdit(department);
    onUpdate(department._id); // Pass the department ID to parent
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete department');

      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-white mb-6">Existing Departments</h2>
      <div className="grid gap-6">
        {departments.map((department) => (
          <div
            key={department._id}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${department.color}
                           transition-all duration-300`}
                >
                  {renderIcon(department.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {department.name}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        ({department.shortName})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(department)}
                        className="text-gray-400 hover:text-cyan-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(department._id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                {department.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {department.totalEvents} Events Available
                </span>
                <div className="flex items-center gap-2 text-cyan-400">
                  <span>View Events</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};