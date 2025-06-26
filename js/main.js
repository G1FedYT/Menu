import { fetchDishesList } from "./getDataStore.js";

const userLanguage = document.documentElement.lang;
const mainLanguage = "ru";
const basketButtonOpen = document.querySelector('.basket');
const basketButtonClose = document.querySelector('.basket-clouse');
const basketBox = document.querySelector('.basket-box');
const basketTotalCostSpan = document.querySelector('#totalCost');
const orderSendButton = document.querySelector('#sendOrder');
const valutaSymbol = "₽";
const wrapper = document.querySelector(".wrapper")

let tableNumber = ""
let activeCategory = ""

let menuStore;
let basketListStore = [];
let orderListStore = [];

fetchDishesList()
    .then(data => {
        menuStore = data;
        RenderCategoryButton();
        RenderMenu(menuStore[0][`${userLanguage}Category`]);
        activeCategory = menuStore[0][`${userLanguage}Category`];
    })

function RenderCategoryButton() {
    const categoryListDiv = document.querySelector('#dishesCategoryList');
    categoryListDiv.innerHTML = '';

    const addedCategorys = new Set();

    menuStore.forEach(item => {
        if (!addedCategorys.has(item[`${userLanguage}Category`])) {
            const categoryButton = document.createElement("button");
            categoryButton.innerText = item[`${userLanguage}Category`];
            categoryButton.addEventListener('click', () => {
                RenderMenu(item[`${userLanguage}Category`]);
                categoryListDiv.querySelector('.button_active').classList.remove('button_active');
                categoryButton.classList.add('button_active');
                activeCategory = item[`${userLanguage}Category`]
            });
            categoryListDiv.appendChild(categoryButton);
            addedCategorys.add(item[`${userLanguage}Category`]);
        }
    });
    categoryListDiv.querySelector('button').classList.add('button_active');
}

function RenderMenu(category) {
    const dishesListDiv = document.querySelector(".dishes-list");
    dishesListDiv.innerHTML = "";

    menuStore.forEach(menuItem => {
        if (menuItem[`${userLanguage}Category`] == category) {
            const cardDiv = document.createElement("div");
            cardDiv.className = "dishes-card";
            cardDiv.dataset.id = menuItem.id;
            cardDiv.innerHTML = `
            <img src="${menuItem.image}" alt="">
            <div class="dishes-card__info">
                <div class="dishes-card__description">
                    <h2>${menuItem[`${userLanguage}Name`]}</h2>
                    <p class="dishes-card__description-text">${menuItem[`${userLanguage}Description`]}</p>
                </div>
            </div>
            `;

            const portionsContainerDiv = document.createElement("div")
            portionsContainerDiv.className = "dishes-card__portions";

            const portionNames = [menuItem.portionName1, menuItem.portionName2, menuItem.portionName3, menuItem.portionName4, menuItem.portionName5]
            const dishesCardInfoDiv = cardDiv.querySelector(".dishes-card__info")

            portionNames.forEach((portionName, index) => {
                if (portionName) {
                    const portionCost = menuItem[`portionCost${index + 1}`];
                    const portionItemDiv = document.createElement("div");
                    const portionId = `${menuItem.id}-${portionCost}`;
                    
                    let amountPortions = 0;

                    const portionInBasket = basketListStore.find(basketCard => basketCard.portionId == portionId);
                    if (portionInBasket){
                        amountPortions = portionInBasket.currentAmount;
                        cardDiv.classList.add("dishes-card_active")
                    }

                    portionItemDiv.dataset.id = portionId;
                    portionItemDiv.className = "portion-item";
                    portionItemDiv.innerHTML = `
                    <p class="portion-item__text">
                        <span class="portion-name">${portionName}</span>
                        <span class="portion-cost">${portionCost}${valutaSymbol}</span>
                    </p>
                    <div class="portion-item__buttons">
                        <button class="portion-minus">-</button>
                        <span class="portion-number">${amountPortions}</span>
                        <button class="portion-plus">+</button>
                    </div>
                    `
                    const buttonMinus = portionItemDiv.querySelector('.portion-minus');
                    const buttonPlus = portionItemDiv.querySelector('.portion-plus');
                    const spanNumber = portionItemDiv.querySelector('.portion-number');

                    buttonMinus.addEventListener('click', () => {
                        busketUpdate(
                            "minus",
                            "menu",
                            `${menuItem[`${userLanguage}Name`]}`,
                            `${menuItem[`${mainLanguage}Name`]}`,
                            portionName,
                            portionCost,
                            `${menuItem[`${mainLanguage}Category`]}`,
                            menuItem.id,
                            portionId,
                            menuItem.image,
                            spanNumber
                        )
                    })
                    buttonPlus.addEventListener('click', () => {
                        busketUpdate(
                            "plus",
                            "menu",
                            `${menuItem[`${userLanguage}Name`]}`,
                            `${menuItem[`${mainLanguage}Name`]}`,
                            portionName,
                            portionCost,
                            `${menuItem[`${mainLanguage}Category`]}`,
                            menuItem.id,
                            portionId,
                            menuItem.image,
                            spanNumber
                        )
                    })
                    portionsContainerDiv.appendChild(portionItemDiv);
                }
            })

            dishesCardInfoDiv.appendChild(portionsContainerDiv);

            dishesListDiv.appendChild(cardDiv);
        }
    });
}

