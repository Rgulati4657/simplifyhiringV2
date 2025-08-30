// import { useState } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Users, Building, Briefcase, Calendar } from 'lucide-react';

// import { DetailedViewModalProps, EditModalState } from './types';
// import { useDetailedViewData } from './hooks/useDetailedViewData';
// import { FilterControls } from './components/FilterControls';
// import { LoadingState } from './components/LoadingState';
// import { TableRenderer } from './components/TableRenderer';

// // Edit modal imports
// import EditCompanyModal from '@/components/forms/EditCompanyModal';
// import EditUserModal from '@/components/forms/EditUserModal';
// import EditVendorModal from '@/components/forms/EditVendorModal';


// // --- 1. Update the Props Type ---
// export interface DetailedViewModalProps {
//   type: DataType;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   title: string;
//   onViewJob?: (id: string) => void;
//   initialData?: any[];
//   customFilterOptions?: { value: string; label: string; }[];
//   defaultFilter?: string;
// }

// const DetailedViewModal = ({ 
//   type, 
//   open, 
//   onOpenChange, 
//   title,
//   initialData,
//   onViewJob,
//   customFilterOptions,
//   defaultFilter
// }: DetailedViewModalProps) => {
//    // --- THIS IS THE TEST ---
//   // console.log("DetailedViewModal is rendering with props:", { type, open });
//   console.log(`[DetailedViewModal] Rendering. The onViewJob function is:`, onViewJob);

//   const {
//     data,
//     filteredData,
//     loading,
//     searchTerm,
//     filterValue,
//     setSearchTerm,
//     setFilterValue,
//     refetchData
//   } = useDetailedViewData(type, open, initialData, defaultFilter);

//   // Edit modal states
//   const [editUser, setEditUser] = useState<EditModalState>({ open: false, id: null });
//   const [editCompany, setEditCompany] = useState<EditModalState>({ open: false, id: null });
//   const [editVendor, setEditVendor] = useState<EditModalState>({ open: false, id: null });

//   const getModalIcon = () => {
//     switch (type) {
//       case 'users': return <Users className="w-5 h-5" />;
//       case 'companies': return <Building className="w-5 h-5" />;
//       case 'vendors': return <Users className="w-5 h-5" />;
//       case 'jobs':
//       case 'activeJobs': return <Briefcase className="w-5 h-5" />;
//       case 'applications':
//       case 'monthlyHires': return <Calendar className="w-5 h-5" />;
//       default: return null;
//     }
//   };

//   const handleEdit = (id: string, entityType: string) => {
//     switch (entityType) {
//       case 'user':
//         setEditUser({ open: true, id });
//         break;
//       case 'company':
//         setEditCompany({ open: true, id });
//         break;
//       case 'vendor':
//         setEditVendor({ open: true, id });
//         break;
//     }
//   };

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
//           <DialogHeader>
//             <DialogTitle className="flex items-center space-x-2">
//               {getModalIcon()}
//               <span>{title}</span>
//             </DialogTitle>
//             <DialogDescription>
//               Total records: {filteredData.length} {searchTerm && `(filtered from ${data.length})`}
//             </DialogDescription>
//           </DialogHeader>
          
//           <FilterControls
//             searchTerm={searchTerm}
//             filterValue={filterValue}
//             type={type}
//             onSearchChange={setSearchTerm}
//             onFilterChange={setFilterValue}
//             customFilterOptions={customFilterOptions}
//           />

//           <div className="border rounded-lg overflow-auto max-h-96">
//             <LoadingState loading={loading} hasData={filteredData.length > 0}>
//               <TableRenderer 
//                 type={type} 
//                 data={filteredData} 
//                 onEdit={handleEdit}
//                 onView={onViewJob} // Pass the onViewJob prop to TableRenderer
//               />
//             </LoadingState>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Modals */}
//       <EditUserModal
//         userId={editUser.id}
//         open={editUser.open}
//         onOpenChange={(open) => setEditUser({ ...editUser, open })}
//         onUserUpdated={refetchData}
//       />
      
//       <EditCompanyModal
//         companyId={editCompany.id}
//         open={editCompany.open}
//         onOpenChange={(open) => setEditCompany({ ...editCompany, open })}
//         onCompanyUpdated={refetchData}
//       />
      
//       <EditVendorModal
//         vendorId={editVendor.id}
//         open={editVendor.open}
//         onOpenChange={(open) => setEditVendor({ ...editVendor, open })}
//         onVendorUpdated={refetchData}
//       />
//     </>
//   );
// };

// export default DetailedViewModal;


import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Building, Briefcase, Calendar } from 'lucide-react';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { DetailedViewModalProps, EditModalState } from './types';
import { useDetailedViewData } from './hooks/useDetailedViewData';
import { FilterControls } from './components/FilterControls';
import { LoadingState } from './components/LoadingState';
import { TableRenderer } from './components/TableRenderer';

