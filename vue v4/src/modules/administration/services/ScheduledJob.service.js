import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getJobs = () => {
    return AxiosService.get(`${BASE_URL}/scheduler-jobs`);
};

export const getJobLogs = (jobName, params) => {
    return AxiosService.get(`${BASE_URL}/scheduler-jobs/${jobName}/logs`, {
        params
    });
};

export const updateJobFrequency = (jobName, payload) => {
    return AxiosService.put(`${BASE_URL}/scheduler-jobs/${jobName}`, payload);
};
