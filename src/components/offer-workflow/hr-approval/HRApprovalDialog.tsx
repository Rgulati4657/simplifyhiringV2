import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, DollarSign, FileText, Clock, Shield } from 'lucide-react';

// Import the tab components you created in the other files
import { HRApprovalOverviewTab } from './HRApprovalOverviewTab';
import { HRApprovalCompensationTab } from './HRApprovalCompensationTab';
import { HRApprovalDetailsTab } from './HRApprovalDetailsTab';
import { HRApprovalHistoryTab } from './HRApprovalHistoryTab';

export const HRApprovalDialog = ({ open, onOpenChange, workflow, onApprove, onReject, onRevision }) => {
  const [hrComments, setHrComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Safety check to prevent rendering with no workflow data
  if (!workflow) {
    return null;
  }

  const handleApprove = async () => {
    setIsLoading(true);
    await onApprove(workflow, hrComments);
    setIsLoading(false);
  };
  
  const handleReject = async () => {
    setIsLoading(true);
    await onReject(workflow, hrComments);
    setIsLoading(false);
  };
  
  // This function will be passed from the parent component
  const handleRevision = () => { onRevision(workflow, hrComments); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            HR Approval Required
          </DialogTitle>
          <DialogDescription className="text-base">
            Review the offer for {workflow.job_applications?.candidates?.profiles?.first_name} {workflow.job_applications?.candidates?.profiles?.last_name}.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 flex-1 min-h-0 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2"><Eye className="w-4 h-4" />Overview</TabsTrigger>
              <TabsTrigger value="compensation" className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Compensation</TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2"><FileText className="w-4 h-4" />Details</TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2"><Clock className="w-4 h-4" />History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <HRApprovalOverviewTab workflow={workflow} />
            </TabsContent>
            
            <TabsContent value="compensation">
              <HRApprovalCompensationTab workflow={workflow} />
            </TabsContent>
            
            <TabsContent value="details">
              <HRApprovalDetailsTab workflow={workflow} />
            </TabsContent>

            <TabsContent value="history">
              <HRApprovalHistoryTab workflow={workflow} />
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="space-y-4">
            <Label htmlFor="hr-comments" className="text-base font-semibold">HR Review Comments</Label>
            <Textarea 
              id="hr-comments" 
              value={hrComments} 
              onChange={(e) => setHrComments(e.target.value)} 
              placeholder="Add your review comments, concerns, or notes for future reference..." 
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-gray-50 border-t shrink-0">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={handleRevision} disabled={isLoading}>
              Request Revision
            </Button>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Reject Offer'}
              </Button>
              <Button onClick={handleApprove} disabled={isLoading} className="bg-green-600 hover:bg-green-700 min-w-[120px]">
                {isLoading ? 'Processing...' : 'Approve Offer'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// import { useState } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { Separator } from '@/components/ui/separator';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Eye, DollarSign, FileText, Clock, Shield } from 'lucide-react';

// // Import the tab components we just created
// import { HRApprovalOverviewTab } from './HRApprovalOverviewTab';
// import { HRApprovalCompensationTab } from './HRApprovalCompensationTab'; // You will create these
// import { HRApprovalDetailsTab } from './HRApprovalDetailsTab';
// import { HRApprovalHistoryTab } from './HRApprovalHistoryTab';

// export const HRApprovalDialog = ({ open, onOpenChange, workflow, onApprove, onReject, onRevision }) => {
//   const [hrComments, setHrComments] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleApprove = async () => {
//     setIsLoading(true);
//     await onApprove(workflow, hrComments);
//     setIsLoading(false);
//   };
  
//   const handleReject = async () => {
//     setIsLoading(true);
//     await onReject(workflow, hrComments);
//     setIsLoading(false);
//   };
  
//   // You can implement revision logic here
//   const handleRevision = () => { onRevision(); };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] p-0">
//         <DialogHeader className="px-6 pt-6 pb-4">
//           <DialogTitle className="text-xl font-semibold flex items-center gap-2">
//             <Shield className="w-5 h-5 text-blue-600" />
//             HR Approval Required
//           </DialogTitle>
//           <DialogDescription className="text-base">
//             Review the offer for {workflow.job_applications?.candidates?.profiles?.first_name} {workflow.job_applications?.candidates?.profiles?.last_name}.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="px-6 pb-6 max-h-[70vh] overflow-auto">
//           <Tabs defaultValue="overview" className="w-full">
//             <TabsList className="grid w-full grid-cols-4 mb-6">
//               <TabsTrigger value="overview"><Eye className="w-4 h-4 mr-2" />Overview</TabsTrigger>
//               <TabsTrigger value="compensation"><DollarSign className="w-4 h-4 mr-2" />Compensation</TabsTrigger>
//               <TabsTrigger value="details"><FileText className="w-4 h-4 mr-2" />Details</TabsTrigger>
//               <TabsTrigger value="history"><Clock className="w-4 h-4 mr-2" />History</TabsTrigger>
//             </TabsList>

//             <TabsContent value="overview">
//               <HRApprovalOverviewTab workflow={workflow} />
//             </TabsContent>
//             <TabsContent value="compensation">
//               {/* <HRApprovalCompensationTab workflow={workflow} /> */}
//               <p>Compensation Details Go Here...</p>
//             </TabsContent>
//             {/* Add other TabsContent sections */}
//           </Tabs>

//           <Separator className="my-6" />

//           <div className="space-y-4">
//             <Label htmlFor="hr-comments" className="text-base font-semibold">HR Review Comments</Label>
//             <Textarea id="hr-comments" value={hrComments} onChange={(e) => setHrComments(e.target.value)} placeholder="Add review comments..." rows={4} />
//           </div>
//         </div>

//         <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
//           <div className="flex justify-between w-full">
//             <Button variant="outline" onClick={handleRevision} disabled={isLoading}>Request Revision</Button>
//             <div className="flex gap-3">
//               <Button variant="destructive" onClick={handleReject} disabled={isLoading}>{isLoading ? 'Processing...' : 'Reject'}</Button>
//               <Button onClick={handleApprove} disabled={isLoading} className="bg-green-600 hover:bg-green-700">{isLoading ? 'Processing...' : 'Approve'}</Button>
//             </div>
//           </div>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };