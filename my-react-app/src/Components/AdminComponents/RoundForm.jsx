  import React from 'react';

  const Input = ({ label, type = "text", value, onChange }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
          rounded-lg text-white placeholder-slate-400 focus:outline-none 
          focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />
    </div>
  );

  const Textarea = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-400">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows="4"
        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 
          rounded-lg text-white placeholder-slate-400 focus:outline-none 
          focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
      />
    </div>
  );



  const RoundForm = ({ rounds, onChange }) => {
    // Helper function to format date for datetime-local input
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
    };

    const addRound = () => {
      onChange([
        ...rounds,
        {
          id: Date.now().toString(),
          roundNumber: rounds.length + 1,
          description: '',
          startTime: '',
          endTime: '',
          venue: ''
        }
      ]);
    };

    const updateRound = (index, field, value) => {
      const newRounds = [...rounds];
      if (field === 'startTime' || field === 'endTime') {
        // Convert the date string to ISO format for storage
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          value = date.toISOString();
        }
      }
      newRounds[index] = { ...newRounds[index], [field]: value };
      onChange(newRounds);
    };

    const removeRound = (index) => {
      const newRounds = rounds.filter((_, i) => i !== index).map((round, idx) => ({
        ...round,
        roundNumber: idx + 1
      }));
      onChange(newRounds);
    };

    return (
      <div className="space-y-4">
        {rounds.map((round, index) => (
          <div key={round.id} className="bg-slate-700/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-white font-medium">Round {round.roundNumber}</h5>
              <button
                onClick={() => removeRound(index)}
                className="p-1 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Time"
                type="datetime-local"
                value={formatDateForInput(round.startTime)}
                onChange={(e) => updateRound(index, 'startTime', e.target.value)}
              />
              <Input
                label="End Time"
                type="datetime-local"
                value={formatDateForInput(round.endTime)}
                onChange={(e) => updateRound(index, 'endTime', e.target.value)}
              />
            </div>
            
            <Input
              label="Venue"
              value={round.venue}
              onChange={(e) => updateRound(index, 'venue', e.target.value)}
            />
            
            <Textarea
              label="Description"
              value={round.description}
              onChange={(e) => updateRound(index, 'description', e.target.value)}
            />
          </div>
        ))}
        
        <button 
          type="button" 
          onClick={addRound}
          className="w-full px-4 py-2 border border-slate-600 text-white rounded-lg
            hover:bg-slate-700 transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Round
        </button>
      </div>
    );
  };


  const CoordinatorForm = ({ coordinators, onChange }) => {
    const addCoordinator = () => {
      onChange([
        ...coordinators,
        {
          id: Date.now().toString(),
          name: '',
          email: '',
          phone: '',
          photo: ''
        }
      ]);
    };

    const updateCoordinator = (index, field, value) => {
      const newCoordinators = [...coordinators];
      newCoordinators[index] = { ...newCoordinators[index], [field]: value };
      onChange(newCoordinators);
    };

    const removeCoordinator = (index) => {
      onChange(coordinators.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-4">
        {coordinators.map((coordinator, index) => (
          <div key={coordinator.id} className="bg-slate-700/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-white font-medium">Coordinator {index + 1}</h5>
              <button
                onClick={() => removeCoordinator(index)}
                className="p-1 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                value={coordinator.name}
                onChange={(e) => updateCoordinator(index, 'name', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                value={coordinator.email}
                onChange={(e) => updateCoordinator(index, 'email', e.target.value)}
              />
            </div>
            
            <Input
              label="Phone"
              value={coordinator.phone}
              onChange={(e) => updateCoordinator(index, 'phone', e.target.value)}
            />
            
            <ImageUpload
              label="Photo"
              value={coordinator.photo}
              onChange={(url) => updateCoordinator(index, 'photo', url)}
            />
          </div>
        ))}
        
        <button 
          type="button" 
          onClick={addCoordinator}
          className="w-full px-4 py-2 border border-slate-600 text-white rounded-lg
            hover:bg-slate-700 transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Coordinator
        </button>
      </div>
    );
  };

  const ImageUpload = ({ label, value, onChange }) => {
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        onChange({ file, url }); // Pass both file and URL
      }
    };
    

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
          {value ? (
            <div className="relative">
              <img
                src={value}
                alt={label}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                onClick={() => onChange('')}
                className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/30 
                  text-red-400 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id={`image-upload-${label}`}
              />
              <label
                htmlFor={`image-upload-${label}`}
                className="cursor-pointer text-gray-400 hover:text-white"
              >
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-lg bg-gray-700/50 
                    flex items-center justify-center hover:bg-gray-600/50 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span>Click to upload image</span>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  };

  export { RoundForm, CoordinatorForm, ImageUpload };