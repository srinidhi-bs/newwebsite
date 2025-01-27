import { db } from './config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const TASKS_COLLECTION = 'tasks';

// Helper function to get current user
const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      ...taskData,
      createdBy: user.uid,
      clientId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, ...taskData };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Get a single task by ID
export const getTask = async (taskId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const taskDoc = await getDoc(doc(db, TASKS_COLLECTION, taskId));
    if (!taskDoc.exists()) return null;

    const taskData = taskDoc.data();
    // Only return if user is admin or task belongs to user's client
    if (taskData.clientId === user.uid) {
      return { id: taskDoc.id, ...taskData };
    }
    throw new Error('Insufficient permissions to access this task');
  } catch (error) {
    console.error('Error getting task:', error);
    throw error;
  }
};

// Get all tasks
export const getAllTasks = async () => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Query tasks for the current user's client
    const q = query(
      collection(db, TASKS_COLLECTION),
      where('clientId', '==', user.uid),
      orderBy('start', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all tasks:', error);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId, updateData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const taskDoc = await getDoc(doc(db, TASKS_COLLECTION, taskId));
    if (!taskDoc.exists()) throw new Error('Task not found');

    const taskData = taskDoc.data();
    if (taskData.clientId !== user.uid) {
      throw new Error('Insufficient permissions to update this task');
    }

    await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return { id: taskId, ...updateData };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const taskDoc = await getDoc(doc(db, TASKS_COLLECTION, taskId));
    if (!taskDoc.exists()) throw new Error('Task not found');

    const taskData = taskDoc.data();
    if (taskData.clientId !== user.uid) {
      throw new Error('Insufficient permissions to delete this task');
    }

    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Get tasks by date range
export const getTasksByDateRange = async (startDate, endDate) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(db, TASKS_COLLECTION),
      where('clientId', '==', user.uid),
      where('start', '>=', startDate),
      where('start', '<=', endDate),
      orderBy('start', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tasks by date range:', error);
    throw error;
  }
};

// Get tasks by status
export const getTasksByStatus = async (status) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(
      collection(db, TASKS_COLLECTION),
      where('clientId', '==', user.uid),
      where('status', '==', status),
      orderBy('start', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tasks by status:', error);
    throw error;
  }
};
