import React, { useState } from 'react';
import { db, auth, doc, setDoc, serverTimestamp, collection } from './firebase';

const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

const cookingParamsRows = [
  'Soaking Chickpeas',
  '*Boiling of Chickpeas'
];
const cookingParamsCols = [
  { key: 'start_time', label: 'Start Time', type: 'time' },
  { key: 'end_time', label: 'End Time', type: 'time' },
  { key: 'temperature', label: 'Temperature', type: 'text' },
  { key: 'comments', label: 'Comments', type: 'text' },
  { key: 'initials', label: 'Initials', type: 'text' }
];
const storageRecordRows = [
  'Entered into Blast Chiller',
  'Removed from Blast Chiller and Before Mixing'
];
const storageRecordCols = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'time', label: 'Time', type: 'time' },
  { key: 'temperature', label: 'Temperature', type: 'text' },
  { key: 'comments', label: 'Comments', type: 'text' },
  { key: 'initials', label: 'Initials', type: 'text' }
];

function ChickpeasBatchingProcess({ formTemplate, onBack }) {
  const [formData, setFormData] = useState({
    date: '',
    quantity_cooked: '',
    batched_by: '',
    batch_name: '',
    lot_cooked: '',
    lot_raw: '',
    qc_ph: '',
    cooking_params: cookingParamsRows.map(() => ({ start_time: '', end_time: '', temperature: '', comments: '', initials: '' })),
    storage_record: storageRecordRows.map(() => ({ date: '', time: '', temperature: '', comments: '', initials: '' }))
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (table, rowIdx, key, value) => {
    setFormData(prev => ({
      ...prev,
      [table]: prev[table].map((row, idx) => idx === rowIdx ? { ...row, [key]: value } : row)
    }));
  };

  const handleToday = (field) => {
    setFormData(prev => ({ ...prev, [field]: new Date().toISOString().split('T')[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const finalData = {
      ...formData,
      formTitle: formTemplate?.title || 'F-10: Chickpeas Batching Process',
      submittedBy: user?.email || 'Unknown User',
      submittedAt: serverTimestamp(),
      status: 'Pending Review'
    };
    try {
      const newFormRef = doc(collection(db, 'completedForms'));
      await setDoc(newFormRef, finalData);
      alert('Form submitted for review!');
      onBack();
    } catch (error) {
      console.error('Error submitting form: ', error);
      alert('Error submitting form. See console for details.');
    }
  };

  return (
    <div>
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="text-white p-2 -ml-2"><BackIcon /></button>
          <h1 className="text-xl font-bold text-white truncate">F-10: Chickpeas Batching Process</h1>
          <div className="w-6"></div>
        </div>
      </header>
      <main className="p-4">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border space-y-6">
            <div>
              <label htmlFor="date" className="block text-lg font-medium text-gray-700 mb-2">Date <span className="text-red-500">*</span>
                <button type="button" className="today-btn text-xs text-blue-600 ml-2" onClick={() => handleToday('date')}>Today</button>
              </label>
              <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label htmlFor="quantity_cooked" className="block text-lg font-medium text-gray-700 mb-2">Quantity Cooked</label>
              <input type="text" id="quantity_cooked" name="quantity_cooked" value={formData.quantity_cooked} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label htmlFor="batched_by" className="block text-lg font-medium text-gray-700 mb-2">Batched By</label>
              <input type="text" id="batched_by" name="batched_by" value={formData.batched_by} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label htmlFor="batch_name" className="block text-lg font-medium text-gray-700 mb-2">Batch Name</label>
              <input type="text" id="batch_name" name="batch_name" value={formData.batch_name} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label htmlFor="lot_cooked" className="block text-lg font-medium text-gray-700 mb-2">Lot # (Cooked Chickpeas)</label>
              <input type="text" id="lot_cooked" name="lot_cooked" value={formData.lot_cooked} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label htmlFor="lot_raw" className="block text-lg font-medium text-gray-700 mb-2">Lot# (Raw Chickpeas)</label>
              <input type="text" id="lot_raw" name="lot_raw" value={formData.lot_raw} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Cooking Parameters</label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left responsive-table table-bordered mb-4">
                  <thead className="bg-gray-200 text-gray-600 uppercase">
                    <tr>
                      <th className="p-2">Parameter</th>
                      {cookingParamsCols.map(col => <th key={col.key} className="p-2">{col.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {cookingParamsRows.map((param, i) => (
                      <tr key={param} className="border-b">
                        <td className="p-2 font-semibold">{param}</td>
                        {cookingParamsCols.map(col => (
                          <td key={col.key} className="p-1">
                            <input type={col.type} value={formData.cooking_params[i][col.key]} onChange={e => handleTableChange('cooking_params', i, col.key, e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Chickpeas Storage Record</label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left responsive-table table-bordered mb-4">
                  <thead className="bg-gray-200 text-gray-600 uppercase">
                    <tr>
                      <th className="p-2"></th>
                      {storageRecordCols.map(col => <th key={col.key} className="p-2">{col.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {storageRecordRows.map((action, i) => (
                      <tr key={action} className="border-b">
                        <td className="p-2 font-semibold">{action}</td>
                        {storageRecordCols.map(col => (
                          <td key={col.key} className="p-1">
                            <input type={col.type} value={formData.storage_record[i][col.key]} onChange={e => handleTableChange('storage_record', i, col.key, e.target.value)} className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <label htmlFor="qc_ph" className="block text-lg font-medium text-gray-700 mb-2">¹pH (Cooked Chickpeas)</label>
              <input type="text" id="qc_ph" name="qc_ph" value={formData.qc_ph} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg shadow-md hover:from-green-600 hover:to-emerald-600 transition-colors">Submit for Review</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ChickpeasBatchingProcess; 