import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Users, Search, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MergedCalendarView from './MergedCalendarView';
import { useAuth } from '@/hooks/useAuth';

interface Job {
  id: string;
  title: string;
  company_name: string;
}

interface Applicant {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  candidates: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    free_slots?: any[];
  } | null;
}

interface InterviewRound {
  id: string;
  name: string;
  round_number: number;
  duration_minutes: number;
  interview_type: string;
}

interface Interviewer {
  id: string;
  user_id: string;
   interviewer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  free_slots?: any;
  timezone?: string;
}

interface InterviewSchedulingModalProps {
  trigger?: React.ReactNode;
  onScheduled?: () => void;
}

const InterviewSchedulingModal: React.FC<InterviewSchedulingModalProps> = ({
  trigger,
  onScheduled
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
   const { profile } = useAuth(); 

  // Step 1: Job Selection
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobSearch, setJobSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Step 2: Applicant Selection
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Step 3: Interview Round and Interviewers
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>([]);
  const [selectedRound, setSelectedRound] = useState<InterviewRound | null>(null);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);

  // Add this near your other useState definitions
const [loadingCalendarData, setLoadingCalendarData] = useState(false);

  // Step 4: Calendar and Meeting Details
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]);
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    description: '',
    location: '',
    notes: ''
  });
  const [guestInterviewers, setGuestInterviewers] = useState<string[]>([]);
  const [guestEmail, setGuestEmail] = useState('');

  // Fetch jobs on modal open
  useEffect(() => {
    if (open) {
      fetchJobs();
    }
  }, [open]);

  // Fetch applicants when job is selected
  useEffect(() => {
    if (selectedJob) {
      console.log('Job selected:', selectedJob);
      console.log('Job ID type:', typeof selectedJob.id);
      console.log('Job ID value:', selectedJob.id);
      fetchApplicants(selectedJob.id);
      fetchInterviewRounds(selectedJob.id);
    }
  }, [selectedJob]);

  // Fetch interviewers when round is selected
  useEffect(() => {
    if (selectedRound) {
      // fetchInterviewers(selectedRound.id);
        setLoadingCalendarData(true); // <-- ADD THIS LINE
    fetchInterviewers(selectedRound.id).finally(() => {
      setLoadingCalendarData(false); // <-- ADD THIS LINE
    });
  } else {
    setInterviewers([]);
  }
  }, [selectedRound]);

  // const fetchJobs = async () => {
  //   setLoadingJobs(true);
  //   try {
  //     const { data, error } = await supabase
  //       .from('jobs')
  //       .select(`
  //         id,
  //         title,
  //         companies (
  //           name
  //         )
  //       `)
  //       .eq('status', 'published')
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;

  //     const formattedJobs = data?.map(job => ({
  //       id: job.id,
  //       title: job.title,
  //       company_name: job.companies?.name || 'Unknown Company'
  //     })) || [];

  //     setJobs(formattedJobs);
  //   } catch (error) {
  //     console.error('Error fetching jobs:', error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to fetch jobs",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoadingJobs(false);
  //   }
  // };


    const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      console.log('Reusing secure function and fetching ALL company jobs: get_company_jobs_with_details');

      // Hum existing function ko call kar rahe hain
      const { data, error } = await supabase
        .rpc('get_company_jobs_with_details') // <-- REUSED FUNCTION
        .select(`
          id,
          title,
          created_at,
          companies (
            name
          )
        `)
        // .eq('status', 'published') // <-- YEH FILTER HATA DIYA HAI
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedJobs = data?.map(job => ({
        id: job.id,
        title: job.title,
        company_name: job.companies?.name || 'Unknown Company'
      })) || [];

      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs for your company",
        variant: "destructive",
      });
    } finally {
      setLoadingJobs(false);
    }
  };


  //   const fetchJobs = async () => {
  //   // Agar profile load nahi hui hai, toh aage nahi badhna hai
  //   if (!profile) {
  //     setLoadingJobs(false);
  //     return;
  //   }

  //   setLoadingJobs(true);
  //   try {
  //     // Step 1: Current admin ki company ID dhoondho
  //     const { data: adminData, error: adminError } = await supabase
  //       .from('admin')
  //       .select('company_id')
  //       .eq('profile_id', profile.id) // Current user ki ID use karo
  //       .single();

  //     if (adminError || !adminData) {
  //       throw new Error("Could not verify your admin status to fetch jobs.");
  //     }

  //     const companyId = adminData.company_id;

  //     // Step 2: Sirf uss company ke published jobs fetch karo
  //     const { data, error } = await supabase
  //       .from('jobs')
  //       .select(`
  //         id,
  //         title,
  //         companies (
  //           name
  //         )
  //       `)
  //       .eq('status', 'published')
  //       .eq('company_id', companyId) // <-- YEH SABSE IMPORTANT FILTER HAI
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;

  //     const formattedJobs = data?.map(job => ({
  //       id: job.id,
  //       title: job.title,
  //       company_name: job.companies?.name || 'Unknown Company'
  //     })) || [];

  //     setJobs(formattedJobs);
  //   } catch (error: any) {
  //     console.error('Error fetching jobs:', error);
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to fetch jobs for your company",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoadingJobs(false);
  //   }
  // };



  const fetchApplicants = async (jobId: string) => {
    setLoadingApplicants(true);
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          candidate_id,
          status,
          candidates (
            id,
            free_slots,
            profiles (
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('job_id', jobId)
        .in('status', ['applied', 'screening', 'interview', 'selected']);

      if (error) throw error;

      const formattedApplicants = data?.map(app => ({
        id: app.id,
        candidate_id: app.candidate_id,
        job_id: jobId,
        status: app.status,
        candidates: app.candidates?.profiles ? {
          id: app.candidates.id,
          user_id: app.candidates.profiles.id || '',
          first_name: app.candidates.profiles.first_name || 'Unknown',
          last_name: app.candidates.profiles.last_name || 'User',
          email: app.candidates.profiles.email || 'No email',
          free_slots: app.candidates.free_slots || []
        } : null
      })) || [];

      setApplicants(formattedApplicants);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applicants",
        variant: "destructive",
      });
    } finally {
      setLoadingApplicants(false);
    }
  };

  const fetchInterviewRounds = async (jobId: string) => {
    try {
      // Use the database function to get interview rounds
      const { data, error } = await supabase
        .rpc('get_interview_rounds', { job_uuid: jobId });

      if (error) throw error;

      console.log('Interview rounds from DB function:', data);

      const formattedRounds = data?.map(round => ({
        id: round.id,
        name: `${round.round_type} Round ${round.round_number}`,
        round_number: round.round_number,
        duration_minutes: round.duration_minutes,
        interview_type: round.round_type
      })) || [];

      console.log('Formatted interview rounds:', formattedRounds);
      setInterviewRounds(formattedRounds);
    } catch (error) {
      console.error('Error fetching interview rounds:', error);
      toast({
        title: "Error",
        description: "Failed to fetch interview rounds",
        variant: "destructive",
      });
      setInterviewRounds([]);
    }
  };

