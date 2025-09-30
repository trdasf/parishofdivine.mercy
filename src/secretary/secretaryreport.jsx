import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faChevronDown, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';
import "./secretaryreport.css";

const API_URL = "https://parishofdivinemercy.com/backend/reports.php";

const SecretaryReport = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // State for reports data
  const [appointmentReports, setAppointmentReports] = useState([]);
  const [requestCertificateReports, setRequestCertificateReports] = useState([]);
  const [donationReports, setDonationReports] = useState([]);
  const [eventReports, setEventReports] = useState([]);
  const [expenseReports, setExpenseReports] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  const categoryTypes = [
    "Appointment",
    "Request Certificate", 
    "Donation",
    "Event",
    "Expenses"
  ];

  // Categories from SecretaryExpenses
  const expenseCategories = [
    // Parish Receipts Subject to 10% Diocesan Share
    { value: "ministerial_services", label: "A. Ministerial Services" },
    { value: "collections", label: "B. Collections" },
    { value: "other_income", label: "C. Other Income" },
    
    // Diocesan Receipts Not Subject to 10% Diocesan Share
    { value: "donation_special_projects", label: "A. Donation from Special Projects" },
    { value: "other_church_income", label: "B. Other Church Income/Donations Individuals" },
    { value: "foreign_local_fundings", label: "C. Foreign & Local Fundings Assistance" },
    
    // Diocesan Receipts
    { value: "pontifical_collections", label: "A. Pontifical Collections" },
    { value: "national_collections", label: "B. National Collections" },
    { value: "diocesan_collections", label: "C. Diocesan Collections" },
    
    // Other Receipts
    { value: "other_receipts", label: "IV. Other Receipts" },
    
    // Disbursement Categories
    { value: "priest_honoraria", label: "I. Priest Honoraria" },
    { value: "rectory_expenses", label: "II. Rectory Expenses" },
    { value: "regular_expenses", label: "III. Regular Expenses" },
    { value: "church_supplies", label: "IV. Church Supplies & Other Expenses" },
    { value: "repair_maintenance", label: "V. Repair & Maintenance" },
    { value: "honorarium", label: "VI. Honorarium" },
    { value: "pastoral_program", label: "VII. Pastoral Program" },
    { value: "special_project_donation", label: "VIII. Special Project Donation" },
    { value: "remittance_curia", label: "IX. Remittance to the Curia" },
    { value: "cash_advances", label: "X. Cash Advances (receivables)" }
  ];

  // Expense name options based on category
  const expenseNameOptions = {
    ministerial_services: [
      { value: "baptism", label: "Baptism" },
      { value: "marriage", label: "Marriage" },
      { value: "funeral_services", label: "Funeral Services" },
      { value: "mass_offering", label: "Mass Offering" },
      { value: "other_religious_services", label: "Other Religious Services" }
    ],
    collections: [
      { value: "daily_sunday_collections", label: "Daily & Sunday Collections" },
      { value: "stewardship_sharing", label: "Stewardship Sharing" },
      { value: "rental_church_property", label: "Rental for Church Property" },
      { value: "cemetery_rental", label: "Cemetery Rental" },
      { value: "documentation", label: "Documentation" }
    ],
    donation_special_projects: [
      { value: "for_renovation", label: "For Renovation" },
      { value: "for_catechist", label: "For catechist" },
      { value: "from_parish_fiesta", label: "From Parish Fiesta" },
      { value: "religious_movement_organization", label: "Religious Movement & Organization" }
    ],
    pontifical_collections: [
      { value: "pro_nigrits_epiphany", label: "Pro Nigrits (Epiphany) - JANUARY" },
      { value: "pro_sancta_infantia", label: "Pro Sancta Infantia (3rd Sun. of Jan.)" },
      { value: "opus_sancti_petri_apostoli", label: "Opus Sancti Petri Apostoli" },
      { value: "world_mission_sunday", label: "World Mission Sunday" },
      { value: "pro_terra_sancta", label: "Pro Terra Sancta (Good Friday)" },
      { value: "world_day_sick", label: "World day of the sick" }
    ],
    national_collections: [
      { value: "bible_sunday", label: "Bible Sunday (Last Sun. of Jan.)" },
      { value: "alay_kapwa", label: "Alay Kapwa (Palm Sunday)" },
      { value: "st_john_mary_vianney", label: "St. John Mary Vianney" },
      { value: "indigenous_people_sun", label: "Indigenous People Sun. (2nd Sun. of Oct.)" },
      { value: "national_youth_day", label: "National Youth Day" },
      { value: "fil_mission_sunday", label: "Fil. Mission Sunday (Last Sun. of July)" },
      { value: "national_migrant_worker", label: "National Migrant Worker Sun. (1st Sun. of Lent)" },
      { value: "others", label: "Others" }
    ],
    diocesan_collections: [
      { value: "pro_seminario", label: "Pro. Seminario" },
      { value: "others", label: "Others" }
    ],
    priest_honoraria: [
      { value: "parish_priest_honoraria", label: "Parish Priest Honoraria - Stipend" },
      { value: "parochial_vicar_honoraria", label: "Parochial Vicar Honoraria - Stipend" },
      { value: "guest_priests", label: "Guest Priests" }
    ],
    rectory_expenses: [
      { value: "food_groceries", label: "Food & Groceries" },
      { value: "fuel", label: "Fuel" },
      { value: "honorarium_cook_helper", label: "Honorarium (cook & helper)" },
      { value: "kitchen_supplies", label: "Kitchen Supplies" },
      { value: "furniture_gardening", label: "Furniture & Fixtures / Gardening Tools" },
      { value: "other_items", label: "Other Items" },
      { value: "repair_maintenance", label: "Repair & Maintenance" }
    ],
    regular_expenses: [
      { value: "office_supply", label: "Office Supply" },
      { value: "internet_cable", label: "INTERNET / CIGNAL CABLE / OFFICE LO" },
      { value: "light_water", label: "Light & Water" },
      { value: "transportation_gas_oil", label: "Transportation, Gas & Oil" },
      { value: "repair_maint_vehicle", label: "Repair & Maint. - Vehicle Registration" },
      { value: "gifts_donations_charity", label: "Gifts, Donations & Charity" },
      { value: "sss_pagibig_philhealth", label: "SSS, Pag-ibig, Phil. Health" },
      { value: "taxes_license", label: "Taxes & License" },
      { value: "miscellaneous", label: "Miscellaneous" }
    ],
    repair_maintenance: [
      { value: "church", label: "Church" },
      { value: "parish_properties", label: "Parish Properties" },
      { value: "multipurpose_hall", label: "Multipurpose Hall" },
      { value: "cemetery", label: "Cemetery" },
      { value: "others", label: "Others" }
    ],
    honorarium: [
      { value: "church_staff", label: "Church Staff" },
      { value: "office_staff", label: "Office Staff" },
      { value: "janitorial", label: "Janitorial" },
      { value: "security_driver", label: "Security / Driver" }
    ],
    pastoral_program: [
      { value: "worship_liturgy", label: "Worship / Liturgy" },
      { value: "education_catechist", label: "Education / Catechist" },
      { value: "social_services", label: "Social Services" },
      { value: "temporalities", label: "Temporalities" },
      { value: "youth_dyd", label: "Youth / DYD" }
    ],
    special_project_donation: [
      { value: "parish_synod_activities", label: "Parish Synod Activities" },
      { value: "others", label: "Others" }
    ]
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openFilterModal = (filterType) => {
    setSelectedFilterType(filterType);
    setSelectedCategory("");
    setShowFilterModal(true);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
    setSelectedFilterType("");
    setSelectedCategory("");
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (value) {
      const year = value.split('-')[0];
      if (year && year.length > 4) {
        e.target.value = '';
        setMessage({ text: "Year must be 4 digits only", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    }
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const filters = {};
    
    for (let [key, value] of formData.entries()) {
      if (value && value.trim() !== '') {
        filters[key] = value.trim();
      }
    }

    if (Object.keys(filters).length === 0) {
      setMessage({ text: "Please provide at least one filter criteria", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    filters.filterType = selectedFilterType;

    setLoading(true);
    setIsDropdownOpen(false);
    
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_URL}?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filtered ${selectedFilterType.toLowerCase()}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (selectedFilterType === 'Appointment') {
          setAppointmentReports(data.appointments);
          setAppliedFilters(filters);
          setCurrentView(selectedFilterType);
          setHasSearched(true);
          closeFilterModal();
          
          if (data.appointments.length > 0) {
            setMessage({ text: `Found ${data.appointments.length} appointment(s)`, type: "success" });
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
          }
        } else if (selectedFilterType === 'Request Certificate') {
          setRequestCertificateReports(data.certificates);
          setAppliedFilters(filters);
          setCurrentView(selectedFilterType);
          setHasSearched(true);
          closeFilterModal();
          
          if (data.certificates.length > 0) {
            setMessage({ text: `Found ${data.certificates.length} certificate(s)`, type: "success" });
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
          }
        } else if (selectedFilterType === 'Donation') {
          setDonationReports(data.donations);
          setAppliedFilters(filters);
          setCurrentView(selectedFilterType);
          setHasSearched(true);
          closeFilterModal();
          
          if (data.donations.length > 0) {
            setMessage({ text: `Found ${data.donations.length} donation(s)`, type: "success" });
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
          }
        } else if (selectedFilterType === 'Event') {
          setEventReports(data.events);
          setAppliedFilters(filters);
          setCurrentView(selectedFilterType);
          setHasSearched(true);
          closeFilterModal();
          
          if (data.events.length > 0) {
            setMessage({ text: `Found ${data.events.length} event(s)`, type: "success" });
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
          }
        } else if (selectedFilterType === 'Expenses') {
          setExpenseReports(data.expenses);
          setAppliedFilters(filters);
          setCurrentView(selectedFilterType);
          setHasSearched(true);
          closeFilterModal();
          
          if (data.expenses.length > 0) {
            setMessage({ text: `Found ${data.expenses.length} expense(s)`, type: "success" });
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
          }
        }
      } else {
        throw new Error(data.message || `Failed to fetch ${selectedFilterType.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Error fetching filtered ${selectedFilterType.toLowerCase()}:`, error);
      setMessage({ text: `Error fetching ${selectedFilterType.toLowerCase()}. Please try again.`, type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      
      if (selectedFilterType === 'Appointment') {
        setAppointmentReports([]);
      } else if (selectedFilterType === 'Request Certificate') {
        setRequestCertificateReports([]);
      } else if (selectedFilterType === 'Donation') {
        setDonationReports([]);
      } else if (selectedFilterType === 'Event') {
        setEventReports([]);
      } else if (selectedFilterType === 'Expenses') {
        setExpenseReports([]);
      }
      setAppliedFilters(filters);
      setCurrentView(selectedFilterType);
      setHasSearched(true);
      closeFilterModal();
    } finally {
      setLoading(false);
    }
  };

  const resetToAllReports = () => {
    setCurrentView("");
    setHasSearched(false);
    setIsDropdownOpen(false);
    setMessage({ text: "Showing all reports", type: "success" });
  };

  const getSearchedAppointmentReports = () => {
    if (!searchTerm.trim()) {
      return appointmentReports;
    }

    return appointmentReports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.firstName?.toLowerCase().includes(searchLower) ||
        report.lastName?.toLowerCase().includes(searchLower) ||
        report.brideName?.toLowerCase().includes(searchLower) ||
        report.groomName?.toLowerCase().includes(searchLower) ||
        report.category?.toLowerCase().includes(searchLower) ||
        report.status?.toLowerCase().includes(searchLower) ||
        report.date?.includes(searchTerm) ||
        report.time?.toLowerCase().includes(searchLower)
      );
    });
  };

  const getSearchedRequestCertificateReports = () => {
    if (!searchTerm.trim()) {
      return requestCertificateReports;
    }

    return requestCertificateReports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.firstName?.toLowerCase().includes(searchLower) ||
        report.lastName?.toLowerCase().includes(searchLower) ||
        report.category?.toLowerCase().includes(searchLower) ||
        report.dateSubmitted?.includes(searchTerm)
      );
    });
  };

  const getSearchedDonationReports = () => {
    if (!searchTerm.trim()) {
      return donationReports;
    }

    return donationReports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.name?.toLowerCase().includes(searchLower) ||
        report.amount?.toString().includes(searchTerm) ||
        report.purpose?.toLowerCase().includes(searchLower) ||
        report.intention?.toLowerCase().includes(searchLower) ||
        report.dateOfDonation?.includes(searchTerm)
      );
    });
  };

  const getSearchedEventReports = () => {
    if (!searchTerm.trim()) {
      return eventReports;
    }

    return eventReports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.title?.toLowerCase().includes(searchLower) ||
        report.organizer?.toLowerCase().includes(searchLower) ||
        report.nameOfParish?.toLowerCase().includes(searchLower) ||
        report.location?.toLowerCase().includes(searchLower) ||
        report.date?.includes(searchTerm) ||
        report.time?.toLowerCase().includes(searchLower)
      );
    });
  };

  const getSearchedExpenseReports = () => {
    if (!searchTerm.trim()) {
      return expenseReports;
    }

    return expenseReports.filter(report => {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.expenseName?.toLowerCase().includes(searchLower) ||
        report.category?.toLowerCase().includes(searchLower) ||
        report.amount?.toString().includes(searchTerm) ||
        report.dateOfExpense?.includes(searchTerm)
      );
    });
  };

  // Helper function to get category label from value
  const getCategoryLabel = (categoryValue) => {
    const category = expenseCategories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Helper function to get expense name label from value
  const getExpenseNameLabel = (categoryValue, expenseNameValue) => {
    if (!expenseNameValue) return '';
    
    if (categoryValue && expenseNameOptions[categoryValue]) {
      const categoryExpenseNames = expenseNameOptions[categoryValue];
      const expenseName = categoryExpenseNames.find(expense => expense.value === expenseNameValue);
      return expenseName ? expenseName.label : expenseNameValue;
    }
    
    return expenseNameValue;
  };

  const getAppointmentColumns = () => {
    const filters = appliedFilters;
    const hasMarriage = appointmentReports.some(r => r.category === 'Marriage');
    
    const columns = {
      firstName: false,
      lastName: false,
      brideName: false,
      groomName: false,
      category: false,
      date: false,
      time: false,
      status: false
    };

    if (hasMarriage) {
      columns.brideName = true;
      columns.groomName = true;
      columns.category = true;
      if (filters.status) columns.status = true;
      if (filters.date) {
        columns.date = true;
        columns.time = true;
      }
      return columns;
    }

    if (filters.firstName && !filters.lastName && !filters.category) {
      columns.firstName = true;
      columns.lastName = true;
      columns.category = true;
      return columns;
    }

    if (filters.lastName && !filters.firstName && !filters.category) {
      columns.firstName = true;
      columns.lastName = true;
      columns.category = true;
      return columns;
    }

    if (filters.category) {
      columns.firstName = true;
      columns.lastName = true;
      columns.category = true;
    }

    if (filters.status) {
      columns.firstName = true;
      columns.lastName = true;
      columns.category = true;
      columns.status = true;
    }

    if (filters.date) {
      columns.firstName = true;
      columns.lastName = true;
      columns.category = true;
      columns.date = true;
      columns.time = true;
      if (filters.status) columns.status = true;
    }

    if (!columns.firstName && !columns.lastName) {
      columns.firstName = true;
      columns.lastName = true;
      columns.category = true;
      columns.date = true;
      columns.time = true;
      columns.status = true;
    }

    return columns;
  };

  const getRequestCertificateColumns = () => {
    const filters = appliedFilters;
    
    const columns = {
      firstName: true,
      lastName: true,
      category: true,
      dateSubmitted: false
    };

    if (filters.date) {
      columns.dateSubmitted = true;
    }

    return columns;
  };

  const getDonationColumns = () => {
    const filters = appliedFilters;
    
    const columns = {
      name: true,
      amount: false,
      purpose: false,
      intention: false,
      dateOfDonation: false
    };

    const onlyNameFilter = filters.donorName && !filters.purpose && !filters.intention && !filters.date && !filters.amount;
    
    if (onlyNameFilter) {
      columns.amount = true;
    } else {
      if (filters.purpose) {
        columns.purpose = true;
      }
      if (filters.intention) {
        columns.intention = true;
      }
      if (filters.amount) {
        columns.amount = true;
      }
      if (filters.date) {
        columns.dateOfDonation = true;
      }
      
      if (!filters.purpose && !filters.intention && !filters.amount && !filters.date) {
        columns.amount = true;
        columns.purpose = true;
        columns.intention = true;
        columns.dateOfDonation = true;
      }
    }

    return columns;
  };

  const getEventColumns = () => {
    const filters = appliedFilters;
    
    const columns = {
      title: true,
      organizer: false,
      nameOfParish: false,
      location: false,
      date: false,
      time: false
    };

    if (filters.eventTitle && !filters.organizer && !filters.parishName && !filters.location && !filters.date) {
      columns.organizer = true;
    } else {
      if (filters.organizer) {
        columns.organizer = true;
      }
      if (filters.parishName) {
        columns.nameOfParish = true;
      }
      if (filters.location) {
        columns.location = true;
      }
      if (filters.date) {
        columns.date = true;
        columns.time = true;
      }
      
      if (!filters.eventTitle && !filters.organizer && !filters.parishName && !filters.location && !filters.date) {
        columns.organizer = true;
        columns.nameOfParish = true;
        columns.location = true;
        columns.date = true;
        columns.time = true;
      }
    }

    return columns;
  };

  const getExpenseColumns = () => {
    const filters = appliedFilters;
    
    const columns = {
      expenseName: false,
      category: false,
      amount: false,
      dateOfExpense: false
    };

    // Determine which columns to show based on filters
    const hasExpenseName = !!filters.expenseName;
    const hasCategory = !!filters.category;
    const hasAmount = !!filters.amount;
    const hasDate = !!filters.date;

    // expense name only -> expense name + category
    if (hasExpenseName && !hasCategory && !hasAmount && !hasDate) {
      columns.expenseName = true;
      columns.category = true;
    }
    // category only -> expense name + category
    else if (hasCategory && !hasExpenseName && !hasAmount && !hasDate) {
      columns.expenseName = true;
      columns.category = true;
    }
    // expense name + category -> expense name + category
    else if (hasExpenseName && hasCategory && !hasAmount && !hasDate) {
      columns.expenseName = true;
      columns.category = true;
    }
    // amount only -> expense name + amount
    else if (hasAmount && !hasExpenseName && !hasCategory && !hasDate) {
      columns.expenseName = true;
      columns.amount = true;
    }
    // expense name + amount -> expense name + amount
    else if (hasExpenseName && hasAmount && !hasCategory && !hasDate) {
      columns.expenseName = true;
      columns.amount = true;
    }
    // date only -> expense name + date
    else if (hasDate && !hasExpenseName && !hasCategory && !hasAmount) {
      columns.expenseName = true;
      columns.dateOfExpense = true;
    }
    // date + category -> expense name + category + date
    else if (hasDate && hasCategory && !hasExpenseName && !hasAmount) {
      columns.expenseName = true;
      columns.category = true;
      columns.dateOfExpense = true;
    }
    // date + expense name -> expense name + category + date
    else if (hasDate && hasExpenseName && !hasCategory && !hasAmount) {
      columns.expenseName = true;
      columns.category = true;
      columns.dateOfExpense = true;
    }
    // Multiple filters - show relevant columns
    else {
      if (hasExpenseName) columns.expenseName = true;
      if (hasCategory) columns.category = true;
      if (hasAmount) columns.amount = true;
      if (hasDate) columns.dateOfExpense = true;
      
      // Always show expense name if any filter is applied
      if (hasExpenseName || hasCategory || hasAmount || hasDate) {
        columns.expenseName = true;
      }
    }

    return columns;
  };

  // Export to Excel function
  const handleExportToExcel = () => {
    if (!currentView || !hasSearched) {
      setMessage({ text: "No data to export. Please apply a filter first.", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    let dataToExport = [];
    let filename = '';
    let columns = {};

    switch(currentView) {
      case 'Appointment':
        const appointmentData = getSearchedAppointmentReports();
        columns = getAppointmentColumns();
        
        dataToExport = appointmentData.map(report => {
          const row = {};
          if (columns.firstName) row['First Name'] = report.firstName || '-';
          if (columns.lastName) row['Last Name'] = report.lastName || '-';
          if (columns.brideName) row["Bride's Name"] = report.brideName || '-';
          if (columns.groomName) row["Groom's Name"] = report.groomName || '-';
          if (columns.category) row['Category'] = report.category;
          if (columns.date) row['Date'] = report.date;
          if (columns.time) row['Time'] = report.time || '-';
          if (columns.status) row['Status'] = report.status;
          return row;
        });
        filename = 'Appointment_Report.xlsx';
        break;

      case 'Request Certificate':
        const certificateData = getSearchedRequestCertificateReports();
        columns = getRequestCertificateColumns();
        
        dataToExport = certificateData.map(report => {
          const row = {};
          if (columns.firstName) row['First Name'] = report.firstName;
          if (columns.lastName) row['Last Name'] = report.lastName;
          if (columns.category) row['Category'] = report.category;
          if (columns.dateSubmitted) row['Date Submitted'] = report.dateSubmitted;
          return row;
        });
        filename = 'Request_Certificate_Report.xlsx';
        break;

      case 'Donation':
        const donationData = getSearchedDonationReports();
        columns = getDonationColumns();
        
        dataToExport = donationData.map(report => {
          const row = {};
          if (columns.name) row['Name'] = report.name;
          if (columns.amount) row['Amount (₱)'] = report.amount;
          if (columns.purpose) row['Purpose'] = report.purpose;
          if (columns.intention) row['Intention'] = report.intention;
          if (columns.dateOfDonation) row['Date of Donation'] = report.dateOfDonation;
          return row;
        });
        filename = 'Donation_Report.xlsx';
        break;

      case 'Event':
        const eventData = getSearchedEventReports();
        columns = getEventColumns();
        
        dataToExport = eventData.map(report => {
          const row = {};
          if (columns.title) row['Title'] = report.title;
          if (columns.organizer) row['Organizer'] = report.organizer;
          if (columns.nameOfParish) row['Name of Parish'] = report.nameOfParish;
          if (columns.location) row['Location'] = report.location;
          if (columns.date) row['Date'] = report.date;
          if (columns.time) row['Time'] = report.time;
          return row;
        });
        filename = 'Event_Report.xlsx';
        break;

      case 'Expenses':
        const expenseData = getSearchedExpenseReports();
        columns = getExpenseColumns();
        
        dataToExport = expenseData.map(report => {
          const row = {};
          if (columns.expenseName) row['Expense Name'] = getExpenseNameLabel(report.category, report.expenseName);
          if (columns.category) row['Category'] = getCategoryLabel(report.category);
          if (columns.amount) row['Amount (₱)'] = `₱${parseFloat(report.amount).toFixed(2)}`;
          if (columns.dateOfExpense) row['Date of Expense'] = report.dateOfExpense;
          return row;
        });
        filename = 'Expenses_Report.xlsx';
        break;

      default:
        return;
    }

    if (dataToExport.length === 0) {
      setMessage({ text: "No data to export", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentView);

    // Save the file
    XLSX.writeFile(wb, filename);

    setMessage({ text: "Report exported successfully!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const renderTable = () => {
    if (currentView === "Appointment") {
      return renderAppointmentTable();
    } else if (currentView === "Request Certificate") {
      return renderRequestCertificateTable();
    } else if (currentView === "Donation") {
      return renderDonationTable();
    } else if (currentView === "Event") {
      return renderEventTable();
    } else if (currentView === "Expenses") {
      return renderExpensesTable();
    }
  };

  const renderAppointmentTable = () => {
    const reports = getSearchedAppointmentReports();
    const columns = getAppointmentColumns();
    const columnCount = Object.values(columns).filter(Boolean).length;

    return (
      <div>
        <h2 className="table-title-srp">APPOINTMENT</h2>
        <table className="report-table-srp">
          <thead>
            <tr>
              {columns.firstName && <th>First Name</th>}
              {columns.lastName && <th>Last Name</th>}
              {columns.brideName && <th>Bride's Name</th>}
              {columns.groomName && <th>Groom's Name</th>}
              {columns.category && <th>Category</th>}
              {columns.date && <th>Date</th>}
              {columns.time && <th>Time</th>}
              {columns.status && <th>Status</th>}
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map((report, index) => (
                <tr key={`${report.id}-${index}`}>
                  {columns.firstName && <td>{report.firstName || '-'}</td>}
                  {columns.lastName && <td>{report.lastName || '-'}</td>}
                  {columns.brideName && <td>{report.brideName || '-'}</td>}
                  {columns.groomName && <td>{report.groomName || '-'}</td>}
                  {columns.category && <td>{report.category}</td>}
                  {columns.date && <td>{report.date}</td>}
                  {columns.time && <td>{report.time || '-'}</td>}
                  {columns.status && <td>{report.status}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnCount} className="no-results-srp">No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRequestCertificateTable = () => {
    const reports = getSearchedRequestCertificateReports();
    const columns = getRequestCertificateColumns();
    const columnCount = Object.values(columns).filter(Boolean).length;

    return (
      <div>
        <h2 className="table-title-srp">REQUEST CERTIFICATE</h2>
        <table className="report-table-srp">
          <thead>
            <tr>
              {columns.firstName && <th>First Name</th>}
              {columns.lastName && <th>Last Name</th>}
              {columns.category && <th>Category</th>}
              {columns.dateSubmitted && <th>Date Submitted</th>}
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map(report => (
                <tr key={report.id}>
                  {columns.firstName && <td>{report.firstName}</td>}
                  {columns.lastName && <td>{report.lastName}</td>}
                  {columns.category && <td>{report.category}</td>}
                  {columns.dateSubmitted && <td>{report.dateSubmitted}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnCount} className="no-results-srp">No certificates found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDonationTable = () => {
    const reports = getSearchedDonationReports();
    const columns = getDonationColumns();
    const columnCount = Object.values(columns).filter(Boolean).length;

    return (
      <div>
        <h2 className="table-title-srp">DONATION</h2>
        <table className="report-table-srp">
          <thead>
            <tr>
              {columns.name && <th>Name</th>}
              {columns.amount && <th>Amount (₱)</th>}
              {columns.purpose && <th>Purpose</th>}
              {columns.intention && <th>Intention</th>}
              {columns.dateOfDonation && <th>Date of Donation</th>}
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map(report => (
                <tr key={report.id}>
                  {columns.name && <td>{report.name}</td>}
                  {columns.amount && <td>{report.amount}</td>}
                  {columns.purpose && <td>{report.purpose}</td>}
                  {columns.intention && <td>{report.intention}</td>}
                  {columns.dateOfDonation && <td>{report.dateOfDonation}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnCount} className="no-results-srp">No donations found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEventTable = () => {
    const reports = getSearchedEventReports();
    const columns = getEventColumns();
    const columnCount = Object.values(columns).filter(Boolean).length;

    return (
      <div>
        <h2 className="table-title-srp">EVENTS</h2>
        <table className="report-table-srp">
          <thead>
            <tr>
              {columns.title && <th>Title</th>}
              {columns.organizer && <th>Organizer</th>}
              {columns.nameOfParish && <th>Name of Parish</th>}
              {columns.location && <th>Location</th>}
              {columns.date && <th>Date</th>}
              {columns.time && <th>Time</th>}
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map(report => (
                <tr key={report.id}>
                  {columns.title && <td>{report.title}</td>}
                  {columns.organizer && <td>{report.organizer}</td>}
                  {columns.nameOfParish && <td>{report.nameOfParish}</td>}
                  {columns.location && <td>{report.location}</td>}
                  {columns.date && <td>{report.date}</td>}
                  {columns.time && <td>{report.time}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnCount} className="no-results-srp">No events found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderExpensesTable = () => {
    const reports = getSearchedExpenseReports();
    const columns = getExpenseColumns();
    const columnCount = Object.values(columns).filter(Boolean).length;

    return (
      <div>
        <h2 className="table-title-srp">EXPENSES</h2>
        <table className="report-table-srp">
          <thead>
            <tr>
              {columns.expenseName && <th>Expense Name</th>}
              {columns.category && <th>Category</th>}
              {columns.amount && <th>Amount (₱)</th>}
              {columns.dateOfExpense && <th>Date of Expense</th>}
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map(report => (
                <tr key={report.reportID}>
                  {columns.expenseName && <td>{getExpenseNameLabel(report.category, report.expenseName)}</td>}
                  {columns.category && <td>{getCategoryLabel(report.category)}</td>}
                  {columns.amount && <td>₱{parseFloat(report.amount).toFixed(2)}</td>}
                  {columns.dateOfExpense && <td>{report.dateOfExpense}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnCount} className="no-results-srp">No expenses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFilterModal = () => {
    if (!showFilterModal) return null;

    const getModalTitle = () => {
      switch(selectedFilterType) {
        case 'Appointment': return 'APPOINTMENT FILTER';
        case 'Request Certificate': return 'REQUEST CERTIFICATE FILTER';
        case 'Donation': return 'DONATIONS FILTER';
        case 'Event': return 'EVENTS FILTER';
        case 'Expenses': return 'EXPENSES FILTER';
        default: return 'FILTER';
      }
    };

    const renderFilterFields = () => {
      switch(selectedFilterType) {
        case 'Appointment':
          const isMarriageCategory = selectedCategory === 'Marriage';
          return (
            <>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <select name="category" onChange={handleCategoryChange} value={selectedCategory}>
                    <option value="">Select Category</option>
                    <option value="Baptism">Baptism</option>
                    <option value="Blessing">Blessing</option>
                    <option value="Communion">Communion</option>
                    <option value="Confirmation">Confirmation</option>
                    <option value="Funeral Mass">Funeral Mass</option>
                    <option value="Marriage">Marriage</option>
                    <option value="Anointing of the Sick">Anointing of the Sick</option>
                  </select>
                </div>
                <div className="filter-form-group">
                  <select name="status">
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </div>

              {isMarriageCategory ? (
                <div className="filter-form-row">
                  <div className="filter-form-group">
                    <input type="text" name="brideName" placeholder="Enter Bride's Name" />
                  </div>
                  <div className="filter-form-group">
                    <input type="text" name="groomName" placeholder="Enter Groom's Name" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="filter-form-row">
                    <div className="filter-form-group">
                      <input type="text" name="firstName" placeholder="Enter First Name" />
                    </div>
                    <div className="filter-form-group">
                      <input 
                        type="date" 
                        name="date" 
                        className="date-input-srp"
                        min="1000-01-01"
                        max="9999-12-31"
                        onChange={handleDateChange}
                      />
                    </div>
                  </div>
                  <div className="filter-form-row">
                    <div className="filter-form-group">
                      <input type="text" name="lastName" placeholder="Enter Last Name" />
                    </div>
                    <div className="filter-form-group"></div>
                  </div>
                </>
              )}
            </>
          );

        case 'Request Certificate':
          return (
            <>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <input type="text" name="firstName" placeholder="Enter First Name" />
                </div>
                <div className="filter-form-group">
                  <input type="text" name="lastName" placeholder="Enter Last Name" />
                </div>
              </div>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <select name="category">
                    <option value="">Select Category</option>
                    <option value="Baptism">Baptism</option>
                    <option value="Communion">Communion</option>
                    <option value="Confirmation">Confirmation</option>
                    <option value="Marriage">Marriage</option>
                  </select>
                </div>
                <div className="filter-form-group">
                  <input 
                    type="date" 
                    name="date" 
                    className="date-input-srp"
                    min="1000-01-01"
                    max="9999-12-31"
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            </>
          );

        case 'Donation':
          return (
            <>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <input type="text" name="donorName" placeholder="Enter Name" />
                </div>
                <div className="filter-form-group">
                  <select name="purpose">
                    <option value="">Select Purpose</option>
                    <option value="Mass Intention">Mass Intention</option>
                    <option value="Parish Development / Maintenance">Parish Development / Maintenance</option>
                    <option value="Charity Program (Feeding, Outreach, etc.)">Charity Program (Feeding, Outreach, etc.)</option>
                    <option value="General Parish Fund">General Parish Fund</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <input 
                    type="number" 
                    name="amount" 
                    placeholder="Amount" 
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="filter-form-group">
                  <select name="intention">
                    <option value="">Select Intention Type</option>
                    <option value="Thanksgiving">Thanksgiving</option>
                    <option value="Healing/Recovery">Healing/Recovery</option>
                    <option value="For the Soul">For the Soul</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <input 
                    type="date" 
                    name="date" 
                    className="date-input-srp"
                    min="1000-01-01"
                    max="9999-12-31"
                    onChange={handleDateChange}
                  />
                </div>
                <div className="filter-form-group"></div>
              </div>
            </>
          );

        case 'Event':
          return (
            <>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <input type="text" name="eventTitle" placeholder="Title" />
                </div>
                <div className="filter-form-group">
                  <input type="text" name="organizer" placeholder="Organizer" />
                </div>
              </div>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <input type="text" name="parishName" placeholder="Name of Parish" />
                </div>
                <div className="filter-form-group">
                  <input 
                    type="date" 
                    name="date" 
                    className="date-input-srp"
                    min="1000-01-01"
                    max="9999-12-31"
                    onChange={handleDateChange}
                  />
                </div>
              </div>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <input type="text" name="location" placeholder="Location" />
                </div>
                <div className="filter-form-group"></div>
              </div>
            </>
          );

        case 'Expenses':
          return (
            <>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <select name="category" onChange={handleCategoryChange} value={selectedCategory}>
                    <option value="">Select Category</option>
                    <optgroup label="Parish Receipts Subject to 10% Diocesan Share">
                      <option value="ministerial_services">A. Ministerial Services</option>
                      <option value="collections">B. Collections</option>
                      <option value="other_income">C. Other Income</option>
                    </optgroup>
                    <optgroup label="Diocesan Receipts Not Subject to 10% Diocesan Share">
                      <option value="donation_special_projects">A. Donation from Special Projects</option>
                      <option value="other_church_income">B. Other Church Income/Donations Individuals</option>
                      <option value="foreign_local_fundings">C. Foreign & Local Fundings Assistance</option>
                    </optgroup>
                    <optgroup label="Diocesan Receipts">
                      <option value="pontifical_collections">A. Pontifical Collections</option>
                      <option value="national_collections">B. National Collections</option>
                      <option value="diocesan_collections">C. Diocesan Collections</option>
                    </optgroup>
                    <optgroup label="Other Receipts">
                      <option value="other_receipts">IV. Other Receipts</option>
                    </optgroup>
                    <optgroup label="Disbursement">
                      <option value="priest_honoraria">I. Priest Honoraria</option>
                      <option value="rectory_expenses">II. Rectory Expenses</option>
                      <option value="regular_expenses">III. Regular Expenses</option>
                      <option value="church_supplies">IV. Church Supplies & Other Expenses</option>
                      <option value="repair_maintenance">V. Repair & Maintenance</option>
                      <option value="honorarium">VI. Honorarium</option>
                      <option value="pastoral_program">VII. Pastoral Program</option>
                      <option value="special_project_donation">VIII. Special Project Donation</option>
                      <option value="remittance_curia">IX. Remittance to the Curia</option>
                      <option value="cash_advances">X. Cash Advances (receivables)</option>
                    </optgroup>
                  </select>
                </div>
                <div className="filter-form-group">
                  {selectedCategory && expenseNameOptions[selectedCategory] ? (
                    <select name="expenseName">
                      <option value="">Select Expense Name</option>
                      {expenseNameOptions[selectedCategory].map(expense => (
                        <option key={expense.value} value={expense.value}>
                          {expense.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      name="expenseName" 
                      placeholder="Enter expense name"
                    />
                  )}
                </div>
              </div>
              <div className="filter-form-row">
                <div className="filter-form-group">
                  <input 
                    type="number" 
                    name="amount" 
                    placeholder="Amount" 
                    min="0"
                    step="0.01"
                    onKeyPress={(e) => {
                      // Allow only numbers, decimal point, and control keys
                      if (!/[\d.]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="filter-form-group">
                  <input 
                    type="date" 
                    name="date" 
                    className="date-input-srp"
                    min="1000-01-01"
                    max="9999-12-31"
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            </>
          );

        default:
          return null;
      }
    };

    return (
      <div className="filter-modal-overlay">
        <div className="filter-modal">
          <div className="filter-modal-content">
            <h2 className="filter-modal-title">{getModalTitle()}</h2>
            <form onSubmit={handleFilterSubmit} className="filter-form">
              {renderFilterFields()}
              <div className="filter-form-actions">
                <button type="submit" className="apply-filter-btn">APPLY FILTER</button>
                <button type="button" className="cancel-filter-btn" onClick={closeFilterModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="report-container-srp">
      <div className="title-container-srp">
        <h1 className="title-srp">Report</h1>
      </div>
      
      {message.text && (
        <div className={`message-srp ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="report-actions-srp">
        <div className="search-bar-srp">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm} 
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-srp" />
        </div>

        <div className="right-actions-srp">
          <div className="filter-container-srp">
            <div className="filter-dropdown-srp">
              <button 
                className="filter-btn-srp" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Filter
                <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon-srp ${isDropdownOpen ? 'rotate' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="filter-dropdown-menu-srp">
                  <div 
                    className="filter-dropdown-item-srp"
                    onClick={() => openFilterModal('Appointment')}
                  >
                    Appointment
                  </div>
                  <div 
                    className="filter-dropdown-item-srp"
                    onClick={() => openFilterModal('Request Certificate')}
                  >
                    Request Certificate
                  </div>
                  <div 
                    className="filter-dropdown-item-srp"
                    onClick={() => openFilterModal('Donation')}
                  >
                    Donations
                  </div>
                  <div 
                    className="filter-dropdown-item-srp"
                    onClick={() => openFilterModal('Event')}
                  >
                    Events
                  </div>
                  <div 
                    className="filter-dropdown-item-srp"
                    onClick={() => openFilterModal('Expenses')}
                  >
                    Expenses
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasSearched && currentView && (
            <button 
              className="export-btn-srp" 
              onClick={handleExportToExcel}
              title="Export to Excel"
            >
              <FontAwesomeIcon icon={faFileExcel} className="export-icon-srp" />
              Export
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator-srp">Loading reports...</div>
      ) : hasSearched ? (
        renderTable()
      ) : (
        <div className="no-results-srp" style={{ marginTop: '50px', fontSize: '16px' }}>
          Please apply a filter to view reports
        </div>
      )}

      {renderFilterModal()}
    </div>
  );
};

export default SecretaryReport;