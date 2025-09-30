import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./secretaryexpenses.css";

const SecretaryExpenses = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [availableYears, setAvailableYears] = useState([]);
  
  // PDF Modal states
  const [pdfMonth, setPdfMonth] = useState("");
  const [pdfYear, setPdfYear] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  
  // State for expenses data
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  // State for form values
  const [formValues, setFormValues] = useState({
    amount: "",
    category: "",
    expenseName: ""
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Parish financial categories
  const categories = [
    { value: "ministerial_services", label: "A. Ministerial Services" },
    { value: "collections", label: "B. Collections" },
    { value: "other_income", label: "C. Other Income" },
    { value: "donation_special_projects", label: "A. Donation from Special Projects" },
    { value: "other_church_income", label: "B. Other Church Income/Donations Individuals" },
    { value: "foreign_local_fundings", label: "C. Foreign & Local Fundings Assistance" },
    { value: "pontifical_collections", label: "A. Pontifical Collections" },
    { value: "national_collections", label: "B. National Collections" },
    { value: "diocesan_collections", label: "C. Diocesan Collections" },
    { value: "other_receipts", label: "IV. Other Receipts" },
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

  // Fetch expenses from backend for PDF
  const fetchExpensesForPDF = async (month, year) => {
    try {
      const monthNumber = months.indexOf(month) + 1;
      const queryParams = new URLSearchParams({
        month: monthNumber,
        year: year
      });
      
      const response = await axios.get(`https://parishofdivinemercy.com/backend/expenses.php?${queryParams.toString()}`);
      
      if (response.data.success && response.data.reports) {
        return response.data.reports;
      }
      return [];
    } catch (error) {
      console.error("Error fetching expenses for PDF:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, monthFilter, yearFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      let queryParams = new URLSearchParams();
      if (categoryFilter) queryParams.append('category', categoryFilter);
      if (monthFilter) {
        const monthNumber = months.indexOf(monthFilter) + 1;
        queryParams.append('month', monthNumber);
      }
      if (yearFilter) queryParams.append('year', yearFilter);
      
      const response = await axios.get(`https://parishofdivinemercy.com/backend/expenses.php?${queryParams.toString()}`);
      
      if (response.data.success) {
        setExpenses(response.data.reports);
        setTotalExpenses(response.data.totalExpenses);
        
        if (response.data.availableYears) {
          setAvailableYears(response.data.availableYears);
        }
      } else {
        setMessage({ text: "Failed to fetch expense reports", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching expense reports:", error);
      setMessage({ text: "An error occurred while fetching expense data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = (expense = null) => {
    if (expense) {
      setIsEditing(true);
      setCurrentExpense(expense);
      setFormValues({
        amount: expense.amount.toString(),
        category: expense.category,
        expenseName: expense.expenseName || ""
      });
    } else {
      setIsEditing(false);
      setCurrentExpense(null);
      setFormValues({
        amount: "",
        category: "",
        expenseName: ""
      });
    }
    setShowModal(!showModal);
  };

  const togglePdfModal = () => {
    setShowPdfModal(!showPdfModal);
    if (!showPdfModal) {
      setPdfMonth("");
      setPdfYear("");
      setPreparedBy("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "category") {
      setFormValues({
        ...formValues,
        [name]: value,
        expenseName: ""
      });
    } else if (name === "amount") {
      setFormValues({
        ...formValues,
        [name]: value
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleMonthFilterChange = (e) => {
    setMonthFilter(e.target.value);
  };

  const handleYearFilterChange = (e) => {
    setYearFilter(e.target.value);
  };

  const formatNumberForSearch = (number) => {
    if (number == null || number === '') return '';
    return new Intl.NumberFormat('en-US').format(number);
  };

  const normalizeNumberForSearch = (searchValue) => {
    const numberOnly = searchValue.replace(/,/g, '');
    if (!isNaN(numberOnly) && numberOnly !== '') {
      return numberOnly;
    }
    return searchValue;
  };

  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const getExpenseNameLabel = (categoryValue, expenseNameValue) => {
    if (!expenseNameValue) return '';
    
    if (categoryValue && expenseNameOptions[categoryValue]) {
      const categoryExpenseNames = expenseNameOptions[categoryValue];
      const expenseName = categoryExpenseNames.find(expense => expense.value === expenseNameValue);
      return expenseName ? expenseName.label : expenseNameValue;
    }
    
    return expenseNameValue;
  };

  const filteredExpenses = expenses.filter(expense => {
    if (!searchTerm.trim()) {
      return true;
    }

    const searchValue = searchTerm.toLowerCase().trim();
    const originalSearchValue = searchTerm.toLowerCase();
    
    const expenseName = expense.expenseName?.toLowerCase().trim() || '';
    const category = expense.category?.toLowerCase().trim() || '';
    const description = expense.description?.toLowerCase().trim() || '';
    
    const amount = expense.amount?.toString() || '';
    const amountFormatted = formatNumberForSearch(expense.amount);
    
    const formattedDate = expense.dateOfExpense ? new Date(expense.dateOfExpense).toISOString().split('T')[0] : '';
    
    const normalizedSearchValue = searchValue.replace(/\s+/g, ' ');
    const normalizedNumberSearch = normalizeNumberForSearch(normalizedSearchValue);
    
    const endsWithSpace = originalSearchValue !== searchValue;
    
    if (endsWithSpace && searchValue) {
      return (
        expenseName.startsWith(normalizedSearchValue) ||
        category.startsWith(normalizedSearchValue) ||
        description.startsWith(normalizedSearchValue) ||
        amount.startsWith(normalizedNumberSearch) ||
        amountFormatted.startsWith(normalizedSearchValue) ||
        formattedDate.startsWith(normalizedSearchValue)
      );
    } else {
      return (
        expenseName.includes(normalizedSearchValue) ||
        category.includes(normalizedSearchValue) ||
        description.includes(normalizedSearchValue) ||
        amount.includes(normalizedNumberSearch) ||
        amountFormatted.includes(normalizedSearchValue) ||
        formattedDate.includes(normalizedSearchValue)
      );
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const amountValue = formData.get('amount');
      const amount = parseFloat(amountValue);
      
      if (!amountValue || isNaN(amount) || amount <= 0) {
        setMessage({ text: "Please enter a valid amount greater than 0", type: "error" });
        return;
      }
      
      const expenseName = formData.get('expenseName');
      const category = formData.get('category');
      const description = formData.get('description');
      const dateOfExpense = formData.get('dateOfExpense');
      
      const expenseData = {
        expenseName,
        category,
        amount,
        dateOfExpense,
        description
      };
      
      if (isEditing) {
        expenseData.reportID = currentExpense.reportID;
        
        const response = await axios.put('https://parishofdivinemercy.com/backend/expenses.php', expenseData);
        
        if (response.data.success) {
          setMessage({ text: "Expense updated successfully", type: "success" });
        } else {
          setMessage({ text: response.data.message || "Failed to update expense", type: "error" });
        }
      } else {
        const response = await axios.post('https://parishofdivinemercy.com/backend/expenses.php', expenseData);
        
        if (response.data.success) {
          setMessage({ text: "Expense added successfully", type: "success" });
        } else {
          setMessage({ text: response.data.message || "Failed to add expense", type: "error" });
        }
      }
      
      toggleModal();
      fetchExpenses();
      
    } catch (error) {
      console.error("Error saving expense:", error);
      setMessage({ 
        text: error.response?.data?.message || "An error occurred while saving the expense", 
        type: "error" 
      });
    }
  };

  const handleExportPDF = async () => {
    if (!pdfMonth || !pdfYear) {
      setMessage({ text: "Please select both month and year", type: "error" });
      return;
    }

    if (pdfYear.length !== 4 || isNaN(pdfYear)) {
      setMessage({ text: "Please enter a valid 4-digit year", type: "error" });
      return;
    }

    try {
      // Fetch real expenses data from backend
      const expensesData = await fetchExpensesForPDF(pdfMonth, pdfYear);
      
      if (!expensesData || expensesData.length === 0) {
        setMessage({ text: "No expenses found for the selected month and year", type: "error" });
        return;
      }
      
      // Aggregate expenses by category and expense name
      const aggregated = {};
      expensesData.forEach(expense => {
        const key = `${expense.category}_${expense.expenseName}`;
        if (!aggregated[key]) {
          aggregated[key] = {
            category: expense.category,
            expenseName: expense.expenseName,
            amount: 0
          };
        }
        // Ensure amount is a valid number
        const amount = parseFloat(expense.amount);
        if (!isNaN(amount)) {
          aggregated[key].amount += amount;
        }
      });

      // Generate PDF
      const doc = new jsPDF();
      let yPos = 20;
      
      // Header
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('PARISH OF DIVINE MERCY', 105, yPos, { align: 'center' });
      yPos += 7;
      doc.setFontSize(12);
      doc.text('EXPENSE REPORT', 105, yPos, { align: 'center' });
      yPos += 7;
      doc.setFontSize(10);
      doc.text(`FOR THE MONTH OF ${pdfMonth.toUpperCase()} ${pdfYear}`, 105, yPos, { align: 'center' });
      yPos += 10;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);

      // Helper function to add line
      const addLine = (text, amount = null, indent = 0, drawLine = false) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(text, 15 + indent, yPos);
        if (amount !== null) {
          doc.text(amount.toString(), 195, yPos, { align: 'right' });
        }
        if (drawLine) {
          // Draw a line for manual fill-in
          doc.line(120, yPos, 195, yPos);
        }
        yPos += 5;
      };

      // Helper to get amount for expense
      const getAmount = (category, expenseName) => {
        const key = `${category}_${expenseName}`;
        return aggregated[key] ? aggregated[key].amount : 0;
      };

      // Helper to get total amount for independent categories (no dropdown)
      const getCategoryTotal = (category) => {
        let total = 0;
        Object.keys(aggregated).forEach(key => {
          if (aggregated[key].category === category) {
            total += aggregated[key].amount;
          }
        });
        return total;
      };

      const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
      };

      // I. Parish Receipts Subject to 10% Diocesan Share
      doc.setFont(undefined, 'bold');
      addLine('I. Parish Receipts Subject to 10% Diocesan Share');
      doc.setFont(undefined, 'normal');
      
      let section1Total = 0;
      
      // A. Ministerial Services
      doc.setFont(undefined, 'bold');
      addLine('A. Ministerial Services', null, 3);
      doc.setFont(undefined, 'normal');
      const baptismAmt = getAmount('ministerial_services', 'baptism');
      const marriageAmt = getAmount('ministerial_services', 'marriage');
      const funeralAmt = getAmount('ministerial_services', 'funeral_services');
      const massAmt = getAmount('ministerial_services', 'mass_offering');
      const otherReligiousAmt = getAmount('ministerial_services', 'other_religious_services');
      addLine('1. Baptism', formatAmount(baptismAmt), 6);
      addLine('2. Marriage', formatAmount(marriageAmt), 6);
      addLine('3. Funeral Services', formatAmount(funeralAmt), 6);
      addLine('4. Mass Offering', formatAmount(massAmt), 6);
      addLine('5. Other Religious Services', formatAmount(otherReligiousAmt), 6);
      section1Total += baptismAmt + marriageAmt + funeralAmt + massAmt + otherReligiousAmt;

      // B. Collections
      doc.setFont(undefined, 'bold');
      addLine('B. Collections', null, 3);
      doc.setFont(undefined, 'normal');
      const dailySundayAmt = getAmount('collections', 'daily_sunday_collections');
      const stewardshipAmt = getAmount('collections', 'stewardship_sharing');
      const rentalAmt = getAmount('collections', 'rental_church_property');
      const cemeteryRentalAmt = getAmount('collections', 'cemetery_rental');
      const documentationAmt = getAmount('collections', 'documentation');
      addLine('6. Daily & Sunday Collections', formatAmount(dailySundayAmt), 6);
      addLine('7. Stewardship Sharing', formatAmount(stewardshipAmt), 6);
      addLine('8. Rental for Church Property', formatAmount(rentalAmt), 6);
      addLine('9. Cemetery Rental', formatAmount(cemeteryRentalAmt), 6);
      addLine('10. Documentation', formatAmount(documentationAmt), 6);
      section1Total += dailySundayAmt + stewardshipAmt + rentalAmt + cemeteryRentalAmt + documentationAmt;

      // C. Other Income
      doc.setFont(undefined, 'bold');
      const otherIncomeTotal = getCategoryTotal('other_income');
      addLine('C. Other Income', formatAmount(otherIncomeTotal), 3);
      doc.setFont(undefined, 'normal');
      section1Total += otherIncomeTotal;

      // II. Diocesan Receipts Not Subject to 10% Diocesan Share
      yPos += 2;
      doc.setFont(undefined, 'bold');
      addLine('II. Diocesan Receipts Not Subject to 10% Diocesan Share');
      doc.setFont(undefined, 'normal');

      let section2Total = 0;

      // A. Donation from Special Projects
      doc.setFont(undefined, 'bold');
      addLine('A. Donation from Special Projects', null, 3);
      doc.setFont(undefined, 'normal');
      const renovationAmt = getAmount('donation_special_projects', 'for_renovation');
      const catechistAmt = getAmount('donation_special_projects', 'for_catechist');
      const fiestaAmt = getAmount('donation_special_projects', 'from_parish_fiesta');
      const religiousMovementAmt = getAmount('donation_special_projects', 'religious_movement_organization');
      addLine('11. For Renovation', formatAmount(renovationAmt), 6);
      addLine('12. For Catechist', formatAmount(catechistAmt), 6);
      addLine('13. From Parish Fiesta', formatAmount(fiestaAmt), 6);
      addLine('14. Religious Movement & Organization', formatAmount(religiousMovementAmt), 6);
      section2Total += renovationAmt + catechistAmt + fiestaAmt + religiousMovementAmt;

      // B. Other Church Income
      doc.setFont(undefined, 'bold');
      const otherChurchTotal = getCategoryTotal('other_church_income');
      addLine('B. Other Church Income / Donations Individuals', formatAmount(otherChurchTotal), 3);
      doc.setFont(undefined, 'normal');
      section2Total += otherChurchTotal;

      // C. Foreign & Local Fundings
      doc.setFont(undefined, 'bold');
      const fundingsTotal = getCategoryTotal('foreign_local_fundings');
      addLine('C. Foreign & Local Fundings Assistance', formatAmount(fundingsTotal), 3);
      doc.setFont(undefined, 'normal');
      section2Total += fundingsTotal;

      // III. Diocesan Receipts (if you have these categories, add them here)
      // For now, they're not in the dummy data but the structure is ready

      // IV. Other Receipts
      yPos += 2;
      doc.setFont(undefined, 'bold');
      const otherReceiptsTotal = getCategoryTotal('other_receipts');
      addLine('IV. Other Receipts', formatAmount(otherReceiptsTotal));
      doc.setFont(undefined, 'normal');
      section2Total += otherReceiptsTotal;

      // Total Receipts
      yPos += 2;
      doc.setFont(undefined, 'bold');
      const totalReceipts = section1Total + section2Total;
      addLine('TOTAL RECEIPTS', formatAmount(totalReceipts));
      addLine('TOTAL CASH AVAILABLE', formatAmount(totalReceipts));
      yPos += 3;

      // Report on Accountability of Acknowledgement Receipts
      doc.setFont(undefined, 'normal');
      addLine('Report on Accountability of Acknowledgement Receipts');
      addLine('  • Beginning Balance - Acknowledgement Receipts', null, 3, true);
      addLine('  • Issued this Month - Acknowledgement Receipts', null, 3, true);
      addLine('  • Ending Balance - Acknowledgement Receipts', null, 3, true);
      yPos += 5;

      // Disbursement Section
      doc.setFont(undefined, 'bold');
      addLine('Disbursement');
      doc.setFont(undefined, 'normal');
      
      let disbursementTotal = 0;

      // I. Priest Honoraria
      doc.setFont(undefined, 'bold');
      addLine('I. Priest Honoraria', null, 3);
      doc.setFont(undefined, 'normal');
      const parishPriestAmt = getAmount('priest_honoraria', 'parish_priest_honoraria');
      const parochialVicarAmt = getAmount('priest_honoraria', 'parochial_vicar_honoraria');
      const guestPriestsAmt = getAmount('priest_honoraria', 'guest_priests');
      addLine('01. Parish Priest Honoraria - Stipend', formatAmount(parishPriestAmt), 6);
      addLine('02. Parochial Vicar Honoraria - Stipend', formatAmount(parochialVicarAmt), 6);
      addLine('03. Guest Priests', formatAmount(guestPriestsAmt), 6);
      disbursementTotal += parishPriestAmt + parochialVicarAmt + guestPriestsAmt;

      // II. Rectory Expenses
      doc.setFont(undefined, 'bold');
      addLine('II. Rectory Expenses', null, 3);
      doc.setFont(undefined, 'normal');
      const foodAmt = getAmount('rectory_expenses', 'food_groceries');
      const fuelAmt = getAmount('rectory_expenses', 'fuel');
      const honorariumCookAmt = getAmount('rectory_expenses', 'honorarium_cook_helper');
      const kitchenAmt = getAmount('rectory_expenses', 'kitchen_supplies');
      const furnitureAmt = getAmount('rectory_expenses', 'furniture_gardening');
      const otherItemsAmt = getAmount('rectory_expenses', 'other_items');
      const rectoryRepairAmt = getAmount('rectory_expenses', 'repair_maintenance');
      addLine('04. Food & Groceries', formatAmount(foodAmt), 6);
      addLine('05. Fuel', formatAmount(fuelAmt), 6);
      addLine('06. Honorarium (cook & helper)', formatAmount(honorariumCookAmt), 6);
      addLine('07. Kitchen Supplies', formatAmount(kitchenAmt), 6);
      addLine('08. Furniture & Fixtures / Gardening Tools', formatAmount(furnitureAmt), 6);
      addLine('09. Other Items', formatAmount(otherItemsAmt), 6);
      addLine('10. Repair & Maintenance', formatAmount(rectoryRepairAmt), 6);
      disbursementTotal += foodAmt + fuelAmt + honorariumCookAmt + kitchenAmt + furnitureAmt + otherItemsAmt + rectoryRepairAmt;

      // III. Regular Expenses
      doc.setFont(undefined, 'bold');
      addLine('III. Regular Expenses', null, 3);
      doc.setFont(undefined, 'normal');
      const officeSupplyAmt = getAmount('regular_expenses', 'office_supply');
      const internetAmt = getAmount('regular_expenses', 'internet_cable');
      const lightWaterAmt = getAmount('regular_expenses', 'light_water');
      const transportationAmt = getAmount('regular_expenses', 'transportation_gas_oil');
      const vehicleRepairAmt = getAmount('regular_expenses', 'repair_maint_vehicle');
      const giftsAmt = getAmount('regular_expenses', 'gifts_donations_charity');
      const sssAmt = getAmount('regular_expenses', 'sss_pagibig_philhealth');
      const taxesAmt = getAmount('regular_expenses', 'taxes_license');
      const miscAmt = getAmount('regular_expenses', 'miscellaneous');
      addLine('11. Office Supply', formatAmount(officeSupplyAmt), 6);
      addLine('12. INTERNET / CIGNAL CABLE / OFFICE LO', formatAmount(internetAmt), 6);
      addLine('13. Light & Water', formatAmount(lightWaterAmt), 6);
      addLine('14. Transportation, Gas & Oil', formatAmount(transportationAmt), 6);
      addLine('15. Repair & Maint. - Vehicle Registration', formatAmount(vehicleRepairAmt), 6);
      addLine('16. Gifts, Donations & Charity', formatAmount(giftsAmt), 6);
      addLine('17. SSS, Pag-ibig, Phil. Health', formatAmount(sssAmt), 6);
      addLine('18. Taxes & License', formatAmount(taxesAmt), 6);
      addLine('19. Miscellaneous', formatAmount(miscAmt), 6);
      disbursementTotal += officeSupplyAmt + internetAmt + lightWaterAmt + transportationAmt + vehicleRepairAmt + giftsAmt + sssAmt + taxesAmt + miscAmt;

      // IV. Church Supplies
      doc.setFont(undefined, 'bold');
      const churchSuppliesTotal = getCategoryTotal('church_supplies');
      addLine('IV. Church Supplies & Other Expenses', formatAmount(churchSuppliesTotal), 3);
      doc.setFont(undefined, 'normal');
      disbursementTotal += churchSuppliesTotal;

      // V. Repair & Maintenance
      doc.setFont(undefined, 'bold');
      addLine('V. Repair & Maintenance', null, 3);
      doc.setFont(undefined, 'normal');
      const churchRepairAmt = getAmount('repair_maintenance', 'church');
      const propertiesAmt = getAmount('repair_maintenance', 'parish_properties');
      const hallAmt = getAmount('repair_maintenance', 'multipurpose_hall');
      const cemeteryAmt = getAmount('repair_maintenance', 'cemetery');
      const othersRepairAmt = getAmount('repair_maintenance', 'others');
      addLine('20. Church', formatAmount(churchRepairAmt), 6);
      addLine('21. Parish Properties', formatAmount(propertiesAmt), 6);
      addLine('22. Multipurpose Hall', formatAmount(hallAmt), 6);
      addLine('23. Cemetery', formatAmount(cemeteryAmt), 6);
      addLine('24. Others', formatAmount(othersRepairAmt), 6);
      disbursementTotal += churchRepairAmt + propertiesAmt + hallAmt + cemeteryAmt + othersRepairAmt;

      // VI. Honorarium
      doc.setFont(undefined, 'bold');
      addLine('VI. Honorarium', null, 3);
      doc.setFont(undefined, 'normal');
      const churchStaffAmt = getAmount('honorarium', 'church_staff');
      const officeStaffAmt = getAmount('honorarium', 'office_staff');
      const janitorialAmt = getAmount('honorarium', 'janitorial');
      const securityAmt = getAmount('honorarium', 'security_driver');
      addLine('25. Church Staff', formatAmount(churchStaffAmt), 6);
      addLine('26. Office Staff', formatAmount(officeStaffAmt), 6);
      addLine('27. Janitorial', formatAmount(janitorialAmt), 6);
      addLine('28. Security / Driver', formatAmount(securityAmt), 6);
      disbursementTotal += churchStaffAmt + officeStaffAmt + janitorialAmt + securityAmt;

      // VII. Pastoral Program
      doc.setFont(undefined, 'bold');
      addLine('VII. Pastoral Program', null, 3);
      doc.setFont(undefined, 'normal');
      const worshipAmt = getAmount('pastoral_program', 'worship_liturgy');
      const educationAmt = getAmount('pastoral_program', 'education_catechist');
      const socialAmt = getAmount('pastoral_program', 'social_services');
      const temporalitiesAmt = getAmount('pastoral_program', 'temporalities');
      const youthAmt = getAmount('pastoral_program', 'youth_dyd');
      addLine('29. Worship / Liturgy', formatAmount(worshipAmt), 6);
      addLine('30. Education / Catechist', formatAmount(educationAmt), 6);
      addLine('31. Social Services', formatAmount(socialAmt), 6);
      addLine('32. Temporalities', formatAmount(temporalitiesAmt), 6);
      addLine('33. Youth / DYD', formatAmount(youthAmt), 6);
      disbursementTotal += worshipAmt + educationAmt + socialAmt + temporalitiesAmt + youthAmt;

      // VIII. Special Project Donation
      doc.setFont(undefined, 'bold');
      addLine('VIII. Special Project Donation', null, 3);
      doc.setFont(undefined, 'normal');
      const synodAmt = getAmount('special_project_donation', 'parish_synod_activities');
      const othersSpecialAmt = getAmount('special_project_donation', 'others');
      addLine('34. Parish Synod Activities', formatAmount(synodAmt), 6);
      addLine('35. Others', formatAmount(othersSpecialAmt), 6);
      disbursementTotal += synodAmt + othersSpecialAmt;

      // IX. Remittance to the Curia
      doc.setFont(undefined, 'bold');
      const remittanceTotal = getCategoryTotal('remittance_curia');
      addLine('IX. Remittance to the Curia', formatAmount(remittanceTotal), 3);
      doc.setFont(undefined, 'normal');
      disbursementTotal += remittanceTotal;

      // X. Cash Advances
      doc.setFont(undefined, 'bold');
      const cashAdvancesTotal = getCategoryTotal('cash_advances');
      addLine('X. Cash Advances (receivables)', formatAmount(cashAdvancesTotal), 3);
      doc.setFont(undefined, 'normal');
      disbursementTotal += cashAdvancesTotal;

      // Total Disbursement
      yPos += 2;
      doc.setFont(undefined, 'bold');
      addLine('Total Disbursement', formatAmount(disbursementTotal));
      yPos += 2;
      
      // Cash Balance ending (Deficit)
      const cashBalance = totalReceipts - disbursementTotal;
      addLine('Cash Balance ending (Deficit)', formatAmount(cashBalance));
      yPos += 3;

      // CASH BALANCES
      addLine('CASH BALANCES:');
      doc.setFont(undefined, 'normal');
      addLine('  • CASH IN BANK', null, 3, true);
      addLine('  • Accounts Payables as of end of Month', null, 3, true);
      yPos += 50;

      // Prepared by - CENTERED
      if (preparedBy) {
        doc.setFont(undefined, 'bold');
        doc.text('Prepared by:', 105, yPos, { align: 'center' });
        yPos += 5;
        doc.setFont(undefined, 'normal');
        doc.text(preparedBy.toUpperCase(), 105, yPos, { align: 'center' });
        yPos += 5;
        doc.text('Bookkeeper', 105, yPos, { align: 'center' });
      }

      // Save PDF
      doc.save(`Expense_Report_${pdfMonth}_${pdfYear}.pdf`);
      
      setMessage({ text: "PDF generated successfully", type: "success" });
      togglePdfModal();
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage({ text: "An error occurred while generating the PDF", type: "error" });
    }
  };

  const formatDateTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateTimeString;
    }
  };

  const formatDate = (dateTimeString) => {
    try {
      if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateTimeString;
      }
      
      const datePart = dateTimeString.split(' ')[0];
      const date = new Date(datePart);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateTimeString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="report-container-sr">
      <div className="title-container-sr">
        <h1 className="title-sr">EXPENSE REPORTS</h1>
      </div>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="report-actions-sr">
        <div className="search-bar-sr">
          <input 
            type="text" 
            placeholder="Search expenses by name, category, amount, or date" 
            value={searchTerm} 
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sr" />
        </div>

        <div className="filter-add-container-sr">
          <select 
            className="filter-select-sr"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="">All Categories</option>
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

          <button className="pdf-btn-sr" onClick={togglePdfModal}>
            <FontAwesomeIcon icon={faFilePdf} /> PDF
          </button>

          <button className="add-btn-sr" onClick={() => toggleModal()}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">Loading expense data...</div>
      ) : (
        <table className="report-table-sr">
          <thead>
            <tr>
              <th>Expense Name</th>
              <th>Category</th>
              <th>Amount (₱)</th>
              <th>Date of Expense</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(expense => (
                <tr key={expense.reportID}>
                  <td>{getExpenseNameLabel(expense.category, expense.expenseName)}</td>
                  <td>{getCategoryLabel(expense.category)}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>{formatDate(expense.dateOfExpense)}</td>
                  <td>
                    <button className="sr-details" onClick={() => toggleModal(expense)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results-sr">No expenses found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="finance-summary-sr">
        <div className="summary-card-sr expense-card-sr">
          <h3>Total Expenses</h3>
          <p>{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      {/* PDF Modal */}
      {showPdfModal && (
        <div className="report-modal-overlay-sr">
          <div className="pdf-modal-sr">
            <div className="pdf-modal-header-sr">
              <h2>Generate Expenses</h2>
            </div>
            <div className="custom-hr-pdf-sr"></div>
            
            <div className="pdf-form-sr">
              <div className="pdf-form-row-sr">
                <div className="pdf-form-group-sr">
                  <label>Month</label>
                  <select 
                    value={pdfMonth}
                    onChange={(e) => setPdfMonth(e.target.value)}
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                
                <div className="pdf-form-group-sr">
                  <label>Year</label>
                  <input 
                    type="text"
                    value={pdfYear}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and max 4 digits
                      if (value === '' || (/^\d{0,4}$/.test(value))) {
                        setPdfYear(value);
                      }
                    }}
                    placeholder="Enter year (e.g., 2025)"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              
              <div className="pdf-form-group-sr">
                <label>Prepared By:</label>
                <input 
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="pdf-form-actions-sr">
                <button className="export-btn-sr" onClick={handleExportPDF}>
                  Export
                </button>
                <button className="cancel-pdf-btn-sr" onClick={togglePdfModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showModal && (
        <div className="report-modal-overlay-sr">
          <div className="report-modal-sr">
            <div className="report-modal-header-sr">
              <h2>{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2>
            </div>
            <div>
              <hr className="custom-hr-sr"/>
            </div>
            <form onSubmit={handleSubmit} className="report-form-sr">
              <div className="form-row-sr">
                <div className="form-group-sr">
                  <label>Category</label>
                  <select 
                    name="category" 
                    required 
                    value={formValues.category}
                    onChange={handleInputChange}
                  >
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
                <div className="form-group-sr">
                  <label>Expense Name</label>
                  {formValues.category && expenseNameOptions[formValues.category] ? (
                    <select 
                      name="expenseName" 
                      required
                      value={formValues.expenseName}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Expense Name</option>
                      {expenseNameOptions[formValues.category].map(expense => (
                        <option key={expense.value} value={expense.value}>
                          {expense.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      name="expenseName" 
                      required
                      placeholder={formValues.category ? "Enter expense name" : "Select category first"}
                      value={formValues.expenseName}
                      onChange={handleInputChange}
                      disabled={!formValues.category}
                    />
                  )}
                </div>
              </div>

              <div className="form-row-sr">
                <div className="form-group-sr">
                  <label>Amount (₱)</label>
                  <input 
                    type="number" 
                    name="amount" 
                    required 
                    step="0.01"
                    min="0"
                    value={formValues.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group-sr">
                  <label>Date of Expense</label>
                  <input 
                    type="date" 
                    name="dateOfExpense" 
                    required
                    defaultValue={isEditing ? formatDate(currentExpense?.dateOfExpense || '') : new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>

              <div className="form-row-sr">
                <div className="form-group-sr">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    rows="3"
                    defaultValue={currentExpense?.description || ''}
                  ></textarea>
                </div>
              </div>

              <div className="form-actions-sr">
                <button type="submit" className="submit-btn-sr">
                  {isEditing ? 'Update' : 'Save'}
                </button>
                <button type="button" className="cancel-btn-sr" onClick={() => toggleModal()}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryExpenses;