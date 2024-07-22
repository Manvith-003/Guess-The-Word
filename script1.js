// Get DOM elements
var question = document.getElementById("question");
var btnshow = document.getElementById("btnshow");
var input=document.getElementById("text");
var answer=document.getElementById("answer");
var btncheck=document.getElementById("btncheck");


function shuffleLetters(word) {

    // Split the word into an array of characters
    let letters = word.split('');
    
    // Fisher-Yates shuffle algorithm
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    // Join the shuffled array back into a string
    let shuffled = letters.join('');
    return shuffled;
   
}

// Event listener for the btnshow button
// btnshow.addEventListener('click', function() {
//     // Get the current value of the input element
//     let inputValue = input.value;
    
//     // Call shuffleLetters function with the input value
//     shuffleLetters(inputValue);
// });

let arr=["apple", "banana", "orange", "grape", "pineapple"];
let point=0;
let random;
function shuffledWord(){
    const randomIndex = Math.floor(Math.random() * arr.length);
    random= arr[randomIndex];

 let s=shuffleLetters(random);
 question.innerText = s;
 input.value="";
 btncheck.disabled = false;
 answer.style.visibility='hidden';
}


function checkcorrect(){
   var ans=input.value;
   if (ans==random){
   
    // answer.style.visibility='visible';
    // answer.innerText="correct";
    alert('correct');
    shuffledWord()
    point=point+1;
    // score.innerText="SCORE"+point;
    document.getElementById("point").innerText="SCORE"+point;

   }
   else{
    // alert('incorrect');
    answer.style.visibility='visible';  
    answer.innerText="Incorrect";
   }
}

function show(){
    answer.style.visibility='visible';
    answer.innerText=random;
    btncheck.disabled = true;

}