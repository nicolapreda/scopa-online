
var canvas;
var ctx;

var sourceImage = new Image();
sourceImage.src = './assets/cards.png';

var retroImage = new Image();
retroImage.src = './assets/retro.png';

var id = localStorage.getItem('id');

var turn = 1;
var joined = false;
var isHosting = false;
var playeralert = document.getElementById('playeralert');

var carte = [];
var carteTavolo = [];





retroImage.onload = function () {
    var w = 0;
    var h = 0;
    for (var q = 0; q < 3; q++, w += 312, h += 560) {
        canvas = document.getElementById('enemy' + q);
        ctx = canvas.getContext('2d');

        canvas.width = 94;
        canvas.height = 167;

        //disegna la carta senza tagliare pezzi della foto
        ctx.drawImage(retroImage, 0, 0, 643, 1023, 0, 0, 643, 1023);

    }

}





if (localStorage.getItem('name').startsWith("scopa1") || localStorage.getItem('name').startsWith("scopa0")) {
    //è l'host

    //decidi casualmente il turno
    isHosting = true;
    checkPlay();

    function checkPlay() {
        //attendi una mossa che manderà il giocatore che si è unito
        fetch(` https://classe5ID.altervista.org/games/mossa/${id}/turn_${turn}`, {
            method: 'GET',

            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Basic ' + btoa('4ID:Grena')
            },
        }).then((response) => response.json())
            .then((json) => {
                console.log(json)
                if (json.data.play == null) {
                    //inserisci all'interno dell'html un modal che indica che il giocatore deve ancora entrare
                    playeralert.classList.remove('hidden');
                    setTimeout(function () { checkPlay() }, 3000);
                }
                else {
                    playeralert.classList.add('hidden');
                    console.log("Joined!");
                    joined = true;


                    //riempi carteTavolo casualmente con 4 carte
                    for (var i = 0; i < 4; i++) {
                        var val1 = Math.floor(Math.random() * 3) + 1;
                        var val2 = Math.floor(Math.random() * 10) + 1;
                        //unisci(non somma) val1 e val2 in un unica variabile
                        var carta = val1 + "" + val2;
                        //trasforma carta in int
                        carta = parseInt(carta);

                        //inserisci la carta nell'array
                        carteTavolo.push(carta);

                    }
                    var w = 0;
                    var h = 0;

                    for (var i = 0; i < 4; i++, w += 312, h += 560) {
                        canvas = document.getElementById('canvas' + i);
                        ctx = canvas.getContext('2d');
                        canvas.width = 94;
                        canvas.height = 167;

                        ctx.scale(0.3, 0.3);
                        var cardType = carteTavolo[i].toString().charAt(0);
                        var cardNumber = carteTavolo[i].toString().charAt(1);

                        //disegna il mazzo considerando che la carta è 312x560, e la canvas 94x167. prendi da "carteTavolo" le informazioni: il primo numero riguarda la riga della carta, il secondo la colonna. 
                        ctx.drawImage(sourceImage, cardNumber * 312, cardType * 560, 312, 560, 0, 0, 312, 560);


                    }


                    //manda al server le carte del tavolo
                    fetch(`https://classe5ID.altervista.org/games/mossa/${id}/${localStorage.getItem('name')}/carteTavolo_${carteTavolo[0]}_${carteTavolo[1]}_${carteTavolo[2]}_${carteTavolo[3]}`, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8',
                            'Authorization': 'Basic ' + btoa('4ID:Grena')
                        },
                    }).then((response) => response.json())




                    turn = Math.floor(Math.random() * 2) + 1;
                    console.log(turn);

                    //manda al server il turno
                    fetch(`https://classe5ID.altervista.org/games/mossa/${id}/${localStorage.getItem('name')}/turn_${turn}`, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8',
                            'Authorization': 'Basic ' + btoa('4ID:Grena')
                        },
                    }).then((response) => response.json())

                }

            });
    }

}
else {
    fetch(`https://classe5ID.altervista.org/games/mossa/${id}/${localStorage.getItem('name')}/joined`, {
        method: 'POST',

        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': 'Basic ' + btoa('4ID:Grena')
        },

    }).then((response) => response.json())
        .then((json) => {
            console.log(json);
        });





}


//riempi carte con 3 carte casuali
var w = 0;
var h = 0;

for (var i = 0; i < 3; i++) {
    var val1 = Math.floor(Math.random() * 3) + 1;
    var val2 = Math.floor(Math.random() * 10) + 1;
    //unisci(non somma) val1 e val2 in un unica variabile
    var carta = val1 + "" + val2;
    //trasforma carta in int
    carta = parseInt(carta);

    //inserisci la carta nell'array
    carte.push(carta);

    canvas = document.getElementById('ally' + i);
    ctx = canvas.getContext('2d');
    canvas.width = 94;
    canvas.height = 167;

    ctx.scale(0.3, 0.3);
    var cardType = carte[i].toString().charAt(0);
    var cardNumber = carte[i].toString().charAt(1);

    //disegna il mazzo considerando che la carta è 312x560, e la canvas 94x167. prendi da "carteTavolo" le informazioni: il primo numero riguarda la riga della carta, il secondo la colonna. 
    ctx.drawImage(sourceImage, cardNumber * 312, cardType * 560, 312, 560, 0, 0, 312, 560);



}







