import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, DollarSign } from 'lucide-react';

// Helper function (can be moved to a utils file later)
const formatCurrency = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

export const HRApprovalOverviewTab = ({ workflow }) => {
  const candidate = workflow.job_applications?.candidates?.profiles;
  const job = workflow.job_applications?.jobs;
  const offerDetails = workflow.offer_details;

  const salaryPercentage = job?.salary_max > job?.salary_min 
    ? (((workflow.final_offer_amount || 0) - (job?.salary_min || 0)) / (job?.salary_max - job?.salary_min)) * 100
    : 50;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />Candidate</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-sm font-medium text-gray-600">Name:</span><span className="text-sm font-semibold">{candidate?.first_name} {candidate?.last_name}</span></div>
            <div className="flex justify-between"><span className="text-sm font-medium text-gray-600">Email:</span><span className="text-sm">{candidate?.email}</span></div>
            <div className="flex justify-between"><span className="text-sm font-medium text-gray-600">Background Check:</span><Badge variant="default" className="bg-green-500">{workflow.background_check_status?.toUpperCase()}</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-600" />Position</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-sm font-medium text-gray-600">Position:</span><span className="text-sm font-semibold">{job?.title}</span></div>
            <div className="flex justify-between"><span className="text-sm font-medium text-gray-600">Department:</span><span className="text-sm">{offerDetails?.department || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-sm font-medium text-gray-600">Reports to:</span><span className="text-sm">{offerDetails?.reporting_manager || 'N/A'}</span></div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" />Salary Analysis</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg"><div className="text-sm text-gray-600 mb-1">Budget Min</div><div className="text-lg font-semibold text-blue-600">{formatCurrency(job?.salary_min || 0)}</div></div>
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200"><div className="text-sm text-gray-600 mb-1">Proposed Offer</div><div className="text-xl font-bold text-green-600">{formatCurrency(workflow.final_offer_amount || 0)}</div></div>
            <div className="p-4 bg-blue-50 rounded-lg"><div className="text-sm text-gray-600 mb-1">Budget Max</div><div className="text-lg font-semibold text-blue-600">{formatCurrency(job?.salary_max || 0)}</div></div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div className="bg-blue-200 h-3 rounded-full" style={{width: '100%'}}></div>
              <div className="absolute top-0 h-3 w-1 bg-green-600 rounded-full" style={{ left: `${salaryPercentage}%` }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};