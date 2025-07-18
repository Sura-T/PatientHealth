import React, { useState } from 'react';
import Header from '@/components/Header';
import DashboardContent from '@/components/layout/DashboardContent';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { patients as initialPatients, patientVitals } from '@/utils';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0].id);
  
  const selectedPatient = patients.find(patient => patient.id === selectedPatientId) || patients[0];
  const selectedVitals = patientVitals[selectedPatientId] || patientVitals[patients[0].id];
  
  const handlePatientUpdate = (updatedPatient: typeof patients[0]) => {
    setPatients(prevPatients => 
      prevPatients.map(patient => 
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    );
  };
  
  const handleAddPatient = (newPatient: typeof patients[0]) => {
    setPatients(prevPatients => [...prevPatients, newPatient]);
    setSelectedPatientId(newPatient.id);
    
    // Create default vitals for the new patient
    // In a real app, this would be handled by the backend
    patientVitals[newPatient.id] = {...patientVitals[patients[0].id]};
    
    toast({
      title: "New patient registered",
      description: `${newPatient.name} has been added to the system.`
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-6 md:px-8 flex flex-col">
        <DashboardContent
          patients={patients}
          selectedPatientId={selectedPatientId}
          selectedPatient={selectedPatient}
          selectedVitals={selectedVitals}
          onSelectPatient={setSelectedPatientId}
          onUpdatePatient={handlePatientUpdate}
          onAddPatient={handleAddPatient}
        />
      </main>
      <DashboardFooter />
    </div>
  );
};

export default Index;
