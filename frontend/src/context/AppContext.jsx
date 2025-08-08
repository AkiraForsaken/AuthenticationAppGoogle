import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Better backend URL configuration
const getBackendURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return import.meta.env.VITE_BACKEND_URL || 'https://authentication-app-backend-2ra3.onrender.com';
  }
  return 'http://localhost:5000';
};

// Configure axios defaults
axios.defaults.baseURL = getBackendURL();
axios.defaults.withCredentials = true; // This is crucial for sending cookies
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.baseURL + config.url);
    console.log('With credentials:', config.withCredentials);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Request failed:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userTasks, setUserTasks] = useState([]); // Stores the current user's tasks
    const [userList, setUserList] = useState([]); // Stores user list from backend for admin to use
    const [isAdmin, setIsAdmin] = useState(false);
    const [darkMode, setDarkMode] = useState(()=> {
        const stored = localStorage.getItem('darkMode');
        return stored ? JSON.parse(stored) : false;
    });
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUser = async ()=>{
        try {
            console.log('Fetching user authentication...');
            const res = await axios.get('/api/users/is-auth');
            console.log('Auth response:', res.data);
            
            if (res.data.success){
                setUser(res.data.user);
                setIsAdmin(res.data.user.role === 'admin');
                console.log('User authenticated:', res.data.user.name);
            } else {
                console.log('No authenticated user found');
                setUser(null);
                setIsAdmin(false);
            }
        } catch (error) {
            console.error('Auth fetch error:', error.response?.status, error.response?.data);
            setUser(null);
            setIsAdmin(false);
            // Don't show toast for auth errors as they're expected when not logged in
        }
    }

    const fetchTasks = async ()=>{ // fetch tasks for the current user. 
        try {
            const res = await axios.get('/api/tasks/get');
            if (res.data.success){
                setUserTasks(res.data.tasks);
                // console.log("Tasks fetched", res.data.tasks);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const fetchUserList = async ()=>{
        try {
            console.log('Fetching user list...');
            const res = await axios.get('/api/users/list');
            if (res.data.success){
                setUserList(res.data.users);
                console.log('User list fetched successfully:', res.data.users.length, 'users');
            } else {
                console.error('Failed to fetch user list:', res.data.message);
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error('Error fetching user list:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch user list');
        }
    }

    // Deprecated: No longer need to fetch all tasks
    /* const fetchAllTasks = async ()=>{
        try {
            const res = await axios.get('/api/tasks/get-all');
            if (res.data.success) {
                setAllTasks(res.data.tasks);
            } else {
                console.log(res.data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    } */

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications/get');
            if (res.data.success){
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            toast.error('Failed to fetch notifications:', error);
        }
    }

    // Because all fetch functions are async, it sets states (e.g user and isAdmin) after the effect runs
    useEffect(()=>{
        fetchUser()
    },[]);

    useEffect(() => {
        // Fetch functions
        if (user && !isAdmin){
            fetchTasks();
            fetchNotifications();
        }
        if (user && isAdmin){
            fetchUserList();
            // fetchAllTasks();
        }
    },[user, isAdmin]);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const value = {navigate, user, setUser, isAdmin, setIsAdmin, userList, setUserList, userTasks, setUserTasks, axios, darkMode, setDarkMode, notifications, unreadCount, fetchNotifications};

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext);
}