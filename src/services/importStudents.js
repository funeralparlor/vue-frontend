/**
 * Import students from Excel files (.xlsx or .xlsm)
 * @param {File} file - The Excel file to import (must be .xlsx or .xlsm format)
 * @param {Object} options - Import options
 * @param {boolean} options.headerRow - Whether the first row contains headers (default: true)
 * @param {Object} options.columnMapping - Mapping of Excel columns to student properties
 * @param {number} options.sheetIndex - Index of the sheet to import (default: 0)
 * @param {Function} options.onProgress - Callback for import progress (receives percentage)
 * @returns {Promise<Array>} - Promise resolving to array of imported students
 */
const importStudentsFromExcel = async (file, options = {}) => {
    // Default options
    const {
      headerRow = true,
      columnMapping = {
        'Student ID': 'student_id',
        'Last Name': 'last_name',
        'First Name': 'first_name',
        'Middle Name': 'middle_name',
        'Semester': 'semester',
        'Course': 'course',
        'Campus': 'campus',
        'Scholarship Type': 'scholarship_type'
      },
      sheetIndex = 0,
      onProgress = null
    } = options;
  
    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xlsm') {
      throw new Error('Unsupported file format. Please use .xlsx or .xlsm files only.');
    }
  
    try {
      // Import required libraries (needs to be installed in your project)
      const XLSX = await import('xlsx');
      
      // Read the file
      const reader = new FileReader();
      
      // Create a promise to handle the file reading
      const fileReadPromise = new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read the file'));
      });
      
      // Start reading the file as an array buffer
      reader.readAsArrayBuffer(file);
      
      // Wait for the file to be read
      const arrayBuffer = await fileReadPromise;
      
      // Parse the Excel file
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the worksheet
      const sheetNames = workbook.SheetNames;
      if (sheetIndex >= sheetNames.length) {
        throw new Error(`Sheet index ${sheetIndex} is out of bounds. File only has ${sheetNames.length} sheets.`);
      }
      
      const worksheet = workbook.Sheets[sheetNames[sheetIndex]];
      
      // Convert the worksheet to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: headerRow ? 1 : undefined });
      
      // Process the data
      const importedStudents = [];
      const totalRows = rawData.length;
      
      for (let i = 0; i < totalRows; i++) {
        const row = rawData[i];
        const student = {};
        
        // Map Excel columns to student properties
        Object.entries(columnMapping).forEach(([excelColumn, studentProperty]) => {
          student[studentProperty] = row[excelColumn] !== undefined ? String(row[excelColumn]) : '';
        });
        
        // Add the processed student
        importedStudents.push(student);
        
        // Report progress if callback provided
        if (onProgress && typeof onProgress === 'function') {
          onProgress(Math.round((i + 1) / totalRows * 100));
        }
      }
      
      return importedStudents;
    } catch (error) {
      console.error('Import error:', error);
      throw new Error(`Failed to import students: ${error.message}`);
    }
  };
  
  export default importStudentsFromExcel;