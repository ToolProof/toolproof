import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
    userEmail: '',
    isApproved: true,
    showSideBar: true,
};

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        setUserEmail: (state, action: PayloadAction<string>) => {
            state.userEmail = action.payload;
            // The only way to not be approved is to be signed in with a non-approved email
            state.isApproved = action.payload === 'renestavnes@hotmail.com' || action.payload === '';
        },
        setShowSideBar: (state, action: PayloadAction<boolean>) => {
            state.showSideBar = action.payload;
        },
    },
});

export const { setUserEmail, setShowSideBar } = configSlice.actions;
export default configSlice.reducer;
