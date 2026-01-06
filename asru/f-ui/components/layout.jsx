import { Outlet } from 'react-router-dom';
import { Dashboard } from './dashboard';
import { Link } from 'react-router-dom';
import '../App.scss';
export const Layout = () => {
    return (
        <div class=" bg-gray ">
            <Dashboard />
        </div>
    );
};
