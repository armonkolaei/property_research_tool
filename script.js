function formatCurrency(value) {
    return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateTotals() {
    const rows = document.querySelectorAll('#asset-table-body tr');
    let totalCurrentValue = 0;
    let totalLoanAmount = 0;

    rows.forEach(row => {
        const currentValue = parseFloat(row.children[1].textContent.replace(/[^0-9.-]+/g, '')) || 0;
        const loanAmount = parseFloat(row.children[2].textContent.replace(/[^0-9.-]+/g, '')) || 0;

        totalCurrentValue += currentValue;
        totalLoanAmount += loanAmount;
    });

    document.getElementById('total-current-value').textContent = formatCurrency(totalCurrentValue);
    document.getElementById('total-loan-amount').textContent = formatCurrency(totalLoanAmount);

    const borrowingPercentage = parseFloat(document.getElementById('borrowing-percentage').value) || 0;
    const potentialBorrowingPower = (totalCurrentValue * (borrowingPercentage / 100)) - totalLoanAmount;

    document.getElementById('potential-borrowing-power').textContent = formatCurrency(potentialBorrowingPower);
}

document.getElementById('add-asset').addEventListener('click', function() {
    const assetName = document.getElementById('asset-name').value;
    const currentValue = document.getElementById('current-value').value;
    const loanAmount = document.getElementById('loan-amount').value;

    if (assetName && currentValue && loanAmount) {
        const tableBody = document.getElementById('asset-table-body');
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${assetName}</td>
            <td>${formatCurrency(currentValue)}</td>
            <td>${formatCurrency(loanAmount)}</td>
            <td><button class="delete-btn">🗑️</button></td>
        `;

        tableBody.appendChild(row);

        // Add event listener to the delete button
        row.querySelector('.delete-btn').addEventListener('click', function() {
            tableBody.removeChild(row);
            updateTotals();
        });

        // Clear input fields
        document.getElementById('asset-name').value = '';
        document.getElementById('current-value').value = '';
        document.getElementById('loan-amount').value = '';

        updateTotals();
    } else {
        alert('Please fill out all fields.');
    }
});

document.getElementById('borrowing-percentage').addEventListener('input', updateTotals);

document.addEventListener('DOMContentLoaded', function () {
    // Get form elements
    const propertyPriceInput = document.getElementById('property-price');
    const propertyTaxInput = document.getElementById('property-tax');
    const renovationCostInput = document.getElementById('renovation-cost');
    const maintenanceCostInput = document.getElementById('maintenance-cost');
    const condoFeeInput = document.getElementById('condo-fee');
    const otherCostsInput = document.getElementById('other-costs');
    const suggestedRentSpan = document.getElementById('suggested-rent');

    // New elements for loan calculation
    const amortizationPeriodInput = document.createElement('input');
    amortizationPeriodInput.type = 'number';
    amortizationPeriodInput.id = 'amortization-period';
    amortizationPeriodInput.value = 30;
    amortizationPeriodInput.min = 5;
    amortizationPeriodInput.max = 35;
    amortizationPeriodInput.placeholder = 'Amortization Period (Years)';

    const interestRateInput = document.createElement('input');
    interestRateInput.type = 'number';
    interestRateInput.id = 'interest-rate';
    interestRateInput.value = 4.75; // Default interest rate
    interestRateInput.placeholder = 'Interest Rate (%)';

    const paymentFrequencySelect = document.createElement('select');
    paymentFrequencySelect.id = 'payment-frequency';
    ['Monthly', 'Biweekly', 'Biweekly Accelerated', 'Weekly'].forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.toLowerCase();
        opt.textContent = option;
        paymentFrequencySelect.appendChild(opt);
    });

    const loanDetailsContainer = document.createElement('div');
    loanDetailsContainer.id = 'loan-details';
    loanDetailsContainer.innerHTML = '<h3>Loan Details</h3>';
    loanDetailsContainer.appendChild(amortizationPeriodInput);
    loanDetailsContainer.appendChild(interestRateInput);
    loanDetailsContainer.appendChild(paymentFrequencySelect);
    document.querySelector('.property-form-container').appendChild(loanDetailsContainer);

    const loanAmountSpan = document.createElement('span');
    loanAmountSpan.id = 'loan-amount';
    loanDetailsContainer.appendChild(loanAmountSpan);

    // Function to calculate loan payment
    function calculateLoanPayment(principal, annualRate, years, frequency) {
        const rate = annualRate / 100 / (frequency === 'monthly' ? 12 : frequency === 'biweekly' ? 26 : 52);
        const n = years * (frequency === 'monthly' ? 12 : frequency === 'biweekly' ? 26 : 52);
        return (principal * rate) / (1 - Math.pow(1 + rate, -n));
    }

    // Function to calculate suggested rent
    function calculateSuggestedRent() {
        const propertyPrice = parseFloat(propertyPriceInput.value) || 0;
        const propertyTax = parseFloat(propertyTaxInput.value) || 0;
        const renovationCost = parseFloat(renovationCostInput.value) || 0;
        const maintenanceCost = parseFloat(maintenanceCostInput.value) || 0;
        const condoFee = parseFloat(condoFeeInput.value) || 0;
        const otherCosts = parseFloat(otherCostsInput.value) || 0;
    
        const amortizationPeriod = parseInt(amortizationPeriodInput.value) || 30;
        const interestRate = parseFloat(interestRateInput.value) || 4.75;
        const paymentFrequency = paymentFrequencySelect.value || 'monthly';
    
        const totalLoanAmountElement = document.getElementById('total-loan-amount');
        const totalLoanAmount = parseFloat(totalLoanAmountElement.textContent.replace(/[^0-9.-]+/g, '')) || 0;
    
        const borrowingPower = parseFloat(document.getElementById('potential-borrowing-power').textContent.replace(/[^0-9.-]+/g, '')) || 0;
    
        let additionalFundsNeeded = 0;
        if (borrowingPower < propertyPrice) {
            additionalFundsNeeded = propertyPrice - borrowingPower;
        }
    
        const newTotalLoan = borrowingPower + totalLoanAmount;
        const monthlyPayment = calculateLoanPayment(newTotalLoan, interestRate, amortizationPeriod, 'monthly');
    
        // Calculate total monthly costs
        const totalMonthlyCosts = maintenanceCost + condoFee + (propertyTax / 12) + (renovationCost / 12) + otherCosts + monthlyPayment;
    
        // Suggested rent with 10% profit margin
        const suggestedRent = totalMonthlyCosts * 1.1;
    
        // Update the suggested rent display
        suggestedRentSpan.textContent = suggestedRent.toFixed(2);
    
        // Update loan details
        loanAmountSpan.textContent = additionalFundsNeeded > 0
            ? `You need an additional $${additionalFundsNeeded.toFixed(2)} to cover the remaining cost.\nPotential Borrowing Power: $${borrowingPower.toFixed(2)}\nRemaining Loan: $${totalLoanAmount.toFixed(2)}\nTotal Loan Amount (including refinancing): $${newTotalLoan.toFixed(2)}\nMonthly Payment: $${monthlyPayment.toFixed(2)}\nRental income should break you even.`
            : `Loan Amount: $${propertyPrice.toFixed(2)} | Payment: $${monthlyPayment.toFixed(2)} per month.\nRental income should break you even.`;
    }    

    // Add event listeners to form inputs to calculate rent in real-time
    [propertyPriceInput, propertyTaxInput, renovationCostInput, maintenanceCostInput, condoFeeInput, otherCostsInput, amortizationPeriodInput, interestRateInput, paymentFrequencySelect].forEach(input => {
        input.addEventListener('input', calculateSuggestedRent);
    });
});