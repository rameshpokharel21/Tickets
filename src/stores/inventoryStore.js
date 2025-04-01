import { initDB, loadData, saveData } from "@/utils/db";
import { defineStore } from "pinia";
import { ref } from "vue";

const STORAGE_KEY = "inventory_data";

export const useInventoryStore = defineStore("inventory", () => {
  const rows = ref([]);

  // Save data to localStorage
  const saveToLocalStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  //load from local storage
  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      rows.value = JSON.parse(savedData);
    }
    return [];
  };

  const initialize = async () => {
    try {
      await initDB();
      loadFromLocalStorage();

      if (rows.value.length === 0) {
        rows.value = loadData();
      }
    } catch (error) {
      console.error("Error initialization from local storage", error);
    }
  };
  //add row
  const addRow = (row) => {
    rows.value.push(row);
    //saveData([row]);
    saveToLocalStorage(rows.value);
  };

  //update
  const updateRow = (index, updatedRow) => {
    rows.value[index] = updatedRow;
    //saveData(rows.value);
    saveToLocalStorage(rows.value);
  };

  //delete
  const deleteRow = (index) => {
    rows.value.splice(index, 1);
    //saveData(rows.value);
    saveToLocalStorage(rows.value);
  };

  const resetAllRows = () => {
    rows.value.forEach((row) => {
      row.end = 0;
      row.beg = 0;
    });

    saveToLocalStorage(rows.value);
  };

  return {
    rows,
    saveToLocalStorage,
    loadFromLocalStorage,
    initialize,
    addRow,
    updateRow,
    deleteRow,
    resetAllRows,
  };
});
