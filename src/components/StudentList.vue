<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '../services/api';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { Bars3Icon, XMarkIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import { DocumentArrowDownIcon, DocumentTextIcon } from '@heroicons/vue/24/outline';
import { utils as xlsxUtils, writeFile as writeXLSXFile } from 'xlsx';
import MainLayout from '@/components/MainLayout.vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ChevronDownIcon, XCircleIcon, CheckIcon } from '@heroicons/vue/24/outline';

// Reactive state
const filterYearLevel = ref([]);
const filterScholars = ref([]);
const filterSemester = ref([]);
const filterCourse = ref([]);
const filterCampus = ref([]);
const filterScholarshipType = ref([]);
const dropdownStates = ref({
  semester: false,
  course: false,
  campus: false,
  scholarshipType: false,
  yearlevel: false,
  perPage: false,
});

const selectedCountLabels = computed(() => ({
  yearlevel: filterYearLevel.value.length ? `${filterYearLevel.value.length} selected` : 'Year Level',
  semester: filterSemester.value.length ? `${filterSemester.value.length} selected` : 'All Colleges',
  course: filterCourse.value.length ? `${filterCourse.value.length} selected` : 'All Courses',
  campus: filterCampus.value.length ? `${filterCampus.value.length} selected` : 'All Campuses',
  scholarshipType: filterScholarshipType.value.length ? `${filterScholarshipType.value.length} selected` : 'Student Status',
  scholar_shiptype: filterScholars.value.length ? `${filterScholars.value.length} selected` : 'Scholarship',
}));

const students = ref([]);
const error = ref(null);
const isLoading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalStudents = ref(0);
const totalPages = ref(1);
const selectedStudents = ref([]);
const selectAll = ref(false);


// Added search functionality
const isSearching = ref(false);
const searchResults = ref([]);
const showSearchResults = computed(() => searchQuery.value.trim() !== '');

// New: Display options for items per page
const perPageOptions = [
  { value: 10, label: '10 per page' },
  { value: 25, label: '25 per page' },
  { value: 50, label: '50 per page' },
  { value: 100, label: '100 per page' },
  { value: 10000, label: 'All' },
];

// Toggle selection for all students
const toggleSelectAll = () => {
  if (selectAll.value) {
    // Add all students on the current page to selections
    paginatedStudents.value.forEach(student => {
      if (!selectedStudents.value.includes(student.id)) {
        selectedStudents.value.push(student.id);
      }
    });
  } else {
    // Remove only the currently visible students from selection
    const visibleIds = paginatedStudents.value.map(student => student.id);
    selectedStudents.value = selectedStudents.value.filter(id => !visibleIds.includes(id));
  }
};

// Watch for changes to the selectAll state
watch(selectAll, toggleSelectAll);

// Toggle selection for individual student
const toggleSelectStudent = (studentId) => {
  const index = selectedStudents.value.indexOf(studentId);
  if (index === -1) {
    selectedStudents.value.push(studentId);
  } else {
    selectedStudents.value.splice(index, 1);
  }
};

// Check if a student is selected
const isStudentSelected = (studentId) => {
  return selectedStudents.value.includes(studentId);
};

// Watch for changes to pagination to reset selectAll
watch([currentPage, itemsPerPage], () => {
 loadStudents();
});

// Dropdown
const toggleDropdown = (filterType) => {
  // Close all other dropdowns first
  Object.keys(dropdownStates.value).forEach(key => {
    if (key !== filterType) {
      dropdownStates.value[key] = false;
    }
  });
  dropdownStates.value[filterType] = !dropdownStates.value[filterType];
};

// Close dropdowns when clicking outside
const closeDropdowns = (event) => {
  if (!event.target.closest('.filter-dropdown-container')) {
    Object.keys(dropdownStates.value).forEach(key => {
      dropdownStates.value[key] = false;
    });
  }
};

// Add event listener for closing dropdowns
onMounted(() => {
  document.addEventListener('click', closeDropdowns);
});

const toggleFilter = (filterType, value) => {
  const filterRef = {
    yearlevel: filterYearLevel,
    semester: filterSemester,
    course: filterCourse,
    campus: filterCampus,
    scholarshipType: filterScholarshipType,
    scholar_shiptype: filterScholars,
  }[filterType];

  if (filterRef.value.includes(value)) {
    filterRef.value = filterRef.value.filter((item) => item !== value);
  } else {
    filterRef.value.push(value);
  }
};

const removeFilter = (filterType, value) => {
  const filterRef = {
    yearlevel: filterYearLevel,
    semester: filterSemester,
    course: filterCourse,
    campus: filterCampus,
    scholarshipType: filterScholarshipType,
    scholar_shiptype: filterScholars,
  }[filterType];

  filterRef.value = filterRef.value.filter((item) => item !== value);
};

const clearFilters = () => {
  filterYearLevel.value = [];
  filterSemester.value = [];
  filterCourse.value = [];
  filterCampus.value = [];
  filterScholarshipType.value = [];
  filterScholars.value = [];
  searchQuery.value = '';
  currentPage.value = 1;
  selectedStudents.value = [];
  selectAll.value = false;
  loadStudents();
};

// User and navigation data
const user = {
  name: 'Admin',
  email: 'admin@example.com',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Bulacan_State_University_logo.png',
};

// Fetch user data on component mount
onMounted(async () => {
  try {
    const response = await api.get('/user');
    user.name = response.data.name;
    user.email = response.data.email;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    alert('Failed to load user information. Please try again.');
  }
});


// Computed properties
const filterOptions = computed(() => ({
  yearlevel: [...new Set(students.value.map(s => s.year_level))].sort(),
  semester: [...new Set(students.value.map(s => s.college))].sort(),
  course: [...new Set(students.value.map(s => s.course))].sort(),
  campus: [...new Set(students.value.map(s => s.campus))].sort(),
  scholarshipType: [...new Set(students.value.map(s => s.student_status))].sort(),
  scholar_shiptype: [...new Set(students.value.map(s => s.scholar_ship))].sort(),
}));

// Using the data returned from the API
const paginatedStudents = computed(() => {
  return students.value;
});

// Add filteredStudents computed property to fix template references
const filteredStudents = computed(() => {
  return students.value;
});

// Change per page selection
const changeItemsPerPage = (value) => {
  itemsPerPage.value = value;
  currentPage.value = 1;
  loadStudents();
  dropdownStates.value.perPage = false;
};

  // Helper function to maintain selected students
  const maintainSelectedStudents = () => {
   
  };

  // Actions
  const loadStudents = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Prepare query parameters for API request
        const params = {
      page: itemsPerPage.value === -1 ? 1 : currentPage.value,
      ...(itemsPerPage.value !== -1 && { limit: itemsPerPage.value }),
      search: searchQuery.value || undefined,
    };

      // Add filter parameters if they exist
      if (filterYearLevel.value.length > 0) {
        params.year_level = filterYearLevel.value;
      }
      if (filterSemester.value.length > 0) {
        params.college = filterSemester.value;
      }
      if (filterCourse.value.length > 0) {
        params.course = filterCourse.value;
      }
      if (filterCampus.value.length > 0) {
        params.campus = filterCampus.value;
      }
      if (filterScholarshipType.value.length > 0) {
        params.student_status = filterScholarshipType.value;
      }
      if (filterScholars.value.length > 0) {
        params.scholar_ship = filterScholars.value;
      }

      // Make the API request
      const response = await api.get('/students', { params });

      // Update the state with the response data
      students.value = response.data.data;
      currentPage.value = response.data.page;
      totalPages.value = response.data.pages;
      totalStudents.value = response.data.total;

     if (students.value.length > 0) {
      const visibleStudentIds = students.value.map(student => student.id);
      const allVisibleSelected = visibleStudentIds.every(id => selectedStudents.value.includes(id));
      selectAll.value = allVisibleSelected;
    } else {
      selectAll.value = false;
    }

  } catch (err) {
    // Handle errors
    error.value = 'Failed to load students. Please try again later.';
    console.error('Error loading students:', err);

    // Clear the students list on error
    students.value = [];
    totalStudents.value = 0;
    totalPages.value = 1;
    currentPage.value = 1;

  } finally {
    // Always set loading to false
    isLoading.value = false;
  }
};

