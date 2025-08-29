// // src/components/forms/EditJobModal.tsx

// import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Loader2 } from 'lucide-react';

// interface EditJobModalProps {
//   jobId: string | null;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onJobUpdated: () => void; // Callback to refresh the table
// }

// export const EditJobModal = ({ jobId, open, onOpenChange, onJobUpdated }: EditJobModalProps) => {
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
  
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     location: '',
//     status: 'published', // Make sure these values match your 'job_status' enum in Supabase
//     salary_min: '',
//     salary_max: '',
//   });

//   // Fetch the current job data when the modal opens (This part remains the same)
//   useEffect(() => {
//     if (open && jobId) {
//       const fetchJobData = async () => {
//         setLoading(true);
//         try {
//           const { data, error } = await supabase
//             .from('jobs')
//             .select('*')
//             .eq('id', jobId)
//             .single();

//           if (error) throw error;
//           if (!data) throw new Error("Job not found.");
          
//           setFormData({
//             title: data.title || '',
//             description: data.description || '',
//             location: data.location || '',
//             status: data.status || 'published',
//             salary_min: data.salary_min?.toString() || '',
//             salary_max: data.salary_max?.toString() || '',
//           });
//         } catch (err: any) {
//           toast({ title: "Error fetching job data", description: err.message, variant: "destructive" });
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchJobData();
//     }
//   }, [jobId, open, toast]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { id, value } = e.target;
//     setFormData(prev => ({ ...prev, [id]: value }));
//   };

//   const handleStatusChange = (value: string) => {
//     setFormData(prev => ({ ...prev, status: value }));
//   };


//     // --- THIS IS THE MODIFIED UPDATE LOGIC ---
//   const handleSubmit = async () => {
//     if (!jobId) return;
//     setSaving(true);
//     try {
//       // First, get the current user's ID for verification
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) throw new Error("User not authenticated.");

//       // The JSONB object must match the keys used in the database function
//       const jobData = {
//         title: formData.title,
//         description: formData.description,
//         location: formData.location,
//         status: formData.status,
//         salary_min: formData.salary_min || null,
//         salary_max: formData.salary_max || null,
//       };

//       // Call the database function using rpc()
//       const { error } = await supabase.rpc('update_company_job', {
//         p_job_id: jobId,
//         p_user_id: user.id,
//         p_job_data: jobData
//       });
      
//       if (error) {
//         // This will now catch permission errors from our "RAISE EXCEPTION"
//         throw error;
//       }
      
//       toast({ title: "Job Updated Successfully" });
//       onJobUpdated();
//       onOpenChange(false);

//     } catch (err: any) {
//       toast({ title: "Failed to update job", description: err.message, variant: "destructive" });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader><DialogTitle>Edit Job</DialogTitle></DialogHeader>
//         {loading ? (
//           <div className="flex items-center justify-center h-40">
//             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//           </div>
//         ) : (
//           <div className="space-y-4 py-4">
//             <Input id="title" placeholder="Job Title" value={formData.title} onChange={handleInputChange} />
//             <Textarea id="description" placeholder="Job Description" value={formData.description} onChange={handleInputChange} />
//             <Input id="location" placeholder="Location" value={formData.location} onChange={handleInputChange} />
//             <div className="grid grid-cols-2 gap-4">
//               <Input id="salary_min" type="number" placeholder="Min Salary" value={formData.salary_min} onChange={handleInputChange} />
//               <Input id="salary_max" type="number" placeholder="Max Salary" value={formData.salary_max} onChange={handleInputChange} />
//             </div>
//             <Select value={formData.status} onValueChange={handleStatusChange}>
//               <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="published">Published</SelectItem>
//                 <SelectItem value="draft">Draft</SelectItem>
//                 <SelectItem value="on_hold">On Hold</SelectItem>
//                 <SelectItem value="closed">Closed</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         )}
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
//           <Button onClick={handleSubmit} disabled={saving || loading}>
//             {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Save Changes
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// src/components/forms/EditJobModal.tsx

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label'; // <-- Import Label
import { Loader2, Briefcase, MapPin, ClipboardList } from 'lucide-react'; // <-- Import Icons

interface EditJobModalProps {
  jobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobUpdated: () => void;
}

export const EditJobModal = ({ jobId, open, onOpenChange, onJobUpdated }: EditJobModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    status: 'published',
    salary_min: '',
    salary_max: '',
  });

  // --- NO CHANGES TO ANY LOGIC ---
  useEffect(() => {
    if (open && jobId) {
      const fetchJobData = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).single();
          if (error) throw error;
          if (!data) throw new Error("Job not found.");
          
          setFormData({
            title: data.title || '',
            description: data.description || '',
            location: data.location || '',
            status: data.status || 'published',
            salary_min: data.salary_min?.toString() || '',
            salary_max: data.salary_max?.toString() || '',
          });
        } catch (err: any) {
          toast({ title: "Error fetching job data", description: err.message, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchJobData();
    }
  }, [jobId, open, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = async () => {
    if (!jobId) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated.");
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        status: formData.status,
        salary_min: formData.salary_min || null,
        salary_max: formData.salary_max || null,
      };
      const { error } = await supabase.rpc('update_company_job', {
        p_job_id: jobId,
        p_user_id: user.id,
        p_job_data: jobData
      });
      if (error) throw error;
      toast({ title: "Job Updated Successfully" });
      onJobUpdated();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Failed to update job", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // --- UI & UX OVERHAUL BELOW ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-primary">Edit Job Details</DialogTitle>
          <DialogDescription>
            Make changes to the job posting below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading Job Details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 py-4">
            {/* Job Title */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title" className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                Job Title
              </Label>
              <Input id="title" placeholder="e.g., Senior Frontend Developer" value={formData.title} onChange={handleInputChange} />
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description" className="flex items-center">
                <ClipboardList className="w-4 h-4 mr-2 text-muted-foreground" />
                Job Description
              </Label>
              <Textarea id="description" placeholder="Describe the role and responsibilities..." value={formData.description} onChange={handleInputChange} rows={5} />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                Location
              </Label>
              <Input id="location" placeholder="e.g., San Francisco, CA or Remote" value={formData.location} onChange={handleInputChange} />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="flex items-center">
                Status
              </Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Salary Range */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">
                  Min Salary 
                </Label>
                <Input id="salary_min" type="number" placeholder="e.g., 120000" value={formData.salary_min} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_max">
                  Max Salary 
                </Label>
                <Input id="salary_max" type="number" placeholder="e.g., 150000" value={formData.salary_max} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving || loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};