import { apiService } from './api';
import { GET_LOGIN_USERS, GET_SUBORDINATES } from '../utils/constants';
import { User } from '../types';

export interface RealTimeFilter {
    users?: string[];
    projects?: string[];
    tasks?: string[];
}

export interface RealTimeUserRow {
    user: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    project?: string;
    task?: string;
    app?: string;
    isOnline: boolean;
}

export interface RealTimeResponse {
    totalMember: number;
    activeMember: number;
    totalNonProductiveMember: number;
    onlineUsers: RealTimeUserRow[];
}

export const realtimeService = {
    async getTeamMembers(userId: string): Promise<User[]> {
        // Reuse the same pattern as screenshotService.getSubordinates
        const response = await apiService.get<any>(`${GET_SUBORDINATES}/${userId}`);
        const users = (response?.data || []) as User[];
        return users;
    },

    async getRealTime(filter: RealTimeFilter): Promise<RealTimeResponse | null> {
        const response = await apiService.post<{ data: RealTimeResponse[] }>(
            GET_LOGIN_USERS,
            filter
        );
        return (response?.data && response.data[0]) || null;
    },
};