function busketUpdate(
    action,
    buttonType,
    userLanguageName,
    mainLanguageName,
    portionName,
    portionCost,
    category,
    menuItemId,
    portionId,
    menuItemImage,
    spanNumber
) {
    const cardDivInMenu = document.querySelector("#dishesList").querySelector(`[data-id="${menuItemId}"]`);
    if (action == "plus") {
        if (cardDivInMenu) {
            cardDivInMenu.classList.add("dishes-card_active");
        }
        const currentAmount = parseInt(spanNumber.innerText) + 1;
        spanNumber.innerText = currentAmount;
        const cardInBasket = basketListStore.find(basketItem => basketItem.portionId == portionId);
        orderSendButton.classList.remove("_display_none")
        if(buttonType == "basket"){
            if (cardDivInMenu) {
                const portionNumberSpan = cardDivInMenu.querySelector(`[data-id="${portionId}"]`).querySelector(".portion-number");
                portionNumberSpan.innerText = currentAmount;
            }
        }

        if (cardInBasket) {
            cardInBasket.currentAmount = currentAmount;
        }
        else {
            const cardPortionInfo = {
                userLanguageName,
                mainLanguageName,
                portionName,
                portionCost,
                category,
                menuItemId,
                portionId,
                menuItemImage,
                currentAmount
            };
            basketListStore.unshift(cardPortionInfo);
        }
        basketRender()
    }
    else {
        if (parseInt(spanNumber.innerText) > 0) {
            const currentAmount = parseInt(spanNumber.innerText) - 1;
            spanNumber.innerText = currentAmount;

            if(buttonType == "basket"){
                if (cardDivInMenu) {
                    const portionNumberSpan = cardDivInMenu.querySelector(`[data-id="${portionId}"]`).querySelector(".portion-number");
                    portionNumberSpan.innerText = currentAmount;
                }
            }

            if (currentAmount == 0) {
                basketListStore = basketListStore.filter(basketItem => basketItem.portionId != portionId);
                if (!basketListStore.find(basketItem => basketItem.userLanguageName == userLanguageName)) {
                    if (cardDivInMenu) {
                        cardDivInMenu.classList.remove("dishes-card_active");
                    }
                }
                if (basketListStore.length == 0){
                    orderSendButton.classList.add("_display_none")
                }
            }
            else {
                const cardInBasket = basketListStore.find(basketItem => basketItem.portionId == portionId);
                if (cardInBasket) {
                    cardInBasket.currentAmount = currentAmount
                }
            }


        }
        basketRender()
    }
    console.log(basketListStore)
}

function basketRender() {
    const basketCardListDiv = document.querySelector("#basketList");
    let basketTotalCost = 0
    basketCardListDiv.innerHTML = "";
    basketListStore.forEach(basketListItem => {
        const basketCardDiv = document.createElement("div");
        basketCardDiv.dataset.id = basketListItem.portionId;
        basketCardDiv.classList.add("basket-item")
        basketCardDiv.innerHTML = `
        <div class="basket-item__img">
          <img src="${basketListItem.menuItemImage}" alt="">
          <div class="basket-item__manage">
            <div class="basket-item__buttons">
              <button class="portion-minus"><i class="fa-solid fa-minus"></i></button>
              <span class="portion-number">${basketListItem.currentAmount}</span>
              <button class="portion-plus"><i class="fa-solid fa-plus"></i></button>
            </div>
            <p class="basket-item__total-cost">${basketListItem.portionCost * basketListItem.currentAmount}${valutaSymbol}</p>
          </div>
        </div>
        <div class="basket-item__info">
          <h3>${basketListItem.userLanguageName}</h3>
          <h4>${basketListItem.mainLanguageName}</h4>
          <p><span class="portion-name">${basketListItem.portionName} - </span><span> <span class="portion-cost">${basketListItem.portionCost}${valutaSymbol}</span></span></p>
          
        </div>
        `
        const buttonPlus = basketCardDiv.querySelector(".portion-plus")
        const buttonMinus = basketCardDiv.querySelector(".portion-minus")

        buttonPlus.addEventListener("click", () =>{
            busketUpdate(
                "plus",
                "basket",
                basketListItem.userLanguageName,
                basketListItem.mainLanguage,
                basketListItem.portionName,
                basketListItem.portionCost,
                basketListItem.category,
                basketListItem.menuItemId,
                basketListItem.portionId,
                basketListItem.image,
                basketCardDiv.querySelector(".portion-number"))
        })

        buttonMinus.addEventListener("click", () =>{
            busketUpdate(
                "minus",
                "basket",
                basketListItem.userLanguageName,
                basketListItem.mainLanguage,
                basketListItem.portionName,
                basketListItem.portionCost,
                basketListItem.category,
                basketListItem.menuItemId,
                basketListItem.portionId,
                basketListItem.image,
                basketCardDiv.querySelector(".portion-number"))
        })

        basketTotalCost += basketListItem.portionCost * basketListItem.currentAmount
        basketCardListDiv.appendChild(basketCardDiv)
    })
    basketTotalCostSpan.innerHTML = `Общая стоимость блюд в корзине: ${basketTotalCost}${valutaSymbol}`
}

