<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">

</head>
<body onload="shuffledWord()">
    <div class="main">
        <div class="box">
            <div class="container">
                <h3 id="answer"></h3>
                <h3 id="question"></h3>
                <input type="text" id="text">
            </div>
            <div class="containerbtn">
                <button id="btnshow" onclick="show()">SHOW</button>
                <button id="btncheck" onclick="checkcorrect()">CHECK</button>
                <button id="btnnext" onclick="shuffledWord()">NEXT</button>
            </div>
        </div>
    </div>
    <script src="script1.js"></script>
</body>
</html>