// Watch for changes to filters to reload data
watch([filterYearLevel, filterSemester, filterCourse, filterCampus, filterScholarshipType, filterScholars, searchQuery], () => {
  currentPage.value = 1;
  loadStudents();
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadStudents();
  }
};

// Filter refs mapping for dynamic binding
const filterRefs = {
  yearlevel: filterYearLevel,
  semester: filterSemester,
  course: filterCourse,
  campus: filterCampus,
  scholarshipType: filterScholarshipType,
   scholar_shiptype: filterScholars
};

// Get only the selected students or all if none selected
const getExportData = () => {
  if (selectedStudents.value.length === 0) {
    return students.value;
  }
  return students.value.filter(student => selectedStudents.value.includes(student.id));
};


//////////////////////
// Enhanced Excel Export
const exportToExcel = async () => {
  // If we have selected students but they're not on the current page, we need to fetch them
  let exportData = getExportData();
  
  // If no students are selected and we want to export all filtered students
  if (selectedStudents.value.length === 0 && itemsPerPage.value !== -1) {
    try {
      isLoading.value = true;
      
      // Prepare query parameters to get all filtered students
      const params = {
        limit: -1, // Get all students matching filters
        search: searchQuery.value || undefined,
      };
      
      if (filterYearLevel.value.length > 0) params.year_level = filterYearLevel.value;
      if (filterSemester.value.length > 0) params.college = filterSemester.value;
      if (filterCourse.value.length > 0) params.course = filterCourse.value;
      if (filterCampus.value.length > 0) params.campus = filterCampus.value;
      if (filterScholarshipType.value.length > 0) params.student_status = filterScholarshipType.value;
      if (filterScholars.value.length > 0) params.scholar_ship = filterScholars.value;
      
      const response = await api.get('/students', { params });
      exportData = response.data.data;
    } catch (err) {
      error.value = 'Failed to export data. Please try again later.';
      console.error(err);
      return;
    } finally {
      isLoading.value = false;
    }
  }

  const data = exportData.map(student => ({
    'STUDENT NUMBER': student.student_id,
    'LAST NAME': student.last_name,
    'GIVEN NAME': student.first_name,
    'MIDDLE NAME': student.middle_name || '-',
    'COURSE': student.course,
    'COLLEGE': student.college,
    'CAMPUS': student.campus,
    'YEAR LEVEL': student.year_level,
    'GENDER': student.gender,
    'DATE OF BIRTH': student.birthday,
    'PLACE OF BIRTH': student.birth_place,
    'COMPLETE ADDRESS': student.comp_address,
    'BARANGAY': student.barangay,
    'TOWN/CITY': student.town,
    'Province': student.province,
    'Email': student.email,
    'MobileNo': student.number,
    'FatherName': student.father_name,
    'Father_Occupation': student.father_occup,
    'MotherName': student.mother_name,
    'Mother_Occupation': student.mother_occup,
    'Student_Status': student.student_status,
    'Last sem of enrolment for inactive': student.last_sem || '-',
    'Section': student.section,
    'Approved to share the information': student.approved,
    'Scholarship  Type': student.scholar_ship
  }));

  // Create worksheet from data
  const worksheet = xlsxUtils.json_to_sheet(data);
  const workbook = xlsxUtils.book_new();
  
  // Enhanced header styling
  const headerStyle = {
    font: { 
      bold: true, 
      color: { rgb: "FFFFFF" },
      name: "Arial",
      sz: 12
    },
    fill: { 
      patternType: "solid", 
      fgColor: { rgb: "1E3A8A" } // Dark blue
    },
    border: {
      top: { style: "medium", color: { rgb: "000000" } },
      bottom: { style: "medium", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true
    }
  };

  // Cell style for data rows
  const dataStyle = {
    border: {
      top: { style: "thin", color: { rgb: "CCCCCC" } },
      bottom: { style: "thin", color: { rgb: "CCCCCC" } },
      left: { style: "thin", color: { rgb: "CCCCCC" } },
      right: { style: "thin", color: { rgb: "CCCCCC" } }
    },
    alignment: {
      vertical: "center"
    }
  };

  // Apply styles to header row
  const range = xlsxUtils.decode_range(worksheet['!ref']);
  
  // Get all column headers to calculate optimal width
  const headers = Object.keys(data[0]);
  
  // Apply header styles and initialize column width tracking
  const colWidths = {};
  for(let C = range.s.c; C <= range.e.c; C++) {
    const cell = xlsxUtils.encode_cell({ c: C, r: 0 });
    worksheet[cell].s = headerStyle;
    
    // Initialize column width with header length plus padding
    const header = headers[C];
    colWidths[C] = Math.max(header.length + 2, 10); // Minimum width of 10
  }
  
  // Calculate width based on content
  for(let R = range.s.r + 1; R <= range.e.r; R++) {
    for(let C = range.s.c; C <= range.e.c; C++) {
      const cell = xlsxUtils.encode_cell({ c: C, r: R });
      
      // Apply data cell style
      if (worksheet[cell]) {
        worksheet[cell].s = dataStyle;
        
        // Update column width based on content length
        const content = worksheet[cell].v ? String(worksheet[cell].v) : '';
        colWidths[C] = Math.max(colWidths[C], Math.min(content.length + 1, 50)); // Cap at 50
      }
    }
  }
  
  // Set optimized column widths
  worksheet['!cols'] = Array.from({ length: range.e.c + 1 }, (_, i) => ({ wch: colWidths[i] }));

  // Add metadata and freeze header row
  worksheet['!autofilter'] = { ref: worksheet['!ref'] };
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' };
  
  // Add export info with styling
  const infoStyle = {
    font: { bold: true },
    fill: { patternType: "solid", fgColor: { rgb: "F5F5F5" } }
  };
  
  const selectionInfo = selectedStudents.value.length > 0 
    ? `Selected: ${selectedStudents.value.length} students` 
    : `All: ${exportData.length} students`;

  const infoData = [
    ["Export Date:", new Date().toLocaleString()],
    ["Filters Applied:", ""],
    ["Course:", filterCourse.value.join(", ") || "All"],
    ["Campus:", filterCampus.value.join(", ") || "All"],
    ["Year Level:", filterYearLevel.value.join(", ") || "All"],
    ["Student Status:", filterScholarshipType.value.join(", ") || "All"],
    ["Scholarship:", filterScholars.value.join(", ") || "All"],
    ["Search Query:", searchQuery.value || "None"],
    ["Selection:", selectionInfo]
  ];
  
  const infoSheet = xlsxUtils.aoa_to_sheet(infoData);
  
  // Apply styling to info sheet
  const infoRange = xlsxUtils.decode_range(infoSheet['!ref']);
  for(let R = infoRange.s.r; R <= infoRange.e.r; R++) {
    const labelCell = xlsxUtils.encode_cell({ c: 0, r: R });
    if (infoSheet[labelCell]) {
      infoSheet[labelCell].s = infoStyle;
    }
  }
  
  // Auto-size info sheet columns
  infoSheet['!cols'] = [
    { wch: 20 }, // Labels
    { wch: 50 }  // Values
  ];
  
  // Add timestamp to filename with more readable format
  const timestamp = new Date().toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '-');
  
  xlsxUtils.book_append_sheet(workbook, infoSheet, 'Export Info');
  xlsxUtils.book_append_sheet(workbook, worksheet, 'Students');
  
  writeXLSXFile(workbook, `students_export_${timestamp}.xlsx`);
};