const fetchInterviewers = async (roundId: string) => {
  try {
    // Call the database function by its name 'get_assigned_interviewers_for_round'
    // and pass the roundId as the 'round_uuid' parameter.
    const { data, error } = await supabase
      .rpc('get_assigned_interviewers_for_round', {
        round_uuid: roundId
      });

    // If there's an error from the database, stop and throw the error.
    if (error) throw error;

    // The 'data' from the rpc call is already the final array.
    // We don't need to map or format it. Just use it directly.
    // If data is null, we'll use an empty array as a fallback.
    const interviewersList = data || [];

    console.log(`Successfully fetched ${interviewersList.length} pre-assigned interviewer(s):`, interviewersList);
    setInterviewers(interviewersList);

  } catch (error: any) {
    console.error('Error fetching assigned interviewers:', error);
    toast({
      title: "Error",
      description: `Failed to fetch assigned interviewers: ${error.message}`,
      variant: "destructive",
    });
  }
};

const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    job.company_name.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const handleApplicantToggle = (applicantId: string) => {
    setSelectedApplicants(prev =>
      prev.includes(applicantId)
        ? prev.filter(id => id !== applicantId)
        : [...prev, applicantId]
    );
  };

  // const handleInterviewerToggle = (interviewerId: string) => {
  //   setSelectedInterviewers(prev =>
  //     prev.includes(interviewerId)
  //       ? prev.filter(id => id !== interviewerId)
  //       : [...prev, interviewerId]
  //   );
  // };

  const handleInterviewerToggle = (interviewer: Interviewer) => {
  const idToStore = interviewer.interviewer_id; // <-- THE FIX
  setSelectedInterviewers(prev =>
    prev.includes(idToStore)
      ? prev.filter(id => id !== idToStore)
      : [...prev, idToStore]
  );
};

  const addGuestInterviewer = () => {
    if (guestEmail.trim() && !guestInterviewers.includes(guestEmail.trim())) {
      setGuestInterviewers(prev => [...prev, guestEmail.trim()]);
      setGuestEmail('');
    }
  };

  const removeGuestInterviewer = (email: string) => {
    setGuestInterviewers(prev => prev.filter(e => e !== email));
  };

  // Utility functions for availability display
  const formatCandidateAvailability = (freeSlots: any[]) => {
    if (!freeSlots || freeSlots.length === 0) return { count: 0, nextSlot: null };
    
    const today = new Date();
    const upcomingSlots = freeSlots.filter(slot => {
      const slotDate = new Date(slot.start || slot.start_time);
      return slotDate >= today;
    }).slice(0, 3);

    return {
      count: freeSlots.length,
      nextSlot: upcomingSlots[0] ? new Date(upcomingSlots[0].start || upcomingSlots[0].start_time) : null,
      upcomingSlots
    };
  };

  const formatInterviewerAvailability = (freeSlots: any) => {
    // Handle case where interviewer doesn't have candidate profile or free_slots
    if (!freeSlots || !freeSlots.free_slots || freeSlots.free_slots.length === 0) {
      return { count: 0, nextSlot: null, timezone: freeSlots?.timezone || 'UTC' };
    }

    const today = new Date();
    const upcomingSlots = freeSlots.free_slots.filter((slot: any) => {
      const slotDate = new Date(slot.start_time);
      return slotDate >= today;
    }).slice(0, 3);

    return {
      count: freeSlots.free_slots.length,
      nextSlot: upcomingSlots[0] ? new Date(upcomingSlots[0].start_time) : null,
      upcomingSlots,
      timezone: freeSlots.timezone || 'UTC'
    };
  };

  const formatTimeSlot = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


