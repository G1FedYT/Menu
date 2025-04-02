import { fetchDishesList } from "./getDataStore.js";

const userLanguage = document.documentElement.lang;
const mainLanguage = "ru";
const basketButtonOpen = document.querySelector('.basket');
const basketButtonClose = document.querySelector('.basket-clouse');
const basketBox = document.querySelector('.basket-box');
const basketTotalCostSpan = document.querySelector('#totalCost');
const valutaSymbol = "₽";

let menuStore;
let basketListStore = [];

fetchDishesList()
    .then(data => {
        menuStore = data;
        RenderCategoryButton()
        RenderMenu(menuStore[0][`${userLanguage}Category`])
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
            }
            else {
                const cardInBasket = basketListStore.find(basketItem => basketItem.portionId == portionId);
                if (cardInBasket) {
                    cardInBasket.currentAmount = currentAmount;
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