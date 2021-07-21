/// <reference path="jquery-3.5.1.js" />

// on load
$(function () {
    displayCoinCards();
    insertSiteRightsContent();
});

function displayHome() {
    // Clear
    $("#myContainer").html("");
    displayCoinCards();
}

function displayLiveReports() {
    // Clear
    $("#myContainer").html("");

    // adds spinner
    $("#myContainer").append(`<div class='spinner-wrapper'><div class="spinner"></div></div>`); 

    // adds chart
    $("#myContainer").append(`<div id="chartContainer" style="height: 300px; width: 100%;"></div>`); 

    // draw Chart
    displayChart();

}

function insertSiteRightsContent() {
    let now = new Date();
    let year = now.getFullYear();
    $("#site-rights-content").append(`This site was developed by Ido. <br>
             data coin info was taken from cryptocompare and coingecko.
             <br><br><br>
             All rights Reserved ${year}&#169;`);
}

function displayAbout() {
    // Clear
    $("#myContainer").html("");
    $("#myContainer").append(`<div id="about-content">
                                   <h2 class="my-center">About</h2>
                                   <h6>About me</h6>
                                   
                                   <p class="about-p">
                                        Hello there i am Ido.
                                        i find programming fascinating, and especially web-developments, this site is one of my first projects. <br><br>
                                   </p>
                                   
                                    <h6>About the site</h6>
                                    <p class="about-p">
                                        The Cryptocurrency Explorer lets you explore the diverse of cryptocurrency coins on the market. <br>

                                        Here you will find thousands of various cryptocurrencies. every coin has its functionality some are unique and some are similar. <br>
                                        You can inspect its info by clicking “More Info” and select up to 5 coins to show its USD Values on the Live Reports section. <br><br>
                                    </p>

                                    <h6>Note</h6>
                                    <p class="my-be-advised-color about-p">
                                        - Be advised that some coins has already disappeared from the world and its info might not be founded.
                                    </p>
                                   
                                  
                              </div>`);
}



async function displayCoinCards() {
    try {
        const arr = await getAllCoins();
        dealWithMainSpinner(); // fade out spinner
        //let limit = 100; 

        
        for (let i = 0; i < arr.length; i++) {
            $("#myContainer").append(`
                 <div class="card" id="${i}" style="width: 23rem;">
            <div class="card-body">
                <h5 class="card-title">${arr[i].symbol}</h5>
                    <div class="toggle-btn position-btn" onclick="activateToggle(this)">
                        <div class="inner-circle"></div>
                    </div>
                <p class="card-text">${arr[i].name}</p>
                <p>
                    <a class="btn btn-primary" data-toggle="collapse" href="#collapse-${i}" role="button" aria-expanded="false"
                        aria-controls="collapseExample" onclick="dealWithMoreInfo(this)">
                        More Info
                    </a>
                </p>
                <div class="collapse" id="collapse-${i}">
                    <div class="card card-body"></div>
                </div>
            </div>
        </div>
                `
            );
        }
        // finds if there is already selected cards on the previous sessions and toggle it.
        autoToggleSelectedCards();


        // clean info from previous sessions
        sessionStorage.removeItem("cardsMoreInfo");

    }
    catch (err) {
        // On Failure
        alert("Oops! Something went wrong! \nTry again later! Status: " + err.status);
    }
}

function dealWithMainSpinner() {
    $('.spinner-wrapper').delay(1000).fadeOut(300);
}

function getAllCoins() {
    return new Promise((resolve, reject) => {
        //const apiUrl = `https://api.coingecko.com/api/v3/coins/list`;
        const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
        $.ajax({
            method: "GET",
            url: apiUrl,
            error: err => reject(err),
            success: arr => {
                resolve(arr);
            }
        });
    });
}

