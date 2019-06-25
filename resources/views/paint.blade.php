<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Document</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/jquery-3.4.1.min.js"></script>
    <!--<link rel="stylesheet" href="./public/css/fontawesome.min.css" type='text/css'>-->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous">
</head>

<body>
   <div class="container"><button id="save"><i class="fas fa-save"></i></button></div>
    <canvas id="draw" width="800px" height="800px">
    </canvas>
    <div id="command-bar">
        <input type="color" class="command-item" id="colorPicker">
        <div class="command-item" id="command-size">
            <div>
                <span id="command-size-content">Kích cỡ: 1</span>
                <input type="range" id="size" min="1" max="15" value="1">
            </div>
        </div>
        <button class="command-item" id="line"><i class="fas fa-slash"></i></button>
        <button class="command-item" id="pencil"><i class="fas fa-pen"></i></button>
        <button class="command-item" id="rectangle"><i class="far fa-square"></i></button>
        <button class="command-item" id="circle"><i class="far fa-circle"></i></button>
        <button class="command-item" id="fill"><i class="fas fa-fill-drip"></i></button>
    </div>
    <footer class="pt-3 pb-3 mt-5 text-center table-dark">Nguyen Thanh Tuan</footer>
    <div class="load-screen"></div>
    <script src="js/draw.js"></script>
</body>

</html>