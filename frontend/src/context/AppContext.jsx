import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL; // VITE_BACKEND_URL = "http://localhost:5000"

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userTasks, setUserTasks] = useState([]); // Stores the current user's tasks
    const [userList, setUserList] = useState([]); // Stores user list from backend for admin to use
    const [isAdmin, setIsAdmin] = useState(false);
    const [allTasks, setAllTasks] = useState([]);
    
    const value = {navigate, user, setUser, isAdmin, setIsAdmin, userList, setUserList, userTasks, setUserTasks, axios, allTasks};

    const fetchUser = async ()=>{
        try {
            const res = await axios.get('/api/users/is-auth');
            if (res.data.success){
                setUser(res.data.user);
                setIsAdmin(res.data.user.role === 'admin');
                // console.log("Success fetch");
                // toast.success("Logged in"); // being called twice and development because of StrictMode 
            } else {
                setUser(null);
                setIsAdmin(false);
                // toast.error(res.data.message);
            }
        } catch (error) {
            setUser(null);
            setIsAdmin(false);
            toast.error(error.message);
            // console.log(error.message);
        }
    }

    const fetchTasks = async ()=>{ // fetch tasks for the current user. 
        try {
            const res = await axios.get('/api/tasks/get');
            if (res.data.success){
                setUserTasks(res.data.tasks);
                console.log("Tasks fetched", res.data.tasks);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const fetchUserList = async ()=>{
        try {
            const res = await axios.get('/api/users/list');
            if (res.data.success){
                setUserList(res.data.users);
                // console.log(res.data.users);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message);
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

    // Because all fetch functions are async, it sets states (e.g user and isAdmin) after the effect runs
    useEffect(()=>{
        fetchUser()
    },[])

    useEffect(() => {
        // Fetch functions
        if (user && !isAdmin){
            fetchTasks();
        }
        if (user && isAdmin){
            fetchUserList();
            // fetchAllTasks();
        }
    },[user, isAdmin]);
    

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext);
}