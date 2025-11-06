// Mock Firebase Realtime Database

class MockFirebaseDB {
  constructor() {
    this.data = {};
    this.loadFromStorage();
  }

  loadFromStorage() {
    const saved = localStorage.getItem('recurringHub_db');
    if (saved) {
      this.data = JSON.parse(saved);
    }
  }

  saveToStorage() {
    localStorage.setItem('recurringHub_db', JSON.stringify(this.data));
  }

  set(path, value) {
    this.data[path] = value;
    this.saveToStorage();
    return Promise.resolve(true);
  }

  get(path) {
    return Promise.resolve(this.data[path]);
  }

  remove(path) {
    delete this.data[path];
    this.saveToStorage();
    return Promise.resolve(true);
  }

  getAll() {
    return Promise.resolve(this.data);
  }

  clear() {
    this.data = {};
    this.saveToStorage();
  }
}

export default new MockFirebaseDB();
