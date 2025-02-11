  import React from 'react';
import { X ,Plus,Minus} from 'lucide-react';
const Input = ({ label, type = "text", value, onChange, className = "" }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-400">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      className={`w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
        text-white placeholder-slate-400 focus:outline-none focus:ring-2 
        focus:ring-sky-500 focus:border-transparent ${className}`}
    />
  </div>
);

const Select = ({ label, value, onChange, options, className = "" }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-400">{label}</label>
    <select
      value={value || ""}
      onChange={onChange}
      className={`w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
        text-white placeholder-slate-400 focus:outline-none focus:ring-2 
        focus:ring-sky-500 focus:border-transparent ${className}`}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);


const Textarea = ({ label, value, onChange, rows = 4 }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-400">{label}</label>
    <textarea
      value={value || ''}
      onChange={onChange}
      rows={rows}
      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
        text-white placeholder-slate-400 focus:outline-none focus:ring-2 
        focus:ring-sky-500 focus:border-transparent resize-none"
    />
  </div>
);

const ArrayInput = ({ label, items, onChange, addLabel = "Add Item" }) => {
  const addItem = () => {
    onChange([...items, '']);
  };

  const updateItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-400">{label}</label>
        <button
          type="button"
          onClick={addItem}
          className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> {addLabel}
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg 
              text-white placeholder-slate-400 focus:outline-none focus:ring-2 
              focus:ring-sky-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="p-2 text-red-400 hover:text-red-300"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const SectionForm = ({ section, onChange, onRemove }) => {
  return (
    <div className="p-4 border border-slate-700 rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-white">Section Details</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-300"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
      
      <Input
        label="Section Name"
        value={section.name}
        onChange={(e) => onChange({ ...section, name: e.target.value })}
      />
      
      <Textarea
        label="Description"
        value={section.description}
        onChange={(e) => onChange({ ...section, description: e.target.value })}
      />
      
      <Input
        label="Duration"
        value={section.duration}
        onChange={(e) => onChange({ ...section, duration: e.target.value })}
      />

      <ArrayInput
        label="Requirements"
        items={section.requirements || []}
        onChange={(requirements) => onChange({ ...section, requirements })}
        addLabel="Add Requirement"
      />
    </div>
  );
};

const RoundForm = ({ rounds, onChange }) => {
  const addRound = () => {
    onChange([
      ...rounds,
      {
        roundNumber: rounds.length + 1,
        name: '',
        description: '',
        duration: '',
        startTime: '',
        endTime: '',
        venue: '',
        sections: [],
        requirements: [],
        specialRules: [],
        qualificationCriteria: '',
        eliminationType: 'score',
        status: 'upcoming'
      }
    ]);
  };

  const updateRound = (index, field, value) => {
    const updatedRounds = [...rounds];
    updatedRounds[index] = { ...updatedRounds[index], [field]: value };
    onChange(updatedRounds);
  };

  const removeRound = (index) => {
    onChange(rounds.filter((_, i) => i !== index));
  };

  const addSection = (roundIndex) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].sections = [
      ...(updatedRounds[roundIndex].sections || []),
      {
        name: '',
        description: '',
        duration: '',
        requirements: []
      }
    ];
    onChange(updatedRounds);
  };

  const updateSection = (roundIndex, sectionIndex, newSection) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].sections[sectionIndex] = newSection;
    onChange(updatedRounds);
  };

  const removeSection = (roundIndex, sectionIndex) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].sections = updatedRounds[roundIndex].sections
      .filter((_, i) => i !== sectionIndex);
    onChange(updatedRounds);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Rounds</h3>
        <button
          type="button"
          onClick={addRound}
          className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Round
        </button>
      </div>

      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="p-6 border border-slate-700 rounded-lg space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-medium text-white">Round {round.roundNumber}</h4>
            <button
              type="button"
              onClick={() => removeRound(roundIndex)}
              className="text-red-400 hover:text-red-300"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Round Name"
              value={round.name}
              onChange={(e) => updateRound(roundIndex, 'name', e.target.value)}
            />
            
            <Input
              label="Duration"
              value={round.duration}
              onChange={(e) => updateRound(roundIndex, 'duration', e.target.value)}
            />
            
            <Input
              label="Start Time"
              type="datetime-local"
              value={round.startTime}
              onChange={(e) => updateRound(roundIndex, 'startTime', e.target.value)}
            />
            
            <Input
              label="End Time"
              type="datetime-local"
              value={round.endTime}
              onChange={(e) => updateRound(roundIndex, 'endTime', e.target.value)}
            />
            
            <Input
              label="Venue"
              value={round.venue}
              onChange={(e) => updateRound(roundIndex, 'venue', e.target.value)}
            />
            
            <Select
              label="Elimination Type"
              value={round.eliminationType}
              onChange={(e) => updateRound(roundIndex, 'eliminationType', e.target.value)}
              options={[
                { value: 'score', label: 'Score Based' },
                { value: 'time', label: 'Time Based' },
                { value: 'completion', label: 'Completion Based' }
              ]}
            />
          </div>

          <Textarea
            label="Description"
            value={round.description}
            onChange={(e) => updateRound(roundIndex, 'description', e.target.value)}
          />

          <Textarea
            label="Qualification Criteria"
            value={round.qualificationCriteria}
            onChange={(e) => updateRound(roundIndex, 'qualificationCriteria', e.target.value)}
          />

          <ArrayInput
            label="Special Rules"
            items={round.specialRules || []}
            onChange={(specialRules) => updateRound(roundIndex, 'specialRules', specialRules)}
            addLabel="Add Rule"
          />

          <ArrayInput
            label="Requirements"
            items={round.requirements || []}
            onChange={(requirements) => updateRound(roundIndex, 'requirements', requirements)}
            addLabel="Add Requirement"
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="text-lg font-medium text-white">Sections</h5>
              <button
                type="button"
                onClick={() => addSection(roundIndex)}
                className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>

            {round.sections?.map((section, sectionIndex) => (
              <SectionForm
                key={sectionIndex}
                section={section}
                onChange={(newSection) => updateSection(roundIndex, sectionIndex, newSection)}
                onRemove={() => removeSection(roundIndex, sectionIndex)}
              />
            ))}
          </div>
        </div>
      ))}
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
      // Get the correct URL to display
      const displayUrl = value?.url || value;
  
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <div className="relative h-48 border border-slate-600 rounded-lg bg-slate-700/30 overflow-hidden">
          {displayUrl ? (
            <>
              <img 
                src={displayUrl}
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Click to upload image
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    );
  };


  export { RoundForm, CoordinatorForm, ImageUpload };