import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes, faReceipt } from "@fortawesome/free-solid-svg-icons";
import "./secretarypayment.css";

const SecretaryPayment = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sacramentFilter, setSacramentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Add state for form values to calculate change amount dynamically
  const [formValues, setFormValues] = useState({
    totalAmount: 0,
    amountPaid: 0
  });

  // Sample payment data - in a real app, this would come from an API/database
  const [payments, setPayments] = useState([
    {
      id: 1001,
      firstName: "Maria",
      lastName: "Santos",
      sacramentType: "Baptism",
      totalAmount: 2500.00,
      amountPaid: 1500.00,
      balance: 1000.00,
      status: "partial",
      createdAt: "2025-04-20T08:30:00",
      receiptNumber: "RCP-2025-0001"
    },
    {
      id: 1002,
      firstName: "Juan",
      lastName: "Cruz",
      sacramentType: "Wedding",
      totalAmount: 10000.00,
      amountPaid: 10000.00,
      balance: 0.00,
      status: "paid",
      createdAt: "2025-04-22T14:45:00",
      receiptNumber: "RCP-2025-0002"
    }
  ]);

  // Calculate total income (sum of all amountPaid)
  const totalIncome = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);

  const toggleModal = (payment = null) => {
    if (payment) {
      setIsEditing(true);
      setCurrentPayment(payment);
      // Initialize form values when editing
      setFormValues({
        totalAmount: payment.totalAmount,
        amountPaid: payment.amountPaid
      });
    } else {
      setIsEditing(false);
      setCurrentPayment(null);
      // Reset form values for new payment
      setFormValues({
        totalAmount: 0,
        amountPaid: 0
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

  // Calculate change amount
  const calculateChange = () => {
    if (formValues.amountPaid > formValues.totalAmount) {
      return (formValues.amountPaid - formValues.totalAmount).toFixed(2);
    }
    return "0.00";
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sacrament filter change
  const handleSacramentFilterChange = (e) => {
    setSacramentFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Filter payments based on search term and filters
  const filteredPayments = payments.filter(payment => {
    const fullName = `${payment.firstName} ${payment.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === "" || 
                         fullName.includes(searchTerm.toLowerCase()) || 
                         payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSacrament = sacramentFilter === "" || payment.sacramentType === sacramentFilter;
    const matchesStatus = statusFilter === "" || payment.status === statusFilter;
    
    return matchesSearch && matchesSacrament && matchesStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Parse numeric values
    const totalAmount = parseFloat(formData.get('totalAmount'));
    const amountPaid = parseFloat(formData.get('amountPaid'));
    const balance = totalAmount - amountPaid;
    
    // Determine status based on payment
    let status = "unpaid";
    if (amountPaid >= totalAmount) {
      status = "paid";
    } else if (amountPaid > 0) {
      status = "partial";
    }
    
    // Generate receipt number for new payments
    let receiptNumber = formData.get('receiptNumber');
    if (!isEditing) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const count = payments.length + 1;
      receiptNumber = `RCP-${year}-${String(count).padStart(4, '0')}`;
    }

    const paymentData = {
      id: isEditing ? currentPayment.id : Date.now(),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      sacramentType: formData.get('sacramentType'),
      totalAmount: totalAmount,
      amountPaid: amountPaid,
      balance: balance,
      status: status,
      createdAt: isEditing ? currentPayment.createdAt : new Date().toISOString(),
      receiptNumber: receiptNumber
    };

    if (isEditing) {
      // Update existing payment
      const updatedPayments = payments.map(payment => 
        payment.id === currentPayment.id ? paymentData : payment
      );
      setPayments(updatedPayments);
    } else {
      // Add new payment
      setPayments([...payments, paymentData]);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'paid':
        return 'status-paid-spm';
      case 'partial':
        return 'status-partial-spm';
      case 'unpaid':
        return 'status-unpaid-spm';
      default:
        return '';
    }
  };

  // Function to print receipt
  const printReceipt = () => {
    if (!currentPayment) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Create receipt content
    const receiptContent = `
      <html>
        <head>
          <title>Receipt - ${currentPayment.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { width: 100%; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-title { font-size: 24px; font-weight: bold; }
            .receipt-number { font-size: 18px; margin: 10px 0; }
            .receipt-date { margin-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            .payment-details { margin-bottom: 20px; }
            .payment-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total-row { font-weight: bold; border-top: 1px solid #ccc; padding-top: 5px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="receipt-header">
              <div class="receipt-title">OFFICIAL RECEIPT</div>
              <div class="receipt-number">Receipt No: ${currentPayment.receiptNumber}</div>
              <div class="receipt-date">Date: ${formatDateTime(currentPayment.createdAt)}</div>
            </div>
            
            <div class="customer-info">
              <div><strong>Name:</strong> ${currentPayment.firstName} ${currentPayment.lastName}</div>
              <div><strong>Service:</strong> ${currentPayment.sacramentType}</div>
            </div>
            
            <div class="payment-details">
              <div class="payment-row">
                <div>Total Amount:</div>
                <div>${formatCurrency(currentPayment.totalAmount)}</div>
              </div>
              <div class="payment-row">
                <div>Amount Paid:</div>
                <div>${formatCurrency(currentPayment.amountPaid)}</div>
              </div>
              <div class="payment-row">
                <div>Balance:</div>
                <div>${formatCurrency(currentPayment.balance)}</div>
              </div>
              <div class="payment-row total-row">
                <div>Status:</div>
                <div>${currentPayment.status.charAt(0).toUpperCase() + currentPayment.status.slice(1)}</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for your payment!</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Write receipt content to the new window
    printWindow.document.open();
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    
    // Print the receipt after it loads
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  return (
    <div className="payment-container-spm">
      <div className="title-container-spm">
        <h1 className="title-spm">PAYMENT MANAGEMENT</h1>
        <div className="total-income-container-spm">
          <span className="total-income-label-spm">Total Income:</span>
          <span className="total-income-value-spm">{formatCurrency(totalIncome)}</span>
        </div>
      </div>
      
      <div className="payment-actions-spm">
        <div className="search-bar-spm">
          <input 
            type="text" 
            placeholder="Search by name or receipt number" 
            value={searchTerm} 
            onChange={handleSearchChange}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-spm" />
        </div>

        <div className="filter-add-container-spm">
          <select 
            className="filter-select-spm"
            value={sacramentFilter}
            onChange={handleSacramentFilterChange}
          >
            <option value="">All Sacraments</option>
            <option value="Baptism">Baptism</option>
            <option value="First Communion">First Communion</option>
            <option value="Confirmation">Confirmation</option>
            <option value="Wedding">Wedding</option>
            <option value="Funeral">Funeral</option>
            <option value="Mass Intention">Mass Intention</option>
          </select>

          <select 
            className="filter-select-spm"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <button className="add-btn-spm" onClick={() => toggleModal()}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <table className="payment-table-spm">
        <thead>
          <tr>
            <th>Receipt #</th>
            <th>Name</th>
            <th>Sacrament</th>
            <th>Total Amount</th>
            <th>Amount Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.length > 0 ? (
            filteredPayments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.receiptNumber}</td>
                <td>{`${payment.firstName} ${payment.lastName}`}</td>
                <td>{payment.sacramentType}</td>
                <td>{formatCurrency(payment.totalAmount)}</td>
                <td>{formatCurrency(payment.amountPaid)}</td>
                <td>{formatCurrency(payment.balance)}</td>
                <td>
                  <span className={`status-badge-spm ${getStatusClass(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </td>
                <td>{formatDateTime(payment.createdAt)}</td>
                <td>
                  <button className="spm-details" onClick={() => toggleModal(payment)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="no-results-spm">No payments found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Payment Modal */}
      {showModal && (
        <div className="payment-modal-overlay-spm">
          <div className="payment-modal-spm">
            <div className="payment-modal-header-spm">
              <h2>{isEditing ? 'Edit Payment' : 'Add New Payment'}</h2>
              <button className="close-modal-btn-spm" onClick={() => toggleModal()}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div>
              <hr className="custom-hr-spm"/>
            </div>
            <form onSubmit={handleSubmit} className="payment-form-spm">
              {isEditing && (
                <div className="form-row-spm">
                  <div className="form-group-spm">
                    <label>Receipt Number</label>
                    <input 
                      type="text" 
                      name="receiptNumber"
                      defaultValue={currentPayment?.receiptNumber || ''}
                      readOnly
                    />
                  </div>
                  <div className="form-group-spm">
                    <label>Created At</label>
                    <input 
                      type="text" 
                      defaultValue={currentPayment ? formatDateTime(currentPayment.createdAt) : ''}
                      readOnly
                    />
                  </div>
                </div>
              )}

              <div className="form-row-spm">
                <div className="form-group-spm">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    required 
                    defaultValue={currentPayment?.firstName || ''}
                  />
                </div>
                <div className="form-group-spm">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    required 
                    defaultValue={currentPayment?.lastName || ''}
                  />
                </div>
              </div>

              <div className="form-row-spm">
                <div className="form-group-spm">
                  <label>Sacrament Type</label>
                  <select 
                    name="sacramentType" 
                    required 
                    defaultValue={currentPayment?.sacramentType || ''}
                  >
                    <option value="">Select Sacrament</option>
                    <option value="Baptism">Baptism</option>
                    <option value="First Communion">First Communion</option>
                    <option value="Confirmation">Confirmation</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Funeral">Funeral</option>
                    <option value="Mass Intention">Mass Intention</option>
                  </select>
                </div>
              </div>

              <div className="form-row-spm">
                <div className="form-group-spm">
                  <label>Total Amount (₱)</label>
                  <input 
                    type="number" 
                    name="totalAmount" 
                    required 
                    step="0.01"
                    min="0"
                    defaultValue={currentPayment?.totalAmount || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group-spm">
                  <label>Amount Paid (₱)</label>
                  <input 
                    type="number" 
                    name="amountPaid" 
                    required 
                    step="0.01"
                    min="0"
                    defaultValue={currentPayment?.amountPaid || ''}
                    onChange={handleInputChange}
                  />
                </div>
                {isEditing && (
                  <div className="form-group-spm">
                    <label>Balance (₱)</label>
                    <input 
                      type="number" 
                      defaultValue={currentPayment?.balance || ''}
                      readOnly
                    />
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="form-row-spm">
                  <div className="form-group-spm">
                    <label>Status</label>
                    <input 
                      type="text" 
                      defaultValue={currentPayment?.status.charAt(0).toUpperCase() + currentPayment?.status.slice(1) || ''}
                      readOnly
                    />
                  </div>
                </div>
              )}

              <div className="form-row-spm">
                <div className="form-group-spm">
                  <label>Change Amount (₱)</label>
                  <input 
                    type="number" 
                    name="changeAmount" 
                    step="0.01"
                    min="0"
                    readOnly
                    value={calculateChange()}
                  />
                </div>
              </div>

              <div className="form-actions-spm">
                <button type="submit" className="submit-btn-spm">
                  {isEditing ? 'Update' : 'Save'}
                </button>
                <button type="button" className="cancel-btn-spm" onClick={() => toggleModal()}>
                  Cancel
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className="print-btn-spm" 
                    onClick={printReceipt}
                  >
                    <FontAwesomeIcon icon={faReceipt} /> Print Receipt
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryPayment;