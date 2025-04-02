<template>
  <header>
    <h1>Tickets Inventory</h1>
  </header>
  <div>
    <table>
      <thead>
        <tr>
          <th>Disp#</th>
          <th>Game Pack#</th>
          <th>End</th>
          <th>Beg</th>
          <th>Total Sold</th>
          <th>Ticket Price</th>
          <th>Total Dollars</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td><input v-model.number="row.disp" @focus="selectAllText" /></td>
          <td>
            <input v-model.number="row.gamePack" @focus="selectAllText" />
          </td>
          <td><input v-model.number="row.end" @focus="selectAllText" /></td>
          <td><input v-model.number="row.beg" @focus="selectAllText" /></td>
          <td class="total">{{ row.end - row.beg }}</td>
          <td>
            <input v-model.number="row.ticketPrice" @focus="selectAllText" />
          </td>
          <td class="total">
            ${{ ((row.end - row.beg) * row.ticketPrice).toFixed(2) }}
          </td>
          <td>
            <div class="action-buttons">
              <button @click="updateRowData(index)">Update</button>
              <button @click="deleteRowData(index)">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="action-more-buttons">
      <div class="save-to-file">
        <button @click="saveDataToFile">Save to File</button>
      </div>

      <div>
        <input type="file" @change="loadDataFromFile" accept=".sqlite" />
      </div>

      <div class="reset-all">
        <button @click="resetAllRows">Reset All</button>
      </div>
      <div class="total">Total: {{ total }}</div>
    </div>

    <fieldset class="add-ticket">
      <legend>Add New Ticket</legend>
      <div class="form-row">
        <label>
          Disp#:
          <input
            v-model.number="newRow.disp"
            type="number"
            @focus="selectAllText"
          />
        </label>
        <label>
          Game Pack#:
          <input
            v-model.number="newRow.gamePack"
            type="number"
            @focus="selectAllText"
          />
        </label>
        <label>
          End#:
          <input
            v-model.number="newRow.end"
            type="number"
            @focus="selectAllText"
          />
        </label>
        <label>
          Beg#:
          <input
            v-model.number="newRow.beg"
            type="number"
            @focus="selectAllText"
          />
        </label>
        <label>
          Ticket Price:
          <input
            v-model.number="newRow.ticketPrice"
            type="number"
            @focus="selectAllText"
          />
        </label>
        <button @click="addRowData">Add Ticket</button>
      </div>
    </fieldset>
  </div>
</template>

<script setup>
import { useInventoryStore } from "@/stores/inventoryStore";
import { loadFromFile, saveToFile } from "@/utils/db.js";
import { storeToRefs } from "pinia";
import { ref, onMounted, computed } from "vue";

const store = useInventoryStore();
const { rows } = storeToRefs(store);
const {
  addRow,
  updateRow,
  deleteRow,
  resetAllRows,
  saveToIndexedDBStore,
  loadFromIndexedDBStore,
} = store;

onMounted(async () => {
  try {
    await store.initialize();
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
});
const newRow = ref({
  disp: 0,
  gamePack: 0,
  end: 0,
  beg: 0,
  ticketPrice: 0,
});

const resetNewRow = () => {
  newRow.value = {
    disp: 0,
    gamePack: 0,
    end: 0,
    beg: 0,
    ticketPrice: 0,
  };
};

const addRowData = () => {
  if (
    !newRow.value ||
    Object.values(newRow.value).some((val) => val === undefined)
  ) {
    console.error("Invalid data, ensure all fields are filled.");
    return;
  }
  addRow({ ...newRow.value });
  resetNewRow();
};

const updateRowData = (index) => {
  updateRow(index, rows.value[index]);
};

const deleteRowData = (index) => {
  deleteRow(index);
};

const saveDataToFile = () => saveToFile();

const loadDataFromFile = (event) => {
  try {
    loadFromFile(event, (loadedRows) => {
      store.rows = loadedRows;
    });
  } catch (error) {
    console.error("Failed to load data from file:", error);
  }
};

const selectAllText = (event) => {
  event.target.select();
};

const total = computed(() => {
  const allTotal = rows.value
    .reduce((sum, row) => {
      return sum + (row.end - row.beg) * row.ticketPrice;
    }, 0)
    .toFixed(2);
  return `$${allTotal}`;
});
</script>

<style scoped>
/* General input styling */

header {
  font-weight: bold;
  color: rgb(102, 102, 230);
  text-align: center;
  margin-bottom: 10px;
  background-color: lightgrey;
}

input[type="number"],
input[type="text"] {
  width: 100%;
  border: 1px solid #ccc;
  text-align: center;
  padding: 5px;
  font-size: 1rem;
}

/* Auto-select text when editing */
input:focus {
  outline: 2px solid #4caf50;
  background-color: #fff;
}

input:focus::selection {
  background: #4caf50;
  color: white;
}

/* Table styles */
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

/* Ensure "Game Pack#" column has enough space */
/* th:nth-child(2),
td:nth-child(2) {
  min-width: 120px;
  max-width: 150px;
  white-space: nowrap;
} */

.total {
  font-weight: bold;
  color: #388e3c;
}
/* Buttons */
.action-buttons {
  display: flex;
  gap: 5px;
  justify-content: center;
}

button {
  padding: 6px 10px;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 4px;

  transition: background 0.2s ease-in-out;
}

button:first-child {
  background-color: #e6c017; /* Green for Update */
  color: white;
}

button:first-child:hover {
  background-color: #388e3c;
}

button:last-child {
  background-color: #ff5722; /* Red for Delete */
  color: white;
}

button:last-child:hover {
  background-color: #e64a19;
}

/* Responsive "Add New Ticket" Section */
.add-ticket {
  background: #eef2ff;
  border: 2px solid #4a90e2;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

/* Wrap form items for small screens */
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  font-weight: bold;
  color: #555;
}

button.reset-all {
  background-color: #ff9800; /* Orange */
  color: white;
  font-weight: bold;
}

button.reset-all:hover {
  background-color: #f57c00;
}

.action-more-buttons {
  display: flex;
  gap: 15px;
  background-color: lightgray;
}

/* Make form elements wrap on small screens */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  table {
    font-size: 0.9rem; /* Slightly smaller text */
  }

  th,
  td {
    padding: 6px;
  }

  button {
    font-size: 0.85rem;
    padding: 5px 8px;
  }
}
</style>