// Enhanced PDF Export
const exportToPDF = async () => {
  // If we have selected students but they're not on the current page, we need to fetch them
  let exportData = getExportData();
  
  // If no students are selected and we want to export all filtered students
  if (selectedStudents.value.length === 0 && itemsPerPage.value !== -1) {
    try {
      isLoading.value = true;
      
      // Prepare query parameters to get all filtered students
      const params = {
        limit: -1, // Get all students matching filters
        search: searchQuery.value || undefined,
      };
      
      if (filterYearLevel.value.length > 0) params.year_level = filterYearLevel.value;
      if (filterSemester.value.length > 0) params.college = filterSemester.value;
      if (filterCourse.value.length > 0) params.course = filterCourse.value;
      if (filterCampus.value.length > 0) params.campus = filterCampus.value;
      if (filterScholarshipType.value.length > 0) params.student_status = filterScholarshipType.value;
      if (filterScholars.value.length > 0) params.scholar_ship = filterScholars.value;
      
      const response = await api.get('/students', { params });
      exportData = response.data.data;
    } catch (err) {
      error.value = 'Failed to export data. Please try again later.';
      console.error(err);
      return;
    } finally {
      isLoading.value = false;
    }
  }

  // Calculate total number of students in the export data
  const dataCount = exportData.length;

  // Create PDF with better initial settings
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true, // Enable compression for smaller file size
    putOnlyUsedFonts: true // Optimize font usage
  });

  // Add university logo
  const logo = new Image();
  logo.src = user.imageUrl;
  doc.addImage(logo, 'PNG', 15, 5, 20, 20);

  // Improved header styling
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // Blue color for header
  doc.text('BulSU Student List Export', 40, 20);
  
  // Add a divider line
  doc.setDrawColor(30, 58, 138); // Blue color for line
  doc.setLineWidth(0.5);
  doc.line(15, 25, 280, 25);

  // Export details section with improved layout
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  // Format date more nicely
  const exportDate = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text(`Exported on: ${exportDate}`, 15, 32);
  
  // Add user info if available
  if (user.name) {
    doc.text(`Exported by: ${user.name}`, 15, 37);
  }

  // Selection information with improved formatting
  const selectionInfo = selectedStudents.value.length > 0 
    ? `Selected: ${selectedStudents.value.length} of ${totalStudents.value} students` 
    : `All filtered: ${dataCount} students`;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(selectionInfo, 15, 43);

  // Filter information with better organization
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  // Create a more structured filter display
  const filterItems = [
    filterYearLevel.value.length > 0 && `Year Level: ${filterYearLevel.value.join(', ')}`,
    filterSemester.value.length > 0 && `Semester: ${filterSemester.value.join(', ')}`,
    filterCourse.value.length > 0 && `Course: ${filterCourse.value.join(', ')}`,
    filterCampus.value.length > 0 && `Campus: ${filterCampus.value.join(', ')}`,
    filterScholarshipType.value.length > 0 && `Student Status: ${filterScholarshipType.value.join(', ')}`,
    filterScholars.value.length > 0 && `Scholarship Type: ${filterScholars.value.join(', ')}`,
    searchQuery.value && `Search: "${searchQuery.value}"`
  ].filter(Boolean);
  
  // Organize filters in a cleaner layout
  let filterY = 48;
  if (filterItems.length > 0) {
    doc.text('Filters applied:', 15, filterY);
    filterY += 4;
    
    // Split filters into multiple lines if needed
    const maxLineLength = 120; // characters
    for (let i = 0; i < filterItems.length; i++) {
      // Add bullet point
      doc.text('•', 17, filterY);
      
      // Handle text wrapping for long filter values
      const filterText = filterItems[i];
      if (filterText.length > maxLineLength) {
        const lines = doc.splitTextToSize(filterText, 245);
        doc.text(lines, 22, filterY);
        filterY += 4 * (lines.length);
      } else {
        doc.text(filterText, 22, filterY);
        filterY += 4;
      }
    }
  }

  // Table configuration with improved column definitions
  const headers = [
    'Student ID',
    'Last Name',
    'First Name',
    'Middle Name',
    'College',
    'Course',
    'Campus',
    'Year Level',
    'Student Status',
    'Student Gender',
    'Scholarship',
  ];

  // Transform data for the table with proper field mapping
  const tableData = exportData.map(student => [
    student.student_id || '-',
    student.last_name || '-',
    student.first_name || '-',
    student.middle_name || '-',
    student.college || '-',
    student.course || '-',
    student.campus || '-',
    student.year_level || '-',
    student.student_status || '-',
    student.gender || '-',
    student.scholar_ship || '-'
  ]);

  // Calculate starting Y position based on filters
  const tableStartY = Math.min(filterY + 5, 65);

  // Generate table with improved styling
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: tableStartY,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 2,
      font: 'helvetica',
      valign: 'middle',
      overflow: 'linebreak', // Handle text overflow better
      textColor: [31, 41, 55], // gray-800
      lineWidth: 0.1,
      lineColor: [200, 200, 200]
    },
    headStyles: {
      fillColor: [30, 58, 138], // blue-900
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 3,
      minCellHeight: 14
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250] // Light blue-gray for better readability
    },
    // Improved column widths based on content
   columnStyles: {
  0: { cellWidth: 18, halign: 'center' },  // Student ID (slightly narrower)
  1: { cellWidth: 22 },                   // Last Name (slightly narrower)
  2: { cellWidth: 22 },                   // First Name (slightly narrower)
  3: { cellWidth: 18 },                   // Middle Name (slightly narrower)
  4: { cellWidth: 22, halign: 'center' }, // College (slightly narrower)
  5: { cellWidth: 40 },                   // Course (wider for longer names)
  6: { cellWidth: 22 },                   // Campus (slightly narrower)
  7: { cellWidth: 18, halign: 'center' }, // Year Level (new column)
  8: { cellWidth: 25 },                   // Student Status (slightly narrower)
  9: { cellWidth: 18, halign: 'center' }, // Student Gender (slightly narrower)
  10: { cellWidth: 25 },                   // Scholarship (slightly narrower)
  
},
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      // Add header to each page
      if (data.pageNumber > 1) {
        // For pages after the first, add a simpler header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 138);
        doc.text('BulSU Student List Export (Continued)', 15, 15);
        
        doc.setLineWidth(0.3);
        doc.line(15, 18, 280, 18);
      }
    },
    didParseCell: (data) => {
      // Customize specific cells if needed
      if (data.row.section === 'head') {
        // Add more custom styling for header if needed
      }
    },
    willDrawCell: (data) => {
      // Add custom styling to specific cells
      if (data.row.section === 'body') {
        // For example, highlight certain values
        if (data.column.index === 7 && data.cell.text[0]?.includes('Full')) { // Scholarship column
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [0, 100, 0]; // Dark green for Full Scholarship
        }
      }
    }
  });

  // Get final Y position to add summary information
  const finalY = (doc.lastAutoTable?.finalY || 180) + 10;
  
  // Add summary statistics
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('Summary Statistics', 15, finalY);
  
  // Calculate some basic stats
  const campusCounts = {};
  const courseCounts = {};
  const scholarshipCounts = {};
  
  exportData.forEach(student => {
    // Count by campus
    if (student.campus) {
      campusCounts[student.campus] = (campusCounts[student.campus] || 0) + 1;
    }
    
    // Count by course
    if (student.course) {
      courseCounts[student.course] = (courseCounts[student.course] || 0) + 1;
    }
    
    // Count by scholarship type
    if (student.student_status) {
      scholarshipCounts[student.student_status] = (scholarshipCounts[student.student_status] || 0) + 1;
    }
  });
  
  // Add statistics table if there's room
  if (finalY < 170) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    doc.text(`Total Students: ${dataCount}`, 15, finalY + 5);
    
    // Add top 3 campuses
    const topCampuses = Object.entries(campusCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
      
    if (topCampuses.length > 0) {
      doc.text('Top Campuses:', 15, finalY + 10);
      topCampuses.forEach((campus, index) => {
        doc.text(`• ${campus[0]}: ${campus[1]} students (${((campus[1]/dataCount)*100).toFixed(1)}%)`, 20, finalY + 15 + (index * 4));
      });
    }
  }

  // Enhanced footer with pagination and timestamp
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Add page footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    // Bottom line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, 195, 280, 195);
    
    // Page number
    doc.text(`Page ${i} of ${pageCount}`, 15, 199);
    
    // Center text
    doc.text('Bulacan State University - Student Records System', 148, 199, { align: 'center' });
    
    // Right aligned timestamp
    doc.text(`Generated: ${new Date().toLocaleString()}`, 280, 199, { align: 'right' });
    
    // Document ID or reference number
    const docId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    doc.text(`Report ID: ${docId}`, 280, 195, { align: 'right' });
  }

  // Format timestamp for filename
  const timestamp = new Date().toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '-');
  
  // Save the PDF
  doc.save(`BulSU_student_export_${timestamp}.pdf`);
};

