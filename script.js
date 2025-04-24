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

    // Function to calculate suggested rent
    function calculateSuggestedRent() {
        const propertyPrice = parseFloat(propertyPriceInput.value) || 0;
        const propertyTax = parseFloat(propertyTaxInput.value) || 0;
        const renovationCost = parseFloat(renovationCostInput.value) || 0;
        const maintenanceCost = parseFloat(maintenanceCostInput.value) || 0;
        const condoFee = parseFloat(condoFeeInput.value) || 0;
        const otherCosts = parseFloat(otherCostsInput.value) || 0;

        // Calculate total monthly costs
        const totalMonthlyCosts = maintenanceCost + condoFee + (propertyTax / 12) + (renovationCost / 12) + otherCosts;

        // Suggested rent is 1.2 times the total monthly costs to ensure profitability
        const suggestedRent = totalMonthlyCosts * 1.2;

        // Update the suggested rent display
        suggestedRentSpan.textContent = suggestedRent.toFixed(2);
    }

    // Add event listeners to form inputs to calculate rent in real-time
    propertyPriceInput.addEventListener('input', calculateSuggestedRent);
    propertyTaxInput.addEventListener('input', calculateSuggestedRent);
    renovationCostInput.addEventListener('input', calculateSuggestedRent);
    maintenanceCostInput.addEventListener('input', calculateSuggestedRent);
    condoFeeInput.addEventListener('input', calculateSuggestedRent);
    otherCostsInput.addEventListener('input', calculateSuggestedRent);
});