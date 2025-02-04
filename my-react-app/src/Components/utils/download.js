export const downloadRegistrations = async (filtered, filters, selectedColumns) => {
  try {
    if (filtered) {
      // For filtered registrations - use POST
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/export-filtered-registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        body: JSON.stringify({
          ...filters,
          selectedColumns
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Download failed');
      }

      const blob = await response.blob();
      handleDownload(blob, `Techniverse_Filtered_Registrations_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);

    } else {
      // For all registrations - use GET with query params
      const queryParams = new URLSearchParams({
        columns: JSON.stringify(selectedColumns)
      });

      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/export-registrations?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Download failed');
      }

      const blob = await response.blob();
      handleDownload(blob, `Techniverse_Registrations_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    }
  } catch (error) {
    console.error('Download error:', error);
    throw new Error(error.message || 'Download failed');
  }
};

const handleDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.id = 'temp-download-link';
  a.style.display = 'none';

  // Clean up previous elements
  const oldLink = document.querySelector('#temp-download-link');
  if (oldLink) {
    document.body.removeChild(oldLink);
  }

  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
};