// Add to onMounted or loadStudents
const preloadLogo = () => {
  const img = new Image();
  img.src = user.imageUrl;
};

onMounted(() => {
  loadStudents();
  preloadLogo();
});
</script>

<template>
  <MainLayout pageTitle="Student List">
    <!-- Content area -->

    
    <div class="flex flex-col gap-8">
      <!-- Stats & Page Size Selector -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
        <!-- Stats -->
        <div class="flex flex-col md:flex-row gap-4 md:items-center">
          <div class="bg-blue-50 p-3 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500">Total Students</h3>
            <p class="text-2xl font-bold text-blue-600">{{ totalStudents }}</p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <h3 class="text-sm font-medium text-gray-500">Selected</h3>
            <p class="text-2xl font-bold text-green-600">{{ selectedStudents.length }}</p>
          </div>
          <!-- Active filter stats -->
<div class="flex flex-wrap gap-4">
  <!-- Year Level Filter Stats -->
  <div v-if="filterYearLevel.length > 0" class="bg-purple-50 p-3 rounded-lg">
    <h3 class="text-sm font-medium text-gray-500">Year Level</h3>
    <div class="flex items-center">
      <p class="text-2xl font-bold text-purple-600">{{ filterYearLevel.value }}</p>
      <span class="ml-2 text-xs text-purple-800">
        {{ filterYearLevel.join(', ') }}
      </span>
    </div>
  </div>
  
  <!-- College Filter Stats -->
  <div v-if="filterSemester.length > 0" class="bg-amber-50 p-3 rounded-lg">
    <h3 class="text-sm font-medium text-gray-500">College</h3>
    <div class="flex items-center">
      <p class="text-2xl font-bold text-amber-600">{{ filterSemester.value }}</p>
      <span class="ml-2 text-xs text-amber-800 truncate max-w-36">
        {{ filterSemester.join(', ') }}
      </span>
    </div>
  </div>
  
  <!-- Course Filter Stats -->
  <div v-if="filterCourse.length > 0" class="bg-teal-50 p-3 rounded-lg">
    <h3 class="text-sm font-medium text-gray-500">Course</h3>
    <div class="flex items-center">
      <p class="text-2xl font-bold text-teal-600">{{ filterCourse.value }}</p>
      <span class="ml-2 text-xs text-teal-800 truncate max-w-36">
        {{ filterCourse.join(', ') }}
      </span>
    </div>
  </div>
  
  <!-- Campus Filter Stats -->
  <div v-if="filterCampus.length > 0" class="bg-indigo-50 p-3 rounded-lg">
    <h3 class="text-sm font-medium text-gray-500">Campus</h3>
    <div class="flex items-center">
      <p class="text-2xl font-bold text-indigo-600">{{ filterCampus.value }}</p>
      <span class="ml-2 text-xs text-indigo-800">
        {{ filterCampus.join(', ') }}
      </span>
    </div>
  </div>
  
  <!-- Student Status Filter Stats -->
  <div v-if="filterScholarshipType.length > 0" class="bg-rose-50 p-3 rounded-lg">
    <h3 class="text-sm font-medium text-gray-500">Student Status</h3>
    <div class="flex items-center">
      <p class="text-2xl font-bold text-rose-600">{{ filterScholarshipType.value }}</p>
      <span class="ml-2 text-xs text-rose-800">
        {{ filterScholarshipType.join(', ') }}
      </span>
    </div>
  </div>
  
  <!-- Scholarship Filter Stats -->
  <div v-if="filterScholars.length > 0" class="bg-emerald-50 p-3 rounded-lg">
    <h3 class="text-sm font-medium text-gray-500">Scholarship</h3>
    <div class="flex items-center">
      <p class="text-2xl font-bold text-emerald-600">{{ filterScholars.value }}</p>
      <span class="ml-2 text-xs text-emerald-800 truncate max-w-36">
        {{ filterScholars.join(', ') }}
      </span>
    </div>
  </div>
