/**
 * Compliance Calendar Component
 * 
 * Track and manage compliance deadlines including:
 * - Tax filings
 * - Regulatory submissions
 * - Compliance deadlines
 * 
 * Features:
 * - Interactive calendar
 * - List view
 * - Event management
 * - Deadline tracking
 * - Dark mode support
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { getAllTasks, createTask } from '../../firebase/taskService';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

// Component for the list view
const ListView = React.memo(({ events, handleEventClick }) => {
  const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="space-y-4">
      {sortedEvents.map((event) => (
        <div
          key={event.id}
          onClick={() => handleEventClick({ event })}
          className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {event.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(event.start), 'PPP')}
                {event.end && ` - ${format(new Date(event.end), 'PPP')}`}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                event.priority === 'high'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : event.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}
            >
              {event.priority ? `${event.priority.charAt(0).toUpperCase()}${event.priority.slice(1)} Priority` : 'No Priority'}
            </span>
          </div>
          
          {event.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {event.description}
            </p>
          )}
          <div className="mt-3 flex items-center space-x-4 text-sm">
            {event.status && (
              <span className="text-gray-500 dark:text-gray-400">
                Status: {event.status}
              </span>
            )}
            {event.category && (
              <span className="text-gray-500 dark:text-gray-400">
                Category: {event.category}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

// Component for the calendar view
const CalendarView = React.memo(({ events, handleDateClick, handleEventClick }) => {
  return (
    <div className="calendar-container">
      <style>
        {`
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
            font-weight: 600;
          }
          
          .fc .fc-daygrid-day.fc-day-today {
            background-color: #F3F4F6;
          }
          
          .dark .fc .fc-daygrid-day.fc-day-today {
            background-color: #374151;
          }
          
          .fc .fc-daygrid-day-number {
            padding: 0.5rem;
            color: #374151;
          }
          
          .dark .fc .fc-daygrid-day-number {
            color: #F3F4F6;
          }
        `}
      </style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        height="auto"
      />
    </div>
  );
});

// View selector component
const ViewSelector = React.memo(({ view, setView }) => (
  <div className="hidden sm:flex space-x-4">
    <button
      onClick={() => setView('calendar')}
      className={`px-4 py-2 rounded-md flex items-center space-x-2 focus:outline-none ${
        view === 'calendar'
          ? 'bg-indigo-600 text-white'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>Calendar View</span>
    </button>
    <button
      onClick={() => setView('list')}
      className={`px-4 py-2 rounded-md flex items-center space-x-2 focus:outline-none ${
        view === 'list'
          ? 'bg-indigo-600 text-white'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
      <span>List View</span>
    </button>
  </div>
));

// Main component
const ComplianceCalendar = ({ setCurrentPage }) => {
  const [view, setView] = useState('calendar');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, clientData } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('Fetching tasks...');
        console.log('User:', user?.email);
        console.log('Client Data:', clientData);

        // Check if user is approved
        if (!clientData?.approved && clientData?.role !== 'admin') {
          throw new Error('Your account is pending approval. Please contact the administrator.');
        }

        const tasks = await getAllTasks();
        console.log('Tasks fetched:', tasks);
        setEvents(tasks);

        // If no tasks exist and user is admin, create a test task
        if ((!tasks || tasks.length === 0) && clientData?.role === 'admin') {
          console.log('No tasks found, creating a test task...');
          const testTask = {
            title: 'Test Task',
            start: new Date().toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
            status: 'Not Started',
            priority: 'medium',
            compliancePeriod: 'FY 2023-24',
            areaOfCompliance: 'Test Area',
            taskDescription: 'This is a test task',
            remarks: '',
            supportingDocuments: [],
            createdBy: user.uid,
            clientId: user.uid
          };

          const createdTask = await createTask(testTask);
          console.log('Test task created:', createdTask);
          setEvents([createdTask]);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && clientData) {
      console.log('User authenticated and client data available, fetching tasks...');
      fetchTasks();
    } else if (!user) {
      console.log('No user authenticated');
      setError('Please log in to view tasks');
      setLoading(false);
    } else if (!clientData) {
      console.log('No client data available');
      setError('Unable to load user data. Please try again.');
      setLoading(false);
    }

    if (setCurrentPage) {
      setCurrentPage('compliance-calendar');
    }
  }, [setCurrentPage, user, clientData]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </PageWrapper>
    );
  }

  const handleDateClick = async (arg) => {
    // Check if user is approved or admin
    if (!clientData?.approved && clientData?.role !== 'admin') {
      toast.error('Your account is pending approval');
      return;
    }

    const title = prompt('Enter task title:');
    if (title) {
      try {
        const newTask = {
          title,
          start: arg.dateStr,
          end: arg.dateStr,
          status: 'Not Started',
          priority: 'medium',
          compliancePeriod: 'FY 2023-24',
          areaOfCompliance: '',
          taskDescription: '',
          remarks: '',
          supportingDocuments: [],
          createdBy: user.uid,
          clientId: user.uid
        };

        const createdTask = await createTask(newTask);
        setEvents(prev => [...prev, createdTask]);
        toast.success('Task created successfully');
      } catch (error) {
        console.error('Error creating task:', error);
        toast.error('Failed to create task');
      }
    }
  };

  const handleEventClick = (info) => {
    navigate(`/task/${info.event.id}`);
  };

  return (
    <PageWrapper>
      <div className="p-4">
        <ViewSelector view={view} setView={setView} />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {view === 'calendar' ? (
            <CalendarView
              events={events}
              handleDateClick={handleDateClick}
              handleEventClick={handleEventClick}
            />
          ) : (
            <ListView
              events={events}
              handleEventClick={handleEventClick}
            />
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ComplianceCalendar;
