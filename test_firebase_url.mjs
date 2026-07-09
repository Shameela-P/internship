import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

try {
  const app = initializeApp({ databaseURL: '"https://internship-7f490-default-rtdb.firebaseio.com"' }, "quotes");
  console.log("Success with quotes");
  getDatabase(app);
} catch (e) {
  console.error("Failed with quotes:", e.message);
}

try {
  const app2 = initializeApp({ databaseURL: 'undefined' }, "undefined_string");
  console.log("Success with undefined_string");
  getDatabase(app2);
} catch (e) {
  console.error("Failed with undefined string:", e.message);
}
