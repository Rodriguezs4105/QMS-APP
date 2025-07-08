import React, { useRef } from 'react';
// 🔧 FIX: Changed getAuth to auth, which is the exported instance from your firebase.js
import { db, doc, updateDoc, auth } from './firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- ICONS ---
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const DownloadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;

function VerificationDetail({ form, onBack }) {
    const pdfRef = useRef();
    // 🔧 FIX: The imported `auth` object is used directly. The line `const auth = getAuth()` was removed.
    const managerName = auth.currentUser?.displayName || auth.currentUser?.email || "Manager";

    const handleApprove = async () => {
        if (!window.confirm("Are you sure you want to approve this form?")) return;
        const formRef = doc(db, "completedForms", form.id);
        try {
            await updateDoc(formRef, { status: "Approved", verifiedBy: managerName, verifiedAt: new Date() });
            alert("Form Approved!");
            onBack();
        } catch (error) {
            console.error("Error approving form: ", error);
            alert("Failed to approve form.");
        }
    };

    const handleReject = async () => {
        const reason = prompt("Please provide a reason for rejecting this form:");
        if (!reason) {
            alert("Rejection cancelled. A reason is required.");
            return;
        }
        const formRef = doc(db, "completedForms", form.id);
        try {
            await updateDoc(formRef, { status: "Rejected", rejectionReason: reason, rejectedBy: managerName, rejectedAt: new Date() });
            alert("Form Rejected and sent back to the employee for corrective action.");
            onBack();
        } catch (error) {
            console.error("Error rejecting form: ", error);
            alert("Failed to reject form.");
        }
    };

    const handleDownloadPDF = () => {
        const input = pdfRef.current;
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4', true);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 15; // Add a top margin
            pdf.setFontSize(12);
            pdf.text(`Form: F-06 Dynamic Yogurt Batch Sheet - ${form.recipeName}`, pdfWidth / 2, 10, { align: 'center' });
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${form.recipeName}_${form.batchDate}.pdf`);
        });
    };

    return (
        <div>
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 pt-6 shadow-lg sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="text-white p-2 -ml-2"><BackIcon /></button>
                    <h1 className="text-xl font-bold text-white truncate">Review: {form.recipeName}</h1>
                    <div className="w-6"></div>
                </div>
            </header>
            
            <main className="p-4" >
                <div ref={pdfRef} className="bg-white p-6 shadow-md rounded-lg">
                    {/* Batch Info */}
                    <div className="mb-4 border-b pb-4">
                        <h2 className="text-xl font-bold mb-2">Batch Information</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div><strong className="block text-gray-500">Recipe:</strong> {form.recipeName}</div>
                            <div><strong className="block text-gray-500">Batch Date:</strong> {form.batchDate}</div>
                            <div><strong className="block text-gray-500">Batch #:</strong> {form.batchNumber}</div>
                            <div><strong className="block text-gray-500">Submitted By:</strong> {form.batchBy}</div>
                            <div><strong className="block text-gray-500">Lot #:</strong> {form.calculatedValues?.lotNumber}</div>
                            <div><strong className="block text-gray-500">Shelf Life:</strong> {form.calculatedValues?.shelfLife}</div>
                            <div className="col-span-2"><strong className="block text-gray-500">Expiry Date:</strong> {form.calculatedValues?.expiryDate}</div>
                            <div><strong className="block text-gray-500">Base Amount:</strong> {form.baseIngredientAmount} kg</div>
                            <div><strong className="block text-gray-500">Theoretical Yield:</strong> {form.calculatedValues?.theoreticalYield}</div>
                             <div><strong className="block text-gray-500">Mixing Tank:</strong> {form.mixingTank?.join(', ')}</div>
                            <div><strong className="block text-gray-500">Transferred To:</strong> {form.transferTo?.join(', ')}</div>
                        </div>
                    </div>
                    
                    {/* Ingredients */}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-2">Ingredients Used</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2">Code</th>
                                        <th className="p-2">Ingredient</th>
                                        <th className="p-2">Target</th>
                                        <th className="p-2">Actual Use</th>
                                        <th className="p-2">Lot #</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.ingredients?.map((ing, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-2">{ing.code}</td>
                                            <td className="p-2 font-semibold">{ing.name}</td>
                                            <td className="p-2">{ing.targetAmount} {ing.isRatio ? 'kg' : ''}</td>
                                            <td className="p-2">{ing.actualUse}</td>
                                            <td className="p-2">{ing.lot}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Final Yield and Verification */}
                     <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                        <div><strong className="block text-gray-500">FINAL BATCH YIELD:</strong> {form.batchYield}</div>
                        <div><strong className="block text-gray-500">Performed By:</strong> {form.yieldPerformedBy}</div>
                     </div>
                </div>

                <div className="p-4 mt-4 bg-white rounded-lg shadow-md">
                     <button onClick={handleDownloadPDF} className="mb-4 w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-700 flex items-center justify-center">
                        <DownloadIcon />
                        Download as PDF
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleReject} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-red-600">
                            Reject
                        </button>
                        <button onClick={handleApprove} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-green-600">
                            Approve
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default VerificationDetail;