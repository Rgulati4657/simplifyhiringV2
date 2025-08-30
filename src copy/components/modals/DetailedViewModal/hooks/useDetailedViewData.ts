// import { useState, useEffect, useCallback } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import { DataType } from '../types';
// import { getSearchFields, applyStatusFilter } from '../utils';
// import { useAuth } from '@/hooks/useAuth';

// export const useDetailedViewData = (
//   type: DataType,
//   open: boolean,
//   initialData?: any[],
//   defaultFilter?: string
// ) => {
//   const { profile } = useAuth(); // We still need this to know a user is logged in
//   const [data, setData] = useState<any[]>([]);
//   const [filteredData, setFilteredData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterValue, setFilterValue] = useState('all');
//   const { toast } = useToast();

//   useEffect(() => {
//     if (open) {
//       setFilterValue(defaultFilter || 'all');
//       setSearchTerm('');
//     }
//   }, [open, defaultFilter]);

//   // buildQuery remains for your other working modals (Admin, etc.)
//   const buildQuery = useCallback(() => {
//     switch (type) {
//         case 'users':
//             return supabase.from('profiles').select('*, created_at').order('created_at', { ascending: false });
//         case 'applications':
//             return supabase.from('job_applications').select(`id, status, screening_score, applied_at, jobs!inner(title, companies!inner(name)), candidates!inner(profiles!inner(first_name, last_name, email))`).order('applied_at', { ascending: false });
//         case 'scheduledInterviews':
//              return supabase.from('interview_schedules').select(`id, scheduled_at, status, interview_type, job_applications!inner (jobs!inner (title, companies!inner (name)), candidates!inner (profiles!inner (first_name, last_name, email)))`).order('scheduled_at', { ascending: false });
//       default:
//         return null;
//     }
//   }, [type]);

//   const fetchData = useCallback(async () => {
//     if (!open || !profile?.id) return;
//     if (initialData) {
//       setData([[...initialData]]);
//       return;
//     }

//     setLoading(true);
//     try {
//       let resultData: any[] = [];
//   const typesThatNeedJobs = ['activeJobs', 'jobs'];
//       const typesThatNeedApplications = ['applications', 'shortlisted', 'monthlyHires'];

//       // 2. The final, intelligent IF/ELSE IF structure
//       if (typesThatNeedJobs.includes(type)) {
//         // It's a job-related modal, call the job function.
//         const { data, error } = await supabase.rpc('get_jobs_for_role', {
//           user_role: profile.role 
//         });
//         if (error) throw error;
//         resultData = data || [];

//       } else if (typesThatNeedApplications.includes(type)) {
//         // It's an application-related modal, call our NEW application function.
//         const { data, error } = await supabase.rpc('get_applications_for_role', {
//           user_role: profile.role
//         });
//         if (error) throw error;
//         resultData = data || [];

//       } else if (type === 'my-interviews') {
//         // --- THIS IS THE NEW, SIMPLE LOGIC ---
//         // Call the database function directly. No complex joins, no RLS issues.
//         const { data, error } = await supabase.rpc('get_my_scheduled_interviews');
//         if (error) throw error;
//         resultData = data;
        
//       } else {
//         // Fallback for all other modals, leaving them untouched.
//         const query = buildQuery();
//         if (query) {
//             const { data, error } = await query;
//             if (error) throw error;
//             resultData = data || [];
//         }
//       }
      
//       setData(resultData);

//     } catch (error: any) {
//       toast({ title: "Error", description: error.message, variant: "destructive" });
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [open, initialData, profile, type,  buildQuery, toast]);

//   const filterData = useCallback(() => {
//     // ... no changes needed in this function ...
//     const sourceData = data || [];
//     let filtered = sourceData;
//     if (searchTerm) {
//       filtered = filtered.filter((item) => {
//         const searchFields = getSearchFields(item, type);
//         return searchFields.some(field => field?.toString().toLowerCase().includes(searchTerm.toLowerCase()));
//       });
//     }
//     filtered = filtered.filter((item) => applyStatusFilter(item, type, filterValue));
//     setFilteredData(filtered);
//   }, [data, searchTerm, filterValue, type]);

//   useEffect(() => {
//     if (open) fetchData();
//   }, [open, fetchData]);

//   useEffect(() => {
//     filterData();
//   }, [data, searchTerm, filterValue, type]);

//   return {
//     data,
//     filteredData,
//     loading,
//     searchTerm,
//     filterValue,
//     setSearchTerm,
//     setFilterValue,
//     refetchData: fetchData
//   };
// };



