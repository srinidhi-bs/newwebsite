function toggleMenu() {
    var menu = document.getElementById('nav-menu');
    if (menu.classList.contains('showing')) {
      menu.classList.remove('showing');
    } else {
      menu.classList.add('showing');
    }
  }
  
function calculateHRA() {
  const basicSalary = document.getElementById('basic-salary').value;
  const hraReceived = document.getElementById('hra-received').value;
  const rentPaid = document.getElementById('rent-paid').value;
  const cityType = document.querySelector('input[name="city-type"]:checked').value;

  if (!basicSalary || !hraReceived || !rentPaid || !cityType) {
    alert('Please fill in all fields.');
    return;
  }

  const basicSalaryNum = parseFloat(basicSalary);
  const hraReceivedNum = parseFloat(hraReceived);
  const rentPaidNum = parseFloat(rentPaid);

  const hraExempted = calculateHRAExemption(basicSalaryNum, hraReceivedNum, rentPaidNum, cityType);

  const hraResultDiv = document.getElementById('hra-result');
  hraResultDiv.innerHTML = `
    <h3>The least of the below three is exempt from HRA</h3>
    <table>
      <tr>
        <td>${cityType === 'metro' ? '50%' : '40%'} of Basic Salary</td>
        <td>&#8377; ${(basicSalaryNum * (cityType === 'metro' ? 0.5 : 0.4)).toFixed(2)}</td>
      </tr>
      <tr>
        <td>HRA received</td>
        <td>&#8377; ${hraReceivedNum.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Excess of Rent paid over 10% of salary</td>
        <td>&#8377; ${(rentPaidNum - 0.1 * basicSalaryNum).toFixed(2)}</td>
      </tr>
      <tr class="highlight-green-text">
        <td>HRA Exempted</td>
        <td>&#8377; ${hraExempted.toFixed(2)}</td>
      </tr>
      <tr class="highlight-red-text">
        <td>HRA chargeable to tax</td>
        <td>&#8377; ${(hraReceivedNum - hraExempted).toFixed(2)}</td>
      </tr>
    </table>
  `;
}

function calculateHRAExemption(basicSalary, hraReceived, rentPaid, cityType) {
  const percentOfSalary = cityType === 'metro' ? 0.5 : 0.4;
  const option1 = basicSalary * percentOfSalary;
  const option2 = hraReceived;
  const option3 = rentPaid - 0.1 * basicSalary;

  return Math.min(option1, option2, option3);
}