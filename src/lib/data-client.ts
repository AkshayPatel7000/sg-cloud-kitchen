
import { collection, getDocs, doc, getDoc, query, where, orderBy, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase/firestore';
import type { Category, Dish, Restaurant, SectionItem, SectionType } from './types';

// TODO: Add error handling for all data fetching and mutation functions.

export async function getRestaurant(): Promise<Restaurant> {
  const docRef = doc(db, 'restaurant', 'details');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as Restaurant;
  } else {
     return {
        name: 'Gastronomic Gateway',
        logoUrl: '/default-logo.png',
        tagline: 'A delightful culinary experience.',
        address: '123 Epicurean Ave, Flavor Town, 12345',
        phone: '555-123-4567',
        email: 'contact@gastronomicgateway.com',
        openingHours: 'Mon-Sat: 11am - 10pm, Sun: 12pm - 9pm',
        socialLinks: { facebook: '#', instagram: '#', twitter: '#' },
    };
  }
}

export async function updateRestaurant(data: Restaurant): Promise<void> {
    const docRef = doc(db, 'restaurant', 'details');
    await setDoc(docRef, data, { merge: true });
}


export async function getAllSectionItems(): Promise<SectionItem[]> {
  const querySnapshot = await getDocs(collection(db, 'sectionItems'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SectionItem));
}

export async function addSectionItem(item: Omit<SectionItem, 'id'>): Promise<SectionItem> {
    const docRef = await addDoc(collection(db, 'sectionItems'), item);
    return { id: docRef.id, ...item };
}

export async function updateSectionItem(id: string, data: Partial<SectionItem>): Promise<void> {
    const docRef = doc(db, 'sectionItems', id);
    await updateDoc(docRef, data);
}

export async function deleteSectionItem(id: string): Promise<void> {
    await deleteDoc(doc(db, 'sectionItems', id));
}


export async function getAllCategories(): Promise<Category[]> {
  const querySnapshot = await getDocs(collection(db, 'categories'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const docRef = await addDoc(collection(db, 'categories'), category);
    return { id: docRef.id, ...category };
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, data);
}

export async function deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, 'categories', id));
}


export async function getDishes(): Promise<Dish[]> {
  const querySnapshot = await getDocs(collection(db, 'dishes'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dish));
}

export async function addDish(dish: Omit<Dish, 'id'>): Promise<Dish> {
    const docRef = await addDoc(collection(db, 'dishes'), dish);
    return { id: docRef.id, ...dish };
}

export async function updateDish(id: string, data: Partial<Dish>): Promise<void> {
    const docRef = doc(db, 'dishes', id);
    await updateDoc(docRef, data);
}

export async function deleteDish(id: string): Promise<void> {
    await deleteDoc(doc(db, 'dishes', id));
}
