import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./secretaryreport.css";
// Fix PDF imports
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const SecretaryReport = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [availableYears, setAvailableYears] = useState([]);
  
  // State for expenses data
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  // State for form values to calculate total cost dynamically
  const [formValues, setFormValues] = useState({
    amount: 0,
    quantity: 1
  });

  // Fetch expense data on component mount and when filters change
  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, monthFilter, yearFilter]);

  // Fetch expenses from the server
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (categoryFilter) queryParams.append('category', categoryFilter);
      if (monthFilter) {
        // Convert month name to number (January = 1, February = 2, etc.)
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
        const monthNumber = monthNames.indexOf(monthFilter) + 1;
        queryParams.append('month', monthNumber);
      }
      if (yearFilter) queryParams.append('year', yearFilter);
      
      const response = await axios.get(`https://parishofdivinemercy.com/backend/report.php?${queryParams.toString()}`);
      
      if (response.data.success) {
        setExpenses(response.data.reports);
        setTotalExpenses(response.data.totalExpenses);
        
        // Set available years for filter dropdown
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
      // Initialize form values when editing
      setFormValues({
        amount: expense.amount,
        quantity: expense.quantity
      });
    } else {
      setIsEditing(false);
      setCurrentExpense(null);
      // Reset form values for new expense
      setFormValues({
        amount: 0,
        quantity: 1
      });
    }
    setShowModal(!showModal);
  };

  // Handle input changes and update formValues
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: parseFloat(value) || 0
    });
  };

  // Calculate total cost based on amount and quantity
  const calculateTotalCost = () => {
    return (formValues.amount * formValues.quantity).toFixed(2);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Handle month filter change
  const handleMonthFilterChange = (e) => {
    setMonthFilter(e.target.value);
  };

  // Handle year filter change
  const handleYearFilterChange = (e) => {
    setYearFilter(e.target.value);
  };

  // Extract month from a date string
  const getMonthFromDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'long' });
  };

  // Filter expenses based on search term (local filtering)
  const filteredExpenses = expenses.filter(expense => {
    return searchTerm === "" || 
      expense.expenseName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      // Parse numeric values
      const amount = parseFloat(formData.get('amount'));
      const quantity = parseInt(formData.get('quantity'));
      const expenseName = formData.get('expenseName');
      const category = formData.get('category');
      const description = formData.get('description');
      
      // Format date of expense - current date in YYYY-MM-DD format for new expenses
      // For existing expenses, keep the original date
      let dateOfExpense;
      if (isEditing) {
        // Keep the original date when updating
        dateOfExpense = currentExpense.dateOfExpense;
      } else {
        // Current date in YYYY-MM-DD format for new expenses
        const today = new Date();
        dateOfExpense = today.toISOString().slice(0, 10); // YYYY-MM-DD format
      }
      
      const expenseData = {
        expenseName,
        category,
        amount,
        quantity,
        dateOfExpense,
        description
      };
      
      if (isEditing) {
        // Add reportID for update
        expenseData.reportID = currentExpense.reportID;
        
        // Update existing expense
        const response = await axios.put('https://parishofdivinemercy.com/backend/report.php', expenseData);
        
        if (response.data.success) {
          setMessage({ text: "Expense updated successfully", type: "success" });
        } else {
          setMessage({ text: response.data.message || "Failed to update expense", type: "error" });
        }
      } else {
        // Add new expense
        const response = await axios.post('https://parishofdivinemercy.com/backend/report.php', expenseData);
        
        if (response.data.success) {
          setMessage({ text: "Expense added successfully", type: "success" });
        } else {
          setMessage({ text: response.data.message || "Failed to add expense", type: "error" });
        }
      }
      
      // Close modal and refresh data
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
      return dateTimeString; // Return as is if it can't be parsed
    }
  };

  const formatDate = (dateTimeString) => {
    try {
      // If the date is already in YYYY-MM-DD format, return as is
      if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateTimeString;
      }
      
      // Extract just the date part if the format has time component
      const datePart = dateTimeString.split(' ')[0];
      const date = new Date(datePart);
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateTimeString; // Return as is if it can't be parsed
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Function to generate PDF report
  const generateReport = () => {
    try {
      // Check if there are expenses to export
      if (filteredExpenses.length === 0) {
        setMessage({ text: "No expenses to export. Please adjust your filters.", type: "error" });
        return;
      }

      // Create a new jsPDF instance in portrait, A4 format
      const doc = new jsPDF();
      
      // Define colors based on CSS
      const primaryColor = [179, 112, 31]; // #b3701f
      const secondaryColor = [87, 57, 1];  // #573901
      const lightColor = [253, 248, 232];  // #fdf8e8
      
      // Set up document properties
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Parish of Divine Mercy', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text('Expense Report', pageWidth / 2, 30, { align: 'center' });
      
      // Add report information
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Add filter info
      let filterText = '';
      if (categoryFilter) filterText += `Category: ${categoryFilter}   `;
      if (monthFilter) filterText += `Month: ${monthFilter}   `;
      if (yearFilter) filterText += `Year: ${yearFilter}`;
      
      if (filterText) {
        doc.text('Filters: ' + filterText, 14, 40);
      }
      
      // Add date
      const today = new Date();
      doc.text('Generated: ' + today.toLocaleDateString(), 14, 45);
      
      // Generate table - prepare data
      const tableRows = [];
      
      // Process each expense into a row
      filteredExpenses.forEach(expense => {
        const row = [
          expense.expenseName,
          expense.category,
          formatCurrency(expense.amount).replace('₱', ''),
          expense.quantity,
          formatCurrency(expense.totalCost).replace('₱', ''),
          formatDate(expense.dateOfExpense)
        ];
        tableRows.push(row);
      });
      
      // Create table with jspdf-autotable
      doc.autoTable({
        startY: 50,
        head: [['Expense Name', 'Category', 'Amount', 'Quantity', 'Total Cost', 'Date']],
        body: tableRows,
        theme: 'plain',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 15, halign: 'center' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 25, halign: 'center' }
        }
      });
      
      // Add total at the bottom
      const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 50) + 10;
      
      // Add total box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(pageWidth - 80, finalY - 5, 65, 10, 'F');
      
      // Add total text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, pageWidth - 15, finalY, { align: 'right' });
      
      // Set filename
      let filename = 'Expense_Report';
      if (categoryFilter) filename += `_${categoryFilter}`;
      if (monthFilter) filename += `_${monthFilter}`;
      if (yearFilter) filename += `_${yearFilter}`;
      filename += '_' + today.toISOString().split('T')[0];
      filename += '.pdf';
      
      // Save the PDF
      doc.save(filename);
      
      setMessage({ text: "PDF report generated successfully", type: "success" });
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage({ 
        text: "Failed to generate PDF report: " + (error.message || "Unknown error"), 
        type: "error" 
      });
    }
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
            placeholder="Search expenses by name or description" 
            value={searchTerm} 
            onChange={handleSearchChange}
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
            <option value="Administrative">Administrative</option>
            <option value="Utilities">Utilities</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Events">Events</option>
            <option value="Charity">Charity</option>
            <option value="Other">Other</option>
          </select>

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
              <th>Quantity</th>
              <th>Total Cost</th>
              <th>Date of Expense</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map(expense => (
                <tr key={expense.reportID}>
                  <td>{expense.expenseName}</td>
                  <td>{expense.category}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>{expense.quantity}</td>
                  <td>{formatCurrency(expense.totalCost)}</td>
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
                <td colSpan="7" className="no-results-sr">No expenses found</td>
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

      {/* Expense Modal */}
      {showModal && (
        <div className="report-modal-overlay-sr">
          <div className="report-modal-sr">
            <div className="report-modal-header-sr">
              <h2>{isEditing ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button className="close-modal-btn-sr" onClick={() => toggleModal()}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div>
              <hr className="custom-hr-sr"/>
            </div>
            <form onSubmit={handleSubmit} className="report-form-sr">
              <div className="form-row-sr">
                <div className="form-group-sr">
                  <label>Expense Name</label>
                  <input 
                    type="text" 
                    name="expenseName" 
                    required 
                    defaultValue={currentExpense?.expenseName || ''}
                  />
                </div>
                <div className="form-group-sr">
                  <label>Category</label>
                  <select 
                    name="category" 
                    required 
                    defaultValue={currentExpense?.category || ''}
                  >
                    <option value="">Select Category</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Events">Events</option>
                    <option value="Charity">Charity</option>
                    <option value="Other">Other</option>
                  </select>
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
                    defaultValue={currentExpense?.amount || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group-sr">
                  <label>Quantity</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    required 
                    min="1"
                    defaultValue={currentExpense?.quantity || 1}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group-sr">
                  <label>Total Cost (₱)</label>
                  <input 
                    type="number" 
                    name="totalCost" 
                    readOnly
                    value={calculateTotalCost()}
                  />
                </div>
              </div>

              <div className="form-row-sr">
                <div className="form-group-sr">
                  <label>Date of Expense</label>
                  {isEditing ? (
                    // For editing - show date as read-only
                    <input 
                      type="text" 
                      readOnly
                      value={formatDate(currentExpense?.dateOfExpense || '')}
                    />
                  ) : (
                    // For new expense - show current date as readonly
                    <input 
                      type="text" 
                      name="expenseDate" 
                      readOnly
                      value={new Date().toISOString().slice(0, 10)} // YYYY-MM-DD format
                    />
                  )}
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

export default SecretaryReport;