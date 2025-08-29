import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
};

export const HRApprovalHistoryTab = ({ workflow }) => {
  const events = [
    {
      isComplete: true,
      title: "Workflow Created",
      date: workflow.created_at,
      description: "Offer process initiated for the candidate."
    },
    {
      isComplete: workflow.background_check_completed_at,
      title: "Background Check Completed",
      date: workflow.background_check_completed_at,
      description: `Status: ${workflow.background_check_status}`
    },
    {
      isComplete: workflow.offer_generated_at,
      title: "Offer Letter Generated",
      date: workflow.offer_generated_at,
      description: "Offer details and document are ready for review."
    },
    {
      isComplete: false,
      title: "Pending HR Approval",
      date: null,
      description: "Currently awaiting your review and decision."
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Workflow Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${event.isComplete ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
              <div>
                <div className={`text-sm font-medium ${!event.isComplete && 'text-yellow-600'}`}>{event.title}</div>
                <div className="text-xs text-gray-500">{event.date ? formatDate(event.date) : event.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};