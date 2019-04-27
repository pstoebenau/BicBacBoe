﻿var answer = document.getElementById('answerTxt');

function numPress(num){
  if(answer.textContent === "Infinity" || answer.textContent === "NaN"){
    answer.textContent = num;
  }else {
    answer.textContent += num;
  }
  localStorage.setItem("num1", answer.textContent)
}

function operation(operand){
  var answerTxt = answer.textContent;
  var num2;
  if(answerTxt.indexOf(operand) !== -1){
    num2 = answerTxt.substring(answerTxt.indexOf(operand)+1, answerTxt.length);
  }
  localStorage.setItem("num2", num2);

  if(answer.textContent === "" || !answer.textContent){
    localStorage.setItem("num1", "0");
    localStorage.setItem("operand", operand);
    answer.textContent += 0 + operand;
  }else if(localStorage.getItem("operand") && !localStorage.getItem("num2")){
    localStorage.setItem("operand", operand);
    answer.textContent = answer.textContent.substring(0, answer.textContent.length-1) + operand;
  }else if(localStorage.getItem("num2")){
    calculate();
    localStorage.setItem("operand", operand);
    answer.textContent += operand;
  }else{
    localStorage.setItem("operand", operand);
    answer.textContent += operand;
  }
}

function calculate(){

  var num1 = parseFloat(localStorage.getItem("num1"));
  var operand = localStorage.getItem("operand");
  var answerTxt = answer.textContent;
  var num2;
  if(answerTxt.indexOf(operand) !== -1){
    num2 = answerTxt.substring(answerTxt.indexOf(operand)+1, answerTxt.length);
  }
  num2 = parseFloat(num2);
  localStorage.setItem("num2", num2);

  if(num2 !== null || num2 !== ""){
    if(operand === "÷"){
      console.log(num1);
      answer.textContent = (num1/num2);
    }else if(operand === "×"){
      answer.textContent = (num1*num2);
    }else if(operand === "-"){
      answer.textContent = (num1-num2);
    }else if(operand === "+"){
      answer.textContent = (num1+num2);
    }
  }

  if(answer.textContent === "69"){
    alert("Haha! Ur mum Gai! Lol!");
  }
  else if(answer.textContent === "420"){
    alert();
  }

  if(answer.textContent.indexOf(".") !== -1)
    answer.textContent = answer.textContent.substring(0, answer.textContent.indexOf(".")+6);

  localStorage.removeItem("num1");
  localStorage.removeItem("operand");
  localStorage.removeItem("num2");
}

function clearCalc(){
  localStorage.removeItem("num1");
  localStorage.removeItem("operand");
  localStorage.removeItem("num2");
  answer.textContent = "";
}