function getMoreInfo(selectedCoin) {
    return new Promise((resolve, reject) => {
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${selectedCoin}`;
        $.ajax({
            method: "GET",
            url: apiUrl,
            error: err => reject(err),
            success: obj => {
                resolve(obj);
            }
        });
    });
}

function openModal() {
    $('#myModal').modal('show');
}


function activateToggle(button) {

    let limit = 5;
    let cards = [];


    let cardParent = button.closest('.card'); // cardParent
    let selectedCardId = button.closest('.card').id;
    let selectedCoin = cardParent.childNodes[1].firstElementChild.innerText; // selectedCoin to send


    let cardsJsonString = localStorage.getItem("cards");
    if (cardsJsonString != null) {
        cards = JSON.parse(cardsJsonString);

        // check if card already selected (compares by id), 
        // if yes get its index, remove from storage, toggle back button
        let i = 0;
        let isCardExist = false;

        for (const card of cards) {
            if (card.cardId == selectedCardId) {
                cards.splice(i, 1); // remove the card

                // toggle back
                button.classList.toggle('active');

                // check
                isCardExist = true;
                break;
            }
            i++;
        }

        // if card still doesnt exist, add.
        if (isCardExist == false) {
            dealWithSelection(button);

        } else {
            // Save the updates back to local storage: 
            cardsJsonString = JSON.stringify(cards);
            localStorage.setItem("cards", cardsJsonString);
        }

        // update length changes (for checking the correct length)
        cardsJsonString = localStorage.getItem("cards");
        cards = JSON.parse(cardsJsonString);

        // if exceeds limit open Modal
        if (cards.length > limit) {
            openModal();
        }

        // if theres no cards, remove key
        if (cards.length == 0) {
            localStorage.removeItem("cards");
        }

    } else {
        // Adds at first time
        dealWithSelection(button);
    }
}


function dealWithSelection(button) {
    let limit = 5;
    let cardParent = button.closest('.card');
    let cardId = button.closest('.card').id;
    let cardToggle = cardParent.childNodes[1].childNodes[3].classList; // button.classList
    let selectedCoin = cardParent.childNodes[1].firstElementChild.innerText; // selectedCoin to send

    let coinSymbol = cardParent.childNodes[1].firstElementChild.innerText;
    let coinName = cardParent.childNodes[1].firstElementChild.nextElementSibling.nextElementSibling.innerText;

    let card = { cardId, coinSymbol, coinName };
    let cards = [];

    let cardsJsonString = localStorage.getItem("cards");
    if (cardsJsonString != null) {
        cards = JSON.parse(cardsJsonString);
    }

    if (cards.length < limit) {
        cards.push(card);

        // Save the new array back to local storage: 
        cardsJsonString = JSON.stringify(cards);
        localStorage.setItem("cards", cardsJsonString);

        // Toggle button - activates toggle by adding the 'active' class
        button.classList.toggle('active');
        return;
    }
    // Only if length is 5, add without toggle (to still show it on the Modal window)
    if (cards.length == limit) {
        cards.push(card);
        // Save the new array back to local storage: 
        cardsJsonString = JSON.stringify(cards);
        localStorage.setItem("cards", cardsJsonString);
    }

}

function myFilter(value) {
    // in case there is no info on the currency inform user
    if (value == "" || value == "null" || value == null) {
        return "No info founded on this currency";
    } else {
        return value;
    }
}

function setTimer(button) {
    let countDownDate = new Date();
    let now = new Date();

    // Sets countdown
    countDownDate.setMinutes(now.getMinutes() + 2);

    let timerId = setInterval(function () {
        let nowMs = new Date().getTime();
        let countDownDateMs = countDownDate.getTime();
        let distance = countDownDateMs - nowMs;

        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance <= 0) {
            let cardId = button.closest('.card').id;

            let cardsMoreInfo = [];

            let cardsMoreInfoJsonString = sessionStorage.getItem("cardsMoreInfo");
            if (cardsMoreInfoJsonString != null) {
                cardsMoreInfo = JSON.parse(cardsMoreInfoJsonString);
            }

            let isCardExist = false;
            let cardIndex = 0;
            let i = 0;

            for (let card of cardsMoreInfo) {
                if (cardId == card.cardId) {
                    isCardExist = true;
                    cardIndex = i;
                    break;
                }
                i++;
            }

            cardsMoreInfo.splice(cardIndex, 1); // remove card
            // Save the new array back to session storage: 
            cardsMoreInfoJsonString = JSON.stringify(cardsMoreInfo);
            sessionStorage.setItem("cardsMoreInfo", cardsMoreInfoJsonString);

            // if theres no cards, remove key
            if (cardsMoreInfo.length == 0) {
                sessionStorage.removeItem("cardsMoreInfo");
            }
            clearInterval(timerId);
        }

    }, 1000, button);

}

function dealWithMoreInfo(button) {
    let cardParent = button.closest('.card');
    let cardId = button.closest('.card').id;
    let cardChildNodes = cardParent.childNodes; // get nodes
    let cardTitle = cardChildNodes[1].firstElementChild; // get card-title
    let selectedCoin = cardTitle.innerText; // selectedCoin to send

    // check collapse state
    let collapse = cardParent.getElementsByClassName("collapse show");
    let isCollapsed = collapse.length ? true : false;

    // if content already shown - close normally
    if (isCollapsed) return;

    // Insert Spinner
    button.parentNode.nextElementSibling.firstElementChild.innerHTML = `<div id="loading"></div>`;


    let cardsMoreInfo = [];

    let cardsMoreInfoJsonString = sessionStorage.getItem("cardsMoreInfo");

    if (cardsMoreInfoJsonString != null) {
        cardsMoreInfo = JSON.parse(cardsMoreInfoJsonString);

        // check if id exists already
        let isCardExist = false;
        let cardIndex = 0;
        let i = 0;

        for (let card of cardsMoreInfo) {
            if (cardId == card.cardId) {
                isCardExist = true;
                cardIndex = i;
                break;
            }
            i++;
        }

        if (isCardExist) {
            // if card exist, display card info from cardsMoreInfo storage
            button.parentNode.nextElementSibling.firstElementChild.innerHTML =
                `USD: ${cardsMoreInfo[cardIndex].usd}&#36;<br>
                 EUR: ${cardsMoreInfo[cardIndex].eur}&#8364;<br>
                 ILS: ${cardsMoreInfo[cardIndex].ils}&#8362;<br>
                 Preview: <img src="${cardsMoreInfo[cardIndex].img}">`;
        } 
        else {
            // else fetch info from api
            displayMoreInfoFromAPI(button);
        }
    } else {
        displayMoreInfoFromAPI(button);
    }

}

async function displayMoreInfoFromAPI(button) {
    let cardParent = button.closest('.card');
    let cardId = button.closest('.card').id;
    let cardChildNodes = cardParent.childNodes; // get nodes
    let cardTitle = cardChildNodes[1].firstElementChild; // get card-title
    let selectedCoin = (cardChildNodes[1].children[2].innerText).toLowerCase(); // Gets the card-text: the inner title
    

    try {
        const obj = await getMoreInfo(selectedCoin);

        let moreInfo = {
            cardId,
            selectedCoin: cardTitle.innerText,
            usd: myFilter(obj.market_data.current_price.usd),
            eur: myFilter(obj.market_data.current_price.eur),
            ils: myFilter(obj.market_data.current_price.ils),
            img: obj.image.thumb
        };

        cardsMoreInfo = [];

        cardsMoreInfoJsonString = sessionStorage.getItem("cardsMoreInfo");

        if (cardsMoreInfoJsonString != null) {
            cardsMoreInfo = JSON.parse(cardsMoreInfoJsonString);
        }

        cardsMoreInfo.push(moreInfo);

        // Save the new array back to session storage: 
        cardsMoreInfoJsonString = JSON.stringify(cardsMoreInfo);
        sessionStorage.setItem("cardsMoreInfo", cardsMoreInfoJsonString);

        // set countdown timer
        setTimer(button);

        button.parentNode.nextElementSibling.firstElementChild.innerHTML =
            `USD: ${myFilter(obj.market_data.current_price.usd)}&#36;<br>
                 EUR: ${myFilter(obj.market_data.current_price.eur)}&#8364;<br>
                 ILS: ${myFilter(obj.market_data.current_price.ils)}&#8362;<br>
                 Preview: <img src="${obj.image.thumb}">`;


    } catch (err) {
        button.parentNode.nextElementSibling.firstElementChild.innerText = "No coin info founded!";
    }
}

function autoToggleSelectedCards() {
    // finds if there is already selected cards on the previous sessions and toggle it.
    let cards = [];

    let cardsJsonString = localStorage.getItem("cards");
    if (cardsJsonString != null) {
        cards = JSON.parse(cardsJsonString);

        for (const card of cards) {
            let cardParent = document.getElementById(card.cardId).closest('.card');

            // Toggle
            cardParent.childNodes[1].childNodes[3].classList.toggle('active');
        }
    }
}

$('#myModal').on('shown.bs.modal', function () {

    // Clear
    $(".myModalTr").empty();
    $(".myModalTbody").empty();

    let cards = [];

    let cardsJsonString = localStorage.getItem("cards");
    if (cardsJsonString != null) {
        cards = JSON.parse(cardsJsonString);
    }

    // Copy cards - for closeModal() action - in case restore needed
    let cardsInModal = [];
    if (cardsJsonString != null) {
        cardsInModal = JSON.parse(cardsJsonString);
        cardsInModalJsonString = JSON.stringify(cards);
        localStorage.setItem("cardsInModal", cardsInModalJsonString);
    }

    // Adds Modal Label
    $("#myModalLabel").append(`Oops! Limit exceeded`);

    // Adds Modal Body
    $("#myModalBody").append(`
        <p>You have a limit of 5 cards! <br> Drop one coin</p>
        <hr />`
    );

    // display selected cards
    for (card of cards) {
        $("#myModalBody").append(`
                  <div class="card" id="${card.cardId}" style="width: 23rem;">
            <div class="card-body">
                <h5 class="card-title">${card.coinSymbol}</h5>
                    <div class="toggle-btn position-btn active" onclick="activateToggle(this)">
                        <div class="inner-circle"></div>
                    </div>
                <p class="card-text">${card.coinName}</p>
                <p>
                    <a class="btn btn-primary" data-toggle="collapse" href="#collapse-${card.cardId}" role="button" aria-expanded="false"
                        aria-controls="collapseExample" onclick="dealWithMoreInfo(this)">
                        More Info
                    </a>
                </p>
                <div class="collapse" id="collapse-${card.cardId}">
                    <div class="card card-body"></div>
                </div>
            </div>
        </div>
                `
        );
    }
})

function isThereCardsChange() {
    // checks if there is a change in the cards in order to apply 'Save Changes' or 'Close' on modal
    let cards = [];
    let cardsInModal = [];

    let cardsJsonString = localStorage.getItem("cards");
    let cardsInModalJsonString = localStorage.getItem("cardsInModal");

    if (cardsJsonString != null || cardsInModalJsonString != null) {
        cards = JSON.parse(cardsJsonString);
        cardsInModal = JSON.parse(cardsInModalJsonString);
    }

    if (cards == null || cards.length <= cardsInModal.length) {
        return true;
    } else {
        return false;
    }



}

function saveChangesInModal() {
    location.reload();
    localStorage.removeItem("cardsInModal");
}

function closeModal() {
    let cardsInModalJsonString = localStorage.getItem("cardsInModal");
    let cardsInModal = JSON.parse(cardsInModalJsonString);

    // if there is a change and user clicked on 'Close', 
    // restore original selected cards by taking the copy (without the changes)
    if (isThereCardsChange()) {
        // Remove the last added change
        if (cardsInModal.length == 6) {
            cardsInModal.pop();
            cardsInModalJsonString = JSON.stringify(cardsInModal);
            localStorage.setItem("cardsInModal", cardsInModalJsonString);
        }
        // Restore
        localStorage.setItem("cards", cardsInModalJsonString);
    }
    localStorage.removeItem("cardsInModal");

    $('#myModal').modal('hide');

}

// Clear modal content after close
$("#myModal").on('hidden.bs.modal', function () {
    $(".modal-title").text("");
    $(".modal-body").html("");
});


function searchCoin() {
    let input, filter;
    input = document.getElementById("coinInput");
    filter = input.value.toUpperCase();

    let myContainer = document.getElementById("myContainer");
    let cards = myContainer.getElementsByClassName("card-title");
    let coinSymbol;

    for (let i = 0; i < cards.length; i++) {
        coinSymbol = cards[i].innerText;

        // Finds only for Exact Match
        if (coinSymbol.toUpperCase() == filter) {
            cards[i].closest('.card').style.display = "";
        } else {
            cards[i].closest('.card').style.display = "none";
        }
    }

}

function showAll() {
    let myContainer = document.getElementById("myContainer");
    let cards = myContainer.getElementsByClassName("card-title");

    for (let i = 0; i < cards.length; i++) {
        cards[i].closest('.card').style.display = "";
    }

    // Clear
    $("#coinInput").val("");

}

// Global
let coinArr = [];
let coinList = [];

function displayChart() {
    dealWithMainSpinner(); // fade out spinner

    // Clear to get updated list every selection
    coinList = [];


    let coinElement;
    // fetch local storage
    let cardId, coinSymbol, coinName
    let card = { cardId, coinSymbol, coinName };
    let cards = [];

    let cardsJsonString = localStorage.getItem("cards");
    if (cardsJsonString != null) {
        cards = JSON.parse(cardsJsonString);
    }

    // Inform user to select cards, and preventing user to see empty chart
    if (cards.length == 0) {
        alert("You have to select cards first");
        location.reload();
    }

    // Setting coinList to the selected list from storage.
    for (let i = 0; i < cards.length; i++) {
        coinList[i] = cards[i].coinSymbol;
    }


    let dataPoints1 = [];
    let dataPoints2 = [];
    let dataPoints3 = [];
    let dataPoints4 = [];
    let dataPoints5 = [];
    
    let dataPoints = [dataPoints1, dataPoints2, dataPoints3, dataPoints4, dataPoints5];

    let data = [];

    // push dataObj - every coin that selected
    for (let i = 0; i < coinList.length; i++) {
        let dataObj = {
            type: "line",
            xValueType: "dateTime",
            yValueFormatString: "$####.00",
            xValueFormatString: "hh:mm:ss TT",
            showInLegend: true,
            name: `${coinList[i]}`,
            dataPoints: dataPoints[i]
        };
        data.push(dataObj)
    }



    let chart = new CanvasJS.Chart("chartContainer", {
        zoomEnabled: true,
        title: {
            text: "Coins Values in USD"
        },
        axisX: {
            title: "Time"
        },
        axisY: {
            prefix: "$",
            title: "USD"
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "top",
            fontSize: 22,
            fontColor: "dimGrey",
            itemclick: toggleDataSeries
        },
        data: data
    });

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }

    let updateInterval = 2000;

    // initial value
    let yValue1; 
    let yValue2; 
    let yValue3; 
    let yValue4; 
    let yValue5;

    let yValues = [yValue1, yValue2, yValue3, yValue4, yValue5];


    let time = new Date;

    async function updateChart(count) {
        await setCoinValues();
        

        count = 1; // draws 1 point in 2 seconds.
        for (let i = 0; i < count; i++) {
            time.setTime(time.getTime() + updateInterval);

            // Copying yValues from retrieved coinArr
            for (let j = 0; j < coinArr.length; j++) {
                if (yValues[j] != null || yValues[j] !== 'undefined') { 
                    yValues[j] = coinArr[j].value;
                } 
            }
            
            // Inserting data - pushing the new values - yValue - USD
            let x, y;
            //let dataPoint = { x, y };
            for (let i = 0; i < data.length; i++) {
                data[i].dataPoints.push({
                    x: time.getTime(), y: yValues[i]
                });
            }
        }
        
        // Clear array
        coinArr = [];
        
        // Sets Legend Text: coin and current value
        for (let i = 0; i < data.length; i++) {
            chart.options.data[i].legendText = ` ${coinList[i]}  $  ${dataFilter(yValues[i])}`;
        }

        chart.render();
    }
    updateChart(100);
    setInterval(function () { updateChart() }, updateInterval);

}

async function setCoinValues() {
    try {
        let coinElement;

        // fetch local storage
        let cardId, coinSymbol, coinName;
        let card = { cardId, coinSymbol, coinName };
        let cards = [];
        let cardsJsonString = localStorage.getItem("cards");
        if (cardsJsonString != null) {
            cards = JSON.parse(cardsJsonString);
        }

        let selectedCoins = "";
        for (let i = 0; i < cards.length; i++) {
            selectedCoins += cards[i].coinSymbol + ",";
        }
        // remove the last remaining "," - to send api
        selectedCoins = selectedCoins.slice(0, -1);

        let coinObj = await getAllCoinsValues(selectedCoins);
        

        let coin, value;

        // traversing into the obj
        for (let key in coinObj) {
            if (!coinObj.hasOwnProperty(key)) continue;
            let obj = coinObj[key];
            for (let prop in obj) {
                if (!obj.hasOwnProperty(prop)) continue;

                // Setting coin values into element
                coin = key;
                value = obj[prop];

                coinElement = { coin, value };
                coinArr.push(coinElement);

            }
        }
    }
    catch (err) {
        // On Failure
        alert("Oops! Something went wrong! \nTry again later! Status: " + err.status);
    }
}

function getAllCoinsValues(selectedCoins) {
    return new Promise((resolve, reject) => {
        const apiUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${selectedCoins}&tsyms=USD`;
        $.ajax({
            method: "GET",
            url: apiUrl,
            error: err => reject(err),
            success: obj => {
                resolve(obj);
            }
        });
    });
}


function dataFilter(value) {
    if (value == null || value === 'undefined') {
        return "No Data";
    } else {
        return value;
    }

}