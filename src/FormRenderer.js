import React from 'react';
import BatchSheet from './BatchSheet';
import YogurtFinalTimeCutRecord from './YogurtFinalTimeCutRecord';
import YogurtPasteurizationMonitoring from './YogurtPasteurizationMonitoring';
import YogurtBatchingProcess from './YogurtBatchingProcess';
// In the future, you would import other form components here
// import SimpleCheckForm from './SimpleCheckForm';

function FormRenderer({ form, onBack }) {
    // This switch statement decides which form component to render
    // based on the 'formType' field from the Firestore document.
    switch (form.formType) {
        case 'batchSheet':
            return <BatchSheet formTemplate={form} onBack={onBack} />;
        
        case 'yogurtFinalTimeCut':
            return <YogurtFinalTimeCutRecord formTemplate={form} onBack={onBack} />;
        
        case 'yogurtPasteurizationMonitoring':
            return <YogurtPasteurizationMonitoring formTemplate={form} onBack={onBack} />;
        
        case 'yogurtBatchingProcess':
            return <YogurtBatchingProcess formTemplate={form} onBack={onBack} />;
        
        // case 'simpleCheck':
        //     return <SimpleCheckForm formTemplate={form} onBack={onBack} />;

        default:
            return (
                <div className="p-4">
                    <h2 className="font-bold text-red-500">Error: Unknown Form Type</h2>
                    <p>The form type "{form.formType}" is not recognized by the FormRenderer.</p>
                    <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-200 rounded">Go Back</button>
                </div>
            );
    }
}

export default FormRenderer;