</div>

          
          
          <!-- Loading indicator for "All" mode -->
          <div v-if="isLoading && itemsPerPage === -1" class="flex items-center text-blue-600">
            <ArrowPathIcon class="h-4 w-4 animate-spin mr-2" />
            <span class="text-sm">Loading all students...</span>
          </div>
        </div>
        
        <!-- Page size selector -->
        <div class="filter-dropdown-container relative">
          <label class="text-sm font-medium text-gray-700 mr-2">Show:</label>
          <button 
            @click.stop="toggleDropdown('perPage')"
            class="flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <span>{{ itemsPerPage === 10000 ? 'All' : `${itemsPerPage} per page` }}</span>
            <ChevronDownIcon class="h-4 w-4 ml-2 text-gray-400" />
          </button>
          <div 
            v-if="dropdownStates.perPage"
            class="absolute z-10 right-0 mt-1 w-40 bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
          >
            <div 
              v-for="option in perPageOptions" 
              :key="option.value"
              @click.stop="changeItemsPerPage(option.value)"
              class="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Actions & Export -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div class="flex items-center gap-4">
          <button 
            @click="exportToExcel"
            class="btn-export flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200 hover:bg-green-100"
          >
            <DocumentArrowDownIcon class="h-5 w-5" />
            <span class="hidden sm:inline">Export Excel</span>
          </button>
          <button 
            @click="exportToPDF"
            class="btn-export flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 px-3 py-2 rounded-md border border-red-200 hover:bg-red-100"
          >
            <DocumentTextIcon class="h-5 w-5" />
            <span class="hidden sm:inline">Export PDF</span>
          </button>
        </div>
        <button 
          @click="loadStudents"
          class="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-md border border-blue-200 hover:bg-blue-100 mt-2 sm:mt-0"
        >
          <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          {{ isLoading ? 'Loading...' : 'Refresh Data' }}
        </button>
      </div>

      <!-- Filter controls -->
      <div class="bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Search by Student ID -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search by Student ID</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Enter Student ID"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm pl-10"
              />
              <MagnifyingGlassIcon class="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

