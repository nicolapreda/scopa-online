var canvas;
var ctx;

var sourceImage = new Image();
sourceImage.src = './assets/cards.png';
var retroImage = new Image();
retroImage.src = './assets/retro.png';

var id = localStorage.getItem('id');

var turn = 0;
var joined = false;
var isHosting = false;
var playeralert = document.getElementById('playeralert');

var carte = [];
var carteTavolo = [];
var auth = 'Basic ' + btoa('4ID:Grena');
var lastCardPlayed;

var score1 = 0;
var score2 = 0;



if (localStorage.getItem('name').startsWith("scopa1") || localStorage.getItem('name').startsWith("scopa0")) {
    //è l'host
    isHosting = true;

    checkPlayerJoin();

    function checkPlayerJoin() {
        //attendi una mossa che manderà il giocatore che si è unito
        fetch(` https://classe5ID.altervista.org/games/mossa/${id}/`, {
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
                    setTimeout(function () { checkPlayerJoin() }, 1000);
                }
                else {
                    playeralert.classList.add('hidden');
                    console.log("Un giocatore è entrato in partita");
                    alert("Un giocatore è entrato in partita");
                    joined = true;


                    fetch(`https://classe5ID.altervista.org/games/mosse/${id}`, {
                        method: 'GET',
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8',
                            'Authorization': auth
                        },

                    }).then((response) => response.json())
                        .then((json) => {
                            console.log(json);
                            //fai un foreach per ogni mossa e controlla se sono già stati definiti turni e carte
                            json.data.moves.forEach(element => {
                                if (element.MOSSA.startsWith("turn_")) {
                                    //riempi la variabile turn con il turno
                                    turn = element.MOSSA.split("_");
                                    turn.shift();
                                    console.log(turn);
                                    document.getElementById('turnNumber').innerHTML = turn;


                                }
                                if (element.MOSSA.startsWith("carteTavolo_")) {
                                    //riempi la variabile cartetavolo con le carte del tavolo e trasformandole in int
                                    carteTavolo = element.MOSSA.split("_");
                                    carteTavolo.shift();
                                    carteTavolo.forEach(element => {
                                        element = parseInt(element);
                                    }
                                    );
                                    console.log(carteTavolo);

                                }
                            });





                            //controlla se carteTavolo è vuoto
                            if (carteTavolo.length == 0) {
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

                                //manda al server le carte del tavolo
                                fetch(`https://classe5ID.altervista.org/games/mossa/${id}/${localStorage.getItem('name')}/carteTavolo_${carteTavolo[0]}_${carteTavolo[1]}_${carteTavolo[2]}_${carteTavolo[3]}`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-type': 'application/json; charset=UTF-8',
                                        'Authorization': 'Basic ' + btoa('4ID:Grena')
                                    },
                                }).then((response) => response.json())


                            }

                            //controlla se turn è ancora 0
                            if (turn == 0) {
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

                                //inserisci il turno nell'html
                                document.getElementById('turnNumber').innerHTML = turn;
                            }

                            for (var i = 0; i < 4; i++) {
                                var canvas = document.getElementById('canvas' + i);
                                ctx = canvas.getContext('2d');
                                canvas.width = 94;
                                canvas.height = 167;

                                ctx.scale(0.3, 0.3);
                                var cardType = carteTavolo[i].toString().charAt(0);
                                var cardNumber = carteTavolo[i].toString().charAt(1);

                                //disegna il mazzo considerando che la carta è 312x560, e la canvas 94x167. prendi da "carteTavolo" le informazioni: il primo numero riguarda la riga della carta, il secondo la colonna. 
                                ctx.drawImage(sourceImage, cardNumber * 309, cardType * 560, 312, 560, 0, 0, 312, 560);


                            }
                        });


                }

            });

    }

}
else {
    //controlla se è già stata inviata la mossa "joined"
    fetch(`https://classe5ID.altervista.org/games/mosse/${id}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': 'Basic ' + btoa('4ID:Grena'),
        },

    }).then((response) => response.json())
        .then((json) => {
            console.log(json);
            //fai un foreach per ogni mossa e controlla se è già stata inviata la mossa "joined". altrimenti, inviala
            json.data.moves.forEach(element => {
                if (element.MOSSA.startsWith("joined")) {
                    joined = true;
                }
            });
            if (joined == false) {



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
        });


    waitCards();
    function waitCards() {
        //attendi la mossa che inizia con "carteTavolo_" e riempi carteTavolo con le carte del tavolox
        fetch(`https://classe5ID.altervista.org/games/mosse/${id}`, {
            method: 'GET',

            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': auth
            },

        }).then((response) => response.json())
            .then((json) => {
                console.log(json);
                //fai un foreach per ogni mossa e controlla se sono già stati definiti turni e carte
                json.data.moves.forEach(element => {
                    if (element.MOSSA.startsWith("turn_")) {
                        //riempi la variabile turn con il turno
                        turn = element.MOSSA.split("_");
                        turn.shift();
                        console.log(turn);

                    }

                    if (element.MOSSA.startsWith("carteTavolo_")) {
                        //riempi la variabile cartetavolo con le carte del tavolo
                        carteTavolo = element.MOSSA.split("_");
                        carteTavolo.shift();
                        //trasforma le carte in int
                        carteTavolo.forEach(element => {
                            element = parseInt(element);
                        });

                        console.log(carteTavolo);
                    }



                });
                //se turno è 0 oppure se carteTavolo è vuoto
                if (turn == 0 || carteTavolo.length == 0) {
                    setTimeout(function () { waitCards() }, 1000);
                }

                for (var i = 0; i < 4; i++) {
                    var canvas = document.getElementById('canvas' + i);
                    ctx = canvas.getContext('2d');
                    canvas.width = 94;
                    canvas.height = 167;

                    ctx.scale(0.3, 0.3);
                    var cardType = carteTavolo[i].toString().charAt(0);
                    var cardNumber = carteTavolo[i].toString().charAt(1);

                    //disegna il mazzo considerando che la carta è 312x560, e la canvas 94x167. prendi da "carteTavolo" le informazioni: il primo numero riguarda la riga della carta, il secondo la colonna. 
                    ctx.drawImage(sourceImage, cardNumber * 309, cardType * 560, 312, 560, 0, 0, 312, 560);


                }
                if (turn != 2)
                    waitForEnemy();
            });
    }



}


