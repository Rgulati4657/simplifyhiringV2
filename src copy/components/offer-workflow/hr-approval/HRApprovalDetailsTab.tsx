// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Calendar, Award } from 'lucide-react';

// // Helper function for date formatting
// const formatDate = (dateString) => {
//   if (!dateString) return 'Not specified';
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });
// };

// export const HRApprovalDetailsTab = ({ workflow }) => {
//   const offerDetails = workflow.offer_details;
//   const job = workflow.job_applications?.jobs;

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg flex items-center gap-2">
//             <Calendar className="w-5 h-5 text-blue-600" />
//             Timeline & Terms
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <div className="flex justify-between">
//             <span className="text-sm font-medium text-gray-600">Proposed Start Date:</span>
//             <span className="text-sm font-semibold">{formatDate(offerDetails?.start_date)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-sm font-medium text-gray-600">Probation Period:</span>
//             <span className="text-sm">{offerDetails?.probation_period_months || 0} months</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-sm font-medium text-gray-600">Notice Period:</span>
//             <span className="text-sm">{offerDetails?.notice_period_days || 0} days</span>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg flex items-center gap-2">
//             <Award className="w-5 h-5 text-purple-600" />
//             Additional Information
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <div className="text-sm">
//             <span className="font-medium text-gray-600">Currency:</span>
//             <span className="ml-2">{job?.currency || 'USD'}</span>
//           </div>
//           <div className="text-sm">
//             <span className="font-medium text-gray-600">Employment Type:</span>
//             <span className="ml-2">Full-time</span>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Award } from 'lucide-react';

// Helper function for date formatting
const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const HRApprovalDetailsTab = ({ workflow }) => {
  // --- IMPROVEMENT IMPLEMENTED ---
  // We now parse the 'generated_offer_content' to get the most accurate, up-to-date details.
  let offerContent = {};
  try {
    // Check if the content exists before parsing to avoid errors
    if (workflow.generated_offer_content) {
      offerContent = JSON.parse(workflow.generated_offer_content);
    }
  } catch (e) {
    console.error("Failed to parse generated_offer_content JSON:", e);
    // Fallback to offer_details if parsing fails, ensuring the UI doesn't break
    offerContent = workflow.offer_details || {};
  }

  const job = workflow.job_applications?.jobs;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Timeline & Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Proposed Start Date:</span>
            {/* Reading from the accurate offerContent object */}
            <span className="text-sm font-semibold">{formatDate(offerContent.start_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Probation Period:</span>
            <span className="text-sm">{offerContent.probation_period_months || 'N/A'} months</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Notice Period:</span>
            <span className="text-sm">{offerContent.notice_period_days || 'N/A'} days</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <span className="font-medium text-gray-600">Currency:</span>
            {/* The base job currency is still reliable */}
            <span className="ml-2">{job?.currency || 'USD'}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-600">Employment Type:</span>
            <span className="ml-2">Full-time</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};