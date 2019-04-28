document.getElementById('Form').addEventListener('submit', saveNum);

function saveNum(e){

  var num = document.getElementById('num').value;

  if(!isNaN(num) && num.length === 9)
    localStorage.setItem('Num', num);
  else{
    alert('Entry must be a number and 9 numbers longs');
  }

  //Prevent form reload
  e.preventDefault();
}
