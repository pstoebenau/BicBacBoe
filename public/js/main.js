document.getElementById('SSNForm').addEventListener('submit', saveSSN);

function saveSSN(e){

  var ssn = document.getElementById('ssn').value;

  if(!isNaN(ssn) && ssn.length === 9)
    localStorage.setItem('SSN', ssn);
  else{
    alert('Entry must be a number and 9 numbers longs');
  }

  //Prevent form reload
  e.preventDefault();
}