// Edit modal imports
import EditCompanyModal from '@/components/forms/EditCompanyModal';
import EditUserModal from '@/components/forms/EditUserModal';
import EditVendorModal from '@/components/forms/EditVendorModal';
import {EditJobModal} from '@/components/forms/EditJobModal';


// --- 1. Update the Props Type ---
export interface DetailedViewModalProps {
  type: DataType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onViewJob?: (id: string) => void;
  initialData?: any[];
  customFilterOptions?: { value: string; label: string; }[];
  defaultFilter?: string;
}

const DetailedViewModal = ({ 
  type, 
  open, 
  onOpenChange, 
  title,
  // initialData,
  onViewJob,
  customFilterOptions,
  defaultFilter
}: DetailedViewModalProps) => {
   // --- THIS IS THE TEST ---
  // console.log("DetailedViewModal is rendering with props:", { type, open });
  console.log(`[DetailedViewModal] Rendering. The onViewJob function is:`, onViewJob);

  const {
    paginatedData, // Use this new variable for the table
    loading,
    searchTerm,
    filterValue,
    setSearchTerm,
    setFilterValue,
    // Get the new pagination props from the hook
    currentPage,
    totalPages,
    onPageChange,
    totalRecords,
    refetchData 
  } = useDetailedViewData(type, open, defaultFilter);

  // Edit modal states
  const [editUser, setEditUser] = useState<EditModalState>({ open: false, id: null });
  const [editCompany, setEditCompany] = useState<EditModalState>({ open: false, id: null });
  const [editVendor, setEditVendor] = useState<EditModalState>({ open: false, id: null });
   const [editJob, setEditJob] = useState<EditModalState>({ open: false, id: null }); 

  const getModalIcon = () => {
    switch (type) {
      case 'users': return <Users className="w-5 h-5" />;
      case 'companies': return <Building className="w-5 h-5" />;
      case 'vendors': return <Users className="w-5 h-5" />;
      case 'jobs':
      case 'activeJobs': return <Briefcase className="w-5 h-5" />;
      case 'applications':
      case 'monthlyHires': return <Calendar className="w-5 h-5" />;
      default: return null;
    }
  };

  const handleEdit = (id: string, entityType: string) => {
    switch (entityType) {
      case 'user':
        setEditUser({ open: true, id });
        break;
      case 'company':
        setEditCompany({ open: true, id });
        break;
      case 'vendor':
        setEditVendor({ open: true, id });
        break;
      case 'job': // <-- ADD THIS CASE
        setEditJob({ open: true, id });
        break;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-w-6xl flex flex-col max-h-[90vh]"> {/* Use flexbox for layout */}
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getModalIcon()}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {/* Use the new totalRecords count from the hook */}
            Total records: {totalRecords || 0}
          </DialogDescription>
        </DialogHeader>
        
        <FilterControls
          searchTerm={searchTerm}
          filterValue={filterValue}
          type={type}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterValue}
          customFilterOptions={customFilterOptions}
        />

        {/* Use flex-grow to make the table area scrollable */}
        <div className="border rounded-lg overflow-auto flex-grow">
          {/* Pass the new paginatedData to the LoadingState and TableRenderer */}
          <LoadingState loading={loading} hasData={(paginatedData || []).length > 0}>
            <TableRenderer 
              type={type} 
              data={paginatedData || []} 
              onEdit={handleEdit}
              onView={onViewJob}
            />
          </LoadingState>
        </div>
        
        {/* Add the PaginationControls component at the bottom */}
        <PaginationControls
            currentPage={currentPage || 1}
            totalPages={totalPages || 0}
            onPageChange={onPageChange || (() => {})}
        />
      </DialogContent>
    </Dialog>

      {/* Edit Modals */}
      <EditUserModal
        userId={editUser.id}
        open={editUser.open}
        onOpenChange={(open) => setEditUser({ ...editUser, open })}
        onUserUpdated={refetchData}
      />
      
      <EditCompanyModal
        companyId={editCompany.id}
        open={editCompany.open}
        onOpenChange={(open) => setEditCompany({ ...editCompany, open })}
        onCompanyUpdated={refetchData}
      />
      
      <EditVendorModal
        vendorId={editVendor.id}
        open={editVendor.open}
        onOpenChange={(open) => setEditVendor({ ...editVendor, open })}
        onVendorUpdated={refetchData}
      />

      <EditJobModal
        jobId={editJob.id}
        open={editJob.open}
        onOpenChange={(open) => setEditJob({ ...editJob, open })}
        onJobUpdated={refetchData}
      />

    </>
  );
};

export default DetailedViewModal;