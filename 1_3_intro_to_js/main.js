// console.log('hello world');

var i = 1;

var counter = document.getElementById("counter").innerText;

// console.log(counter);

updateCounter = () => {
    message = (i == 1) ? "1 time you've said you love Beeker" : i + " times you've said you love Beeker";
    document.getElementById("counter").innerText = message;
    // console.log(i, counter);
    i++;
  }

window.onclick = updateCounter;