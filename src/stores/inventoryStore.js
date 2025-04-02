import {
  initDB,
  loadData,
  saveData,
  saveToIndexedDB,
  loadFromIndexedDB,
} from "@/utils/db";
import { defineStore } from "pinia";
import { ref } from "vue";

const STORAGE_KEY = "inventory_data";

export const useInventoryStore = defineStore("inventory", () => {
  const rows = ref([]);

  // Save data to localStorage
  const saveToIndexedDBStore = async () => {
    try {
      await saveToIndexedDB();
      console.log("Data saved to IndexedDB");
    } catch (error) {
      console.error("Error saving data to IndexedDB", error);
    }
  };

  //load from local storage
  const loadFromIndexedDBStore = async () => {
    try {
      await loadFromIndexedDB();
      rows.value = loadData();
      console.log("Data loaded from IndexedDB.");
    } catch (error) {
      console.error("Error loading data from IndexedDB:", error);
    }
  };

  const initialize = async () => {
    try {
      await initDB();
      await loadFromIndexedDBStore();

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

    saveData(rows.value);
  };

  //update
  const updateRow = (index, updatedRow) => {
    rows.value[index] = updatedRow;

    saveData(rows.value);
  };

  //delete
  const deleteRow = (index) => {
    rows.value.splice(index, 1);

    saveData(rows.value);
  };

  const resetAllRows = () => {
    rows.value.forEach((row) => {
      row.end = 0;
      row.beg = 0;
    });

    saveData(rows.value);
  };

  return {
    rows,
    saveToIndexedDBStore,
    loadFromIndexedDBStore,
    initialize,
    addRow,
    updateRow,
    deleteRow,
    resetAllRows,
  };
});
