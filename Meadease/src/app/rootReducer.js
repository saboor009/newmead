import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import { authApi } from '../features/api/authApi';
import docAuthReducer from '../features/docAuthSlice';
import { docAuthApi } from '../features/api/docAuthApi';
import { appointmentApi } from '../features/api/appointmentApi';
import appointmentReducer from "../features/appointmentSlice"



export const rootReducer = combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
    [docAuthApi.reducerPath]: docAuthApi.reducer,
    docAuth: docAuthReducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer,
    appointment: appointmentReducer,
})

export default rootReducer;