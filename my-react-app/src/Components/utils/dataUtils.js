export const getBasicColumnValue = (reg, column) => {
    if (!reg) return 'N/A';
  
    switch (column) {
      case 'Transaction ID':
        return reg.transactionId || 'N/A';
      case 'Student Name':
        return reg.student?.name || 'N/A';
      case 'Email':
        return reg.student?.email || 'N/A';
      case 'College ID':
        return reg.student?.collegeId || 'N/A';
      case 'Branch':
        return reg.student?.branch || 'N/A';
      case 'College Name':
        return reg.student?.collegeName || 'N/A';
      case 'Package':
        return reg.combo?.name || 'N/A';
      case 'Amount':
        return `₹${reg.amount || 0}`;
      case 'Events':
        return reg.selectedEvents?.map(e => e.eventName).join(', ') || 'N/A';
      case 'Workshops':
        return reg.selectedWorkshops?.map(w => w.workshopName).join(', ') || 'N/A';
      case 'Registration Date':
        return reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'N/A';
      case 'Last Updated':
        return reg.updatedAt ? new Date(reg.updatedAt).toLocaleDateString() : 'N/A';
      default:
        return 'N/A';
    }
  };