import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DataType } from '../types';
import { getSearchFields, applyStatusFilter } from '../utils';
import { useAuth } from '@/hooks/useAuth';

const ITEMS_PER_PAGE =6;

export const useDetailedViewData = (
  type: DataType,
  open: boolean,
  defaultFilter?: string
) => {
  const { profile } = useAuth();
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    // This check now correctly uses the up-to-date profile.
    if (!open || !profile?.id) {
      // Safety net to ensure loading is always stopped.
      setLoading(false);
      return;
    }

    setLoading(true);
    setSearchTerm('');
    setCurrentPage(1);
    setFilterValue(defaultFilter || 'all');

    try {
      let promise;
      const typesThatNeedJobs = ['activeJobs', 'jobs'];
      const typesThatNeedApplications = ['applications', 'shortlisted', 'monthlyHires'];

      if (typesThatNeedJobs.includes(type)) {
        promise = supabase.rpc('get_jobs_for_role', { user_role: profile.role });
      } else if (typesThatNeedApplications.includes(type)) {
        promise = supabase.rpc('get_applications_for_role', { user_role: profile.role });

      }else if (type === 'scheduledInterviews') {
      promise = supabase.from('interview_schedules').select(`
          id, scheduled_at, status, interview_type,
          job_applications!inner (
              jobs!inner (title, companies!inner (name)),
              candidates!inner (profiles!inner (first_name, last_name, email))
          )
      `).order('scheduled_at', { ascending: false });
      }       else if (type === 'users') {
        promise = supabase.from('profiles').select('*, created_at').order('created_at', { ascending: false });
      } else {
        promise = Promise.resolve({ data: [], error: null });
      }

      const { data, error } = await promise;

       console.log('Fetched data from DB for type:', type, data);
       
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setRawData([]);
      } else {
        setRawData(Array.isArray(data) ? data : []);
      }
    } catch (error: any) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }, [open, type, defaultFilter, toast, profile]); // <-- THE CRITICAL FIX: `profile` is now a dependency.

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // This is the full list of data after all filters are applied.
  const filteredData = useMemo(() => {
    let processedData = Array.isArray(rawData) ? [...rawData] : [];
    
    // Use your existing utility function to apply status filters
    processedData = processedData.filter(item => applyStatusFilter(item, type, filterValue));

    // Apply search term on top of the status-filtered list
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      processedData = processedData.filter(item => {
        const searchFields = getSearchFields(item, type);
        return searchFields.some(field => field?.toString().toLowerCase().includes(lowercasedTerm));
      });
    }
    return processedData;
  }, [rawData, searchTerm, filterValue, type]);

  // This safely resets the page number when the filters change.
  useEffect(() => {
    // We check `!loading` to ensure this only runs after the initial data fetch is complete.
    if (!loading) {
      setCurrentPage(1);
    }
  }, [filterValue, searchTerm]);

  // These are the final derived values for the UI.
  const totalItemCount = filteredData.length;
  const totalPages = Math.ceil(totalItemCount / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);
  
  // This is the final, safe return object.
  return { 
    paginatedData: paginatedData || [],
    loading, 
    searchTerm, 
    setSearchTerm, 
    filterValue, 
    setFilterValue,
    currentPage: currentPage || 1,
    onPageChange: setCurrentPage,
    totalPages: totalPages || 0,
    totalRecords: totalItemCount || 0,
    refetchData: fetchData
  };
};





// paginated
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import { DataType } from '../types';
// import { getSearchFields, applyStatusFilter } from '../utils';
// import { useAuth } from '@/hooks/useAuth';


// // --- 2. DEFINE ITEMS_PER_PAGE ---
// const ITEMS_PER_PAGE = 5;


// export const useDetailedViewData = (
//   type: DataType,
//   open: boolean,
//   // initialData?: any[],
//   defaultFilter?: string
// ) => {
//   const { profile } = useAuth(); // We still need this to know a user is logged in
//   const [data, setData] = useState<any[]>([]);
//   const [filteredData, setFilteredData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterValue, setFilterValue] = useState('all');
//   const { toast } = useToast();


//     // --- 3. ADD PAGINATION STATE ---
//   const [currentPage, setCurrentPage] = useState(1);



//   useEffect(() => {
//     if (open) {
//       setFilterValue(defaultFilter || 'all');
//       setSearchTerm('');
//       setCurrentPage(1); // Reset to first page on modal open
//     }
//   }, [open, defaultFilter]);

