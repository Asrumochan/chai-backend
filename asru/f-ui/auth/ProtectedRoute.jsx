import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteContext } from '../context/RouteContext';
import { useAuthStore } from './authStore';
import { defaultUserInfo } from '../components/const';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const { basePath, userInfoHost } = useContext(RouteContext);
    const setUserInfo = useAuthStore((state) => state.setUserInfo);

    useEffect(() => {
        if (basePath === 'census-x-formatter/') {
            setUserInfo(userInfoHost);
            sessionStorage.setItem('uInfo', JSON.stringify(userInfoHost));
        } else {
            setUserInfo(defaultUserInfo);
            sessionStorage.setItem('uInfo', JSON.stringify(defaultUserInfo));
        }
    }, [basePath, navigate, setUserInfo, userInfoHost]);

    return children;
};

export default ProtectedRoute;
