import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import "./secretaryreport.css";

const SecretaryReport = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  
  // State for form values to calculate total cost dynamically
  const [formValues, setFormValues] = useState({
    amount: 0,
    quantity: 1
  });

  // Sample expense data - in a real app, this would come from an API/database
  const [expenses, setExpenses] = useState([
    {
      id: 2001,
      expenseName: "Office Supplies",
      category: "Administrative",
      amount: 500.00,
      quantity: 5,
      totalCost: 2500.00,
      expenseDate: "2025-04-15T09:30:00",
      description: "Purchased paper, pens, and folders"
    },
    {
      id: 2002,
      expenseName: "Electricity Bill",
      category: "Utilities",
      amount: 8000.00,
      quantity: 1,
      totalCost: 8000.00,
      expenseDate: "2025-04-20T14:00:00",
      description: "Monthly electricity bill for April"
    },
    {
      id: 2003,
      expenseName: "Cleaning Supplies",
      category: "Maintenance",
      amount: 300.00,
      quantity: 10,
      totalCost: 3000.00,
      expenseDate: "2025-04-18T11:45:00",
      description: "Cleaning materials for the church"
    }
  ]);

  // Total income data (in a real app, this would be fetched from payment data)
  const totalIncome = 11500.00;
  
  // Calculate total expenses (sum of all totalCost)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.totalCost, 0);
  
  // Calculate net balance
  const netBalance = totalIncome - totalExpenses;

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

  // Extract month from a date string
  const getMonthFromDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'long' });
  };

  // Filter expenses based on search term and filters
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = searchTerm === "" || 
                         expense.expenseName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "" || expense.category === categoryFilter;
    
    const matchesMonth = monthFilter === "" || 
                         getMonthFromDate(expense.expenseDate).toLowerCase() === monthFilter.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesMonth;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Parse numeric values
    const amount = parseFloat(formData.get('amount'));
    const quantity = parseInt(formData.get('quantity'));
    const totalCost = amount * quantity;
    
    const expenseData = {
      id: isEditing ? currentExpense.id : Date.now(),
      expenseName: formData.get('expenseName'),
      category: formData.get('category'),
      amount: amount,
      quantity: quantity,
      totalCost: totalCost,
      expenseDate: formData.get('expenseDate'),
      description: formData.get('description')
    };

    if (isEditing) {
      // Update existing expense
      const updatedExpenses = expenses.map(expense => 
        expense.id === currentExpense.id ? expenseData : expense
      );
      setExpenses(updatedExpenses);
    } else {
      // Add new expense
      setExpenses([...expenses, expenseData]);
    }

    // Close modal
    toggleModal();
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Function to generate PDF report
  const generateReport = () => {
    alert("Generate PDF Report functionality would be implemented here");
    // In a real implementation, this would create a PDF with expense data
  };

  return (
    <div className="report-container-sr">
      <div className="title-container-sr">
        <h1 className="title-sr">EXPENSE REPORTS</h1>
      </div>
      
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

          <select 
            className="filter-select-sr"
            value={monthFilter}
            onChange={handleMonthFilterChange}
          >
            <option value="">All Months</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>

          <button className="add-btn-sr" onClick={() => toggleModal()}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
          
          <button className="report-btn-sr" onClick={generateReport}>
            <FontAwesomeIcon icon={faFilePdf} /> REPORT
          </button>
        </div>
      </div>

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
              <tr key={expense.id}>
                <td>{expense.expenseName}</td>
                <td>{expense.category}</td>
                <td>{formatCurrency(expense.amount)}</td>
                <td>{expense.quantity}</td>
                <td>{formatCurrency(expense.totalCost)}</td>
                <td>{formatDate(expense.expenseDate)}</td>
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

      <div className="finance-summary-sr">
        <div className="summary-card-sr income-card-sr">
          <h3>Total Income</h3>
          <p>{formatCurrency(totalIncome)}</p>
        </div>
        <div className="summary-card-sr expense-card-sr">
          <h3>Total Expenses</h3>
          <p>{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="summary-card-sr balance-card-sr">
          <h3>Net Balance</h3>
          <p className={netBalance >= 0 ? "positive-balance-sr" : "negative-balance-sr"}>
            {formatCurrency(netBalance)}
          </p>
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
                  <input 
                    type="datetime-local" 
                    name="expenseDate" 
                    required 
                    defaultValue={currentExpense ? new Date(currentExpense.expenseDate).toISOString().slice(0, 16) : ''}
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

export default SecretaryReport;