<!-- Multi-select dropdown for Year Level -->
          <div class="filter-dropdown-container relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
            <button 
              @click.stop="toggleDropdown('yearlevel')"
              class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <span class="truncate">{{ selectedCountLabels.yearlevel }}</span>
              <ChevronDownIcon class="h-4 w-4 text-gray-400" />
            </button>
            <div 
              v-if="dropdownStates.yearlevel"
              class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
            >
              <div class="p-2 border-b">
                <div class="mb-2 text-xs text-gray-500">
                  {{ filterYearLevel.length }} of {{ filterOptions.yearlevel.length }} selected
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <div 
                    v-for="value in filterYearLevel" 
                    :key="value"
                    class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    <span>{{ value }}</span>
                    <button @click.stop="removeFilter('yearlevel', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                      <XCircleIcon class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div 
                v-for="option in filterOptions.yearlevel" 
                :key="option"
                @click.stop="toggleFilter('yearlevel', option)"
                class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
              >
                <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterYearLevel.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
                  <CheckIcon v-if="filterYearLevel.includes(option)" class="h-3 w-3 text-white" />
                </div>
                <span>{{ option }}</span>
              </div>
            </div>
          </div>
          <!-- Multi-select dropdown for Semester -->
          <div class="filter-dropdown-container relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">College</label>
            <button 
              @click.stop="toggleDropdown('semester')"
              class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <span class="truncate">{{ selectedCountLabels.semester }}</span>
              <ChevronDownIcon class="h-4 w-4 text-gray-400" />
            </button>
            <div 
              v-if="dropdownStates.semester"
              class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
            >
              <div class="p-2 border-b">
                <div class="mb-2 text-xs text-gray-500">
                  {{ filterSemester.length }} of {{ filterOptions.semester.length }} selected
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <div 
                    v-for="value in filterSemester" 
                    :key="value"
                    class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    <span>{{ value }}</span>
                    <button @click.stop="removeFilter('semester', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                      <XCircleIcon class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div 
                v-for="option in filterOptions.semester" 
                :key="option"
                @click.stop="toggleFilter('semester', option)"
                class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
              >
                <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterSemester.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
                  <CheckIcon v-if="filterSemester.includes(option)" class="h-3 w-3 text-white" />
                </div>
                <span>{{ option }}</span>
              </div>
            </div>
          </div>

          <!-- Multi-select dropdown for Course -->
          <div class="filter-dropdown-container relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <button 
              @click.stop="toggleDropdown('course')"
              class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <span class="truncate">{{ selectedCountLabels.course }}</span>
              <ChevronDownIcon class="h-4 w-4 text-gray-400" />
            </button>
            <div 
              v-if="dropdownStates.course"
              class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
            >
              <div class="p-2 border-b">
                <div class="mb-2 text-xs text-gray-500">
                  {{ filterCourse.length }} of {{ filterOptions.course.length }} selected
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <div 
                    v-for="value in filterCourse" 
                    :key="value"
                    class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    <span>{{ value }}</span>
                    <button @click.stop="removeFilter('course', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                      <XCircleIcon class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div 
                v-for="option in filterOptions.course" 
                :key="option"
                @click.stop="toggleFilter('course', option)"
                class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
              >
                <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterCourse.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
                  <CheckIcon v-if="filterCourse.includes(option)" class="h-3 w-3 text-white" />
                </div>
                <span>{{ option }}</span>
              </div>
            </div>
          </div>

          <!-- Multi-select dropdown for Campus -->
          <div class="filter-dropdown-container relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Campus</label>
            <button 
              @click.stop="toggleDropdown('campus')"
              class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <span class="truncate">{{ selectedCountLabels.campus }}</span>
              <ChevronDownIcon class="h-4 w-4 text-gray-400" />
            </button>
            <div 
              v-if="dropdownStates.campus"
              class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
            >
              <div class="p-2 border-b">
                <div class="mb-2 text-xs text-gray-500">
                  {{ filterCampus.length }} of {{ filterOptions.campus.length }} selected
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <div 
                    v-for="value in filterCampus" 
                    :key="value"
                    class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    <span>{{ value }}</span>
                    <button @click.stop="removeFilter('campus', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                      <XCircleIcon class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div 
                v-for="option in filterOptions.campus" 
                :key="option"
                @click.stop="toggleFilter('campus', option)"
                class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
              >
                <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterCampus.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
                  <CheckIcon v-if="filterCampus.includes(option)" class="h-3 w-3 text-white" />
                </div>
                <span>{{ option }}</span>
              </div>
            </div>
          </div>

          <!-- Multi-select dropdown for Scholarship Type -->
          <div class="filter-dropdown-container relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Student's Status</label>
            <button 
              @click.stop="toggleDropdown('scholarshipType')"
              class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <span class="truncate">{{ selectedCountLabels.scholarshipType }}</span>
              <ChevronDownIcon class="h-4 w-4 text-gray-400" />
            </button>
            <div 
              v-if="dropdownStates.scholarshipType"
              class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
            >
              <div class="p-2 border-b">
                <div class="mb-2 text-xs text-gray-500">
                  {{ filterScholarshipType.length }} of {{ filterOptions.scholarshipType.length }} selected
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <div 
                    v-for="value in filterScholarshipType" 
                    :key="value"
                    class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    <span>{{ value }}</span>
                    <button @click.stop="removeFilter('scholarshipType', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                      <XCircleIcon class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div 
                v-for="option in filterOptions.scholarshipType" 
                :key="option"
                @click.stop="toggleFilter('scholarshipType', option)"
                class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
              >
                <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterScholarshipType.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
                  <CheckIcon v-if="filterScholarshipType.includes(option)" class="h-3 w-3 text-white" />
                </div>
                <span>{{ option }}</span>
              </div>
            </div>
          </div>


