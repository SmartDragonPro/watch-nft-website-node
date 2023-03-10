import {LOGIN_SUCCESS, 
        LOGIN_FAILURE, 
        LOGIN_REQUEST,
        LOGOUT } from '../../constants/action.constant';
import AuthService from '../../services/AuthService';
import Api from '../../services/Api';
import history from '../../helpers/history';

const authService = new AuthService(new Api());
const request = (user) => { return { type: LOGIN_REQUEST, user } };
const success = (user) => { return { type: LOGIN_SUCCESS, user } };
const failure = (error) => { return { type: LOGIN_FAILURE, error } };

export const login = (email, password) => {
    return async (dispatch) => { 
        try {
            dispatch(request(email));
            const response = await authService.login(email, password);
            if(response && response.token) {
                localStorage.setItem('user', JSON.stringify(response));
            }
            dispatch(success(email));
            history.push('/home');
        } catch(e) {
            console.error(`Error code: ${e.code}\nError details: ${e.body}`);
            dispatch(failure(`Couldn't login user: ${email}`));
        }   
    }
}

export const logout = () => {
    authService.logout();
    history.push('/login');
    return { type: LOGOUT };
}

export const loginOAuthGoogle = () => {
    return (dispatch) => {
        function receiveMessage(event) {
            if (event.origin !== Api.url) {
                dispatch(failure(`Couldn't login via OAuth Google!`));
                return;
            }
            if(event.data) {
                localStorage.setItem('user', event.data);
                console.log(event.data);
                const data = JSON.parse(event.data);
                dispatch(success(data.user.email));
                history.push('/home');
            }
        }
        window.open(`${Api.url}/api/auth/google`, 'Google OAuth', "height=615,width=605"); 
        window.addEventListener("message", receiveMessage, false);
    }
}

export const loginOAuthFacebook = () => {
    return (dispatch) => {
        function receiveMessage(event) {
            if (event.origin !== Api.url) {
                dispatch(failure(`Couldn't login via OAuth Facebook!`));
                return;
            }
            if(event.data) {
                localStorage.setItem('user', event.data);
                const data = JSON.parse(event.data);
                dispatch(success(data.user.email));
                history.push('/home');
            }
        }
        window.open(`${Api.url}/api/auth/facebook`, 'Facebook OAuth', "height=615,width=605"); 
        window.addEventListener("message", receiveMessage, false);
    }
}