sourceImage.onload = function () {
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

        var canvas = document.getElementById('ally' + i);
        ctx = canvas.getContext('2d');
        canvas.width = 94;
        canvas.height = 167;

        ctx.scale(0.3, 0.3);
        var cardType = carte[i].toString().charAt(0);
        var cardNumber = carte[i].toString().charAt(1);

        //disegna il mazzo considerando che la carta è 312x560, e la canvas 94x167. prendi da "carteTavolo" le informazioni: il primo numero riguarda la riga della carta, il secondo la colonna. 
        ctx.drawImage(sourceImage, cardNumber * 309, cardType * 560, 312, 560, 0, 0, 312, 560);

    }



}

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

function clickCard(cardId) {

    //se è il turno del giocatore
    if (turn == 1 && isHosting == true || turn == 2 && isHosting == false) {

        //togli la canvas dal mazzo alleato e portala al tavolo, aggiorna anche le variabili carte e carteTavolo
        var canvas = document.getElementById('ally' + cardId);


        var card = `                    <div class="col-span-1">
    <canvas id="canvas${carteTavolo.length + 1}" class="rounded-xl cursor-pointer hover:scale-110 transition  shadow-xl"></canvas>
</div>
`;


        var centralDeck = document.getElementById('centralDeck');
        centralDeck.className = `grid grid-cols-${carteTavolo.length + 1} place-items-center my-32 md:gap-16 gap-4`;
        centralDeck.insertAdjacentHTML('beforeend', card);

        //imposta alla nuova carta la stessa foto della carta cliccata
        var canvas2 = document.getElementById('canvas' + (carteTavolo.length + 1));
        ctx2 = canvas2.getContext('2d');
        canvas2.width = 94;
        canvas2.height = 167;
        ctx2.scale(0.3, 0.3);
        var cardType = carte[cardId].toString().charAt(0);
        var cardNumber = carte[cardId].toString().charAt(1);
        ctx2.drawImage(sourceImage, cardNumber * 309, cardType * 560, 312, 560, 0, 0, 312, 560);


        carteTavolo.push(carte[cardId]);
        carte.splice(cardId, 1);
        canvas.remove();

        var allyDeck = document.getElementById('allyDeck');

        //se carte.length è minore di 3
        if (carte.length > 3)
            allyDeck.className = `grid grid-cols-${carte.length - 1} place-items-center`;



        //manda al server la carta cliccata
        fetch(`https://classe5ID.altervista.org/games/mossa/${id}/${localStorage.getItem('name')}/card_${carteTavolo[carteTavolo.length - 1]}`, {
            method: 'POST',

            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': auth

            },

        }).then((response) => response.json())
            .then((json) => {
                console.log(json);
            });


        //se il turno è uguale a 2, imposta a 1, altrimenti imposta a 2
        if (turn == 2)
            turn = 1;
        else
            turn = 2;

        document.getElementById('turnNumber').innerHTML = turn;
        //aggiorna la variabile lastCardPlayed
        lastCardPlayed = carteTavolo[carteTavolo.length - 1];


        //attendi la risposta dell'avversario
        waitForEnemy();

    }
    else {
        alert("Non è il tuo turno!");
    }
}