function createOrderId() {
    const now = new Date();
    
    // Получаем компоненты даты и времени
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Формируем ID в нужном формате
    const orderId = `${day}_${month}_${year}__${hours}_${minutes}_${seconds}`;
    
    return orderId;
}

function createMessage() {
    let orderListMessage = ``;
    let orderItemNumber = 0;

    const orderId = createOrderId()

    let totalCost = 0

    basketListStore.forEach(basketCard => {
        orderItemNumber++;
        orderListMessage += `
${orderItemNumber}) ${basketCard.mainLanguageName} (${basketCard.category})
    ${basketCard.portionName} x ${basketCard.currentAmount} = ${parseInt(basketCard.portionCost) * parseInt(basketCard.currentAmount)}${valutaSymbol}
    ${basketCard.userLanguageName}

        `
        totalCost += parseInt(basketCard.portionCost) * parseInt(basketCard.currentAmount);
    })

    let textMessage = `
Новый заказ!
Язык посетителя - ${userLanguage}
Номер стола - ${tableNumber}
Номер заказа - #N${orderId}

Список блюд:
${orderListMessage}

Общая стоимость блюд: ${totalCost}${valutaSymbol}
    `;


sendMessageToTG(textMessage)
}
function sendMessageToTG(messageText) {
    console.log("Пытаемся отправить сообщение в Telegram...");

    setTimeout(() => {
        fetch('https://send-message-to-tg.gosha4ka4.workers.dev', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatId: "-1002466562204",
                messageText: messageText,
            }),
        })
            .then(res => res.json())
            .then(data => {
                console.log("Успешно отправлено:", data);
                orderSendButton.classList.add("_display_none")
                basketListStore.forEach(item => {
                    orderListStore.unshift(item);
                });
                basketListStore = [];
                basketRender();
                if (activeCategory){
                    RenderMenu(activeCategory)
                }  
            })
            .catch(error => {
                console.error("Ошибка при отправке:", error);
            });
    }, 1000);
}

function createDialogueBox(type, text){
    const dialogueBoxDiv = document.querySelector(".dialogBox");
    dialogueBoxDiv.innerHTML = ``
    switch (type) {
        case "Request table number":{
            dialogueBoxDiv.innerHTML = `
                <p>${text}</p>
                <input type="number" placeholder="№" min="1">
                <div class="dialogBox__buttons">
                    <button class="ok-button">Ок</button>
                    <button class="cancel-button">Отмена</button>
                </div>
            `;
            const cancel = dialogueBoxDiv.querySelector(".cancel-button")
            cancel.addEventListener("click", ()=>{
                wrapper.classList.remove("wrapper_active")
            })

            const ok = dialogueBoxDiv.querySelector(".ok-button")
            const input = dialogueBoxDiv.querySelector("input")
            ok.addEventListener("click", ()=>{
                const tableNum = input.valueAsNumber
                if (!isNaN(tableNum)){
                    wrapper.classList.remove("wrapper_active")
                    tableNumber = tableNum
                    createMessage()
                }
                else{
                    dialogueBoxDiv.querySelector("p").innerText = "Введите числовое значение!"
                }
               
            })
            wrapper.classList.add("wrapper_active")
            break;
        }
    
        default:
            break;
    }
}

orderSendButton.addEventListener('click', () =>{
    if (Number.isFinite(tableNumber)){
        createMessage()
    }
    else{
        createDialogueBox("Request table number", "Введите номер стола")
    }
})

basketButtonOpen.addEventListener('click', () => {
    basketButtonClose.classList.toggle('basket-clouse_active');
    basketButtonOpen.classList.toggle('button_moveLeft');
    basketBox.classList.toggle('basket-box_open');
})

basketButtonClose.addEventListener('click', () => {
    basketButtonClose.classList.remove('basket-clouse_active');
    basketButtonOpen.classList.remove('button_moveLeft');
    basketBox.classList.remove('basket-box_open');
})