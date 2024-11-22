// HRA Calculator Functions
export const calculateHRAExemption = (basicSalary, hraReceived, rentPaid, cityType) => {
    const percentOfSalary = cityType === 'metro' ? 0.5 : 0.4;
    const option1 = basicSalary * percentOfSalary;
    const option2 = hraReceived;
    const option3 = rentPaid - 0.1 * basicSalary;
    return Math.max(0, Math.min(option1, option2, option3));
  };
  
  // EMI Calculator Functions
  export const calculateEMI = (principal, ratePerYear, timeInYears) => {
    const ratePerMonth = ratePerYear / (12 * 100);
    const numberOfPayments = timeInYears * 12;
    
    const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, numberOfPayments)) / 
                (Math.pow(1 + ratePerMonth, numberOfPayments) - 1);
    
    return {
      emi,
      totalAmount: emi * numberOfPayments,
      totalInterest: (emi * numberOfPayments) - principal
    };
  };
  
  // Format currency values
  export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Format percentage
  export const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };
  
  // Validate number input
  export const validateNumberInput = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  };
  
  // Format number with commas (Indian format)
  export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };