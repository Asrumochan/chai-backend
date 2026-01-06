import CryptoJS from 'crypto-js';
import { IconSymbol } from '@uhg-abyss/web/ui/IconSymbol';

const secretKey = import.meta.env.VITE_SECRET_KEY;

export const encryptQueryParams = (param) => {
    return encodeURIComponent(CryptoJS.AES.encrypt(param, secretKey).toString());
};

export const getMsIdandIsAdmin = () => {
    const userInfo = JSON.parse(sessionStorage.getItem('uInfo')) || {};
    const { msId, roles } = userInfo;
    let isAdmin = false;
    if (roles && roles.includes("InternalUserBDA-Admin-CensusX-Formatter")) {
        isAdmin = true;
    }
    return { msId, isAdmin };
};

export const getAvatar = () => {
    const name = JSON.parse(sessionStorage.getItem('uInfo'))?.name || {};
    if (name)
        return name
            .split(' ')
            .map((name) => name.slice(0, 1))
            .join('')
            .toUpperCase();
    else return <IconSymbol icon="person" />;
};
