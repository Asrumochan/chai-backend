import { NavMenuPrimitives } from '@uhg-abyss/web/ui/NavMenu';
import '.././App.scss';
import { Navbar } from './navbar';
import { Layout } from './layout';
export const Nav = () => {
    return (
        <div className="flex col">
            <Navbar />
            <Layout />
        </div>
    );
};
