import { useInventoryStore } from "@/stores/inventoryStore";
import initSqlJs from "sql.js";
import localforage from "localforage";

let db;
let SQL;
export const initDB = async () => {
  if (!SQL) {
    SQL = await initSqlJs({
      //locateFile: (file) => `https://sql.js.org/dist/${file}`,

      locateFile: (file) => `./sql-wasm.wasm`,
    });
  }

  console.log("SQL.js initialized successfully:", SQL);

  console.log(localforage);
  const savedDB = await localforage.getItem("sqlite_db");

  if (savedDB) {
    db = new SQL.Database(new Uint8Array(savedDB));
    console.log("database loaded from IndexedDB.");
  } else {
    db = new SQL.Database();
    db.run(
      `CREATE TABLE IF NOT EXISTS scratchoff (id INTEGER PRIMARY KEY, disp INTEGER, gamePack INTEGER, end INTEGER, beg INTEGER, ticketPrice REAL)`
    );
    console.log("New in-memory database initialized.");
  }
};

export const saveToIndexedDB = async () => {
  if (!db) {
    console.error("Database not initialized. call initDB() first.");
    await initDB();
  }

  const data = db.export();
  try {
    await localforage.setItem("sqlite_db", data);
    console.log("Database saved to IndexedDB.");
  } catch (error) {
    console.error("Error saving database to IndexedDB", error);
  }
};

export const loadFromIndexedDB = async () => {
  try {
    const data = await localforage.getItem("sqlite_db");
    if (data) {
      db = new SQL.Database(new Uint8Array(data));
      console.log("Database loaded from IndexedDB");
    } else {
      console.log("No saved database found in IndexedDB.");
    }
  } catch (error) {
    console.error("Error loading database form IndexedDB.", error);
  }
};

export const saveData = async (data) => {
  if (!db) {
    console.error("Database not initialized. call initDB() first.");
    return;
  }

  try {
    db.run("BEGIN TRANSACTION;");
    //clear
    db.run("DELETE FROM scratchoff");

    const stmt = db.prepare(
      `INSERT INTO scratchoff (disp, gamePack, end, beg, ticketPrice) VALUES(?, ?, ?, ?, ?)`
    );
    data.forEach((row) => {
      stmt.run([row.disp, row.gamePack, row.end, row.beg, row.ticketPrice]);
    });
    stmt.free();
    db.run("COMMIT;");
    await saveToIndexedDB();
  } catch (error) {
    console.error("Error saving data:", error);
    db.run("ROLLBACK;");
  }
};

export const loadData = () => {
  if (!db) {
    throw new Error("database not initialized. call initDB() first");
  }
  const stmt = db.prepare(`SELECT * FROM scratchoff`);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }

  //free statemnt to avoid memory leaks
  stmt.free();
  return rows;
};

export const saveToFile = async () => {
  if (!db) {
    await initDB();
  }

  const store = useInventoryStore();
  saveData(store.rows);
  //clearDatabase();
  console.log("Saving to file. Checking database content...");
  const storedData = loadData();

  if (storedData.length === 0) {
    alert("No data to save!");
    return;
  }
  try {
    console.log(loadData());
    const data = db.export();
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${new Date().toISOString().split("T")[0]}.sqlite`;

    a.click();

    URL.revokeObjectURL(url);

    await window.electronAPI.saveFile(data);
  } catch (error) {
    console.error("Failed to save file: ", error);
  }
};

//load database from a file

export const loadFromFile = async (event, callback) => {
  const store = useInventoryStore();
  if (!db) {
    throw new Error("Database not initialized call initDB");
  }

  const file = event.target.files[0];

  if (!file) {
    alert("No file selected");
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    const data = new Uint8Array(reader.result);
    db = new SQL.Database(data); //recreate the DB from file
    const loadedData = loadData();
    store.$patch({ rows: [...loadedData] });

    await store.saveToIndexedDBStore();
    if (callback) {
      callback(loadedData);
    }
  };
  reader.readAsArrayBuffer(file);
};

export const clearDatabase = () => {
  if (!db) {
    console.error("Database not initialized. Call initDB() first.");
    return;
  }

  try {
    db.run("DELETE FROM scratchoff"); // This will delete all records from the table
  } catch (error) {
    console.error("Error clearing the database:", error);
  }
};
