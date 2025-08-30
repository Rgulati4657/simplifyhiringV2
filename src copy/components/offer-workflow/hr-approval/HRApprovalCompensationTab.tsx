// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { CheckCircle } from 'lucide-react';

// // Helper function for currency formatting
// const formatCurrency = (amount, currency = 'USD') => {
//   if (amount === null || typeof amount === 'undefined') return 'N/A';
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: currency,
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);
// };

// export const HRApprovalCompensationTab = ({ workflow }) => {
//   const offerDetails = workflow.offer_details;
//   const finalOfferAmount = workflow.final_offer_amount || 0;
//   const signingBonus = offerDetails?.signing_bonus || 0;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg">Base Compensation</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex justify-between items-center py-2 border-b">
//             <span className="font-medium">Annual Salary</span>
//             <span className="text-lg font-bold text-green-600">
//               {formatCurrency(finalOfferAmount)}
//             </span>
//           </div>
//           {signingBonus > 0 && (
//             <div className="flex justify-between items-center py-2 border-b">
//               <span className="font-medium">Signing Bonus</span>
//               <span className="text-lg font-semibold text-blue-600">
//                 {formatCurrency(signingBonus)}
//               </span>
//             </div>
//           )}
//           {offerDetails?.equity_percentage && (
//             <div className="flex justify-between items-center py-2 border-b">
//               <span className="font-medium">Equity</span>
//               <span className="text-lg font-semibold text-purple-600">
//                 {offerDetails.equity_percentage}%
//               </span>
//             </div>
//           )}
//           <div className="pt-2">
//             <div className="text-sm text-gray-600 mb-2">Total First Year Value:</div>
//             <div className="text-xl font-bold text-green-700">
//               {formatCurrency(finalOfferAmount + signingBonus)}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg">Benefits Package</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {offerDetails?.benefits && offerDetails.benefits.length > 0 ? (
//             <div className="space-y-2">
//               {offerDetails.benefits.map((benefit, index) => (
//                 <div key={index} className="flex items-center gap-2">
//                   <CheckCircle className="w-4 h-4 text-green-500" />
//                   <span className="text-sm">{benefit}</span>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-sm text-gray-500 italic">No specific benefits listed.</div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

// Helper function for currency formatting
const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || typeof amount === 'undefined') return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const HRApprovalCompensationTab = ({ workflow }) => {
  // --- IMPROVEMENT IMPLEMENTED ---
  // We parse 'generated_offer_content' for the most accurate compensation details.
  let offerContent = {};
  try {
    if (workflow.generated_offer_content) {
      offerContent = JSON.parse(workflow.generated_offer_content);
    }
  } catch (e) {
    console.error("Failed to parse generated_offer_content JSON:", e);
    offerContent = workflow.offer_details || {}; // Fallback
  }

  const finalOfferAmount = workflow.final_offer_amount || 0;
  
  // Reading from the more reliable offerContent object
  const signingBonus = offerContent.signing_bonus || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Base Compensation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Annual Salary</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(finalOfferAmount)}
            </span>
          </div>
          {signingBonus > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Signing Bonus</span>
              <span className="text-lg font-semibold text-blue-600">
                {formatCurrency(signingBonus)}
              </span>
            </div>
          )}
          {offerContent.equity_percentage && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Equity</span>
              <span className="text-lg font-semibold text-purple-600">
                {offerContent.equity_percentage}%
              </span>
            </div>
          )}
          <div className="pt-2">
            <div className="text-sm text-gray-600 mb-2">Total First Year Value:</div>
            <div className="text-xl font-bold text-green-700">
              {formatCurrency(finalOfferAmount + parseFloat(signingBonus))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Benefits Package</CardTitle>
        </CardHeader>
        <CardContent>
          {offerContent.benefits && Array.isArray(offerContent.benefits) && offerContent.benefits.length > 0 ? (
            <div className="space-y-2">
              {offerContent.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No specific benefits listed in the offer.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};