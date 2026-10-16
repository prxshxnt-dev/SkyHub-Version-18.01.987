import { doc, setDoc } from "firebase/firestore";
import { initializeFirebase } from "../init";

export const setGlobalTheme = async (themeInfo: any) => {
  try {
    const { firestore } = initializeFirebase();
    const themeRef = doc(firestore, "settings", "globalTheme");
    await setDoc(themeRef, { currentTheme: themeInfo }, { merge: true });
    console.log("Global theme updated.");
  } catch (error) {
    console.error("Error setting global theme:", error);
    throw error;
  }
};