<!-- Multi-select dropdown for Campus -->
          <div class="filter-dropdown-container relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Scholarship</label>
            <button 
              @click.stop="toggleDropdown('scholar_shiptype')"
              class="w-full flex items-center justify-between rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <span class="truncate">{{ selectedCountLabels.scholar_shiptype }}</span>
              <ChevronDownIcon class="h-4 w-4 text-gray-400" />
            </button>
            <div 
              v-if="dropdownStates.scholar_shiptype"
              class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
            >
              <div class="p-2 border-b">
                <div class="mb-2 text-xs text-gray-500">
                  {{ filterScholars.length }} of {{ filterOptions.scholar_shiptype.length }} selected
                </div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <div 
                    v-for="value in filterScholars" 
                    :key="value"
                    class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    <span>{{ value }}</span>
                    <button @click.stop="removeFilter('scholar_shiptype', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                      <XCircleIcon class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div 
                v-for="option in filterOptions.scholar_shiptype" 
                :key="option"
                @click.stop="toggleFilter('scholar_shiptype', option)"
                class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
              >
                <div class="h-4 w-4 border rounded mr-2 flex items-center justify-center" :class="filterScholars.includes(option) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'">
                  <CheckIcon v-if="filterScholars.includes(option)" class="h-3 w-3 text-white" />
                </div>
                <span>{{ option }}</span>
              </div>
            </div>
          </div>




        </div>

        <!-- Active filter tags -->
        <div v-if="filterYearLevel.length || filterSemester.length || filterCourse.length || filterCampus.length || filterScholarshipType.length || filterScholars.length" class="mt-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Active Filters:</h3>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="value in filterYearLevel" 
              :key="`sem-${value}`"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>Year Level: {{ value }}</span>
              <button @click="removeFilter('yearlevel', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>
            <div 
              v-for="value in filterSemester" 
              :key="`sem-${value}`"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>College: {{ value }}</span>
              <button @click="removeFilter('semester', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>
            <div 
              v-for="value in filterCourse" 
              :key="`course-${value}`"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>Course: {{ value }}</span>
              <button @click="removeFilter('course', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>
            <div 
              v-for="value in filterCampus" 
              :key="`campus-${value}`"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>Campus: {{ value }}</span>
              <button @click="removeFilter('campus', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>
            <div 
              v-for="value in filterScholarshipType" 
              :key="`schol-${value}`"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>Status: {{ value }}</span>
              <button @click="removeFilter('scholarshipType', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>

             <div 
              v-for="value in filterScholars" 
              :key="`scholar-${value}`"
              class="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <span>Scholarship Type: {{ value }}</span>
              <button @click="removeFilter('scholar_shiptype', value)" class="ml-1 text-blue-600 hover:text-blue-800">
                <XCircleIcon class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <span class="text-sm text-gray-500">
            Showing {{ filteredStudents.length }} of {{ totalStudents }} results
          </span>
          <button 
            @click="clearFilters"
            class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200"
          >
            <XMarkIcon class="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Loading and error states -->
      <div v-if="isLoading" class="text-center p-8 bg-white rounded-lg shadow">
        <div class="h-8 w-8 text-blue-600 mx-auto animate-spin">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
        <p class="mt-2 text-sm text-gray-600">Loading students...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 p-4 rounded-lg shadow">
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <!-- Student table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden ring-1 ring-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-3 text-left">
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="selectAll"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </th>
                <th v-for="header in [
                  'Student ID', 'Last Name', 'First Name', 'Middle Name',
                  'Course', 'College', 'Campus', 'Year Level', 'Gender', 'Student Status', 'Scholarship'
                ]" :key="header" class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr 
                v-for="student in paginatedStudents" 
                :key="student.id" 
                class="hover:bg-gray-50 transition-colors duration-150"
                :class="{'bg-blue-50': isStudentSelected(student.id)}"
              >
                <td class="px-3 py-4">
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      :checked="isStudentSelected(student.id)"
                      @change="toggleSelectStudent(student.id)"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ student.student_id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.last_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.first_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.middle_name || '—' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.course }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.college }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.campus }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.year_level }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.gender }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.student_status }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ student.scholar_ship }}
                </td>
                
              </tr>
              <tr v-if="!filteredStudents.length">
                <td colspan="9" class="px-6 py-4 text-center text-gray-500">
                  No students found matching the criteria
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="text-sm text-gray-700">
              <span v-if="itemsPerPage !== -1">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} 
                to {{ Math.min(currentPage * itemsPerPage, totalStudents) }} 
                of {{ totalStudents }} students
              </span>
              <span v-else>
                Showing all {{ students.length }} students
              </span>
            </div>
            <div class="flex items-center justify-end gap-2">
              <button 
                @click="changePage(1)" 
                :disabled="currentPage === 1 || isLoading || itemsPerPage === -1"
                class="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                First
              </button>
              <button 
                @click="changePage(currentPage - 1)" 
                :disabled="currentPage === 1 || isLoading || itemsPerPage === -1"
                class="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              
              <span class="mx-2 text-sm text-gray-600">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              
              <button 
                @click="changePage(currentPage + 1)" 
                :disabled="currentPage === totalPages || isLoading || itemsPerPage === -1"
                class="px-3 py-1 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Next
              </button>
              <button 
                @click="changePage(totalPages)" 
                :disabled="currentPage === totalPages || isLoading || itemsPerPage === -1"
                class="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.btn-refresh {
  transition: all 0.2s ease;
}

.btn-clear {
  transition: all 0.2s ease;
}

.filter-select {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.student-table {
  min-height: 300px;
}

/* Add export button styling */
.btn-export {
  transition: all 0.2s ease;
}

.filter-dropdown-container {
  position: relative;
}

.filter-dropdown-container button {
  transition: all 0.2s ease;
}

.filter-dropdown-container button:hover {
  background-color: #f9fafb;
}

.filter-dropdown-container .dropdown {
  max-height: 224px;
  overflow-y: auto;
}
</style>