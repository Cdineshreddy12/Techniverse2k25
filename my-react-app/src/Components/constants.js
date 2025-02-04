export const AVAILABLE_COLUMNS = [
    'Transaction ID', 'Student Name', 'Email', 'College ID', 'Branch',
    'College Name', 'Package', 'Amount', 'Payment Status', 'Events',
    'Workshops', 'Registration Date', 'Last Updated'
  ];
  
  export const DEFAULT_FILTERS = {
    startDate: '',
    endDate: '',
    paymentStatus: '',
    package: '',
    branch: '',
    searchTerm: '',
    sortBy: '',
    sortOrder: 'asc'
  };
  
  export const COLUMN_WIDTHS = {
    'Transaction ID': '200px',
    'Student Name': '200px',
    'Email': '250px',
    'College ID': '150px',
    'Branch': '150px',
    'College Name': '200px',
    'Package': '150px',
    'Amount': '100px',
    'Payment Status': '150px',
    'Events': '300px',
    'Workshops': '300px',
    'Registration Date': '150px',
    'Last Updated': '150px'
  };
  
  export const SORT_FIELD_MAP = {
    'Transaction ID': 'transactionId',
    'Student Name': 'name',
    'Amount': 'amount',
    'Payment Status': 'status',
    'Package': 'package',
    'Registration Date': 'date'
  };