//   // buildQuery remains for your other working modals (Admin, etc.)
//   const buildQuery = useCallback(() => {
//     switch (type) {
//         case 'users':
//             return supabase.from('profiles').select('*, created_at').order('created_at', { ascending: false });
//         case 'applications':
//             return supabase.from('job_applications').select(`id, status, screening_score, applied_at, jobs!inner(title, companies!inner(name)), candidates!inner(profiles!inner(first_name, last_name, email))`).order('applied_at', { ascending: false });
//         case 'scheduledInterviews':
//              return supabase.from('interview_schedules').select(`id, scheduled_at, status, interview_type, job_applications!inner (jobs!inner (title, companies!inner (name)), candidates!inner (profiles!inner (first_name, last_name, email)))`).order('scheduled_at', { ascending: false });
//       default:
//         return null;
//     }
//   }, [type]);

//   const fetchData = useCallback(async () => {
//     if (!open || !profile?.id) return;
//     if (initialData) {
//       // setData([[...initialData]]);
//        setData(Array.isArray(initialData) ? [...initialData] : []);
//       return;
//     }

//     setLoading(true);
//     try {
//       let resultData: any[] = [];
//   const typesThatNeedJobs = ['activeJobs', 'jobs'];
//       const typesThatNeedApplications = ['applications', 'shortlisted', 'monthlyHires'];

//       // 2. The final, intelligent IF/ELSE IF structure
//       if (typesThatNeedJobs.includes(type)) {
//         // It's a job-related modal, call the job function.
//         const { data, error } = await supabase.rpc('get_jobs_for_role', {
//           user_role: profile.role 
//         });
//         if (error) throw error;
//         resultData = data || [];

//       } else if (typesThatNeedApplications.includes(type)) {
//         // It's an application-related modal, call our NEW application function.
//         const { data, error } = await supabase.rpc('get_applications_for_role', {
//           user_role: profile.role
//         });
//         if (error) throw error;
//         resultData = data || [];

//       } else if (type === 'my-interviews') {
//         // --- THIS IS THE NEW, SIMPLE LOGIC ---
//         // Call the database function directly. No complex joins, no RLS issues.
//         const { data, error } = await supabase.rpc('get_my_scheduled_interviews');
//         if (error) throw error;
//         resultData = data;
        
//       } else {
//         // Fallback for all other modals, leaving them untouched.
//         const query = buildQuery();
//         if (query) {
//             const { data, error } = await query;
//             if (error) throw error;
//             resultData = data || [];
//         }
//       }
      
//       // setData(resultData);
//        setData(Array.isArray(resultData) ? resultData : []);

//     } catch (error: any) {
//       toast({ title: "Error", description: error.message, variant: "destructive" });
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [open, initialData, profile, type,  buildQuery, toast]);

//   const filterData = useCallback(() => {
//     // ... no changes needed in this function ...
//     const sourceData = data || [];
//     let filtered = sourceData;
//     if (searchTerm) {
//       filtered = filtered.filter((item) => {
//         const searchFields = getSearchFields(item, type);
//         return searchFields.some(field => field?.toString().toLowerCase().includes(searchTerm.toLowerCase()));
//       });
//     }
//     filtered = filtered.filter((item) => applyStatusFilter(item, type, filterValue));
//     setFilteredData(filtered);
//   }, [data, searchTerm, filterValue, type]);

//   useEffect(() => {
//     if (open) fetchData();
//   }, [open, fetchData]);

//   useEffect(() => {
//     filterData();
//   }, [data, searchTerm, filterValue, type]);
 
//   useEffect(() => {
//     // This safely resets the page to 1 ONLY when the filters change.
//     if (!loading) {
//       setCurrentPage(1);
//     }
//   }, [filterValue, searchTerm]);

//    const totalItemCount = filteredData.length;
//   const totalPages = Math.ceil(totalItemCount / ITEMS_PER_PAGE);

//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//   }, [filteredData, currentPage]);


//    return {
//     // Keep all original returns for safety
//     data,
//     filteredData: paginatedData || [], // IMPORTANT: The UI will now use this paginated list
//     loading,
//     searchTerm,
//     filterValue,
//     setSearchTerm,
//     setFilterValue,
//     refetchData: fetchData,

//     // Add the new props for pagination
//    currentPage: currentPage || 1,
//     onPageChange: setCurrentPage,
//     totalPages: totalPages || 0,
//     totalRecords: totalItemCount || 0,
//   };
// };