function waitForEnemy() {

    fetch(`https://classe5ID.altervista.org/games/mossa/${id}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'Authorization': 'Basic ' + btoa('4ID:Grena')
        }
    }).then((response) => response.json())
        .then((json) => {
            console.log(json);
            //se il mazzo centrale è stato modificato
            if (json.data.play.MOSSA != "card_" + lastCardPlayed) {
                //aggiorna la variabile lastCardPlayed
                lastCardPlayed = json.data.play.MOSSA;
                //aggiungi la carta al tavolo
                var canvas = document.getElementById('enemy2');
                var card = `
    <canvas id="canvas${carteTavolo.length + 1}" class="rounded-xl cursor-pointer hover:scale-110 transition  shadow-xl"></canvas>

`;

                var centralDeck = document.getElementById('centralDeck');
                centralDeck.className = `grid grid-cols-${carteTavolo.length + 1} place-items-center my-32 md:gap-16 gap-4`;
                centralDeck.insertAdjacentHTML('beforeend', card);

                //imposta alla nuova carta la stessa foto della carta cliccata
                var canvas2 = document.getElementById('canvas' + (carteTavolo.length + 1));
                ctx2 = canvas2.getContext('2d');
                canvas2.width = 94;
                canvas2.height = 167;
                ctx2.scale(0.3, 0.3);
                json.data.play.MOSSA = json.data.play.MOSSA.substring(5);


                var cardType = json.data.play.MOSSA.toString().charAt(0);
                var cardNumber = json.data.play.MOSSA.toString().charAt(1);
                ctx2.drawImage(sourceImage, cardNumber * 309, cardType * 560, 312, 560, 0, 0, 312, 560);

            }
        });



}



//controlla se centralDeck è stato modificato con un evento
centralDeck.addEventListener('DOMSubtreeModified', function () {
    checkScopa();
});


//crea la funzione checkScopa che controlla se c'è una scopa
function checkScopa() {
    //se il numero di carte sul tavolo è uguale a 4
    if (carteTavolo.length == 4) {
        //se la somma delle carte è uguale a 10
        if (carteTavolo[0] + carteTavolo[1] + carteTavolo[2] + carteTavolo[3] == 10) {
            //se è il turno del giocatore
            if (turn == 1) {
                //aggiungi 1 al punteggio del giocatore
                score1++;
                //aggiorna il punteggio
                document.getElementById('score1').innerHTML = score1;
                //togli le carte dal tavolo
                for (var i = 0; i < carteTavolo.length; i++) {
                    var canvas = document.getElementById('canvas' + (i + 1));
                    canvas.remove();
                }
                //svuota l'array delle carte sul tavolo
                carteTavolo = [];
                //cambia il turno
                turn = 2;
            }
            else {
                //aggiungi 1 al punteggio del giocatore
                score2++;
                //aggiorna il punteggio
                document.getElementById('score2').innerHTML = score2;
                //togli le carte dal tavolo
                for (var i = 0; i < carteTavolo.length; i++) {
                    var canvas = document.getElementById('canvas' + (i + 1));
                    canvas.remove();
                }
                //svuota l'array delle carte sul tavolo
                carteTavolo = [];
                //cambia il turno
                turn = 1;
            }
        }
    }
}




//controlla la vittoria
function checkWin() {
    //se il numero di carte nel mazzo è uguale a 0
    if (carte.length == 0) {
        //se il punteggio del giocatore 1 è maggiore del punteggio del giocatore 2
        if (score1 > score2) {
            //mostra il vincitore
            alert("Ha vinto il giocatore 1!");
        }
        //se il punteggio del giocatore 2 è maggiore del punteggio del giocatore 1
        else if (score1 < score2) {
            //mostra il vincitore
            alert("Ha vinto il giocatore 2!");
        }
        //se il punteggio del giocatore 1 è uguale al punteggio del giocatore 2
        else {
            //mostra il pareggio
            alert("Pareggio!");
        }
    }
}