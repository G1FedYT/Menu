export async  function fetchDishesList() {
    const sheetId = "1FY6cX7UMeviQ_pYhp-hOZHFUrnsxnbAUkf7wIvLlgv8"; // ID твоей таблицы
    const apiKey = "AIzaSyDhuO1X2wj0uBJXKHuOnnL8ciK8trPndQo"; // Вставь сюда API-ключ
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;
  
    try {
      let response = await fetch(url);
      let data = await response.json();
      
      return processData(data.values); // Конвертируем в удобный формат
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      return [];
    }
  }
  
  
  function processData(data) {
    const keys = data[0];
    const objectsArray = data.slice(1).map(row => {
      let obj = {};
      row.forEach((value, index) => {
        obj[keys[index]] = value;
      });
      return obj;
    });
    return objectsArray;
  }