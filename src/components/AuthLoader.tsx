"use client"

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { clearUser, setUser, setLoading } from "@/redux/slices/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";

const AuthLoader = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        let cancelled = false

        const fetchUser = async () => {
            dispatch(setLoading(true))
            try {
                const result = await apiClient.get(ENDPOINTS.ME)
                if (!cancelled) dispatch(setUser(result.data.data))
            } catch (error) {
                if (!cancelled) {
                    if (axios.isAxiosError(error) && error.response?.status === 401) {
                        dispatch(clearUser())
                    } else {
                        dispatch(setLoading(false))
                    }
                }
            }
        }

        fetchUser()
        return () => { cancelled = true }
    }, [dispatch])

    return null;
}

export default AuthLoader;