const handleScheduleInterview = async () => {
  // Input validation (no changes)
  if (!selectedJob || selectedApplicants.length === 0 || !selectedRound || 
      (selectedInterviewers.length === 0 && guestInterviewers.length === 0) || 
      selectedSlots.length === 0) {
    toast({
      title: "Missing Information",
      description: "Please fill in all required fields and select at least one interviewer",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    const schedulePromises = [];

    for (const applicantId of selectedApplicants) {
      for (const slot of selectedSlots) {
        const meetingId = Math.random().toString(36).substring(2, 15);
        const generatedMeetingLink = `https://meet.simplifyhr.com/interview/${meetingId}`;

        // =========================================================================
        // --- THE FIX: Determine the correct interview_type based on the round_type ---
        let finalInterviewType: 'video' | 'phone' | 'in_person' | 'ai_interview' = 'video'; // Default to 'video'

        if (selectedRound.interview_type === 'ai') {
          finalInterviewType = 'ai_interview';
        } else if (selectedRound.interview_type === 'human' || selectedRound.interview_type === 'ai_human') {
          // Both 'human' and 'ai_human' rounds will be conducted via video call.
          finalInterviewType = 'video';
        }
        // You could add more logic here for 'phone' or 'in_person' if needed.
        // =========================================================================

        const params = {
          p_job_application_id: applicantId,
          p_interview_round_id: selectedRound.id,
          p_assigned_interviewers: selectedInterviewers,
          p_external_interviewers: guestInterviewers,
          // We now pass the CORRECT, mapped enum value
          p_interview_type: finalInterviewType,
          p_scheduled_at: slot.start.toISOString(),
          p_duration_minutes: selectedRound.duration_minutes,
          p_meeting_urls: { primary: generatedMeetingLink },
          p_interview_title: meetingDetails.title || `${selectedRound.name} for ${selectedJob.title}`,
          p_interview_notes: `${meetingDetails.description}\n\nNotes: ${meetingDetails.notes}`
        };

        console.log('Calling "schedule_interview" RPC with corrected params:', params);
        
        schedulePromises.push(
          supabase.rpc('schedule_interview', params)
        );
      }
    }

    const results = await Promise.all(schedulePromises);
    
    const failedSchedules = results.filter(result => result.error);
    if (failedSchedules.length > 0) {
      console.error('Some interviews failed to schedule:', failedSchedules.map(f => f.error));
      throw new Error(`Failed to schedule ${failedSchedules.length} interview(s). ${failedSchedules[0].error.message}`);
    }

    const totalInterviews = selectedApplicants.length * selectedSlots.length;
    toast({
      title: "Success",
      description: `${totalInterviews} interview${totalInterviews > 1 ? 's' : ''} scheduled successfully`,
    });

    onScheduled?.();
    setOpen(false);
    resetForm();

  } catch (error: any) {
    console.error('Error in handleScheduleInterview:', error);
    toast({
      title: "Error Scheduling Interview",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setStep(1);
    setSelectedJob(null);
    setSelectedApplicants([]);
    setSelectedRound(null);
    setSelectedInterviewers([]);
    setSelectedSlots([]);
    setGuestInterviewers([]);
    setGuestEmail('');
    setMeetingDetails({
      title: '',
      description: '',
      location: '',
      notes: ''
    });
  };

  const canProceedToNext = () => {
    switch (step) {
      case 1: return selectedJob !== null;
      case 2: return selectedApplicants.length > 0;
      case 3: return selectedRound !== null && (selectedInterviewers.length > 0 || guestInterviewers.length > 0);
      case 4: return selectedSlots.length > 0;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="job-search">Search Jobs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="job-search"
                  placeholder="Search by job title or company..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <Card
                    key={job.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedJob?.id === job.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{job.title}</h3>
                          <p className="text-xs text-muted-foreground truncate mt-1">{job.company_name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              📝 Active
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              🎯 Hiring
                            </Badge>
                          </div>
                        </div>
                        {selectedJob?.id === job.id && (
                          <div className="ml-2">
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredJobs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {loadingJobs ? "Loading jobs..." : "No jobs found."}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Applicants</Label>
              <p className="text-sm text-muted-foreground">
                Choose one or more applicants for {selectedJob?.title}
              </p>
            </div>
            <ScrollArea className="h-72">
              <div className="space-y-3">
                {loadingApplicants ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading applicants...
                  </div>
                ) : applicants.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="text-muted-foreground">
                      No applicants found for this job.
                    </div>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          // Create a simple test application
                          const { error } = await supabase
                            .from('job_applications')
                            .insert({
                              job_id: selectedJob?.id,
                              candidate_id: 'test-candidate-1', // This would normally be a real candidate ID
                              status: 'interview',
                              applied_at: new Date().toISOString()
                            });

                          if (error) {
                            console.error('Error creating test application:', error);
                            toast({
                              title: "Error",
                              description: "Could not create test data. Check console for details.",
                              variant: "destructive",
                            });
                          } else {
                            toast({
                              title: "Success",
                              description: "Test application created. Refresh to see it.",
                            });
                            fetchApplicants(selectedJob?.id || '');
                          }
                        } catch (error) {
                          console.error('Error:', error);
                        }
                      }}
                    >
                      Create Test Application
                    </Button>
                  </div>
                ) : (
                  applicants.map((applicant) => {
                    const availability = formatCandidateAvailability(applicant.candidates?.free_slots || []);
                    
                    return (
                      <Card key={applicant.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedApplicants.includes(applicant.id)}
                            onCheckedChange={() => handleApplicantToggle(applicant.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm truncate">
                                  {applicant.candidates?.first_name || 'Unknown'} {applicant.candidates?.last_name || 'Candidate'}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {applicant.candidates?.email || 'No email'}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {applicant.status}
                                  </Badge>
                                  <Badge 
                                    variant={availability.count > 0 ? "secondary" : "destructive"} 
                                    className="text-xs"
                                  >
                                    <Clock className="w-3 h-3 mr-1" />
                                    {availability.count > 0 ? `${availability.count} slots` : 'No slots'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {availability.count > 0 ? (
                                <>
                                  <p>📅 Next: {availability.nextSlot ? formatTimeSlot(availability.nextSlot) : 'No upcoming slots'}</p>
                                  <p>🕐 {availability.count} available slot{availability.count > 1 ? 's' : ''}</p>
                                </>
                              ) : (
                                <>
                                  <p>📅 No availability set</p>
                                  <p>🕐 Please contact candidate</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Interview Round</Label>
              {interviewRounds.length === 0 ? (
                <div className="text-center py-4 space-y-4">
                  <div className="text-muted-foreground">
                    No interview rounds found for this job.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        if (!selectedJob) return;
                        
                        console.log('Creating default interview rounds for job:', selectedJob.id);
                        
                        const { data, error } = await supabase
                          .rpc('create_default_interview_rounds', { job_uuid: selectedJob.id });

                        if (error) throw error;

                        console.log('Created interview rounds:', data);
                        
                        toast({
                          title: "Success",
                          description: `Created ${data?.length || 0} interview rounds!`,
                        });
                        
                        await fetchInterviewRounds(selectedJob.id);
                      } catch (error: any) {
                        console.error('Error creating interview rounds:', error);
                        toast({
                          title: "Error",
                          description: `Could not create interview rounds: ${error.message}`,
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Create Interview Rounds
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedRound?.id}
                  onValueChange={(value) => {
                    const round = interviewRounds.find(r => r.id === value);
                    setSelectedRound(round || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview round" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewRounds.map((round) => (
                      <SelectItem key={round.id} value={round.id}>
                        {round.name} ({round.duration_minutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label>Select Interviewers</Label>
              {interviewers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No interviewers available. Please ensure there are users with interviewer roles.
                </div>
              ) : (
                <ScrollArea className="h-56">
                  <div className="space-y-3">
                    {interviewers.map((interviewer) => {
                      const availability = formatInterviewerAvailability(interviewer.free_slots);
                      
                      return (
                        <Card key={interviewer.id} className="p-3 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={selectedInterviewers.includes(interviewer.interviewer_id)}
                              onCheckedChange={() => handleInterviewerToggle(interviewer)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm truncate">
                                    {interviewer.first_name} {interviewer.last_name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground truncate mt-1">
                                    {interviewer.email}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="default" className="text-xs">
                                      <Users className="w-3 h-3 mr-1" />
                                      Interviewer
                                    </Badge>
                                    <Badge 
                                      variant={availability.count > 0 ? "secondary" : "destructive"} 
                                      className="text-xs"
                                    >
                                      <Clock className="w-3 h-3 mr-1" />
                                      {availability.count > 0 ? `${availability.count} slots` : 'No slots'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                {availability.count > 0 ? (
                                  <>
                                    <p>📅 Next: {availability.nextSlot ? formatTimeSlot(availability.nextSlot) : 'No upcoming slots'}</p>
                                    <p>🕐 {availability.timezone} • {availability.count} slot{availability.count > 1 ? 's' : ''}</p>
                                  </>
                                ) : (
                                  <>
                                    <p>📅 No availability set</p>
                                    <p>🕐 {availability.timezone} timezone</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div>
              <Label>Guest Interviewers (Optional)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Add external interviewers by email
              </p>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Enter email address"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addGuestInterviewer()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addGuestInterviewer}
                  disabled={!guestEmail.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {guestInterviewers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {guestInterviewers.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button
                        onClick={() => removeGuestInterviewer(email)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        const selectedApplicantData = applicants.filter(app => 
          selectedApplicants.includes(app.id)
        );
        // const selectedInterviewerData = interviewers.filter(int => 
        //   selectedInterviewers.includes(int.id)
        // );
          const selectedInterviewerData = interviewers;

  // ▼▼▼ THIS IS THE FIX ▼▼▼
  if (loadingCalendarData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[450px]">
        <p>Finding common availability...</p>
      </div>
    );
  }

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Available Time Slots</h3>
              <MergedCalendarView
                candidates={selectedApplicantData}
                interviewers={selectedInterviewerData}
                duration={selectedRound?.duration_minutes || 60}
                onSlotsSelected={setSelectedSlots}
              />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Meeting Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meeting-title">Meeting Title</Label>
                    <Input
                      id="meeting-title"
                      placeholder="Enter meeting title"
                      value={meetingDetails.title}
                      onChange={(e) => setMeetingDetails(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Office address or 'Remote'"
                      value={meetingDetails.location}
                      onChange={(e) => setMeetingDetails(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Interview Agenda</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the interview agenda and topics to cover"
                      value={meetingDetails.description}
                      onChange={(e) => setMeetingDetails(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions or notes for the interview"
                      value={meetingDetails.notes}
                      onChange={(e) => setMeetingDetails(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Meeting Information</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Meeting link will be generated automatically and sent to all participants.
                </p>
                {selectedSlots.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-blue-700">Selected Slots:</p>
                    {selectedSlots.map((slot, index) => (
                      <p key={index} className="text-sm text-blue-600">
                        {slot.start.toLocaleDateString()} at {slot.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {slot.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Schedule Interview</DialogTitle>
          <DialogDescription className="text-base">
            Step {step} of 4: {
              step === 1 ? 'Select Job' :
              step === 2 ? 'Choose Applicants' :
              step === 3 ? 'Select Round & Interviewers' :
              'Calendar & Meeting Details'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 h-3 rounded-full ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="min-h-[450px]">
          {renderStepContent()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            <div className="space-x-2">
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceedToNext()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleScheduleInterview}
                  disabled={loading || !canProceedToNext()}
                >
                  {loading ? 'Scheduling...' : 'Schedule Interview'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewSchedulingModal;
