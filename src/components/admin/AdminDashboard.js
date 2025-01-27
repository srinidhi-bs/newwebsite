import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, auth } from '../../firebase/config';
import { collection, getDocs, getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { deleteUser, getAuth } from 'firebase/auth';
import { EMAIL_CONFIG } from '../../config/appConfig';

const AdminDashboard = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [approvedAccounts, setApprovedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, clientData } = useAuth();

  useEffect(() => {
    if (!user || !clientData) return;
    
    // Check if user is admin
    const isAdmin = EMAIL_CONFIG.ADMIN_EMAILS.includes(user.email) && clientData.role === 'admin';
    if (!isAdmin) {
      setError('You do not have admin permissions');
      return;
    }
    
    fetchAccounts();
  }, [user, clientData]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const clientsRef = collection(db, 'clients');
      const snapshot = await getDocs(clientsRef);
      
      const accounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        companyName: doc.data().companyName || 'N/A',
        contactPerson: doc.data().contactPerson || 'N/A',
        email: doc.data().email || doc.id,
        approved: Boolean(doc.data().approved),
        status: doc.data().status || 'pending',
        registrationDate: doc.data().registrationDate || new Date().toISOString(),
        approvalDate: doc.data().approvalDate || null,
        approvedBy: doc.data().approvedBy || null
      }));

      setPendingAccounts(accounts.filter(acc => !acc.approved && acc.status === 'pending'));
      setApprovedAccounts(accounts.filter(acc => acc.approved));

    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to fetch accounts. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (account, approve) => {
    if (!user || !clientData) {
      setError('Not authenticated');
      return;
    }

    // Check if user is admin
    const isAdmin = EMAIL_CONFIG.ADMIN_EMAILS.includes(user.email) && clientData.role === 'admin';
    if (!isAdmin) {
      setError('You do not have admin permissions');
      return;
    }

    if (!account.id) {
      setError('Invalid account ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // First get the current document data
      const accountRef = doc(db, 'clients', account.id);
      const docSnap = await getDoc(accountRef);
      
      if (!docSnap.exists()) {
        throw new Error('Account document not found');
      }
      
      const currentData = docSnap.data();
      
      // Prepare update data while preserving existing fields
      const updateData = {
        ...currentData,
        approved: approve,
        status: approve ? 'approved' : 'rejected',
        approvalDate: new Date().toISOString(),
        approvedBy: user.email,
        lastUpdated: new Date().toISOString()
      };

      // Update the document using updateDoc instead of setDoc
      await updateDoc(accountRef, updateData);
      console.log(`Account ${approve ? 'approved' : 'rejected'} successfully:`, account.id);
      
      // Refresh the accounts list
      await fetchAccounts();

    } catch (error) {
      console.error('Error updating account:', error);
      setError(`Failed to ${approve ? 'approve' : 'reject'} account: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Are you sure you want to delete ${account.email}'s account? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Delete from Firestore
      await deleteDoc(doc(db, 'clients', account.id));

      // Delete from Firebase Auth
      try {
        // Get the user from Firebase Auth
        const adminAuth = getAuth();
        const userToDelete = await adminAuth.getUser(account.id);
        if (userToDelete) {
          await adminAuth.deleteUser(account.id);
        }
      } catch (authError) {
        console.error('Error deleting Firebase user:', authError);
        // Continue even if Firebase user deletion fails
      }

      // Refresh the accounts list
      await fetchAccounts();
      alert('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!EMAIL_CONFIG.ADMIN_EMAILS.includes(user?.email) || clientData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            <p>Unauthorized access. This area is restricted to administrators only.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Pending Accounts */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Accounts ({pendingAccounts.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No pending accounts
                    </td>
                  </tr>
                ) : (
                  pendingAccounts.map((account) => (
                    <tr key={account.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{account.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{account.contactPerson}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{account.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(account.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleApproval(account, true)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(account, false)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approved Accounts */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Approved Accounts ({approvedAccounts.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Approval Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Approved By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {approvedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No approved accounts
                    </td>
                  </tr>
                ) : (
                  approvedAccounts.map((account) => (
                    <tr key={account.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{account.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{account.contactPerson}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{account.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {account.approvalDate ? new Date(account.approvalDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {account.approvedBy || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(account)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
